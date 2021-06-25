const test = require('tape');
const { join } = require('path');
const count = require('../');
const { execSync } = require('child_process');
const { readFileSync } = require('fs');

test('module: should parse input from a given json buffer/string', (t) => {
  const result = count(readFileSync(join(__dirname, 'deployments.json')));

  t.deepEqual(result, {
    requests: { memory: 1, cpu: 0.5 },
    limits: { memory: 1.5, cpu: 0.7 }
  });
  t.end();
});

test('module: should return sensible error on malformed JSON input', (t) => {
  try {
    count('}');
    t.fail('should have thrown an error');
  } catch (e) {
    t.match(e.toString(), /Failed to parse provided JSON string/);
    t.end();
  }
});

test('CLI: should parse input from stdin', (t) => {
  const ret = execSync('cat deployments.json | ../bin/kcr.js', {
    cwd: __dirname
  });

  t.match(ret.toString(), /Requests: 0.500 Cores \/ 1.000 Gi/);
  t.match(ret.toString(), /Limits:   0.700 Cores \/ 1.500 Gi/);
  t.end();
});

test('CLI: should parse files args', (t) => {
  try {
    const ret = execSync('"./kcr.js" ../test/deployments.json', {
      cwd: join(__dirname, '../bin'),
      stdio: ['inherit', 'pipe', 'pipe']
    });

    t.match(ret.toString(), /Requests: 0.500 Cores \/ 1.000 Gi/);
    t.match(ret.toString(), /Limits:   0.700 Cores \/ 1.500 Gi/);
    t.end();
  } catch (e) {
    t.fail(e.toString());
  }
});
