# dake

TypeScript build tool, similar to Jake, Make or Rake. Built to work with Deno.


## Installation

> Tested with Deno v0.32 and tagged under v0.32.0-alpha.2

```sh
deno install --allow-read --allow-run dake https://raw.githubusercontent.com/HugoDF/dake/v0.32.0-alpha.2/cli.ts
```

You should then be able to run `dake` and get an error since there is no Dakefile in the directory you're in.

```sh
Top-level error caught: Error: Configuration file not found
```


## Dakefile (configuration)

A Dakefile is a Deno-runnable TypeScript file with the following allows filenames: `Dakefile`, `Dakefile.ts`, `dakefile.ts`.

Each named export (task) eg. `export const ping = () => console.log('pong');` is interpreted as a function, `dake ping` will output `pong`.

Each export can also have a list of pre-requisites using `ping.prerequisites = ['hello']` syntax.

See [github.com/HugoDF/dake/blob/master/Dakefile.ts](https://github.com/HugoDF/dake/blob/master/Dakefile.ts)
