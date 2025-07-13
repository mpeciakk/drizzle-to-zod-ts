# Drizzle to *Any* TypeScript Converter

A flexible, type-safe converter library that transforms Drizzle ORM table definitions into various schema formats. Currently supports Zod schemas and string-based code generation.

## 🚀 Features

- **Multi-Format Support**: Convert Drizzle tables to Zod schemas, string representations, and more
- **Type Safety**: Full TypeScript support with proper type inference
- **Database Agnostic**: Supports MySQL, PostgreSQL, SQLite, and SingleStore
- **Flexible Architecture**: Easy to extend with new target formats
- **Comprehensive Testing**: Thorough test coverage across multiple databases

## 📦 Installation

```bash
npm install drizzle-to-zod-ts
```

## 🔧 Usage

### Basic Usage

```typescript
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-to-zod-ts';
import { ZodSchemaFactory } from 'drizzle-to-zod-ts/zod';
import { StringSchemaFactory } from 'drizzle-to-zod-ts/string';
import { mysqlTable, serial, text, int } from 'drizzle-orm/mysql-core';

// Define your Drizzle table
const users = mysqlTable('users', {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull(),
  age: int(),
});

// Create schema factories
const zodFactory = new ZodSchemaFactory();
const stringFactory = new StringSchemaFactory();

// Generate Zod schemas
const selectSchema = createSelectSchema(users, zodFactory);
const insertSchema = createInsertSchema(users, zodFactory);
const updateSchema = createUpdateSchema(users, zodFactory);

// Generate string schemas (for code generation)
const selectSchemaString = createSelectSchema(users, stringFactory);
const insertSchemaString = createInsertSchema(users, stringFactory);
const updateSchemaString = createUpdateSchema(users, stringFactory);
```

### Advanced Usage with Refinements

```typescript
import { z } from 'zod';

// Custom refinements for schema generation
const selectSchema = createSelectSchema(users, zodFactory, {
  name: (schema) => schema.min(2).max(50),
  email: z.string().email(),
  age: (schema) => schema.gte(0).lte(120),
});
```

### Working with Views

```typescript
import { mysqlView } from 'drizzle-orm/mysql-core';

const userView = mysqlView('user_view').as(
  (qb) => qb.select({
    id: users.id,
    name: users.name,
    email: users.email,
  }).from(users)
);

const viewSchema = createSelectSchema(userView, zodFactory);
```

### PostgreSQL Support

```typescript
import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

const posts = pgTable('posts', {
  id: serial().primaryKey(),
  title: text().notNull(),
  content: text(),
  authorId: integer().notNull(),
});

const postSchema = createSelectSchema(posts, zodFactory);
```

## 🏗️ Architecture

The library uses a flexible factory pattern that allows you to convert Drizzle schemas to any target format:

```
SchemaFactory<S> (Abstract Base)
├── ZodSchemaFactory → generates z.ZodType
├── StringSchemaFactory → generates string
└── Future: JsonSchemaFactory, GraphQLFactory, etc.
```

### Core Components

- **`SchemaFactory<S>`**: Abstract base class for creating schema converters
- **`createSelectSchema`**: Generates schemas for SELECT operations
- **`createInsertSchema`**: Generates schemas for INSERT operations  
- **`createUpdateSchema`**: Generates schemas for UPDATE operations

## 📚 API Reference

### Main Functions

#### `createSelectSchema<T, SchemaType>(entity, schemaFactory, refinements?)`

Creates a schema for SELECT operations.

**Parameters:**
- `entity`: Drizzle table or view
- `schemaFactory`: Schema factory instance
- `refinements`: Optional schema refinements

**Returns:** Schema in the target format

#### `createInsertSchema<T, SchemaType>(entity, schemaFactory, refinements?)`

Creates a schema for INSERT operations.

**Parameters:**
- `entity`: Drizzle table
- `schemaFactory`: Schema factory instance
- `refinements`: Optional schema refinements

**Returns:** Schema in the target format

#### `createUpdateSchema<T, SchemaType>(entity, schemaFactory, refinements?)`

Creates a schema for UPDATE operations.

**Parameters:**
- `entity`: Drizzle table
- `schemaFactory`: Schema factory instance
- `refinements`: Optional schema refinements

**Returns:** Schema in the target format

### Schema Factories

#### `ZodSchemaFactory`

Generates actual Zod schema objects.

```typescript
import { ZodSchemaFactory } from 'drizzle-to-zod-ts/zod';

const factory = new ZodSchemaFactory();
const schema = createSelectSchema(table, factory);
// Returns: z.ZodObject
```

#### `StringSchemaFactory`

Generates string representations of schemas (useful for code generation).

```typescript
import { StringSchemaFactory } from 'drizzle-to-zod-ts/string';

const factory = new StringSchemaFactory();
const schema = createSelectSchema(table, factory);
// Returns: "z.object({ id: z.number(), name: z.string() })"
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The library includes comprehensive tests for:
- MySQL tables and views
- PostgreSQL tables and views
- Various column types
- Schema refinements
- Nullability handling
- Default values

## 🔧 Development

### Project Structure

```
src/
├── core/                    # Core abstractions
│   ├── schema-factory.ts   # Abstract SchemaFactory
│   ├── column-factory.ts   # Column factory registry
│   └── schema-refinement.ts # Refinement utilities
├── zod/                    # Zod schema factory
├── string/                 # String schema factory
├── index.ts               # Main exports
└── utils.ts               # Utility functions
```

### Adding New Schema Formats

To add support for a new schema format (e.g., JSON Schema):

1. Create a new factory extending `SchemaFactory<S>`:

```typescript
export class JsonSchemaFactory extends SchemaFactory<JsonSchema> {
  protected createEnumSchema(column: Column & { enumValues: [string, ...string[]] }): JsonSchema {
    return { type: 'string', enum: column.enumValues };
  }

  public finalizeSchema(schema: JsonSchema, column: Column, conditions: Conditions): JsonSchema {
    // Implementation
  }

  public any(): JsonSchema {
    return { type: 'any' };
  }

  public build(columnSchemas: Record<string, JsonSchema>): JsonSchema {
    return { type: 'object', properties: columnSchemas };
  }

  protected createColumnFactoryRegistry(): ColumnFactoryRegistry<JsonSchema> {
    return getDefaultJsonSchemaColumnFactoryRegistry(this);
  }
}
```

2. Create column factory registry for the new format
3. Add tests for the new format

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built on top of [Drizzle ORM](https://orm.drizzle.team/)
- Inspired by [Zod](https://zod.dev/) schema validation
- Test patterns adapted from Drizzle's official zod integration 