import { FormatCodeSettings, Project, QuoteKind, Scope } from "ts-morph";
import path from "path";
import { FileDefinition } from "../types";

export interface CommandHandlerInput {
  name: string;
  fields: { [key: string]: string };
  aggregateName: string;
  paths: {
    base: string;
  };
}

export class CommandHandlerGenerator {
  generate(input: CommandHandlerInput): FileDefinition[] {
    const files: FileDefinition[] = [];

    // Generate command type file
    files.push({
      className: input.name,
      outputFilePath: `${input.paths.base}/slice.0--${input.name.toLowerCase()}/${input.name.toLowerCase()}.command.ts`,
      content: this.generateCommandType(input),
      type: "file",
    });

    // Generate command handler file
    files.push({
      className: `${input.name}Handler`,
      outputFilePath: `${input.paths.base}/slice.0--${input.name.toLowerCase()}/${input.name.toLowerCase()}.handler.ts`,
      content: this.generateCommandHandler(input),
      type: "file",
    });

    // Generate command handler test file
    files.push({
      className: `${input.name}HandlerSpec`,
      outputFilePath: `${input.paths.base}/slice.0--${input.name.toLowerCase()}/${input.name.toLowerCase()}.handler.spec.ts`,
      content: this.generateCommandHandlerTests(input),
      type: "file",
    });

    return files;
  }

  private generateCommandType(input: CommandHandlerInput): string {
    const fields = Object.entries(input.fields)
      .map(([key, type]) => `${key}: ${type}`)
      .concat(["id: string"])
      .join("; ");

    return `import type { Command } from "@event-driven-io/emmett";

export type ${input.name} = Command<"${input.name}", { ${fields} }>;`;
  }

  private generateCommandHandler(input: CommandHandlerInput): string {
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
      namedImports: [{ name: "EventStore" }],
    });

    sourceFile.addImportDeclaration({
      moduleSpecifier: `./${input.name.toLowerCase()}.command`,
      namedImports: [{ name: input.name }],
    });

    sourceFile.addImportDeclaration({
      moduleSpecifier: `../shared/${input.aggregateName.toLowerCase()}.aggregate`,
      namedImports: [
        { name: input.aggregateName },
        { name: `handle${input.aggregateName}Command` },
      ],
    });

    // Create the class
    const handlerClass = sourceFile.addClass({
      isExported: true,
      name: `${input.name}Handler`,
    });

    // Add constructor
    handlerClass.addConstructor({
      parameters: [
        {
          name: "eventStore",
          scope: Scope.Private,
          isReadonly: true,
          type: "EventStore",
        },
      ],
    });

    // Add handler method
    const handlerMethod = handlerClass.addMethod({
      name: "handle",
      isAsync: true,
      parameters: [
        {
          name: "command",
          type: input.name,
        },
      ],
      returnType: "Promise<void>",
    });

    // Add implementation
    handlerMethod.setBodyText(`
      return handle${input.aggregateName}Command(this.eventStore, command.data.id, (state) =>
        ${input.name.toLowerCase()}(command, state)
      );
    `);

    // Format the file
    sourceFile.formatText({
      placeOpenBraceOnNewLineForFunctions: false,
      placeOpenBraceOnNewLineForControlBlocks: false,
      convertTabsToSpaces: true,
      indentSize: 2,
    } as FormatCodeSettings);

    return sourceFile.getFullText();
  }

  private generateCommandHandlerTests(input: CommandHandlerInput): string {
    return `import { ${input.name}Handler } from "./${input.name.toLowerCase()}.handler";
import { ${input.name} } from "./${input.name.toLowerCase()}.command";
import { EventStore } from "@event-driven-io/emmett";

describe("${input.name}Handler", () => {
  let handler: ${input.name}Handler;
  let eventStore: EventStore;

  beforeEach(() => {
    eventStore = {
      readStream: jest.fn(),
      appendToStream: jest.fn()
    } as any;
    handler = new ${input.name}Handler(eventStore);
  });

  it("should handle command", async () => {
    const command: ${input.name} = {
      type: "${input.name}",
      data: {
        id: "test-id",
        ${Object.entries(input.fields)
          .map(([key, type]) => `${key}: ${type === "string" ? '"test"' : "1"}`)
          .join(",\n        ")}
      }
    };

    await handler.handle(command);

    expect(eventStore.readStream).toHaveBeenCalledWith("test-id");
    expect(eventStore.appendToStream).toHaveBeenCalled();
  });
});`;
  }
}
