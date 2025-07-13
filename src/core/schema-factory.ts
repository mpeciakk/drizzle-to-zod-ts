import type { Column, Table, View } from "drizzle-orm";
import type { Conditions } from "../schema";
import type { ColumnFactoryRegistry } from "./column-factory";
import type { Refinements } from "./schema-refinement";

export abstract class SchemaFactory<SchemaType> {
  private _columnFactoryRegistry: ColumnFactoryRegistry<SchemaType> | undefined;

  public get columnFactoryRegistry(): ColumnFactoryRegistry<SchemaType> {
    if (!this._columnFactoryRegistry) {
      this._columnFactoryRegistry = this.createColumnFactoryRegistry();
    }

    return this._columnFactoryRegistry;
  }

  public columnToBaseSchema(column: Column): SchemaType {
    const factory = this.columnFactoryRegistry.getFactoryByColumn(column);
    if (factory) {
      return factory(column);
    }

    throw new Error(`Unknown column type: 
      SQL Type: ${column.getSQLType()}
      Column Type: ${column.columnType}
      Column Name: ${column.name}
      Column DataType: ${column.dataType}
      `);
  }

  public refineSchema<T extends Table | View>(schema: SchemaType, refinement: Refinements<T, SchemaType> | undefined): SchemaType {
    if (refinement === undefined) {
      return schema;
    }

    if (typeof refinement === "function") {
      return (refinement as (schema: SchemaType) => SchemaType)(schema);
    }

    if (refinement !== null) {
      return refinement as SchemaType;
    }

    return schema;
  }

  public columnToSchema<T extends Table | View>(
    column: Column,
    key: string,
    refinements: Refinements<T, SchemaType>,
    conditions: Conditions,
  ) {
    const schema = this.columnToBaseSchema(column);

    if (conditions.never(column)) {
      return undefined;
    }

    const refinedSchema = this.refineSchema(schema, refinements?.[key] as Refinements<T, SchemaType>);
    const finalSchema = this.finalizeSchema(refinedSchema, column, conditions);

    return finalSchema;
  }

  public abstract any(): SchemaType;
  public abstract finalizeSchema(schema: SchemaType, column: Column, conditions: Conditions): SchemaType;
  public abstract build(columnSchemas: Record<string, SchemaType>): SchemaType;
  protected abstract createColumnFactoryRegistry(): ColumnFactoryRegistry<SchemaType>;
}
