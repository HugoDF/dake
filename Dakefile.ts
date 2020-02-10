import { run_command } from "./mod.ts";

export async function fmt() {
  await run_command("deno fmt **/*.ts");
}

export async function test() {
  const { stdout } = await run_command("cat ./dist/foo");
  console.log(stdout);
}

test.prerequisites = [echo];

async function echo() {
  await run_command("mkdir -p ./dist");
  const data = new TextEncoder().encode("Hello world\n");
  await Deno.writeFile("./dist/foo", data);
}

export const secret = {
  fn() {
    console.log("Secret output");
  },
  prerequisites: ["fmt"]
};
