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
  const resp = await client.groups.listGroups();

  expect(resp.data.total_records).toBe(2);
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

test("client throws for other error statuses", async () => {
  server.use(
    rest.get("https://api.zoom.us/v2/groups", (_req, res, ctx) => {
      return res(ctx.status(400));
    })
  );

  await expect(client.groups.listGroups()).rejects.toThrow();
});

test("client can manually paginate", async () => {
  for (let i = 0, resp = null; i < 3; i++) {
    const pager = resp ? { next_page_token: resp.data.next_page_token } : {};
    resp = await client.groups.listGroupMembers("abc", {
      params: {
        page_size: 1, // Mock responses only contain one member.
        ...pager,
      },
    });

    expect(resp.data.members[0].email).toBe(
      i % 2 === 0 ? "jane.smith@example.org" : "john.smith@example.org"
    );
  }
});
