#!/usr/bin/env node

const { existsSync, readFileSync } = require('fs');
const count = require('..');

// Capture errors and print them somewhat gracefully
process.setUncaughtExceptionCaptureCallback((e) => {
  console.error(e.toString());
  process.exit(1);
});

if (process.argv.includes('--help')) {
  console.log(`
  Usage
    $ kcr deployments.json more-deployments.json

  Options
    --help  Print help output

  Examples
    $ kubectl get delpoyments | kcr
    $ kcr /path/to/deployments.json`);

  process.exit(0);
}

const print = (result) => {
  console.log(
    `\nRequests: ${result.requests.cpu.toFixed(
      3
    )} Cores / ${result.requests.memory.toFixed(3)} Gi`
  );
  console.log(
    `Limits:   ${result.limits.cpu.toFixed(
      3
    )} Cores / ${result.limits.memory.toFixed(3)} Gi`
  );
};

if (process.stdin.isTTY) {
  // User provided a list of files as arguments
  const totals = {
    limits: { cpu: 0, memory: 0 },
    requests: { cpu: 0, memory: 0 }
  };

  if (process.argv.length <= 2) {
    console.error(
      'Please pipe output from kubectl/oc, or provide a JSON file(s) as arguments'
    );
    process.exit(0);
  }

  process.argv.forEach((file, idx) => {
    if (idx <= 1) {
      // Skip "node" and "kcr.js" args entries
      return;
    }

    if (existsSync(file)) {
      const { limits, requests } = count(readFileSync(file));
      totals.limits.cpu += limits.cpu;
      totals.limits.memory += limits.memory;
      totals.requests.cpu += requests.cpu;
      totals.requests.memory += requests.memory;
    } else {
      throw new Error(`File ${file} does not exist`);
    }
  });

  print(totals);
} else {
  // User piped input, e.g kubectl get deployments -o json | kcr
  let resources = '';
  process.stdin.on('data', (data) => (resources += data.toString()));
  process.stdin.on('end', () => print(count(resources)));
}
