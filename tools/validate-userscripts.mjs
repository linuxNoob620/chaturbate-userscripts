import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const writeMeta = process.argv.includes('--write-meta');
const owner = 'linuxNoob620';
const repo = 'chaturbate-userscripts';
const scripts = [
  {
    file: 'Chaturbate MultiCam Pro + Cam ARNA.user.js',
    meta: 'Chaturbate MultiCam Pro + Cam ARNA.meta.js',
    internalVersion: /version:\s*'([^']+)'/,
    required: ['// @connect           api.github.com'],
  },
  {
    file: 'Chaturbate Desktop Mobile Comfort.user.js',
    meta: 'Chaturbate Desktop Mobile Comfort.meta.js',
    internalVersion: /const VERSION\s*=\s*'([^']+)'/,
    required: [],
  },
];

const failures = [];
const report = [];

function metadata(source, file) {
  const start = source.indexOf('// ==UserScript==');
  const endMarker = '// ==/UserScript==';
  const end = source.indexOf(endMarker);
  if (start !== 0 || end < 0) {
    failures.push(`${file}: invalid userscript header`);
    return '';
  }
  return `${source.slice(start, end + endMarker.length)}\n`;
}

function field(header, name) {
  return header.match(new RegExp(`^// @${name}\\s+(.+)$`, 'm'))?.[1]?.trim() || '';
}

for (const item of scripts) {
  const scriptPath = path.join(root, item.file);
  const source = await readFile(scriptPath, 'utf8');
  const header = metadata(source, item.file);
  const version = field(header, 'version');
  const updateUrl = field(header, 'updateURL');
  const downloadUrl = field(header, 'downloadURL');
  const expectedBase = `https://raw.githubusercontent.com/${owner}/${repo}/main/`;
  const internalVersion = source.match(item.internalVersion)?.[1] || '';
  const syntax = spawnSync(process.execPath, ['--check', scriptPath], { encoding: 'utf8' });

  if (syntax.status !== 0) failures.push(`${item.file}: syntax check failed\n${syntax.stderr}`);
  if (!/^\d+(?:\.\d+){1,3}(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) failures.push(`${item.file}: invalid @version ${version || '(missing)'}`);
  if (internalVersion !== version) failures.push(`${item.file}: internal version ${internalVersion || '(missing)'} does not match ${version}`);
  if (!updateUrl.startsWith(expectedBase) || !updateUrl.endsWith('.meta.js')) failures.push(`${item.file}: unexpected @updateURL`);
  if (!downloadUrl.startsWith(expectedBase) || !downloadUrl.endsWith('.user.js')) failures.push(`${item.file}: unexpected @downloadURL`);
  for (const required of item.required) if (!header.includes(required)) failures.push(`${item.file}: missing ${required.trim()}`);
  const credentialPattern = new RegExp(`\\b(?:github_${'pat_'}|gh[pousr]_|glpat-)[A-Za-z0-9_\\-]{12,}`);
  if (credentialPattern.test(source)) failures.push(`${item.file}: possible embedded access token`);
  if (item.file.includes('MultiCam Pro')) {
    const menuStart = source.indexOf('    function moreoptions(){');
    const menuEnd = source.indexOf('\n    function ', menuStart + 10);
    const menuSource = menuStart >= 0 && menuEnd > menuStart ? source.slice(menuStart, menuEnd) : '';
    if (!menuSource) failures.push(`${item.file}: Reloaded menu function was not found`);
    if (/\bupdateGithubSyncMenuLabel\s*\(/.test(menuSource)) {
      failures.push(`${item.file}: Reloaded menu calls a private MultiCam helper and can leave the wait overlay active`);
    }
    if (!menuSource.includes('isGithubSyncConfigured')) failures.push(`${item.file}: safe GitHub status bridge is missing from Reloaded menu`);
    if (!source.includes('ziggy-mobile-reloaded-backdrop')) failures.push(`${item.file}: native mobile Reloaded menu is missing`);
    if (!source.includes('mobileCleanView: captureMobileCleanViewSettings()')) failures.push(`${item.file}: Mobile Clean View backup component is missing`);
    const mobileStop = source.indexOf('if (!document.getElementById("desktop-spa-header")){return;}');
    const reloadedStyle = source.indexOf('    setgenstyle();', mobileStop);
    if (mobileStop < 0 || reloadedStyle < mobileStop) failures.push(`${item.file}: Reloaded desktop CSS is not isolated from native mobile`);
  }
  if (item.file.includes('Desktop Mobile Comfort')) {
    if (!source.includes('ziggy-mobile-clean-view:import-settings')) failures.push(`${item.file}: shared Suite settings import bridge is missing`);
  }

  const metaPath = path.join(root, item.meta);
  if (writeMeta) await writeFile(metaPath, header, 'utf8');
  let meta = '';
  try { meta = await readFile(metaPath, 'utf8'); }
  catch { failures.push(`${item.meta}: missing; run with --write-meta`); }
  if (meta && meta.replace(/\r\n/g, '\n') !== header.replace(/\r\n/g, '\n')) failures.push(`${item.meta}: does not match the script header`);
  report.push(`${item.file}: ${version}`);
}

if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(`Validated ${report.join(', ')}${writeMeta ? ' and regenerated metadata files' : ''}.\n`);
