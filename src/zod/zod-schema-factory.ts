import type { Column } from "drizzle-orm";
import z from "zod/v4";
import type { ColumnFactoryRegistry } from "@/core/column-factory";
import { SchemaFactory } from "@/core/schema-factory";
import type { Conditions } from "@/schema";
import { getDefaultZodColumnFactoryRegistry } from "./zod-column-factory";

export class ZodSchemaFactory extends SchemaFactory<z.ZodType> {
  public finalizeSchema(schema: z.ZodType, column: Column, conditions: Conditions): z.ZodType {
    let finalSchema = schema;
    if (conditions.nullable(column)) {
      finalSchema = finalSchema.nullable();
    }

    if (conditions.optional(column)) {
      finalSchema = finalSchema.optional();
    }

    if (conditions.default(column) && column.hasDefault) {
      finalSchema = finalSchema.default(column.default);
    }

    return finalSchema;
  }

  public any(): z.ZodType {
    return z.any();
  }

  public build(columnSchemas: Record<string, z.ZodType>): z.ZodType {
    if (Object.keys(columnSchemas).length === 0) {
      return z.object({});
    }

    const fields = Object.fromEntries(Object.entries(columnSchemas).map(([name, value]) => [name, value]));

    return z.object(fields);
  }

  protected createColumnFactoryRegistry(): ColumnFactoryRegistry<z.ZodType> {
    return getDefaultZodColumnFactoryRegistry(this);
  }
}
