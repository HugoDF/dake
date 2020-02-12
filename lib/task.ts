import { Logger } from "../deps.ts";

export class Task {
  prerequisites: Array<Task>;
  private fn: Function;
  private name: string;
  private logger: Logger;

  constructor(fn: Function, name: string, logger: Logger) {
    this.fn = fn;
    this.name = name;
    this.logger = logger;
    this.prerequisites = [];
  }

  addPrerequisite(p: Task) {
    this.prerequisites.push(p);
  }

  async run() {
    this.logger.info(`Running "${this.name}"`);
    if (this.prerequisites.length > 0) {
      this.logger
        .info(`Running "${this.name}" prerequisite(s) "${this.prerequisites
          .map(p => p.name)
          .join(", ")}"`);
    }
    for (const p of this.prerequisites) {
      await p.run();
    }
    await this.fn();
    this.logger.info(`Completed "${this.name}"`);
  }
}
