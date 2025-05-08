import { FormatCodeSettings, Project, QuoteKind, Scope } from "ts-morph";
import path from "path";
import { FileDefinition } from "../types";

export interface StateHandlerInput {
  name: string;
  aggregateName: string;
  paths: {
    base: string;
  };
}

export class StateHandlerGenerator {
  generate(input: StateHandlerInput): FileDefinition[] {
    const files: FileDefinition[] = [];

    // Generate state handler file
    files.push({
      className: `${input.name}Handler`,
      outputFilePath: `${input.paths.base}/states/${input.name.toLowerCase()}.handler.ts`,
      content: this.generateStateHandler(input),
      type: "file",
    });

    // Generate state handler test file
    files.push({
      className: `${input.name}HandlerSpec`,
      outputFilePath: `${input.paths.base}/states/${input.name.toLowerCase()}.handler.spec.ts`,
      content: this.generateStateHandlerTests(input),
      type: "file",
    });

    return files;
  }

  private generateStateHandler(input: StateHandlerInput): string {
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
      moduleSpecifier: `@src/src/aggregates/${input.aggregateName}/${input.aggregateName}`,
      namedImports: [{ name: input.aggregateName }],
    });

    sourceFile.addImportDeclaration({
      moduleSpecifier: `../slice.0--${input.name.toLowerCase()}/${input.name.toLowerCase()}.event`,
      namedImports: [{ name: input.name }],
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
      name: `handle${input.name}`,
      isAsync: true,
      parameters: [
        {
          name: "state",
          type: input.name,
        },
      ],
      returnType: "Promise<void>",
    });

    // Add implementation
    handlerMethod.setBodyText(`
      const ${input.aggregateName.toLowerCase()} = await this.eventStore.readStream(state.id);
      if (!${input.aggregateName.toLowerCase()}) {
        throw new Error('${input.aggregateName} not found');
      }
      ${input.aggregateName.toLowerCase()}.apply${input.name}(state);
      await this.eventStore.appendToStream(state.id, [state]);
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

  private generateStateHandlerTests(input: StateHandlerInput): string {
    return `import { ${input.name}Handler } from './${input.name.toLowerCase()}.handler';
import { ${input.name} } from '../slice.0--${input.name.toLowerCase()}/${input.name.toLowerCase()}.event';
import { ${input.aggregateName} } from '@src/src/aggregates/${input.aggregateName}/${input.aggregateName}';
import { EventStore } from '@event-driven-io/emmett';

describe('${input.name}Handler', () => {
  let handler: ${input.name}Handler;
  let eventStore: EventStore;

  beforeEach(() => {
    eventStore = {
      readStream: jest.fn(),
      appendToStream: jest.fn()
    } as any;
    handler = new ${input.name}Handler(eventStore);
  });

  it('should handle state', async () => {
    const state: ${input.name} = {
      type: '${input.name}',
      data: {
        id: 'test-id'
      }
    };

    const aggregate = new ${input.aggregateName}('test-id');
    eventStore.readStream.mockResolvedValue(aggregate);

    await handler.handle${input.name}(state);

    expect(eventStore.readStream).toHaveBeenCalledWith('test-id');
    expect(eventStore.appendToStream).toHaveBeenCalledWith('test-id', [state]);
  });
});`;
  }
}
