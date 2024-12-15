import type { Options } from "tsup";
import { defineConfig } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/**/*.ts"],
  format: ["esm"],
  clean: true,
  dts: true,
  minify: true,
  target: "node20",
  ...options,
}));
