import { Logger } from "./types.ts";

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
    if (this.prerequisites.length > 0) {
      this.logger
        .log(`Running prerequisites "${this.prerequisites.map(p => p.name)
          .join(", ")}"`);
    }
    for (const p of this.prerequisites) {
      await p.run();
    }
    this.logger.log(`Running "${this.name}"`);
    await this.fn();
  }
}
