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
