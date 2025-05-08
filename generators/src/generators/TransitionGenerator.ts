import { FormatCodeSettings, Project, QuoteKind, Scope } from "ts-morph";
import path from "path";
import { FileDefinition } from "../types";

export interface TransitionInput {
  source: {
    name: string;
    type: "command" | "event";
  };
  target: {
    name: string;
    type: "command" | "event";
  };
  paths: {
    base: string;
  };
}

export class TransitionGenerator {
  generate(input: TransitionInput): FileDefinition[] {
    const files: FileDefinition[] = [];

    // Generate transition file
    files.push({
      className: input.source.name,
      outputFilePath: `${input.paths.base}/${input.source.type.toLowerCase()}--${input.source.name}__${input.target.type.toLowerCase()}--${input.target.name}.ts`,
      content: this.generateTransition(input),
      type: "file",
    });

    // Generate transition test file
    files.push({
      className: `${input.source.name}Spec`,
      outputFilePath: `${input.paths.base}/${input.source.type.toLowerCase()}--${input.source.name}__${input.target.type.toLowerCase()}--${input.target.name}.spec.ts`,
      content: this.generateTransitionTests(input),
      type: "file",
    });

    return files;
  }

  private generateTransition(input: TransitionInput): string {
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
      moduleSpecifier: `@src/${input.source.name.replace(".ts", "")}`,
      namedImports: [{ name: input.source.name }],
    });

    sourceFile.addImportDeclaration({
      moduleSpecifier: `@src/${input.target.name.replace(".ts", "")}`,
      namedImports: [{ name: input.target.name }],
    });

    // Create the transition class
    const transitionClass = sourceFile.addClass({
      isExported: true,
      name: input.source.name,
    });

    // Add constructor
    transitionClass.addConstructor({
      parameters: [
        {
          name: "source",
          scope: Scope.Private,
          isReadonly: true,
          type: input.source.name,
        },
        {
          name: "target",
          scope: Scope.Private,
          isReadonly: true,
          type: input.target.name,
        },
      ],
    });

    // Add getter methods
    transitionClass.addGetAccessor({
      name: "source",
      returnType: input.source.name,
      statements: ["return this.source;"],
    });

    transitionClass.addGetAccessor({
      name: "target",
      returnType: input.target.name,
      statements: ["return this.target;"],
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

  private generateTransitionTests(input: TransitionInput): string {
    return `import { ${input.source.name} } from './${input.source.type.toLowerCase()}--${input.source.name}__${input.target.type.toLowerCase()}--${input.target.name}';
import { ${input.source.name} } from '${input.source.name.replace(".ts", "")}';
import { ${input.target.name} } from '${input.target.name.replace(".ts", "")}';

describe('${input.source.name}', () => {
  let source: ${input.source.name};
  let target: ${input.target.name};
  let transition: ${input.source.name};

  beforeEach(() => {
    source = new ${input.source.name}('test-source-id');
    target = new ${input.target.name}('test-target-id');
    transition = new ${input.source.name}(source, target);
  });

  it('should get source', () => {
    expect(transition.source).toBe(source);
  });

  it('should get target', () => {
    expect(transition.target).toBe(target);
  });
});`;
  }
}
