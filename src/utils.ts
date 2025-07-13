import type { Column, Table, View } from "drizzle-orm";
import { getTableColumns, getViewSelectedFields, isTable } from "drizzle-orm";
import { CONSTANTS } from "./constants";

export function isColumnType<T extends Column>(column: Column, columnTypes: string[]): column is T {
  return columnTypes.includes(column.columnType) || columnTypes.includes(column.dataType);
}

export function isWithEnum(column: Column): column is typeof column & { enumValues: [string, ...string[]] } {
  return "enumValues" in column && Array.isArray(column.enumValues) && column.enumValues.length > 0;
}

export function getTextMaxLength(textType: string): number {
  switch (textType) {
    case "longtext":
      return CONSTANTS.INT32_UNSIGNED_MAX;
    case "mediumtext":
      return CONSTANTS.INT24_UNSIGNED_MAX;
    case "text":
      return CONSTANTS.INT16_UNSIGNED_MAX;
    default:
      return CONSTANTS.INT8_UNSIGNED_MAX;
  }
}

export function getColumns(tableLike: Table | View) {
  return isTable(tableLike) ? getTableColumns(tableLike) : getViewSelectedFields(tableLike);
}
