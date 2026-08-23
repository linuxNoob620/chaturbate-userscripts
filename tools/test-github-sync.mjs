import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { webcrypto } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(here, '..', 'Chaturbate MultiCam Pro + Cam ARNA.user.js');
const source = fs.readFileSync(scriptPath, 'utf8');
const start = source.indexOf("  let githubSessionPassphrase = '';");
const end = source.indexOf('  function applySuiteSettingsPayload(parsed) {', start);
assert.ok(start >= 0 && end > start, 'GitHub sync implementation block was not found');
const implementation = source.slice(start, end);

const storedValues = new Map();
const context = vm.createContext({
  console,
  crypto: webcrypto,
  TextEncoder,
  TextDecoder,
  Uint8Array,
  Date,
  JSON,
  Number,
  String,
  Error,
  Promise,
  setTimeout,
  clearTimeout,
  navigator: { userAgent: 'Node test', platform: 'Windows' },
  btoa(value) { return Buffer.from(value, 'binary').toString('base64'); },
  atob(value) { return Buffer.from(value, 'base64').toString('binary'); },
  GM_getValue(key, fallback) { return storedValues.has(key) ? storedValues.get(key) : fallback; },
  GM_setValue(key, value) { storedValues.set(key, value); },
  alert() {},
  confirm() { return true; },
  location: { reload() {} },
  document: {},
});

const prelude = `
const MAX_CONFIG_BYTES = 2 * 1024 * 1024;
const GITHUB_SYNC_CONFIG_KEY = 'chaturbate_suite_github_sync_v1';
const GITHUB_SYNC_FORMAT = 'chaturbate-suite-settings-encrypted-v1';
const GITHUB_SYNC_TARGET = Object.freeze({
  owner: 'linuxNoob620', repo: 'chaturbate-userscript-settings', branch: 'main', path: 'settings/latest.enc.json'
});
const GITHUB_API_VERSION = '2022-11-28';
const GITHUB_PBKDF2_ITERATIONS = 250000;
const Storage = { load() { return { sample: true }; } };
function buildSuiteSettingsPayload(value) { return value; }
function openGithubSyncSetup() {}
function updateGithubSyncMenuLabel() {}
function applySuiteSettingsPayload(value) { return value; }
function exportSuiteSettingsLocal() {}
function importSuiteSettingsFile() {}
function downloadBlob() {}
function t(value) { return value; }
function $(tag, props = {}, children = []) { return { tag, props, children, append() {}, appendChild() {}, addEventListener() {}, querySelectorAll() { return []; }, remove() {} }; }
`;

vm.runInContext(`${prelude}\n${implementation}\n;globalThis.__syncTest = {
  loadGithubSyncConfig,
  saveGithubSyncConfig,
  encryptSuiteSettingsPayload,
  decryptSuiteSettingsEnvelope,
  uploadSuiteSettingsToGithub,
  downloadSuiteSettingsFromGithub
};`, context, { filename: 'github-sync-extracted.js' });

const api = context.__syncTest;
const payload = {
  format: 'chaturbate-suite-settings-v3',
  components: {
    multicamPro: { rooms: [{ id: 'model_one' }, { id: 'model_two' }], settings: { layoutSize: 2 } },
    reloaded: { storage: { bigthumb: 'yes' } },
  },
};
const passphrase = 'correct horse battery staple';
const envelope = await api.encryptSuiteSettingsPayload(payload, passphrase, 'Test PC');
assert.equal(envelope.format, 'chaturbate-suite-settings-encrypted-v1');
assert.equal(envelope.crypto.cipher, 'AES-GCM-256');
assert.deepEqual(await api.decryptSuiteSettingsEnvelope(envelope, passphrase), payload);
await assert.rejects(api.decryptSuiteSettingsEnvelope(envelope, 'wrong passphrase'), /Unable to decrypt settings/);

api.saveGithubSyncConfig({ token: 'test-token', passphrase, deviceName: 'Test PC', rememberPassphrase: false });
const persisted = JSON.parse(storedValues.get('chaturbate_suite_github_sync_v1'));
assert.equal(persisted.token, 'test-token');
assert.equal(persisted.passphrase, '', 'Passphrase must not persist when remember is disabled');
assert.equal(api.loadGithubSyncConfig().repo, 'chaturbate-userscript-settings');

const calls = [];
let uploadedContent = '';
context.GM_xmlhttpRequest = options => {
  calls.push({ method: options.method, url: options.url, data: options.data });
  if (options.method === 'GET') {
    setTimeout(() => options.onload({ status: 200, responseText: JSON.stringify({ sha: 'existing-sha' }) }), 0);
  } else {
    const body = JSON.parse(options.data);
    uploadedContent = body.content;
    setTimeout(() => options.onload({ status: 200, responseText: JSON.stringify({ commit: { sha: 'new-commit-sha' } }) }), 0);
  }
  return { abort() {} };
};

const config = {
  owner: 'linuxNoob620', repo: 'chaturbate-userscript-settings', branch: 'main', path: 'settings/latest.enc.json',
  token: 'test-token', deviceName: 'Test PC'
};
const upload = await api.uploadSuiteSettingsToGithub(config, passphrase, payload);
assert.equal(upload.commit, 'new-commit-sha');
assert.equal(calls.length, 2);
assert.equal(calls[0].method, 'GET');
assert.equal(calls[1].method, 'PUT');
assert.equal(JSON.parse(calls[1].data).sha, 'existing-sha', 'Existing GitHub file must be overwritten using its SHA');

context.GM_xmlhttpRequest = options => {
  setTimeout(() => options.onload({
    status: 200,
    responseText: JSON.stringify({ sha: 'new-commit-sha', content: uploadedContent }),
  }), 0);
  return { abort() {} };
};
const downloaded = await api.downloadSuiteSettingsFromGithub(config, passphrase);
assert.deepEqual(downloaded.payload, payload);
assert.equal(downloaded.sha, 'new-commit-sha');

console.log('GitHub sync tests passed: encryption, wrong-passphrase rejection, overwrite, and download/import.');
