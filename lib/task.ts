export class Task {
  prerequisites: Array<Task>;
  private fn: Function;
  private name: string;

  constructor(fn: Function, name: string) {
    this.fn = fn;
    this.name = name;
    this.prerequisites = [];
  }

  addPrerequisite(p: Task) {
    this.prerequisites.push(p);
  }

  async run() {
    if (this.prerequisites.length > 0) {
      console
        .log(`Running prerequisites "${this.prerequisites.map(p => p.name)
          .join(", ")}"`);
    }
    for (const p of this.prerequisites) {
      await p.run();
    }
    console.log(`Running "${this.name}"`);
    await this.fn();
  }
}
