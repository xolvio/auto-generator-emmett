import { describe, it, expect } from "vitest";
import { evolve, initialState } from "./count.handler";
import { Added } from "../slice.0--add-to-count/added.event";
import { Removed } from "../slice.2--remove-from-count/removed.event";

describe("Add", () => {
  const id = "counter1";
  it("should add to count", () => {
    const given: (Added | Removed)[] = [
      { type: "Added", data: { amount: 1, id } },
      { type: "Added", data: { amount: 1, id } },
      { type: "Removed", data: { amount: 1, id } },
    ];

    const state = given.reduce(evolve, initialState());

    expect(state.count).toBe(1);
  });
});
