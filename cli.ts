const { args, cwd, exit } = Deno;
import { exists } from "./deps.ts";
import { Dake } from "./lib/dake.ts";

const DAKE_FILE_NAMES = ["Dakefile"];

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

export async function run() {
  try {
    const configFilePath = await findConfigFile();
    console.info(`Config file found at ${configFilePath}`);
    const d = new Dake(configFilePath);
    await d.run(args);
  } catch (err) {
    console.error(`Top-level error caught: ${err.stack}`);
    exit(1);
  }
}

run();
