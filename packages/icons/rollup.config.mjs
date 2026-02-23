import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    external: ["react", "react-dom", "react/jsx-runtime"],
    output: [
      {
        file: "dist/esm/index.js",
        format: "esm",
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: "src",
      },
      {
        file: "dist/cjs/index.js",
        format: "cjs",
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
  },
  {
    input: "dist/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
  },
];
