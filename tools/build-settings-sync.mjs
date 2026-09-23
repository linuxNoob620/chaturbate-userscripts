import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'Chaturbate MultiCam Pro + Cam ARNA.user.js');
const start = '  // BEGIN GENERATED SETTINGS SYNC';
const end = '  // END GENERATED SETTINGS SYNC';
const source = fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
const files = ['core', 'storage', 'codec', 'client', 'controller'];
const body = files.map(name => fs.readFileSync(path.join(root, `src/settings-sync-${name}.js`), 'utf8').trim().replace(/\r\n/g, '\n')).join('\n\n');
if (source.split(start).length !== 2 || source.split(end).length !== 2) throw new Error('Sync bundle markers missing/duplicated');
const built = source.slice(0, source.indexOf(start)) + start + '\n' + body + '\n' + source.slice(source.indexOf(end));
if (process.argv.includes('--check')) {
  if (source !== built) throw new Error('Sync bundle is stale. Run node tools/build-settings-sync.mjs.');
} else fs.writeFileSync(target, built);
console.log('Settings sync bundle matches standalone tested modules.');
