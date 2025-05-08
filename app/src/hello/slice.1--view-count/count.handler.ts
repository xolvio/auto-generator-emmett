import { EventStore } from "@event-driven-io/emmett";
import { Added } from "../slice.0--add-to-count/added.event";
import { Removed } from "../slice.2--remove-from-count/removed.event";

export type CountState = {
  count: number;
  id: string;
};

function evolve(state: CountState, event: Added | Removed): CountState {
  switch (event.type) {
    case "Added":
      return { ...state, count: state.count + event.data.amount };
    case "Removed":
      return { ...state, count: state.count - event.data.amount };
    default:
      return state;
  }
}

function initialState(): CountState {
  return { count: 0, id: "" };
}

export class CountHandler {
  constructor(private readonly eventStore: EventStore) {}

  getState(count: string) {
    return this.eventStore.aggregateStream(count, {
      evolve,
      initialState,
    });
  }
}
