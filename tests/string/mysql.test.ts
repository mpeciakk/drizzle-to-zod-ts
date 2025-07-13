/* based on https://github.com/drizzle-team/drizzle-orm/tree/main/drizzle-zod/tests */
import { sql } from "drizzle-orm";
import { customType, int, mysqlSchema, mysqlTable, mysqlView, serial, text } from "drizzle-orm/mysql-core";
import { test } from "vitest";
import { CONSTANTS } from "@/constants";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "@/index";
import { JSON_SCHEMA_STRING } from "@/string/constants";
import { StringSchemaFactory } from "@/string/string-schema-factory";
import { expectNormalized } from "../common";

const intSchema = `z.number().gte(${CONSTANTS.INT32_MIN}).lte(${CONSTANTS.INT32_MAX})`;
const serialNumberModeSchema = `z.number().gte(0).lte(${Number.MAX_SAFE_INTEGER})`;
const textSchema = `z.string().max(${CONSTANTS.INT16_UNSIGNED_MAX})`;

const stringSchemaFactory = new StringSchemaFactory();

test("table - select", () => {
  const table = mysqlTable("test", {
    id: serial().primaryKey(),
    generated: int().generatedAlwaysAs(1).notNull(),
    name: text().notNull(),
  });

  const result = createSelectSchema(table, stringSchemaFactory);
  const expected = `z.object({ id: ${serialNumberModeSchema}, generated: ${intSchema}, name: ${textSchema} })`;
  expectNormalized(result, expected);
});

test("table in schema - select", () => {
  const schema = mysqlSchema("test");
  const table = schema.table("test", {
    id: serial().primaryKey(),
    name: text().notNull(),
  });

  const result = createSelectSchema(table, stringSchemaFactory);
  const expected = `z.object({ id: ${serialNumberModeSchema}, name: ${textSchema} })`;
  expectNormalized(result, expected);
});

test("table - insert", () => {
  const table = mysqlTable("test", {
    id: serial().primaryKey(),
    name: text().notNull(),
    age: int(),
  });

  const result = createInsertSchema(table, stringSchemaFactory);
  const expected = `z.object({ id: ${serialNumberModeSchema}.optional(), name: ${textSchema}, age: ${intSchema}.nullable().optional() })`;
  expectNormalized(result, expected);
});

test("table - update", () => {
  const table = mysqlTable("test", {
    id: serial().primaryKey(),
    name: text().notNull(),
    age: int(),
  });

  const result = createUpdateSchema(table, stringSchemaFactory);
  const expected = `z.object({ id: ${serialNumberModeSchema}.optional(), name: ${textSchema}.optional(), age: ${intSchema}.nullable().optional() })`;
  expectNormalized(result, expected);
});

test("view qb - select", () => {
  const table = mysqlTable("test", {
    id: serial().primaryKey(),
    name: text().notNull(),
  });
  const view = mysqlView("test").as((qb) => qb.select({ id: table.id, age: sql``.as("age") }).from(table));

  const result = createSelectSchema(view, stringSchemaFactory);
  const expected = `z.object({ id: ${serialNumberModeSchema}, age: z.any() })`;
  expectNormalized(result, expected);
});

test("view columns - select", () => {
  const view = mysqlView("test", {
    id: serial().primaryKey(),
    name: text().notNull(),
  }).as(sql``);

  const result = createSelectSchema(view, stringSchemaFactory);
  const expected = `z.object({ id: ${serialNumberModeSchema}, name: ${textSchema} })`;
  expectNormalized(result, expected);
});

test("view with nested fields - select", () => {
  const table = mysqlTable("test", {
    id: serial().primaryKey(),
    name: text().notNull(),
  });
  const view = mysqlView("test").as((qb) =>
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
  const expected = `z.object({ id: ${serialNumberModeSchema}, nested: z.object({ name: ${textSchema}, age: z.any() }), table: z.object({ id: ${serialNumberModeSchema}, name: ${textSchema} }) })`;
  expectNormalized(result, expected);
});

test("nullability - select", () => {
  const table = mysqlTable("test", {
    c1: int(),
    c2: int().notNull(),
    c3: int().default(1),
    c4: int().notNull().default(1),
  });

  const result = createSelectSchema(table, stringSchemaFactory);
  const expected = `z.object({ c1: ${intSchema}.nullable(), c2: ${intSchema}, c3: ${intSchema}.nullable(), c4: ${intSchema} })`;
  expectNormalized(result, expected);
});

test("nullability - insert", () => {
  const table = mysqlTable("test", {
    c1: int(),
    c2: int().notNull(),
    c3: int().default(1),
    c4: int().notNull().default(1),
    c5: int().generatedAlwaysAs(1),
  });

  const result = createInsertSchema(table, stringSchemaFactory);
  const expected = `z.object({ c1: ${intSchema}.nullable().optional(), c2: ${intSchema}, c3: ${intSchema}.nullable().optional().default(1), c4: ${intSchema}.optional().default(1) })`;
  expectNormalized(result, expected);
});

test("nullability - update", () => {
  const table = mysqlTable("test", {
    c1: int(),
    c2: int().notNull(),
    c3: int().default(1),
    c4: int().notNull().default(1),
    c5: int().generatedAlwaysAs(1),
  });

  const result = createUpdateSchema(table, stringSchemaFactory);
  const expected = `z.object({ c1: ${intSchema}.nullable().optional(), c2: ${intSchema}.optional(), c3: ${intSchema}.nullable().optional(), c4: ${intSchema}.optional() })`;
  expectNormalized(result, expected);
});

test("refine table - select", () => {
  const table = mysqlTable("test", {
    c1: int(),
    c2: int().notNull(),
    c3: int().notNull(),
  });

  const result = createSelectSchema(table, stringSchemaFactory, {
    c2: (schema: string) => `${schema}.lte(1000)`,
    c3: "z.string().transform(Number)",
  });
  const expected = `z.object({ c1: ${intSchema}.nullable(), c2: ${intSchema}.lte(1000), c3: z.string().transform(Number) })`;
  expectNormalized(result, expected);
});

test("refine table - select with custom data type", () => {
  const customText = customType({ dataType: () => "text" });
  const table = mysqlTable("test", {
    c1: int(),
    c2: int().notNull(),
    c3: int().notNull(),
    c4: customText(),
  });

  const customTextSchema = "z.string().min(1).max(100)";
  const result = createSelectSchema(table, stringSchemaFactory, {
    c2: (schema: string) => `${schema}.lte(1000)`,
    c3: "z.string().transform(Number)",
    c4: customTextSchema,
  });
  const expected = `z.object({ c1: ${intSchema}.nullable(), c2: ${intSchema}.lte(1000), c3: z.string().transform(Number), c4: z.string().min(1).max(100).nullable() })`;

  expectNormalized(result, expected);
});

test("refine table - insert", () => {
  const table = mysqlTable("test", {
    c1: int(),
    c2: int().notNull(),
    c3: int().notNull(),
    c4: int().generatedAlwaysAs(1),
  });

  const result = createInsertSchema(table, stringSchemaFactory, {
    c2: (schema: string) => `${schema}.lte(1000)`,
    c3: "z.string().transform(Number)",
  });
  const expected = `z.object({ c1: ${intSchema}.nullable().optional(), c2: ${intSchema}.lte(1000), c3: z.string().transform(Number) })`;
  expectNormalized(result, expected);
});

test("refine table - update", () => {
  const table = mysqlTable("test", {
    c1: int(),
    c2: int().notNull(),
    c3: int().notNull(),
    c4: int().generatedAlwaysAs(1),
  });

  const result = createUpdateSchema(table, stringSchemaFactory, {
    c2: (schema: string) => `${schema}.lte(1000)`,
    c3: "z.string().transform(Number)",
  });
  const expected = `z.object({ c1: ${intSchema}.nullable().optional(), c2: ${intSchema}.lte(1000).optional(), c3: z.string().transform(Number).optional() })`;
  expectNormalized(result, expected);
});

test("refine view - select", () => {
  const table = mysqlTable("test", {
    c1: int(),
    c2: int(),
    c3: int(),
    c4: int(),
    c5: int(),
    c6: int(),
  });
  const view = mysqlView("test").as((qb) =>
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
		c1: ${intSchema}.nullable(),
		c2: ${intSchema}.lte(1000).nullable(),
		c3: z.string().transform(Number).nullable(),
		nested: z.object({
			c4: ${intSchema}.nullable(),
			c5: ${intSchema}.lte(1000).nullable(),
			c6: z.string().transform(Number).nullable()
		}),
		table: z.object({
			c1: ${intSchema}.nullable(),
			c2: ${intSchema}.lte(1000).nullable(),
			c3: z.string().transform(Number).nullable(),
			c4: ${intSchema}.nullable(),
			c5: ${intSchema}.nullable(),
			c6: ${intSchema}.nullable()
		})
	})`;
  expectNormalized(result, expected);
});

test("all data types", () => {
  const table = mysqlTable(
    "test",
    ({
      bigint,
      binary,
      boolean,
      char,
      date,
      datetime,
      decimal,
      double,
      float,
      int,
      json,
      mediumint,
      mysqlEnum,
      real,
      serial,
      smallint,
      text,
      time,
      timestamp,
      tinyint,
      varchar,
      varbinary,
      year,
      longtext,
      mediumtext,
      tinytext,
    }) => ({
      bigint1: bigint({ mode: "number" }).notNull(),
      bigint2: bigint({ mode: "bigint" }).notNull(),
      bigint3: bigint({ unsigned: true, mode: "number" }).notNull(),
      bigint4: bigint({ unsigned: true, mode: "bigint" }).notNull(),
      binary: binary({ length: 10 }).notNull(),
      boolean: boolean().notNull(),
      char1: char({ length: 10 }).notNull(),
      char2: char({ length: 1, enum: ["a", "b", "c"] }).notNull(),
      date1: date({ mode: "date" }).notNull(),
      date2: date({ mode: "string" }).notNull(),
      datetime1: datetime({ mode: "date" }).notNull(),
      datetime2: datetime({ mode: "string" }).notNull(),
      decimal1: decimal().notNull(),
      decimal2: decimal({ unsigned: true }).notNull(),
      double1: double().notNull(),
      double2: double({ unsigned: true }).notNull(),
      float1: float().notNull(),
      float2: float({ unsigned: true }).notNull(),
      int1: int().notNull(),
      int2: int({ unsigned: true }).notNull(),
      json: json().notNull(),
      mediumint1: mediumint().notNull(),
      mediumint2: mediumint({ unsigned: true }).notNull(),
      enum: mysqlEnum("enum", ["a", "b", "c"]).notNull(),
      real: real().notNull(),
      serial: serial().notNull(),
      smallint1: smallint().notNull(),
      smallint2: smallint({ unsigned: true }).notNull(),
      text1: text().notNull(),
      text2: text({ enum: ["a", "b", "c"] }).notNull(),
      time: time().notNull(),
      timestamp1: timestamp({ mode: "date" }).notNull(),
      timestamp2: timestamp({ mode: "string" }).notNull(),
      tinyint1: tinyint().notNull(),
      tinyint2: tinyint({ unsigned: true }).notNull(),
      varchar1: varchar({ length: 10 }).notNull(),
      varchar2: varchar({ length: 1, enum: ["a", "b", "c"] }).notNull(),
      varbinary: varbinary({ length: 10 }).notNull(),
      year: year().notNull(),
      longtext1: longtext().notNull(),
      longtext2: longtext({ enum: ["a", "b", "c"] }).notNull(),
      mediumtext1: mediumtext().notNull(),
      mediumtext2: mediumtext({ enum: ["a", "b", "c"] }).notNull(),
      tinytext1: tinytext().notNull(),
      tinytext2: tinytext({ enum: ["a", "b", "c"] }).notNull(),
    }),
  );

  const result = createSelectSchema(table, stringSchemaFactory);
  const expected = `z.object({
		bigint1: z.number().gte(${Number.MIN_SAFE_INTEGER}).lte(${Number.MAX_SAFE_INTEGER}),
		bigint2: z.bigint().gte(${CONSTANTS.INT64_MIN}).lte(${CONSTANTS.INT64_MAX}),
		bigint3: z.number().gte(0).lte(${Number.MAX_SAFE_INTEGER}),
		bigint4: z.bigint().gte(0).lte(${CONSTANTS.INT64_UNSIGNED_MAX}),
		binary: z.string(),
		boolean: z.boolean(),
		char1: z.string().length(10),
		char2: z.enum(["a", "b", "c"]),
		date1: z.date(),
		date2: z.string(),
		datetime1: z.date(),
		datetime2: z.string(),
		decimal1: z.string(),
		decimal2: z.string(),
		double1: z.number().gte(${CONSTANTS.INT48_MIN}).lte(${CONSTANTS.INT48_MAX}),
		double2: z.number().gte(0).lte(${CONSTANTS.INT48_UNSIGNED_MAX}),
		float1: z.number().gte(${CONSTANTS.INT24_MIN}).lte(${CONSTANTS.INT24_MAX}),
		float2: z.number().gte(0).lte(${CONSTANTS.INT24_UNSIGNED_MAX}),
		int1: z.number().gte(${CONSTANTS.INT32_MIN}).lte(${CONSTANTS.INT32_MAX}),
		int2: z.number().gte(0).lte(${CONSTANTS.INT32_UNSIGNED_MAX}),
		json: ${JSON_SCHEMA_STRING},
		mediumint1: z.number().gte(${CONSTANTS.INT24_MIN}).lte(${CONSTANTS.INT24_MAX}),
		mediumint2: z.number().gte(0).lte(${CONSTANTS.INT24_UNSIGNED_MAX}),
		enum: z.enum(["a", "b", "c"]),
		real: z.number().gte(${CONSTANTS.INT48_MIN}).lte(${CONSTANTS.INT48_MAX}),
		serial: z.number().gte(0).lte(${Number.MAX_SAFE_INTEGER}),
		smallint1: z.number().gte(${CONSTANTS.INT16_MIN}).lte(${CONSTANTS.INT16_MAX}),
		smallint2: z.number().gte(0).lte(${CONSTANTS.INT16_UNSIGNED_MAX}),
		text1: z.string().max(${CONSTANTS.INT16_UNSIGNED_MAX}),
		text2: z.enum(["a", "b", "c"]),
		time: z.string(),
		timestamp1: z.date(),
		timestamp2: z.string(),
		tinyint1: z.number().gte(${CONSTANTS.INT8_MIN}).lte(${CONSTANTS.INT8_MAX}),
		tinyint2: z.number().gte(0).lte(${CONSTANTS.INT8_UNSIGNED_MAX}),
		varchar1: z.string().max(10),
		varchar2: z.enum(["a", "b", "c"]),
		varbinary: z.string(),
		year: z.number().gte(1901).lte(2155),
		longtext1: z.string().max(${CONSTANTS.INT32_UNSIGNED_MAX}),
		longtext2: z.enum(["a", "b", "c"]),
		mediumtext1: z.string().max(${CONSTANTS.INT24_UNSIGNED_MAX}),
		mediumtext2: z.enum(["a", "b", "c"]),
		tinytext1: z.string().max(${CONSTANTS.INT8_UNSIGNED_MAX}),
		tinytext2: z.enum(["a", "b", "c"])
	})`;
  expectNormalized(result, expected);
});
