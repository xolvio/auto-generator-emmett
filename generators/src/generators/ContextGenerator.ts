import { FormatCodeSettings, Project, QuoteKind, Scope } from "ts-morph";
import path from "path";
import { FileDefinition } from "../types";

export interface ContextInput {
  name: string;
  aggregates: string[];
  paths: {
    base: string;
  };
}

export class ContextGenerator {
  generate(input: ContextInput): FileDefinition[] {
    const files: FileDefinition[] = [];

    // Generate context file
    files.push({
      className: `${input.name}Context`,
      outputFilePath: `${input.paths.base}/${input.name}Context.ts`,
      content: this.generateContext(input),
      type: "file",
    });

    // Generate context test file
    files.push({
      className: `${input.name}ContextSpec`,
      outputFilePath: `${input.paths.base}/${input.name}Context.spec.ts`,
      content: this.generateContextTests(input),
      type: "file",
    });

    return files;
  }

  private generateContext(input: ContextInput): string {
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

    // Add imports for each aggregate
    input.aggregates.forEach((aggregate) => {
      sourceFile.addImportDeclaration({
        moduleSpecifier: `@src/${aggregate.replace(".ts", "")}`,
        namedImports: [{ name: aggregate }],
      });
    });

    // Create the context class
    const contextClass = sourceFile.addClass({
      isExported: true,
      name: `${input.name}Context`,
    });

    // Add constructor
    contextClass.addConstructor({
      parameters: [
        {
          name: "aggregates",
          scope: Scope.Private,
          isReadonly: true,
          type: input.aggregates.join(" | "),
        },
      ],
    });

    // Add getter methods for each aggregate
    input.aggregates.forEach((aggregate) => {
      contextClass.addGetAccessor({
        name: aggregate.toLowerCase(),
        returnType: aggregate,
        statements: [`return this.aggregates as ${aggregate};`],
      });
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

  private generateContextTests(input: ContextInput): string {
    const imports = input.aggregates
      .map((aggregate) => `import { ${aggregate} } from '${aggregate}';`)
      .join("\n");

    const testCases = input.aggregates
      .map(
        (aggregate) =>
          `  it('should get ${aggregate.toLowerCase()}', () => {
    const aggregate = new ${aggregate}('test-id');
    const context = new ${input.name}Context(aggregate);
    expect(context.${aggregate.toLowerCase()}).toBe(aggregate);
  });`
      )
      .join("\n\n");

    return `import { ${input.name}Context } from './${input.name}Context';
${imports}

describe('${input.name}Context', () => {
${testCases}
});`;
  }
}
