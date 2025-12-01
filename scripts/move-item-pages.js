const fs = require('fs');
const path = require('path');


const MODULE_PACKAGE_NAME = '@argus/module-inventory';
const MODULE_FOLDER = 'module-inventory';

const SALES_PAGES = [
  'iv-rebuildAC',
  'migrate-barcode-data',
  'iv-gen-fyo',
  'iv-rebuildInventory',
  'iv-collections',
  'iv-category-levels',
  'iv-item-sizes',
  'site-groups',
  'iv-serials-tracking',
  'iv-metal-color',
  'iv-serial-profiles',
  'iv-lot-category',
  'iv-settings',
  'iv-user-defined',
  'iv-item-groups',
  'iv-fy',
  'iv-metals',
  'iv-properties',
  'iv-categories',
  'iv-measurements',
  'iv-draft-tfr-dtd',
  'iv-adj-dtd',
  'iv-tfr-dtd',
  'iv-ava-by-site',
  'iv-ava-cross-tab',
  'iv-ava',
];

const ROOT = path.resolve(__dirname, '..');
const APP_PAGES_DIR = path.join(ROOT, 'apps', 'main', 'src', 'pages');
const MODULE_PAGES_DIR = path.join(ROOT, 'packages', MODULE_FOLDER, 'src', 'pages');

function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

function moveFolder(srcDir, dstDir) {
  ensureDir(path.dirname(dstDir));
  fs.renameSync(srcDir, dstDir);
}

function moveFile(srcFile, dstFile) {
  ensureDir(path.dirname(dstFile));
  fs.renameSync(srcFile, dstFile);
}

function createWrapperFile(pageName, isFolder) {
  const wrapperPath = isFolder
    ? path.join(APP_PAGES_DIR, pageName, 'index.js')
    : path.join(APP_PAGES_DIR, `${pageName}.js`);

  const moduleImportPath = `${MODULE_PACKAGE_NAME}/src/pages/${pageName}`;

  const content = `// AUTO-GENERATED WRAPPER – uses code from ${moduleImportPath}
export { default } from '${moduleImportPath}';
`;

  ensureDir(path.dirname(wrapperPath));

  if (fs.existsSync(wrapperPath)) {
    console.warn(`  ⚠ Wrapper already exists, skipping: ${wrapperPath}`);
    return;
  }

  console.log(`  Creating wrapper: ${wrapperPath}`);
  fs.writeFileSync(wrapperPath, content, 'utf8');
}

function processPage(pageName) {
  console.log(`\n=== Processing page: ${pageName} ===`);

  const folderPath = path.join(APP_PAGES_DIR, pageName);
  const filePath = path.join(APP_PAGES_DIR, `${pageName}.js`);
  const moduleFolderTarget = path.join(MODULE_PAGES_DIR, pageName);
  const moduleFileTarget = path.join(MODULE_PAGES_DIR, `${pageName}.js`);

  const folderExists = fs.existsSync(folderPath);
  const fileExists = fs.existsSync(filePath);

  if (!folderExists && !fileExists) {
    console.warn(`  ⚠ No folder or file found for page "${pageName}" in ${APP_PAGES_DIR}`);
    return;
  }

  if (folderExists) {
    if (fs.existsSync(moduleFolderTarget) || fs.existsSync(moduleFileTarget)) {
      console.warn(`  ⚠ Target already exists in module, skipping move for "${pageName}"`);
    } else {
      moveFolder(folderPath, moduleFolderTarget);
    }

    createWrapperFile(pageName, true);
    return;
  }

  if (fileExists) {
    if (fs.existsSync(moduleFolderTarget) || fs.existsSync(moduleFileTarget)) {
      console.warn(`  ⚠ Target already exists in module, skipping move for "${pageName}"`);
    } else {
      moveFile(filePath, moduleFileTarget);
    }

    createWrapperFile(pageName, false);
    return;
  }
}

function main() {
  ensureDir(MODULE_PAGES_DIR);

  SALES_PAGES.forEach(processPage);
}

main();
