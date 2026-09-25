#!/usr/bin/env node
/**
 * After `next build`, copy the static assets the standalone server needs
 * (public/ and .next/static/) into .next/standalone so it runs on its own.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");
if (!fs.existsSync(standalone)) {
  console.log("postbuild: no standalone output (skipping)");
  process.exit(0);
}
fs.cpSync(path.join(root, "public"), path.join(standalone, "public"), { recursive: true });
fs.cpSync(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"), { recursive: true });
console.log("postbuild: standalone server ready in .next/standalone");
