import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sectionsDir = path.join(__dirname, 'sections');
const snippetsDir = path.join(__dirname, 'snippets');
const componentsDir = path.join(__dirname, 'components');

const reverseSymlinkForFile = async (file, dirType) => {
  const componentName = path.basename(file, '.liquid');
  const componentDir = path.join(componentsDir, componentName, dirType);
  const srcPath = path.join(dirType === 'sections' ? sectionsDir : snippetsDir, file);
  const destPath = path.join(componentDir, file);

  try {
    const stat = await fs.lstat(srcPath);
    if (!stat.isSymbolicLink()) {
      console.error(`Error: ${srcPath} is not a symlink. Skipping...`);
      return;
    }

    // await fs.unlink(srcPath);
    await fs.unlink(destPath)

    try {
      // await fs.symlink(destPath, srcPath);
      await fs.symlink(srcPath, destPath);
      console.log(`Reversed symlink: ${destPath} -> ${srcPath}`);
    } catch (err) {
      console.error(`Failed to create symlink for ${srcPath}:`, err);
    }
  } catch (err) {
    console.error(`Error reversing symlink for ${srcPath}:`, err);
  }
}

const reverseSymlinks = async () => {
  try {
    const sectionFiles = await fs.readdir(sectionsDir);
    const snippetFiles = await fs.readdir(snippetsDir);
    console.log('Starting symlink reversal...');
    await Promise.all([
      ...sectionFiles.map(file => reverseSymlinkForFile(file, 'sections')),
      ...snippetFiles.map(file => reverseSymlinkForFile(file, 'snippets'))
    ]);

    console.log('All symlinks reversed successfully.');
  } catch (err) {
    console.error('Error reversing symlinks:', err);
  }
}

// artificial delay to simluate the re-linking process
export const test = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('put it in reverse terry');
      resolve(); // Resolving the promise after the timeout
    }, 5000);
  });
}
reverseSymlinks()