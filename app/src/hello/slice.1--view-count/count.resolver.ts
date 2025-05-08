import { EventStore } from "@event-driven-io/emmett";
import { CountHandler } from "./opsinsertcountn.handler";

export const resolvers = {
  Query: {
    count: async (
      _parent: unknown,
      { id }: { id: string },
      { eventstore }: { eventstore: EventStore }
    ) => {
      const countHandler = new CountHandler(eventstore);
      const result = await countHandler.getState(id);
      return result.state;
    },
  },
};
