const { args, cwd, exit } = Deno;
import { exists, log, parseFlags, ArgParsingOptions } from "./deps.ts";
import { Dake } from "./lib/dake.ts";
import { DakeFlags, TaskName } from "./lib/types.ts";

const flagConfig: Partial<ArgParsingOptions> = {
  alias: {
    "tasks": ["tasks", "t"]
  }
};

const getDakeConfig = (args: Array<string>): { flags: Partial<DakeFlags>;
  tasks: Array<TaskName>; } =>
{
  const flags = parseFlags(args, flagConfig);

  return { flags: flags as Partial<DakeFlags>, tasks: flags._ };
};

const DAKE_FILE_NAMES = ["Dakefile", "Dakefile.ts", "dakefile", "dakefile.ts"];

/**
 * Get path to Dake config file.
 */
async function findConfigFile(): Promise<string> {
  const attemptedPaths: Array<string> = [];
  let configPath: string;

  // Try to find Dakefile in current directory.
  for (const FILE_NAME of DAKE_FILE_NAMES) {
    configPath = `${cwd()}/${FILE_NAME}`;

    const fileExists = await exists(configPath);

    attemptedPaths.push(configPath);

    if (fileExists) {
      return configPath;
    }
  }

  throw new Error(`Configuration file not found at ${attemptedPaths.join(", ")
    }`);

  // TODO: crawl up the directories & attempt to find config file
}

export async function run(callArgs = args) {
  try {
    const configFilePath = await findConfigFile();
    log.info(`Config file found at ${configFilePath}`);
    const { flags, tasks } = getDakeConfig(callArgs);
    const d = new Dake(configFilePath, flags, tasks);
    await d.run();
  } catch (err) {
    log.error(`Top-level error caught: ${err.stack}`);
    exit(1);
  }
}

if (import.meta.main) {
  run();
}
