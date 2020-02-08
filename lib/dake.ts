import { Task } from "./task.ts";

export class Dake {
  private configPath: string;

  constructor(configPath: string) {
    this.configPath = configPath;
  }

  async run(args: Array<string>): Promise<void> {
    // read Dakefile with an ES import()
    const dakeConfig = await import(this.configPath);

    // loads tasks & make them live -> new Task(taskDef)
    const tasks: { [taskName: string]: Task; } = {};
    for (const taskName in dakeConfig) {
      if (typeof dakeConfig[taskName] === "function") {
        tasks[taskName] = new Task(dakeConfig[taskName], taskName);
      } else if (typeof dakeConfig[taskName].fn === "function") {
        tasks[taskName] = new Task(dakeConfig[taskName].fn, taskName);
      }
    }

    // loads pre-requisites & adds them to tasks
    for (const taskName in dakeConfig) {
      for (const preTask of dakeConfig[taskName].prerequisites || []) {
        if (typeof preTask === "string" && tasks[preTask]) {
          tasks[taskName].addPrerequisite(tasks[preTask]);
        } else if (typeof preTask === "function") {
          if (tasks[preTask.name]) {
            tasks[taskName].addPrerequisite(tasks[preTask.name]);
          } else {
            tasks[taskName].addPrerequisite(new Task(preTask, preTask.name));
          }
        } else {
          console
            .warn(`Attempting to set "${preTask}" as prerequisite to "${
              taskName}", "${preTask}" doesn't exist, this will be a no-op.`);
        }
      }
    }

    const definedTaskNames: Array<string> = Object.keys(tasks);

    // run the relevant task (Task#run knows what prerequisites to run)
    // TODO: run multiple tasks?
    // TODO: subtasks
    // TODO: Make-like builds: if A is run and B depends on the output of A, run B after A completes
    try {
      const requestedTasks: Array<string> = args.map(a => a.trim());
      if (requestedTasks.some(t => !definedTaskNames.includes(t))) {
        // handle error with requesting an undefined task
      }
      await Promise.all(requestedTasks.map(t => tasks[t].run()));
    } catch (error) {
      console.error(error.stack);
    }
  }
}
