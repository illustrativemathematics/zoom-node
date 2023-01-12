import { jest } from "@jest/globals";
import { rest } from "msw";
import { setupServer } from "msw/node";
import Zoom from "./";

const client = new Zoom({
  accountId: "xxxxx",
  clientId: "xxxxx",
  clientSecret: "xxxxx",
});

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

test("client auth before request", async () => {
  const spy = jest.spyOn(client.auth, "request");
  await client.groups.listGroups();

  expect(spy).toHaveBeenCalled();
});

test("client response contains data", async () => {
  const data = await client.groups.listGroups();

  expect(data.total_records).toBe(2);
});

test("client auth once for authorized", async () => {
  const spy = jest.spyOn(client.auth, "request");
  // List groups twice.
  await client.groups.listGroups(); // Call auth with authorized response.
  await client.groups.listGroups(); // Do not call auth.

  expect(spy).toHaveBeenCalledTimes(1);
});

test("client auth retry after unauthorized", async () => {
  let reqId = 0;
  server.use(
    rest.get("https://api.zoom.us/v2/groups", (_req, res, ctx) => {
      const status = reqId < 1 ? 401 : 200;
      reqId++;

      return res(ctx.status(status));
    })
  );

  const spy = jest.spyOn(client.auth, "request");
  // List groups four times.
  await client.groups.listGroups(); // Call auth with unauthorized response.
  await client.groups.listGroups(); // Call auth with authorized response.
  await client.groups.listGroups(); // Do not call auth.
  await client.groups.listGroups(); // Do not call auth.

  expect(spy).toHaveBeenCalledTimes(2);
});

test("client auth retries only once", async () => {
  server.use(
    rest.get("https://api.zoom.us/v2/groups", (_req, res, ctx) => {
      return res(ctx.status(401));
    })
  );

  // Consecutive unauthorized response throws.
  await expect(client.groups.listGroups()).rejects.toThrow();
});

test("client throws for other error statuses", async () => {
  server.use(
    rest.get("https://api.zoom.us/v2/groups", (_req, res, ctx) => {
      return res(ctx.status(400));
    })
  );

  await expect(client.groups.listGroups()).rejects.toThrow();
});

test("client paginates manually", async () => {
  let emails = [];
  for (let i = 0, page = null; i < 3; i++) {
    // Use the previous response value, if available, to page.
    const pager = page ? { next_page_token: page.next_page_token } : {};
    page = await client.groups.listGroupMembers("abc", {
      params: {
        page_size: 1, // Mock responses only contain one member.
        ...pager,
      },
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
  let emails = [];
  for await (const member of client.groups.listGroupMembers("abc", {
    params: {
      page_size: 1, // Mock responses only contain one member.
    },
  })) {
    emails.push(member.email);
  }

  expect(emails).toEqual(["jane.smith@example.org", "john.smith@example.org"]);
});

test("client paginates pages with `for await...of` statement", async () => {
  let emails = [];
  for await (const page of client.groups
    .listGroupMembers("abc", {
      params: {
        page_size: 1, // Mock responses only contain one member.
      },
    })
    .pages()) {
    emails = emails.concat(page.members.map((member) => member.email));
  }

  expect(emails).toEqual(["jane.smith@example.org", "john.smith@example.org"]);
});

test("client paginates with `nextPage` helper", async () => {
  let emails = [];
  const pager = client.groups.listGroupMembers("abc", {
    params: {
      page_size: 1, // Mock responses only contain one member.
    },
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
