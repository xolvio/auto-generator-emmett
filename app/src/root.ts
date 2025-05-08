import { AddHandler } from "./hello/slice.0--add-to-count/add.handler";
import { CountHandler } from "./hello/slice.1--view-count/count.handler";
import { RemoveHandler } from "./hello/slice.2--remove-from-count/remove.handler";
import { getInMemoryEventStore } from "@event-driven-io/emmett";

export function initializeApplication() {
  const eventStore = getInMemoryEventStore();

  const addHandler = new AddHandler(eventStore);
  const removeHandler = new RemoveHandler(eventStore);
  const countHandler = new CountHandler(eventStore);

  return {
    addHandler,
    removeHandler,
    countHandler,
  };
}
