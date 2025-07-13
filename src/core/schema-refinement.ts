import type { InferSelectModel, InferSelectViewModel, Table, View } from "drizzle-orm";

export type Refinements<
  T extends Table | View,
  SchemaType,
  Model = T extends View ? InferSelectViewModel<T> : T extends Table ? InferSelectModel<T> : never,
> = Partial<{
  [K in keyof Model]: Model[K] extends object ? Refinements<T, SchemaType, Model[K]> : SchemaType | ((schema: SchemaType) => SchemaType);
}>;
