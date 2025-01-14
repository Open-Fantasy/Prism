import dts from "bun-plugin-dts";

await Bun.build({
  entrypoints: ["./src/Prism.ts"],
  outdir: "./build",
  plugins: [dts()],
});
