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
  it("should add to count", () => {
    given([{ type: "Added", data: { amount: 1, id } }])
      .when({ type: "Add", data: { amount: 1, id } })
      .then([{ type: "Added", data: { amount: 1, id } }]);
  });
});
