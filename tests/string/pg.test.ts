/* based on https://github.com/drizzle-team/drizzle-orm/tree/main/drizzle-zod/tests */
import { sql } from "drizzle-orm";
import { customType, integer, pgMaterializedView, pgSchema, pgTable, pgView, serial, text } from "drizzle-orm/pg-core";
import { test } from "vitest";
import { CONSTANTS } from "@/constants";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "@/index";
import { JSON_SCHEMA_STRING } from "@/string/constants";
import { StringSchemaFactory } from "@/string/string-schema-factory";
import { expectNormalized } from "../common";

const integerSchema = `z.number().gte(${CONSTANTS.INT32_MIN}).lte(${CONSTANTS.INT32_MAX})`;
const textSchema = "z.string()";

const stringSchemaFactory = new StringSchemaFactory();

test("table - select", () => {
  const table = pgTable("test", {
    id: integer().primaryKey(),
    generated: integer().generatedAlwaysAsIdentity(),
    name: text().notNull(),
  });

  const result = createSelectSchema(table, stringSchemaFactory);
  const expected = `z.object({ id: ${integerSchema}, generated: ${integerSchema}, name: ${textSchema} })`;
  expectNormalized(result, expected);
});

test("table in schema - select", () => {
  const schema = pgSchema("test");
  const table = schema.table("test", {
    id: serial().primaryKey(),
    name: text().notNull(),
  });

  const result = createSelectSchema(table, stringSchemaFactory);
  const expected = `z.object({ id: ${integerSchema}, name: ${textSchema} })`;
  expectNormalized(result, expected);
});

test("table - insert", () => {
  const table = pgTable("test", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    name: text().notNull(),
    age: integer(),
  });

  const result = createInsertSchema(table, stringSchemaFactory);
  const expected = `z.object({ name: ${textSchema}, age: ${integerSchema}.nullable().optional() })`;
  expectNormalized(result, expected);
});

test("table - update", () => {
  const table = pgTable("test", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    name: text().notNull(),
    age: integer(),
  });

  const result = createUpdateSchema(table, stringSchemaFactory);
  const expected = `z.object({ name: ${textSchema}.optional(), age: ${integerSchema}.nullable().optional() })`;
  expectNormalized(result, expected);
});

test("view qb - select", () => {
  const table = pgTable("test", {
    id: serial().primaryKey(),
    name: text().notNull(),
  });
  const view = pgView("test").as((qb) => qb.select({ id: table.id, age: sql``.as("age") }).from(table));

  const result = createSelectSchema(view, stringSchemaFactory);
  const expected = `z.object({ id: ${integerSchema}, age: z.any() })`;
  expectNormalized(result, expected);
});

test("view columns - select", () => {
  const view = pgView("test", {
    id: serial().primaryKey(),
    name: text().notNull(),
  }).as(sql``);

  const result = createSelectSchema(view, stringSchemaFactory);
  const expected = `z.object({ id: ${integerSchema}, name: ${textSchema} })`;
  expectNormalized(result, expected);
});

test("materialized view qb - select", () => {
  const table = pgTable("test", {
    id: serial().primaryKey(),
    name: text().notNull(),
  });
  const view = pgMaterializedView("test").as((qb) => qb.select({ id: table.id, age: sql``.as("age") }).from(table));

  const result = createSelectSchema(view, stringSchemaFactory);
  const expected = `z.object({ id: ${integerSchema}, age: z.any() })`;
  expectNormalized(result, expected);
});

test("materialized view columns - select", () => {
  const view = pgView("test", {
    id: serial().primaryKey(),
    name: text().notNull(),
  }).as(sql``);

  const result = createSelectSchema(view, stringSchemaFactory);
  const expected = `z.object({ id: ${integerSchema}, name: ${textSchema} })`;
  expectNormalized(result, expected);
});

test("view with nested fields - select", () => {
  const table = pgTable("test", {
    id: serial().primaryKey(),
    name: text().notNull(),
  });
  const view = pgMaterializedView("test").as((qb) =>
    qb
      .select({
        id: table.id,
        nested: {
          name: table.name,
          age: sql``.as("age"),
        },
        table,
      })
      .from(table),
  );

  const result = createSelectSchema(view, stringSchemaFactory);
  const expected = `z.object({
		id: ${integerSchema},
		nested: z.object({ name: ${textSchema}, age: z.any() }),
    table: z.object({ id: ${integerSchema}, name: ${textSchema} })
  })`;
  expectNormalized(result, expected);
});

// test("enum - select", () => {
//   const enumType = pgEnum("test", ["a", "b", "c"]) as unknown as PgEnum<[string, ...string[]]>;

//   const result = createSelectSchema(enumType, stringSchemaFactory);
//   const expected = `z.enum(["a", "b", "c"])`;
//   expectNormalized(result, expected);
// });

test("nullability - select", () => {
  const table = pgTable("test", {
    c1: integer(),
    c2: integer().notNull(),
    c3: integer().default(1),
    c4: integer().notNull().default(1),
  });

  const result = createSelectSchema(table, stringSchemaFactory);
  const expected = `z.object({
		c1: ${integerSchema}.nullable(),
		c2: ${integerSchema},
		c3: ${integerSchema}.nullable(),
		c4: ${integerSchema}
  })`;
  expectNormalized(result, expected);
});

test("nullability - insert", () => {
  const table = pgTable("test", {
    c1: integer(),
    c2: integer().notNull(),
    c3: integer().default(1),
    c4: integer().notNull().default(1),
    c5: integer().generatedAlwaysAs(1),
    c6: integer().generatedAlwaysAsIdentity(),
    c7: integer().generatedByDefaultAsIdentity(),
  });

  const result = createInsertSchema(table, stringSchemaFactory);
  const expected = `z.object({
		c1: ${integerSchema}.nullable().optional(),
		c2: ${integerSchema},
		c3: ${integerSchema}.nullable().optional().default(1),
		c4: ${integerSchema}.optional().default(1),
		c7: ${integerSchema}.optional()
  })`;
  expectNormalized(result, expected);
});

test("nullability - update", () => {
  const table = pgTable("test", {
    c1: integer(),
    c2: integer().notNull(),
    c3: integer().default(1),
    c4: integer().notNull().default(1),
    c5: integer().generatedAlwaysAs(1),
    c6: integer().generatedAlwaysAsIdentity(),
    c7: integer().generatedByDefaultAsIdentity(),
  });

  const result = createUpdateSchema(table, stringSchemaFactory);
  const expected = `z.object({
    c1: ${integerSchema}.nullable().optional(),
    c2: ${integerSchema}.optional(),
    c3: ${integerSchema}.nullable().optional(),
    c4: ${integerSchema}.optional(),
    c7: ${integerSchema}.optional()
  })`;
  expectNormalized(result, expected);
});

test("refine table - select", () => {
  const table = pgTable("test", {
    c1: integer(),
    c2: integer().notNull(),
    c3: integer().notNull(),
  });

  const result = createSelectSchema(table, stringSchemaFactory, {
    c2: (schema: string) => `${schema}.lte(1000)`,
    c3: "z.string().transform(Number)",
  });
  const expected = `z.object({
		c1: ${integerSchema}.nullable(),
		c2: ${integerSchema}.lte(1000),
		c3: z.string().transform(Number)
  })`;
  expectNormalized(result, expected);
});

test("refine table - select with custom data type", () => {
  const customText = customType({ dataType: () => "text" });
  const table = pgTable("test", {
    c1: integer(),
    c2: integer().notNull(),
    c3: integer().notNull(),
    c4: customText(),
  });

  const customTextSchema = "z.string().min(1).max(100)";
  const result = createSelectSchema(table, stringSchemaFactory, {
    c2: (schema: string) => `${schema}.lte(1000)`,
    c3: () => "z.string().transform(Number)",
    c4: customTextSchema,
  });
  const expected = `z.object({
		c1: ${integerSchema}.nullable(),
		c2: ${integerSchema}.lte(1000),
		c3: z.string().transform(Number),
		c4: ${customTextSchema}.nullable()
  })`;
  expectNormalized(result, expected);
});

test("refine table - insert", () => {
  const table = pgTable("test", {
    c1: integer(),
    c2: integer().notNull(),
    c3: integer().notNull(),
    c4: integer().generatedAlwaysAs(1),
  });

  const result = createInsertSchema(table, stringSchemaFactory, {
    c2: (schema: string) => `${schema}.lte(1000)`,
    c3: "z.string().transform(Number)",
  });
  const expected = `z.object({
		c1: ${integerSchema}.nullable().optional(),
		c2: ${integerSchema}.lte(1000),
		c3: z.string().transform(Number)
	})`;
  expectNormalized(result, expected);
});

test("refine table - update", () => {
  const table = pgTable("test", {
    c1: integer(),
    c2: integer().notNull(),
    c3: integer().notNull(),
    c4: integer().generatedAlwaysAs(1),
  });

  const result = createUpdateSchema(table, stringSchemaFactory, {
    c2: (schema: string) => `${schema}.lte(1000)`,
    c3: "z.string().transform(Number)",
  });
  const expected = `z.object({
    c1: ${integerSchema}.nullable().optional(),
    c2: ${integerSchema}.lte(1000).optional(),
    c3: z.string().transform(Number).optional()
  })`;
  expectNormalized(result, expected);
});

test("refine view - select", () => {
  const table = pgTable("test", {
    c1: integer(),
    c2: integer(),
    c3: integer(),
    c4: integer(),
    c5: integer(),
    c6: integer(),
  });
  const view = pgView("test").as((qb) =>
    qb
      .select({
        c1: table.c1,
        c2: table.c2,
        c3: table.c3,
        nested: {
          c4: table.c4,
          c5: table.c5,
          c6: table.c6,
        },
        table,
      })
      .from(table),
  );

  const result = createSelectSchema(view, stringSchemaFactory, {
    c2: (schema: string) => `${schema}.lte(1000)`,
    c3: "z.string().transform(Number)",
    nested: {
      c5: (schema: string) => `${schema}.lte(1000)`,
      c6: "z.string().transform(Number)",
    },
    table: {
      c2: (schema: string) => `${schema}.lte(1000)`,
      c3: "z.string().transform(Number)",
    },
  });
  const expected = `z.object({
		c1: ${integerSchema}.nullable(),
		c2: ${integerSchema}.lte(1000).nullable(),
		c3: z.string().transform(Number).nullable(),
		nested: z.object({
			c4: ${integerSchema}.nullable(),
			c5: ${integerSchema}.lte(1000).nullable(),
			c6: z.string().transform(Number).nullable()
		}),
		table: z.object({
			c1: ${integerSchema}.nullable(),
			c2: ${integerSchema}.lte(1000).nullable(),
			c3: z.string().transform(Number).nullable(),
			c4: ${integerSchema}.nullable(),
			c5: ${integerSchema}.nullable(),
			c6: ${integerSchema}.nullable()
		})
  })`;
  expectNormalized(result, expected);
});

test("all data types", () => {
  const table = pgTable(
    "test",
    ({
      bigint,
      bigserial,
      bit,
      boolean,
      date,
      char,
      cidr,
      doublePrecision,
      geometry,
      halfvec,
      inet,
      integer,
      interval,
      json,
      jsonb,
      line,
      macaddr,
      macaddr8,
      numeric,
      point,
      real,
      serial,
      smallint,
      smallserial,
      text,
      sparsevec,
      time,
      timestamp,
      uuid,
      varchar,
      vector,
    }) => ({
      bigint1: bigint({ mode: "number" }).notNull(),
      bigint2: bigint({ mode: "bigint" }).notNull(),
      bigserial1: bigserial({ mode: "number" }).notNull(),
      bigserial2: bigserial({ mode: "bigint" }).notNull(),
      bit: bit({ dimensions: 5 }).notNull(),
      boolean: boolean().notNull(),
      date1: date({ mode: "date" }).notNull(),
      date2: date({ mode: "string" }).notNull(),
      char1: char({ length: 10 }).notNull(),
      char2: char({ length: 1, enum: ["a", "b", "c"] }).notNull(),
      cidr: cidr().notNull(),
      doublePrecision: doublePrecision().notNull(),
      geometry1: geometry({ type: "point", mode: "tuple" }).notNull(),
      geometry2: geometry({ type: "point", mode: "xy" }).notNull(),
      halfvec: halfvec({ dimensions: 3 }).notNull(),
      inet: inet().notNull(),
      integer: integer().notNull(),
      interval: interval().notNull(),
      json: json().notNull(),
      jsonb: jsonb().notNull(),
      line1: line({ mode: "abc" }).notNull(),
      line2: line({ mode: "tuple" }).notNull(),
      macaddr: macaddr().notNull(),
      macaddr8: macaddr8().notNull(),
      numeric: numeric().notNull(),
      point1: point({ mode: "xy" }).notNull(),
      point2: point({ mode: "tuple" }).notNull(),
      real: real().notNull(),
      serial: serial().notNull(),
      smallint: smallint().notNull(),
      smallserial: smallserial().notNull(),
      text1: text().notNull(),
      text2: text({ enum: ["a", "b", "c"] }).notNull(),
      sparsevec: sparsevec({ dimensions: 3 }).notNull(),
      time: time().notNull(),
      timestamp1: timestamp({ mode: "date" }).notNull(),
      timestamp2: timestamp({ mode: "string" }).notNull(),
      uuid: uuid().notNull(),
      varchar1: varchar({ length: 10 }).notNull(),
      varchar2: varchar({ length: 1, enum: ["a", "b", "c"] }).notNull(),
      vector: vector({ dimensions: 3 }).notNull(),
      array1: integer().array().notNull(),
      array2: integer().array().array(2).notNull(),
      array3: varchar({ length: 10 }).array().array(2).notNull(),
    }),
  );

  const result = createSelectSchema(table, stringSchemaFactory);
  const expected = `z.object({
		bigint1: z.number().gte(${Number.MIN_SAFE_INTEGER}).lte(${Number.MAX_SAFE_INTEGER}),
		bigint2: z.bigint().gte(${CONSTANTS.INT64_MIN}).lte(${CONSTANTS.INT64_MAX}),
		bigserial1: z.number().gte(${Number.MIN_SAFE_INTEGER}).lte(${Number.MAX_SAFE_INTEGER}),
		bigserial2: z.bigint().gte(${CONSTANTS.INT64_MIN}).lte(${CONSTANTS.INT64_MAX}),
		bit: z.string().regex(/^[01]+$/).max(5),
		boolean: z.boolean(),
		date1: z.date(),
		date2: z.string(),
		char1: z.string().length(10),
		char2: z.enum(["a", "b", "c"]),
		cidr: z.string(),
		doublePrecision: z.number().gte(${CONSTANTS.INT48_MIN}).lte(${CONSTANTS.INT48_MAX}),
		geometry1: z.tuple([z.number(), z.number()]),
		geometry2: z.object({ x: z.number(), y: z.number() }),
		halfvec: z.array(z.number()).length(3),
		inet: z.string(),
		integer: z.number().gte(${CONSTANTS.INT32_MIN}).lte(${CONSTANTS.INT32_MAX}),
		interval: z.string(),
		json: ${JSON_SCHEMA_STRING},
		jsonb: ${JSON_SCHEMA_STRING},
		line1: z.object({ a: z.number(), b: z.number(), c: z.number() }),
		line2: z.tuple([z.number(), z.number(), z.number()]),
		macaddr: z.string(),
		macaddr8: z.string(),
		numeric: z.string(),
		point1: z.object({ x: z.number(), y: z.number() }),
		point2: z.tuple([z.number(), z.number()]),
		real: z.number().gte(${CONSTANTS.INT24_MIN}).lte(${CONSTANTS.INT24_MAX}),
		serial: z.number().gte(${CONSTANTS.INT32_MIN}).lte(${CONSTANTS.INT32_MAX}),
		smallint: z.number().gte(${CONSTANTS.INT16_MIN}).lte(${CONSTANTS.INT16_MAX}),
		smallserial: z.number().gte(${CONSTANTS.INT16_MIN}).lte(${CONSTANTS.INT16_MAX}),
		text1: z.string(),
		text2: z.enum(["a", "b", "c"]),
		sparsevec: z.string(),
		time: z.string(),
		timestamp1: z.date(),
		timestamp2: z.string(),
		uuid: z.uuid(),
		varchar1: z.string().max(10),
		varchar2: z.enum(["a", "b", "c"]),
		vector: z.array(z.number()).length(3),
		array1: z.array(${integerSchema}),
		array2: z.array(z.array(${integerSchema})).length(2),
		array3: z.array(z.array(z.string().max(10))).length(2)
  })`;

  expectNormalized(result, expected);
});
