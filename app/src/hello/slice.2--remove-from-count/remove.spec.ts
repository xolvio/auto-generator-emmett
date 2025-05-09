import { describe, it } from "vitest";
import { DeciderSpecification } from "@event-driven-io/emmett";
import { decide, evolve, initialState } from "../shared/counter.aggregate";

const given = DeciderSpecification.for({
  decide,
  evolve,
  initialState,
});

describe("Add", () => {
  const id = "counter1";
  it("should remove from count", () => {
    given([{ type: "Added", data: { amount: 1, id } }])
      .when({ type: "Remove", data: { amount: 1, id } })
      .then([{ type: "Removed", data: { amount: 1, id } }]);
  });

  it("should throw error if count is 0", () => {
    given([])
      .when({ type: "Remove", data: { amount: 1, id } })
      .thenThrows(Error);
  });

  it("should throw error if count is less than amount", () => {
    given([{ type: "Added", data: { amount: 1, id } }])
      .when({ type: "Remove", data: { amount: 2, id } })
      .thenThrows(Error);
  });
});
