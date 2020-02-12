export {
  exists
} from "https://deno.land/std/fs/mod.ts";

export {
  parse as parseFlags,
  ArgParsingOptions
} from "https://deno.land/std/flags/mod.ts";

import { getLogger } from "https://deno.land/std/log/mod.ts";
export const log = getLogger("default");

export {
  Logger
} from "https://deno.land/std/log/logger.ts";
