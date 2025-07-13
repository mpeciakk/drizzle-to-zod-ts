export const CONSTANTS = {
  INT8_MIN: -128,
  INT8_MAX: 127,
  INT8_UNSIGNED_MAX: 255,
  INT16_MIN: -32768,
  INT16_MAX: 32767,
  INT16_UNSIGNED_MAX: 65535,
  INT24_MIN: -8388608,
  INT24_MAX: 8388607,
  INT24_UNSIGNED_MAX: 16777215,
  INT32_MIN: -2147483648,
  INT32_MAX: 2147483647,
  INT32_UNSIGNED_MAX: 4294967295,
  INT48_MIN: -140737488355328,
  INT48_MAX: 140737488355327,
  INT48_UNSIGNED_MAX: 281474976710655,
  INT64_MIN: -9223372036854775808n,
  INT64_MAX: 9223372036854775807n,
  INT64_UNSIGNED_MAX: 18446744073709551615n,
};

export const BINARY_VECTOR_REGEX = /^[01]+$/;
export const VARCHAR_COLUMN_TYPES = ["PgVarchar", "SQLiteText", "MySqlVarChar", "SingleStoreVarChar"];
export const CHAR_COLUMN_TYPES = ["PgChar", "MySqlChar", "SingleStoreChar"];
export const TEXT_COLUMN_TYPES = ["MySqlText", "SingleStoreText"];
export const BINARY_VECTOR_COLUMN_TYPES = ["PgBinaryVector"];
export const TINYINT_COLUMN_TYPES = ["MySqlTinyInt", "SingleStoreTinyInt"];
export const SMALLINT_COLUMN_TYPES = ["PgSmallInt", "PgSmallSerial", "MySqlSmallInt", "SingleStoreSmallInt"];
export const MEDIUMINT_COLUMN_TYPES = ["MySqlMediumInt", "SingleStoreMediumInt"];
export const REAL_COLUMN_TYPES = ["PgReal", "MySqlFloat", "MySqlMediumInt", "SingleStoreMediumInt", "SingleStoreFloat"];
export const INTEGER_COLUMN_TYPES = ["PgInteger", "PgSerial", "MySqlInt", "SingleStoreInt"];
export const DOUBLE_COLUMN_TYPES = ["PgDoublePrecision", "MySqlReal", "MySqlDouble", "SingleStoreReal", "SingleStoreDouble", "SQLiteReal"];
export const BIGINT_COLUMN_TYPES = [
  "PgBigInt53",
  "PgBigSerial53",
  "MySqlBigInt53",
  "MySqlSerial",
  "SingleStoreBigInt53",
  "SingleStoreSerial",
  "SQLiteInteger",
];
export const YEAR_COLUMN_TYPES = ["MySqlYear", "SingleStoreYear"];
