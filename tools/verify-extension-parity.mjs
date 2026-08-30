import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requested = String(process.argv[2] || 'all').toLowerCase();
const platforms = requested === 'all' ? ['chrome', 'firefox'] : [requested];
const failures = [];
const source = await readFile(path.join(root, 'Chaturbate MultiCam Pro + Cam ARNA.user.js'), 'utf8');
const endMarker = '// ==/UserScript==';
const metadataEnd = source.indexOf(endMarker);
if (metadataEnd < 0) throw new Error('Userscript metadata block is invalid');
const header = source.slice(0, metadataEnd + endMarker.length);
const authoritativeBody = source.slice(metadataEnd + endMarker.length);
const version = header.match(/^\/\/\s+@version\s+(.+)$/m)?.[1]?.trim() || '';
const name = header.match(/^\/\/\s+@name\s+(.+)$/m)?.[1]?.trim() || '';
const description = header.match(/^\/\/\s+@description\s+(.+)$/m)?.[1]?.trim() || '';
const matches = [...header.matchAll(/^\/\/\s+@match\s+(.+)$/gm)].map(match => match[1].trim());
const connects = [...header.matchAll(/^\/\/\s+@connect\s+(.+)$/gm)].map(match => match[1].trim());
const expectedHosts = [...new Set(connects.map(host => host === '*' ? '<all_urls>' : `https://${host}/*`))].sort();
const bodyHash = createHash('sha256').update(authoritativeBody).digest('hex');
const backgroundSource = await readFile(path.join(root, 'extension', 'shared', 'background.js'), 'utf8');
const hlsSource = await readFile(path.join(root, 'node_modules', 'hls.js', 'dist', 'hls.min.js'));
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));

if (packageJson.version !== version) failures.push(`package.json version ${packageJson.version} does not match userscript ${version}`);
if (packageJson.dependencies?.['hls.js'] !== '1.6.16') failures.push('package.json does not pin hls.js 1.6.16');

for (const platform of platforms) {
  if (!['chrome', 'firefox'].includes(platform)) throw new Error('Usage: node tools/verify-extension-parity.mjs [all|chrome|firefox]');
  const directory = path.join(root, 'dist', platform);
  const contentPath = path.join(directory, 'content.js');
  const backgroundPath = path.join(directory, 'background.js');
  const manifestPath = path.join(directory, 'manifest.json');
  const content = await readFile(contentPath, 'utf8');
  const begin = '  /* BEGIN VERBATIM USERSCRIPT BODY */\n';
  const end = '  /* END VERBATIM USERSCRIPT BODY */';
  const beginAt = content.indexOf(begin);
  const endAt = content.indexOf(end, beginAt + begin.length);
  if (beginAt < 0 || endAt < 0) failures.push(`${platform}: content body markers are missing`);
  else {
    const copiedBody = content.slice(beginAt + begin.length, endAt);
    const copiedHash = createHash('sha256').update(copiedBody).digest('hex');
    if (copiedBody !== authoritativeBody) failures.push(`${platform}: userscript body differs (${copiedHash} != ${bodyHash})`);
  }

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const contentScript = manifest.content_scripts?.[0] || {};
  if (manifest.manifest_version !== 3) failures.push(`${platform}: manifest is not MV3`);
  if (manifest.name !== name) failures.push(`${platform}: manifest name differs from userscript`);
  if (manifest.version !== version) failures.push(`${platform}: manifest version differs from userscript`);
  if (manifest.description !== description) failures.push(`${platform}: manifest description differs from userscript`);
  if (JSON.stringify(contentScript.matches) !== JSON.stringify(matches)) failures.push(`${platform}: URL matches differ from userscript`);
  if (contentScript.run_at !== 'document_end') failures.push(`${platform}: injection timing is not document_end`);
  if (contentScript.all_frames !== true) failures.push(`${platform}: all_frames must preserve userscript frame behavior`);
  if (JSON.stringify([...(manifest.host_permissions || [])].sort()) !== JSON.stringify(expectedHosts)) failures.push(`${platform}: host permissions differ from @connect`);
  if (JSON.stringify(manifest.permissions) !== JSON.stringify(['storage'])) failures.push(`${platform}: unexpected extension API permissions`);
  if (platform === 'chrome' && manifest.background?.service_worker !== 'background.js') failures.push('chrome: service worker is missing');
  if (platform === 'firefox' && JSON.stringify(manifest.background?.scripts) !== JSON.stringify(['background.js'])) failures.push('firefox: background script is missing');
  if (platform === 'firefox' && !manifest.browser_specific_settings?.gecko?.id) failures.push('firefox: extension ID is missing');

  const generatedBackground = await readFile(backgroundPath, 'utf8');
  if (generatedBackground !== backgroundSource) failures.push(`${platform}: background adapter differs from shared source`);
  const generatedHls = await readFile(path.join(directory, 'vendor', 'hls.min.js'));
  if (!generatedHls.equals(hlsSource)) failures.push(`${platform}: bundled HLS differs from pinned 1.6.16 package`);

  for (const scriptPath of [contentPath, backgroundPath]) {
    const check = spawnSync(process.execPath, ['--check', scriptPath], { encoding: 'utf8' });
    if (check.status !== 0) failures.push(`${platform}: syntax check failed for ${path.basename(scriptPath)}\n${check.stderr}`);
  }

  const extension = platform === 'firefox' ? 'xpi' : 'zip';
  try { await access(path.join(root, 'dist', 'packages', `ziggy-chaturbate-suite-${platform}-${version}.${extension}`)); }
  catch { failures.push(`${platform}: distributable package is missing`); }
}

if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(`Verified strict userscript-body parity (${bodyHash}) for ${platforms.join(' and ')}.\n`);
