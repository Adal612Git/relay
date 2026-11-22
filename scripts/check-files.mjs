import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
for (const file of [
  'LICENSE',
  '.env.example',
  'README.md',
  'package-lock.json',
  '.github/workflows/ci.yml',
])
  assert.ok(existsSync(file), `Missing ${file}`);
assert.match(readFileSync('LICENSE', 'utf8'), /Apache License/);
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
for (const section of ['dependencies', 'devDependencies']) {
  for (const [name, version] of Object.entries(pkg[section])) {
    assert.match(version, /^\d+\.\d+\.\d+/, `Unpinned ${name}`);
    assert.equal(
      lock.packages[''][section][name],
      version,
      `Lock mismatch ${name}`,
    );
  }
}
console.log('Essential files, license and dependency pins verified.');
