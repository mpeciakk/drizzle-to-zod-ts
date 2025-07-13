import z from "zod/v4";

export const LITERAL_SCHEMA_ZOD = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export const JSON_SCHEMA_ZOD = z.union([LITERAL_SCHEMA_ZOD, z.record(z.string(), z.any()), z.array(z.any())]);
export const BUFFER_SCHEMA_ZOD = z.custom<Buffer>((v) => v instanceof Buffer);
