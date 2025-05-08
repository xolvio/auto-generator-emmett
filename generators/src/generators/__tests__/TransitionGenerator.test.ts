import { describe, it, expect } from "vitest";
import { TransitionGenerator, TransitionInput } from "../TransitionGenerator";

describe("TransitionGenerator", () => {
  const generator = new TransitionGenerator();

  const mockInput: TransitionInput = {
    source: {
      name: "Increment",
      type: "command",
    },
    target: {
      name: "Incremented",
      type: "event",
    },
    paths: {
      base: "src",
    },
  };

  it("should generate transition class file", () => {
    const files = generator.generate(mockInput);
    const transitionFile = files.find((f) =>
      f.outputFilePath.endsWith("Transition.ts")
    );

    expect(transitionFile).toBeDefined();
    expect(transitionFile?.outputFilePath).toBe(
      "src/transitions/increment--incremented.transition.ts"
    );
    expect(transitionFile?.content).toContain(
      "export class IncrementIncrementedTransition"
    );
    expect(transitionFile?.content).toContain(
      'import { Increment } from "@src/src/commands/Increment"'
    );
    expect(transitionFile?.content).toContain(
      'import { Incremented } from "@src/src/events/Incremented"'
    );
    expect(transitionFile?.content).toContain(
      "constructor(private readonly source: Increment, private readonly target: Incremented)"
    );
    expect(transitionFile?.content).toContain("get source(): Increment");
    expect(transitionFile?.content).toContain("get target(): Incremented");
  });

  it("should handle different type combinations", () => {
    const eventToCommandInput: TransitionInput = {
      source: {
        name: "Started",
        type: "event",
      },
      target: {
        name: "Stop",
        type: "command",
      },
      paths: {
        base: "src",
      },
    };

    const files = generator.generate(eventToCommandInput);
    const transitionFile = files.find((f) =>
      f.outputFilePath.endsWith("Transition.ts")
    );

    expect(transitionFile).toBeDefined();
    expect(transitionFile?.outputFilePath).toBe(
      "src/transitions/started--stop.transition.ts"
    );
    expect(transitionFile?.content).toContain(
      "export class StartedStopTransition"
    );
    expect(transitionFile?.content).toContain(
      'import { Started } from "@src/src/events/Started"'
    );
    expect(transitionFile?.content).toContain(
      'import { Stop } from "@src/src/commands/Stop"'
    );
  });
});
