// attempt to reverse symlinks on `npm run dev` termination
import process from 'node:process';
// import { spawn } from 'node:child_process';

// symlink reversal for `npm run build`
import { reverseSymlinks, test } from './reverse-symlinks.js';


// Detect `npm run dev` termination
// https://nodejs.org/api/process.html

process.stdin.resume();

let reverseSymlinksCalled = false; // using flag to ensure it only runs once
async function handleTermination(signal) {
  
  if (!reverseSymlinksCalled) {
    reverseSymlinksCalled = true

    console.log(`Received ${signal}. Reversing symlinks...`);
    try {
      await test();
      await reverseSymlinks();
      // reverseSymlinksLocal();
      console.log('Symlinks reversed successfully.');
    } catch (err) {
      console.error('Error reversing symlinks during exit:', err);
    } finally {
      process.exit(0);
    }
  }
}

process.on('SIGINT', () => handleTermination('SIGINT'));
process.on('SIGTERM', () => handleTermination('SIGTERM'));
process.on('disconnect', () => handleTermination('disconnect'));


// process.on('exit', async (code) => {
//   console.log(`Process exit event with code: ${code}. Reversing symlinks...`);
//   await test();
//   console.log('Process exit completed.');
// });



// Reverse symlinks on `npm run dev` termination
// function reverseSymlinksLocal() {
//   const reverseProcess = spawn('node', ['reverse-symlinks.js'], {
//     stdio: 'inherit',
//   });

//   reverseProcess.on('close', (code) => {
//     if (code !== 0) {
//       console.error(`reverse-symlinks process exited with code ${code}`);
//     } else {
//       console.log('Symlinks reversed successfully.');
//     }
//   });
// }

