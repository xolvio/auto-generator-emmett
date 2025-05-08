export const commandTemplate = {
  commandType: `import type { Command } from "@event-driven-io/emmett";

export type {{NAME}} = Command<"{{NAME}}", { {{FIELDS}} }>;
`,

  handlerTemplate: `import { EventStore } from "@event-driven-io/emmett";
import { {{NAME}} } from "./{{NAME_LOWERCASE}}.command";
import { {{AGGREGATE_NAME}}, handle{{AGGREGATE_NAME}}Command } from "../shared/{{AGGREGATE_LOWERCASE}}.aggregate";

export class {{NAME}}Handler {
  constructor(private readonly eventStore: EventStore) {}

  async handle(command: {{NAME}}) {
    return handle{{AGGREGATE_NAME}}Command(this.eventStore, command.data.id, (state) =>
      {{NAME_LOWERCASE}}(command, state)
    );
  }
}
`,

  handlerTestTemplate: `import { {{NAME}}Handler } from "./{{NAME_LOWERCASE}}.handler";
import { {{NAME}} } from "./{{NAME_LOWERCASE}}.command";
import { EventStore } from "@event-driven-io/emmett";

describe("{{NAME}}Handler", () => {
  let handler: {{NAME}}Handler;
  let eventStore: EventStore;

  beforeEach(() => {
    eventStore = {
      readStream: jest.fn(),
      appendToStream: jest.fn()
    } as any;
    handler = new {{NAME}}Handler(eventStore);
  });

  it("should handle command", async () => {
    const command: {{NAME}} = {
      type: "{{NAME}}",
      data: {
        id: "test-id",
        {{TEST_FIELDS}}
      }
    };

    await handler.handle(command);

    expect(eventStore.readStream).toHaveBeenCalledWith("test-id");
    expect(eventStore.appendToStream).toHaveBeenCalled();
  });
});
`,
};
