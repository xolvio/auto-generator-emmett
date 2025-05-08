import { EventStore } from "@event-driven-io/emmett";
import { Remove } from "./remove.command";
import { remove, handleCounterCommand } from "../shared/counter.aggregate";

export class RemoveHandler {
  constructor(private readonly eventStore: EventStore) {}

  async handle(command: Remove) {
    return handleCounterCommand(this.eventStore, command.data.id, (state) =>
      remove(command, state)
    );
  }
}
