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

/**
 * creates a symlink from srcPath to destPath
 * @typedef {import('fs').PathLike} PathLike
 * @param {PathLike} srcPath
 * @param {PathLike} destPath
 */
async function createSymlink(srcPath, destPath) {
  try {
    if (await exists(destPath)) {
      await fs.unlink(destPath);
    }

    await fs.symlink(srcPath, destPath, 'file');
    console.log(`Symlink created: ${destPath} -> ${srcPath}`);
  } catch (err) {
    console.error(`Error creating symlink for ${srcPath} -> ${destPath}:`, err);
  }
}

/**
 * copies a file from srcPath to destPath
 * @typedef {import('fs').PathLike} PathLike
 * @property {string} srcPath
 * @property {string} destPath
 * @param {PathLike} srcPath
 * @param {PathLike} destPath
 */
async function copyFile(srcPath, destPath) {
  try {
    await ensureDirectoryExists(path.dirname(destPath));
    await fs.copyFile(srcPath, destPath);
    console.log(`File copied: ${destPath} <- ${srcPath}`);
  } catch (err) {
    console.error(`Error copying file from ${srcPath} to ${destPath}:`, err);
  }
}

/**
 * checks if file exists at filePath
 * @typedef {import('fs').PathLike} PathLike
 * @property {string} filePath
 * @param {PathLike} filePath
 * @returns {Promise<boolean>}
 */
async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * ensures a directory exists at dir
 * @typedef {import('fs').PathLike} PathLike
 * @property {string} dir
 * @param {PathLike} dir
 */
async function ensureDirectoryExists(dir) {
  if (!await exists(dir)) {
    await fs.mkdir(dir, { recursive: true });
    console.log(`Directory created: ${dir}`);
  }
}

/**
 * updates the main.js file with an import statement for the given importPath
 * @typedef {import('fs').PathLike} PathLike
 * @property {string} importPath
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
 * removes an import statement from the main.js file
 * @typedef {import('fs').PathLike} PathLike
 * @property {string} importPath
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
 * watches for changes in the components directory
 * @typedef {import('chokidar').FSWatcher} FSWatcher
 * @property {string} componentsDir
 * @property {string} sectionsDir
 * @property {string} snippetsDir
 * @property {string} assetsDir
 * @property {string} mainJsPath
 * @param {string} componentsDir
 * @param {string} sectionsDir
 * @param {string} snippetsDir
 * @param {string} assetsDir
 * @param {string} mainJsPath
 * @returns
 */
chokidar.watch(componentsDir, { persistent: true })
  .on('add', async (filePath) => {
    const relativePath = path.relative(componentsDir, filePath);
    const pathParts = relativePath.split(path.sep);
    const component = pathParts[0];
    const type = pathParts[1];
    const fileName = pathParts[pathParts.length - 1];

    if (type === 'sections' || type === 'snippets') {
      const destDir = type === 'sections' ? sectionsDir : snippetsDir;
      const destPath = path.join(destDir, fileName);

      await ensureDirectoryExists(destDir);
      await createSymlink(filePath, destPath);
    } else if (fileName.endsWith('.js')) {
      const newFileName = fileName === 'index.js' ? `${component}.js` : `${component}_${fileName}`;
      const destPath = path.join(assetsDir, newFileName);

      await copyFile(filePath, destPath);
      await updateMainJs(`../../assets/${newFileName}`);
    }
  })
  .on('change', async (filePath) => {
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

      await copyFile(filePath, destPath);
      await updateMainJs(`../../assets/${newFileName}`);
    }
  })
  .on('unlink', async (filePath) => {
    const relativePath = path.relative(componentsDir, filePath);
    const pathParts = relativePath.split(path.sep);
    const component = pathParts[0];
    const fileName = pathParts[pathParts.length - 1];

    if (fileName.endsWith('.js')) {
      const newFileName = fileName === 'index.js' ? `${component}.js` : `${component}_${fileName}`;
      const importPath = `../../assets/${newFileName}`;
      await removeFromMainJs(importPath);
      const destPath = path.join(assetsDir, newFileName);

      try {
        await fs.unlink(destPath);
        console.log(`File removed: ${destPath}`);
      } catch (err) {
        console.error(`Error removing file ${destPath}:`, err);
      }
    }
  })
  .on('error', error => console.error('Error watching files:', error));

/**
 * sets up the initial symlinks and file copies
 * @typedef {import('fs').PathLike} PathLike
 * @property {string} componentsDir
 * @property {string} sectionsDir
 * @property {string} snippetsDir
 * @property {string} assetsDir
 * @param {*} componentsDir
 * @param {*} sectionsDir
 * @param {*} snippetsDir
 * @param {*} assetsDir
 * @returns
 */
(async function initialSetup() {
  try {
    const components = await fs.readdir(componentsDir);

    for (const component of components) {
      const componentPath = path.join(componentsDir, component);
      const componentSectionsDir = path.join(componentPath, 'sections');
      const componentSnippetsDir = path.join(componentPath, 'snippets');
      const files = await fs.readdir(componentPath);

      if (await exists(componentSectionsDir)) {
        await ensureDirectoryExists(sectionsDir);
        const sectionFiles = await fs.readdir(componentSectionsDir);
        for (const file of sectionFiles) {
          const srcPath = path.join(componentSectionsDir, file);
          const destPath = path.join(sectionsDir, file);
          await createSymlink(srcPath, destPath);
        }
      }

      if (await exists(componentSnippetsDir)) {
        await ensureDirectoryExists(snippetsDir);
        const snippetFiles = await fs.readdir(componentSnippetsDir);
        for (const file of snippetFiles) {
          const srcPath = path.join(componentSnippetsDir, file);
          const destPath = path.join(snippetsDir, file);
          await createSymlink(srcPath, destPath);
        }
      }

      for (const file of files) {
        if (file.endsWith('.js')) {
          const srcPath = path.join(componentPath, file);
          const newFileName = file === 'index.js' ? `${component}.js` : `${component}_${file}`;
          const destPath = path.join(assetsDir, newFileName);

          await copyFile(srcPath, destPath);
          await updateMainJs(`../../assets/${newFileName}`);
        }
      }
    }
  } catch (err) {
    console.error('Error during initial setup:', err);
  }
})();
