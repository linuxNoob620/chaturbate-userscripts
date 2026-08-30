import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function eventually(read, message) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const value = read();
    if (value) return value;
    await new Promise(resolve => setTimeout(resolve, 1));
  }
  throw new Error(message);
}

async function testContentAdapter() {
  const storedWrites = [];
  const messages = [];
  const anchors = [];
  const documentEvents = [];
  let contentMessageListener;
  const chrome = {
    storage: {
      local: {
        async get() { return { existing: { value: 7 } }; },
        async set(value) { storedWrites.push(value); },
      },
    },
    runtime: {
      onMessage: { addListener(value) { contentMessageListener = value; } },
      async sendMessage(message) {
        messages.push(message);
        if (message.type === 'ziggy-gm-xhr') {
          return {
            kind: 'load',
            status: 201,
            statusText: 'Created',
            responseText: '{"ok":true}',
            responseHeaders: 'content-type: application/json',
            finalUrl: 'https://api.github.com/final',
          };
        }
        if (message.type === 'ziggy-open-tab') return { tabId: 42 };
        return { ok: true };
      },
    },
  };
  const document = {
    body: { appendChild(node) { anchors.push(node); } },
    documentElement: { appendChild(node) { anchors.push(node); } },
    addEventListener() {},
    dispatchEvent(event) { documentEvents.push(event); return true; },
    createElement(tag) {
      assert.equal(tag, 'a');
      return {
        style: {},
        click() { this.clicked = true; },
        remove() { this.removed = true; },
      };
    },
  };
  let adapter;
  let nextObjectUrl = 0;
  const testSetTimeout = (callback, delay, ...args) => {
    if (delay >= 60000) {
      queueMicrotask(() => callback(...args));
      return 0;
    }
    return setTimeout(callback, delay, ...args);
  };
  const preamble = (await readFile(path.join(root, 'extension', 'shared', 'content-preamble.js'), 'utf8'))
    .replace('__SCRIPT_NAME__', JSON.stringify('Adapter Test'))
    .replace('__SCRIPT_VERSION__', JSON.stringify('1.2.3'));
  const source = `${preamble}\n` +
    `globalThis.__ziggyAdapterTest = { GM_info, GM_getValue, GM_setValue, GM_xmlhttpRequest, GM_openInTab, GM_download };\n` +
    `  /* END VERBATIM USERSCRIPT BODY */\n})().catch(error => { globalThis.__ziggyAdapterFailure = error; });\n`;
  const context = vm.createContext({
    chrome,
    document,
    Blob,
    crypto,
    console,
    Promise,
    setTimeout: testSetTimeout,
    clearTimeout,
    URL: {
      createObjectURL() { nextObjectUrl += 1; return `blob:test-${nextObjectUrl}`; },
      revokeObjectURL() {},
    },
    location: { href: 'https://chaturbate.com/', origin: 'https://chaturbate.com' },
    CustomEvent: class CustomEvent {
      constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
    },
  });
  vm.runInContext(source, context, { filename: 'content-adapter-test.js' });
  adapter = await eventually(() => context.__ziggyAdapterTest, 'Content adapter did not initialize');
  if (context.__ziggyAdapterFailure) throw context.__ziggyAdapterFailure;

  assert.equal(adapter.GM_info.script.name, 'Adapter Test');
  assert.equal(adapter.GM_info.script.version, '1.2.3');
  assert.equal(adapter.GM_getValue('existing', null).value, 7);
  assert.equal(adapter.GM_getValue('missing', 'fallback'), 'fallback');
  adapter.GM_setValue('saved', ['same', 'type']);
  await eventually(() => storedWrites.length, 'GM_setValue did not persist');
  assert.equal(JSON.stringify(storedWrites[0]), JSON.stringify({ saved: ['same', 'type'] }));
  assert.equal(JSON.stringify(adapter.GM_getValue('saved', null)), JSON.stringify(['same', 'type']));

  const response = await new Promise((resolve, reject) => {
    adapter.GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://api.github.com/example',
      headers: { Accept: 'application/json' },
      data: '{"test":true}',
      timeout: 30000,
      onload: resolve,
      onerror: reject,
    });
  });
  assert.equal(response.status, 201);
  assert.equal(response.responseText, '{"ok":true}');
  const xhrMessage = messages.find(message => message.type === 'ziggy-gm-xhr');
  assert.equal(xhrMessage.request.method, 'POST');
  assert.equal(xhrMessage.request.data, '{"test":true}');
  assert.equal(xhrMessage.request.timeout, 30000);

  adapter.GM_openInTab('https://chaturbate.com/model/', { active: false, insert: true, setParent: true });
  const openMessage = await eventually(
    () => messages.find(message => message.type === 'ziggy-open-tab'),
    'GM_openInTab did not send a request',
  );
  assert.equal(openMessage.active, false);
  assert.equal(openMessage.insert, true);
  assert.equal(openMessage.setParent, true);

  await new Promise((resolve, reject) => {
    adapter.GM_download({
      url: new Blob(['snapshot'], { type: 'image/jpeg' }),
      name: 'model.jpg',
      onload: resolve,
      onerror: reject,
    });
  });
  assert.equal(anchors.length, 1);
  assert.equal(anchors[0].download, 'model.jpg');
  assert.equal(anchors[0].clicked, true);

  assert.equal(typeof contentMessageListener, 'function');
  let contextResponse;
  contentMessageListener({
    type: 'ziggy-context-open-rooms',
    context: { username: 'SweetMoonDoll', source: 'model-card', invocationId: 'invoke-1' },
  }, {}, value => { contextResponse = value; });
  assert.equal(contextResponse.ok, true);
  assert.equal(documentEvents.at(-1).type, 'ziggy-suite:open-rooms');
  assert.equal(documentEvents.at(-1).detail.modelId, 'sweetmoondoll');
  assert.equal(documentEvents.at(-1).detail.source, 'model-card');
  contentMessageListener({ type: 'ziggy-context-open-workshop' }, {}, value => { contextResponse = value; });
  assert.equal(contextResponse.ok, true);
  assert.equal(documentEvents.at(-1).type, 'ziggy-suite:open-workshop');
}

async function testBackgroundAdapter() {
  let listener;
  let installedListener;
  let startupListener;
  let contextClickListener;
  let tabRemovedListener;
  let tabUpdatedListener;
  const createdTabs = [];
  const removedTabs = [];
  const sentTabMessages = [];
  const contextMenuItems = [];
  const fetchCalls = [];
  const chrome = {
    runtime: {
      onMessage: { addListener(value) { listener = value; } },
      onInstalled: { addListener(value) { installedListener = value; } },
      onStartup: { addListener(value) { startupListener = value; } },
    },
    contextMenus: {
      removeAll(callback) { callback?.(); },
      create(value) { contextMenuItems.push(value); return value.id; },
      onClicked: { addListener(value) { contextClickListener = value; } },
    },
    tabs: {
      async create(value) { createdTabs.push(value); return { id: 88 }; },
      async remove(value) { removedTabs.push(value); },
      async sendMessage(tabId, message, options) { sentTabMessages.push({ tabId, message, options }); return { ok: true }; },
      onRemoved: { addListener(value) { tabRemovedListener = value; } },
      onUpdated: { addListener(value) { tabUpdatedListener = value; } },
    },
  };
  const fetch = async (url, init) => {
    fetchCalls.push({ url, init });
    return {
      status: 200,
      statusText: 'OK',
      url: `${url}?final=1`,
      headers: new Headers({ 'content-type': 'text/plain' }),
      async text() { return 'payload'; },
    };
  };
  const context = vm.createContext({ chrome, fetch, Headers, AbortController, URL, console, setTimeout, clearTimeout });
  const source = await readFile(path.join(root, 'extension', 'shared', 'background.js'), 'utf8');
  vm.runInContext(source, context, { filename: 'background-adapter-test.js' });
  assert.equal(typeof listener, 'function');
  assert.equal(typeof installedListener, 'function');
  assert.equal(typeof startupListener, 'function');
  assert.equal(typeof contextClickListener, 'function');
  assert.equal(typeof tabRemovedListener, 'function');
  assert.equal(typeof tabUpdatedListener, 'function');
  installedListener();
  assert.deepEqual(contextMenuItems.map(item => item.title), ['Ziggy Chaturbate Suite', 'Rooms', 'Open Workshop']);

  const dispatch = (message, sender = { tab: { id: 12, index: 3 } }) => new Promise((resolve, reject) => {
    let settled = false;
    const sendResponse = value => { settled = true; resolve(value); };
    const keepAlive = listener(message, sender, sendResponse);
    if (keepAlive !== true && !settled) setTimeout(() => reject(new Error(`No response for ${message.type}`)), 20);
  });

  const xhr = await dispatch({
    type: 'ziggy-gm-xhr',
    requestId: 'request-1',
    request: {
      method: 'POST',
      url: 'https://bongacams.com/tools/amf.php',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: 'method=getRoomData',
      anonymous: true,
      credentials: 'omit',
      timeout: 5000,
    },
  });
  assert.equal(xhr.kind, 'load');
  assert.equal(xhr.status, 200);
  assert.equal(xhr.responseText, 'payload');
  assert.equal(fetchCalls[0].init.credentials, 'omit');
  assert.equal(fetchCalls[0].init.body, 'method=getRoomData');
  assert.equal(fetchCalls[0].init.cache, undefined);

  const opened = await dispatch({ type: 'ziggy-open-tab', url: 'https://chaturbate.com/model/', active: false, insert: true, setParent: true });
  assert.equal(opened.tabId, 88);
  assert.equal(JSON.stringify(createdTabs[0]), JSON.stringify({
    url: 'https://chaturbate.com/model/',
    active: false,
    index: 4,
    openerTabId: 12,
  }));
  await dispatch({ type: 'ziggy-close-tab', tabId: 88 });
  await eventually(() => removedTabs.length, 'Tab close was not requested');
  assert.deepEqual(removedTabs, [88]);

  await dispatch({
    type: 'ziggy-context-capture',
    candidate: { username: 'Card_Model', source: 'model-card' },
    frameUrl: 'https://chaturbate.com/?multicam_mode=1',
    invocationId: 'invoke-card',
  }, { tab: { id: 21, url: 'https://chaturbate.com/room_model/' }, frameId: 0, url: 'https://chaturbate.com/?multicam_mode=1' });
  contextClickListener({ menuItemId: 'ziggy-suite-rooms', linkUrl: 'https://chaturbate.com/link_model/' }, { id: 21, url: 'https://chaturbate.com/room_model/' });
  await eventually(() => sentTabMessages.length >= 1, 'Rooms context action was not sent');
  assert.equal(sentTabMessages.at(-1).message.context.username, 'card_model');
  assert.equal(sentTabMessages.at(-1).message.context.source, 'model-card');
  assert.equal(sentTabMessages.at(-1).options.frameId, 0);
  await new Promise(resolve => setTimeout(resolve, 0));

  contextClickListener({ menuItemId: 'ziggy-suite-rooms', linkUrl: 'https://chaturbate.com/link_model/' }, { id: 21, url: 'https://chaturbate.com/room_model/' });
  await eventually(() => sentTabMessages.length >= 2, 'Direct-link context action was not sent');
  assert.equal(sentTabMessages.at(-1).message.context.username, 'link_model');
  assert.equal(sentTabMessages.at(-1).message.context.source, 'direct-link');
  await new Promise(resolve => setTimeout(resolve, 0));

  contextClickListener({ menuItemId: 'ziggy-suite-rooms' }, { id: 22, url: 'https://chaturbate.com/current_room/' });
  await eventually(() => sentTabMessages.length >= 3, 'Current-room fallback was not sent');
  assert.equal(sentTabMessages.at(-1).message.context.username, 'current_room');
  assert.equal(sentTabMessages.at(-1).message.context.source, 'current-room');
  await new Promise(resolve => setTimeout(resolve, 0));

  contextClickListener({ menuItemId: 'ziggy-suite-rooms', linkUrl: 'https://chaturbate.com/discover/' }, { id: 23, url: 'https://chaturbate.com/' });
  await eventually(() => sentTabMessages.length >= 4, 'General Rooms context action was not sent');
  assert.equal(sentTabMessages.at(-1).message.context.username, '');
  assert.equal(sentTabMessages.at(-1).message.context.source, 'none');

  contextClickListener({ menuItemId: 'ziggy-suite-workshop' }, { id: 24, url: 'https://chaturbate.com/' });
  await eventually(() => sentTabMessages.some(item => item.message.type === 'ziggy-context-open-workshop'), 'Workshop context action was not sent');
}

await testContentAdapter();
await testBackgroundAdapter();
process.stdout.write('Verified extension GM compatibility adapters.\n');
