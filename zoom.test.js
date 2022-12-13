import Zoom from "./";

test("silly instance test", () => {
  const client = new Zoom({
    accountId: "xxxxx",
    clientId: "xxxxx",
    clientSecret: "xxxxx",
  });
  expect(client).toBeInstanceOf(Zoom);
});

test("1 and 1 is 2", () => {
  expect(1 + 1).toBe(2);
});
