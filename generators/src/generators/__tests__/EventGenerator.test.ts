import { describe, it, expect } from "vitest";
import { EventGenerator } from "../EventGenerator";

describe("EventGenerator", () => {
  const generator = new EventGenerator();
  const mockInput = {
    name: "Added",
    fields: {
      amount: "number",
    },
    paths: {
      base: "src/aggregates/Counter",
    },
  };

  it("should generate event type file", () => {
    const files = generator.generate(mockInput);
    const eventFile = files.find((f) => f.outputFilePath.endsWith(".event.ts"));

    expect(eventFile).toBeDefined();
    expect(eventFile?.outputFilePath).toBe(
      "src/aggregates/Counter/slice.0--added/added.event.ts"
    );
    expect(eventFile?.content).toContain(
      'export type Added = Event<"Added", { amount: number; id: string }>'
    );
  });

  it("should generate event test file", () => {
    const files = generator.generate(mockInput);
    const testFile = files.find((f) =>
      f.outputFilePath.endsWith(".event.spec.ts")
    );

    expect(testFile).toBeDefined();
    expect(testFile?.outputFilePath).toBe(
      "src/aggregates/Counter/slice.0--added/added.event.spec.ts"
    );
    expect(testFile?.content).toContain('describe("Added"');
    expect(testFile?.content).toContain("amount: 1");
    expect(testFile?.content).toContain("expect(event.data.amount).toBe(1);");
  });
});
