export const aggregateTemplate = {
  aggregateType: `import { CommandHandler } from "@event-driven-io/emmett";
import { {{COMMAND_IMPORTS}} } from "../slice.0--{{COMMAND_NAME_LOWERCASE}}/{{COMMAND_NAME_LOWERCASE}}.command";
import { {{EVENT_IMPORTS}} } from "../slice.0--{{EVENT_NAME_LOWERCASE}}/{{EVENT_NAME_LOWERCASE}}.event";

export type {{NAME}}State = { {{STATE_FIELDS}} };

export function {{COMMAND_NAME_LOWERCASE}}(command: {{COMMAND_NAME}}, state: {{NAME}}State): {{EVENT_NAME}} {
  return {
    type: "{{EVENT_NAME}}",
    data: {
      {{EVENT_FIELDS}}
    },
  };
}

export function initialState(): {{NAME}}State {
  return {
    {{INITIAL_STATE}}
  };
}

export function evolve(
  state: {{NAME}}State,
  event: {{EVENT_NAME}}
): {{NAME}}State {
  switch (event.type) {
    case "{{EVENT_NAME}}":
      return {
        ...state,
        {{EVOLVE_STATE}}
      };
    default:
      return state;
  }
}

export const handle{{NAME}}Command = CommandHandler({ evolve, initialState });
`,

  commandHandler: `
export function {{COMMAND_NAME_LOWERCASE}}(command: {{COMMAND_NAME}}, state: {{NAME}}State): {{EVENT_NAME}} {
  return {
    type: "{{EVENT_NAME}}",
    data: {
      {{EVENT_DATA}}
    },
  };
}`,

  eventCase: `    case "{{EVENT_NAME}}":
      return {
        ...state,
        {{STATE_UPDATE}}
      };`,
};
