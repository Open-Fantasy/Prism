![PrismLogo](https://github.com/user-attachments/assets/586b3ec6-3b9b-4bb3-9897-e5edc51d2c1b)
## Dev Env
We recommend using VSCode as a development env. This is packaged with various workplace settings to aid in development. If not using VScode please take note of any sections in the readme for manual env setup.

## To Compile
Currently not in a buildable state

## To Test

### Unit Tests
`bun test`

### Network testing
There is a simple socket.io echo server run with `bun run tests/test_utils/echoserver/echo_server.ts`. Proper unit tests are TODO

### Browser Testing
`bun run browserTest`. This will build prism to `tests/browser_test/prism.js`. Open the index.html file in that directory to load the file.

## Flags
- `--cliMode`: allow for a type of command line interrupt for testing and debugging purposes. i.e `ctrl-p` will print the runtime stats if their collection is enabled. See full list below. NOTE: while this works with the bun builtin debugger it does not work for the vsCode debugger.

## Cli Interrupts
Note: These are only usable when testing directly with `bun run src/prism.ts`
- `ctrl-p`: will print the runtime stats if their collections is enabled.
