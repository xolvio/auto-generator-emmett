import { CommandHandler } from "@event-driven-io/emmett";
import { Add } from "../slice.0--add-to-count/add.command";
import { Remove } from "../slice.2--remove-from-count/remove.command";
import { Added } from "../slice.0--add-to-count/added.event";
import { Removed } from "../slice.2--remove-from-count/removed.event";

export type CounterState = { count: number };

export function add(command: Add, state: CounterState): Added {
  return {
    type: "Added",
    data: {
      amount: command.data.amount,
      id: command.data.id,
    },
  };
}

export function remove(command: Remove, state: CounterState): Removed {
  return {
    type: "Removed",
    data: {
      amount: command.data.amount,
      id: command.data.id,
    },
  };
}

export function initialState(): CounterState {
  return {
    count: 0,
  };
}

export function evolve(
  state: CounterState,
  event: Added | Removed
): CounterState {
  switch (event.type) {
    case "Added":
      return {
        ...state,
        count: state.count + event.data.amount,
      };
    case "Removed":
      return {
        ...state,
        count: state.count - event.data.amount,
      };
    default:
      return state;
  }
}

export const handleCounterCommand = CommandHandler({ evolve, initialState });
