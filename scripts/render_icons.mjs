import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const iconDir = resolve(rootDir, "public", "icons");
const svgPath = resolve(iconDir, "icon.svg");

mkdirSync(iconDir, { recursive: true });

const svg = readFileSync(svgPath, "utf8");
const sizes = [16, 32, 48, 128];

for (const size of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: size,
    },
  });
  const pngData = resvg.render().asPng();
  const outPath = resolve(iconDir, `icon-${size}.png`);
  writeFileSync(outPath, pngData);
  process.stdout.write(`wrote ${outPath}\n`);
}
