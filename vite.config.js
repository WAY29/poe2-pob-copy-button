import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const entries = {
  content: {
    entry: "src/content-script.js",
    name: "content-script",
    emptyOutDir: true,
  },
  background: {
    entry: "src/background.js",
    name: "background",
    emptyOutDir: false,
  },
  "page-hook": {
    entry: "src/page-hook.js",
    name: "page-hook",
    emptyOutDir: false,
  },
};

export default ({ mode }) => {
  const target = entries[mode] || entries.content;
  return {
    publicDir: "public",
    build: {
      outDir: "dist",
      emptyOutDir: target.emptyOutDir,
      target: "es2017",
      rollupOptions: {
        input: resolve(rootDir, target.entry),
        output: {
          format: "iife",
          entryFileNames: `${target.name}.js`,
          chunkFileNames: "chunks/[name].js",
          assetFileNames: "[name][extname]",
          inlineDynamicImports: true,
        },
      },
    },
  };
};
