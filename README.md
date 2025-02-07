<p align="center"><img src="https://github.com/user-attachments/assets/cc31802f-1785-4970-9f55-1bfa194ef259" width="420"/></p>
<p align="center">
  <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/Open-Fantasy/Prism">
  <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/Open-Fantasy/Prism/bun-test.yml?label=Unit%20Tests">
  <img alt="GitHub License" src="https://img.shields.io/github/license/Open-Fantasy/Prism">
</p>


# Developing with Prism
## Installation
`TODO`
## Importing
`TODO`
## FAQ
`TODO`

# Contributing to Prism

## Contribution Guidelines
We are always excited to see community contributions towards the Prism Engine, however, we need to make sure that the core ideologies within Prism are respected. As such, we ask all contributors keep the [Prism Design Philosphy](https://github.com/Open-Fantasy/Prism/blob/master/DesignPhilosophy.md) in mind when writing contributions.


## Development Container
We utilize [Dev Containers](https://containers.dev/) to help ensure contributors use matching settings across machines. If you opt to not utilize the development container, please make sure you set the appropriate settings in your IDE.

## Compilation
Prism is currently not in a compileable state.

## Testing

### Unit Tests
Unit Tests are configured through Buns integrated testing framework.
These tests can be run locally via `bun test`.

### Network testing
There is a simple socket.io echo server run with `bun run tests/test_utils/echoserver/echo_server.ts`. Proper unit tests are TODO

### Browser Testing
`bun run browserTest`. This will build prism to `tests/browser_test/prism.js`. Open the index.html file in that directory to load the file.

### Flags
- `--cliMode`: allow for a type of command line interrupt for testing and debugging purposes. i.e `ctrl-p` will print the runtime stats if their collection is enabled. See full list below. NOTE: while this works with the bun builtin debugger it does not work for the vsCode debugger.

### Cli Interrupts
Note: These are only usable when testing directly with `bun run src/prism.ts`
- `ctrl-p`: will print the runtime stats if their collections is enabled.
