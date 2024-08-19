import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

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

const symlinkedPaths = new Map();

/**
 * Checks if the path is a symbolic link pointing to the correct target.
 * @typedef {import('fs').PathLike} PathLike
 * @param {PathLike} destPath
 * @param {PathLike} srcPath
 * @returns {Promise<boolean>} Returns true if the path is a symlink pointing to srcPath.
 */
async function hasSymlink(destPath, srcPath) {
  try {
    const stats = await fs.lstat(destPath);
    if (stats.isSymbolicLink()) {
      const linkTarget = await fs.readlink(destPath);
      terminalLogs("Symlink exists from {0} to {1}", srcPath, destPath);
      return linkTarget === srcPath;
    }
    return false;
  } catch (err) {
    // If the path does not exist, it's not a symlink
    return false;
  }
}

/**
 * Creates a symlink from srcPath to destPath
 * @typedef {import('fs').PathLike} PathLike
 * @param {PathLike} srcPath
 * @param {PathLike} destPath
 */
async function createSymlink(srcPath, destPath) {
  try {
    await fs.symlink(srcPath, destPath, 'file');
    symlinkedPaths.set(destPath);

    terminalLogs("Symlink created: {0} -> {1}", srcPath, destPath);
  } catch (err) {
    terminalLogs("Error creating symlink for: {0} -> {1}", srcPath, destPath, err);
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

    terminalLogs("remove symlink at: '{0}';", destPath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
        terminalLogs("Error removing symlink or file at {0}: {1}", destPath, err);
    }
  }
}

/**
 * Moves srcPath to destPath
 * destPath: source
 * srcPath: reference to destPath
 * @param {PathLike} srcPath
 * @param {PathLike} destPath
 */
async function reverseSourceDestination(srcPath, destPath) {
  try {
    await fs.rename(srcPath, destPath);
    symlinkedPaths.set(destPath, srcPath);
    terminalLogs("Moved source: {0} -> {1}", srcPath, destPath);
  } catch (err) {
    terminalLogs("Error processing {0} -> {1}: {2}", srcPath, destPath, err.message);
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
      terminalLogs("main.js updated with: import '{0}';", importPath);
    }
  } catch (err) {
    terminalLogs("Error updating main.js with {0}: {1}", importPath, err.message)
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
      terminalLogs("main.js updated: removed import '{0}';", importPath);
    }
  } catch (err) {
    terminalLogs("Error removing import '{0}' from main.js: {1}", importPath, err.message);
  }
}

/**
 * Handles file addition
 * @param {string} filePath
 */
async function handleFileAddition(filePath) {
    terminalLogs("handleFileAddition: {0}", filePath);
  const relativePath = path.relative(componentsDir, filePath);
  const pathParts = relativePath.split(path.sep);
  const component = pathParts[0];
  const type = pathParts[1];
  const fileName = pathParts[pathParts.length - 1];

  if (filePath.startsWith(utilsDir)) {
    terminalLogs("Detected addition in utilities directory, bundling: {0}", filePath);
    await bundler();
    return;
  }

  if (type === 'sections' || type === 'snippets') {
    const destDir = type === 'sections' ? sectionsDir : snippetsDir;
    const destPath = path.join(destDir, fileName);
    await handleSymlinking(filePath, destPath)
  } else if (fileName.endsWith('.js')) {
    const newFileName = fileName === 'index.js' ? `${component}.js` : `${component}_${fileName}`;
    const destPath = path.join(assetsDir, newFileName);
    await handleSymlinking(filePath, destPath)
    await updateEntryJs(mainJsPath, `../../assets/${newFileName}`);
  }
}

/**
 * Handles file change
 * @param {string} filePath
 */
async function handleFileChange(filePath) {
    terminalLogs("handleFileChange: {0}", filePath);
  const relativePath = path.relative(componentsDir, filePath);
  const pathParts = relativePath.split(path.sep);
  const component = pathParts[0];
  const type = pathParts[1];
  const fileName = pathParts[pathParts.length - 1];

  // Skip processing for utilities directory
  if (filePath.startsWith(utilsDir)) {
    terminalLogs("Detected addition in utilities directory, bundling: {0}", filePath);
    await bundler();
    return;
  }

  if (type === 'sections' || type === 'snippets') {
    const destDir = type === 'sections' ? sectionsDir : snippetsDir;
    const destPath = path.join(destDir, fileName);
    if (!(await hasSymlink(destPath, filePath))) {
      terminalLogs("Symlink invalid for {0}, recreating: {1} -> {2}", type, destPath, filePath);
    //   await removeSymlink(destPath);
    //   await createSymlink(destPath, filePath);
    }
  } else if (fileName.endsWith('.js')) {
    const newFileName = fileName === 'index.js' ? `${component}.js` : `${component}_${fileName}`;
    const destPath = path.join(assetsDir, newFileName);
    if (!(await hasSymlink(destPath, newFileName))) {
      terminalLogs("Symlink invalid for {0}, recreating: {1} -> {2}", type, destPath, newFileName);
    //   await removeSymlink(destPath);
    //   await createSymlink(destPath, newFileName);
    }
  }
}


  /**
   * Handles file removal
   * @param {string} filePath
   */
async function handleFileRemoval(filePath) {
    terminalLogs("handleFileRemoval: {0}", filePath);
  const relativePath = path.relative(componentsDir, filePath);
  const pathParts = relativePath.split(path.sep);
  const component = pathParts[0];
  const type = pathParts[1];
  const fileName = pathParts[pathParts.length - 1];

  // Skip processing for utilities directory
  if (filePath.startsWith(utilsDir)) {
    terminalLogs("Detected removal in utilities directory, bundling: {0}", filePath);
    await bundler();
    return;
  }

  if (fileName.endsWith('.js')) {
    const newFileName = fileName === 'index.js' ? `${component}.js` : `${component}_${fileName}`;
    const importPath = `../../assets/${newFileName}`;
    const destPath = path.join(assetsDir, newFileName);
    await removeFromEntryJs(mainJsPath, importPath);
    await removeSymlink(filePath);
  } else if (type === 'sections' || type === 'snippets') {
    const destDir = type === 'sections' ? sectionsDir : snippetsDir;
    const destPath = path.join(destDir, fileName);
    await removeSymlink(filePath);
  }

}

/**
 * Watches for changes in the listed directories
 */
function watchForChanges() {
    // const watchDir = [componentsDir, utilsDir, integrationsDir];
    const watchDir = [componentsDir, utilsDir]
    const watcher = chokidar.watch(watchDir, { persistent: true })
    watcher
    .on('add', handleFileAddition)
    .on('change', debounce(handleFileChange,100))
    .on('unlink', handleFileRemoval)
    .on('error', error => console.error('Error watching files:', error));
}
  //.on('change', debounce(handleFileChange,100))
/*
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
*/


/**
 * Handles the initial file movement and symlink creation
 */
async function handleSymlinking(srcPath, destPath) {
    if (!symlinkedPaths.has(destPath)) {

        if (await hasSymlink(srcPath, destPath)) { 
            terminalLogs("Symlink already exists and is correct: {0} -> {1}", srcPath, destPath);
            return;
        }
        // Track original source and destination
        symlinkedPaths.set(destPath, srcPath);
        
        // Move original file
        await reverseSourceDestination(srcPath, destPath);
        // Retrieve original path
        const componentsPath = symlinkedPaths.get(destPath);
        
        // Ensure removal of symlink in original path if it exists
        if (await hasSymlink(destPath, componentsPath)) { // is destPath symbol link to origin componentsPath
            await removeSymlink(destPath);
        }
        // Create a new symlink at destination path
        await createSymlink(destPath, componentsPath);
    }
}

/**
 * Initial setup for symlink process
 */
(async function initialSetup() {
  try {
    console.log('initialSetup init')
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
            const destPath = file.name === 'sections' 
                ? path.join(sectionsDir, subFile) 
                : path.join(snippetsDir, subFile);

                await handleSymlinking(srcPath, destPath);
          }));
        } else if (file.name.endsWith('.js')) {
            const srcPath = path.join(componentPath, file.name);
            const newFileName = file.name === 'index.js' ? `${component.name}.js` : `${component.name}_${file.name}`;
            const destPath = path.join(assetsDir, newFileName);

            await handleSymlinking(srcPath, destPath);
            await updateEntryJs(mainJsPath, `../../assets/${newFileName}`);
        }
      }));
    }));

    await bundler();

    watchForChanges()

  } catch (err) {
    console.error('Error during initial setup:', err);
  }
})();

/**
 * Logs a formatted message with simplified file paths.
 * @param {string} messageTemplate - The message template containing placeholders for paths.
 * @param {...string} paths - The file paths to format and include in the message.
 */
function terminalLogs(message, ...paths) {
    const formattedPaths = paths.map(filePath => {
        if (filePath instanceof Error) {
            return `Error: ${filePath.message}`;
        } else if (typeof filePath === 'string') {
            return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
        } else {
            return String(filePath); // Fallback to convert other types to string
        }
    });

    const formattedMessage = message.replace(/\{(\d+)\}/g, (match, index) => {
        return formattedPaths[index];
    });

    console.log(formattedMessage);
}

function debounce(func, timeout){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
