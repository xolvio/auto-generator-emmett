import { EmmettGenerator } from "./EmmettGenerator";
import { exampleModel } from "./example-model";

async function main() {
  const generator = new EmmettGenerator();
  await generator.generate(exampleModel);
  console.log("Code generation completed successfully!");
}

main().catch(console.error);
