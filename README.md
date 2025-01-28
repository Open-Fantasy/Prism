# Prism

## Dev Env
We recomend using VSCode as a development env. This is packaged with various workplace settings to aid in development. If not using VScode please take note of any sections in the readme for manual env setup.

## To Compile
Currently not in a buildable state

## To Test
run `bun test`

### Network testing
There is a simple socket.io echo server run with `bun run tests/test_utils/echoserver/echo_server.ts`. Proper unit tests are TODO

## Flags
- `--cliMode`: allow for a type of command line interupt for testing and debugging purposes. i.e `ctrl-p` will print the runtime stats if their collection is enabled. See full list below. NOTE: while this works with the bun builtin debugger it does not work for the vsCode debugger.

## Cli Interupts
- `ctrl-p`: will print the runtime stats if their collections is enabled.
