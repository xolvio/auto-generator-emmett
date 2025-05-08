import { EmmettModel } from "./types";

export const exampleModel: EmmettModel = {
  name: "Counter",
  aggregates: [
    {
      name: "Counter",
      path: "src/aggregates/Counter/Counter",
      commands: [
        {
          name: "Increment",
          strategy: "LOAD_OR_NEW",
          idField: "id",
        },
        {
          name: "Decrement",
          strategy: "LOAD_OR_NEW",
          idField: "id",
        },
      ],
      events: [
        {
          name: "Incremented",
        },
        {
          name: "Decremented",
        },
      ],
    },
  ],
  transitions: [
    {
      name: "IncrementCounter",
      source: {
        type: "Command",
        entity: "Increment",
      },
      target: {
        type: "Event",
        entity: "Incremented",
      },
    },
    {
      name: "DecrementCounter",
      source: {
        type: "Command",
        entity: "Decrement",
      },
      target: {
        type: "Event",
        entity: "Decremented",
      },
    },
  ],
};
