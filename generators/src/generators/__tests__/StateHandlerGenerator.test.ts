import { describe, it, expect } from "vitest";
import {
  StateHandlerGenerator,
  StateHandlerInput,
} from "../StateHandlerGenerator";

describe("StateHandlerGenerator", () => {
  const mockInput: StateHandlerInput = {
    name: "Incremented",
    aggregateName: "Counter",
    paths: {
      base: "src",
    },
  };

  it("should generate state handler class file", () => {
    const generator = new StateHandlerGenerator();
    const result = generator.generate(mockInput);

    const handlerFile = result.find(
      (file) => file.outputFilePath === "src/states/incremented.handler.ts"
    );

    expect(handlerFile).toBeDefined();
    expect(handlerFile?.content).toContain("export class IncrementedHandler");
    expect(handlerFile?.content).toContain(
      'import { EventStore } from "@event-driven-io/emmett"'
    );
    expect(handlerFile?.content).toContain(
      'import { Counter } from "@src/src/aggregates/Counter/Counter"'
    );
    expect(handlerFile?.content).toContain(
      'import { Incremented } from "../slice.0--incremented/incremented.event"'
    );
    expect(handlerFile?.content).toContain(
      "constructor(private readonly eventStore: EventStore)"
    );
    expect(handlerFile?.content).toContain(
      "async handleIncremented(state: Incremented): Promise<void>"
    );
  });

  it("should generate state handler test file", () => {
    const generator = new StateHandlerGenerator();
    const result = generator.generate(mockInput);

    const testFile = result.find(
      (file) => file.outputFilePath === "src/states/incremented.handler.spec.ts"
    );

    expect(testFile).toBeDefined();
    expect(testFile?.content).toContain("describe('IncrementedHandler'");
    expect(testFile?.content).toContain(
      "import { IncrementedHandler } from './incremented.handler'"
    );
    expect(testFile?.content).toContain(
      "import { Incremented } from '../slice.0--incremented/incremented.event'"
    );
    expect(testFile?.content).toContain(
      "import { Counter } from '@src/src/aggregates/Counter/Counter'"
    );
    expect(testFile?.content).toContain("let handler: IncrementedHandler");
    expect(testFile?.content).toContain("let eventStore: EventStore");
    expect(testFile?.content).toContain("eventStore = {");
    expect(testFile?.content).toContain("readStream: jest.fn(),");
    expect(testFile?.content).toContain("appendToStream: jest.fn()");
  });
});
