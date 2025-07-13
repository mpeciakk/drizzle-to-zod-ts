export const LITERAL_SCHEMA_STRING = "z.union([z.string(), z.number(), z.boolean(), z.null()])";
export const JSON_SCHEMA_STRING = `z.union([
	${LITERAL_SCHEMA_STRING},
	z.record(z.string(), z.any()),
	z.array(z.any()),
])`;
export const BUFFER_SCHEMA_STRING = "z.custom<Buffer>((v) => v instanceof Buffer)";
