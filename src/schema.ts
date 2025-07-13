import { Column, type ColumnsSelection, is, isTable, isView, SQL, type Table, type View } from "drizzle-orm";
import type { SchemaFactory } from "./core/schema-factory";
import type { Refinements } from "./core/schema-refinement";
import { getColumns } from "./utils";

export type Conditions = {
  never: (column?: Column) => boolean;
  optional: (column: Column) => boolean;
  nullable: (column: Column) => boolean;
  default: (column: Column) => boolean;
};

export function createSchema<T extends Table | View, SchemaType>(
  columns: ColumnsSelection,
  refinements: Refinements<T, SchemaType>,
  conditions: Conditions,
  schemaFactory: SchemaFactory<SchemaType>,
) {
  const columnSchemas: Record<string, SchemaType> = {};

  for (const [key, selected] of Object.entries(columns)) {
    const schema = processColumn(key, selected, refinements, conditions, schemaFactory);
    if (schema) {
      columnSchemas[key] = schema;
    }
  }

  return schemaFactory.build(columnSchemas);
}

function processColumn<T extends Table | View, SchemaType>(
  key: string,
  // biome-ignore lint/suspicious/noExplicitAny: this type is unknown (sql.d.ts#ColumnsSelection)
  selected: any,
  refinements: Refinements<T, SchemaType>,
  conditions: Conditions,
  schemaFactory: SchemaFactory<SchemaType>,
): SchemaType | undefined {
  if (typeof selected === "object" && !is(selected, Column) && !is(selected, SQL) && !is(selected, SQL.Aliased)) {
    const columns = isTable(selected) || isView(selected) ? getColumns(selected) : selected;
    const nestedRefinements = typeof refinements?.[key] === "object" && !Array.isArray(refinements[key]) ? refinements[key] : {};
    return createSchema(columns, nestedRefinements as Refinements<T, SchemaType>, conditions, schemaFactory);
  }

  const column = is(selected, Column) ? selected : undefined;
  if (!column) return schemaFactory.any();

  return schemaFactory.columnToSchema(column, key, refinements, conditions);
}
