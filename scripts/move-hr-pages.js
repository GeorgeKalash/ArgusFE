const fs = require('fs');
const path = require('path');


const MODULE_PACKAGE_NAME = '@argus/module-hr';
const MODULE_FOLDER = 'module-hr';

const SALES_PAGES = [
  'aa-process-notification',
  'hr-leave-schedule',
  'hr-earned-leaves',
  'hr-leave-return',
  'hr-lr-one-or-more',
  'hr-lr-less',
  'hr-balance-adjustment',
  'lm-oba',
  'hr-overtime-profiles',
  'hr-att-settings',
  'hr-dsl-reason',
  'hr-day-types',
  'ta-biometric-devices',
  'hr-processed-punches',
  'hr-reset-tv',
  'hr-pending-punches',
  'ta-dsl',
  'hr-time-variations',
  'hr-attendance-day',
  'hr-daily-schedule',
  'hr-loans',
  'cs-folders',
  'hr-right-to-work',
  'comp-files',
  'hr-emp-chart',
  'resignation-request',
  'em-job-info',
  'hr-emp-penalty',
  'hr-salary',
  'hr-employee-list',
  'hr-emp-settings',
  'hr-custom-prop',
  'hr-emp-status',
  'hr-notice-periods',
  'hr-termination-reason',
  'hr-loan-types',
  'hr-relationship-types',
  'hr-bgcheck-type',
  'hr-bonus-types',
  'hr-salary-change-rsn',
  'hr-ent-deduction',
  'hr-certificate-lvl',
  'hr-sponsors',
  'ss-leave-reques',
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
