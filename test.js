const { execFile } = require('child_process');

const p = execFile(
  './bin/kcr.js',
  ['./test/deployments.json'],
  (err, stdout, stderr) => {
    console.log(err, stdout, stderr);
  }
);
p.stdout.pipe(process.stdout);
const child = execFile('cat', [__filename], (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});
