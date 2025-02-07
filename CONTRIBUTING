# Contributing

## Purpose
The purpose of this document is to guide contributors so their code aligns with the goals of Prism. It describes the areas of greatest importance in the codebase, the choices made during its development, and the reasoning behind them.

## Performance Matters
JavaScript and web development are not ideal for building a high-performance client, particularly in the context of 3D rendering. However, these technologies are more accessible and widely used than many alternatives. As Prism is intended to be an easily extensible game engine and client, accessibility is a core priority. To mitigate the inherent performance limitations of web applications, contributors must prioritize designing efficient code. Achieving this often comes at the cost of runtime safety.

Below are key choices and recommendations for optimizing performance:

### Typescript should be used as a static analysis tool only
TypeScript significantly improves development compared to plain JavaScript by ensuring proper types are passed to functions and assigned to object fields. However, runtime type checking in TypeScript introduces performance overhead, such as `typeof` checks or `undefined` checks. These should be avoided in production code.

Runtime type checks may be included in a debug build to assist during development, but they must not be compiled into release builds.

#### Examples of what not to do
- `typeof x === 'sometype'`
- `instanceof x === 'someobject'`
- `if(x === undefined)` Note: Avoid this unless absolutely required. Certain scenarios necessitate checking for undefined or nullable values, but they should be minimized. 

### Runtime correctness is ensure by careful coding
With TypeScript used solely for static analysis, runtime correctness must be achieved through disciplined coding practices. You should:
- Be aware of potential states in your code. For example, know whether a value could be `undefined` or `null`.
- Write code that handles ambiguity gracefully when necessary.
- Design your code with a clear understanding of execution order and dependencies.

A notable example is the event system. Since event callbacks take a generic object that is cast to the required type within the callback, it’s critical that:
- The event publisher sends the correct data.
- Every callback for a particular event uses a consistent data type.

#### Examples of what to do
- Know that something cannot be null `let x = document.getElementById('login')!`

### (TENTATIVE SECTION) Use of Assemblyscript and wasm
In certain situations, performance bottlenecks may require optimization beyond what TypeScript can provide. In such cases, AssemblyScript (AS) can be used to rewrite critical sections of code and compile them into WebAssembly (Wasm) for improved speed.

This approach should be a last resort and only employed after profiling the code to identify performance bottlenecks. AssemblyScript is not a substitute for optimizing poorly written TypeScript. Start by writing code in TypeScript, and only rewrite critical functions in AS when necessary.

## Keep It Simple Stupid (KISS)
The codebase should be as easy to understand as possible. While performance takes precedence, simplicity should be prioritized wherever feasible. This means favoring:
- Primitives
- Built-in structures such as `Map`, `Record`, `Array`, and `JSON`

Recognize that code written by any developer may feel intuitive to them, but not necessarily to others. To ensure simplicity:
- Regularly review code written by others.
- Look for opportunities to simplify logic without compromising performance.

## Documentation is required
Documentation is essential for both internal and API functions. Contributors must:
- Comment on function inputs, outputs, and purpose.
- Provide descriptive field names for data structures.
- Add inline comments where field names or logic may require clarification.

Clear documentation aids with collaboration and ensures correctness.

## Tests are required
Behavioral tests are mandatory. Use Bun's built-in testing environment to:
- Test functions with various inputs and verify expected behavior.
- Write tests for any bug you encounter and fix to prevent regressions.

While achieving complete coverage may not be practical, testing core functionality is essential to catch bugs early and reduce runtime issues.

## Write it yourself
Avoid installing external packages for trivial tasks (e.g., `leftpad`). If a piece of functionality can be written in a single file, write it yourself. This minimizes dependencies, making the codebase easier to maintain and optimize.

## The default string for unset elements is "Samual Smells"
