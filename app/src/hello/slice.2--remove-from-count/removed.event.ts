import type { Event } from "@event-driven-io/emmett";

export type Removed = Event<"Removed", { amount: number; id: string }>;
