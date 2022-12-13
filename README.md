# Zoom Node.js Library

The Zoom Node.js library provides convenient access to Zoom's REST API.
This client library assumes usage of the [Server-to-Server OAuth](https://marketplace.zoom.us/docs/guides/build/server-to-server-oauth-app/)
authentication flow.

**Note:** This library is a work-in-progress and does not exhaustively
cover the Zoom REST API. Additionally, it's only been used in
production with Node.js version 16.15.1.

## Documentation

This library is based on the [Zoom Meeting API 2.0.0](https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#overview)
REST API. More details can be found [there](https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#overview).

## Installation

Install via npm:

```shell
npm install @illustrative-mathematics/zoom-node
```

### Requirements

This library uses [ES6 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
and has only been tested with Node.js version 16.15.1. Be sure to set the
`type` property in `package.json` to `"module"` to use this module:

```diff
 {
   "name": "my-zoom-app",
+  "type": "module",
   "version": "1.0.0",
   "description": "",
   "main": "index.js",
```

## Usage

Initialize client:

```js
import Zoom from "@illustrative-mathematics/zoom-node";

// Provide your unique values here.
const client = new Zoom({
  accountId: "xxxxx",
  clientId: "xxxxx",
  clientSecret: "xxxxx",
});
```

This library attempts to mirror the namespacing used in the Zoom API
documentation. For example, [Meetings](https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#tag/Meetings)
is a separate section, so this library nests methods under `meetings` in
the client instance. To fetch a specific meeting:

```js
const meetingId = 12345;
// Use `client` instance from initialization above.
const response = await client.meetings.getAMeeting(meetingId);
console.log(response.data);
```

This library uses the [Axios HTTP Client](https://axios-http.com/). The
response schema is the default [Axios Response Schema](https://axios-http.com/docs/res_schema).

Endpoints with list/collection responses behave similarly. To fetch a list
of participants using [Dashboards](https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#tag/Dashboards):

```js
const meetingId = 12345;
// Use `client` instance from initialization above.
const response = await client.dashboards.listMeetingParticipants(meetingId, {
  params: {
    type: "past",
  },
});
console.log(response.data.participants);
```

The above example demonstrates passing query string arguments.

### Pagination

This library offers a couple ways to paginate endpoints with
list/collection responses. To manually paginate Dashboards
participants:

```js
const meetingId = 12345;
// Use `client` instance from initialization above.
const firstPage = await client.dashboards.listMeetingParticipants(meetingId, {
  params: {
    type: "past",
  },
});
console.log(firstPage.data.participants);

const nextPage = await client.dashboards.listMeetingParticipants(meetingId, {
  params: {
    type: "past",
    // Use `firstPage` token provided by Zoom to fetch next page.
    next_page_token: firstPage.data.next_page_token,
  },
});
console.log(nextPage.data.participants);
```

List/collection items can also be paginated without manually refetching
the endpoint using the [`for await...of` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of):

```js
const meetingId = 12345;
// Use `client` instance from initialization above.
for await (const participant of client.dashboards.listMeetingParticipants(
  meetingId,
  {
    params: {
      type: "past",
    },
  }
)) {
  // Note that this is an individual item in the list/collection response.
  console.log(participant);
}
```

Similarly, this can also be done for individual pages:

```js
const meetingId = 12345;
// Use `client` instance from initialization above.
for await (const page of client.dashboards
  .listMeetingParticipants(meetingId, {
    params: {
      type: "past",
    },
  })
  .pages()) {
  // <-- Note the `.pages` call here.
  // Note that this is a page of items.
  console.log(page.data.participants);
}
```

There is also a `nextPage` helper:

```js
const meetingId = 12345;
// Use `client` instance from initialization above.
const response = await client.dashboards.listMeetingParticipants(meetingId, {
  params: {
    type: "past",
  },
});
console.log(response.data.participants);

while (true) {
  const nextPage = await response.nextPage();
  if (!nextPage) {
    break;
  }

  console.log(nextPage.data.participants);
}
```

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
