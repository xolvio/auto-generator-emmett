import type { Command } from "@event-driven-io/emmett";

export type Add = Command<"Add", { amount: number; id: string }>;
