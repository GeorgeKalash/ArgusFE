const fs = require('fs');
const path = require('path');

// Adjust this depending on where this file lives:
// If this script is in ArgusFE/scripts/checkPages.js, ROOT will be ArgusFE
const ROOT = path.resolve(__dirname, '..');
const APP_PAGES_DIR = path.join(ROOT, 'apps', 'main', 'src', 'pages');

function findPagesWithExtraFiles(dir, baseDir = APP_PAGES_DIR) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name);

  // all files except index.js
  const otherFiles = files.filter((name) => name !== 'index.js');

  if (otherFiles.length > 0) {
    const rel = path.relative(baseDir, dir) || '.';
    console.log(`📁 ${rel} has extra files: ${otherFiles.join(', ')}`);
  }

  // Recurse into subdirectories
  entries
    .filter((e) => e.isDirectory())
    .forEach((dirent) => {
      const subDir = path.join(dir, dirent.name);
      findPagesWithExtraFiles(subDir, baseDir);
    });
}

if (!fs.existsSync(APP_PAGES_DIR)) {
  console.error('Pages directory does not exist:', APP_PAGES_DIR);
  process.exit(1);
}

console.log('Scanning:', APP_PAGES_DIR);
findPagesWithExtraFiles(APP_PAGES_DIR);
