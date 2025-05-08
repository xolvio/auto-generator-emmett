import * as fs from "fs-extra";
import * as path from "path";
import { EmmettModel, FileDefinition, SerializedModelFile } from "./types";
import { EntityGenerator } from "./generators/EntityGenerator";
import {
  TransitionGenerator,
  TransitionInput,
} from "./generators/TransitionGenerator";
import { RootGenerator, RootInput } from "./generators/RootGenerator";
import { ContextGenerator, ContextInput } from "./generators/ContextGenerator";
import {
  StateHandlerGenerator,
  StateHandlerInput,
} from "./generators/StateHandlerGenerator";
import {
  CommandHandlerGenerator,
  CommandHandlerInput,
} from "./generators/CommandHandlerGenerator";
import {
  AggregateGenerator,
  InputData as AggregateInput,
} from "./generators/AggregateGenerator";

export class EmmettGenerator {
  private entityGenerator: EntityGenerator;
  private transitionGenerator: TransitionGenerator;
  private rootGenerator: RootGenerator;
  private contextGenerator: ContextGenerator;
  private stateHandlerGenerator: StateHandlerGenerator;
  private commandHandlerGenerator: CommandHandlerGenerator;
  private aggregateGenerator: AggregateGenerator;

  constructor() {
    this.entityGenerator = new EntityGenerator();
    this.transitionGenerator = new TransitionGenerator();
    this.rootGenerator = new RootGenerator();
    this.contextGenerator = new ContextGenerator();
    this.stateHandlerGenerator = new StateHandlerGenerator();
    this.commandHandlerGenerator = new CommandHandlerGenerator();
    this.aggregateGenerator = new AggregateGenerator();
  }

  async generate(model: EmmettModel, outputDir: string): Promise<void> {
    const files: FileDefinition[] = [];

    // First pass: Generate all files
    files.push(...this.generateRootFiles(model));
    files.push(...this.generateContextFiles(model));
    files.push(...this.generateAggregateFiles(model));
    files.push(...this.generateCommandHandlerFiles(model));
    files.push(...this.generateStateHandlerFiles(model));
    files.push(...this.generateTransitionFiles(model));

    // Create all directories and files
    for (const file of files) {
      const fullPath = path.join(outputDir, file.outputFilePath);
      const dirPath = path.dirname(fullPath);

      await fs.ensureDir(dirPath);

      if (file.type === "directory") {
        await fs.ensureDir(fullPath);
        // Create transitions folder for all entity folders (not transitions themselves)
        if (!file.outputFilePath.startsWith("transitions/")) {
          const transitionsPath = path.join(fullPath, "transitions");
          await fs.ensureDir(transitionsPath);
        }
      } else {
        await fs.writeFile(fullPath, file.content, "utf8");
      }
    }

    // Second pass: Create symlinks for transitions
    await this.createTransitionSymlinks(model);
  }

  private generateRootFiles(model: EmmettModel): FileDefinition[] {
    const rootInput: RootInput = {
      name: model.name,
      aggregates: model.aggregates.map((a: any) => ({
        name: a.name,
        path: a.path,
      })),
      paths: {
        base: "src",
      },
    };

    return this.rootGenerator.generate(rootInput);
  }

  private generateContextFiles(model: EmmettModel): FileDefinition[] {
    const contextInput: ContextInput = {
      name: model.name,
      aggregates: model.aggregates.map((a: any) => ({
        name: a.name,
        path: a.path,
      })),
      paths: {
        base: "src",
      },
    };

    return this.contextGenerator.generate(contextInput);
  }

  private generateAggregateFiles(model: EmmettModel): FileDefinition[] {
    const files: FileDefinition[] = [];

    for (const aggregate of model.aggregates) {
      const aggregateInput: AggregateInput = {
        name: aggregate.name,
        commands: aggregate.commands,
        events: aggregate.events,
        paths: {
          base: `src/aggregates/${aggregate.name}`,
        },
      };

      files.push(...this.aggregateGenerator.generate(aggregateInput));
    }

    return files;
  }

  private generateCommandHandlerFiles(model: EmmettModel): FileDefinition[] {
    const files: FileDefinition[] = [];

    for (const aggregate of model.aggregates) {
      for (const command of aggregate.commands) {
        const commandHandlerInput: CommandHandlerInput = {
          name: command.name,
          strategy: command.strategy || "LOAD_OR_NEW",
          aggregateName: aggregate.name,
          aggregateIdField: command.idField || "id",
          paths: {
            aggregate: `src/aggregates/${aggregate.name}/${aggregate.name}`,
            command: `src/commands/${command.name}`,
            repository: "src/repositories/Repository",
          },
        };

        files.push(
          ...this.commandHandlerGenerator.generate(commandHandlerInput)
        );
      }
    }

    return files;
  }

  private generateStateHandlerFiles(model: EmmettModel): FileDefinition[] {
    const files: FileDefinition[] = [];

    for (const aggregate of model.aggregates) {
      for (const event of aggregate.events) {
        const stateHandlerInput: StateHandlerInput = {
          name: event.name,
          aggregateName: aggregate.name,
          paths: {
            aggregate: `src/aggregates/${aggregate.name}/${aggregate.name}`,
            state: `src/states/${event.name}`,
            repository: "src/repositories/Repository",
          },
        };

        files.push(...this.stateHandlerGenerator.generate(stateHandlerInput));
      }
    }

    return files;
  }

  private generateTransitionFiles(model: EmmettModel): FileDefinition[] {
    const files: FileDefinition[] = [];

    for (const transition of model.transitions) {
      const transitionInput: TransitionInput = {
        name: transition.name,
        source: {
          type: transition.source.type,
          entity: transition.source.entity,
          path: `src/${transition.source.type.toLowerCase()}s/${transition.source.entity}`,
        },
        target: {
          type: transition.target.type,
          entity: transition.target.entity,
          path: `src/${transition.target.type.toLowerCase()}s/${transition.target.entity}`,
        },
        paths: {
          base: "src/transitions",
        },
      };

      files.push(...this.transitionGenerator.generate(transitionInput));
    }

    return files;
  }

  private async createTransitionSymlinks(model: EmmettModel): Promise<void> {
    for (const transition of model.transitions) {
      const sourcePath = `src/${transition.source.type.toLowerCase()}s/${transition.source.entity}`;
      const targetPath = `src/${transition.target.type.toLowerCase()}s/${transition.target.entity}`;
      const transitionPath = `src/transitions/${transition.source.type.toLowerCase()}--${transition.source.entity}__${transition.target.type.toLowerCase()}--${transition.target.entity}`;

      // Create symlink from source to transition
      const sourceToTransitionPath = path.join(sourcePath, transition.name);
      await fs.ensureSymlink(transitionPath, sourceToTransitionPath);

      // Create symlink from target to transition
      const targetToTransitionPath = path.join(targetPath, transition.name);
      await fs.ensureSymlink(transitionPath, targetToTransitionPath);
    }
  }
}
