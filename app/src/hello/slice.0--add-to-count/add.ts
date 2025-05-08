import { AddHandler } from "./add.handler";
import { EventStore } from "@event-driven-io/emmett";
import { AckNack } from "../../../lib/runtime";

export const resolvers = {
  Mutation: {
    add: async (
      _: unknown,
      { input }: { input: Record<"amount" | "id", any> },
      { eventstore }: { eventstore: EventStore }
    ): Promise<AckNack> => {
      try {
        await new AddHandler(eventstore).handle({
          type: "Add",
          data: {
            id: input.id,
            amount: input.amount,
          },
        });
        return { success: true };
      } catch (error) {
        return { success: false, reason: error.message };
      }
    },
  },
};
