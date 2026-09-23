/** Shared settings only. apply() replaces shared fields, preserving local UI/runtime.
 * Flat keys: room/id, group/id, multicam/field, reloaded/key, chat/field,
 * ignored/username, mobile/field. Dynamic identifiers use encodeURIComponent.
 * Missing room/group/member keys mean deletion; built-in groups always remain.
 * Payload input is the complete exported v4 shape, not a partial legacy import.
 */
function createSettingsSyncCodec() {
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const unsafe = new Set(['__proto__', 'constructor', 'prototype']);
  const sharedMulticam = ['favoriteFirst', 'notifyFavoritesOnly', 'notifyOnline', 'pollMs', 'maxStreamHeight', 'startupGroup', 'startOnOnlineFavorites', 'startupView', 'shortcuts', 'videoFit', 'freeZoom'];
  const sharedReloaded = ['animationoff', 'bigthumb', 'hidemt', 'newtabon', 'pclean', 'refreshoff', 'smallsnap', 'zoomoff'];
  const sharedMobile = ['enabled', 'hidePromos', 'compactBrowse', 'autoHideSeconds'];
  const chatFields = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c7a', 'c8', 'c10', 'language'];
  const chatKey = 'reloadedGlobalChatSettingsV1';
  const multicamKey = 'ryujo_multicam_v8';
  const mobileKey = 'cb_desktop_mobile_comfort_v1';
  const storageKeys = Object.freeze([multicamKey, mobileKey, ...sharedReloaded, chatKey, 'ignoredusers']);
  const systemGroups = [
    { id: 'library', name: '__library__', order: 0, system: true },
    { id: 'all', name: '__all__', order: 1, system: true },
    { id: 'online-favorites', name: '__online_favorites__', order: 2, system: true },
    { id: 'online', name: '__online__', order: 3, system: true },
    { id: 'fav', name: '__fav__', order: 4, system: true },
  ];
  const aggregateGroups = new Set(['library', 'online', 'online-favorites', 'online-following']);
  const reservedUsers = new Set(('tags,tag,auth,followed-cams,multicam,events,jobs,terms,privacy,support,billing,accounts,b,p,apps,affiliates,static,feedback,sitemap,home,about,rules,login,logout,signup,female-cams,male-cams,couple-cams,trans-cams,s,shortcuts,roomlist,photo_videos,in-private-show,external_link,dmca,contact,mobile,tipping,tokens,token-purchase,social,wiki,directory,spy-on-cams,private-shows,app,photos-videos,pm,inbox,find-friends,broadcasters,broadcast,discover,top,new,gold-shows,language,settings,en,es,de,fr,it,ja,ko,pt,ru,zh').split(','));
  const invalid = (message) => { throw new TypeError(`Invalid shared settings: ${message}`); };
  const object = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
  const string = (value, max) => typeof value === 'string' && value.length <= max;
  const integer = (value, max, min = 0) => Number.isSafeInteger(value) && value >= min && value <= max;
  const groupId = (value) => string(value, 48) && /^[a-z0-9_-]+$/i.test(value) && !unsafe.has(value) && value !== 'online-following';
  const username = (value) => string(value, 32) && /^[a-z0-9_-]{2,32}$/.test(value) && !/^\d+$/.test(value) && !unsafe.has(value) && !reservedUsers.has(value);
  const exactKeys = (value, keys) => object(value) && Object.keys(value).length === keys.length && keys.every((key) => own(value, key));

  function copy(value, ancestors = new Set(), depth = 0) {
    if (value === null || typeof value === 'boolean' || typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))) return value;
    if (!value || typeof value !== 'object' || ancestors.has(value) || depth > 64) return invalid('expected bounded acyclic JSON');
    const array = Array.isArray(value);
    if (!array && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return invalid('expected a plain JSON object');
    ancestors.add(value);
    const output = array ? [] : {};
    const keys = Reflect.ownKeys(value);
    if (array && keys.length !== value.length + 1) return invalid('sparse array');
    for (const key of keys) {
      if (array && key === 'length') continue;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (typeof key !== 'string' || unsafe.has(key) || !descriptor.enumerable || !own(descriptor, 'value')) return invalid('unsafe property');
      if (array && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length)) return invalid('non-JSON array');
      output[key] = copy(descriptor.value, ancestors, depth + 1);
    }
    ancestors.delete(value);
    return output;
  }

  function boundedCopy(value) {
    const output = copy(value);
    if (JSON.stringify(output).length > 2 * 1024 * 1024) return invalid('document exceeds size limit');
    return output;
  }

  function payloadCopy(payload) {
    const output = boundedCopy(payload);
    const components = output?.components;
    if (output?.format !== 'chaturbate-suite-settings-v4' || !exactKeys(components, ['multicamPro', 'reloaded', 'mobileCleanView'])) return invalid('complete v4 components are required');
    for (const [name, major] of [['multicamPro', 16], ['reloaded', 1], ['mobileCleanView', 2]]) {
      const component = components[name];
      if (!object(component) || !new RegExp(`^${major}\\.\\d+\\.\\d+(?:[-+][a-zA-Z0-9.-]+)?$`).test(component.version)) return invalid(`incompatible ${name} version`);
    }
    const multicam = components.multicamPro;
    if (!Array.isArray(multicam.rooms) || multicam.rooms.length > 1200 || !Array.isArray(multicam.groups) || multicam.groups.length > 80 || !object(multicam.settings)) return invalid('multicam schema');
    if (!object(components.reloaded.storage) || !object(components.mobileCleanView.settings)) return invalid('component settings schema');
    return output;
  }

  function validateValue(prefix, id, value) {
    if (prefix === 'room') {
      if (!username(id) || !exactKeys(value, ['id', 'addedAt', 'groups', 'groupOrder', 'order', 'notes']) || value.id !== id) return invalid('room record');
      if (!integer(value.addedAt, Number.MAX_SAFE_INTEGER) || !integer(value.order, 1000000) || !string(value.notes, 65536)) return invalid('room field');
      if (!Array.isArray(value.groups) || value.groups.length > 80 || new Set(value.groups).size !== value.groups.length || value.groups.some((group) => !groupId(group) || aggregateGroups.has(group))) return invalid('room membership');
      if (!exactKeys(value.groupOrder, value.groups) || Object.values(value.groupOrder).some((order) => !integer(order, 1000000))) return invalid('room group order');
    } else if (prefix === 'group') {
      if (!groupId(id) || !exactKeys(value, ['id', 'name', 'order', 'system']) || value.id !== id || !string(value.name, 80) || !value.name.trim() || /[\u0000-\u001f\u007f]/.test(value.name) || !integer(value.order, 10000) || typeof value.system !== 'boolean') return invalid('group record');
      const builtin = systemGroups.find((group) => group.id === id);
      if (builtin ? Object.keys(builtin).some((key) => builtin[key] !== value[key]) : value.system) return invalid('built-in group invariant');
    } else if (prefix === 'multicam') {
      if (!sharedMulticam.includes(id)) return invalid('unknown multicam field');
      if (['favoriteFirst', 'notifyFavoritesOnly', 'notifyOnline', 'startOnOnlineFavorites', 'freeZoom'].includes(id)) {
        if (typeof value !== 'boolean') return invalid('multicam boolean');
      } else if (id === 'pollMs') {
        if (!exactKeys(value, ['offline', 'private', 'error', 'online']) || Object.values(value).some((ms) => !integer(ms, 300000, 5000))) return invalid('poll intervals');
      } else if (id === 'shortcuts') {
        if (!exactKeys(value, ['focusAdd', 'refreshAll', 'gridView', 'pureMode']) || Object.values(value).some((key) => !string(key, 80) || /[\u0000-\u001f\u007f]/.test(key))) return invalid('shortcuts');
      } else if (id === 'maxStreamHeight' && ![0, 240, 360, 480, 720, 1080, 1440, 2160].includes(value)) return invalid('stream height');
      else if (id === 'startupGroup' && value !== 'last' && !groupId(value)) return invalid('startup group');
      else if (id === 'startupView' && !['last', 'auto', 'grid', 'phone'].includes(value)) return invalid('startup view');
      else if (id === 'videoFit' && !['contain', 'cover'].includes(value)) return invalid('video fit');
    } else if (prefix === 'reloaded') {
      if (!sharedReloaded.includes(id) || !string(value, 128)) return invalid('Reloaded preference');
    } else if (prefix === 'chat') {
      if (!chatFields.includes(id)) return invalid('unknown chat field');
      if (id === 'language' ? !string(value, 8) || (value !== '' && !/^[a-z-]{2,8}$/i.test(value)) : id === 'c7a' ? !integer(value, 1000, 2) : value !== 0 && value !== 1) return invalid('chat field');
    } else if (prefix === 'ignored') {
      if (!username(id) || value !== true) return invalid('ignored username');
    } else if (prefix === 'mobile') {
      if (!sharedMobile.includes(id) || (id === 'autoHideSeconds' ? !integer(value, 30) : typeof value !== 'boolean')) return invalid('mobile field');
    } else return invalid('unknown record type');
  }

  function mapCopy(map) {
    const output = boundedCopy(map);
    if (!object(output) || Object.keys(output).length > 5000) return invalid('shared map');
    const counts = { room: 0, group: 0, ignored: 0 };
    for (const [key, value] of Object.entries(output)) {
      const parts = key.split('/');
      if (parts.length !== 2 || !parts[1]) return invalid('record key');
      let id;
      try { id = decodeURIComponent(parts[1]); } catch (_) { return invalid('encoded record key'); }
      if (encodeURIComponent(id) !== parts[1] || unsafe.has(id)) return invalid('noncanonical record key');
      validateValue(parts[0], id, value);
      if (own(counts, parts[0])) counts[parts[0]] += 1;
    }
    const missingBuiltins = systemGroups.filter((group) => !own(output, `group/${encodeURIComponent(group.id)}`)).length;
    if (counts.room > 1200 || counts.group + missingBuiltins > 80 || counts.ignored > 1200) return invalid('record count');
    return output;
  }

  function orphanReferences(map) {
    const builtins = new Set(systemGroups.map((group) => group.id));
    const orphans = [];
    for (const [key, value] of Object.entries(map)) {
      if (!key.startsWith('room/')) continue;
      for (const id of value.groups) {
        const groupKey = `group/${encodeURIComponent(id)}`;
        if (!builtins.has(id) && !own(map, groupKey)) orphans.push({ referenceKey: key, groupKey });
      }
    }
    const startup = map['multicam/startupGroup'];
    if (startup !== undefined && startup !== 'last' && !builtins.has(startup)) {
      const groupKey = `group/${encodeURIComponent(startup)}`;
      if (!own(map, groupKey)) orphans.push({ referenceKey: 'multicam/startupGroup', groupKey });
    }
    return orphans;
  }

  function validateReferences(map) {
    const output = mapCopy(map);
    const orphan = orphanReferences(output)[0];
    if (orphan) return invalid(`orphan group reference: ${orphan.referenceKey} -> ${orphan.groupKey}`);
    return output;
  }

  // Select against the core's actual merged candidate. The client must remerge
  // after marking these operation keys blocked and rerun until this returns [].
  // Rolling fields back here would misrepresent same-key causal operation chains.
  function structuralConflictKeys(candidateMap, remoteMap, operations) {
    const candidate = mapCopy(candidateMap);
    const remote = validateReferences(remoteMap);
    const batch = boundedCopy(operations);
    if (!Array.isArray(batch) || batch.length > 512) return invalid('structural operation batch');
    const deletions = new Set();
    const referenceUpdates = new Set();
    for (const operation of batch) {
      if (!object(operation) || typeof operation.key !== 'string') return invalid('structural operation');
      if (own(operation, 'blocked')) {
        if (operation.blocked !== 'structural-conflict') return invalid('structural block marker');
        continue;
      }
      if (operation.key.startsWith('group/') && operation.deleted === true) deletions.add(operation.key);
      if ((operation.key.startsWith('room/') || operation.key === 'multicam/startupGroup')
        && operation.deleted !== true && own(operation, 'value')) referenceUpdates.add(operation.key);
    }
    const conflicts = new Set();
    for (const { referenceKey, groupKey } of orphanReferences(candidate)) {
      // Preserve concurrent memberships by refusing the local group deletion.
      if (own(remote, groupKey) && deletions.has(groupKey)) conflicts.add(groupKey);
      // A remote deletion cannot silently erase a newly submitted membership.
      else if (referenceUpdates.has(referenceKey)) conflicts.add(referenceKey);
      else return invalid(`unattributable orphan group reference: ${referenceKey} -> ${groupKey}`);
    }
    return [...conflicts].sort();
  }

  function capture(payload) {
    const current = payloadCopy(payload);
    const { multicamPro, reloaded, mobileCleanView } = current.components;
    const map = {};
    function put(prefix, id, value) {
      const key = `${prefix}/${encodeURIComponent(id)}`;
      if (own(map, key)) return invalid('duplicate record');
      map[key] = value;
    }
    for (const room of multicamPro.rooms) {
      if (!object(room)) return invalid('room');
      put('room', room.id, { id: room.id, addedAt: room.addedAt, groups: room.groups, groupOrder: room.groupOrder, order: room.order, notes: own(room, 'notes') ? room.notes : '' });
    }
    for (const group of multicamPro.groups) {
      if (!object(group)) return invalid('group');
      put('group', group.id, { id: group.id, name: group.name, order: group.order, system: group.system });
    }
    for (const key of sharedMulticam) if (own(multicamPro.settings, key)) put('multicam', key, multicamPro.settings[key]);
    for (const key of sharedReloaded) if (own(reloaded.storage, key)) put('reloaded', key, reloaded.storage[key]);
    for (const key of sharedMobile) if (own(mobileCleanView.settings, key)) put('mobile', key, mobileCleanView.settings[key]);
    if (own(reloaded.storage, chatKey)) {
      const raw = reloaded.storage[chatKey];
      if (!string(raw, 4096)) return invalid('chat settings size');
      let chat;
      try { chat = boundedCopy(JSON.parse(raw)); } catch (_) { return invalid('chat JSON'); }
      if (!exactKeys(chat, ['version', ...chatFields]) || chat.version !== 1) return invalid('chat schema version');
      for (const key of chatFields) put('chat', key, chat[key]);
    }
    if (own(reloaded.storage, 'ignoredusers')) {
      if (!string(reloaded.storage.ignoredusers, 65536)) return invalid('ignored users size');
      const users = new Set(reloaded.storage.ignoredusers.split(',').map((id) => id.trim().replace(/^@+/, '').replace(/^\/+|\/+$/g, '').toLowerCase()).filter(Boolean));
      for (const id of users) put('ignored', id, true);
    }
    return mapCopy(map);
  }

  function apply(payload, sharedMap) {
    const output = payloadCopy(payload);
    const map = mapCopy(sharedMap);
    const { multicamPro, reloaded, mobileCleanView } = output.components;
    const previousRooms = new Map(multicamPro.rooms.map((room) => [room.id, room]));
    multicamPro.rooms = [];
    multicamPro.groups = copy(systemGroups);
    for (const key of sharedMulticam) delete multicamPro.settings[key];
    for (const key of sharedReloaded) delete reloaded.storage[key];
    for (const key of sharedMobile) delete mobileCleanView.settings[key];
    delete reloaded.storage[chatKey];
    delete reloaded.storage.ignoredusers;
    const chat = { version: 1 };
    const ignored = [];
    for (const key of Object.keys(map).sort()) {
      const [prefix, encodedId] = key.split('/');
      const id = decodeURIComponent(encodedId);
      const value = map[key];
      if (prefix === 'room') multicamPro.rooms.push({ ...(previousRooms.get(id) || { muted: true, lastStatus: 'unknown', lastSeenOnline: 0 }), ...value, group: value.groups[0] || null });
      else if (prefix === 'group' && !systemGroups.some((group) => group.id === id)) multicamPro.groups.push(value);
      else if (prefix === 'multicam') multicamPro.settings[id] = value;
      else if (prefix === 'reloaded') reloaded.storage[id] = value;
      else if (prefix === 'mobile') mobileCleanView.settings[id] = value;
      else if (prefix === 'chat') chat[id] = value;
      else if (prefix === 'ignored') ignored.push(id);
    }
    multicamPro.rooms.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    multicamPro.groups.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    if (Object.keys(chat).length > 1) {
      const defaults = { version: 1, c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0, c7: 0, c7a: 100, c8: 0, c10: 0, language: '' };
      reloaded.storage[chatKey] = JSON.stringify({ ...defaults, ...chat });
    }
    if (ignored.length) reloaded.storage.ignoredusers = ignored.join(',');
    return output;
  }

  function stable(value) {
    if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
    if (object(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
    return JSON.stringify(value);
  }

  function rebase(basePayload, draftPayload, incomingPayload) {
    const base = capture(basePayload);
    const draft = capture(draftPayload);
    const merged = capture(incomingPayload);
    for (const key of new Set([...Object.keys(base), ...Object.keys(draft)])) {
      if (own(base, key) === own(draft, key) && stable(base[key]) === stable(draft[key])) continue;
      if (own(draft, key)) merged[key] = draft[key];
      else delete merged[key];
    }
    return apply(draftPayload, merged);
  }

  function withStorageValue(payload, key, nextRaw) {
    if (!storageKeys.includes(key) || (nextRaw !== null && typeof nextRaw !== 'string')) return invalid('storage key or raw value');
    const output = payloadCopy(payload);
    if (key === multicamKey || key === mobileKey) {
      let parsed = null;
      if (nextRaw !== null) {
        if (nextRaw.length > 2 * 1024 * 1024) return invalid('stored JSON size');
        try { parsed = boundedCopy(JSON.parse(nextRaw)); } catch (_) { return invalid('stored JSON'); }
        if (!object(parsed)) return invalid('stored settings object');
      }
      if (key === multicamKey) {
        if (parsed && (!Array.isArray(parsed.rooms) || !Array.isArray(parsed.groups) || !object(parsed.settings))) return invalid('stored multicam schema');
        const component = output.components.multicamPro;
        component.rooms = parsed ? parsed.rooms : [];
        component.groups = parsed ? parsed.groups : [];
        if (parsed) component.settings = parsed.settings;
      } else output.components.mobileCleanView.settings = parsed || {};
    } else if (nextRaw === null) delete output.components.reloaded.storage[key];
    else output.components.reloaded.storage[key] = nextRaw;
    capture(output);
    return output;
  }

  return {
    capture, apply, rebase, withStorageValue, storageKeys, validateReferences, structuralConflictKeys,
    validate: mapCopy,
    isStorageKey(key) { return storageKeys.includes(key); },
    sharedKeys: Object.freeze({ multicam: Object.freeze(sharedMulticam.slice()), reloaded: Object.freeze(sharedReloaded.slice()), mobile: Object.freeze(sharedMobile.slice()), chat: Object.freeze(chatFields.slice()) }),
  };
}
