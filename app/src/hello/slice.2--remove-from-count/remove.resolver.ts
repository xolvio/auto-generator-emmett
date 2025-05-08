import { EventStore } from "@event-driven-io/emmett";
import { AckNack } from "../../../lib/runtime";
import { RemoveHandler } from "./remove.handler";

export const resolvers = {
  Mutation: {
    remove: async (
      _: unknown,
      { input }: { input: Record<"id" | "amount", any> },
      { eventstore }: { eventstore: EventStore }
    ): Promise<AckNack> => {
      try {
        await new RemoveHandler(eventstore).handle({
          type: "Remove",
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
