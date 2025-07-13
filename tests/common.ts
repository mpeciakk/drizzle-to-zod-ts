import { expect } from "vitest";
import { z } from "zod/v4";

function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, " ").replace(/\n/g, "").replace(/\t/g, "").trim();
}

export function expectNormalized(result: string, expected: string) {
  expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expected));
}

export function expectSchemaShape(expected: z.ZodObject) {
  return {
    from(actual: z.ZodObject) {
      expect(Object.keys(actual.shape)).toEqual(Object.keys(expected.shape));

      const a = z.toJSONSchema(actual, { unrepresentable: "any" });
      const b = z.toJSONSchema(expected, { unrepresentable: "any" });

      expect(a).toEqual(b);
    },
  };
}
