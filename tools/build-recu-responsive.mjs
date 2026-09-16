import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
// Pin upstream bytes. Bundle in a local CommonJS export scope, never window.shaka.
const vendor = new URL('standalone/recu-responsive/vendor/shaka-player-5.2.10.ui.js', root);
const vendorHash = 'f6bf135400dd1425e9d0fe93bb5465fbae1aaee0407ada8a5219d7ee1ef07a89';
if (!existsSync(vendor)) {
  if (process.argv.includes('--check')) throw new Error('Pinned Shaka dependency is missing.');
  const response = await fetch('https://cdn.jsdelivr.net/npm/shaka-player@5.2.10/dist/shaka-player.ui.js');
  if (!response.ok) throw new Error(`Shaka dependency download failed: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (createHash('sha256').update(bytes).digest('hex') !== vendorHash) throw new Error('Shaka dependency hash mismatch.');
  mkdirSync(new URL('.', vendor), { recursive:true });
  writeFileSync(vendor, bytes);
}
const vendorBytes = readFileSync(vendor);
if (createHash('sha256').update(vendorBytes).digest('hex') !== vendorHash) throw new Error('Pinned Shaka dependency changed.');
const library = `const RRP_SK = (() => { const exports = {};\n${vendorBytes.toString('utf8')}\nreturn exports;\n})();`;
const cssFile = new URL('standalone/recu-responsive/vendor/shaka-player-5.2.10.controls.css', root);
const cssHash = '13f6a8d837ef2d9792b342d7e5398b934054b23b5567cbf6ecf4040e23f9cb3b';
if (!existsSync(cssFile)) {
  if (process.argv.includes('--check')) throw new Error('Pinned player CSS is missing.');
  const response = await fetch('https://cdn.jsdelivr.net/npm/shaka-player@5.2.10/dist/controls.css');
  if (!response.ok) throw new Error(`Player CSS download failed: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (createHash('sha256').update(bytes).digest('hex') !== cssHash) throw new Error('Player CSS hash mismatch.');
  writeFileSync(cssFile, bytes);
}
const cssBytes = readFileSync(cssFile);
if (createHash('sha256').update(cssBytes).digest('hex') !== cssHash) throw new Error('Pinned CSS dependency changed.');
const styles = `const RRP_SH_CSS = ${JSON.stringify(cssBytes.toString('utf8'))};`;
const licenseFile = new URL('standalone/recu-responsive/vendor/LICENSE-Shaka.txt', root);
const licenseHash = '20ce2eba547fd0a8c4023511c003eabe510982a335cccd4e270f1f55ffbd2250';
if (!existsSync(licenseFile)) {
  if (process.argv.includes('--check')) throw new Error('Shaka redistribution license is missing.');
  const response = await fetch('https://raw.githubusercontent.com/shaka-project/shaka-player/v5.2.10/LICENSE');
  if (!response.ok) throw new Error(`Shaka license download failed: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (createHash('sha256').update(bytes).digest('hex') !== licenseHash) throw new Error('Shaka license hash mismatch.');
  writeFileSync(licenseFile, bytes);
}
const licenseBytes = readFileSync(licenseFile);
if (createHash('sha256').update(licenseBytes).digest('hex') !== licenseHash) throw new Error('Shaka license changed.');
const metadata = `// ==UserScript==
// @name         Recu.me Responsive Player
// @namespace    https://github.com/linuxNoob620/chaturbate-userscripts
// @version      0.2.1
// @description  Default 1080p replacement player with preloaded sampled timeline previews for Recu.me.
// @author       Ziggy
// @license      MIT
// @match        https://recu.me/*/video/*/play*
// @run-at       document-idle
// @sandbox      raw
// @noframes
// @grant        none
// @updateURL    https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Recu.me%20Responsive%20Player.meta.js
// @downloadURL  https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Recu.me%20Responsive%20Player.user.js
// ==/UserScript==
`;
const parts = ['storyboards.js', 'transport.js', 'player.js'].map(name =>
  readFileSync(new URL(`standalone/recu-responsive/${name}`, root), 'utf8'));
const build = createHash('sha256').update(vendorHash + cssHash + parts.join('\n')).digest('hex').slice(0,12);
const code = `${metadata}\n/* Bundled Shaka Player 5.2.10 license and third-party notices:\n${licenseBytes.toString('utf8')}\n*/\n(() => {\n'use strict';\nif (window.top !== window.self || !rrpRoute()) return;\nconst RRP_BUILD = '${build}';\n${library}\n${styles}\n${parts.join('\n')}\n})();\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(new URL('Recu.me Responsive Player.user.js', root), 'utf8') !== code ||
      readFileSync(new URL('Recu.me Responsive Player.meta.js', root), 'utf8') !== metadata) {
    throw new Error('Responsive Player generated outputs are stale.');
  }
  console.log('Responsive Player generated outputs match source.');
} else {
  writeFileSync(new URL('Recu.me Responsive Player.user.js', root), code);
  writeFileSync(new URL('Recu.me Responsive Player.meta.js', root), metadata);
  console.log('Built separate Recu.me Responsive Player 0.2.1 (Suite and extensions untouched).');
}
