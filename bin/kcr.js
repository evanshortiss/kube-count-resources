#!/usr/bin/env node

const { profile } = require('console');
const { existsSync, readFileSync } = require('fs');
const count = require('..');

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

if (process.argv.includes('--help')) {
  console.log(`
  Usage
    $ krc deployments.json more-deployments.json

  Options
    --help  Print help output

  Examples
    $ kubectl get delpoyments | krc
    $ krc /path/to/deployments.json`);

  process.exit(0);
}

if (process.stdin.isTTY) {
  const totals = {
    cpu: 0,
    memory: 0
  };

  if (process.argv.length <= 2) {
    console.error(
      'Please provide at least one JSON file as an argument, or piped output from kubectl'
    );
    process.exit(0);
  }

  process.argv.forEach((file, idx) => {
    if (idx > 1 && existsSync(file)) {
      const result = count(readFileSync(file));

      totals.cpu += result.cpu;
      totals.memory += result.memory;
    }
  });

  print(totals);
} else {
  let resources = '';
  process.stdin.on('data', (data) => (resources += data.toString()));
  process.stdin.on('end', async () => {
    try {
      print(await count(resources));
    } catch (e) {
      console.error(e.toString());
      process.exit(1);
    }
  });
}
