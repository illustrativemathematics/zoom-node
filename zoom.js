import { Buffer } from "node:buffer";
import axios from "axios";

class Dashboards {
  constructor(client) {
    this.client = client;
  }

  listMeetings({ params = {} } = {}) {
    return this.client.withPagination(
      this.client.withTokenRefreshAttempt,
      {
        method: "GET",
        url: "/metrics/meetings",
        params,
      },
      "meetings"
    );
  }

  listMeetingParticipants(meetingId, { params = {} } = {}) {
    return this.client.withPagination(
      this.client.withTokenRefreshAttempt,
      {
        method: "GET",
        url: `/metrics/meetings/${meetingId}/participants`,
        params,
      },
      "participants"
    );
  }

  getMeetingDetails(meetingId, { params = {} } = {}) {
    return this.client.withTokenRefreshAttempt({
      method: "GET",
      url: `/metrics/meetings/${meetingId}`,
      params,
    });
  }
}

class Groups {
  constructor(client) {
    this.client = client;
  }

  listGroups() {
    return this.client.withTokenRefreshAttempt({
      method: "GET",
      url: "/groups",
    });
  }

  getAGroup(groupId) {
    return this.client.withTokenRefreshAttempt({
      method: "GET",
      url: `/groups/${groupId}`,
    });
  }

  listGroupMembers(groupId, { params = {} } = {}) {
    return this.client.withPagination(
      this.client.withTokenRefreshAttempt,
      {
        method: "GET",
        url: `/groups/${groupId}/members`,
        params,
      },
      "members"
    );
  }
}

class Meetings {
  constructor(client) {
    this.client = client;
  }

  listMeetings(userId, { params = {} } = {}) {
    return this.client.withPagination(
      this.client.withTokenRefreshAttempt,
      {
        method: "GET",
        url: `/users/${userId}/meetings`,
        params,
      },
      "meetings"
    );
  }

  getAMeeting(meetingId, { params = {} } = {}) {
    return this.client.withTokenRefreshAttempt({
      method: "GET",
      url: `/meetings/${meetingId}`,
      params,
    });
  }

  getPastMeetingParticipants(meetingId, { params = {} } = {}) {
    return this.client.withPagination(
      this.client.withTokenRefreshAttempt,
      {
        method: "GET",
        url: `/past_meetings/${meetingId}/participants`,
        params,
      },
      "participants"
    );
  }
}

class Reports {
  constructor(client) {
    this.client = client;
  }

  getMeetingParticipantReports(meetingId, { params = {} } = {}) {
    return this.client.withPagination(
      this.client.withTokenRefreshAttempt,
      {
        method: "GET",
        url: `/report/meetings/${meetingId}/participants`,
        params,
      },
      "participants"
    );
  }
}

export default class Zoom {
  constructor({
    accountId,
    clientId,
    clientSecret,
    baseURL = "https://api.zoom.us/v2",
    baseAuthURL = "https://zoom.us",
    timeout = 0,
  }) {
    // Set up auth client used to obtain access tokens.
    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    this.auth = axios.create({
      baseURL: baseAuthURL,
      params: {
        grant_type: "account_credentials",
        account_id: accountId,
      },
      headers: {
        Authorization: `Basic ${creds}`,
      },
      timeout,
    });

    // Set up API client.
    this.api = axios.create({
      baseURL,
      timeout,
    });

    // Set access token function that uses a cached response for subsequent
    // valid calls.
    this.setTokenFunc();
    // Make sure we set access token for all API requests.
    this.api.interceptors.request.use(async (conf) => {
      const resp = await this.token();
      conf.headers["Authorization"] = `Bearer ${resp.data.access_token}`;
      return conf;
    });

    // Set up resources.
    this.dashboards = new Dashboards(this);
    this.groups = new Groups(this);
    this.meetings = new Meetings(this);
    this.reports = new Reports(this);
  }

  setTokenFunc() {
    this.token = (() => {
      let resp = null;
      return async () => {
        if (!resp) {
          resp = await this.auth.request({
            method: "POST",
            url: "/oauth/token",
          });
        }

        return resp;
      };
    })();
  }

  // We want to write this method like this so `this` is still bound to
  // its context, even if the method is passed as an argument. E.g., see
  // `groupMembers` above.
  withTokenRefreshAttempt = (conf) => {
    try {
      return this.api.request(conf);
    } catch (err) {
      if (err.response.status === 401) {
        // Try once to reset token function so that a fresh request will
        // be made (and cached) for a new access token.
        //
        // @see https://marketplace.zoom.us/docs/guides/build/server-to-server-oauth-app/
        this.setTokenFunc();
        // Retry original API request.
        return this.api.request(conf);
      }

      throw err;
    }
  };

  withPagination(reqFunc, conf, itemsName, tokenName = "next_page_token") {
    const firstPage = reqFunc(conf);
    // This `Object.assign` augments the original request Promise returned
    // from the call to `reqFunc` to be an async iterator. The iterator
    // allows for methods using the `withPagination` method to do simple
    // pagination via something like:
    // ```js
    // for await (const member of zoom.groupMembers("xxx")) {
    //   console.log(member);
    // }
    // ```
    //
    // At the same time single page/non-paginated calls can still be made:
    // ```js
    // const firstPage = await zoom.groupMembers("xxx");
    // console.log(firstPage.data.members);
    // ```
    return Object.assign(firstPage, {
      async *[Symbol.asyncIterator]() {
        for await (const page of this.pages()) {
          for (const item of page.data[itemsName]) {
            yield item;
          }
        }
      },

      // This helper allows for the `for await` syntax as well, but pages
      // on the page level, e.g.,
      // ```js
      // for await (const page of zoom.groupMembers("xxx").pages()) {
      //   console.log(page.data.members);
      // }
      // ```
      async *pages() {
        let page = await firstPage;
        while (true) {
          yield page;

          page = await this._nextPage(page);
          if (!page) {
            return;
          }
        }
      },

      // Helper method to manually iterate through pages.
      nextPage: (() => {
        let page = null;
        let firstPageAwaited = false;
        return async () => {
          if (!firstPageAwaited) {
            page = await firstPage;
            firstPageAwaited = true;
            return page;
          }

          page = await this._nextPage(page);
          return page;
        };
      })(),

      async _nextPage(page) {
        if (!page || !page.data[tokenName]) {
          return null;
        }

        return await reqFunc({
          ...conf,
          params: {
            ...(conf.params || {}),
            [tokenName]: page.data[tokenName],
          },
        });
      },
    });
  }
}
