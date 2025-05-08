import type { Event } from "@event-driven-io/emmett";

export type Added = Event<"Added", { amount: number; id: string }>;
