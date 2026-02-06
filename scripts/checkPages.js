const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APP_PAGES_DIR = path.join(ROOT, 'apps', 'main', 'src', 'pages');

const MAX_INDEX_LINES = 3; 

function analyzePages(dir, baseDir = APP_PAGES_DIR) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const files = entries.filter(e => e.isFile()).map(e => e.name);

  // --------------- CHECK 1: Extra Files ----------------
  const extraFiles = files.filter(name => name !== 'index.js');
  if (extraFiles.length > 0) {
    const rel = path.relative(baseDir, dir) || '.';
    console.log(`📁 ${rel} → Extra files: ${extraFiles.join(', ')}`);
  }

  // --------------- CHECK 2: index.js too long ----------------
  if (files.includes('index.js')) {
    const indexPath = path.join(dir, 'index.js');
    const content = fs.readFileSync(indexPath, 'utf8');
    const lineCount = content.split('\n').length;

    if (lineCount > MAX_INDEX_LINES) {
      const rel = path.relative(baseDir, dir) || '.';
      console.log(`⚠️  ${rel} → index.js has ${lineCount} lines (limit: ${MAX_INDEX_LINES})`);
    }
  }

  // recurse into subdirectories
  entries
    .filter(e => e.isDirectory())
    .forEach(subdir => {
      analyzePages(path.join(dir, subdir.name), baseDir);
    });
}

if (!fs.existsSync(APP_PAGES_DIR)) {
  console.error('Pages directory does not exist:', APP_PAGES_DIR);
  process.exit(1);
}

console.log('Scanning pages...\n');
analyzePages(APP_PAGES_DIR);
