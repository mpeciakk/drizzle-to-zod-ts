import type { Table, View } from "drizzle-orm";
import type { SchemaFactory } from "./core/schema-factory";
import type { Refinements } from "./core/schema-refinement";
import { createSchema } from "./schema";
import { getColumns } from "./utils";

export const createSelectSchema = <T extends Table | View, SchemaType>(
  entity: T,
  schemaFactory: SchemaFactory<SchemaType>,
  refinements: Refinements<T, SchemaType> = {},
) => {
  const columns = getColumns(entity);

  return createSchema(
    columns,
    refinements,
    {
      never: () => false,
      optional: () => false,
      nullable: (column) => !column.notNull,
      default: () => false,
    },
    schemaFactory,
  );
};

export const createInsertSchema = <T extends Table | View, SchemaType>(
  entity: T,
  schemaFactory: SchemaFactory<SchemaType>,
  refinements: Refinements<T, SchemaType> = {},
) => {
  const columns = getColumns(entity);

  return createSchema(
    columns,
    refinements,
    {
      never: (column) => column?.generated?.type === "always" || column?.generatedIdentity?.type === "always",
      optional: (column) => !column.notNull || (column.notNull && column.hasDefault),
      nullable: (column) => !column.notNull,
      default: (column) => column.hasDefault && column.default !== undefined,
    },
    schemaFactory,
  );
};

export const createUpdateSchema = <T extends Table | View, SchemaType>(
  entity: T,
  schemaFactory: SchemaFactory<SchemaType>,
  refinements: Refinements<T, SchemaType> = {},
) => {
  const columns = getColumns(entity);

  return createSchema(
    columns,
    refinements,
    {
      never: (column) => column?.generated?.type === "always" || column?.generatedIdentity?.type === "always",
      optional: () => true,
      nullable: (column) => !column.notNull,
      default: () => false,
    },
    schemaFactory,
  );
};
