import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const index = readFileSync(resolve(root, "index.html"), "utf8");
const data = readFileSync(resolve(root, "data.js"), "utf8");
const references = new Set();

for (const source of [index, data]) {
  for (const match of source.matchAll(/(?:href|src|image):?\s*=*\s*["'](\.\/[^"'#?]+(?:\?[^"'#]+)?)["']/g)) {
    references.add(match[1].split("?")[0]);
  }
}

const missing = [...references].filter((reference) => !existsSync(resolve(root, reference)));
if (missing.length) {
  console.error(`Missing local files:\n${missing.join("\n")}`);
  process.exit(1);
}

const required = [
  'meta name="description"',
  'meta property="og:title"',
  'meta property="og:url"',
  'meta property="og:image"',
  'meta name="twitter:card"',
  'link rel="canonical"',
  'link rel="manifest"',
];
const missingMetadata = required.filter((value) => !index.includes(value));
if (missingMetadata.length) {
  console.error(`Missing production metadata:\n${missingMetadata.join("\n")}`);
  process.exit(1);
}

console.log(`Validated ${references.size} local references and ${required.length} metadata requirements.`);
