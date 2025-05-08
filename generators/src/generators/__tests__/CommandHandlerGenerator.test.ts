import { describe, it, expect } from "vitest";
import {
  CommandHandlerGenerator,
  CommandHandlerInput,
} from "../CommandHandlerGenerator";

describe("CommandHandlerGenerator", () => {
  const mockInput: CommandHandlerInput = {
    name: "Add",
    fields: {
      amount: "number",
    },
    aggregateName: "Counter",
    paths: {
      base: "src",
    },
  };

  it("should generate command type file", () => {
    const generator = new CommandHandlerGenerator();
    const result = generator.generate(mockInput);

    const typeFile = result.find(
      (file) => file.outputFilePath === "src/slice.0--add/add.command.ts"
    );

    expect(typeFile).toBeDefined();
    expect(typeFile?.content).toContain(
      'import type { Command } from "@event-driven-io/emmett"'
    );
    expect(typeFile?.content).toContain("export type Add = Command<");
    expect(typeFile?.content).toContain("amount: number");
  });

  it("should generate command handler file", () => {
    const generator = new CommandHandlerGenerator();
    const result = generator.generate(mockInput);

    const handlerFile = result.find(
      (file) => file.outputFilePath === "src/slice.0--add/add.handler.ts"
    );

    expect(handlerFile).toBeDefined();
    expect(handlerFile?.content).toContain("export class AddHandler");
    expect(handlerFile?.content).toContain("handleCounterCommand");
  });

  it("should generate command handler test file", () => {
    const generator = new CommandHandlerGenerator();
    const result = generator.generate(mockInput);

    const testFile = result.find(
      (file) => file.outputFilePath === "src/slice.0--add/add.handler.spec.ts"
    );

    expect(testFile).toBeDefined();
    expect(testFile?.content).toContain('describe("AddHandler"');
    expect(testFile?.content).toContain("let handler: AddHandler");
    expect(testFile?.content).toContain("const command: Add = {");
  });
});
