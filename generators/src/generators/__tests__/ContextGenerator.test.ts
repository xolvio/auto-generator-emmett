import { describe, it, expect } from "vitest";
import { ContextGenerator, ContextGeneratorInput } from "../ContextGenerator";

describe("ContextGenerator", () => {
  const generator = new ContextGenerator();

  const mockInput: ContextGeneratorInput = {
    name: "Counter",
    aggregates: ["Counter", "Display"],
    paths: {
      base: "src",
    },
  };

  it("should generate context class file", () => {
    const files = generator.generate(mockInput);
    const contextFile = files.find((f) =>
      f.outputFilePath.endsWith("Context.ts")
    );

    expect(contextFile).toBeDefined();
    expect(contextFile?.outputFilePath).toBe("src/CounterContext.ts");
    expect(contextFile?.content).toContain("export class CounterContext");
    expect(contextFile?.content).toContain(
      'import { Counter } from "@src/src/aggregates/Counter/Counter"'
    );
    expect(contextFile?.content).toContain(
      'import { Display } from "@src/src/aggregates/Display/Display"'
    );
    expect(contextFile?.content).toContain(
      "constructor(private readonly aggregates: Counter | Display)"
    );
    expect(contextFile?.content).toContain("get counter(): Counter");
    expect(contextFile?.content).toContain("get display(): Display");
  });

  it("should generate context test file", () => {
    const files = generator.generate(mockInput);
    const testFile = files.find((f) =>
      f.outputFilePath.endsWith("Context.spec.ts")
    );

    expect(testFile).toBeDefined();
    expect(testFile?.outputFilePath).toBe("src/CounterContext.spec.ts");
    expect(testFile?.content).toContain("describe('CounterContext'");
    expect(testFile?.content).toContain(
      "import { CounterContext } from './CounterContext'"
    );
    expect(testFile?.content).toContain(
      "import { Counter } from 'src/aggregates/Counter/Counter'"
    );
    expect(testFile?.content).toContain(
      "import { Display } from 'src/aggregates/Display/Display'"
    );
    expect(testFile?.content).toContain("it('should get counter'");
    expect(testFile?.content).toContain("it('should get display'");
    expect(testFile?.content).toContain(
      "const aggregate = new Counter('test-id')"
    );
    expect(testFile?.content).toContain(
      "const context = new CounterContext(aggregate)"
    );
    expect(testFile?.content).toContain(
      "expect(context.counter).toBe(aggregate)"
    );
  });
});
