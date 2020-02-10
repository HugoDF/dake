function parse_cmd(cmd: string): Array<string> {
  return cmd.split(' ').filter(Boolean);
}

interface CommandOutput {
  stdout: string,
  stderr: string,
  status: Deno.ProcessStatus
}

export async function run_command(cmd: string, options?: Deno.RunOptions): Promise<CommandOutput> {
  const p = Deno.run({
    ...options || {},
    args: parse_cmd(cmd),
    stdout: "piped",
    stderr: "piped",
  });
  const status = await p.status();
  const dec = new TextDecoder();
  const stdout = dec.decode(await p.output());
  const stderr = dec.decode(await p.stderrOutput());
  
  return {
    stdout,
    stderr,
    status,
  }
}