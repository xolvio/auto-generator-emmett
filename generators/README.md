# Emmett Code Generators

This package provides code generators for creating Emmett applications based on a model definition. The generators create a complete event-driven application structure following Emmett's architectural patterns.

## Installation

From the root of the counter-emmett project:

```bash
cd generators
npm install
npm run build
```

## Usage

The generators take a model definition and generate a complete Emmett application structure. Here's an example of how to use it:

```typescript
import { EmmettGenerator } from "./dist/EmmettGenerator";
import { EmmettModel } from "./dist/types";

const model: EmmettModel = {
  name: "Counter",
  commands: [
    {
      name: "Add",
      fields: {
        amount: "number",
        id: "string",
      },
    },
  ],
  events: [
    {
      name: "Added",
      fields: {
        amount: "number",
        id: "string",
      },
    },
  ],
  state: {
    count: "number",
  },
  paths: {
    base: "src",
  },
};

const generator = new EmmettGenerator();
await generator.generate(model);
```

## Generated Structure

The generator creates a slice-based structure following Emmett's patterns:

```
src/
├── shared/
│   ├── counter.aggregate.ts
│   └── counter.aggregate.spec.ts
└── slice.0--add/
    ├── add.command.ts
    ├── add.handler.ts
    ├── add.handler.spec.ts
    ├── added.event.ts
    └── added.event.spec.ts
```

## Features

- Generates TypeScript files for:
  - Commands and their handlers
  - Events and their handlers
  - Aggregates with state management
  - Test files with Vitest setup
- Follows Emmett's functional approach to event sourcing
- Creates proper imports and exports
- Includes TypeScript configuration and type definitions

## Development

To run tests:

```bash
npm test
```

To build:

```bash
npm run build
```

## Example

For a complete example of a generated application, see the parent directory which contains a counter application built using these generators.
