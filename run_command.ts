function parse_cmd(cmd: string): Array<string> {
  return cmd.split(' ').filter(Boolean);
}

interface CommandOutput {
  output: string,
  status: Deno.ProcessStatus
}

export async function run_command(cmd: string, options?: Deno.RunOptions): Promise<CommandOutput> {
  const p = Deno.run({
    ...options || {},
    args: parse_cmd(cmd),
    stdout: "piped",
  });
  const status = await p.status();
  const dec = new TextDecoder();
  const output = dec.decode(await p.output());
  
  return {
    output,
    status,
  }
}