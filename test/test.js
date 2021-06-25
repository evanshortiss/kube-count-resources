const test = require('tape');
const { join } = require('path');
const count = require('../');
const { execSync } = require('child_process');
const { readFileSync } = require('fs');

test('should parse input from a given json buffer/string', (t) => {
  const result = count(readFileSync(join(__dirname, 'deployments.json')));

  t.deepEqual(result, {
    requests: { memory: 1, cpu: 0.5 },
    limits: { memory: 1.5, cpu: 0.7 }
  });
  t.end();
});

test('should parse input from stdin', (t) => {
  const ret = execSync('cat deployments.json | ../bin/kcr.js', {
    cwd: __dirname
  });

  t.match(ret.toString(), /Requests: 0.500 Cores \/ 1.000 Gi/);
  t.match(ret.toString(), /Limits:   0.700 Cores \/ 1.500 Gi/);
  t.end();
});

test('should return sensible error on malformed JSON input', (t) => {
  try {
    const result = count('}');
    t.fail('should have thrown an error');
  } catch (e) {
    t.match(e.toString(), /Failed to parse provided JSON string/);
    t.end();
  }
});
