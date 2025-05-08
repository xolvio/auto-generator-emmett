import { EmmettEntity, FileDefinition } from "../types";

export class EntityGenerator {
  generate(entity: EmmettEntity): FileDefinition[] {
    const files: FileDefinition[] = [];

    // Create entity directory
    files.push({
      path: `src/${entity.type.toLowerCase()}s/${entity.name}`,
      content: "",
      type: "directory",
    });

    // Generate entity class file
    files.push({
      path: `src/${entity.type.toLowerCase()}s/${entity.name}/index.ts`,
      content: this.generateEntityClass(entity),
      type: "file",
    });

    // Generate entity test file
    files.push({
      path: `src/${entity.type.toLowerCase()}s/${entity.name}/index.spec.ts`,
      content: this.generateEntityTests(entity),
      type: "file",
    });

    return files;
  }

  private generateEntityClass(entity: EmmettEntity): string {
    const properties = entity.properties
      .map((p) => `  ${p.name}${p.isRequired ? "" : "?"}: ${p.type};`)
      .join("\n");

    const methods = entity.methods
      .map((m) => {
        const params = m.parameters
          .map((p) => `${p.name}: ${p.type}`)
          .join(", ");
        return `  ${m.name}(${params}): ${m.returnType} {
    // TODO: Implement ${m.name}
    throw new Error('Not implemented');
  }`;
      })
      .join("\n\n");

    return `export class ${entity.name} {
${properties}

${methods}
}`;
  }

  private generateEntityTests(entity: EmmettEntity): string {
    return `import { ${entity.name} } from './index';

describe('${entity.name}', () => {
  let instance: ${entity.name};

  beforeEach(() => {
    instance = new ${entity.name}();
  });

  // TODO: Add tests for ${entity.name}
});`;
  }
}
