#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const PACKAGES_DIR = path.join(ROOT, "packages");

// --- CONFIG ---
const MODULE_PREFIX = "module-";
const PAGES_REL = ["src", "pages"];            // where pages live inside each module
const WINDOWS_DIR_NAMES = ["window", "windows"]; // match Window or Windows (case-insensitive)

// We’ll accept either forms/form OR forms (because your example has forms directly)
const FORM_TARGET_CHAINS = [
  ["forms", "form"],
  ["forms"],
];

// count only these extensions as "JS files"
const JS_EXTS = new Set([".js"]); // add ".jsx" if you need

const IGNORE_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", "out", "coverage"]);

// --- helpers ---
function readDirSafe(p) {
  try { return fs.readdirSync(p, { withFileTypes: true }); }
  catch { return []; }
}
function isDir(p) {
  try { return fs.statSync(p).isDirectory(); }
  catch { return false; }
}
function toLowerParts(p) {
  return p.split(path.sep).filter(Boolean).map(s => s.toLowerCase());
}
function joinSafe(...parts) {
  return path.join(...parts.filter(Boolean));
}

function findChildDirCaseInsensitive(parent, childNameLower) {
  for (const e of readDirSafe(parent)) {
    if (e.isDirectory() && e.name.toLowerCase() === childNameLower) {
      return path.join(parent, e.name);
    }
  }
  return null;
}

function findFormTargetDir(pageDir) {
  // Try each chain in order: forms/form then forms
  for (const chain of FORM_TARGET_CHAINS) {
    let cur = pageDir;
    let ok = true;
    for (const seg of chain) {
      const next = findChildDirCaseInsensitive(cur, seg.toLowerCase());
      if (!next) { ok = false; break; }
      cur = next;
    }
    if (ok) return cur; // absolute path to target folder
  }
  return null;
}

function hasWindowsFolder(pageDir) {
  return WINDOWS_DIR_NAMES.some(name => !!findChildDirCaseInsensitive(pageDir, name));
}

function jsFilesInDirOnly(dir) {
  return readDirSafe(dir)
    .filter(e => e.isFile())
    .map(e => e.name)
    .filter(name => JS_EXTS.has(path.extname(name).toLowerCase()));
}

// Walk directories under a root
function walkDirs(rootDir, onDir) {
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    const base = path.basename(current);
    if (IGNORE_DIRS.has(base)) continue;

    onDir(current);

    for (const e of readDirSafe(current)) {
      if (!e.isDirectory()) continue;
      if (IGNORE_DIRS.has(e.name)) continue;
      stack.push(path.join(current, e.name));
    }
  }
}

function getModuleDirs() {
  return readDirSafe(PACKAGES_DIR)
    .filter(e => e.isDirectory() && e.name.startsWith(MODULE_PREFIX))
    .map(e => path.join(PACKAGES_DIR, e.name));
}

// --- main ---
if (!isDir(PACKAGES_DIR)) {
  console.error(`❌ Not found: ${PACKAGES_DIR}`);
  process.exit(1);
}

const modules = getModuleDirs();
if (modules.length === 0) {
  console.log("No module-* folders found under /packages.");
  process.exit(0);
}

let total = 0;

for (const moduleDir of modules) {
  const pagesDir = joinSafe(moduleDir, ...PAGES_REL);
  if (!isDir(pagesDir)) continue;

  const matches = [];

  walkDirs(pagesDir, (dir) => {
    // Only consider "page folders" that directly contain Windows/ + forms(/form)
    if (!hasWindowsFolder(dir)) return;

    const formTarget = findFormTargetDir(dir);
    if (!formTarget) return;

    const jsFiles = jsFilesInDirOnly(formTarget);
    if (jsFiles.length === 1) {
      matches.push({
        pageFolder: dir,
        windowsFolder: findChildDirCaseInsensitive(dir, "windows") || findChildDirCaseInsensitive(dir, "window"),
        formFolder: formTarget,
        file: path.join(formTarget, jsFiles[0]),
      });
    }
  });

  if (matches.length) {
    total += matches.length;
    console.log(`\n✅ ${path.basename(moduleDir)} (${matches.length})`);
    for (const m of matches) {
      console.log(`- Page:     ${path.relative(ROOT, m.pageFolder)}`);
      console.log(`  Windows:  ${path.relative(ROOT, m.windowsFolder)}`);
      console.log(`  Form dir: ${path.relative(ROOT, m.formFolder)}`);
      console.log(`  JS file:  ${path.relative(ROOT, m.file)}`);
    }
  }
}

if (!total) {
  console.log("No matches found.");
  console.log("Tip: if your single file is .jsx, add '.jsx' to JS_EXTS.");
}
