import { describe, it, expect } from "vitest";
import { AggregateGenerator, InputData } from "../AggregateGenerator";

describe("AggregateGenerator", () => {
  const mockInput: InputData = {
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

  it("should generate aggregate file", () => {
    const generator = new AggregateGenerator();
    const result = generator.generate(mockInput);

    const aggregateFile = result.find(
      (file) => file.outputFilePath === "src/shared/counter.aggregate.ts"
    );

    expect(aggregateFile).toBeDefined();
    expect(aggregateFile?.content).toContain("export type CounterState = {");
    expect(aggregateFile?.content).toContain("count: number");
    expect(aggregateFile?.content).toContain("export function add(");
    expect(aggregateFile?.content).toContain("export function evolve(");
  });

  it("should generate aggregate test file", () => {
    const generator = new AggregateGenerator();
    const result = generator.generate(mockInput);

    const testFile = result.find(
      (file) => file.outputFilePath === "src/shared/counter.aggregate.spec.ts"
    );

    expect(testFile).toBeDefined();
    expect(testFile?.content).toContain('describe("Counter"');
    expect(testFile?.content).toContain("const command: Add = {");
    expect(testFile?.content).toContain("amount: 1");
  });
});
