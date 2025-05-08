import type { Command } from "@event-driven-io/emmett";

export type Remove = Command<"Remove", { amount: number; id: string }>;
