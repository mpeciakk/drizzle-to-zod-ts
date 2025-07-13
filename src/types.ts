/** biome-ignore-all lint/suspicious/noExplicitAny: too many types shenanigans */
import type { ColumnBaseConfig } from "drizzle-orm";
import type {
  MySqlBigInt53,
  MySqlChar,
  MySqlDouble,
  MySqlInt,
  MySqlMediumInt,
  MySqlReal,
  MySqlSerial,
  MySqlSmallInt,
  MySqlText,
  MySqlTinyInt,
  MySqlVarChar,
  MySqlYear,
} from "drizzle-orm/mysql-core";
import type {
  PgBigInt53,
  PgBigSerial53,
  PgBinaryVector,
  PgChar,
  PgDoublePrecision,
  PgInteger,
  PgReal,
  PgSerial,
  PgSmallInt,
  PgSmallSerial,
  PgUUID,
  PgVarchar,
} from "drizzle-orm/pg-core";
import type {
  SingleStoreBigInt53,
  SingleStoreChar,
  SingleStoreDouble,
  SingleStoreFloat,
  SingleStoreInt,
  SingleStoreMediumInt,
  SingleStoreReal,
  SingleStoreSerial,
  SingleStoreSmallInt,
  SingleStoreText,
  SingleStoreTinyInt,
  SingleStoreVarChar,
  SingleStoreYear,
} from "drizzle-orm/singlestore-core";
import type { SQLiteInteger, SQLiteReal, SQLiteText } from "drizzle-orm/sqlite-core";

export type UUID = PgUUID<ColumnBaseConfig<"string", "PgUUID">>;
export type Varchar = PgVarchar<any> | SQLiteText<any> | MySqlVarChar<any> | SingleStoreVarChar<any>;
export type Char = PgChar<any> | MySqlChar<any> | SingleStoreChar<any>;
export type Text = MySqlText<any> | SingleStoreText<any>;
export type BinaryVector = PgBinaryVector<any>;
export type TinyInt = MySqlTinyInt<any> | SingleStoreTinyInt<any>;
export type SmallInt = PgSmallInt<any> | PgSmallSerial<any> | MySqlSmallInt<any> | SingleStoreSmallInt<any>;
export type Real = PgReal<any> | MySqlReal<any> | MySqlMediumInt<any> | SingleStoreMediumInt<any> | SingleStoreFloat<any>;
export type Integer = PgInteger<any> | PgSerial<any> | MySqlInt<any> | SingleStoreInt<any>;
export type Double =
  | PgDoublePrecision<any>
  | MySqlReal<any>
  | MySqlDouble<any>
  | SingleStoreReal<any>
  | SingleStoreDouble<any>
  | SQLiteReal<any>;
export type BigInt53 =
  | PgBigInt53<any>
  | PgBigSerial53<any>
  | MySqlBigInt53<any>
  | MySqlSerial<any>
  | SingleStoreBigInt53<any>
  | SingleStoreSerial<any>
  | SQLiteInteger<any>;
export type Year = MySqlYear<any> | SingleStoreYear<any>;
