import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar'; // https://www.npmjs.com/package/chokidar

// my custom bundler, yeah I know I could've just used terser
import { bundler } from './bundler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, 'components');
const sectionsDir = path.join(__dirname, 'sections');
const snippetsDir = path.join(__dirname, 'snippets');
const assetsDir = path.join(__dirname, 'assets');

const utilsDir = path.join(__dirname, 'utilities');
// const integrationsDir = path.join(__dirname, 'integrations');

const mainJsPath = path.join(__dirname, 'frontend', 'entrypoints', 'main.js');
const utilsJsPath = path.join(assetsDir, 'utils.js');

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
async function updateEntryJs(entryPath, importPath) {
  try {
    const content = await fs.readFile(entryPath, 'utf8');
    if (!content.includes(importPath)) {
      await fs.appendFile(entryPath, `\nimport '${importPath}';`);
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
async function removeFromEntryJs(entryPath, importPath) {
  try {
    let content = await fs.readFile(entryPath, 'utf8');
    const importStatement = `import '${importPath}';`;
    if (content.includes(importStatement)) {
      content = content.replace(importStatement, '').trim();
      await fs.writeFile(entryPath, content);
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

  if (filePath.startsWith(utilsDir)) {
    console.log(`Detected addition in utilities directory, bundling: ${filePath}`);
    await bundler();
    return;
  }

  if (type === 'sections' || type === 'snippets') {
    const destDir = type === 'sections' ? sectionsDir : snippetsDir;
    const destPath = path.join(destDir, fileName);
    await createSymlink(filePath, destPath);
  } else if (fileName.endsWith('.js')) {
    const newFileName = fileName === 'index.js' ? `${component}.js` : `${component}_${fileName}`;
    const destPath = path.join(assetsDir, newFileName);
    await createSymlink(filePath, destPath);
    await updateEntryJs(mainJsPath, `../../assets/${newFileName}`);
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

  // Skip processing for utilities directory
  if (filePath.startsWith(utilsDir)) {
    console.log(`Detected change in utilities directory, bundling: ${filePath}`);
    await bundler();
    return;
  }

  if (type === 'sections' || type === 'snippets') {
    const destDir = type === 'sections' ? sectionsDir : snippetsDir;
    const destPath = path.join(destDir, fileName);
    console.log(`updating ${type} file: ${destPath}`);
    await removeSymlink(destPath);
    await createSymlink(filePath, destPath);
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

  // Skip processing for utilities directory
  if (filePath.startsWith(utilsDir)) {
    console.log(`Detected removal in utilities directory, bundling: ${filePath}`);
    await bundler();
    return;
  }

  if (fileName.endsWith('.js')) {
    const newFileName = fileName === 'index.js' ? `${component}.js` : `${component}_${fileName}`;
    const importPath = `../../assets/${newFileName}`;
    const destPath = path.join(assetsDir, newFileName);
    await removeFromEntryJs(mainJsPath, importPath);
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
// const watchDir = [componentsDir, utilsDir, integrationsDir];
const watchDir = [componentsDir, utilsDir]
const watcher = chokidar.watch(watchDir, { persistent: true })
watcher
  .on('add', handleFileAddition)
  .on('unlink', handleFileRemoval)
  .on('error', error => console.error('Error watching files:', error));

  //.on('change', debounce(handleFileChange,100))
  async function onChokidarChange() {
    return new Promise((resolve, reject) => {
  
      watcher
        .on('change', debounce(async (filePath) => {
          try {
            await handleFileChange(filePath);
            resolve(`File change handled for: ${filePath}`);
          } catch (error) {
            reject(`Error handling file change for: ${filePath}`, error);
          }
        }, 100))
        .on('error', (error) => {
          reject(`Watcher error: ${error}`);
        });
    });
  }
  
  onChokidarChange().then(response => {
    console.log(response);
  }).catch(error => {
    console.error(`Error onChokidarChange: ${error}`);
  });


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
          console.log('creating in /assets', `assets/${newFileName}`)
          await removeSymlink(destPath);
          await createSymlink(srcPath, destPath);
          await updateEntryJs(mainJsPath, `../../assets/${newFileName}`);
        }
      }));
    }));

    await bundler();

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
