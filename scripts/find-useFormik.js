#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
]);

const ALLOWED_EXT = new Set([".js", ".jsx", ".ts", ".tsx"]);

function isIgnoredDir(dirName) {
  return IGNORE_DIRS.has(dirName);
}

function walk(dir, results) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const ent of entries) {
    const full = path.join(dir, ent.name);

    if (ent.isDirectory()) {
      if (!isIgnoredDir(ent.name)) walk(full, results);
      continue;
    }

    if (!ent.isFile()) continue;
    if (!ALLOWED_EXT.has(path.extname(ent.name))) continue;

    let text;
    try {
      text = fs.readFileSync(full, "utf8");
    } catch {
      continue;
    }

    // must contain useFormik
    if (!/\buseFormik\b/.test(text)) continue;

    // exclude any file that contains useForm
    if (/\buseForm\b/.test(text)) continue;

    results.push(full);
  }
}

const results = [];
walk(root, results);

// print nicely, relative to root
results.sort();

for (const f of results) {
    const ext = path.extname(f);
    const base = path.basename(f, ext); // filename without extension
  
    if (base === "index") {
      // print full relative path
      console.log(path.relative(root, f));
    } else {
      // print only filename
      console.log(base);
    }
  }
  
  console.error(`\nFound: ${results.length} file(s)`);
