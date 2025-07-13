import type { Column } from "drizzle-orm";
import type { ColumnFactoryRegistry } from "@/core/column-factory";
import { SchemaFactory } from "@/core/schema-factory";
import type { Conditions } from "@/schema";
import { getDefaultStringColumnFactoryRegistry } from "./string-column-factory";

export class StringSchemaFactory extends SchemaFactory<string> {
  public finalizeSchema(schema: string, column: Column, conditions: Conditions): string {
    let finalSchema = schema;
    if (conditions.nullable(column)) {
      finalSchema = `${finalSchema}.nullable()`;
    }

    if (conditions.optional(column)) {
      finalSchema = `${finalSchema}.optional()`;
    }

    if (conditions.default(column) && column.hasDefault) {
      finalSchema = `${finalSchema}.default(${column.default})`;
    }

    return finalSchema;
  }

  public any(): string {
    return "z.any()";
  }

  public build(columnSchemas: Record<string, string>): string {
    if (Object.keys(columnSchemas).length === 0) {
      return "z.object({})";
    }

    const fieldStrings = Object.entries(columnSchemas).map(([name, value], index) => {
      const isLast = index === Object.keys(columnSchemas).length - 1;
      return `\t${name}: ${value}${isLast ? "" : ","}`;
    });

    return `z.object({\n${fieldStrings.join("\n")}\n})`;
  }

  protected createColumnFactoryRegistry(): ColumnFactoryRegistry<string> {
    return getDefaultStringColumnFactoryRegistry(this);
  }
}
