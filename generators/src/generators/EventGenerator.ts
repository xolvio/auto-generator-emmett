import { FileDefinition } from "../types";

export interface EventInput {
  name: string;
  fields: { [key: string]: string };
  paths: {
    base: string;
  };
}

export class EventGenerator {
  generate(input: EventInput): FileDefinition[] {
    const files: FileDefinition[] = [];

    // Generate event type file
    files.push({
      className: input.name,
      outputFilePath: `${input.paths.base}/slice.0--${input.name.toLowerCase()}/${input.name.toLowerCase()}.event.ts`,
      content: this.generateEventType(input),
      type: "file",
    });

    // Generate event test file
    files.push({
      className: `${input.name}Spec`,
      outputFilePath: `${input.paths.base}/slice.0--${input.name.toLowerCase()}/${input.name.toLowerCase()}.event.spec.ts`,
      content: this.generateEventTests(input),
      type: "file",
    });

    return files;
  }

  private generateEventType(input: EventInput): string {
    const fields = Object.entries(input.fields)
      .map(([key, type]) => `${key}: ${type}`)
      .concat(["id: string"])
      .join("; ");

    return `import type { Event } from "@event-driven-io/emmett";

export type ${input.name} = Event<"${input.name}", { ${fields} }>;`;
  }

  private generateEventTests(input: EventInput): string {
    return `import { ${input.name} } from "./${input.name.toLowerCase()}.event";

describe("${input.name}", () => {
  it("should create event with correct type and data", () => {
    const event: ${input.name} = {
      type: "${input.name}",
      data: {
        id: "test-id",
        ${Object.entries(input.fields)
          .map(([key, type]) => `${key}: ${type === "string" ? '"test"' : "1"}`)
          .join(",\n        ")}
      }
    };

    expect(event.type).toBe("${input.name}");
    expect(event.data.id).toBe("test-id");
    ${Object.entries(input.fields)
      .map(
        ([key, type]) =>
          `expect(event.data.${key}).toBe(${type === "string" ? '"test"' : "1"});`
      )
      .join("\n    ")}
  });
});`;
  }
}
