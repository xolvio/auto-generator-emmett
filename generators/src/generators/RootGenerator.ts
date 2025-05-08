import { FormatCodeSettings, Project, QuoteKind, Scope } from "ts-morph";
import path from "path";
import { FileDefinition } from "../types";

export interface RootInput {
  name: string;
  aggregates: {
    name: string;
    path: string;
  }[];
  paths: {
    base: string;
  };
}

export class RootGenerator {
  generate(input: RootInput): FileDefinition[] {
    const files: FileDefinition[] = [];

    // Generate root file
    files.push({
      className: `${input.name}Root`,
      outputFilePath: `${input.paths.base}/${input.name}Root.ts`,
      content: this.generateRoot(input),
      type: "file",
    });

    // Generate root test file
    files.push({
      className: `${input.name}RootSpec`,
      outputFilePath: `${input.paths.base}/${input.name}Root.spec.ts`,
      content: this.generateRootTests(input),
      type: "file",
    });

    return files;
  }

  private generateRoot(input: RootInput): string {
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
        moduleSpecifier: `@src/${aggregate.path.replace(".ts", "")}`,
        namedImports: [{ name: aggregate.name }],
      });
    });

    // Create the root class
    const rootClass = sourceFile.addClass({
      isExported: true,
      name: `${input.name}Root`,
    });

    // Add constructor
    rootClass.addConstructor({
      parameters: [
        {
          name: "aggregates",
          scope: Scope.Private,
          isReadonly: true,
          type: input.aggregates.map((a) => a.name).join(" | "),
        },
      ],
    });

    // Add getter methods for each aggregate
    input.aggregates.forEach((aggregate) => {
      rootClass.addGetAccessor({
        name: aggregate.name.toLowerCase(),
        returnType: aggregate.name,
        statements: [`return this.aggregates as ${aggregate.name};`],
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

  private generateRootTests(input: RootInput): string {
    const imports = input.aggregates
      .map(
        (aggregate) => `import { ${aggregate.name} } from '${aggregate.path}';`
      )
      .join("\n");

    const testCases = input.aggregates
      .map(
        (aggregate) =>
          `  it('should get ${aggregate.name.toLowerCase()}', () => {
    const aggregate = new ${aggregate.name}('test-id');
    const root = new ${input.name}Root(aggregate);
    expect(root.${aggregate.name.toLowerCase()}).toBe(aggregate);
  });`
      )
      .join("\n\n");

    return `import { ${input.name}Root } from './${input.name}Root';
${imports}

describe('${input.name}Root', () => {
${testCases}
});`;
  }
}
