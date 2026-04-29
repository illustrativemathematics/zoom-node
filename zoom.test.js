import { Buffer } from "node:buffer";
import { jest } from "@jest/globals";
import { rest } from "msw";
import { setupServer } from "msw/node";
import Zoom from "./";

const server = setupServer(
  rest.post("https://zoom.us/oauth/token", (_req, res, ctx) => {
    return res(
      ctx.json({
        access_token: "xxxxx",
        token_type: "bearer",
        expire_in: 3600,
        scope: ["admin"],
      })
    );
  }),
  rest.get("https://api.zoom.us/v2/groups", (_req, res, ctx) => {
    return res(
      ctx.json({
        groups: [
          { id: "abc", name: "Group 1", total_members: 17 },
          { id: "def", name: "Group 2", total_members: 4 },
        ],
        total_records: 2,
      })
    );
  }),
  rest.get("https://api.zoom.us/v2/groups/abc/members", (req, res, ctx) => {
    const nextPageToken = req.url.searchParams.get("next_page_token");
    const data = !nextPageToken
      ? {
          page_count: 2,
          page_number: 1,
          next_page_token: "ghi",
          page_size: 1,
          total_records: 2,
          members: [
            {
              email: "jane.smith@example.org",
              first_name: "Jane",
              id: "jkl",
              last_name: "Smith",
              type: 1,
            },
          ],
        }
      : {
          next_page_token: "",
          page_size: 1,
          total_records: 2,
          members: [
            {
              email: "john.smith@example.org",
              first_name: "John",
              id: "mno",
              last_name: "Smith",
              type: 1,
            },
          ],
        };

    return res(ctx.json(data));
  })
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const makeClient = () => {
  return new Zoom({
    accountId: "xxxxx",
    clientId: "xxxxx",
    clientSecret: "xxxxx",
  });
};

test("client auth before request", async () => {
  const client = makeClient();
  const spy = jest.spyOn(client.auth, "request");
  await client.groups.listGroups();

  expect(spy).toHaveBeenCalled();
});

test("client response contains data", async () => {
  const client = makeClient();
  const data = await client.groups.listGroups();

  expect(data.total_records).toBe(2);
});

test("client auth once for authorized", async () => {
  const client = makeClient();
  const spy = jest.spyOn(client.auth, "request");
  // List groups twice.
  await client.groups.listGroups(); // Call auth with authorized response.
  await client.groups.listGroups(); // Do not call auth.

  expect(spy).toHaveBeenCalledTimes(1);
});

test("client auth retry after unauthorized", async () => {
  // Simulate the seed auth token being stale on the first API request.
  server.use(
    rest.get("https://api.zoom.us/v2/groups", (_req, res, ctx) => {
      return res.once(ctx.status(401));
    })
  );

  const client = makeClient();
  const spy = jest.spyOn(client.auth, "request");
  // List groups three times.
  await client.groups.listGroups(); // Call auth with unauthorized response.
  await client.groups.listGroups(); // Do not call auth.
  await client.groups.listGroups(); // Do not call auth.

  expect(spy).toHaveBeenCalledTimes(2);
});

test("client api retry after unauthorized", async () => {
  // Simulate the seed auth token being stale on the first API request.
  server.use(
    rest.get("https://api.zoom.us/v2/groups", (_req, res, ctx) => {
      return res.once(ctx.status(401));
    })
  );

  const client = makeClient();
  const spy = jest.spyOn(client.api, "request");
  await client.groups.listGroups(); // Call auth with unauthorized response.

  expect(spy).toHaveBeenCalledTimes(2);
});

test("client auth retry only once", async () => {
  server.use(
    rest.get("https://api.zoom.us/v2/groups", (_req, res, ctx) => {
      return res(ctx.status(401));
    })
  );

  const client = makeClient();

  // Consecutive unauthorized response throws.
  await expect(client.groups.listGroups()).rejects.toThrow();
});

test("client throws for other error statuses", async () => {
  server.use(
    rest.get("https://api.zoom.us/v2/groups", (_req, res, ctx) => {
      return res(ctx.status(400));
    })
  );

  const client = makeClient();

  await expect(client.groups.listGroups()).rejects.toThrow();
});

test("client throws for auth token errors", async () => {
  server.use(
    rest.post("https://zoom.us/oauth/token", (_req, res, ctx) => {
      return res.once(ctx.status(500));
    })
  );

  const client = makeClient();

  await expect(client.groups.listGroups()).rejects.toThrow();
});

test("client paginates manually", async () => {
  const client = makeClient();
  let emails = [];
  for (let i = 0, page = null; i < 3; i++) {
    // Use the previous response value, if available, to page.
    const pager = page ? { next_page_token: page.next_page_token } : {};
    page = await client.groups.listGroupMembers("abc", {
      page_size: 1, // Mock responses only contain one member.
      ...pager,
    });

    emails.push(page.members[0].email);
  }

  // The Zoom API responds with the first page if `next_page_token` is not
  // set or an empty string. The `next_page_token` is an empty string for
  // the last page.
  expect(emails).toEqual([
    "jane.smith@example.org",
    "john.smith@example.org",
    "jane.smith@example.org",
  ]);
});

test("client paginates with `for await...of` statement", async () => {
  const client = makeClient();
  let emails = [];
  for await (const member of client.groups.listGroupMembers("abc", {
    page_size: 1, // Mock responses only contain one member.
  })) {
    emails.push(member.email);
  }

  expect(emails).toEqual(["jane.smith@example.org", "john.smith@example.org"]);
});

test("client paginates pages with `for await...of` statement", async () => {
  const client = makeClient();
  let emails = [];
  for await (const page of client.groups
    .listGroupMembers("abc", {
      page_size: 1, // Mock responses only contain one member.
    })
    .pages()) {
    emails = emails.concat(page.members.map((member) => member.email));
  }

  expect(emails).toEqual(["jane.smith@example.org", "john.smith@example.org"]);
});

test("client paginates with `nextPage` helper", async () => {
  const client = makeClient();
  let emails = [];
  const pager = client.groups.listGroupMembers("abc", {
    page_size: 1, // Mock responses only contain one member.
  });
  while (true) {
    const page = await pager.nextPage();
    if (!page) {
      break;
    }

    emails = emails.concat(page.members.map((member) => member.email));
  }

  expect(emails).toEqual(["jane.smith@example.org", "john.smith@example.org"]);
});

test("dashboards.listMeetings sends GET /metrics/meetings with params", async () => {
  let captured;
  server.use(
    rest.get("https://api.zoom.us/v2/metrics/meetings", (req, res, ctx) => {
      captured = {
        method: req.method,
        params: Object.fromEntries(req.url.searchParams),
      };
      return res(ctx.json({ meetings: [{ id: 1 }], total_records: 1 }));
    })
  );
  const client = makeClient();
  const data = await client.dashboards.listMeetings({ type: "past" });
  expect(captured.method).toBe("GET");
  expect(captured.params).toEqual({ type: "past" });
  expect(data.meetings[0].id).toBe(1);
});

test("dashboards.listMeetingParticipants sends GET /metrics/meetings/{id}/participants", async () => {
  let captured;
  server.use(
    rest.get(
      "https://api.zoom.us/v2/metrics/meetings/MTG123/participants",
      (req, res, ctx) => {
        captured = { method: req.method, pathname: req.url.pathname };
        return res(ctx.json({ participants: [{ id: "p1" }] }));
      }
    )
  );
  const client = makeClient();
  const data = await client.dashboards.listMeetingParticipants("MTG123", {
    type: "past",
  });
  expect(captured.method).toBe("GET");
  expect(captured.pathname).toBe("/v2/metrics/meetings/MTG123/participants");
  expect(data.participants[0].id).toBe("p1");
});

test("dashboards.getMeetingDetails sends GET /metrics/meetings/{id}", async () => {
  server.use(
    rest.get(
      "https://api.zoom.us/v2/metrics/meetings/MTG123",
      (_req, res, ctx) => {
        return res(ctx.json({ id: "MTG123", topic: "Test" }));
      }
    )
  );
  const client = makeClient();
  const data = await client.dashboards.getMeetingDetails("MTG123");
  expect(data.id).toBe("MTG123");
});

test("groups.getAGroup sends GET /groups/{id}", async () => {
  server.use(
    rest.get("https://api.zoom.us/v2/groups/abc", (_req, res, ctx) => {
      return res(ctx.json({ id: "abc", name: "Group 1" }));
    })
  );
  const client = makeClient();
  const data = await client.groups.getAGroup("abc");
  expect(data.id).toBe("abc");
});

test("meetings.listMeetings sends GET /users/{userId}/meetings", async () => {
  let captured;
  server.use(
    rest.get("https://api.zoom.us/v2/users/me/meetings", (req, res, ctx) => {
      captured = { params: Object.fromEntries(req.url.searchParams) };
      return res(ctx.json({ meetings: [{ id: 1 }] }));
    })
  );
  const client = makeClient();
  const data = await client.meetings.listMeetings("me", { type: "scheduled" });
  expect(captured.params).toEqual({ type: "scheduled" });
  expect(data.meetings[0].id).toBe(1);
});

test("meetings.getAMeeting sends GET /meetings/{id}", async () => {
  server.use(
    rest.get("https://api.zoom.us/v2/meetings/12345", (_req, res, ctx) => {
      return res(ctx.json({ id: 12345, topic: "Test" }));
    })
  );
  const client = makeClient();
  const data = await client.meetings.getAMeeting(12345);
  expect(data.id).toBe(12345);
});

test("meetings.getPastMeetingParticipants sends GET /past_meetings/{id}/participants", async () => {
  server.use(
    rest.get(
      "https://api.zoom.us/v2/past_meetings/MTG123/participants",
      (_req, res, ctx) => res(ctx.json({ participants: [{ id: "p1" }] }))
    )
  );
  const client = makeClient();
  const data = await client.meetings.getPastMeetingParticipants("MTG123");
  expect(data.participants[0].id).toBe("p1");
});

test("meetings.getMeetingInvitation sends GET /meetings/{id}/invitation", async () => {
  server.use(
    rest.get(
      "https://api.zoom.us/v2/meetings/12345/invitation",
      (_req, res, ctx) => {
        return res(ctx.json({ invitation: "Join Zoom Meeting..." }));
      }
    )
  );
  const client = makeClient();
  const data = await client.meetings.getMeetingInvitation(12345);
  expect(data.invitation).toContain("Join Zoom Meeting");
});

test("meetings.createAMeeting sends POST /users/{userId}/meetings with JSON body", async () => {
  let captured;
  server.use(
    rest.post("https://api.zoom.us/v2/users/me/meetings", (req, res, ctx) => {
      captured = { method: req.method, body: req.body };
      return res(ctx.json({ id: 12345, topic: "Test" }));
    })
  );
  const client = makeClient();
  const data = await client.meetings.createAMeeting("me", {
    topic: "Test",
    type: 2,
  });
  expect(captured.method).toBe("POST");
  expect(captured.body).toEqual({ topic: "Test", type: 2 });
  expect(data.id).toBe(12345);
});

test("meetings.deleteAMeeting sends DELETE /meetings/{id} with params", async () => {
  let captured;
  server.use(
    rest.delete("https://api.zoom.us/v2/meetings/12345", (req, res, ctx) => {
      captured = {
        method: req.method,
        params: Object.fromEntries(req.url.searchParams),
      };
      return res(ctx.status(204));
    })
  );
  const client = makeClient();
  await client.meetings.deleteAMeeting(12345, { schedule_for_reminder: true });
  expect(captured.method).toBe("DELETE");
  expect(captured.params).toEqual({ schedule_for_reminder: "true" });
});

test("reports.getMeetingParticipantReports sends GET /report/meetings/{id}/participants", async () => {
  let captured;
  server.use(
    rest.get(
      "https://api.zoom.us/v2/report/meetings/MTG123/participants",
      (req, res, ctx) => {
        captured = { params: Object.fromEntries(req.url.searchParams) };
        return res(ctx.json({ participants: [{ id: "p1" }] }));
      }
    )
  );
  const client = makeClient();
  const data = await client.reports.getMeetingParticipantReports("MTG123", {
    page_size: 30,
  });
  expect(captured.params).toEqual({ page_size: "30" });
  expect(data.participants[0].id).toBe("p1");
});

test("auth request sends Basic credentials and account_credentials grant", async () => {
  let captured;
  server.use(
    rest.post("https://zoom.us/oauth/token", (req, res, ctx) => {
      captured = {
        authorization: req.headers.get("authorization"),
        params: Object.fromEntries(req.url.searchParams),
      };
      return res(ctx.json({ access_token: "tok", token_type: "bearer" }));
    })
  );
  const client = new Zoom({
    accountId: "acct1",
    clientId: "id1",
    clientSecret: "secret1",
  });
  await client.groups.listGroups();
  expect(captured.authorization).toMatch(/^Basic /);
  const decoded = Buffer.from(captured.authorization.slice(6), "base64").toString();
  expect(decoded).toBe("id1:secret1");
  expect(captured.params).toEqual({
    grant_type: "account_credentials",
    account_id: "acct1",
  });
});

test("api request carries bearer access token", async () => {
  let capturedAuth;
  server.use(
    rest.get("https://api.zoom.us/v2/groups", (req, res, ctx) => {
      capturedAuth = req.headers.get("authorization");
      return res(ctx.json({ groups: [], total_records: 0 }));
    })
  );
  const client = makeClient();
  await client.groups.listGroups();
  // Default mock token from the global setupServer is "xxxxx".
  expect(capturedAuth).toBe("Bearer xxxxx");
});

test("constructor uses overridden baseURL", async () => {
  let hit = false;
  server.use(
    rest.get("https://api.example.test/v3/groups", (_req, res, ctx) => {
      hit = true;
      return res(ctx.json({ groups: [], total_records: 0 }));
    })
  );
  const client = new Zoom({
    accountId: "x",
    clientId: "x",
    clientSecret: "x",
    baseURL: "https://api.example.test/v3",
  });
  await client.groups.listGroups();
  expect(hit).toBe(true);
});

test("constructor uses overridden baseAuthURL", async () => {
  let hit = false;
  server.use(
    rest.post("https://auth.example.test/oauth/token", (_req, res, ctx) => {
      hit = true;
      return res(ctx.json({ access_token: "tok" }));
    }),
    rest.get("https://api.zoom.us/v2/groups", (_req, res, ctx) =>
      res(ctx.json({ groups: [], total_records: 0 }))
    )
  );
  const client = new Zoom({
    accountId: "x",
    clientId: "x",
    clientSecret: "x",
    baseAuthURL: "https://auth.example.test",
  });
  await client.groups.listGroups();
  expect(hit).toBe(true);
});

test("constructor applies timeout to axios instances", () => {
  const client = new Zoom({
    accountId: "x",
    clientId: "x",
    clientSecret: "x",
    timeout: 5000,
  });
  expect(client.api.defaults.timeout).toBe(5000);
  expect(client.auth.defaults.timeout).toBe(5000);
});

test("pagination forwards next_page_token and preserves caller params", async () => {
  const calls = [];
  server.use(
    rest.get("https://api.zoom.us/v2/groups/abc/members", (req, res, ctx) => {
      calls.push(Object.fromEntries(req.url.searchParams));
      const token = req.url.searchParams.get("next_page_token");
      return res(
        ctx.json(
          token
            ? { next_page_token: "", members: [{ email: "b@example.org" }] }
            : { next_page_token: "ghi", members: [{ email: "a@example.org" }] }
        )
      );
    })
  );
  const client = makeClient();
  const emails = [];
  for await (const m of client.groups.listGroupMembers("abc", { page_size: 1 })) {
    emails.push(m.email);
  }
  expect(emails).toEqual(["a@example.org", "b@example.org"]);
  expect(calls[0]).toEqual({ page_size: "1" });
  expect(calls[1]).toEqual({ page_size: "1", next_page_token: "ghi" });
});

test("pagination terminates when next_page_token field is absent", async () => {
  server.use(
    rest.get("https://api.zoom.us/v2/groups/abc/members", (_req, res, ctx) =>
      res(ctx.json({ members: [{ email: "only@example.org" }] }))
    )
  );
  const client = makeClient();
  const emails = [];
  for await (const m of client.groups.listGroupMembers("abc")) {
    emails.push(m.email);
  }
  expect(emails).toEqual(["only@example.org"]);
});

test("withPagination supports a custom token name", async () => {
  server.use(
    rest.get("https://api.zoom.us/v2/custom", (req, res, ctx) => {
      const token = req.url.searchParams.get("custom_token");
      return res(
        ctx.json(
          token === "next"
            ? { items: [{ id: 2 }] }
            : { items: [{ id: 1 }], custom_token: "next" }
        )
      );
    })
  );
  const client = makeClient();
  const ids = [];
  for await (const item of client.withPagination(
    client.withTokenRefreshAttempt,
    { method: "GET", url: "/custom" },
    "items",
    "custom_token"
  )) {
    ids.push(item.id);
  }
  expect(ids).toEqual([1, 2]);
});
