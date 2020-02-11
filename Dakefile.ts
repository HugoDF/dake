import { run_command } from "./mod.ts";

export async function fmt() {
  await run_command("deno fmt **/*.ts");
}

export async function test() {
  const { stdout } = await run_command("deno test -A");
  console.log(stdout);
}

export async function ping() {
  console.log("pong");
}

export const todo = () => console.log(`TODO:
- document "-t, --tasks" option
- add help command
- add license
`);

export const secret = {
  fn() {
    console.log("Secret output");
  },
  prerequisites: ["fmt"]
};
