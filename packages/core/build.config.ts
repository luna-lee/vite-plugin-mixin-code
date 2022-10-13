import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  clean: true,
  entries: [
    "./src/index",
    {
      builder: "mkdist",
      input: "./src/lib",
      outDir: "./dist/lib",
      
    },
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
});
