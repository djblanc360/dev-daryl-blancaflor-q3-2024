import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar'; // https://www.npmjs.com/package/chokidar

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, 'components');
const sectionsDir = path.join(__dirname, 'sections');
const snippetsDir = path.join(__dirname, 'snippets');
const assetsDir = path.join(__dirname, 'assets');
const mainJsPath = path.join(__dirname, 'frontend', 'entrypoints', 'main.js');

const symlinkedPaths = new Set();

/**
 * Creates a symlink from srcPath to destPath
 * @typedef {import('fs').PathLike} PathLike
 * @param {PathLike} srcPath
 * @param {PathLike} destPath
 */
async function createSymlink(srcPath, destPath) {
  try {
    await fs.symlink(srcPath, destPath, 'file');
    symlinkedPaths.add(destPath);
    console.log(`Symlink created: ${destPath} -> ${srcPath}`);
  } catch (err) {
    console.error(`Error creating symlink for ${srcPath} -> ${destPath}:`, err);
  }
}

/**
 * Removes a symlink or file at destPath if it exists
 * @typedef {import('fs').PathLike} PathLike
 * @param {PathLike} destPath
 */
async function removeSymlink(destPath) {
  try {
    await fs.access(destPath);
    await fs.unlink(destPath);
    symlinkedPaths.delete(destPath);
    console.log(`Removed symlink or file: ${destPath}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Error removing symlink or file at ${destPath}:`, err);
    }
  }
}

/**
 * Updates the main.js file with an import statement for the given importPath
 * @typedef {import('fs').PathLike} PathLike
 * @param {string} importPath
 */
async function updateMainJs(importPath) {
  try {
    const mainJsContent = await fs.readFile(mainJsPath, 'utf8');
    if (!mainJsContent.includes(importPath)) {
      await fs.appendFile(mainJsPath, `\nimport '${importPath}';`);
      console.log(`main.js updated with: import '${importPath}';`);
    }
  } catch (err) {
    console.error(`Error updating main.js with ${importPath}:`, err);
  }
}

/**
 * Removes an import statement from the main.js file
 * @typedef {import('fs').PathLike} PathLike
 * @param {string} importPath
 */
async function removeFromMainJs(importPath) {
  try {
    let mainJsContent = await fs.readFile(mainJsPath, 'utf8');
    const importStatement = `import '${importPath}';`;
    if (mainJsContent.includes(importStatement)) {
      mainJsContent = mainJsContent.replace(importStatement, '').trim();
      await fs.writeFile(mainJsPath, mainJsContent);
      console.log(`main.js updated: removed import '${importPath}';`);
    }
  } catch (err) {
    console.error(`Error removing import '${importPath}' from main.js:`, err);
  }
}

/**
 * Handles file addition
 * @param {string} filePath
 */
async function handleFileAddition(filePath) {
  const relativePath = path.relative(componentsDir, filePath);
  const pathParts = relativePath.split(path.sep);
  const component = pathParts[0];
  const type = pathParts[1];
  const fileName = pathParts[pathParts.length - 1];

  if (type === 'sections' || type === 'snippets') {
    const destDir = type === 'sections' ? sectionsDir : snippetsDir;
    const destPath = path.join(destDir, fileName);

    await createSymlink(filePath, destPath);
  } else if (fileName.endsWith('.js')) {
    const newFileName = fileName === 'index.js' ? `${component}.js` : `${component}_${fileName}`;
    const destPath = path.join(assetsDir, newFileName);

    await createSymlink(filePath, destPath);
    await updateMainJs(`../../assets/${newFileName}`);
  }
}

/**
 * Handles file change
 * @param {string} filePath
 */
async function handleFileChange(filePath) {
  const relativePath = path.relative(componentsDir, filePath);
  const pathParts = relativePath.split(path.sep);
  const component = pathParts[0];
  const type = pathParts[1];
  const fileName = pathParts[pathParts.length - 1];

  if (type === 'sections' || type === 'snippets') {
    const destDir = type === 'sections' ? sectionsDir : snippetsDir;
    const destPath = path.join(destDir, fileName);
    console.log(`updating ${type} file: ${destPath}`);
    // await removeSymlink(destPath);
    // await createSymlink(filePath, destPath);
    if (!symlinkedPaths.has(destPath)) {
      await createSymlink(filePath, destPath);
    }
  } else if (fileName.endsWith('.js')) {
    const newFileName = fileName === 'index.js' ? `${component}.js` : `${component}_${fileName}`;
    const destPath = path.join(assetsDir, newFileName);
    console.log(`updating ${type} file: ${destPath}`);
    if (!symlinkedPaths.has(destPath)) {
      await createSymlink(filePath, destPath);
    }
  }
}

/**
 * Handles file removal
 * @param {string} filePath
 */
async function handleFileRemoval(filePath) {
  const relativePath = path.relative(componentsDir, filePath);
  const pathParts = relativePath.split(path.sep);
  const component = pathParts[0];
  const fileName = pathParts[pathParts.length - 1];

  if (fileName.endsWith('.js')) {
    const newFileName = fileName === 'index.js' ? `${component}.js` : `${component}_${fileName}`;
    const importPath = `../../assets/${newFileName}`;
    await removeFromMainJs(importPath);
    const destPath = path.join(assetsDir, newFileName);

    await removeSymlink(destPath);
  } else if (type === 'sections' || type === 'snippets') {
    const destDir = type === 'sections' ? sectionsDir : snippetsDir;
    const destPath = path.join(destDir, fileName);

    await removeSymlink(destPath);
  }
}

/**
 * Watches for changes in the components directory
 */
chokidar.watch(componentsDir, { persistent: true })
  .on('add', handleFileAddition)
  .on('change', debounce(handleFileChange,100))
  .on('unlink', handleFileRemoval)
  .on('error', error => console.error('Error watching files:', error));

/**
 * Sets up the initial symlinks and file copies
 */
(async function initialSetup() {
  try {
    const components = await fs.readdir(componentsDir, { withFileTypes: true });

    await Promise.all(components.map(async (component) => {
      if (!component.isDirectory()) return;
      
      const componentPath = path.join(componentsDir, component.name);
      const files = await fs.readdir(componentPath, { withFileTypes: true });

      await Promise.all(files.map(async (file) => {
        if (file.isDirectory()) {
          const subFiles = await fs.readdir(path.join(componentPath, file.name));
          await Promise.all(subFiles.map(async (subFile) => {
            const srcPath = path.join(componentPath, file.name, subFile);
            if (file.name === 'sections') {
              const destPath = path.join(sectionsDir, subFile);
              await removeSymlink(destPath);
              await createSymlink(srcPath, destPath);
            } else if (file.name === 'snippets') {
              const destPath = path.join(snippetsDir, subFile);
              await removeSymlink(destPath);
              await createSymlink(srcPath, destPath);
            }
          }));
        } else if (file.name.endsWith('.js')) {
          const srcPath = path.join(componentPath, file.name);
          const newFileName = file.name === 'index.js' ? `${component.name}.js` : `${component.name}_${file.name}`;
          const destPath = path.join(assetsDir, newFileName);
          await removeSymlink(destPath);
          await createSymlink(srcPath, destPath);
          await updateMainJs(`../../assets/${newFileName}`);
        }
      }));
    }));
  } catch (err) {
    console.error('Error during initial setup:', err);
  }
})();


function debounce(func, timeout){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
