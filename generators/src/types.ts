export interface SerializedModelFile {
  name: string;
  content: string;
}

export interface FileDefinition {
  className: string;
  outputFilePath: string;
  content: string;
  type: "file" | "directory";
}

export interface EmmettModel {
  name: string;
  aggregates: Aggregate[];
  transitions: Transition[];
}

export interface Aggregate {
  name: string;
  path: string;
  commands: Command[];
  events: Event[];
}

export interface Command {
  name: string;
  strategy?: "LOAD_OR_ERROR" | "LOAD_OR_NEW" | "CREATE_OR_ERROR";
  idField?: string;
}

export interface Event {
  name: string;
}

export interface Transition {
  name: string;
  source: {
    type: string;
    entity: string;
  };
  target: {
    type: string;
    entity: string;
  };
}
