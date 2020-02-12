import { test, assert, assertEquals, exists } from "./dev_deps.ts";
import { run } from "./mod.ts";

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
): Promise<[Function]> => {
  const enc = new TextEncoder();
  const dir = await Deno.makeTempDir();
  const filePath = `${dir}/${fileName}`;
  await Deno.writeFile(filePath, enc.encode(content));
  Deno.chdir(dir);
  return [() => Deno.remove(filePath)];
};

test(async function testAllowedFileNames() {
  for (const filename of ["Dakefile", "Dakefile.ts", "dakefile",
    "dakefile.ts"])
  {
    const [cleanup] = await setupDakefile(`
      export function hello() {}
    `, filename);
    await run(["hello"]);
    await cleanup();
  }
});

test(async function testHello() {
  const [cleanup] = await setupDakefile(`
    export function hello() {}
  `);
  await run(["hello"]);
  await cleanup();
});

test(async function testWritesFiles() {
  const tmpDir = await Deno.makeTempDir();
  const tmpPath = `${tmpDir}/file`;
  const [cleanup] = await setupDakefile(`
    export async function write() {
      await Deno.writeFile(
        "${tmpPath}",
        new TextEncoder().encode('Written')
      );
    }
  `);
  await run(["write"]);
  assert(await exists(tmpPath));
  const actual = new TextDecoder().decode(await Deno.readFile(tmpPath));
  await cleanup();
  assertEquals(actual, "Written");
});

test(async function prerequisitesStringArray() {
  const [cleanup] = await setupDakefile(`
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
  await run(["run"]);
  await cleanup();
  assert(calls.length > 0);
  assertEquals(calls, [
    "pre1 call",
    "pre2 call",
    "run call"
  ]);
});

test(async function prerequisitesFunctionArray() {
  const [cleanup] = await setupDakefile(`
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
  await run(["run"]);
  await cleanup();
  assert(calls.length > 0);
  assertEquals(calls, [
    "pre1 call",
    "pre2 call",
    "run call"
  ]);
});
