/** biome-ignore-all lint/suspicious/noExplicitAny: drizzle type system is weird */
import type { Column } from "drizzle-orm";
import type { PgArray, PgGeometry, PgHalfVector, PgLineABC, PgLineTuple } from "drizzle-orm/pg-core";
import {
  BIGINT_COLUMN_TYPES,
  BINARY_VECTOR_COLUMN_TYPES,
  BINARY_VECTOR_REGEX,
  CHAR_COLUMN_TYPES,
  CONSTANTS,
  DOUBLE_COLUMN_TYPES,
  INTEGER_COLUMN_TYPES,
  REAL_COLUMN_TYPES,
  SMALLINT_COLUMN_TYPES,
  TEXT_COLUMN_TYPES,
  TINYINT_COLUMN_TYPES,
  VARCHAR_COLUMN_TYPES,
  YEAR_COLUMN_TYPES,
} from "@/constants";
import { ColumnFactoryRegistry } from "@/core/column-factory";
import type { SchemaFactory } from "@/core/schema-factory";
import type { BinaryVector, Char, Text, Varchar } from "@/types";
import { getTextMaxLength, isColumnType } from "@/utils";
import { BUFFER_SCHEMA_STRING, JSON_SCHEMA_STRING } from "./constants";

export function getDefaultStringColumnFactoryRegistry(factory: SchemaFactory<string>) {
  const columnTypeRegistry = new ColumnFactoryRegistry<string>();

  // Postgres specific types
  columnTypeRegistry.register(["PgGeometry", "PgPointTuple"], (_: PgGeometry<any>) => "z.tuple([z.number(), z.number()])");
  columnTypeRegistry.register(["PgGeometryObject", "PgPointObject"], (_: PgGeometry<any>) => "z.object({ x: z.number(), y: z.number() })");
  columnTypeRegistry.register(
    ["PgHalfVector", "PgVector"],
    (column: PgHalfVector<any>) => `z.array(z.number())${column.dimensions ? `.length(${column.dimensions})` : ""}`,
  );
  columnTypeRegistry.register(["PgLine"], (_: PgLineTuple<any>) => "z.tuple([z.number(), z.number(), z.number()])");
  columnTypeRegistry.register(["PgLineABC"], (_: PgLineABC<any>) => "z.object({ a: z.number(), b: z.number(), c: z.number() })");
  columnTypeRegistry.register(
    ["PgArray"],
    (column: PgArray<any, any>) =>
      `z.array(${factory.columnToBaseSchema(column.baseColumn)})${column.size ? `.length(${column.size})` : ""}`,
  );
  columnTypeRegistry.register(["PgUUID"], () => "z.uuid()");
  columnTypeRegistry.register(
    BINARY_VECTOR_COLUMN_TYPES,
    (column: BinaryVector) => `z.string().regex(${BINARY_VECTOR_REGEX}).max(${column.dimensions})`,
  );

  // Number types
  columnTypeRegistry.register(TINYINT_COLUMN_TYPES, (column: Column) => {
    const unsigned = column.getSQLType().includes("unsigned");
    const min = unsigned ? 0 : CONSTANTS.INT8_MIN;
    const max = unsigned ? CONSTANTS.INT8_UNSIGNED_MAX : CONSTANTS.INT8_MAX;

    return `z.number().gte(${min}).lte(${max})`;
  });
  columnTypeRegistry.register(SMALLINT_COLUMN_TYPES, (column: Column) => {
    const unsigned = column.getSQLType().includes("unsigned");
    const min = unsigned ? 0 : CONSTANTS.INT16_MIN;
    const max = unsigned ? CONSTANTS.INT16_UNSIGNED_MAX : CONSTANTS.INT16_MAX;

    return `z.number().gte(${min}).lte(${max})`;
  });
  columnTypeRegistry.register(REAL_COLUMN_TYPES, (column: Column) => {
    const unsigned = column.getSQLType().includes("unsigned");
    const min = unsigned ? 0 : CONSTANTS.INT24_MIN;
    const max = unsigned ? CONSTANTS.INT24_UNSIGNED_MAX : CONSTANTS.INT24_MAX;

    return `z.number().gte(${min}).lte(${max})`;
  });
  columnTypeRegistry.register(INTEGER_COLUMN_TYPES, (column: Column) => {
    const unsigned = column.getSQLType().includes("unsigned");
    const min = unsigned ? 0 : CONSTANTS.INT32_MIN;
    const max = unsigned ? CONSTANTS.INT32_UNSIGNED_MAX : CONSTANTS.INT32_MAX;

    return `z.number().gte(${min}).lte(${max})`;
  });
  columnTypeRegistry.register(DOUBLE_COLUMN_TYPES, (column: Column) => {
    const unsigned = column.getSQLType().includes("unsigned");
    const min = unsigned ? 0 : CONSTANTS.INT48_MIN;
    const max = unsigned ? CONSTANTS.INT48_UNSIGNED_MAX : CONSTANTS.INT48_MAX;

    return `z.number().gte(${min}).lte(${max})`;
  });
  columnTypeRegistry.register(BIGINT_COLUMN_TYPES, (column: Column) => {
    const unsigned = column.getSQLType().includes("unsigned") || isColumnType(column, ["MySqlSerial", "SingleStoreSerial"]);
    const min = unsigned ? 0 : Number.MIN_SAFE_INTEGER;
    const max = Number.MAX_SAFE_INTEGER;

    return `z.number().gte(${min}).lte(${max})`;
  });
  columnTypeRegistry.register(YEAR_COLUMN_TYPES, (_: Column) => {
    return "z.number().gte(1901).lte(2155)";
  });
  columnTypeRegistry.register(["number"], (column: Column) => {
    const unsigned = column.getSQLType().includes("unsigned");
    const min = unsigned ? 0 : Number.MIN_SAFE_INTEGER;
    const max = Number.MAX_SAFE_INTEGER;

    return `z.number().gte(${min}).lte(${max})`;
  });
  columnTypeRegistry.register(["bigint"], (column: Column) => {
    const unsigned = column.getSQLType().includes("unsigned");
    const min = unsigned ? 0 : CONSTANTS.INT64_MIN;
    const max = unsigned ? CONSTANTS.INT64_UNSIGNED_MAX : CONSTANTS.INT64_MAX;

    return `z.bigint().gte(${min}).lte(${max})`;
  });

  // String types
  columnTypeRegistry.register(
    VARCHAR_COLUMN_TYPES,
    (column: Varchar) => `z.string().max(${column.length ?? CONSTANTS.INT16_UNSIGNED_MAX})`,
  );
  columnTypeRegistry.register(CHAR_COLUMN_TYPES, (column: Char) => `z.string().length(${column.length})`);
  columnTypeRegistry.register(TEXT_COLUMN_TYPES, (column: Text) => `z.string().max(${getTextMaxLength(column.textType)})`);
  columnTypeRegistry.register(["string"], (_: Column) => "z.string()");

  // Other types
  columnTypeRegistry.register(["json"], (_: Column) => JSON_SCHEMA_STRING);
  columnTypeRegistry.register(["buffer"], (_: Column) => BUFFER_SCHEMA_STRING);
  columnTypeRegistry.register(["custom"], (_: Column) => "z.any()");
  columnTypeRegistry.register(["array"], (_: Column) => "z.array(z.any())");
  columnTypeRegistry.register(["boolean"], (_: Column) => "z.boolean()");
  columnTypeRegistry.register(["date"], (_: Column) => "z.date()");
  columnTypeRegistry.register(["enum"], (column: Column) => {
    return `z.enum([${column.enumValues?.map((value) => `"${value}"`).join(", ")}])`;
  });

  return columnTypeRegistry;
}
