export const eventTemplate = {
  eventType: `import type { Event } from "@event-driven-io/emmett";

export type {{NAME}} = Event<"{{NAME}}", { {{FIELDS}} }>;
`,
};
