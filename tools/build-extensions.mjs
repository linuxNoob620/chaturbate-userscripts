import { readFile, writeFile, mkdir, rm, copyFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'Chaturbate MultiCam Pro + Cam ARNA.user.js');
const extensionRoot = path.join(root, 'extension');
const distRoot = path.join(root, 'dist');
const packageRoot = path.join(distRoot, 'packages');
const requested = String(process.argv[2] || 'all').toLowerCase();
const platforms = requested === 'all' ? ['chrome', 'firefox'] : [requested];

if (platforms.some(platform => !['chrome', 'firefox'].includes(platform))) {
  throw new Error('Usage: node tools/build-extensions.mjs [all|chrome|firefox]');
}

function parseUserscript(source) {
  const endMarker = '// ==/UserScript==';
  const end = source.indexOf(endMarker);
  if (!source.startsWith('// ==UserScript==') || end < 0) throw new Error('Userscript metadata block is invalid');
  const header = source.slice(0, end + endMarker.length);
  const body = source.slice(end + endMarker.length);
  const fields = new Map();
  for (const match of header.matchAll(/^\/\/\s+@([^\s]+)\s+(.+)$/gm)) {
    const values = fields.get(match[1]) || [];
    values.push(match[2].trim());
    fields.set(match[1], values);
  }
  const one = name => fields.get(name)?.[0] || '';
  return {
    header,
    body,
    name: one('name'),
    version: one('version'),
    description: one('description'),
    matches: fields.get('match') || [],
    connects: fields.get('connect') || [],
    requires: fields.get('require') || [],
  };
}

function hostPermissions(connects) {
  return [...new Set(connects.map(value => {
    const host = String(value || '').trim();
    if (!host) return '';
    if (host === '*') return '<all_urls>';
    return `https://${host}/*`;
  }).filter(Boolean))].sort();
}

function safeDistPath(...parts) {
  const target = path.resolve(distRoot, ...parts);
  const relative = path.relative(distRoot, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Unsafe dist path: ${target}`);
  return target;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

async function filesUnder(directory, prefix = '') {
  const output = [];
  for (const entry of (await readdir(directory)).sort()) {
    const absolute = path.join(directory, entry);
    const relative = prefix ? `${prefix}/${entry}` : entry;
    const info = await stat(absolute);
    if (info.isDirectory()) output.push(...await filesUnder(absolute, relative));
    else if (info.isFile()) output.push({ absolute, relative: relative.replaceAll('\\', '/') });
  }
  return output;
}

async function writeStoredZip(sourceDirectory, destination) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const files = await filesUnder(sourceDirectory);
  const dosTime = 0;
  const dosDate = (1 << 5) | 1;
  const utf8Flag = 0x0800;

  for (const file of files) {
    const name = Buffer.from(file.relative, 'utf8');
    const data = await readFile(file.absolute);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(utf8Flag, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(utf8Flag, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }

  const centralOffset = offset;
  const centralBuffer = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(centralOffset, 16);
  end.writeUInt16LE(0, 20);
  await writeFile(destination, Buffer.concat([...localParts, centralBuffer, end]));
}

const source = await readFile(sourcePath, 'utf8');
const metadata = parseUserscript(source);
if (!/^\d+(?:\.\d+){1,3}$/.test(metadata.version)) throw new Error(`Unsupported extension version: ${metadata.version}`);
const expectedRequires = [
  'https://cdn.jsdelivr.net/npm/hls.js@1.6.16/dist/hls.min.js',
  'https://cdn.jsdelivr.net/npm/mediabunny@1.55.5/dist/bundles/mediabunny.min.cjs',
];
if (JSON.stringify(metadata.requires) !== JSON.stringify(expectedRequires)) {
  throw new Error('The userscript @require dependency changed; audit it before rebuilding extensions');
}

const preambleTemplate = await readFile(path.join(extensionRoot, 'shared', 'content-preamble.js'), 'utf8');
const postamble = await readFile(path.join(extensionRoot, 'shared', 'content-postamble.js'), 'utf8');
const background = await readFile(path.join(extensionRoot, 'shared', 'background.js'), 'utf8');
const content = preambleTemplate
  .replace('__SCRIPT_NAME__', JSON.stringify(metadata.name))
  .replace('__SCRIPT_VERSION__', JSON.stringify(metadata.version))
  + metadata.body
  + postamble;
const hlsPath = path.join(root, 'node_modules', 'hls.js', 'dist', 'hls.min.js');
const hlsLicensePath = path.join(root, 'node_modules', 'hls.js', 'LICENSE');
const mediabunnyPath = path.join(root, 'node_modules', 'mediabunny', 'dist', 'bundles', 'mediabunny.min.cjs');
const mediabunnyLicensePath = path.join(root, 'node_modules', 'mediabunny', 'LICENSE');

await mkdir(distRoot, { recursive: true });
await mkdir(packageRoot, { recursive: true });

for (const platform of platforms) {
  const output = safeDistPath(platform);
  await rm(output, { recursive: true, force: true });
  await mkdir(path.join(output, 'vendor'), { recursive: true });
  const manifest = JSON.parse(await readFile(path.join(extensionRoot, platform, 'manifest.template.json'), 'utf8'));
  manifest.name = metadata.name;
  manifest.version = metadata.version;
  manifest.description = metadata.description;
  manifest.host_permissions = hostPermissions(metadata.connects);
  manifest.content_scripts[0].matches = metadata.matches;

  await writeFile(path.join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await writeFile(path.join(output, 'content.js'), content, 'utf8');
  await writeFile(path.join(output, 'background.js'), background, 'utf8');
  await copyFile(hlsPath, path.join(output, 'vendor', 'hls.min.js'));
  await copyFile(mediabunnyPath, path.join(output, 'vendor', 'mediabunny.min.js'));
  await copyFile(path.join(root, 'LICENSE'), path.join(output, 'LICENSE.txt'));
  await copyFile(hlsLicensePath, path.join(output, 'THIRD_PARTY_HLS_LICENSE.txt'));
  await copyFile(mediabunnyLicensePath, path.join(output, 'THIRD_PARTY_MEDIABUNNY_LICENSE.txt'));

  const extension = platform === 'firefox' ? 'xpi' : 'zip';
  const archive = path.join(packageRoot, `ziggy-chaturbate-suite-${platform}-${metadata.version}.${extension}`);
  await rm(archive, { force: true });
  await writeStoredZip(output, archive);
  process.stdout.write(`Built ${platform}: ${output}\nPackaged ${platform}: ${archive}\n`);
}
