import {
  FormatCodeSettings,
  Project,
  QuoteKind,
  VariableDeclarationKind,
} from "ts-morph";
import { FileDefinition } from "../types";

export interface InputData {
  name: string;
  commands: Array<{
    name: string;
    fields: { [key: string]: string };
  }>;
  events: Array<{
    name: string;
    fields: { [key: string]: string };
  }>;
  state: { [key: string]: string };
  paths: {
    base: string;
  };
}

export class AggregateGenerator {
  generate(input: InputData): FileDefinition[] {
    const files: FileDefinition[] = [];

    // Generate aggregate file
    files.push({
      className: input.name,
      outputFilePath: `${input.paths.base}/shared/${input.name.toLowerCase()}.aggregate.ts`,
      content: this.generateAggregate(input),
      type: "file",
    });

    // Generate aggregate test file
    files.push({
      className: `${input.name}Spec`,
      outputFilePath: `${input.paths.base}/shared/${input.name.toLowerCase()}.aggregate.spec.ts`,
      content: this.generateAggregateTests(input),
      type: "file",
    });

    return files;
  }

  private generateAggregate(input: InputData): string {
    const project = new Project({
      useInMemoryFileSystem: true,
      skipFileDependencyResolution: true,
      skipLoadingLibFiles: true,
      skipAddingFilesFromTsConfig: true,
      manipulationSettings: {
        quoteKind: QuoteKind.Double,
      },
    });

    const sourceFile = project.createSourceFile("temp.ts", "", {
      overwrite: true,
    });

    // Add imports
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@event-driven-io/emmett",
      namedImports: [{ name: "CommandHandler" }],
    });

    // Add command imports
    input.commands.forEach((command) => {
      sourceFile.addImportDeclaration({
        moduleSpecifier: `../slice.0--${command.name.toLowerCase()}/${command.name.toLowerCase()}.command`,
        namedImports: [{ name: command.name }],
      });
    });

    // Add event imports
    input.events.forEach((event) => {
      sourceFile.addImportDeclaration({
        moduleSpecifier: `../slice.0--${event.name.toLowerCase()}/${event.name.toLowerCase()}.event`,
        namedImports: [{ name: event.name }],
      });
    });

    // Add state type
    const stateFields = Object.entries(input.state)
      .map(([key, type]) => `${key}: ${type}`)
      .join("; ");
    sourceFile.addTypeAlias({
      isExported: true,
      name: `${input.name}State`,
      type: `{ ${stateFields} }`,
    });

    // Add command handlers
    input.commands.forEach((command) => {
      const event = input.events.find((e) =>
        e.name.toLowerCase().includes(command.name.toLowerCase())
      );
      if (!event) return;

      const eventFields = Object.entries(event.fields)
        .map(([key, type]) => `${key}: command.data.${key}`)
        .join(",\n      ");
      const eventData = `id: command.data.id${eventFields ? `,\n      ${eventFields}` : ""}`;

      sourceFile.addFunction({
        isExported: true,
        name: command.name.toLowerCase(),
        parameters: [
          { name: "command", type: command.name },
          { name: "state", type: `${input.name}State` },
        ],
        returnType: event.name,
        statements: [
          `return {
    type: "${event.name}",
    data: {
      ${eventData}
    },
  };`,
        ],
      });
    });

    // Add initial state
    const initialStateFields = Object.entries(input.state)
      .map(([key, type]) => `${key}: ${type === "string" ? '""' : "0"}`)
      .join(",\n    ");
    sourceFile.addFunction({
      isExported: true,
      name: "initialState",
      returnType: `${input.name}State`,
      statements: [
        `return {
    ${initialStateFields}
  };`,
      ],
    });

    // Add evolve function
    const evolveCases = input.events
      .map((event) => {
        const stateUpdates = Object.entries(event.fields)
          .map(([key, type]) => {
            if (input.state[key]) {
              return `${key}: state.${key} + event.data.${key}`;
            }
            return null;
          })
          .filter(Boolean)
          .join(",\n        ");
        return `    case "${event.name}":
      return {
        ...state,
        ${stateUpdates}
      };`;
      })
      .join("\n");

    sourceFile.addFunction({
      isExported: true,
      name: "evolve",
      parameters: [
        { name: "state", type: `${input.name}State` },
        { name: "event", type: input.events.map((e) => e.name).join(" | ") },
      ],
      returnType: `${input.name}State`,
      statements: [
        `switch (event.type) {
${evolveCases}
    default:
      return state;
  }`,
      ],
    });

    // Add command handler
    sourceFile.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: `handle${input.name}Command`,
          initializer: `CommandHandler({ evolve, initialState })`,
        },
      ],
    });

    // Format the file
    sourceFile.formatText({
      placeOpenBraceOnNewLineForFunctions: false,
      placeOpenBraceOnNewLineForControlBlocks: false,
      convertTabsToSpaces: true,
      indentSize: 2,
    } as FormatCodeSettings);

    return sourceFile.getFullText();
  }

  private generateAggregateTests(input: InputData): string {
    return `import { ${input.name}State } from "./${input.name.toLowerCase()}.aggregate";
${input.commands.map((c) => `import { ${c.name} } from "../slice.0--${c.name.toLowerCase()}/${c.name.toLowerCase()}.command";`).join("\n")}
${input.events.map((e) => `import { ${e.name} } from "../slice.0--${e.name.toLowerCase()}/${e.name.toLowerCase()}.event";`).join("\n")}

describe("${input.name}", () => {
  it("should handle commands and evolve state", () => {
    const command: ${input.commands[0].name} = {
      type: "${input.commands[0].name}",
      data: {
        id: "test-id",
        ${Object.entries(input.commands[0].fields)
          .map(([key, type]) => `${key}: ${type === "string" ? '"test"' : "1"}`)
          .join(",\n        ")}
      }
    };

    const event = ${input.commands[0].name.toLowerCase()}(command, initialState());
    const newState = evolve(initialState(), event);

    expect(event.type).toBe("${input.events[0].name}");
    expect(event.data.id).toBe("test-id");
    ${Object.entries(input.events[0].fields)
      .map(
        ([key, type]) =>
          `expect(event.data.${key}).toBe(${type === "string" ? '"test"' : "1"});`
      )
      .join("\n    ")}
    ${Object.entries(input.state)
      .map(
        ([key, type]) =>
          `expect(newState.${key}).toBe(${type === "string" ? '""' : "1"});`
      )
      .join("\n    ")}
  });
});`;
  }
}
