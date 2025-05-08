import { EventStore } from "@event-driven-io/emmett";
import { Add } from "./add.command";
import { add, handleCounterCommand } from "../shared/counter.aggregate";

export class AddHandler {
  constructor(private readonly eventStore: EventStore) {}

  async handle(command: Add) {
    return handleCounterCommand(this.eventStore, command.data.id, (state) =>
      add(command, state)
    );
  }
}
