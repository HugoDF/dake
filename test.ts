import { test, assert, assertEquals, exists } from "./dev_deps.ts";
import { Dake } from "./lib/dake.ts";

/**
 * Sets up a Dakefile in a tmp directory
 * 
 * @param content - file contents
 * @param fileName - Optional, file name (defaults to 'Dakefile')
 * @returns filePath
 */
const setupDakefile = async (
  content: string,
  fileName: string = "Dakefile"
): Promise<[string, Function]> => {
  const enc = new TextEncoder();
  const dir = await Deno.makeTempDir();
  const filePath = `${dir}/${fileName}`;
  await Deno.writeFile(filePath, enc.encode(content));
  return [filePath, () => Deno.remove(filePath)];
};

const noop = () => {};

const mockLogger: any = {
  ...console,
  error: (...args) => {
    throw new Error(`Error called with: ${JSON.stringify(args)}`);
  },
  warn: (...args) => {
    console.error(args);
  },
  info: noop,
  log: noop
};

test(async function testAllowedFileNames() {
  for(const filename of ['Dakefile', 'Dakefile.ts', 'dakfile.ts']) {
    const [configPath, cleanup] = await setupDakefile(`
      export function hello() {}
    `, filename);
    const instance = new Dake(configPath, mockLogger);
    await instance.run(["hello"]);
    await cleanup();
  }
})

test(async function testHello() {
  const [configPath, cleanup] = await setupDakefile(`
    export function hello() {}
  `);
  const instance = new Dake(configPath, mockLogger);
  await instance.run(["hello"]);
  await cleanup();
});

test(async function testWritesFiles() {
  const tmpDir = await Deno.makeTempDir();
  const tmpPath = `${tmpDir}/file`;
  const [configPath, cleanup] = await setupDakefile(`
    export async function write() {
      await Deno.writeFile(
        "${tmpPath}",
        new TextEncoder().encode('Written')
      );
    }
  `);
  const instance = new Dake(configPath, mockLogger);
  await instance.run(["write"]);
  assert(await exists(tmpPath));
  const actual = new TextDecoder().decode(await Deno.readFile(tmpPath));
  await cleanup();
  assertEquals(actual, "Written");
});

test(async function prerequisitesStringArray() {
  const [configPath, cleanup] = await setupDakefile(`
    export async function run() {
      console.test('run call');
    }
    export function pre1() {
      console.test('pre1 call');
    }
    export function pre2() {
      console.test('pre2 call');
    }
    run.prerequisites = ['pre1', 'pre2'];
  `);
  let calls: string[] = [];
  (console as any).test = (arg: string) => {
    calls.push(arg);
  };
  const instance = new Dake(
    configPath,
    mockLogger
  );
  await instance.run(["run"]);
  await cleanup();
  assert(calls.length > 0);
  assertEquals(calls, [
    "pre1 call",
    "pre2 call",
    "run call"
  ]);
});

test(async function prerequisitesFunctionArray() {
  const [configPath, cleanup] = await setupDakefile(`
    export async function run() {
      console.test('run call');
    }
    function pre1() {
      console.test('pre1 call');
    }
    function pre2() {
      console.test('pre2 call');
    }
    run.prerequisites = [pre1, pre2];
  `);
  let calls: string[] = [];
  (console as any).test = (arg: string) => {
    calls.push(arg);
  };
  const instance = new Dake(
    configPath,
    mockLogger
  );
  await instance.run(["run"]);
  await cleanup();
  assert(calls.length > 0);
  assertEquals(calls, [
    "pre1 call",
    "pre2 call",
    "run call"
  ]);
});
