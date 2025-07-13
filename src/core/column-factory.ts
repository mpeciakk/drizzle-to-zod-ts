import type { Column } from "drizzle-orm";
import { isColumnType, isWithEnum } from "../utils";

export type ColumnFactory<ColumnType extends Column, SchemaType> = (column: ColumnType) => SchemaType;

export type ColumnFactoryRegistryEntry<ColumnType extends Column, SchemaType> = {
  types: string[];
  factory: ColumnFactory<ColumnType, SchemaType>;
};

export class ColumnFactoryRegistry<SchemaType> {
  private readonly columnFactories: ColumnFactoryRegistryEntry<Column, SchemaType>[] = [];

  public register<ColumnType extends Column>(types: string[], factory: ColumnFactory<ColumnType, SchemaType>) {
    this.columnFactories.push({ types, factory: factory as ColumnFactory<Column, SchemaType> });
  }

  public getFactory<ColumnType extends Column>(columnType: string) {
    return this.columnFactories.find((entry) => entry.types.includes(columnType))?.factory as ColumnFactory<ColumnType, SchemaType>;
  }

  public getFactoryByColumn<ColumnType extends Column>(column: ColumnType) {
    if (isWithEnum(column)) {
      return this.columnFactories.find((entry) => entry.types.includes("enum"))?.factory as ColumnFactory<ColumnType, SchemaType>;
    }

    return this.columnFactories.find((entry) => isColumnType<ColumnType>(column, entry.types))?.factory as ColumnFactory<
      ColumnType,
      SchemaType
    >;
  }
}
