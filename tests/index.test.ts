import { expect, test } from "vitest";
import { main } from "@/index";

test("expect main function to return 'Hello, world!'", async () => {
  expect(await main()).toBe("Hello, world!");
});
