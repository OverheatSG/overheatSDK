// Cross-platform copy of runtime JSON assets (IDLs, ABIs) into dist.
// Replaces the previous shell one-liner that relied on `mkdir -p`/`cp`,
// which fail under Windows cmd.exe when npm runs build scripts.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
// [sourceDir, destDir] pairs, relative to the js/ package root.
const pairs = [
  ["lib/sol", "dist/lib/sol"],
  ["lib/evm", "dist/lib/evm"],
];

for (const [src, dest] of pairs) {
  const srcDir = path.join(root, src);
  const destDir = path.join(root, dest);
  if (!fs.existsSync(srcDir)) continue;
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    if (!file.endsWith(".json")) continue;
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    console.log(`copied ${src}/${file} -> ${dest}/${file}`);
  }
}
