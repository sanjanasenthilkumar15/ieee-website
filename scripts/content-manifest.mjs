#!/usr/bin/env node
/**
 * Writes src/content/image-manifest.json with the pixel size of every image
 * in public/content. The website's offline/demo content (used before Sanity
 * is configured) needs these to lay out images without layout shift.
 *
 *   npm run content:manifest   # run after adding images to public/content
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..");
const DIR = join(ROOT, "public", "content");
const out = {};

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(jpe?g|png|webp|gif)$/i.test(name)) files.push(p);
  }
}
const files = [];
walk(DIR);
files.sort();
for (const f of files) {
  const { width, height } = await sharp(f).metadata();
  out[relative(DIR, f).split(sep).join("/")] = [width, height];
}
writeFileSync(join(ROOT, "src", "content", "image-manifest.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`image-manifest.json: ${files.length} images`);
