// ==UserScript==
// @name              Chaturbate MultiCam Pro + Cam ARNA
// @name:zh-CN        Chaturbate 多开直播窗口
// @namespace         https://github.com/ryujo/roomgrid-multicam-pro
// @version           15.11.0
// @homepageURL       https://github.com/linuxNoob620/chaturbate-userscripts
// @supportURL        https://github.com/linuxNoob620/chaturbate-userscripts/issues
// @updateURL         https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Chaturbate%20MultiCam%20Pro%20%2B%20Cam%20ARNA.meta.js
// @downloadURL       https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Chaturbate%20MultiCam%20Pro%20%2B%20Cam%20ARNA.user.js
// @description       MultiCam Pro workstation, Cam ARNA dock tab, and Chaturbate Reloaded 1.8.0 in one userscript.
// @description:de    All-in-one-Livestream-Workstation: Multi-Room-Layouts, segmentierte Aufnahme, Reconnect, Warnungen, Screenshots, Wiedergabe, Teilen, temporäre URLs und Konfigurations-Tools.
// @description:es    Herramienta todo en uno para directos: cuadrícula/enfoque multisalón, grabación segmentada, reconexión, alertas, capturas, reproducción, compartir, URL temporales y configuración.
// @description:es-CO Herramienta todo en uno para directos: cuadrícula/enfoque multisalón, grabación segmentada, reconexión, alertas, capturas, reproducción, compartir, URL temporales y configuración.
// @description:it    Strumento tutto in uno per livestream: layout multi-room, registrazione segmentata, riconnessione, avvisi, screenshot, riproduzione, condivisione, URL temporanei e configurazione.
// @description:fr    Outil tout-en-un pour livestreams : vues multi-salons, enregistrement segmenté, reconnexion, alertes, captures, lecture, partage, URL temporaires et configuration.
// @description:fr-CA Outil tout-en-un pour livestreams : vues multi-salons, enregistrement segmenté, reconnexion, alertes, captures, lecture, partage, URL temporaires et configuration.
// @description:ru    Универсальный инструмент для livestream: сетка/фокус нескольких комнат, сегментная запись, переподключение, оповещения, снимки, воспроизведение, ссылки и настройки.
// @description:tr    Can yayınlar için hepsi bir arada araç: çoklu oda düzenleri, parçalı kayıt, yeniden bağlanma, uyarılar, ekran görüntüleri, oynatma, paylaşım ve ayarlar.
// @description:ro    Instrument all-in-one pentru livestream: layout multi-room, înregistrare segmentată, reconectare, alerte, capturi, redare, partajare, URL temporare și configurare.
// @description:no    Alt-i-ett-verktøy for direktestrømmer: multirom-oppsett, segmentert opptak, tilkobling på nytt, varsler, skjermbilder, avspilling, deling og innstillinger.
// @description:nl    Alles-in-één livestreamtool: multi-room raster/focus, gesegmenteerde opname, opnieuw verbinden, meldingen, screenshots, afspelen, delen, tijdelijke URL's en configuratie.
// @description:pl    Wszechstronne narzędzie livestream: układy wielu pokoi, nagrywanie segmentowe, ponowne łączenie, alerty, zrzuty, odtwarzanie, udostępnianie i konfiguracja.
// @description:ja    ライブ配信用オールインワンツール：複数ルーム表示、分割録画、自動再接続、通知、スクリーンショット、再生操作、共有、一時URL、設定管理。
// @description:el    Εργαλείο livestream όλα σε ένα: πολλαπλές αίθουσες, τμηματική εγγραφή, επανασύνδεση, ειδοποιήσεις, στιγμιότυπα, αναπαραγωγή, κοινή χρήση και ρυθμίσεις.
// @description:hu    Minden egyben livestream eszköz: több szoba elrendezése, szegmenses felvétel, újracsatlakozás, riasztások, képernyőképek, lejátszás, megosztás és beállítások.
// @description:fi    All-in-one-livestream-työkalu: monihuoneasettelut, segmentoitu tallennus, uudelleenyhdistys, hälytykset, kuvakaappaukset, toisto, jakaminen ja asetukset.
// @description:ar    أداة بث مباشر شاملة: تخطيطات غرف متعددة، تسجيل مقسم، إعادة اتصال ذكية، تنبيهات، لقطات شاشة، تشغيل، مشاركة، روابط مؤقتة وأدوات إعداد.
// @description:hi    लाइवस्ट्रीम के लिए ऑल-इन-वन टूल: मल्टी-रूम लेआउट, सेगमेंट रिकॉर्डिंग, रीकनेक्ट, अलर्ट, स्क्रीनशॉट, प्लेबैक, शेयरिंग, अस्थायी URL और कॉन्फिग।
// @description:id    Alat livestream serba bisa: tata letak multi-room, rekaman tersegmentasi, sambung ulang, peringatan, screenshot, pemutaran, berbagi, URL sementara, dan konfigurasi.
// @description:ko    라이브스트림 올인원 도구: 다중 방 레이아웃, 분할 녹화, 재연결, 알림, 스크린샷, 재생 제어, 공유, 임시 URL 및 설정 도구.
// @description:pt-PT Ferramenta tudo-em-um para livestream: layouts multi-sala, gravação segmentada, reconexão, alertas, capturas, reprodução, partilha, URLs temporários e configuração.
// @description:pt-BR Ferramenta tudo em um para livestream: layouts multi-sala, gravação segmentada, reconexão, alertas, capturas, reprodução, compartilhamento, URLs temporários e configuração.
// @description:zh    一体化直播工作台工具：多房间网格/主屏布局、分段录制、智能重连、提醒、截图、播放控制、分享、临时 URL 和配置管理。
// @description:zh-CN 一体化直播工作台工具：多房间网格/主屏布局、分段录制、智能重连、提醒、截图、播放控制、分享、临时 URL 和配置管理。
// @description:zh-TW 一體化直播工作台工具：多房間網格/主屏佈局、分段錄製、智慧重連、提醒、截圖、播放控制、分享、臨時 URL 和設定管理。
// @description:cs    Univerzální nástroj pro livestream: rozvržení více místností, segmentované nahrávání, opětovné připojení, upozornění, snímky, přehrávání, sdílení a nastavení.
// @description:sk    Univerzálny nástroj pre livestream: rozloženia viacerých miestností, segmentované nahrávanie, opätovné pripojenie, upozornenia, snímky, prehrávanie, zdieľanie a nastavenia.
// @description:sl    Vsestransko orodje za livestream: večsobne postavitve, segmentno snemanje, ponovna povezava, opozorila, posnetki zaslona, predvajanje, deljenje in nastavitve.
// @description:sv    Allt-i-ett-verktyg för livestream: flerrumslayouter, segmenterad inspelning, återanslutning, varningar, skärmbilder, uppspelning, delning och inställningar.
// @description:sr    Sve-u-jednom alat za livestream: rasporedi više soba, segmentirano snimanje, ponovno povezivanje, upozorenja, snimci ekrana, reprodukcija, deljenje i podešavanja.
// @description:af    Alles-in-een livestream-nutsding: veelkamer-uitlegte, gesegmenteerde opname, herkoppeling, waarskuwings, skermskote, afspeel, deel, tydelike URL's en instellings.
// @description:sq    Mjet gjithëpërfshirës për livestream: pamje me shumë dhoma, regjistrim me segmente, rilidhje, njoftime, pamje ekrani, riprodhim, ndarje dhe konfigurim.
// @description:hy    Լայվսթրիմի համապարփակ գործիք՝ բազմասենյակ դասավորություններ, հատվածային ձայնագրում, վերամիացում, ծանուցումներ, սքրինշոթեր, նվագարկում, կիսում և կարգավորումներ։
// @description:be    Універсальны інструмент для livestream: некалькі пакояў, сегментаваны запіс, паўторнае падключэнне, абвесткі, здымкі экрана, прайграванне, абмен і налады.
// @description:bg    Универсален инструмент за livestream: многостаен изглед, сегментиран запис, повторно свързване, известия, снимки, възпроизвеждане, споделяне и настройки.
// @description:da    Alt-i-et livestream-værktøj: multirums-layouts, segmenteret optagelse, genforbindelse, advarsler, skærmbilleder, afspilning, deling, midlertidige URL'er og opsætning.
// @description:et    Kõik-ühes livestreami tööriist: mitme ruumi paigutused, segmenditud salvestus, taasühendus, teavitused, kuvatõmmised, taasesitus, jagamine ja seaded.
// @description:he    כלי סטרימינג הכל-באחד: פריסות מרובות חדרים, הקלטה מחולקת, חיבור מחדש, התראות, צילומי מסך, הפעלה, שיתוף, כתובות זמניות והגדרות.
// @description:hr    Sve-u-jednom alat za livestream: rasporedi više soba, segmentirano snimanje, ponovno povezivanje, upozorenja, snimke zaslona, reprodukcija, dijeljenje i postavke.
// @description:fa    ابزار جامع پخش زنده: چیدمان چند اتاق، ضبط بخش‌بندی‌شده، اتصال مجدد، هشدارها، اسکرین‌شات، پخش، اشتراک‌گذاری، URL موقت و تنظیمات.
// @description:ur    لائیو اسٹریم کے لیے آل اِن ون ٹول: ملٹی روم لے آؤٹ، سیگمنٹڈ ریکارڈنگ، دوبارہ کنکشن، الرٹس، اسکرین شاٹس، پلے بیک، شیئرنگ اور سیٹنگز۔
// @description:bn    লাইভস্ট্রিমের অল-ইন-ওয়ান টুল: মাল্টি-রুম লেআউট, সেগমেন্টেড রেকর্ডিং, রিকানেক্ট, অ্যালার্ট, স্ক্রিনশট, প্লেব্যাক, শেয়ারিং ও সেটিংস।
// @description:th    เครื่องมือไลฟ์สตรีมแบบครบวงจร: เลย์เอาต์หลายห้อง การบันทึกแบบแบ่งช่วง การเชื่อมต่อใหม่ การแจ้งเตือน ภาพหน้าจอ การเล่น การแชร์ และการตั้งค่า
// @description:eo    Ĉio-en-unu livestream-ilo: plurĉambraj aranĝoj, segmenta registrado, rekonekto, atentigoj, ekrankopioj, reprodukto, kunhavigo, portempaj URL-oj kaj agordoj.
// @description:ug    بىردە ھەممىسى بار livestream قورالى: كۆپ ھۇجرىلىق كۆرۈنۈش، بۆلەكلىك خاتىرىلەش، قايتا ئۇلاش، ئاگاھلاندۇرۇش، ئېكران سۈرىتى، قويۇش، ھەمبەھىرلەش ۋە تەڭشەكلەر.
// @description:vi    Công cụ livestream tất cả trong một: bố cục nhiều phòng, ghi theo phân đoạn, kết nối lại, cảnh báo, ảnh chụp màn hình, phát lại, chia sẻ, URL tạm thời và cấu hình.
// @author            RYUJO + user006-ui + Ladroop
// @license           MIT
// @match             https://chaturbate.com/*
// @match             https://*.chaturbate.com/*
// @require           https://cdn.jsdelivr.net/npm/hls.js@1.6.16/dist/hls.min.js
// @grant             GM_xmlhttpRequest
// @grant             GM_getValue
// @grant             GM_setValue
// @grant             GM_download
// @grant             window.focus
// @connect           archivebate.com
// @connect           recu.me
// @connect           showcamrips.com
// @connect           camshowrecordings.com
// @connect           camwh.com
// @connect           topcamvideos.com
// @connect           lovecamporn.com
// @connect           camwhores.tv
// @connect           bestcam.tv
// @connect           xhomealone.com
// @connect           stream-leak.com
// @connect           mfcamhub.com
// @connect           camshowrecord.net
// @connect           camwhoresbay.com
// @connect           camsave1.com
// @connect           onscreens.me
// @connect           livecamrips.to
// @connect           cumcams.cc
// @connect           allmy.cam
// @connect           livecamsrip.com
// @connect           camsrip.com
// @connect           translate.googleapis.com
// @connect           www.camsoda.com
// @connect           stripchat.com
// @connect           bongacams.com
// @connect           webchat.cam4.com
// @connect           cam4.com
// @connect           manifest-server.naiadsystems.com
// @connect           api-edge.myfreecams.com
// @connect           edgevideo.myfreecams.com
// @connect           api.github.com
// @run-at            document-end
// ==/UserScript==

/*
 * MIT License
 *
 * Copyright (c) 2026 RYUJO
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function () {
  'use strict';

  // v9.0: 防止脚本被重复粘贴 / 重复安装时同页运行两次。
  // 你上传的 enhancer.txt 是两个相同脚本拼在一起；没有这个保护会导致 UI、轮询、HLS 实例重复。
  const INSTANCE_KEY = '__roomGridMultiCamWorkstationRunning';
  if (window[INSTANCE_KEY]) {
    try { console.warn('[RoomGrid] duplicate userscript instance blocked'); } catch (_) {}
    return;
  }
  window[INSTANCE_KEY] = true;

  /* =============================================================
   * 0. 工具层 / Utils
   * ============================================================= */
  const $ = (tag, props = {}, children = []) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'class') el.className = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'html') setTrustedHtml(el, v);
      else if (k in el) el[k] = v;
      else el.setAttribute(k, v);
    }
    for (const c of [].concat(children)) {
      if (c == null || c === false) continue;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    const title = typeof props.title === 'string' ? props.title.trim() : '';
    if (title) setElementHint(el, title);
    return el;
  };

  function setElementHint(el, text) {
    if (!el || !text) return el;
    const v = String(text).trim();
    if (!v) return el;
    try { el.title = v; } catch (_) {}
    try { el.dataset.hint = v; } catch (_) {}
    try {
      if (/^(BUTTON|INPUT|SELECT|TEXTAREA)$/i.test(el.tagName || '')) {
        el.setAttribute('aria-label', v);
      }
    } catch (_) {}
    return el;
  }

  function htmlEscape(s) {
    return String(s ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
  }

  const TRUSTED_HTML_MARK = '__roomgridTrustedHtml';
  function trustedHtml(html) { return { [TRUSTED_HTML_MARK]: true, html: String(html ?? '') }; }
  function setTrustedHtml(el, value) {
    if (!el) return;
    if (value && typeof value === 'object' && value[TRUSTED_HTML_MARK] === true) el.innerHTML = value.html;
    else el.textContent = String(value ?? '');
  }

  const ICONS = {
    menu: '<path d="M5 7h14M5 12h14M5 17h14"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.2-5M4 5v5h5"/><path d="M4 13a8 8 0 0 0 14.2 5M20 19v-5h-5"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    volume: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8a5 5 0 0 1 0 8"/>',
    volumeOff: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M18 9l-4 4M14 9l4 4"/>',
    camera: '<path d="M4 8h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="14" r="4"/>',
    record: '<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>',
    stop: '<rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" stroke="none"/>',
    pip: '<rect x="4" y="5" width="16" height="14" rx="2"/><rect x="12" y="12" width="6" height="4" rx="1"/>',
    expand: '<path d="M8 4H4v4M16 4h4v4M8 20H4v-4M20 16v4h-4"/>',
    more: '<circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    resize: '<path d="M9 15h6V9M7 21h12V9"/>',
    grid: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
    focus: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h8v6H8z"/>',
    clean: '<path d="M4 12s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/><circle cx="12" cy="12" r="2"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="M15 15l5 5"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    external: '<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/>',
    folder: '<path d="M4 7h7l2 2h7v11H4z"/>',
    star: '<path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"/>',
    split: '<rect x="3" y="5" width="8" height="14" rx="2"/><rect x="13" y="5" width="8" height="14" rx="2"/>',
    swap: '<path d="M7 7h11l-3-3M17 17H6l3 3"/>',
    move: '<path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    trash: '<path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 14h8l1-14"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
  };

  function iconSvg(name, size = 16) {
    const body = ICONS[name] || ICONS.more;
    return `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  }

  function iconLabel(name, text, size = 15) {
    return `${iconSvg(name, size)}<span class="btn-label">${htmlEscape(text)}</span>`;
  }

  const debounce = (fn, ms = 200) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };

  const fmtTime = (ts) => {
    if (!ts) return '—';
    const diff = (Date.now() - ts) / 1000;
    const ago = (n, u) => LANG === 'zh' ? `${n}${u} 前` : `${n}${u} ago`;
    if (diff < 60) return ago(Math.floor(diff), 's');
    if (diff < 3600) return ago(Math.floor(diff / 60), 'm');
    if (diff < 86400) return ago(Math.floor(diff / 3600), 'h');
    return ago(Math.floor(diff / 86400), 'd');
  };

  const uuid = () => {
    try {
      if (crypto?.randomUUID) return 'g_' + crypto.randomUUID().replace(/-/g, '').slice(0, 10);
      if (crypto?.getRandomValues) {
        const buf = new Uint32Array(2);
        crypto.getRandomValues(buf);
        return 'g_' + [...buf].map(n => n.toString(36)).join('').slice(0, 10);
      }
    } catch (_) {}
    return 'g_' + Math.random().toString(36).slice(2, 12);
  };

  const LIBRARY_GROUP_ID = 'library';
  const DEFAULT_GROUP_ID = 'all';
  const ONLINE_GROUP_ID = 'online';
  const ONLINE_FAVORITES_GROUP_ID = 'online-favorites';
  const FAVORITE_GROUP_ID = 'fav';

  // v15.5: 稳定状态。多工作台/多窗口同时轮询时，不再用 loading / transient error 覆盖
  // 已确认的 online/offline/private，避免筛选、分页和 HLS 反复重建造成闪屏。
  const STABLE_ROOM_STATUSES = new Set(['online', 'offline', 'private']);
  function isStableRoomStatus(status) {
    return STABLE_ROOM_STATUSES.has(String(status || ''));
  }
  function isTransientRoomStatus(status) {
    return status === 'loading' || status === 'error';
  }

  function defaultShortcuts() {
    return {
      focusAdd: '/',
      refreshAll: 'r',
      gridView: 'g',
      focusView: 'f',
      pureMode: 'alt+p',
      viewerMode: 'alt+v',
      focusThumbs: 'alt+t',
      recordingCenter: 'alt+shift+c',
      recordPage: 'alt+shift+r',
      openRoom: 'o',
    };
  }

  function normalizeShortcutSpec(value) {
    const raw = String(value || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!raw) return '';
    const parts = raw.split('+').filter(Boolean);
    const mods = new Set();
    let key = '';
    for (const part of parts) {
      if (part === 'control') mods.add('ctrl');
      else if (part === 'cmd' || part === 'command') mods.add('meta');
      else if (['ctrl', 'meta', 'alt', 'shift'].includes(part)) mods.add(part);
      else key = part === ' ' ? 'space' : part;
    }
    if (!key) return '';
    const out = [];
    ['ctrl', 'meta', 'alt', 'shift'].forEach(m => { if (mods.has(m)) out.push(m); });
    out.push(key);
    return out.join('+');
  }

  function sanitizeShortcuts(input, fallback = defaultShortcuts()) {
    const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const out = {};
    for (const [action, spec] of Object.entries(fallback)) {
      out[action] = normalizeShortcutSpec(source[action]) || normalizeShortcutSpec(spec);
    }
    return out;
  }

  function shortcutFromEvent(e) {
    const keyRaw = e.code === 'Space' ? 'space' : String(e.key || '').toLowerCase();
    const key = keyRaw === ' ' ? 'space' : keyRaw;
    if (!key || ['control', 'shift', 'alt', 'meta'].includes(key)) return '';
    const out = [];
    if (e.ctrlKey) out.push('ctrl');
    if (e.metaKey) out.push('meta');
    if (e.altKey) out.push('alt');
    if (e.shiftKey) out.push('shift');
    out.push(key);
    return normalizeShortcutSpec(out.join('+'));
  }

  function shortcutLabel(spec) {
    const normalized = normalizeShortcutSpec(spec);
    if (!normalized) return '';
    const names = { ctrl: 'Ctrl', meta: 'Meta', alt: 'Alt', shift: 'Shift', space: 'Space', arrowleft: 'Left', arrowright: 'Right', arrowup: 'Up', arrowdown: 'Down' };
    return normalized.split('+').map(part => names[part] || (part.length === 1 ? part.toUpperCase() : part)).join('+');
  }

  function defaultVideoTransform() {
    return { mirror: false, flip: false, rotation: 0, zoom: 1, x: 0, y: 0 };
  }

  function sanitizeVideoTransform(input) {
    const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const rotationRaw = Number(src.rotation) || 0;
    const rotation = ((Math.round(rotationRaw / 90) * 90) % 360 + 360) % 360;
    return {
      mirror: !!src.mirror,
      flip: !!src.flip,
      rotation,
      zoom: Math.max(1, Math.min(20, Number(src.zoom) || 1)),
      x: Math.max(-5000, Math.min(5000, Number(src.x) || 0)),
      y: Math.max(-5000, Math.min(5000, Number(src.y) || 0)),
    };
  }

  function isDefaultVideoTransform(transform) {
    const t = sanitizeVideoTransform(transform);
    return !t.mirror && !t.flip && t.rotation === 0 && t.zoom === 1 && t.x === 0 && t.y === 0;
  }

  function sanitizeVideoTransformMap(input) {
    const out = {};
    if (input && typeof input === 'object' && !Array.isArray(input)) {
      for (const [id, value] of Object.entries(input)) {
        const roomId = normalizeUsername(id);
        if (!roomId) continue;
        const transform = sanitizeVideoTransform(value);
        if (!isDefaultVideoTransform(transform)) out[roomId] = transform;
      }
    }
    return out;
  }

  function encodeSharePayload(data) {
    const json = JSON.stringify(data);
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode(...bytes.slice(i, i + 0x8000));
    }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function decodeSharePayload(data) {
    const normalized = String(data || '').replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function normalizeUsername(raw) {
    let v = String(raw || '').trim();
    if (!v) return '';
    try {
      if (/^https?:\/\//i.test(v)) {
        const url = new URL(v);
        v = url.pathname.split('/').filter(Boolean)[0] || '';
      }
    } catch (_) {}
    return v.replace(/^@+/, '').replace(/^\/+|\/+$/g, '').trim().toLowerCase();
  }

  function usernameSyntaxOk(v) {
    v = normalizeUsername(v);
    return !!v && v.length >= 2 && v.length <= 32 && /^[a-z0-9_-]+$/i.test(v) && !/^\d+$/.test(v);
  }

  function safeGroupName(raw, fallback = '') {
    const v = String(raw ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
    return (v || fallback || '').slice(0, 80);
  }

  function isSafeHttpUrl(raw, base = location.href) {
    try {
      const u = new URL(String(raw || ''), base);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch (_) { return false; }
  }

  function isSafeStreamUrl(raw) {
    const s = String(raw || '').trim();
    if (!s || s.length > 4096 || /[\u0000-\u001f\u007f]/.test(s)) return false;
    // Accept only http(s). Do not require a .m3u8 suffix because some CDNs serve playlists through signed routes.
    return isSafeHttpUrl(s);
  }

  function safeChaturbateHost(host) {
    const h = String(host || '').toLowerCase();
    return h === 'chaturbate.com' || h.endsWith('.chaturbate.com');
  }

  async function copyText(text) {
    text = String(text || '');
    try { await navigator.clipboard.writeText(text); return true; }
    catch (_) {
      try {
        const ta = $('textarea', { value: text, style: { position: 'fixed', left: '-9999px', top: '-9999px', opacity: '0' } });
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch (_) { return false; }
    }
  }

  function downloadBlob(blob, filename) {
    const a = $('a', { href: URL.createObjectURL(blob), download: filename });
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { try { URL.revokeObjectURL(a.href); a.remove(); } catch (_) {} }, 1200);
  }

  function openNoopener(url, target = '_blank') {
    const safeTarget = target || '_blank';
    const w = window.open(String(url || 'about:blank'), safeTarget, 'noopener,noreferrer');
    try { if (w) w.opener = null; } catch (_) {}
    return w;
  }

  function safeFilePart(v) {
    return String(v || 'room').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 48) || 'room';
  }

  function stampForFile() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  function stopMediaElement(media, remove = false) {
    if (!media) return;
    try { media.muted = true; media.volume = 0; media.pause(); } catch (_) {}
    try {
      const srcObject = media.srcObject;
      if (srcObject && typeof srcObject.getTracks === 'function') {
        srcObject.getTracks().forEach(track => { try { track.stop(); } catch (_) {} });
      }
    } catch (_) {}
    try { media.srcObject = null; } catch (_) {}
    try {
      media.querySelectorAll?.('source').forEach(source => {
        try { source.removeAttribute('src'); source.src = ''; source.remove(); } catch (_) {}
      });
    } catch (_) {}
    try { media.removeAttribute('src'); media.src = ''; media.load(); } catch (_) {}
    if (remove) { try { media.remove(); } catch (_) {} }
  }

  function stopAllPageMedia(root = document) {
    // 当前页打开工作台、新开工作台或整页卸载前，先切断页面上原有的音视频。
    try { root.querySelectorAll('video,audio').forEach(media => stopMediaElement(media, false)); } catch (_) {}
  }

  /* =============================================================
   * 0.5. 国际化 / i18n  ——  默认跟随浏览器语言，可手动切换
   * ============================================================= */
  const I18N = {
    en: {
      // ---- workstation chrome ----
      title: 'RoomGrid MultiCam Pro',
      appTagline: 'All-in-one multiview workstation for rooms, recording, alerts, screenshots, reconnects, and data tools.',
      addPlaceholder: 'Username ↵',
      searchPlaceholder: 'Search rooms',
      invalidUsername: 'Invalid username',
      hideOffline: 'Hide offline',
      hidePrivate: 'Hide private',
      onlyOnline: 'Online only',
      sortLabel: 'Sort',
      sortManual: 'Manual',
      sortStatus: 'By status',
      sortName: 'By name',
      sortAdded: 'By added time',
      refreshAll: 'Refresh all',
      notifyOnline: 'Online alerts',
      notifyFavoritesOnly: 'Alerts for favorites only',
      startOnOnlineFavorites: 'Open on Online Favorites at startup',
      notifyTitle: 'Desktop notification + card flash when a model goes online',
      collapseSidebar: '',
      viewGrid: 'Grid',
      viewFocus: 'Focus',
      viewPhone: 'Phone',
      viewSplit: 'Split',
      viewModeLabel: 'Layout',
      visibleRooms: 'Visible models',
      phoneAutoMode: 'Automatically use Phone mode on phones',
      moreOps: 'More',
      pureMode: 'Clean',
      pureModeOn: 'Clean mode on',
      pureModeOff: 'Exit clean mode',
      pureModeHint: 'Temporarily hide all controls and overlays. Shortcut: Alt+P / Alt+C. Press Esc to exit.',
      viewerMode: 'Window first',
      viewerModeOn: 'Window-first mode on',
      viewerModeOff: 'Exit window-first',
      viewerModeHint: 'Hide the app shell and keep room windows visible. Shortcut: Alt+V.',
      focusThumbsShow: 'Show thumbnails',
      focusThumbsHide: 'Hide thumbnails',
      focusThumbsHint: 'Show or hide the thumbnail rail in Focus mode. Shortcut: Alt+T.',
      videoFitContain: 'Fit: full image',
      videoFitCover: 'Fit: fill window',
      videoFitHint: 'Switch between full image and cropped fill.',
      playbackSettingsTitle: 'Playback settings',
      maxStreamHeight: 'Max stream quality',
      maxQualityAuto: 'Auto / no cap',
      freeZoomLabel: 'Ctrl/Command + wheel zoom',
      freeZoomHint: 'Zoom a card with Ctrl/Command + mouse wheel, drag while zoomed, double-click to reset.',
      pureExitHint: 'Exit clean mode. Shortcut: Alt+P / Alt+C or Esc.',
      pureExitChip: 'Clean · Alt+P/C / Esc',
      syncedFromOtherTab: '(synced from another tab)',
      hintAddInput: 'Type a username and press Enter. Shortcut: /',
      hintSearchInput: 'Filter visible rooms by username',
      hintSidebarToggle: 'Show / hide group sidebar',
      hintVolume: 'Global volume. Per-room mute is still respected.',
      hintGridSize: 'Base tile size in grid view',
      hintSort: 'Sort rooms in the current group',
      hintMainRatio: 'Main-screen height in Focus mode. You can also drag the separator.',
      hintMainAspect: 'Main-screen aspect ratio in Focus mode',
      hintThumbSize: 'Thumbnail width in Focus mode',
      hintGroupTab: (n) => `Switch to ${n}. Drag rooms here to add them to this group.`,
      hintOnlineFavoritesTab: 'Show favorite rooms that are online now.',
      hintLibraryTab: 'Show every saved room. The remove button deletes globally in this view.',
      hintNewGroup: 'Create an isolated group',
      hintMoreMenu: 'More tools and maintenance',
      // ---- sidebar ----
      groupsHeading: 'GROUPS',
      quickViewsHeading: 'QUICK VIEWS',
      myGroupsHeading: 'MY GROUPS',
      groupLibrary: 'All saved',
      groupAll: 'Default',
      groupOnline: 'Online now',
      groupOnlineFav: 'Online Favorites',
      groupFav: 'Favorites',
      newGroup: 'New group',
      newGroupPrompt: 'New group name:',
      renameGroup: 'Rename',
      renameGroupPrompt: 'Rename to:',
      deleteGroup: 'Delete group',
      deleteGroupConfirm: (n) => `Delete group "${n}"? Rooms stay saved and are only removed from this group.`,
      statTotal: 'Total',
      statOnline: 'Online',
      statMuted: 'Muted',
      // ---- card ----
      opRefresh: 'Refresh',
      opMuteToggle: 'Toggle mute',
      opPause: 'Pause',
      opResume: 'Resume',
      opScreenshot: 'Screenshot current frame',
      opRecordStart: 'Record current card',
      opRecordStop: 'Stop recording',
      opPiP: 'Picture-in-Picture',
      opFullscreen: 'Fullscreen',
      opMoveGroup: 'Add to group',
      opRemove: 'Remove from current group',
      opDeleteRoom: 'Delete saved room',
      opMirror: 'Mirror image',
      opFlip: 'Flip image',
      opRotateLeft: 'Rotate left',
      opRotateRight: 'Rotate right',
      opResetView: 'Reset view',
      opOpenRoom: 'Open room',
      opCopyUsername: 'Copy username',
      opFavoriteAdd: 'Add favorite',
      opFavoriteRemove: 'Remove favorite',
      opMoveToFavorites: 'Move to favorites only',
      opAddSplit: 'Add to Split View',
      splitView: 'Split View',
      splitAddedFirst: (n) => `${n} added to pane 1. Choose a second model.`,
      splitAlreadyAdded: 'This model is already in Split View',
      splitNeedTwo: 'Choose two models before opening Split View',
      splitChoosePane: 'Choose pane to replace',
      splitReplacePane: (n, name) => `Replace pane ${n}: ${name}`,
      splitPickerTitle: (n) => `Choose model for pane ${n}`,
      splitPickerSearch: 'Search saved models',
      splitQuickPreview: 'Quick preview',
      splitPreviewHint: 'Long-press a model or use its preview button.',
      splitPreviewUse: (n) => `Use in pane ${n}`,
      splitPreviewRefresh: 'Refresh preview',
      splitPreviewUnavailable: 'Preview unavailable',
      splitPreviewClose: 'Close preview',
      splitOnlineFavorites: 'Online Favorites',
      splitOnline: 'Online',
      splitFavorites: 'Favorites',
      splitAllSaved: 'All Saved',
      splitOtherPane: 'Already in the other pane',
      splitCurrentPane: 'Already in this pane',
      splitNoMatches: 'No matching saved models',
      splitReplace: 'Replace',
      splitPrevOnline: 'Previous online model',
      splitNextOnline: 'Next online model',
      splitNoOtherOnline: 'No other online models available',
      splitSwap: 'Swap panes',
      splitExit: 'Exit split',
      splitFullscreen: 'Fullscreen',
      splitControlsPosition: 'Move one-handed controls',
      splitControlsTop: 'Top',
      splitControlsLowerLeft: 'Lower left',
      splitControlsLowerRight: 'Lower right',
      splitAudio: 'Use audio from this pane',
      splitPane: (n) => `Pane ${n}`,
      splitDivider: 'Drag to resize panes',
      copied: 'Copied',
      screenshotSaved: 'Screenshot saved',
      captureFailed: 'Screenshot failed. Browser/CORS may block drawing this stream.',
      recordingConsent: 'Recording is local and saves this video with its matching audio when the browser exposes it. Use it only when you have permission to save this content. Continue?',
      recordingStarted: 'Recording started',
      recordingSaved: 'Recording saved',
      recordingUnsupported: 'Recording is not supported for this video/browser',
      recordingSegmentSaved: 'Recording segment saved',
      recordingFinalSaved: 'Final recording segment saved',
      recordingPausedSource: 'Recording paused; waiting for the stream to return',
      recordingResumed: 'Recording resumed',
      recordingWaiting: 'Recording paused; click to stop',
      recordingNoData: 'No recording data to save',
      recordingSettingsSaved: 'Recording settings saved',
      recordingSegmentPrompt: 'Segment length in minutes (1-180):',
      recordingBitratePrompt: 'Video bitrate in Mbps (0.5-20):',
      recordingExitWarnToggle: 'Warn before leaving while recording',
      recordingExitWarnMessage: 'Recording is still active. Leave anyway?',
      recordingCenter: 'Recording center',
      recordingCenterEmpty: 'No active recordings',
      recordingActive: 'Recording',
      recordingWaitingShort: 'Waiting for source',
      recordingSavedSegments: 'Saved segments',
      recordingDuration: 'Duration',
      recordingBitrate: 'Bitrate',
      recordingFormatHint: 'Format: MP4 when supported by this browser; otherwise the best supported fallback.',
      recordingRecoverPrompt: (n) => `Resume recording intent for ${n} room(s) from the previous session?`,
      recordCurrentPage: 'Record visible models',
      recordCurrentGroup: 'Record current group',
      recordOnlineRooms: 'Record online rooms',
      stopAllRecordings: 'Stop all recordings',
      showRecordingOnly: 'Show recording only',
      hideRecordingOnly: 'Show all rooms',
      batchOpenCurrentPage: 'Open visible models',
      batchMoveCurrentPage: 'Move visible models to group',
      layoutSettings: 'Layout settings',
      recordingSettingsTitle: 'Recording settings',
      saveSettings: 'Save settings',
      backupPanel: 'Config backups',
      noBackups: 'No config backups found',
      restoreBackup: 'Restore',
      deleteBackup: 'Delete',
      statusHistory: 'Online/offline history',
      noStatusHistory: 'No history yet',
      groupRules: 'Group rules',
      favoriteFirst: 'Keep favorites first',
      tempUrlManager: 'Temporary URL manager',
      saveTempUrls: 'Save current temporary URLs',
      noTempUrls: 'No temporary URLs',
      sharePanel: 'Share workspace',
      shareCurrentWorkspace: 'Share current rooms and layout',
      shareCopyLink: 'Copy share link',
      shareLinkHint: 'This link restores rooms, groups, and layout settings in another workstation tab.',
      shareImportPrompt: (n) => `Import shared workspace with ${n} room(s)? Your current config will be backed up first.`,
      shareImported: 'Shared workspace imported',
      shareInvalid: 'Shared workspace link is invalid',
      shortcutPanel: 'Shortcuts',
      shortcutCaptureHint: 'Click a field and press the new shortcut. Backspace clears that field.',
      resetShortcuts: 'Reset shortcuts',
      shortcutFocusAdd: 'Focus add box',
      shortcutRefreshAll: 'Refresh all',
      shortcutGridView: 'Grid view',
      shortcutFocusView: 'Focus view',
      shortcutPureMode: 'Clean mode',
      shortcutViewerMode: 'Window-first mode',
      shortcutFocusThumbs: 'Toggle thumbnails',
      shortcutRecordingCenter: 'Recording center',
      shortcutRecordPage: 'Record visible models',
      shortcutOpenRoom: 'Open selected room',
      settingsCenter: 'Settings',
      settingsCenterHint: 'Layout, playback, recording, shortcuts, and settings backup',
      settingsOnlyHint: 'One file backs up the MultiCam model library, groups, layout, playback, recording, filters, notifications, and shortcuts, plus Reloaded toggles, video preferences, theme, and ignored rooms. Import replaces the current MultiCam model library with the one in the file.',
      settingsExport: 'Export MultiCam + Reloaded to GitHub',
      settingsImport: 'Import MultiCam + Reloaded from GitHub',
      settingsImported: 'MultiCam models, groups, and settings plus Reloaded settings imported',
      settingsImportedLegacy: 'Older settings-only backup imported; the current MultiCam model list and groups were kept',
      settingsImportConfirm: 'Import this backup? The current MultiCam model list and groups will be deleted and replaced by the list in this file. The current MultiCam configuration will be backed up first.',
      settingsImportLegacyConfirm: 'This is an older settings-only backup and contains no MultiCam model list. Import its settings while keeping the current models and groups?',
      // ---- statuses ----
      stOnline: 'Online',
      stOffline: 'Offline',
      stPrivate: 'Private',
      stLoading: 'Loading',
      stError: 'Error',
      stUnknown: 'Unknown',
      lastSeen: (t) => `Last online ${t}`,
      autoDetect: 'Auto-detecting…',
      // ---- empty state ----
      emptyTitle: 'No rooms in this group',
      emptyHint: 'Add a username at the top, switch group, or clear filters',
      // ---- toasts / floating button ----
      addRoom: (n) => `Add ${n}`,
      alreadyAdded: (n) => ` ${n} already in workstation`,
      openWorkstation: 'Open workstation',
      openWorkstationHere: 'Open here (replace page)',
      openWorkstationHereConfirm: 'Replace this page with the workstation? You can go back via the browser.',
      memoryStat: (n) => `${n} rooms saved`,
      memoryView: 'View saved list',
      collapseFAB: 'Collapse dock',
      dockAutoCollapse: 'Auto-collapse',
      dockAutoCollapseHint: 'seconds (0 = off)',
      dockAutoCollapseSaved: (n) => n > 0 ? `Dock auto-collapse set to ${n} seconds` : 'Dock auto-collapse disabled',
      dockSubtitle: 'MultiCam tools',
      dockCurrentRoom: (n) => `Current: ${n}`,
      dockNoRoom: 'No room detected',
      dockOpen: 'Open workstation',
      dockOpenHere: 'Open here',
      dockAdd: 'Add room',
      dockRemove: 'Remove room',
      dockRecord: 'Record in workstation',
      dockScreenshot: 'Screenshot video',
      dockPip: 'Picture-in-Picture',
      dockPause: 'Play / pause',
      dockMute: 'Mute / unmute',
      dockVideoMissing: 'No playable video found on this page',
      dockRecordQueued: 'Recording intent queued in workstation',
      added: 'Added',
      exists: 'Already exists',
      addFailed: 'Failed',
      addedNamed: (n) => `${n} added`,
      removedNamed: (n) => `${n} removed`,
      quickAddTitle: 'Add to workstation',
      quickRemoveTitle: 'Already in workstation — click to remove',
      // ---- notifications ----
      notifyTitleText: 'Model online',
      notifyBody: (n) => `${n} just went live`,
      permDenied: 'Notification permission denied. Card flash still works.\n\nYou can enable it in browser settings.',
      // ---- batch add ----
      manualImport: 'Batch add',
      manualImportPrompt: 'Paste usernames, one per line or separated by spaces/commas:',
      importReviewCancel: 'Cancel',
      manualImportDone: (a, e) => `Batch add complete: ${a} new, ${e} already existed`,
      // ---- more menu ----
      moreMenu: 'More',
      moreMenuTitle: 'More',
      menuLanguage: 'Language',
      menuAbout: 'About',
      menuExport: 'Export config',
      menuExportUsernames: 'Export usernames.txt',
      menuCopyUsernames: 'Copy usernames',
      menuMuteAll: 'Mute all',
      menuUnmuteAll: 'Unmute all',
      menuPauseVisible: '⏸ Pause visible',
      menuResumeVisible: 'Resume visible',
      menuStopRecordings: 'Stop all recordings',
      menuRecordingSettings: 'Recording settings',
      menuRecordingCenter: 'Recording center',
      menuLayoutSettings: 'Layout settings',
      menuPlaybackSettings: 'Playback settings',
      menuBackupPanel: 'Config backups',
      menuStatusHistory: 'Status history',
      menuGroupRules: 'Group rules',
      menuTempUrlManager: 'Temporary URLs',
      menuShareWorkspace: 'Share workspace',
      menuShortcutPanel: 'Shortcut panel',
      menuPureMode: 'Clean mode',
      menuViewerMode: 'Window-first mode',
      menuToggleThumbs: 'Toggle thumbnails',
      menuToggleFit: 'Toggle video fit',
      menuShortcutHelp: 'Shortcuts / hints',
      shortcutsHelp: 'Hover any button/control to see its hint. Common shortcuts can be edited in the shortcut panel.\n\nDefaults:\n/  Focus username input\nr  Refresh all\ng  Grid view\nf  Focus view\no  Open hovered/focused room\nAlt+P or Alt+C  Clean mode on/off\nAlt+Shift+C  Recording center\nAlt+Shift+R  Record visible models\nEsc  Exit clean mode / fullscreen\nSpace  Pause/resume the main screen in Focus view\n←/→ or [/ ]  Switch the main screen in Focus view\nDouble-click card  Fullscreen',
      pausedVisible: 'Visible windows paused',
      resumedVisible: 'Visible windows resumed',
      menuImport: 'Import config',
      menuRepairData: 'Repair saved data',
      repairDone: 'Saved data has been normalized.',
      menuClearAll: 'Clear all data',
      clearAllConfirm: 'This will erase ALL rooms, groups and settings. Continue?',
      langZh: '中文',
      langEn: 'English',
      // ---- about panel ----
      aboutTitle: 'About',
      aboutAuthor: 'Author',
      aboutVersion: 'Version',
      aboutLicense: 'License',
      aboutSource: 'Source',
      aboutDonate: 'If this script saves you time…',
      aboutDonateBtn: 'Tip in ETH',
      aboutDonateAddrLabel: 'ETH address',
      aboutCopyAddr: 'Copy',
      aboutCopied: 'Copied',
      aboutClose: 'Close',
    },
    zh: {
      title: 'RoomGrid MultiCam Pro',
      appTagline: '多房间、多画面、录制、提醒、截图、重连和数据维护的一体化工作台。',
      addPlaceholder: '输入用户名 ↵',
      searchPlaceholder: '搜索房间',
      invalidUsername: '用户名格式不对',
      hideOffline: '隐藏离线',
      hidePrivate: '隐藏私密',
      onlyOnline: '仅看在线',
      sortLabel: '排序',
      sortManual: '手动排序',
      sortStatus: '按状态',
      sortName: '按名称',
      sortAdded: '按添加时间',
      refreshAll: '全部刷新',
      notifyOnline: '上线提醒',
      notifyFavoritesOnly: '仅提醒收藏的房间',
      startOnOnlineFavorites: '启动时打开在线收藏',
      notifyTitle: '主播上线时桌面通知 + 卡片闪烁',
      collapseSidebar: '',
      viewGrid: '平铺',
      viewFocus: '主屏',
      viewPhone: '手机',
      viewSplit: '分屏',
      viewModeLabel: '视图',
      visibleRooms: '单屏可见主播',
      phoneAutoMode: '在手机上自动使用手机模式',
      moreOps: '更多',
      pureMode: '纯净',
      pureModeOn: '已进入纯净模式',
      pureModeOff: '退出纯净模式',
      pureModeHint: '暂时隐藏所有工具栏、按钮和覆盖层。快捷键：Alt+P / Alt+C；按 Esc 退出。',
      viewerMode: '窗口优先',
      viewerModeOn: '已进入窗口优先模式',
      viewerModeOff: '退出窗口优先',
      viewerModeHint: '隐藏应用外壳，尽量把空间留给房间窗口。快捷键：Alt+V。',
      focusThumbsShow: '显示缩略图',
      focusThumbsHide: '隐藏缩略图',
      focusThumbsHint: '显示或隐藏主屏模式的缩略图栏。快捷键：Alt+T。',
      videoFitContain: '画面：完整显示',
      videoFitCover: '画面：填满窗口',
      videoFitHint: '在完整显示和裁切填满之间切换。',
      playbackSettingsTitle: '播放设置',
      maxStreamHeight: '最高画质',
      maxQualityAuto: '自动 / 不限制',
      freeZoomLabel: 'Ctrl/Command + 滚轮缩放',
      freeZoomHint: '按 Ctrl/Command 加滚轮缩放窗口；放大后拖动画面；双击恢复。',
      pureExitHint: '退出纯净模式。快捷键：Alt+P / Alt+C 或 Esc。',
      pureExitChip: '纯净 · Alt+P/C / Esc',
      syncedFromOtherTab: '（来自其它标签页同步）',
      hintAddInput: '输入用户名后按 Enter 添加。快捷键：/',
      hintSearchInput: '按用户名过滤当前可见房间',
      hintSidebarToggle: '显示 / 隐藏分组侧边栏',
      hintVolume: '全局音量。单房间静音仍然优先。',
      hintGridSize: '平铺模式下的基础窗口尺寸',
      hintSort: '当前分组内的房间排序方式',
      hintMainRatio: '主屏模式下主屏高度，也可以拖动分隔条调整。',
      hintMainAspect: '主屏模式下主屏宽高比',
      hintThumbSize: '主屏模式下缩略图宽度',
      hintGroupTab: (n) => `切换到「${n}」。也可以把房间拖到这里加入该分组。`,
      hintOnlineFavoritesTab: '显示当前在线的收藏房间。',
      hintLibraryTab: '显示所有已保存房间。在这个视图点移除会全局删除。',
      hintNewGroup: '创建一个互相独立的新分组',
      hintMoreMenu: '更多工具和维护功能',
      groupsHeading: '分组',
      quickViewsHeading: '快捷视图',
      myGroupsHeading: '我的分组',
      groupLibrary: '全部保存',
      groupAll: '默认',
      groupOnline: '在线',
      groupOnlineFav: '在线收藏',
      groupFav: '收藏',
      newGroup: '新建分组',
      newGroupPrompt: '新分组名称：',
      renameGroup: '重命名',
      renameGroupPrompt: '重命名为：',
      deleteGroup: '删除分组',
      deleteGroupConfirm: (n) => `删除分组「${n}」？房间仍会保留，只会从该分组移除。`,
      statTotal: '总计',
      statOnline: '在线',
      statMuted: '静音',
      opRefresh: '刷新',
      opMuteToggle: '静音切换',
      opPause: '暂停',
      opResume: '继续播放',
      opScreenshot: '截图当前画面',
      opRecordStart: '录制当前窗口',
      opRecordStop: '停止录制',
      opPiP: '画中画',
      opFullscreen: '全屏',
      opMoveGroup: '加入分组',
      opRemove: '移出当前分组',
      opDeleteRoom: '彻底删除房间',
      opMirror: '左右镜像',
      opFlip: '上下翻转',
      opRotateLeft: '向左旋转',
      opRotateRight: '向右旋转',
      opResetView: '重置画面',
      opOpenRoom: '打开房间',
      opCopyUsername: '复制用户名',
      opFavoriteAdd: '加入收藏',
      opFavoriteRemove: '取消收藏',
      opMoveToFavorites: '仅移到收藏',
      opAddSplit: '加入分屏',
      splitView: '分屏模式',
      splitAddedFirst: (n) => `${n} 已加入窗格 1，请再选择一个主播。`,
      splitAlreadyAdded: '该主播已在分屏中',
      splitNeedTwo: '请先选择两个主播',
      splitChoosePane: '选择要替换的窗格',
      splitReplacePane: (n, name) => `替换窗格 ${n}：${name}`,
      splitPickerTitle: (n) => `为窗格 ${n} 选择主播`,
      splitPickerSearch: '搜索已保存主播',
      splitQuickPreview: '快速预览',
      splitPreviewHint: '长按主播或使用预览按钮。',
      splitPreviewUse: (n) => `用于窗格 ${n}`,
      splitPreviewRefresh: '刷新预览',
      splitPreviewUnavailable: '预览不可用',
      splitPreviewClose: '关闭预览',
      splitOnlineFavorites: '在线收藏',
      splitOnline: '在线',
      splitFavorites: '收藏',
      splitAllSaved: '全部保存',
      splitOtherPane: '已在另一个窗格',
      splitCurrentPane: '已在当前窗格',
      splitNoMatches: '没有匹配的主播',
      splitReplace: '替换',
      splitPrevOnline: '上一个在线主播',
      splitNextOnline: '下一个在线主播',
      splitNoOtherOnline: '没有其他在线主播',
      splitSwap: '交换窗格',
      splitExit: '退出分屏',
      splitFullscreen: '全屏',
      splitControlsPosition: '移动单手控制区',
      splitControlsTop: '顶部',
      splitControlsLowerLeft: '左下',
      splitControlsLowerRight: '右下',
      splitAudio: '使用此窗格的声音',
      splitPane: (n) => `窗格 ${n}`,
      splitDivider: '拖动调整窗格大小',
      copied: '已复制',
      screenshotSaved: '截图已保存',
      captureFailed: '截图失败。浏览器跨域/CORS 可能阻止绘制该视频流。',
      recordingConsent: '录制只保存在本地，会在浏览器允许时保存该视频及对应音频。请只在你有权保存该内容时使用。继续？',
      recordingStarted: '已开始录制',
      recordingSaved: '录制已保存',
      recordingUnsupported: '当前视频或浏览器不支持录制',
      recordingSegmentSaved: '录制分段已保存',
      recordingFinalSaved: '最后录制片段已保存',
      recordingPausedSource: '录制已暂停，等待视频恢复',
      recordingResumed: '录制已恢复',
      recordingWaiting: '录制暂停中，点击停止',
      recordingNoData: '没有可保存的录制数据',
      recordingSettingsSaved: '录制设置已保存',
      recordingSegmentPrompt: '分段时长，单位分钟（1-180）：',
      recordingBitratePrompt: '视频码率，单位 Mbps（0.5-20）：',
      recordingExitWarnToggle: '录制中离开页面前提醒',
      recordingExitWarnMessage: '仍有录制正在进行，确定离开吗？',
      recordingCenter: '录制管理中心',
      recordingCenterEmpty: '暂无正在录制的窗口',
      recordingActive: '录制中',
      recordingWaitingShort: '等待视频源',
      recordingSavedSegments: '已保存分段',
      recordingDuration: '时长',
      recordingBitrate: '码率',
      recordingFormatHint: '格式：浏览器支持时优先 MP4，否则使用当前浏览器可用的最佳格式。',
      recordingRecoverPrompt: (n) => `检测到上次有 ${n} 个房间的录制意图，是否继续等待视频并恢复录制？`,
      recordCurrentPage: '录制当前可见主播',
      recordCurrentGroup: '录制当前分组',
      recordOnlineRooms: '录制在线房间',
      stopAllRecordings: '停止所有录制',
      showRecordingOnly: '只看录制中',
      hideRecordingOnly: '显示全部房间',
      batchOpenCurrentPage: '打开当前可见主播',
      batchMoveCurrentPage: '移动当前可见主播到分组',
      layoutSettings: '布局设置',
      recordingSettingsTitle: '录制设置',
      saveSettings: '保存设置',
      backupPanel: '配置备份',
      noBackups: '没有配置备份',
      restoreBackup: '恢复',
      deleteBackup: '删除',
      statusHistory: '上线/离线历史',
      noStatusHistory: '暂无历史',
      groupRules: '分组规则',
      favoriteFirst: '收藏优先置顶',
      tempUrlManager: '临时 URL 管理',
      saveTempUrls: '保存当前临时 URL',
      noTempUrls: '暂无临时 URL',
      sharePanel: '分享工作台',
      shareCurrentWorkspace: '分享当前房间和布局',
      shareCopyLink: '复制分享链接',
      shareLinkHint: '这个链接会在另一个工作台标签页里恢复房间、分组和布局设置。',
      shareImportPrompt: (n) => `导入这个分享工作台中的 ${n} 个房间？当前配置会先自动备份。`,
      shareImported: '已导入分享工作台',
      shareInvalid: '分享链接无效',
      shortcutPanel: '快捷键',
      shortcutCaptureHint: '点击输入框后按新的快捷键。Backspace 可清空当前项。',
      resetShortcuts: '恢复默认快捷键',
      shortcutFocusAdd: '聚焦添加框',
      shortcutRefreshAll: '刷新全部',
      shortcutGridView: '平铺视图',
      shortcutFocusView: '主屏视图',
      shortcutPureMode: '纯净模式',
      shortcutViewerMode: '窗口优先模式',
      shortcutFocusThumbs: '显示 / 隐藏缩略图',
      shortcutRecordingCenter: '录制管理中心',
      shortcutRecordPage: '录制当前可见主播',
      stOnline: '在线',
      stOffline: '离线',
      stPrivate: '私密',
      stLoading: '加载中',
      stError: '错误',
      stUnknown: '未知',
      lastSeen: (t) => `上次在线 ${t}`,
      autoDetect: '将自动检测上线',
      emptyTitle: '当前分组没有房间',
      emptyHint: '在顶部输入用户名添加，或切换分组 / 取消过滤',
      addRoom: (n) => `加入 ${n}`,
      alreadyAdded: (n) => ` ${n} 已在工作台`,
      openWorkstation: '打开工作台',
      openWorkstationHere: '在当前页打开（覆盖）',
      openWorkstationHereConfirm: '工作台将取代当前页面，需要时可用浏览器后退返回。继续？',
      memoryStat: (n) => `已记录 ${n} 个房间`,
      memoryView: '查看记忆列表',
      collapseFAB: '收起工具坞',
      dockAutoCollapse: '自动收起',
      dockAutoCollapseHint: '秒（0 = 关闭）',
      dockAutoCollapseSaved: (n) => n > 0 ? `工具坞将在 ${n} 秒后自动收起` : '已关闭工具坞自动收起',
      dockSubtitle: 'MultiCam 工具',
      dockCurrentRoom: (n) => `当前：${n}`,
      dockNoRoom: '未识别到房间',
      dockOpen: '打开工作台',
      dockOpenHere: '当前页打开',
      dockAdd: '加入房间',
      dockRemove: '移除房间',
      dockRecord: '在工作台录制',
      dockScreenshot: '截图当前视频',
      dockPip: '画中画',
      dockPause: '播放 / 暂停',
      dockMute: '静音 / 取消',
      dockVideoMissing: '当前页没有找到可操作的视频',
      dockRecordQueued: '已把录制意图发送到工作台',
      added: '已加入',
      exists: '已存在',
      addFailed: '失败',
      addedNamed: (n) => `${n} 已加入`,
      removedNamed: (n) => `${n} 已移除`,
      quickAddTitle: '加入工作台',
      quickRemoveTitle: '已在工作台 — 点击移除',
      notifyTitleText: '主播上线',
      notifyBody: (n) => `${n} 已开播`,
      permDenied: '未获得桌面通知权限，仅卡片闪烁会生效。\n\n你可以去浏览器设置里手动开启。',
      manualImport: '批量添加',
      manualImportPrompt: '粘贴用户名，支持一行一个，或用空格/逗号分隔：',
      importReviewCancel: '取消',
      manualImportDone: (a, e) => `批量添加完成：新增 ${a}，已存在 ${e}`,
      moreMenu: '更多',
      moreMenuTitle: '更多',
      menuLanguage: '语言',
      menuAbout: '关于',
      menuExport: '导出配置',
      menuExportUsernames: '导出用户名 txt',
      menuCopyUsernames: '复制用户名列表',
      menuMuteAll: '全部静音',
      menuUnmuteAll: '取消全部静音',
      menuPauseVisible: '⏸ 暂停可见窗口',
      menuResumeVisible: '继续可见窗口',
      menuStopRecordings: '停止所有录制',
      menuRecordingSettings: '录制设置',
      menuRecordingCenter: '录制管理中心',
      menuLayoutSettings: '布局设置',
      menuPlaybackSettings: '播放设置',
      menuBackupPanel: '配置备份',
      menuStatusHistory: '状态历史',
      menuGroupRules: '分组规则',
      menuTempUrlManager: '临时 URL',
      menuShareWorkspace: '分享工作台',
      menuShortcutPanel: '快捷键面板',
      menuPureMode: '纯净模式',
      menuViewerMode: '窗口优先模式',
      menuToggleThumbs: '显示 / 隐藏缩略图',
      menuToggleFit: '切换画面适应',
      menuShortcutHelp: '快捷键 / 提示说明',
      shortcutsHelp: '鼠标停在任何按钮或控件上，会显示即时说明。常用快捷键可以在快捷键面板里修改。\n\n默认：\n/  聚焦用户名输入框\nr  全部刷新\ng  平铺视图\nf  主屏视图\nAlt+P 或 Alt+C  开关纯净模式\nAlt+Shift+C  录制管理中心\nAlt+Shift+R  录制当前页\nEsc  退出纯净模式 / 全屏\n空格  主屏模式下暂停/继续主屏\n←/→ 或 [/ ]  主屏模式下切换主屏\n双击窗口  全屏',
      pausedVisible: '已暂停可见窗口',
      resumedVisible: '已继续可见窗口',
      menuImport: '导入配置',
      menuRepairData: '修复保存数据',
      repairDone: '已完成保存数据规范化。',
      menuClearAll: '清空所有数据',
      clearAllConfirm: '将清空所有房间、分组和设置，确定继续？',
      langZh: '中文',
      langEn: 'English',
      aboutTitle: '关于',
      aboutAuthor: '作者',
      aboutVersion: '版本',
      aboutLicense: '协议',
      aboutSource: '源码',
      aboutDonate: '如果这个脚本帮你节省了时间…',
      aboutDonateBtn: '请作者一杯咖啡 (ETH)',
      aboutDonateAddrLabel: 'ETH 地址',
      aboutCopyAddr: '复制',
      aboutCopied: '已复制',
      aboutClose: '关闭',
    },
  };

  const LANG_KEY = 'multicam_lang';
  function detectLang() {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && I18N[stored]) return stored;
    const browserLangs = [
      ...(Array.isArray(navigator.languages) ? navigator.languages : []),
      navigator.language,
      navigator.userLanguage,
    ].filter(Boolean).map(v => String(v).toLowerCase());
    const primary = browserLangs.find(v => v.startsWith('zh') || v.startsWith('en')) || '';
    if (primary.startsWith('zh')) return 'zh';
    return 'en';
  }
  let LANG = detectLang();
  const t = (key, ...args) => {
    const v = (I18N[LANG] && I18N[LANG][key]) ?? I18N.en[key] ?? key;
    return typeof v === 'function' ? v(...args) : v;
  };
  function setLang(lang) {
    if (!I18N[lang] || lang === LANG) return;
    localStorage.setItem(LANG_KEY, lang);
    location.reload();
  }

  /* =============================================================
   * 0.6. 元数据 / Meta —— 关于 + 捐赠
   * ============================================================= */
  const META = {
    version: '15.11.0',
    author: 'RYUJO',
    license: 'MIT',
    source: 'https://github.com/linuxNoob620/chaturbate-userscripts',
    eth: '0x6ad5b8Baf993C1C377B81Fa277c5d8350e339D07',
  };

  /* =============================================================
   * 1. 持久化层 / Storage  ——  schema 版本号兜底
   * ============================================================= */
  const STORE_KEY = 'ryujo_multicam_v8';
  const CONFIG_BACKUP_PREFIX = STORE_KEY + '_backup_';
  const RECORDING_INTENT_KEY = STORE_KEY + '_recording_intents_v1';
  const ROOM_STATUS_HISTORY_KEY = STORE_KEY + '_status_history_v1';
  const SAVED_TEMP_URLS_KEY = STORE_KEY + '_saved_temp_urls_v1';
  const MAX_CONFIG_BYTES = 2 * 1024 * 1024;
  const MAX_CONFIG_BACKUPS = 3;
  const RELOADED_VERSION = '1.8.0';
  const GITHUB_SYNC_CONFIG_KEY = 'chaturbate_suite_github_sync_v1';
  const GITHUB_SYNC_FORMAT = 'chaturbate-suite-settings-encrypted-v1';
  const GITHUB_SYNC_TARGET = Object.freeze({
    owner: 'linuxNoob620',
    repo: 'chaturbate-userscript-settings',
    branch: 'main',
    path: 'settings/latest.enc.json',
  });
  const GITHUB_API_VERSION = '2022-11-28';
  const GITHUB_PBKDF2_ITERATIONS = 250000;
  const RELOADED_SETTING_KEYS = Object.freeze([
    'animationoff', 'bigthumb', 'defaultVideoWidth', 'hidemt', 'hpfltopen',
    'ignoredusers', 'isTheaterMode', 'newtabon', 'pclean', 'recautosave',
    'recvp9', 'refreshoff', 'reloadedGlobalChatSettingsV1', 'smallsnap',
    'videoControls', 'zoomoff',
  ]);
  const INJECTOR_ROUTE_POLL_VISIBLE_MS = 1000;
  const INJECTOR_ROUTE_POLL_HIDDEN_MS = 5000;

  function readCookieSetting(name) {
    const prefix = encodeURIComponent(name) + '=';
    const part = String(document.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(prefix));
    if (!part) return null;
    try { return decodeURIComponent(part.slice(prefix.length)); } catch (_) { return part.slice(prefix.length); }
  }

  function writeCookieSetting(name, value) {
    const safe = String(value || '').trim();
    if (!/^[a-z0-9_-]{1,40}$/i.test(safe)) return false;
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(safe)}; path=/; max-age=31536000; SameSite=Lax`;
    return true;
  }

  function captureReloadedSettings() {
    const storage = {};
    for (const key of RELOADED_SETTING_KEYS) {
      const value = localStorage.getItem(key);
      if (value !== null && value.length <= 262144) storage[key] = value;
    }
    return { version: RELOADED_VERSION, storage, themeName: readCookieSetting('theme_name') };
  }

  function restoreReloadedSettings(snapshot) {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return false;
    const values = snapshot.storage && typeof snapshot.storage === 'object' && !Array.isArray(snapshot.storage)
      ? snapshot.storage
      : snapshot;
    for (const key of RELOADED_SETTING_KEYS) localStorage.removeItem(key);
    for (const key of RELOADED_SETTING_KEYS) {
      const value = values[key];
      if (typeof value === 'string' && value.length <= 262144) localStorage.setItem(key, value);
    }
    if (typeof snapshot.themeName === 'string') writeCookieSetting('theme_name', snapshot.themeName);
    return true;
  }

  const defaultState = () => ({
    v: 8,
    rooms: [],   // {id, addedAt, group, order, lastStatus, lastSeenOnline, muted, notes}
    groups: [
      { id: LIBRARY_GROUP_ID, name: '__library__', order: 0, system: true },
      { id: DEFAULT_GROUP_ID, name: '__all__', order: 1, system: true },
      { id: ONLINE_FAVORITES_GROUP_ID, name: '__online_favorites__', order: 2, system: true },
      { id: ONLINE_GROUP_ID, name: '__online__', order: 3, system: true },
      { id: FAVORITE_GROUP_ID, name: '__fav__', order: 4, system: true },
    ],
    settings: {
      volume: 0,
      gridSize: 400,
      gridCellSize: 80,
      layoutSize: 4,             // one screen capacity: 2 | 4 | 6 | 9
      phoneLayoutSize: 2,        // phone capacity: portrait 1x2, landscape 2x1
      pageIndex: 0,
      toolbarCollapsed: false,
      viewMode: 'grid',           // 'grid' | 'focus' | 'phone'
      phoneModeAuto: true,
      splitRoomIds: [],
      splitViewActive: false,
      splitRatio: 50,
      splitAudioRoomId: null,
      splitToolbarPosition: 'top',
      focusedRoomId: null,
      focusMainPct: 62,           // main screen width ratio in focus mode
      focusMainHPct: 64,          // main screen height ratio in focus mode
      focusAspect: 'auto',
      focusThumbSize: 150,
      filter: { hideOffline: false, hidePrivate: false, onlyOnline: false },
      sortBy: 'manual',
      notifyOnline: true,
      notifyFavoritesOnly: true,
      startOnOnlineFavorites: true,
      activeGroup: 'all',
      searchQuery: '',
      pureMode: false,
      viewerMode: false,
      focusThumbsCollapsed: false,
      videoFit: 'contain',
      freeZoom: true,
      maxStreamHeight: 1080,
      videoTransforms: {},
      showRecordingOnly: false,
      favoriteFirst: true,
      shortcuts: defaultShortcuts(),
      recordingSegmentMinutes: 10,
      recordingVideoBitrate: 6000000,
      recordingExitWarn: true,
      dockAutoCollapseSeconds: 5,
      pollMs: { offline: 60000, private: 30000, error: 10000, online: 120000 },
      sidebarCollapsed: false,
    },
  });


  function ensureSystemGroups(state) {
    if (!state || typeof state !== 'object') return state;
    state.groups = Array.isArray(state.groups) ? state.groups : [];
    const wanted = [
      { id: LIBRARY_GROUP_ID, name: '__library__', order: 0, system: true },
      { id: DEFAULT_GROUP_ID, name: '__all__', order: 1, system: true },
      { id: ONLINE_FAVORITES_GROUP_ID, name: '__online_favorites__', order: 2, system: true },
      { id: ONLINE_GROUP_ID, name: '__online__', order: 3, system: true },
      { id: FAVORITE_GROUP_ID, name: '__fav__', order: 4, system: true },
    ];
    for (const g of wanted) {
      const found = state.groups.find(x => x.id === g.id);
      if (!found) state.groups.push({ ...g });
      else { found.name = g.name; found.system = true; found.order = g.order; }
    }
    state.groups.sort((a, b) => numeric(a.order, 999) - numeric(b.order, 999));
    return state;
  }

  /* =============================================================
   * 1.1. 分组成员关系 / Group membership
   * v12 模型：所有显示分组都是独立成员关系；library 是唯一聚合管理视图。
   * 在普通分组点 X 只移出当前分组；在 library 点 X 才彻底删除。
   * ============================================================= */
  function uniq(arr) { return [...new Set((arr || []).filter(Boolean))]; }
  function numeric(v, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
  function clampInt(v, min, max, fallback = min) {
    const n = Math.round(Number(v));
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }
  function normalizeCardSize(size) {
    if (!size || typeof size !== 'object') return null;
    const cols = clampInt(size.cols ?? size.columns ?? size.w, 3, 18, 0);
    const rows = clampInt(size.rows ?? size.h, 3, 18, 0);
    if (!cols || !rows) return null;
    return { cols, rows };
  }
  function normalizeCardSizeMap(map) {
    const out = {};
    if (map && typeof map === 'object' && !Array.isArray(map)) {
      for (const [k, v] of Object.entries(map)) {
        const key = String(k || '').trim() || 'all';
        const size = normalizeCardSize(v);
        if (size) out[key] = size;
      }
    }
    return out;
  }
  function setCardSizeForGroup(room, groupId, size) {
    if (!room) return;
    const key = String(groupId || 'all');
    const next = normalizeCardSize(size);
    const map = normalizeCardSizeMap(room.cardSizeByGroup);
    if (next) map[key] = next;
    else delete map[key];
    room.cardSizeByGroup = map;
    delete room.cardSize;
    if (!Object.keys(room.cardSizeByGroup).length) delete room.cardSizeByGroup;
  }
  function getRoomGroups(room) {
    const groups = Array.isArray(room?.groups) ? room.groups.slice() : [];
    if (room?.group) groups.push(room.group);
    // v12: all/default is a real group; only library is an aggregate view and is never stored as membership.
    return uniq(groups.filter(g => g && g !== LIBRARY_GROUP_ID && g !== ONLINE_GROUP_ID && g !== ONLINE_FAVORITES_GROUP_ID));
  }
  function normalizeRoom(room, fallbackOrder = 0) {
    const r = room && typeof room === 'object' ? room : { id: String(room || '') };
    r.id = normalizeUsername(r.id);
    r.groups = getRoomGroups(r);
    r.group = r.groups[0] || null;
    r.addedAt = numeric(r.addedAt, Date.now());
    r.order = numeric(r.order, fallbackOrder);
    if (!r.groupOrder || typeof r.groupOrder !== 'object' || Array.isArray(r.groupOrder)) r.groupOrder = {};
    for (const g of r.groups) r.groupOrder[g] = numeric(r.groupOrder[g], r.order);
    if (!r.lastStatus) r.lastStatus = 'unknown';
    r.lastSeenOnline = numeric(r.lastSeenOnline, 0);
    r.muted = !!r.muted;
    const sizeMap = normalizeCardSizeMap(r.cardSizeByGroup);
    const legacyCardSize = normalizeCardSize(r.cardSize);
    if (legacyCardSize && !sizeMap.all) sizeMap.all = legacyCardSize;
    if (Object.keys(sizeMap).length) r.cardSizeByGroup = sizeMap;
    else delete r.cardSizeByGroup;
    delete r.cardSize;
    return r;
  }
  function normalizeStateMemberships(state) {
    if (!state || typeof state !== 'object') return state;
    state.rooms = Array.isArray(state.rooms) ? state.rooms : [];
    const merged = new Map();
    state.rooms.forEach((room, idx) => {
      const r = normalizeRoom(room, idx);
      if (!r.id) return;
      const prev = merged.get(r.id);
      if (!prev) { merged.set(r.id, r); return; }
      const groups = uniq([...getRoomGroups(prev), ...getRoomGroups(r)]);
      prev.groups = groups;
      prev.group = groups[0] || null;
      prev.groupOrder = { ...(r.groupOrder || {}), ...(prev.groupOrder || {}) };
      for (const g of groups) prev.groupOrder[g] = numeric(prev.groupOrder[g], prev.order);
      prev.order = Math.min(numeric(prev.order, idx), numeric(r.order, idx));
      const mergedSizeMap = { ...(r.cardSizeByGroup || {}), ...(prev.cardSizeByGroup || {}) };
      if (Object.keys(mergedSizeMap).length) prev.cardSizeByGroup = normalizeCardSizeMap(mergedSizeMap);
      else delete prev.cardSizeByGroup;
      delete prev.cardSize;
      prev.addedAt = Math.min(numeric(prev.addedAt, Date.now()), numeric(r.addedAt, Date.now()));
      if (r.lastStatus && r.lastStatus !== 'unknown') prev.lastStatus = r.lastStatus;
      if (r.lastSeenOnline) prev.lastSeenOnline = Math.max(numeric(prev.lastSeenOnline, 0), numeric(r.lastSeenOnline, 0));
      prev.muted = !!(prev.muted || r.muted);
    });
    state.rooms = [...merged.values()];
    return state;
  }
  function reconcileSplitState(state) {
    if (!state?.settings) return state;
    const validIds = new Set((state.rooms || []).map(room => normalizeUsername(room?.id)).filter(isLikelyUsername));
    const splitIds = uniq((Array.isArray(state.settings.splitRoomIds) ? state.settings.splitRoomIds : [])
      .map(normalizeUsername)
      .filter(id => validIds.has(id)))
      .slice(0, 2);
    state.settings.splitRoomIds = splitIds;
    state.settings.splitRatio = clampInt(state.settings.splitRatio, 20, 80, 50);
    if (!['top', 'lower-left', 'lower-right'].includes(state.settings.splitToolbarPosition)) state.settings.splitToolbarPosition = 'top';
    state.settings.splitViewActive = !!state.settings.splitViewActive && splitIds.length === 2;
    const audioId = normalizeUsername(state.settings.splitAudioRoomId || '');
    state.settings.splitAudioRoomId = splitIds.includes(audioId) ? audioId : (splitIds[0] || null);
    return state;
  }
  function sanitizeState(input) {
    const def = defaultState();
    const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const out = { ...def, v: numeric(src.v, def.v) };

    const rawGroups = Array.isArray(src.groups) ? src.groups.slice(0, 80) : def.groups;
    const seenGroups = new Set();
    out.groups = [];
    rawGroups.forEach((g, idx) => {
      if (!g || typeof g !== 'object') return;
      let id = String(g.id || '').trim();
      if (!id || !/^[a-z0-9_-]{1,48}$/i.test(id)) id = uuid();
      if (seenGroups.has(id)) return;
      seenGroups.add(id);
      let name = safeGroupName(g.name, id);
      if (!name) name = id;
      out.groups.push({
        id, name,
        order: clampInt(g.order, 0, 10000, idx),
        system: !!g.system && [LIBRARY_GROUP_ID, DEFAULT_GROUP_ID, ONLINE_GROUP_ID, ONLINE_FAVORITES_GROUP_ID, FAVORITE_GROUP_ID].includes(id),
      });
    });
    ensureSystemGroups(out);
    const validGroupIds = new Set(out.groups.map(g => g.id).filter(id => id !== LIBRARY_GROUP_ID && id !== ONLINE_GROUP_ID && id !== ONLINE_FAVORITES_GROUP_ID));

    const allowedStatus = new Set(['online', 'offline', 'private', 'loading', 'error', 'unknown']);
    const rawRooms = Array.isArray(src.rooms) ? src.rooms.slice(0, 1200) : [];
    out.rooms = rawRooms.map((room, idx) => {
      const r = normalizeRoom(room, idx);
      if (!isLikelyUsername(r.id)) return null;
      const groups = getRoomGroups(r).filter(g => validGroupIds.has(g));
      const safe = {
        id: r.id,
        addedAt: Math.max(0, numeric(r.addedAt, Date.now())),
        group: groups[0] || null,
        groups,
        groupOrder: {},
        order: clampInt(r.order, 0, 1000000, idx),
        lastStatus: allowedStatus.has(r.lastStatus) ? r.lastStatus : 'unknown',
        lastSeenOnline: Math.max(0, numeric(r.lastSeenOnline, 0)),
        muted: !!r.muted,
      };
      if (r.privateLabel) safe.privateLabel = String(r.privateLabel).slice(0, 40);
      if (r.errorMsg) safe.errorMsg = String(r.errorMsg).slice(0, 120);
      for (const g of groups) safe.groupOrder[g] = clampInt(r.groupOrder?.[g], 0, 1000000, safe.order);
      const sizeMap = normalizeCardSizeMap(r.cardSizeByGroup);
      if (Object.keys(sizeMap).length) safe.cardSizeByGroup = sizeMap;
      return safe;
    }).filter(Boolean);
    normalizeStateMemberships(out);

    const st = src.settings && typeof src.settings === 'object' && !Array.isArray(src.settings) ? src.settings : {};
    out.settings = { ...def.settings, ...st };
    const allowedSettingKeys = new Set([...Object.keys(def.settings), '__focusAutoMigratedV12']);
    for (const key of Object.keys(out.settings)) {
      if (!allowedSettingKeys.has(key)) delete out.settings[key];
    }
    out.settings.filter = { ...def.settings.filter, ...(st.filter && typeof st.filter === 'object' ? st.filter : {}) };
    out.settings.filter.hideOffline = !!out.settings.filter.hideOffline;
    out.settings.filter.hidePrivate = !!out.settings.filter.hidePrivate;
    out.settings.filter.onlyOnline = !!out.settings.filter.onlyOnline;
    out.settings.volume = Math.max(0, Math.min(1, Number(out.settings.volume) || 0));
    out.settings.gridSize = clampInt(out.settings.gridSize, 220, 900, def.settings.gridSize);
    out.settings.gridCellSize = clampInt(out.settings.gridCellSize, 56, 120, def.settings.gridCellSize);
    out.settings.layoutSize = [2, 4, 6, 9].includes(Number(out.settings.layoutSize)) ? Number(out.settings.layoutSize) : def.settings.layoutSize;
    out.settings.phoneLayoutSize = [2, 4, 6, 9].includes(Number(out.settings.phoneLayoutSize)) ? Number(out.settings.phoneLayoutSize) : def.settings.phoneLayoutSize;
    out.settings.pageIndex = clampInt(out.settings.pageIndex, 0, 100000, 0);
    out.settings.viewMode = ['grid', 'focus', 'phone'].includes(out.settings.viewMode) ? out.settings.viewMode : 'grid';
    out.settings.phoneModeAuto = out.settings.phoneModeAuto !== false;
    out.settings.focusedRoomId = isLikelyUsername(out.settings.focusedRoomId) ? normalizeUsername(out.settings.focusedRoomId) : null;
    out.settings.focusMainPct = clampInt(out.settings.focusMainPct, 45, 76, def.settings.focusMainPct);
    out.settings.focusMainHPct = clampInt(out.settings.focusMainHPct, 44, 78, def.settings.focusMainHPct);
    out.settings.focusAspect = ['auto', '16:9', '4:3', '1:1', '9:16'].includes(out.settings.focusAspect) ? out.settings.focusAspect : 'auto';
    out.settings.focusThumbSize = clampInt(out.settings.focusThumbSize, 96, 260, def.settings.focusThumbSize);
    out.settings.sortBy = ['manual', 'status', 'name', 'addedAt'].includes(out.settings.sortBy) ? out.settings.sortBy : 'manual';
    out.settings.activeGroup = out.groups.some(g => g.id === out.settings.activeGroup) ? out.settings.activeGroup : DEFAULT_GROUP_ID;
    out.settings.searchQuery = normalizeUsername(out.settings.searchQuery || '');
    out.settings.pureMode = false;
    out.settings.viewerMode = !!out.settings.viewerMode;
    out.settings.focusThumbsCollapsed = !!out.settings.focusThumbsCollapsed;
    out.settings.videoFit = out.settings.videoFit === 'cover' ? 'cover' : 'contain';
    out.settings.freeZoom = out.settings.freeZoom !== false;
    out.settings.maxStreamHeight = [0, 240, 360, 480, 720, 1080, 1440, 2160].includes(Number(out.settings.maxStreamHeight)) ? Number(out.settings.maxStreamHeight) : def.settings.maxStreamHeight;
    out.settings.videoTransforms = sanitizeVideoTransformMap(st.videoTransforms);
    out.settings.showRecordingOnly = !!out.settings.showRecordingOnly;
    out.settings.favoriteFirst = out.settings.favoriteFirst !== false;
    out.settings.shortcuts = sanitizeShortcuts(st.shortcuts, def.settings.shortcuts);
    out.settings.recordingSegmentMinutes = clampInt(out.settings.recordingSegmentMinutes, 1, 180, def.settings.recordingSegmentMinutes);
    out.settings.recordingVideoBitrate = clampInt(out.settings.recordingVideoBitrate, 500000, 20000000, def.settings.recordingVideoBitrate);
    out.settings.recordingExitWarn = out.settings.recordingExitWarn !== false;
    out.settings.dockAutoCollapseSeconds = clampInt(out.settings.dockAutoCollapseSeconds, 0, 600, def.settings.dockAutoCollapseSeconds);
    out.settings.toolbarCollapsed = !!out.settings.toolbarCollapsed;
    out.settings.sidebarCollapsed = !!out.settings.sidebarCollapsed;
    out.settings.notifyOnline = out.settings.notifyOnline !== false;
    out.settings.notifyFavoritesOnly = out.settings.notifyFavoritesOnly !== false;
    out.settings.startOnOnlineFavorites = out.settings.startOnOnlineFavorites !== false;
    reconcileSplitState(out);
    out.settings.pollMs = { ...def.settings.pollMs, ...(st.pollMs && typeof st.pollMs === 'object' ? st.pollMs : {}) };
    for (const [k, fallback] of Object.entries(def.settings.pollMs)) {
      out.settings.pollMs[k] = clampInt(out.settings.pollMs[k], 5000, 300000, fallback);
    }
    return out;
  }

  function roomInGroup(room, groupId) {
    if (groupId === LIBRARY_GROUP_ID) return true;
    if (groupId === ONLINE_GROUP_ID) return room?.lastStatus === 'online';
    if (groupId === ONLINE_FAVORITES_GROUP_ID) return room?.lastStatus === 'online' && getRoomGroups(room).includes(FAVORITE_GROUP_ID);
    return getRoomGroups(room).includes(groupId || DEFAULT_GROUP_ID);
  }
  function roomOrderInGroup(room, groupId) {
    if (groupId === LIBRARY_GROUP_ID || groupId === DEFAULT_GROUP_ID || groupId === ONLINE_GROUP_ID) return numeric(room?.order, 0);
    if (groupId === ONLINE_FAVORITES_GROUP_ID) return numeric(room?.groupOrder?.[FAVORITE_GROUP_ID], numeric(room?.order, 0));
    return numeric(room?.groupOrder?.[groupId], numeric(room?.order, 0));
  }
  function nextOrderForGroup(state, groupId) {
    const list = groupId === LIBRARY_GROUP_ID ? state.rooms : state.rooms.filter(r => roomInGroup(r, groupId));
    return Math.max(-1, ...list.map(r => roomOrderInGroup(r, groupId))) + 1;
  }
  function ensureRoomInGroup(room, groupId, order) {
    normalizeRoom(room);
    if (!groupId || groupId === LIBRARY_GROUP_ID || groupId === ONLINE_GROUP_ID || groupId === ONLINE_FAVORITES_GROUP_ID) return false;
    const groups = getRoomGroups(room);
    const existed = groups.includes(groupId);
    if (!existed) groups.push(groupId);
    room.groups = uniq(groups);
    room.group = room.groups[0] || null;
    if (!room.groupOrder || typeof room.groupOrder !== 'object' || Array.isArray(room.groupOrder)) room.groupOrder = {};
    if (!existed || !Number.isFinite(Number(room.groupOrder[groupId]))) room.groupOrder[groupId] = numeric(order, room.order);
    return !existed;
  }
  function removeRoomFromGroup(room, groupId) {
    if (!room || !groupId || groupId === LIBRARY_GROUP_ID || groupId === ONLINE_GROUP_ID || groupId === ONLINE_FAVORITES_GROUP_ID) return false;
    const before = getRoomGroups(room);
    const after = before.filter(g => g !== groupId);
    if (after.length === before.length) return false;
    room.groups = after;
    room.group = after[0] || null;
    if (room.groupOrder && typeof room.groupOrder === 'object') delete room.groupOrder[groupId];
    return true;
  }

  function pruneConfigBackups(max = MAX_CONFIG_BACKUPS) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CONFIG_BACKUP_PREFIX)) keys.push(key);
      }
      keys.sort((a, b) => Number(b.slice(CONFIG_BACKUP_PREFIX.length)) - Number(a.slice(CONFIG_BACKUP_PREFIX.length)));
      keys.slice(Math.max(0, max)).forEach(key => { try { localStorage.removeItem(key); } catch (_) {} });
    } catch (_) {}
  }

  function backupCurrentConfig() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return false;
      pruneConfigBackups(MAX_CONFIG_BACKUPS - 1);
      localStorage.setItem(CONFIG_BACKUP_PREFIX + Date.now(), raw);
      pruneConfigBackups(MAX_CONFIG_BACKUPS);
      return true;
    } catch (_) {
      try { pruneConfigBackups(1); } catch (_) {}
      return false;
    }
  }

  function readJsonStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  }

  function loadRecordingIntents() {
    const ids = readJsonStorage(RECORDING_INTENT_KEY, []);
    return Array.isArray(ids) ? [...new Set(ids.map(normalizeUsername).filter(isLikelyUsername))] : [];
  }

  function saveRecordingIntents(ids) {
    writeJsonStorage(RECORDING_INTENT_KEY, [...new Set((ids || []).map(normalizeUsername).filter(isLikelyUsername))]);
  }

  function setRecordingIntent(id, on) {
    id = normalizeUsername(id);
    if (!isLikelyUsername(id)) return;
    const ids = new Set(loadRecordingIntents());
    if (on) ids.add(id);
    else ids.delete(id);
    saveRecordingIntents([...ids]);
  }

  function addRoomStatusHistory(id, status, extra = {}) {
    id = normalizeUsername(id);
    if (!isLikelyUsername(id) || !isStableRoomStatus(status)) return;
    const all = readJsonStorage(ROOM_STATUS_HISTORY_KEY, {});
    const list = Array.isArray(all[id]) ? all[id] : [];
    const last = list[0];
    if (last && last.status === status && Date.now() - Number(last.ts || 0) < 30000) return;
    list.unshift({
      ts: Date.now(),
      status,
      privateLabel: extra.privateLabel ? String(extra.privateLabel).slice(0, 40) : '',
    });
    all[id] = list.slice(0, 80);
    writeJsonStorage(ROOM_STATUS_HISTORY_KEY, all);
  }

  function loadRoomStatusHistory() {
    const all = readJsonStorage(ROOM_STATUS_HISTORY_KEY, {});
    return all && typeof all === 'object' && !Array.isArray(all) ? all : {};
  }

  function writeStoreRaw(json) {
    try {
      localStorage.setItem(STORE_KEY, json);
      pruneConfigBackups(MAX_CONFIG_BACKUPS);
      return true;
    } catch (e) {
      pruneConfigBackups(0);
      localStorage.setItem(STORE_KEY, json);
      return true;
    }
  }

  const Storage = {
    load() {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
          const s = sanitizeState(JSON.parse(raw));
          if (!s.settings.__focusAutoMigratedV12) { s.settings.focusAspect = 'auto'; s.settings.__focusAutoMigratedV12 = true; }
          return s;
        }
        return defaultState();
      } catch (e) {
        console.warn('[RoomGrid] Storage load failed, fallback to default', e);
        return defaultState();
      }
    },
    save(state) {
      try {
        const clean = sanitizeState(state);
        writeStoreRaw(JSON.stringify(clean));
        // localStorage 的 storage 事件不会在当前页面触发；补一个同页事件，
        // 让同标签页 SPA 切换主播 / QuickAdd 状态也能立即刷新。
        try { window.dispatchEvent(new CustomEvent('ryujo_multicam_storage', { detail: { state: clean } })); } catch (_) {}
      }
      catch (e) { console.warn('[RoomGrid] Storage save failed', e); }
    },
    clearAll() {
      try {
        localStorage.removeItem(STORE_KEY);
        try { window.dispatchEvent(new CustomEvent('ryujo_multicam_storage', { detail: { state: null } })); } catch (_) {}
      } catch (_) {}
    },
    has(id) {
      id = normalizeUsername(id);
      try { return !!this.load().rooms.find(r => r.id === id); } catch (_) { return false; }
    },
    add(id) {
      id = normalizeUsername(id);
      if (!isLikelyUsername(id)) return 'failed';
      const s = this.load();
      if (s.rooms.find(r => r.id === id)) return 'exists';
      const order = nextOrderForGroup(s, DEFAULT_GROUP_ID);
      s.rooms.push(normalizeRoom({
        id, addedAt: Date.now(), group: DEFAULT_GROUP_ID, groups: [DEFAULT_GROUP_ID], groupOrder: {},
        order, lastStatus: 'unknown', lastSeenOnline: 0, muted: false,
      }, order));
      this.save(s);
      return 'added';
    },
    remove(id) {
      id = normalizeUsername(id);
      const s = this.load();
      const before = s.rooms.length;
      s.rooms = s.rooms.filter(r => r.id !== id);
      if (s.rooms.length !== before) { this.save(s); return true; }
      return false;
    },
  };

  function buildSuiteSettingsPayload(multicamState = Storage.load()) {
    const cleanState = sanitizeState(multicamState || Storage.load());
    const multicamSettings = {
      ...cleanState.settings,
      activeGroup: DEFAULT_GROUP_ID,
      pageIndex: 0,
      focusedRoomId: null,
      searchQuery: '',
      pureMode: false,
      viewerMode: false,
      showRecordingOnly: false,
    };
    return {
      format: 'chaturbate-suite-settings-v3',
      exportedAt: new Date().toISOString(),
      scriptVersion: META.version,
      components: {
        multicamPro: {
          version: META.version,
          importMode: 'replace-library',
          settings: multicamSettings,
          rooms: cleanState.rooms,
          groups: cleanState.groups,
        },
        reloaded: captureReloadedSettings(),
      },
    };
  }

  function exportSuiteSettingsLocal(multicamState = Storage.load()) {
    const payload = buildSuiteSettingsPayload(multicamState);
    downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
      `chaturbate-suite-settings-${Date.now()}.json`,
    );
  }

  let githubSessionPassphrase = '';

  function defaultGithubDeviceName() {
    const mobile = navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent || '');
    const platform = navigator.userAgentData?.platform || navigator.platform || '';
    return mobile ? `Phone${platform ? ` (${platform})` : ''}` : `PC${platform ? ` (${platform})` : ''}`;
  }

  function loadGithubSyncConfig() {
    let parsed = {};
    try {
      const raw = typeof GM_getValue === 'function' ? GM_getValue(GITHUB_SYNC_CONFIG_KEY, '') : '';
      if (typeof raw === 'string' && raw) parsed = JSON.parse(raw);
      else if (raw && typeof raw === 'object') parsed = raw;
    } catch (_) {}
    return {
      ...GITHUB_SYNC_TARGET,
      token: typeof parsed.token === 'string' ? parsed.token.trim() : '',
      deviceName: typeof parsed.deviceName === 'string' && parsed.deviceName.trim()
        ? parsed.deviceName.trim().slice(0, 80)
        : defaultGithubDeviceName(),
      rememberPassphrase: parsed.rememberPassphrase !== false,
      passphrase: typeof parsed.passphrase === 'string' ? parsed.passphrase : '',
    };
  }

  function saveGithubSyncConfig(next) {
    const clean = {
      token: String(next?.token || '').trim(),
      deviceName: String(next?.deviceName || defaultGithubDeviceName()).trim().slice(0, 80),
      rememberPassphrase: next?.rememberPassphrase !== false,
      passphrase: next?.rememberPassphrase !== false ? String(next?.passphrase || '') : '',
    };
    githubSessionPassphrase = String(next?.passphrase || '');
    if (typeof GM_setValue === 'function') GM_setValue(GITHUB_SYNC_CONFIG_KEY, JSON.stringify(clean));
    return { ...GITHUB_SYNC_TARGET, ...clean, passphrase: githubSessionPassphrase || clean.passphrase };
  }

  function clearGithubSyncConfig() {
    githubSessionPassphrase = '';
    if (typeof GM_setValue === 'function') GM_setValue(GITHUB_SYNC_CONFIG_KEY, '');
  }

  function bytesToBase64(bytes) {
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  }

  function base64ToBytes(value) {
    const binary = atob(String(value || '').replace(/\s+/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function textToBase64(value) {
    return bytesToBase64(new TextEncoder().encode(String(value || '')));
  }

  function base64ToText(value) {
    return new TextDecoder().decode(base64ToBytes(value));
  }

  async function deriveGithubSyncKey(passphrase, salt, iterations, usages) {
    const material = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey'],
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      usages,
    );
  }

  async function encryptSuiteSettingsPayload(payload, passphrase, deviceName) {
    if (!crypto?.subtle) throw new Error('This browser does not support secure settings encryption');
    if (String(passphrase || '').length < 8) throw new Error('Encryption passphrase must be at least 8 characters');
    const plaintext = new TextEncoder().encode(JSON.stringify(payload));
    if (plaintext.byteLength > MAX_CONFIG_BYTES) throw new Error('Settings are too large to upload');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveGithubSyncKey(passphrase, salt, GITHUB_PBKDF2_ITERATIONS, ['encrypt']);
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext));
    return {
      format: GITHUB_SYNC_FORMAT,
      version: 1,
      encryptedAt: new Date().toISOString(),
      deviceName: String(deviceName || 'Unknown device').slice(0, 80),
      crypto: {
        cipher: 'AES-GCM-256',
        kdf: 'PBKDF2-SHA-256',
        iterations: GITHUB_PBKDF2_ITERATIONS,
        salt: bytesToBase64(salt),
        iv: bytesToBase64(iv),
      },
      ciphertext: bytesToBase64(ciphertext),
    };
  }

  async function decryptSuiteSettingsEnvelope(envelope, passphrase) {
    if (!envelope || envelope.format !== GITHUB_SYNC_FORMAT || envelope.version !== 1) {
      throw new Error('Unsupported encrypted settings format');
    }
    const iterations = Number(envelope.crypto?.iterations);
    if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 1000000) {
      throw new Error('Invalid encryption parameters');
    }
    const salt = base64ToBytes(envelope.crypto?.salt);
    const iv = base64ToBytes(envelope.crypto?.iv);
    const ciphertext = base64ToBytes(envelope.ciphertext);
    if (salt.length !== 16 || iv.length !== 12 || !ciphertext.length) throw new Error('Encrypted settings are incomplete');
    try {
      const key = await deriveGithubSyncKey(passphrase, salt, iterations, ['decrypt']);
      const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
      if (plaintext.byteLength > MAX_CONFIG_BYTES) throw new Error('Decrypted settings are too large');
      return JSON.parse(new TextDecoder().decode(plaintext));
    } catch (error) {
      if (error?.message === 'Decrypted settings are too large') throw error;
      throw new Error('Unable to decrypt settings. Check the passphrase and try again.');
    }
  }

  function githubApiRequest(config, method, url, data = null) {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest !== 'function') {
        reject(new Error('Tampermonkey network access is unavailable'));
        return;
      }
      const headers = {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token}`,
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
      };
      if (data != null) headers['Content-Type'] = 'application/json';
      GM_xmlhttpRequest({
        method,
        url,
        headers,
        data: data == null ? undefined : JSON.stringify(data),
        timeout: 30000,
        onload: response => {
          let parsed = null;
          try { parsed = response.responseText ? JSON.parse(response.responseText) : null; } catch (_) {}
          resolve({ status: Number(response.status), data: parsed, text: response.responseText || '' });
        },
        onerror: () => reject(new Error('Unable to reach GitHub')),
        ontimeout: () => reject(new Error('GitHub request timed out')),
      });
    });
  }

  function githubContentsApiUrl(config) {
    const path = config.path.split('/').map(encodeURIComponent).join('/');
    return `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${path}`;
  }

  function githubResponseError(response, fallback) {
    const message = response?.data?.message || fallback || 'GitHub request failed';
    if (response?.status === 401) return new Error('GitHub rejected the token. Save a valid fine-grained token and try again.');
    if (response?.status === 403) return new Error('The GitHub token does not have Contents read/write permission for the settings repository.');
    if (response?.status === 404) return new Error('The private GitHub settings repository or settings file was not found.');
    return new Error(`GitHub ${response?.status || ''}: ${message}`.trim());
  }

  async function testGithubSyncConnection(config) {
    const url = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`;
    const response = await githubApiRequest(config, 'GET', url);
    if (response.status !== 200) throw githubResponseError(response, 'Connection test failed');
    return response.data;
  }

  async function uploadSuiteSettingsToGithub(config, passphrase, multicamState = Storage.load()) {
    const payload = buildSuiteSettingsPayload(multicamState);
    const envelope = await encryptSuiteSettingsPayload(payload, passphrase, config.deviceName);
    const url = githubContentsApiUrl(config);
    const existing = await githubApiRequest(config, 'GET', `${url}?ref=${encodeURIComponent(config.branch)}`);
    if (![200, 404].includes(existing.status)) throw githubResponseError(existing, 'Unable to read the current cloud backup');
    const requestBody = {
      message: `Update Chaturbate settings from ${config.deviceName}`,
      content: textToBase64(JSON.stringify(envelope, null, 2)),
      branch: config.branch,
    };
    if (existing.status === 200 && existing.data?.sha) requestBody.sha = existing.data.sha;
    const uploaded = await githubApiRequest(config, 'PUT', url, requestBody);
    if (![200, 201].includes(uploaded.status)) throw githubResponseError(uploaded, 'Unable to upload settings');
    return { envelope, commit: uploaded.data?.commit?.sha || '' };
  }

  async function downloadSuiteSettingsFromGithub(config, passphrase) {
    const url = `${githubContentsApiUrl(config)}?ref=${encodeURIComponent(config.branch)}`;
    const response = await githubApiRequest(config, 'GET', url);
    if (response.status !== 200 || !response.data?.content) throw githubResponseError(response, 'No cloud backup is available yet');
    let envelope;
    try { envelope = JSON.parse(base64ToText(response.data.content)); }
    catch (_) { throw new Error('The GitHub settings file is not valid JSON'); }
    const payload = await decryptSuiteSettingsEnvelope(envelope, passphrase);
    return { payload, envelope, sha: response.data.sha || '' };
  }

  function githubSyncCredentials(options = {}) {
    const config = loadGithubSyncConfig();
    const passphrase = config.passphrase || githubSessionPassphrase;
    if (!config.token || !passphrase) {
      if (options.openSetup !== false) openGithubSyncSetup('Enter a GitHub token and encryption passphrase, then save.');
      return null;
    }
    return { config, passphrase };
  }

  function ensureGithubSyncStyle() {
    if (document.getElementById('roomgrid-github-sync-style')) return;
    const style = document.createElement('style');
    style.id = 'roomgrid-github-sync-style';
    style.textContent = `
      .roomgrid-github-backdrop{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(2,6,23,.72);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
      .roomgrid-github-panel{box-sizing:border-box;width:min(520px,100%);max-height:min(760px,92dvh);overflow-y:auto;padding:18px;border:1px solid rgba(255,255,255,.16);border-radius:18px;background:#111827;color:#f8fafc;box-shadow:0 24px 80px rgba(0,0,0,.5)}
      .roomgrid-github-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}.roomgrid-github-head h2{margin:0;font-size:19px}.roomgrid-github-close{width:42px;height:42px;border:0;border-radius:12px;background:rgba(255,255,255,.08);color:#fff;font-size:22px;cursor:pointer}
      .roomgrid-github-copy{margin:0 0 14px;color:#cbd5e1;font-size:13px;line-height:1.45}.roomgrid-github-target{margin:0 0 12px;padding:9px 10px;border-radius:10px;background:rgba(255,255,255,.06);color:#93c5fd;font-size:12px;overflow-wrap:anywhere}
      .roomgrid-github-field{display:grid;gap:5px;margin:10px 0;color:#cbd5e1;font-size:12px;font-weight:700}.roomgrid-github-field input{box-sizing:border-box;width:100%;min-height:44px;padding:9px 11px;border:1px solid rgba(255,255,255,.16);border-radius:10px;outline:none;background:#0f172a;color:#fff;font:14px system-ui}.roomgrid-github-field input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(59,130,246,.18)}
      .roomgrid-github-check{display:flex;align-items:center;gap:9px;margin:10px 0;color:#cbd5e1;font-size:13px}.roomgrid-github-check input{width:20px;height:20px;accent-color:#2563eb}.roomgrid-github-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.roomgrid-github-actions button{min-height:44px;padding:9px;border:1px solid rgba(255,255,255,.14);border-radius:10px;background:rgba(255,255,255,.08);color:#fff;font-weight:800;cursor:pointer}.roomgrid-github-actions button.primary{background:#2563eb}.roomgrid-github-actions button.success{background:#15803d}.roomgrid-github-actions button.warn{background:#a16207}.roomgrid-github-actions button.danger{background:#991b1b}.roomgrid-github-actions button:disabled{opacity:.5;cursor:wait}
      .roomgrid-github-status{min-height:38px;margin-top:12px;padding:9px 10px;border-radius:10px;background:rgba(255,255,255,.05);color:#cbd5e1;font-size:12px;line-height:1.4}.roomgrid-github-status.error{color:#fecaca;background:rgba(127,29,29,.34)}.roomgrid-github-status.success{color:#bbf7d0;background:rgba(20,83,45,.36)}
      @media(max-width:520px){.roomgrid-github-backdrop{align-items:flex-end;padding:0}.roomgrid-github-panel{width:100%;max-height:92dvh;border-radius:18px 18px 0 0;padding-bottom:max(18px,env(safe-area-inset-bottom))}.roomgrid-github-actions{grid-template-columns:1fr}}
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function openGithubSyncSetup(initialMessage = '') {
    ensureGithubSyncStyle();
    document.getElementById('roomgrid-github-sync-backdrop')?.remove();
    const current = loadGithubSyncConfig();
    const backdrop = $('div', { id: 'roomgrid-github-sync-backdrop', class: 'roomgrid-github-backdrop' });
    const panel = $('section', { class: 'roomgrid-github-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'GitHub cloud settings' });
    const close = $('button', { class: 'roomgrid-github-close', type: 'button', title: 'Close', onclick: () => backdrop.remove() }, '×');
    const tokenInput = $('input', { type: 'password', autocomplete: 'off', value: current.token, placeholder: 'Fine-grained GitHub token' });
    const passphraseInput = $('input', { type: 'password', autocomplete: 'new-password', value: current.passphrase || githubSessionPassphrase, placeholder: 'At least 8 characters' });
    const deviceInput = $('input', { type: 'text', value: current.deviceName, maxlength: 80 });
    const rememberInput = $('input', { type: 'checkbox', checked: current.rememberPassphrase });
    const status = $('div', { class: 'roomgrid-github-status', role: 'status' }, initialMessage || (current.token ? 'GitHub credentials are saved on this device.' : 'GitHub cloud backup is not configured on this device.'));
    const setStatus = (message, kind = '') => {
      status.textContent = message;
      status.className = `roomgrid-github-status${kind ? ` ${kind}` : ''}`;
    };
    const readAndSave = () => saveGithubSyncConfig({
      token: tokenInput.value,
      passphrase: passphraseInput.value,
      deviceName: deviceInput.value,
      rememberPassphrase: rememberInput.checked,
    });
    const withBusy = async (button, action) => {
      const buttons = [...panel.querySelectorAll('button')];
      buttons.forEach(item => { item.disabled = true; });
      try { await action(); }
      catch (error) { setStatus(error.message || String(error), 'error'); }
      finally { buttons.forEach(item => { item.disabled = false; }); }
    };
    const saveButton = $('button', { class: 'primary', type: 'button', onclick: () => {
      const saved = readAndSave();
      if (!saved.token) { setStatus('Enter the fine-grained GitHub token.', 'error'); return; }
      if (String(saved.passphrase || '').length < 8) { setStatus('The encryption passphrase must be at least 8 characters.', 'error'); return; }
      setStatus('GitHub cloud settings saved on this device.', 'success');
      updateGithubSyncMenuLabel();
    } }, 'Save setup');
    const testButton = $('button', { type: 'button' }, 'Test connection');
    testButton.addEventListener('click', () => withBusy(testButton, async () => {
      const saved = readAndSave();
      if (!saved.token) throw new Error('Enter the fine-grained GitHub token first.');
      await testGithubSyncConnection(saved);
      setStatus('Connected to the private GitHub settings repository.', 'success');
      updateGithubSyncMenuLabel();
    }));
    const exportButton = $('button', { class: 'success', type: 'button' }, 'Export to GitHub');
    exportButton.addEventListener('click', () => withBusy(exportButton, async () => {
      const saved = readAndSave();
      if (!saved.token || String(saved.passphrase || '').length < 8) throw new Error('Save a token and passphrase first.');
      const result = await uploadSuiteSettingsToGithub(saved, saved.passphrase, Storage.load());
      setStatus(`Cloud backup uploaded ${result.commit ? `(${result.commit.slice(0, 7)})` : ''}.`, 'success');
    }));
    const importButton = $('button', { class: 'warn', type: 'button' }, 'Import from GitHub');
    importButton.addEventListener('click', () => withBusy(importButton, async () => {
      const saved = readAndSave();
      if (!saved.token || String(saved.passphrase || '').length < 8) throw new Error('Save a token and passphrase first.');
      const downloaded = await downloadSuiteSettingsFromGithub(saved, saved.passphrase);
      const roomCount = downloaded.payload?.components?.multicamPro?.rooms?.length;
      const detail = `Backup: ${downloaded.envelope.encryptedAt || 'unknown date'} from ${downloaded.envelope.deviceName || 'unknown device'}${Number.isInteger(roomCount) ? `, ${roomCount} models` : ''}.`;
      if (!confirm(`${detail}\n\nImporting replaces the current model library. Continue?`)) { setStatus('Import cancelled.'); return; }
      const result = applySuiteSettingsPayload(downloaded.payload);
      setStatus(`Imported cloud backup${Number.isInteger(result.roomCount) ? ` with ${result.roomCount} models` : ''}. Reloading…`, 'success');
      setTimeout(() => location.reload(), 650);
    }));
    const localExportButton = $('button', { type: 'button', onclick: () => exportSuiteSettingsLocal(Storage.load()) }, 'Download local backup');
    const localImportButton = $('button', { type: 'button', onclick: () => importSuiteSettingsFile({ onImported: result => alert(t(result.roomsReplaced ? 'settingsImported' : 'settingsImportedLegacy')) }) }, 'Import local backup');
    const clearButton = $('button', { class: 'danger', type: 'button', onclick: () => {
      if (!confirm('Erase the saved GitHub token and encryption passphrase from this device?')) return;
      clearGithubSyncConfig();
      tokenInput.value = '';
      passphraseInput.value = '';
      setStatus('GitHub credentials erased from this device.', 'success');
      updateGithubSyncMenuLabel();
    } }, 'Disconnect');
    panel.append(
      $('div', { class: 'roomgrid-github-head' }, [$('h2', {}, 'GitHub cloud backup'), close]),
      $('p', { class: 'roomgrid-github-copy' }, 'Exports upload one encrypted latest backup. Imports download it and replace the current MultiCam model library after confirmation.'),
      $('div', { class: 'roomgrid-github-target' }, `${GITHUB_SYNC_TARGET.owner}/${GITHUB_SYNC_TARGET.repo} · ${GITHUB_SYNC_TARGET.path}`),
      $('label', { class: 'roomgrid-github-field' }, [$('span', {}, 'Device name'), deviceInput]),
      $('label', { class: 'roomgrid-github-field' }, [$('span', {}, 'Fine-grained GitHub token'), tokenInput]),
      $('label', { class: 'roomgrid-github-field' }, [$('span', {}, 'Encryption passphrase'), passphraseInput]),
      $('label', { class: 'roomgrid-github-check' }, [rememberInput, $('span', {}, 'Remember the encryption passphrase on this device')]),
      $('div', { class: 'roomgrid-github-actions' }, [saveButton, testButton, exportButton, importButton, localExportButton, localImportButton, clearButton]),
      status,
    );
    backdrop.appendChild(panel);
    backdrop.addEventListener('click', event => { if (event.target === backdrop) backdrop.remove(); });
    document.body.appendChild(backdrop);
    setTimeout(() => (current.token ? passphraseInput : tokenInput).focus(), 0);
  }

  function updateGithubSyncMenuLabel() {
    const button = document.getElementById('githubsyncbutton');
    if (!button) return;
    const configured = !!loadGithubSyncConfig().token;
    button.textContent = configured ? 'GitHub Cloud: Configured' : 'GitHub Cloud: Setup required';
  }

  async function exportSuiteSettings(multicamState = Storage.load(), options = {}) {
    const credentials = githubSyncCredentials(options);
    if (!credentials) return null;
    try {
      const result = await uploadSuiteSettingsToGithub(credentials.config, credentials.passphrase, multicamState);
      alert(`Settings uploaded securely to GitHub${result.commit ? ` (${result.commit.slice(0, 7)})` : ''}.`);
      return result;
    } catch (error) {
      alert(`GitHub export failed: ${error.message || error}`);
      return null;
    }
  }

  async function importSuiteSettingsFromGithub(options = {}) {
    const credentials = githubSyncCredentials(options);
    if (!credentials) return null;
    try {
      const downloaded = await downloadSuiteSettingsFromGithub(credentials.config, credentials.passphrase);
      const roomCount = downloaded.payload?.components?.multicamPro?.rooms?.length;
      const detail = `Backup: ${downloaded.envelope.encryptedAt || 'unknown date'} from ${downloaded.envelope.deviceName || 'unknown device'}${Number.isInteger(roomCount) ? `, ${roomCount} models` : ''}.`;
      if (!confirm(`${detail}\n\nImporting replaces the current model library. Continue?`)) return null;
      const result = applySuiteSettingsPayload(downloaded.payload);
      options.onImported?.(result);
      setTimeout(() => location.reload(), 650);
      return result;
    } catch (error) {
      if (typeof options.onError === 'function') options.onError(error);
      else alert(`GitHub import failed: ${error.message || error}`);
      return null;
    }
  }

  function applySuiteSettingsPayload(parsed) {
    const multicamComponent = parsed?.components?.multicamPro;
    const rawMulticam = multicamComponent?.settings || parsed?.settings;
    const rawRooms = Array.isArray(multicamComponent?.rooms)
      ? multicamComponent.rooms
      : (Array.isArray(multicamComponent?.models) ? multicamComponent.models : null);
    const rawGroups = Array.isArray(multicamComponent?.groups) ? multicamComponent.groups : null;
    const rawReloaded = parsed?.components?.reloaded || parsed?.reloaded;
    const hasMulticamSettings = !!rawMulticam && typeof rawMulticam === 'object' && !Array.isArray(rawMulticam);
    const replacesRoomLibrary = rawRooms !== null;
    const hasMulticam = hasMulticamSettings || replacesRoomLibrary;
    const hasReloaded = !!rawReloaded && typeof rawReloaded === 'object' && !Array.isArray(rawReloaded);
    if (!hasMulticam && !hasReloaded) throw new Error('MultiCam or Reloaded settings object missing');

    let nextState = null;
    if (hasMulticam) {
      const current = Storage.load();
      let nextSettings = current.settings;
      if (hasMulticamSettings) {
        const allowed = new Set(Object.keys(defaultState().settings));
        const imported = Object.fromEntries(Object.entries(rawMulticam).filter(([key]) => allowed.has(key)));
        nextSettings = sanitizeState({
          ...current,
          settings: { ...current.settings, ...imported },
        }).settings;
      }
      nextSettings.pureMode = false;
      nextSettings.viewerMode = false;
      nextSettings.activeGroup = DEFAULT_GROUP_ID;
      nextSettings.pageIndex = 0;
      nextSettings.focusedRoomId = null;
      nextSettings.searchQuery = '';
      nextSettings.showRecordingOnly = false;

      if (replacesRoomLibrary) {
        // A v3 backup is authoritative: imported rooms/groups replace the old model library instead of merging with it.
        nextState = sanitizeState({
          v: current.v,
          rooms: rawRooms,
          groups: rawGroups || defaultState().groups,
          settings: nextSettings,
        });
      } else if (hasMulticamSettings) {
        // Backward compatibility for v2 settings-only exports: preserve the existing model library.
        nextState = { ...current, settings: nextSettings };
      }
    }
    if (!nextState && !hasReloaded) throw new Error('no supported settings found');

    backupCurrentConfig();
    if (nextState) Storage.save(nextState);
    if (nextState && replacesRoomLibrary) {
      const importedIds = new Set(nextState.rooms.map(room => room.id));
      saveRecordingIntents(loadRecordingIntents().filter(id => importedIds.has(id)));
      const history = loadRoomStatusHistory();
      writeJsonStorage(ROOM_STATUS_HISTORY_KEY, Object.fromEntries(
        Object.entries(history).filter(([id]) => importedIds.has(normalizeUsername(id))),
      ));
    }
    if (hasReloaded && !restoreReloadedSettings(rawReloaded)) throw new Error('Reloaded settings are invalid');
    return {
      multicam: !!nextState,
      reloaded: hasReloaded,
      roomsReplaced: replacesRoomLibrary,
      roomCount: nextState ? nextState.rooms.length : null,
    };
  }

  function importSuiteSettingsFile(options = {}) {
    const inp = $('input', {
      type: 'file',
      accept: 'application/json,.json',
      style: { display: 'none' },
      onchange: async (event) => {
        const file = event.target.files?.[0];
        if (!file) { try { inp.remove(); } catch (_) {} return; }
        try {
          if (file.size > MAX_CONFIG_BYTES) throw new Error('file too large');
          const parsed = JSON.parse(await file.text());
          const importsRoomLibrary = Array.isArray(parsed?.components?.multicamPro?.rooms)
            || Array.isArray(parsed?.components?.multicamPro?.models);
          if (!confirm(t(importsRoomLibrary ? 'settingsImportConfirm' : 'settingsImportLegacyConfirm'))) return;
          const result = applySuiteSettingsPayload(parsed);
          options.onImported?.(result);
          setTimeout(() => location.reload(), 500);
        } catch (err) {
          if (typeof options.onError === 'function') options.onError(err);
          else alert((LANG === 'zh' ? '导入设置失败：' : 'Settings import failed: ') + err.message);
        } finally {
          setTimeout(() => { try { inp.remove(); } catch (_) {} }, 0);
        }
      },
    });
    document.body.appendChild(inp);
    inp.click();
    setTimeout(() => { try { if (!inp.files || !inp.files.length) inp.remove(); } catch (_) {} }, 60000);
  }

  Object.defineProperty(window, '__chaturbateSuiteSettings', {
    configurable: true,
    value: Object.freeze({
      exportSettings: () => exportSuiteSettings(Storage.load()),
      importSettings: () => importSuiteSettingsFromGithub({
        onImported: result => alert(t(result.roomsReplaced ? 'settingsImported' : 'settingsImportedLegacy')),
      }),
      exportLocalSettings: () => exportSuiteSettingsLocal(Storage.load()),
      importLocalSettings: () => importSuiteSettingsFile({
        onImported: result => alert(t(result.roomsReplaced ? 'settingsImported' : 'settingsImportedLegacy')),
      }),
      configureGithubSync: () => openGithubSyncSetup(),
    }),
  });

  /* =============================================================
   * 2. 状态层 / Store —— 简单响应式 + 持久化
   * ============================================================= */
  function createStore() {
    let state = Storage.load();
    if (state.settings.startOnOnlineFavorites) {
      state.settings.activeGroup = ONLINE_FAVORITES_GROUP_ID;
      state.settings.pageIndex = 0;
    }
    const subs = new Set();
    const persistDebounced = debounce(() => Storage.save(state), 800);

    const notify = (path) => { for (const fn of subs) fn(state, path); };

    const update = (mutator, path = 'all') => {
      try {
        const result = mutator(state);
        // v15.5: mutator 返回 false 表示没有实际变化，避免同状态反复写 localStorage，
        // 减少多工作台之间 storage 事件 ping-pong 引发的重排/闪屏。
        if (result === false) return;
      }
      catch (err) { console.warn('[RoomGrid] store update failed', err); return; }
      persistDebounced();
      notify(path);
    };

    return {
      get state() { return state; },
      subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
      update,
      replaceState(nextState, path = 'all') {
        state = sanitizeState(nextState || defaultState());
        notify(path);
      },

      // ---- 房间 ----
      addRoom(id) {
        id = normalizeUsername(id);
        if (!isLikelyUsername(id)) return false;
        let changed = false;
        update(s => {
          normalizeStateMemberships(s);
          const ag = s.settings.activeGroup || DEFAULT_GROUP_ID;
          const targetGroup = (ag === LIBRARY_GROUP_ID || ag === ONLINE_GROUP_ID || ag === ONLINE_FAVORITES_GROUP_ID) ? DEFAULT_GROUP_ID : ag;
          const existing = s.rooms.find(r => r.id === id);
          if (existing) {
            changed = ensureRoomInGroup(existing, targetGroup, nextOrderForGroup(s, targetGroup)) || changed;
            return;
          }
          const allOrder = nextOrderForGroup(s, DEFAULT_GROUP_ID);
          const groupOrder = nextOrderForGroup(s, targetGroup);
          s.rooms.push(normalizeRoom({
            id, addedAt: Date.now(),
            group: targetGroup,
            groups: [targetGroup],
            groupOrder: targetGroup === DEFAULT_GROUP_ID ? {} : { [targetGroup]: groupOrder },
            order: allOrder,
            lastStatus: 'unknown', lastSeenOnline: 0, muted: false,
          }, allOrder));
          changed = true;
        }, 'rooms');
        return changed;
      },
      removeRoom(id) { id = normalizeUsername(id); update(s => { s.rooms = s.rooms.filter(r => r.id !== id); reconcileSplitState(s); }, 'rooms'); },
      removeRoomFromActiveGroup(id) {
        id = normalizeUsername(id);
        let globalRemoved = false;
        update(s => {
          normalizeStateMemberships(s);
          const ag = s.settings.activeGroup || DEFAULT_GROUP_ID;
          if (ag === LIBRARY_GROUP_ID || ag === ONLINE_GROUP_ID) {
            const before = s.rooms.length;
            s.rooms = s.rooms.filter(r => r.id !== id);
            reconcileSplitState(s);
            globalRemoved = s.rooms.length !== before;
            return;
          }
          const r = s.rooms.find(r => r.id === id);
          if (ag === ONLINE_FAVORITES_GROUP_ID) {
            if (r) removeRoomFromGroup(r, FAVORITE_GROUP_ID);
            return;
          }
          if (r) removeRoomFromGroup(r, ag);
        }, 'rooms');
        return globalRemoved;
      },
      patchRoom(id, patch) {
        id = normalizeUsername(id);
        const allowed = new Set(['lastStatus', 'lastSeenOnline', 'muted', 'privateLabel', 'errorMsg']);
        const clean = {};
        for (const [k, v] of Object.entries(patch || {})) if (allowed.has(k)) clean[k] = v;
        update(s => {
          const r = s.rooms.find(r => r.id === id);
          if (!r) return false;
          let changed = false;
          for (const [k, v] of Object.entries(clean)) {
            if (!Object.is(r[k], v)) { r[k] = v; changed = true; }
          }
          return changed;
        }, 'room:' + id);
      },
      setRoomCardSize(id, groupId, size) {
        id = normalizeUsername(id);
        update(s => {
          normalizeStateMemberships(s);
          const r = s.rooms.find(r => r.id === id);
          if (r) setCardSizeForGroup(r, groupId, size);
        }, 'rooms');
      },
      reorderRooms(orderedIds, targetGroup) {
        update(s => {
          normalizeStateMemberships(s);
          const actualGroup = targetGroup === ONLINE_FAVORITES_GROUP_ID ? FAVORITE_GROUP_ID : targetGroup;
          orderedIds.forEach((id, idx) => {
            const r = s.rooms.find(r => r.id === id);
            if (!r) return;
            if (!actualGroup || actualGroup === LIBRARY_GROUP_ID || actualGroup === ONLINE_GROUP_ID || actualGroup === DEFAULT_GROUP_ID) {
              r.order = idx;
            } else {
              ensureRoomInGroup(r, actualGroup, idx);
              r.groupOrder[actualGroup] = idx;
            }
          });
        }, 'rooms');
      },
      moveToGroup(id, groupId) {
        id = normalizeUsername(id);
        update(s => {
          normalizeStateMemberships(s);
          const r = s.rooms.find(r => r.id === id);
          if (!r || !groupId || groupId === LIBRARY_GROUP_ID || groupId === ONLINE_GROUP_ID || groupId === ONLINE_FAVORITES_GROUP_ID) return;
          ensureRoomInGroup(r, groupId, nextOrderForGroup(s, groupId));
        }, 'rooms');
      },
      toggleRoomInGroup(id, groupId) {
        id = normalizeUsername(id);
        let nowInGroup = false;
        update(s => {
          normalizeStateMemberships(s);
          const r = s.rooms.find(r => r.id === id);
          if (!r || !groupId || groupId === LIBRARY_GROUP_ID || groupId === ONLINE_GROUP_ID || groupId === ONLINE_FAVORITES_GROUP_ID) return;
          if (roomInGroup(r, groupId)) {
            removeRoomFromGroup(r, groupId);
            nowInGroup = false;
          } else {
            ensureRoomInGroup(r, groupId, nextOrderForGroup(s, groupId));
            nowInGroup = true;
          }
        }, 'rooms');
        return nowInGroup;
      },
      moveOnlyToGroup(id, groupId) {
        id = normalizeUsername(id);
        update(s => {
          normalizeStateMemberships(s);
          const r = s.rooms.find(r => r.id === id);
          if (!r || !groupId || groupId === LIBRARY_GROUP_ID || groupId === ONLINE_GROUP_ID || groupId === ONLINE_FAVORITES_GROUP_ID) return;
          r.groups = [groupId];
          r.group = groupId;
          r.groupOrder = r.groupOrder && typeof r.groupOrder === 'object' && !Array.isArray(r.groupOrder) ? r.groupOrder : {};
          r.groupOrder[groupId] = nextOrderForGroup(s, groupId);
        }, 'rooms');
      },
      setAllMuted(muted) {
        update(s => {
          normalizeStateMemberships(s);
          s.rooms.forEach(r => { r.muted = !!muted; });
        }, 'rooms');
      },
      resetTileSizes() {
        update(s => {
          normalizeStateMemberships(s);
          s.rooms.forEach(r => { delete r.cardSize; delete r.cardSizeByGroup; });
        }, 'rooms');
      },
      repairData() {
        update(s => {
          normalizeStateMemberships(s);
          ensureSystemGroups(s);
          const validGroupIds = new Set((s.groups || []).map(g => g.id).filter(id => id !== LIBRARY_GROUP_ID && id !== ONLINE_GROUP_ID && id !== ONLINE_FAVORITES_GROUP_ID));
          s.rooms.forEach((r, idx) => {
            r.groups = getRoomGroups(r).filter(g => validGroupIds.has(g));
            r.group = r.groups[0] || null;
            r.order = numeric(r.order, idx);
            if (!r.groupOrder || typeof r.groupOrder !== 'object' || Array.isArray(r.groupOrder)) r.groupOrder = {};
            for (const g of Object.keys(r.groupOrder)) if (!validGroupIds.has(g)) delete r.groupOrder[g];
            const sizeMap = normalizeCardSizeMap(r.cardSizeByGroup);
            const legacyCardSize = normalizeCardSize(r.cardSize);
            if (legacyCardSize && !sizeMap.all) sizeMap.all = legacyCardSize;
            if (Object.keys(sizeMap).length) r.cardSizeByGroup = sizeMap; else delete r.cardSizeByGroup;
            delete r.cardSize;
          });
          reconcileSplitState(s);
        }, 'all');
      },

      // ---- 分组 ----
      addGroup(name) {
        const safeName = safeGroupName(name, LANG === 'zh' ? '新分组' : 'New group');
        const id = uuid();
        update(s => { s.groups.push({ id, name: safeName, order: s.groups.length }); }, 'groups');
        return id;
      },
      renameGroup(id, name) { update(s => { const g = s.groups.find(g => g.id === id); if (g && !g.system) g.name = safeGroupName(name, g.name); }, 'groups'); },
      removeGroup(id) {
        update(s => {
          if (s.groups.find(g => g.id === id)?.system) return;
          s.groups = s.groups.filter(g => g.id !== id);
          s.rooms.forEach(r => removeRoomFromGroup(r, id));
          if (s.settings.activeGroup === id) s.settings.activeGroup = DEFAULT_GROUP_ID;
        }, 'groups');
      },
      setActiveGroup(id) { update(s => { if (s.groups.some(g => g.id === id)) { s.settings.activeGroup = id; s.settings.pageIndex = 0; } }, 'settings:activeGroup,pageIndex'); },

      // ---- Split View ----
      setSplitSlot(slot, id) {
        slot = slot === 1 ? 1 : 0;
        id = normalizeUsername(id);
        let changed = false;
        update(s => {
          reconcileSplitState(s);
          if (!s.rooms.some(room => room.id === id)) return false;
          const ids = [...s.settings.splitRoomIds];
          const otherSlot = slot === 0 ? 1 : 0;
          if (ids[otherSlot] === id || ids[slot] === id) return false;
          const previous = ids[slot] || null;
          ids[slot] = id;
          s.settings.splitRoomIds = ids.filter(Boolean).slice(0, 2);
          if (s.settings.splitAudioRoomId === previous || !s.settings.splitAudioRoomId) s.settings.splitAudioRoomId = id;
          s.settings.splitViewActive = s.settings.splitRoomIds.length === 2;
          if (s.settings.splitViewActive) {
            s.settings.pureMode = false;
            s.settings.viewerMode = false;
          }
          reconcileSplitState(s);
          changed = true;
        }, 'settings:splitRoomIds,splitViewActive,splitAudioRoomId');
        return changed;
      },
      setSplitActive(active) {
        update(s => {
          reconcileSplitState(s);
          const next = !!active && s.settings.splitRoomIds.length === 2;
          if (s.settings.splitViewActive === next) return false;
          s.settings.splitViewActive = next;
          if (next) {
            s.settings.pureMode = false;
            s.settings.viewerMode = false;
          }
        }, 'settings:splitViewActive');
      },
      swapSplitRooms() {
        update(s => {
          reconcileSplitState(s);
          if (s.settings.splitRoomIds.length !== 2) return false;
          s.settings.splitRoomIds = [s.settings.splitRoomIds[1], s.settings.splitRoomIds[0]];
        }, 'settings:splitRoomIds');
      },
      setSplitAudio(id) {
        id = normalizeUsername(id);
        update(s => {
          reconcileSplitState(s);
          if (!s.settings.splitRoomIds.includes(id) || s.settings.splitAudioRoomId === id) return false;
          s.settings.splitAudioRoomId = id;
        }, 'settings:splitAudioRoomId');
      },
      clearSplitSelection() {
        update(s => {
          s.settings.splitRoomIds = [];
          s.settings.splitAudioRoomId = null;
          s.settings.splitViewActive = false;
        }, 'settings:splitRoomIds,splitAudioRoomId,splitViewActive');
      },

      // ---- 设置 ----
      patchSettings(patch) {
        const allowed = new Set([...Object.keys(defaultState().settings), '__focusAutoMigratedV12']);
        const clean = {};
        for (const [k, v] of Object.entries(patch || {})) if (allowed.has(k)) clean[k] = v;
        const keys = Object.keys(clean);
        update(s => { Object.assign(s.settings, clean); reconcileSplitState(s); }, keys.length ? 'settings:' + keys.join(',') : 'settings');
      },
      patchFilter(patch) {
        const allowed = new Set(['hideOffline', 'hidePrivate', 'onlyOnline']);
        const clean = {};
        for (const [k, v] of Object.entries(patch || {})) if (allowed.has(k)) clean[k] = !!v;
        const keys = Object.keys(clean).map(k => 'filter.' + k);
        update(s => { Object.assign(s.settings.filter, clean); }, keys.length ? 'settings:' + keys.join(',') : 'settings');
      },
    };
  }

  /* =============================================================
   * 3. 通知 / Notify
   * ============================================================= */
  const Notify = {
    granted: false,
    init() {
      if ('Notification' in window && Notification.permission === 'granted') this.granted = true;
    },
    async request() {
      if (!('Notification' in window)) return false;
      if (Notification.permission === 'granted') { this.granted = true; return true; }
      if (Notification.permission === 'denied') return false;
      const r = await Notification.requestPermission();
      this.granted = r === 'granted';
      return this.granted;
    },
    fire(title, body) {
      if (!this.granted) return;
      try {
        const n = new Notification(title, { body, silent: false, tag: 'multicam-' + title });
        n.onclick = () => { window.focus(); n.close(); };
        setTimeout(() => n.close(), 8000);
      } catch (_) {}
    },
  };

  /* =============================================================
   * 4. 房间服务 / RoomService —— API + HLS + 重连 + 智能轮询
   * ============================================================= */
  function createRoomService(store) {
    const sessions = new Map();   // id -> { hls, video, status, retryCount, pollTimer, userPaused }
    const domain = safeChaturbateHost(window.location.hostname) ? window.location.hostname : 'chaturbate.com';

    function clearPoll(s) {
      if (s?.pollTimer) { clearTimeout(s.pollTimer); s.pollTimer = null; }
    }

    function onlinePollMs() {
      return Math.max(45000, Number(store.state.settings.pollMs?.online) || 120000);
    }

    async function fetchContext(id, signal) {
      const req = new AbortController();
      const timeout = setTimeout(() => { try { req.abort(); } catch (_) {} }, 15000);
      const abortFromParent = () => { try { req.abort(); } catch (_) {} };
      try {
        if (signal) {
          if (signal.aborted) abortFromParent();
          else signal.addEventListener('abort', abortFromParent, { once: true });
        }
        const res = await fetch(`https://${domain}/api/chatvideocontext/${encodeURIComponent(id)}/`, {
          credentials: 'include',
          signal: req.signal,
          referrer: `https://${domain}/${encodeURIComponent(id)}/`,
          referrerPolicy: 'strict-origin-when-cross-origin',
        });
        if (!res.ok) throw new Error('http ' + res.status);
        return res.json();
      } finally {
        clearTimeout(timeout);
        try { signal?.removeEventListener?.('abort', abortFromParent); } catch (_) {}
      }
    }

    function setStatus(id, status, extra = {}) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s) return;
      const room = store.state.rooms.find(r => r.id === id);
      const prev = s.status || room?.lastStatus || 'unknown';
      const opts = extra && typeof extra === 'object' ? extra : {};
      const transient = !!opts.transient;
      const safeExtra = { ...opts };
      delete safeExtra.transient;

      // v15.5: 后台探测中的 loading / 临时请求错误不覆盖稳定状态。
      // 否则 hideOffline / onlyOnline / 分页会短时间重算，表现为离线房间闪出、在线房间消失后又回来。
      if ((status === 'loading' || (status === 'error' && transient)) && isStableRoomStatus(prev)) {
        s.status = prev;
        s.pendingStatus = status;
        if (safeExtra.errorMsg) s.lastTransientError = safeExtra.errorMsg;
        return;
      }

      s.status = status;
      delete s.pendingStatus;
      const patch = { lastStatus: status, ...safeExtra };
      if (status === 'online') {
        const lastSeen = numeric(room?.lastSeenOnline, 0);
        if (prev !== 'online' || !lastSeen || Date.now() - lastSeen > 60000) patch.lastSeenOnline = Date.now();
      }
      store.patchRoom(id, patch);
      if (prev !== status && isStableRoomStatus(status)) addRoomStatusHistory(id, status, safeExtra);
      // 上线提醒
      const notificationEligible = !store.state.settings.notifyFavoritesOnly || roomInGroup(room, FAVORITE_GROUP_ID);
      if (prev && prev !== 'online' && status === 'online' && store.state.settings.notifyOnline && notificationEligible) {
        Notify.fire(t('notifyTitleText'), t('notifyBody', id));
        EventBus.emit('room:flash', id);
      }
    }

    function hardStopVideo(video) {
      stopMediaElement(video, true);
    }

    function hardStopRoomVideos(id) {
      id = normalizeUsername(id);
      // DOM 兜底：即使 cardMap/session 已经丢失，也按 room-id 把残留 video 杀掉。
      try {
        const safe = String(id).replace(/"/g, '');
        document.querySelectorAll(`video[data-multicam-room-id="${safe}"],video[data-multicam-room="${safe}"],audio[data-multicam-room-id="${safe}"],audio[data-multicam-room="${safe}"]`).forEach(hardStopVideo);
      } catch (_) {}
    }

    function destroyHls(s) {
      if (!s || !s.hls) return;
      try { s.hls.stopLoad(); } catch (_) {}
      try { s.hls.detachMedia(); } catch (_) {}
      try { s.hls.destroy(); } catch (_) {}
      s.hls = null;
    }

    function destroyPlayer(id, opts = {}) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s) { hardStopRoomVideos(id); return; }
      if (opts.abort !== false && s.abortController) {
        try { s.abortController.abort(); } catch (_) {}
        s.abortController = null;
      }
      clearPoll(s)
      if (s.hls) { try { s.hls.stopLoad(); } catch (_) {} }
      hardStopVideo(s.video);
      hardStopRoomVideos(id);
      if (s.hls) { try { s.hls.detachMedia(); } catch (_) {} try { s.hls.destroy(); } catch (_) {} s.hls = null; }
      s.video = null;
      s.hlsSource = null;
    }

    function detachVideo(id) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (s) {
        if (s.hls) { try { s.hls.stopLoad(); } catch (_) {} try { s.hls.detachMedia(); } catch (_) {} try { s.hls.destroy(); } catch (_) {} s.hls = null; }
        hardStopVideo(s.video);
        s.video = null;
        s.hlsSource = null;
        if (s.status === 'online' && store.state.rooms.some(r => r.id === id)) schedulePoll(id, onlinePollMs());
      }
      hardStopRoomVideos(id);
    }

    function attachVideo(id, video) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s) { hardStopVideo(video); return; }
      clearPoll(s);
      s.video = video;
    }

    function schedulePoll(id, ms) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s) return;
      clearPoll(s);
      // 错峰：±20%
      const jitter = ms * (0.8 + Math.random() * 0.4);
      s.pollTimer = setTimeout(() => { if (sessions.has(id)) connect(id); }, jitter);
    }

    function pause(id) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s) return false;
      s.userPaused = true;
      try { s.hls?.stopLoad?.(); } catch (_) {}
      try { s.video?.pause?.(); } catch (_) {}
      return true;
    }

    function resume(id) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s) return false;
      s.userPaused = false;
      try { s.hls?.startLoad?.(); } catch (_) {}
      try { s.video?.play?.().catch?.(() => {}); } catch (_) {}
      if (!s.video && store.state.rooms.some(r => r.id === id)) refresh(id);
      return true;
    }

    function isPaused(id) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      return !!(s?.userPaused || s?.video?.paused);
    }

    function togglePause(id) {
      return isPaused(id) ? (resume(id), false) : (pause(id), true);
    }

    function pauseAll(ids = null) {
      const list = ids && ids.length ? ids.map(normalizeUsername) : [...sessions.keys()];
      list.forEach(id => pause(id));
    }

    function resumeAll(ids = null) {
      const list = ids && ids.length ? ids.map(normalizeUsername) : [...sessions.keys()];
      list.forEach(id => resume(id));
    }

    function streamMaxHeight() {
      return Number(store.state.settings.maxStreamHeight) || 0;
    }

    function hlsLevelForMaxHeight(hls, maxHeight = streamMaxHeight()) {
      const levels = Array.isArray(hls?.levels) ? hls.levels : [];
      if (!levels.length || !maxHeight) return -1;
      let best = -1;
      let bestHeight = 0;
      let smallest = 0;
      let smallestHeight = Number(levels[0]?.height) || Infinity;
      levels.forEach((level, idx) => {
        const height = Number(level?.height) || 0;
        if (height && height < smallestHeight) { smallest = idx; smallestHeight = height; }
        if (height && height <= maxHeight && height >= bestHeight) {
          best = idx;
          bestHeight = height;
        }
      });
      return best >= 0 ? best : smallest;
    }

    function applyHlsQuality(hls) {
      if (!hls) return;
      const level = hlsLevelForMaxHeight(hls);
      try { hls.autoLevelCapping = level; } catch (_) {}
      try { hls.loadLevel = level; } catch (_) {}
      try { hls.currentLevel = level; } catch (_) {}
    }

    function refreshQuality() {
      sessions.forEach(s => { if (s?.hls) applyHlsQuality(s.hls); });
    }

    async function connect(id) {
      id = normalizeUsername(id);
      let s = sessions.get(id);
      if (!s) { s = { retryCount: 0 }; sessions.set(id, s); }

      // 新请求开始前中止旧请求。删除房间或快速刷新时，旧请求返回也不会再创建 video。
      if (s.abortController) { try { s.abortController.abort(); } catch (_) {} }
      const ac = new AbortController();
      s.abortController = ac;

      EventBus.emit('room:loading', id);
      setStatus(id, 'loading');

      let data;
      try {
        data = await fetchContext(id, ac.signal);
      } catch (e) {
        if (ac.signal.aborted || !sessions.has(id) || sessions.get(id) !== s) return;
        setStatus(id, 'error', { errorMsg: 'request failed', transient: true });
        s.retryCount = (s.retryCount || 0) + 1;
        const wait = Math.min(60000, store.state.settings.pollMs.error * Math.pow(1.6, s.retryCount));
        schedulePoll(id, wait);
        return;
      }

      if (ac.signal.aborted || !sessions.has(id) || sessions.get(id) !== s) return;
      if (s.abortController === ac) s.abortController = null;

      s.retryCount = 0;
      const cfg = store.state.settings.pollMs;

      if (data.room_status === 'offline') {
        setStatus(id, 'offline');
        destroyPlayer(id);
        s = sessions.get(id) || s;
        s.video = null;
        sessions.set(id, s);
        schedulePoll(id, cfg.offline);
        return;
      }
      if (data.room_status === 'private' || data.room_status === 'hidden' || data.room_status === 'away') {
        setStatus(id, 'private', { privateLabel: data.room_status });
        destroyPlayer(id);
        sessions.set(id, sessions.get(id) || s);
        schedulePoll(id, cfg.private);
        return;
      }
      if (!data.hls_source) {
        setStatus(id, 'error', { errorMsg: 'no stream' });
        schedulePoll(id, cfg.error);
        return;
      }
      if (!isSafeStreamUrl(data.hls_source)) {
        setStatus(id, 'error', { errorMsg: 'invalid stream url' });
        schedulePoll(id, cfg.error);
        return;
      }

      // 在线 —— 触发 UI 创建 video，再回调 attach。
      // v15.5: 如果只是例行探测且流地址没变、video 仍在播放，不重建 video/HLS。
      // 这能消除多窗口/多房间场景中周期性 attach/detach 造成的闪屏。
      if (!sessions.has(id) || sessions.get(id) !== s) return;
      const prevSource = s.hlsSource;
      const hasLiveVideo = !!s.video && !s.video.ended && (s.hls || s.video.src || s.video.srcObject);
      const sameActiveStream = s.status === 'online' && hasLiveVideo && prevSource === data.hls_source;
      s.hlsSource = data.hls_source;
      setStatus(id, 'online');
      if (!sessions.has(id) || sessions.get(id) !== s) return;
      if (!sameActiveStream) EventBus.emit('room:online', { id, hlsSource: data.hls_source });
      if (sessions.has(id) && sessions.get(id) === s) schedulePoll(id, cfg.online || onlinePollMs());
    }

    function startHls(id, hlsSource) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s || !s.video || !isSafeStreamUrl(hlsSource)) return;
      const video = s.video;
      s.hlsSource = hlsSource;

      destroyHls(s);

      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({ liveDurationInfinity: true, lowLatencyMode: true, maxBufferLength: 10 });
        hls.loadSource(hlsSource);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (sessions.get(id)?.hls === hls) {
            applyHlsQuality(hls);
            if (sessions.get(id)?.userPaused) video.pause();
            else video.play().catch(() => {});
          }
        });
        if (Hls.Events.LEVELS_UPDATED) {
          hls.on(Hls.Events.LEVELS_UPDATED, () => {
            if (sessions.get(id)?.hls === hls) applyHlsQuality(hls);
          });
        }
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal || sessions.get(id)?.hls !== hls) return;
          // 致命错误：尝试 recover，多次失败后回到状态轮询
          s.retryCount = (s.retryCount || 0) + 1;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            try { hls.startLoad(); } catch (_) {}
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            try { hls.recoverMediaError(); } catch (_) {}
          }
          if (s.retryCount > 3) {
            destroyPlayer(id);
            // 退避后重新走 connect 流程（重新拉接口）
            const wait = Math.min(30000, 2000 * Math.pow(1.5, s.retryCount));
            if (sessions.has(id)) schedulePoll(id, wait);
            setStatus(id, 'error', { errorMsg: 'stream broken' });
          }
        });
        s.hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSource;
        video.addEventListener('loadedmetadata', () => {
          if (sessions.get(id)?.userPaused) video.pause();
          else video.play().catch(() => {});
        }, { once: true });
      }
    }

    function refresh(id) {
      id = normalizeUsername(id);
      // 强制重连：清理旧 hls + video + timer，再走 connect，避免刷新时双音轨。
      const s = sessions.get(id);
      if (s) {
        clearPoll(s)
        destroyHls(s);
        hardStopVideo(s.video);
        s.video = null;
        s.hlsSource = null;
      }
      if (!sessions.has(id)) sessions.set(id, { retryCount: 0 });
      connect(id);
    }
    function refreshAll() { for (const id of [...sessions.keys()]) refresh(id); }
    function start(id) {
      id = normalizeUsername(id);
      // 幂等：已有 session 就跳过（避免切分组时重复启动轮询）
      if (sessions.has(id)) return;
      sessions.set(id, { retryCount: 0 });
      connect(id);
    }
    function stop(id) { id = normalizeUsername(id); destroyPlayer(id); sessions.delete(id); }
    function stopAll() { for (const id of [...sessions.keys()]) stop(id); stopAllPageMedia(); }
    function has(id) { id = normalizeUsername(id); return sessions.has(id); }

    return { start, stop, stopAll, refresh, refreshAll, attachVideo, detachVideo, startHls, has, pause, resume, togglePause, isPaused, pauseAll, resumeAll, refreshQuality };
  }

  /* =============================================================
   * 4.5. 用户名过滤 / Username validation
   *      已移除 followed-cams 自动抓取导入；这里只保留全站通用的用户名白名单与保留路径过滤。
   * ============================================================= */
  const USERNAME_EXCLUDE = new Set([
    'tags', 'tag', 'auth', 'followed-cams', 'multicam', 'events', 'jobs', 'terms',
    'privacy', 'support', 'billing', 'accounts', 'b', 'p', 'apps', 'affiliates',
    'static', 'feedback', 'sitemap', 'home', 'about', 'rules', 'login', 'logout',
    'signup', 'female-cams', 'male-cams', 'couple-cams', 'trans-cams', 's',
    'shortcuts', 'roomlist', 'photo_videos', 'in-private-show', 'external_link',
    'dmca', 'contact', 'mobile', 'tipping', 'tokens', 'token-purchase',
    'social', 'wiki', 'directory', 'spy-on-cams', 'private-shows', 'app',
    'photos-videos', 'pm', 'inbox', 'find-friends', 'broadcasters', 'broadcast',
    'discover', 'top', 'new', 'gold-shows', 'language', 'settings',
    'en', 'es', 'de', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'zh',
  ]);

  function isLikelyUsername(name) {
    name = normalizeUsername(name);
    if (!name) return false;
    if (USERNAME_EXCLUDE.has(name.toLowerCase())) return false;
    return usernameSyntaxOk(name);
  }

  /* =============================================================
   * 5. 事件总线 / EventBus
   * ============================================================= */
  const EventBus = (() => {
    const m = new Map();
    return {
      on(ev, fn) { (m.get(ev) || m.set(ev, new Set()).get(ev)).add(fn); return () => m.get(ev).delete(fn); },
      emit(ev, payload) { (m.get(ev) || []).forEach(fn => { try { fn(payload); } catch (_) {} }); },
    };
  })();

  /* =============================================================
   * 6. 模式分发
   * ============================================================= */
  function isPhoneLikeDevice() {
    const coarse = !!window.matchMedia?.('(pointer: coarse)')?.matches;
    const touch = Number(navigator.maxTouchPoints || 0) > 0;
    const uaMobile = navigator.userAgentData?.mobile === true || /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent || '');
    const screenShortEdge = Math.min(Number(window.screen?.width) || 9999, Number(window.screen?.height) || 9999);
    const viewportShortEdge = Math.min(Number(window.innerWidth) || 9999, Number(window.innerHeight) || 9999);
    return (uaMobile || (coarse && touch)) && Math.min(screenShortEdge, viewportShortEdge) <= 700;
  }

  const isWorkstation = new URLSearchParams(location.search).get('multicam_mode') === '1';
  if (isWorkstation) initWorkstation();
  else initInjector();

  /* =============================================================
   * 7. 普通页面注入：浮动按钮 + 快捷键
   * ============================================================= */
  function initInjector() {
    const ROOM_PATH = /^\/([a-zA-Z0-9_-]+)\/?$/;

    // ---- 当前房间（响应式：URL / canonical / DOM 变化时自动重算）----
    let currentRoom = null;
    const currentRoomSubs = new Set();

    function extractRoomFromPath(pathname) {
      const m = (pathname || '').match(ROOM_PATH);
      const name = m ? normalizeUsername(m[1]) : null;
      return isLikelyUsername(name) ? name : null;
    }

    function extractRoomFromUrl(url) {
      if (!url) return null;
      try { return extractRoomFromPath(new URL(url, location.origin).pathname); }
      catch (_) { return null; }
    }

    function detectCurrentRoom() {
      // 1. URL 路径：/<username>/
      let next = extractRoomFromPath(location.pathname);
      if (next) return next;
      // 2. SPA 场景：URL/DOM 被异步替换时，canonical/og:url 往往先更新。
      const candidates = [
        document.querySelector('link[rel="canonical"]')?.href,
        document.querySelector('meta[property="og:url"]')?.content,
        document.querySelector('meta[name="twitter:url"]')?.content,
      ];
      for (const href of candidates) {
        next = extractRoomFromUrl(href);
        if (next) return next;
      }
      return null;
    }

    function recalcCurrentRoom() {
      const next = detectCurrentRoom();
      if (next !== currentRoom) {
        currentRoom = next;
        currentRoomSubs.forEach(fn => { try { fn(currentRoom); } catch (_) {} });
      }
    }
    const recalcCurrentRoomSoon = debounce(recalcCurrentRoom, 180);
    recalcCurrentRoom();

    // hook history pushState/replaceState（chaturbate 是 SPA，URL 变化时不刷新）
    ['pushState', 'replaceState'].forEach(method => {
      const orig = history[method];
      history[method] = function () {
        const ret = orig.apply(this, arguments);
        setTimeout(recalcCurrentRoom, 0);
        setTimeout(recalcCurrentRoom, 250);
        setTimeout(recalcCurrentRoom, 900);
        return ret;
      };
    });
    window.addEventListener('popstate', () => setTimeout(recalcCurrentRoom, 50));
    window.addEventListener('hashchange', () => setTimeout(recalcCurrentRoom, 50));
    // 监听同标签内的异步切换，解决「换人后加入状态不变」。
    try {
      const routeMo = new MutationObserver(recalcCurrentRoomSoon);
      if (document.head) routeMo.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'content'] });
      if (document.body) routeMo.observe(document.body, { childList: true, subtree: true });
    } catch (_) {}
    // poll 兜底（万一还有别的 navigation 路径漏了）；隐藏标签页降低频率。
    let routePollTimer = 0;
    function scheduleRoutePoll() {
      clearTimeout(routePollTimer);
      const ms = document.hidden ? INJECTOR_ROUTE_POLL_HIDDEN_MS : INJECTOR_ROUTE_POLL_VISIBLE_MS;
      routePollTimer = setTimeout(() => { recalcCurrentRoom(); scheduleRoutePoll(); }, ms);
    }
    scheduleRoutePoll();
    document.addEventListener('visibilitychange', scheduleRoutePoll);

    // 跨标签页同步
    const storageSubs = new Set();
    const fireStorageSubs = () => storageSubs.forEach(fn => { try { fn(); } catch (_) {} });
    window.addEventListener('storage', (e) => {
      if (e.key === STORE_KEY) fireStorageSubs();
    });
    window.addEventListener('ryujo_multicam_storage', fireStorageSubs);

    function refreshInjectorState() {
      recalcCurrentRoom();
      fireStorageSubs();
    }

    // SPA 路由兜底：CB 有些入口不会稳定走 pushState/popstate。
    // 用点击、hash、pageshow、DOM 变化做低成本监听，保证同标签切换主播后“已加入/加入”状态实时变。
    const routeCheckSoon = debounce(() => recalcCurrentRoom(), 80);
    document.addEventListener('click', (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      setTimeout(routeCheckSoon, 0);
      setTimeout(routeCheckSoon, 160);
      setTimeout(routeCheckSoon, 650);
    }, true);
    window.addEventListener('hashchange', routeCheckSoon);
    window.addEventListener('pageshow', routeCheckSoon);
    document.addEventListener('visibilitychange', routeCheckSoon);
    try {
      const routeMo = new MutationObserver(routeCheckSoon);
      routeMo.observe(document.body, { childList: true, subtree: true });
    } catch (_) {}

    const buildWorkstationUrl = () => {
      const u = new URL(location.href);
      u.searchParams.set('multicam_mode', '1');
      u.hash = '';
      return u.toString();
    };
    const openWorkstationNew = () => {
      // 新开工作台前静音并停止当前页面媒体，避免“新工作台已开但旧页面还在出声”。
      stopAllPageMedia();
      openNoopener(buildWorkstationUrl());
    };
    const openWorkstationHere = () => {
      // 把工作台直接挂到当前页面（破坏性，但有用户要求）
      // 实现：跳转到 ?multicam_mode=1 同 tab；跳转前先停掉当前页面媒体。
      stopAllPageMedia();
      location.href = buildWorkstationUrl();
    };

    function findHeaderLogoContainer() {
      const explicit = document.querySelector('[data-testid="header-home-link-container"]');
      if (explicit) return explicit.closest('a[href="/"]') || explicit;
      const candidate = [...document.querySelectorAll('header a[href="/"], header [aria-label], header [title]')].find(node => {
        const label = `${node.getAttribute('aria-label') || ''} ${node.getAttribute('title') || ''} ${node.textContent || ''}`;
        return /chaturbate/i.test(label) || !!node.querySelector?.('img[alt*="Chaturbate" i]');
      }) || null;
      return candidate?.closest('a[href="/"]') || candidate;
    }

    function ensureWorkshopHeaderButton() {
      if (document.getElementById('roomgrid-workshop-button')) return;
      const logo = findHeaderLogoContainer();
      const parent = logo?.parentElement;
      if (!logo || !parent) return;
      logo.classList.add('roomgrid-header-logo-target');
      const button = $('button', {
        id: 'roomgrid-workshop-button',
        class: 'roomgrid-workshop-button',
        type: 'button',
        title: 'Open MultiCam workshop',
        'aria-label': 'Open MultiCam workshop',
        onclick: (event) => {
          event.preventDefault();
          event.stopPropagation();
          openWorkstationNew();
        },
      }, [
        $('span', { class: 'roomgrid-workshop-button-icon', 'aria-hidden': 'true' }, '▦'),
        $('span', { class: 'roomgrid-workshop-button-label' }, 'Workshop'),
      ]);
      parent.insertBefore(button, logo);
    }

    function getPrimaryPageVideo() {
      const videos = [...document.querySelectorAll('video')]
        .filter(v => v && v.offsetWidth > 120 && v.offsetHeight > 80 && !v.ended);
      return videos.sort((a, b) => (b.offsetWidth * b.offsetHeight) - (a.offsetWidth * a.offsetHeight))[0] || null;
    }

    function captureCurrentPageVideo() {
      const video = getPrimaryPageVideo();
      if (!video || !video.videoWidth || !video.videoHeight) { toast(t('dockVideoMissing')); return; }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (!blob) { toast(t('captureFailed')); return; }
          downloadBlob(blob, `roomgrid-page-${safeFilePart(currentRoom || 'video')}-${stampForFile()}.png`);
          toast(t('screenshotSaved'));
        }, 'image/png');
      } catch (_) {
        toast(t('captureFailed'));
      }
    }

    async function toggleCurrentPagePiP() {
      const video = getPrimaryPageVideo();
      if (!video) { toast(t('dockVideoMissing')); return; }
      try {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else await video.requestPictureInPicture();
      } catch (_) {
        toast(t('dockVideoMissing'));
      }
    }

    function toggleCurrentPagePlayback() {
      const video = getPrimaryPageVideo();
      if (!video) { toast(t('dockVideoMissing')); return; }
      if (video.paused) video.play?.().catch?.(() => {});
      else video.pause?.();
    }

    function toggleCurrentPageMute() {
      const video = getPrimaryPageVideo();
      if (!video) { toast(t('dockVideoMissing')); return; }
      video.muted = !video.muted;
      if (!video.muted && video.volume === 0) video.volume = 0.5;
    }

    function queueCurrentRoomRecording() {
      if (!currentRoom) { toast(t('dockNoRoom')); return; }
      if (!Storage.has(currentRoom)) Storage.add(currentRoom);
      setRecordingIntent(currentRoom, true);
      toast(t('dockRecordQueued'));
      openWorkstationNew();
    }

    // ---- RoomGrid 工具坞 ----
    const dockStyle = $('style', { html: trustedHtml(`
      .roomgrid-dock { position:fixed; right:18px; bottom:18px; z-index:2147483200; width:292px; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#f8fafc; user-select:none; transition:bottom .2s ease,opacity .2s ease,transform .2s ease; }
      html.cmc-active body.cmc-has-bottom-nav:not(.cmc-controls-hidden):not(.cmc-chat-open):not(.cmc-fullscreen) .roomgrid-dock:not(.roomgrid-user-positioned) { bottom:calc(var(--cmc-nav-h,58px) + env(safe-area-inset-bottom) + 10px); }
      html.cmc-active body.cmc-room.cmc-has-bottom-nav:not(.cmc-controls-hidden):not(.cmc-chat-open):not(.cmc-fullscreen) .roomgrid-dock:not(.roomgrid-user-positioned) { bottom:calc(var(--cmc-nav-h,58px) + env(safe-area-inset-bottom) + 66px); }
      html.cmc-active body.cmc-chat-open .roomgrid-dock,
      html.cmc-active body.cmc-site-modal-open .roomgrid-dock,
      html.cmc-active body.cmc-fullscreen .roomgrid-dock { opacity:0; transform:translateY(12px); pointer-events:none; }
      .roomgrid-workshop-button { box-sizing:border-box !important; flex:0 0 auto !important; width:auto !important; min-width:44px !important; max-width:132px !important; min-height:40px; display:inline-flex !important; align-items:center; justify-content:center; gap:6px; margin:0 7px 0 0 !important; padding:7px 11px !important; overflow:hidden; border:1px solid rgba(15,118,155,.48); border-radius:10px; background:linear-gradient(135deg,#2563eb,#149ca6); color:#fff; font:800 12px/1 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; white-space:nowrap; cursor:pointer; box-shadow:0 4px 12px rgba(15,23,42,.16); touch-action:manipulation; }
      .roomgrid-workshop-button-icon { flex:0 0 auto; font-size:17px; line-height:1; }
      .roomgrid-workshop-button-label { min-width:0; overflow:hidden; text-overflow:ellipsis; }
      .roomgrid-header-logo-target { min-width:0 !important; }
      .roomgrid-workshop-button:hover { filter:brightness(1.08); }
      .roomgrid-workshop-button:focus-visible { outline:3px solid rgba(96,165,250,.42); outline-offset:2px; }
      .roomgrid-dock-card { border:1px solid rgba(255,255,255,.16); border-radius:16px; background:rgba(15,23,42,.86); box-shadow:0 18px 48px rgba(15,23,42,.36); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); overflow:hidden; }
      .roomgrid-dock-head { width:100%; border:0; display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; color:inherit; background:linear-gradient(135deg,rgba(37,99,235,.88),rgba(20,184,166,.82)); text-align:left; }
      .roomgrid-dock-mark { width:34px; height:34px; border-radius:10px; display:grid; place-items:center; background:rgba(255,255,255,.16); font-weight:900; letter-spacing:.02em; }
      .roomgrid-dock-title { font-size:14px; font-weight:850; line-height:1.1; }
      .roomgrid-dock-sub { margin-top:2px; font-size:11px; color:rgba(255,255,255,.78); }
      .roomgrid-dock-chevron { margin-left:auto; font-size:16px; opacity:.82; }
      .roomgrid-dock-body { display:grid; gap:10px; padding:10px; }
      .roomgrid-dock.arna-active { width:min(500px,calc(100vw - 36px)); }
      .roomgrid-dock-tabs { display:flex; gap:6px; padding:3px; border-radius:10px; background:rgba(255,255,255,.06); }
      .roomgrid-dock-tab { flex:1; min-height:30px; border:1px solid transparent; border-radius:8px; background:transparent; color:#94a3b8; cursor:pointer; font-size:12px; font-weight:800; }
      .roomgrid-dock-tab:hover { color:#fff; background:rgba(255,255,255,.07); }
      .roomgrid-dock-tab.active { color:#fff; border-color:rgba(147,197,253,.35); background:linear-gradient(135deg,rgba(37,99,235,.72),rgba(20,184,166,.58)); box-shadow:0 4px 12px rgba(15,23,42,.18); }
      .roomgrid-dock-tab-badge { display:none; min-width:18px; margin-left:4px; padding:1px 5px; border-radius:999px; background:#10b981; color:#fff; font-size:9px; line-height:14px; }
      .roomgrid-dock-pane { display:grid; gap:10px; min-width:0; }
      .roomgrid-dock-pane[hidden] { display:none !important; }
      .roomgrid-dock-room { font-size:12px; color:#cbd5e1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .roomgrid-dock-actions { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
      .roomgrid-dock-action { min-height:34px; border:1px solid rgba(255,255,255,.12); border-radius:9px; background:rgba(255,255,255,.07); color:#f8fafc; cursor:pointer; font-size:12px; font-weight:700; text-align:left; padding:7px 9px; }
      .roomgrid-dock-action:hover { background:rgba(255,255,255,.13); border-color:rgba(255,255,255,.22); }
      .roomgrid-dock-action.primary { background:rgba(37,99,235,.78); border-color:rgba(147,197,253,.44); }
      .roomgrid-dock-action.success { background:rgba(22,163,74,.70); border-color:rgba(134,239,172,.40); }
      .roomgrid-dock-action.warn { background:rgba(217,119,6,.68); border-color:rgba(253,186,116,.36); }
      .roomgrid-dock-setting { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:7px 8px; border:1px solid rgba(255,255,255,.10); border-radius:9px; background:rgba(255,255,255,.045); color:#cbd5e1; font-size:11px; }
      .roomgrid-dock-setting-control { display:flex; align-items:center; gap:5px; color:#94a3b8; white-space:nowrap; }
      .roomgrid-dock-setting-input { width:54px; height:27px; padding:3px 6px; border:1px solid rgba(255,255,255,.16); border-radius:7px; outline:none; background:rgba(15,23,42,.74); color:#fff; font:700 11px system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; text-align:center; }
      .roomgrid-dock-setting-input:focus { border-color:rgba(147,197,253,.70); box-shadow:0 0 0 2px rgba(59,130,246,.16); }
      .roomgrid-dock-foot { display:flex; justify-content:space-between; gap:8px; border-top:1px solid rgba(255,255,255,.10); padding-top:9px; }
      .roomgrid-dock-link { border:0; background:transparent; color:#cbd5e1; cursor:pointer; font-size:11px; padding:2px 0; }
      .roomgrid-dock-link:hover { color:#fff; text-decoration:underline; }
      .roomgrid-arna-pane { --arna-surface:rgba(255,255,255,.065); --arna-border:rgba(255,255,255,.13); --arna-muted:#94a3b8; --arna-primary:#6366f1; --arna-success:#10b981; --arna-error:#ef4444; max-height:min(650px,calc(100vh - 190px)); overflow-y:auto; padding-right:2px; user-select:text; }
      .roomgrid-arna-pane, .roomgrid-arna-pane * { box-sizing:border-box; }
      .roomgrid-arna-head { display:flex; align-items:center; justify-content:space-between; gap:10px; }
      .roomgrid-arna-brand { display:flex; align-items:center; gap:7px; font-size:15px; font-weight:900; letter-spacing:.01em; }
      .roomgrid-arna-version { padding:2px 5px; border:1px solid var(--arna-border); border-radius:5px; color:var(--arna-muted); font-size:9px; font-weight:800; }
      .roomgrid-arna-caption { color:var(--arna-muted); font-size:10px; }
      .roomgrid-arna-subtabs { display:flex; gap:4px; padding:3px; border-radius:9px; background:rgba(255,255,255,.05); }
      .roomgrid-arna-subtab { flex:1; min-height:28px; border:0; border-radius:7px; background:transparent; color:var(--arna-muted); cursor:pointer; font-size:11px; font-weight:750; }
      .roomgrid-arna-subtab.active { background:rgba(99,102,241,.78); color:#fff; }
      .roomgrid-arna-search { position:relative; }
      .roomgrid-arna-search-icon { position:absolute; left:10px; top:9px; width:16px; height:16px; color:var(--arna-muted); pointer-events:none; }
      .roomgrid-arna-input { width:100%; height:35px; padding:7px 10px 7px 33px; border:1px solid var(--arna-border); border-radius:8px; outline:none; background:rgba(15,23,42,.65); color:#fff; font-size:12px; }
      .roomgrid-arna-input:focus { border-color:rgba(129,140,248,.75); box-shadow:0 0 0 2px rgba(99,102,241,.18); }
      .roomgrid-arna-view { display:grid; gap:9px; }
      .roomgrid-arna-view[hidden] { display:none !important; }
      .roomgrid-arna-label { display:flex; justify-content:space-between; gap:8px; color:var(--arna-muted); font-size:10px; }
      .roomgrid-arna-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; }
      .roomgrid-arna-item { display:flex; align-items:center; gap:8px; min-width:0; min-height:35px; padding:7px 8px; border:1px solid var(--arna-border); border-radius:8px; background:var(--arna-surface); color:#f8fafc; cursor:pointer; transition:border-color .15s,background .15s,opacity .15s; }
      .roomgrid-arna-item:hover { border-color:rgba(129,140,248,.72); background:rgba(255,255,255,.10); }
      .roomgrid-arna-item img { flex:0 0 auto; width:16px; height:16px; }
      .roomgrid-arna-item-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:11px; font-weight:700; }
      .roomgrid-arna-status { flex:0 0 auto; width:7px; height:7px; margin-left:auto; border-radius:50%; background:#475569; }
      .roomgrid-arna-item.checking .roomgrid-arna-status { background:#f59e0b; animation:roomgrid-arna-pulse 1s infinite; }
      .roomgrid-arna-item.found { border-color:rgba(16,185,129,.85); }
      .roomgrid-arna-item.found .roomgrid-arna-status { background:var(--arna-success); }
      .roomgrid-arna-item.not-found { opacity:.48; filter:grayscale(1); }
      .roomgrid-arna-item.not-found .roomgrid-arna-status { background:var(--arna-error); }
      .roomgrid-arna-save { justify-content:center; border-style:dashed; }
      .roomgrid-arna-actions { display:flex; gap:7px; }
      .roomgrid-arna-button { flex:1; min-height:32px; padding:6px 8px; border:1px solid var(--arna-border); border-radius:8px; background:var(--arna-surface); color:#f8fafc; cursor:pointer; font-size:11px; font-weight:750; }
      .roomgrid-arna-button:hover { border-color:rgba(129,140,248,.72); background:rgba(99,102,241,.55); }
      .roomgrid-arna-list { display:grid; gap:4px; }
      .roomgrid-arna-row { display:flex; align-items:center; justify-content:space-between; gap:8px; min-height:34px; padding:7px 8px; border-bottom:1px solid rgba(255,255,255,.08); border-radius:6px; color:#f8fafc; cursor:pointer; font-size:11px; }
      .roomgrid-arna-row:hover { background:var(--arna-surface); }
      .roomgrid-arna-row-main { display:flex; align-items:center; gap:7px; min-width:0; }
      .roomgrid-arna-tag { padding:2px 6px; border-radius:999px; background:rgba(255,255,255,.11); color:#cbd5e1; font-size:9px; }
      .roomgrid-arna-delete { border:0; background:transparent; color:var(--arna-muted); cursor:pointer; font-size:16px; }
      .roomgrid-arna-sites { max-height:190px; overflow-y:auto; border:1px solid var(--arna-border); border-radius:8px; background:rgba(15,23,42,.36); }
      .roomgrid-arna-site { display:flex; align-items:center; justify-content:space-between; gap:8px; min-height:32px; padding:6px 8px; border-bottom:1px solid rgba(255,255,255,.07); color:#f8fafc; font-size:11px; }
      .roomgrid-arna-empty { padding:22px 10px; text-align:center; color:var(--arna-muted); font-size:11px; }
      @keyframes roomgrid-arna-pulse { 0%,100% { opacity:.4; } 50% { opacity:1; } }
      .roomgrid-dock.is-collapsed { width:auto; }
      .roomgrid-dock.is-collapsed .roomgrid-dock-card { border-radius:999px; }
      .roomgrid-dock.is-collapsed .roomgrid-dock-body { display:none; }
      .roomgrid-dock.is-collapsed .roomgrid-dock-head { border-radius:999px; padding:8px 10px; }
      .roomgrid-dock.is-collapsed .roomgrid-dock-sub, .roomgrid-dock.is-collapsed .roomgrid-dock-chevron { display:none; }
      @media (max-width:560px), (pointer:coarse) and (max-width:1024px), (orientation:landscape) and (max-height:650px) {
        .roomgrid-workshop-button { width:44px !important; min-width:44px !important; max-width:44px !important; height:44px !important; min-height:44px !important; padding:0 !important; margin-right:6px !important; border-radius:12px; }
        .roomgrid-workshop-button-label { display:none !important; }
        .roomgrid-workshop-button-icon { font-size:20px; }
        .roomgrid-header-logo-target { flex:0 1 auto !important; }
      }
      @media (max-width:560px) { .roomgrid-dock.arna-active { right:8px; width:calc(100vw - 16px); } .roomgrid-arna-grid { grid-template-columns:1fr; } }
      @media (orientation:landscape) and (max-height:650px) { html.cmc-active body.cmc-room.cmc-has-bottom-nav:not(.cmc-controls-hidden):not(.cmc-chat-open):not(.cmc-fullscreen) .roomgrid-dock:not(.roomgrid-user-positioned) { bottom:calc(var(--cmc-nav-h,52px) + env(safe-area-inset-bottom) + 10px); } }
    `)});
    document.head.appendChild(dockStyle);

    const root = $('div', { class: 'roomgrid-dock' });
    // Always start collapsed on a fresh page load. Expansion is manual via the dock header or Shift+A.
    let collapsed = true;
    localStorage.setItem('ryujo_fab_collapsed', '1');
    let dockAutoCollapseTimer = 0;
    let dragged = false, sx, sy, ox, oy;

    const roomLine = $('div', { class: 'roomgrid-dock-room' }, t('dockNoRoom'));
    const addBtn = $('button', { class: 'roomgrid-dock-action success', onclick: () => toggleCurrentRoomSaved() }, t('dockAdd'));
    const head = $('button', { class: 'roomgrid-dock-head', title: 'Alt+M / Alt+A / Shift+A', onclick: () => { if (!dragged) toggleDock(); } }, [
      $('span', { class: 'roomgrid-dock-mark' }, '▦'),
      $('span', {}, [
        $('div', { class: 'roomgrid-dock-title' }, 'RoomGrid'),
        $('div', { class: 'roomgrid-dock-sub' }, t('dockSubtitle')),
      ]),
      $('span', { class: 'roomgrid-dock-chevron' }, '▾'),
    ]);
    const multicamTab = $('button', { class: 'roomgrid-dock-tab active', type: 'button' }, 'MultiCam');
    const arnaTabBadge = $('span', { class: 'roomgrid-dock-tab-badge' }, '0');
    const arnaTab = $('button', { class: 'roomgrid-dock-tab', type: 'button' }, [document.createTextNode('Cam ARNA '), arnaTabBadge]);
    const dockTabs = $('div', { class: 'roomgrid-dock-tabs', role: 'tablist' }, [multicamTab, arnaTab]);
    const dockAutoCollapseInput = $('input', {
      class: 'roomgrid-dock-setting-input', type: 'number', min: '0', max: '600', step: '1',
      value: String(getDockAutoCollapseSeconds()), title: t('dockAutoCollapseHint'),
    });
    const dockAutoCollapseSetting = $('label', { class: 'roomgrid-dock-setting' }, [
      $('span', {}, t('dockAutoCollapse')),
      $('span', { class: 'roomgrid-dock-setting-control' }, [dockAutoCollapseInput, $('span', {}, 's')]),
    ]);
    dockAutoCollapseInput.addEventListener('change', saveDockAutoCollapseSetting);
    const multicamPane = $('div', { class: 'roomgrid-dock-pane roomgrid-multicam-pane' }, [
      roomLine,
      $('div', { class: 'roomgrid-dock-actions' }, [
        $('button', { class: 'roomgrid-dock-action primary', onclick: openWorkstationNew }, t('dockOpen')),
        addBtn,
        $('button', { class: 'roomgrid-dock-action warn', onclick: queueCurrentRoomRecording }, t('dockRecord')),
        $('button', { class: 'roomgrid-dock-action', onclick: captureCurrentPageVideo }, t('dockScreenshot')),
        $('button', { class: 'roomgrid-dock-action', onclick: toggleCurrentPagePiP }, t('dockPip')),
        $('button', { class: 'roomgrid-dock-action', onclick: toggleCurrentPageMute }, t('dockMute')),
        $('button', { class: 'roomgrid-dock-action', onclick: () => { if (confirm(t('openWorkstationHereConfirm'))) openWorkstationHere(); } }, t('dockOpenHere')),
      ]),
      dockAutoCollapseSetting,
      $('div', { class: 'roomgrid-dock-foot' }, [
        $('button', { class: 'roomgrid-dock-link', onclick: () => { const s = Storage.load(); toast(t('memoryStat', s.rooms.length), 2500); } }, t('memoryView')),
        $('button', { class: 'roomgrid-dock-link', onclick: () => setDockCollapsed(true) }, t('collapseFAB')),
      ]),
    ]);
    const arnaPane = $('div', { class: 'roomgrid-dock-pane roomgrid-arna-pane', hidden: true });
    const body = $('div', { class: 'roomgrid-dock-body' }, [dockTabs, multicamPane, arnaPane]);
    // Every page load and every normal dock expansion starts on MultiCam.
    let activeDockTab = 'multicam';
    localStorage.setItem('roomgrid_active_dock_tab', 'multicam');
    const camArna = createCamArnaDock(arnaPane, {
      notify: (message) => toast(message, 2200),
      openExternal: (url) => openNoopener(url),
      onFoundCount: (count) => {
        arnaTabBadge.textContent = String(count);
        arnaTabBadge.style.display = count > 0 ? 'inline-block' : 'none';
      },
    });

    function setDockTab(tabName) {
      activeDockTab = tabName === 'arna' ? 'arna' : 'multicam';
      const showArna = activeDockTab === 'arna';
      multicamPane.hidden = showArna;
      arnaPane.hidden = !showArna;
      multicamTab.classList.toggle('active', !showArna);
      arnaTab.classList.toggle('active', showArna);
      multicamTab.setAttribute('aria-selected', showArna ? 'false' : 'true');
      arnaTab.setAttribute('aria-selected', showArna ? 'true' : 'false');
      root.classList.toggle('arna-active', showArna);
      if (showArna) camArna.activate(currentRoom);
      if (!collapsed) scheduleDockAutoCollapse();
    }
    multicamTab.addEventListener('click', () => setDockTab('multicam'));
    arnaTab.addEventListener('click', () => setDockTab('arna'));

    function toggleCurrentRoomSaved() {
      if (!currentRoom) return;
      if (Storage.has(currentRoom)) {
        if (Storage.remove(currentRoom)) toast(t('removedNamed', currentRoom));
      } else {
        const r = Storage.add(currentRoom);
        toast(r === 'added' ? t('addedNamed', currentRoom) : r === 'exists' ? t('exists') : t('addFailed'));
      }
      refreshInjectorState();
      updateDockRoom();
    }

    function updateDockRoom() {
      roomLine.textContent = currentRoom ? t('dockCurrentRoom', currentRoom) : t('dockNoRoom');
      addBtn.textContent = currentRoom && Storage.has(currentRoom) ? t('dockRemove') : t('dockAdd');
      addBtn.classList.toggle('success', !(currentRoom && Storage.has(currentRoom)));
      addBtn.classList.toggle('warn', !!(currentRoom && Storage.has(currentRoom)));
      addBtn.disabled = !currentRoom;
      addBtn.style.opacity = currentRoom ? '1' : '.55';
    }
    currentRoomSubs.add(updateDockRoom);
    currentRoomSubs.add((room) => { if (activeDockTab === 'arna') camArna.activate(room); });
    storageSubs.add(updateDockRoom);

    function syncDock() {
      root.classList.toggle('is-collapsed', !!collapsed);
      root.querySelector('.roomgrid-dock-chevron').textContent = collapsed ? '▴' : '▾';
    }

    function getDockAutoCollapseSeconds() {
      return clampInt(Storage.load().settings.dockAutoCollapseSeconds, 0, 600, 5);
    }

    function clearDockAutoCollapseTimer() {
      if (!dockAutoCollapseTimer) return;
      clearTimeout(dockAutoCollapseTimer);
      dockAutoCollapseTimer = 0;
    }

    function scheduleDockAutoCollapse() {
      clearDockAutoCollapseTimer();
      if (collapsed) return;
      const seconds = getDockAutoCollapseSeconds();
      if (seconds <= 0) return;
      dockAutoCollapseTimer = setTimeout(() => setDockCollapsed(true), seconds * 1000);
    }

    function setDockCollapsed(nextCollapsed, tabOnOpen = 'multicam') {
      collapsed = !!nextCollapsed;
      localStorage.setItem('ryujo_fab_collapsed', collapsed ? '1' : '0');
      if (collapsed) {
        clearDockAutoCollapseTimer();
      } else {
        setDockTab(tabOnOpen === 'arna' ? 'arna' : 'multicam');
      }
      syncDock();
      if (!collapsed) scheduleDockAutoCollapse();
    }

    function saveDockAutoCollapseSetting() {
      const seconds = clampInt(dockAutoCollapseInput.value, 0, 600, 5);
      const state = Storage.load();
      state.settings.dockAutoCollapseSeconds = seconds;
      Storage.save(state);
      dockAutoCollapseInput.value = String(seconds);
      toast(t('dockAutoCollapseSaved', seconds), 2200);
      scheduleDockAutoCollapse();
    }

    const toggleDock = () => {
      if (collapsed) setDockCollapsed(false, 'multicam');
      else setDockCollapsed(true);
    };

    root.appendChild($('div', { class: 'roomgrid-dock-card' }, [head, body]));
    document.body.appendChild(root);
    ensureWorkshopHeaderButton();
    const ensureWorkshopHeaderButtonSoon = debounce(ensureWorkshopHeaderButton, 120);
    try {
      const workshopButtonMo = new MutationObserver(() => {
        if (!document.getElementById('roomgrid-workshop-button')) ensureWorkshopHeaderButtonSoon();
      });
      workshopButtonMo.observe(document.body, { childList: true, subtree: true });
    } catch (_) {}
    updateDockRoom();
    setDockTab('multicam');
    syncDock();

    // Treat clicks, typing, and control changes as activity and restart the inactivity countdown.
    for (const eventName of ['pointerdown', 'keydown', 'input', 'change']) {
      root.addEventListener(eventName, () => { if (!collapsed) scheduleDockAutoCollapse(); }, true);
    }

    head.addEventListener('mousedown', (e) => {
      sx = e.clientX; sy = e.clientY;
      const rect = root.getBoundingClientRect();
      ox = rect.left; oy = rect.top;
      dragged = false;
      const move = (ev) => {
        if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 6) dragged = true;
        if (dragged) {
          root.classList.add('roomgrid-user-positioned');
          root.style.left = (ox + ev.clientX - sx) + 'px';
          root.style.top = (oy + ev.clientY - sy) + 'px';
          root.style.right = 'auto';
          root.style.bottom = 'auto';
        }
      };
      const up = () => {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });

    // —— 快捷键 ——
    document.addEventListener('keydown', (e) => {
      const targetTag = String(e.target?.tagName || '').toLowerCase();
      if (e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'a' && !['input', 'textarea', 'select'].includes(targetTag)) {
        e.preventDefault();
        setDockCollapsed(false, 'arna');
        return;
      }
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key.toLowerCase() === 'm') { e.preventDefault(); openWorkstationNew(); }
      if (e.key.toLowerCase() === 'a' && currentRoom) {
        e.preventDefault();
        if (Storage.has(currentRoom)) toast(t('alreadyAdded', currentRoom));
        else {
          const r = Storage.add(currentRoom);
          toast(r === 'added' ? t('addedNamed', currentRoom) : t('addFailed'));
        }
        refreshInjectorState();
        updateDockRoom();
      }
    });

    // —— Toast ——
    function toast(text, ms = 1800) {
      const toastEl = $('div', {
        style: {
          position: 'fixed', left: '50%', top: '20%', transform: 'translateX(-50%)',
          background: 'rgba(20,20,24,.95)', color: '#fff', padding: '12px 20px',
          borderRadius: '10px', zIndex: 999999, fontSize: '14px', fontFamily: 'system-ui',
          boxShadow: '0 8px 24px rgba(0,0,0,.5)', backdropFilter: 'blur(10px)',
        },
      }, String(text || ''));
      document.body.appendChild(toastEl);
      setTimeout(() => toastEl.remove(), ms);
    }

    // ===========================================================
    // QuickAdd —— 在 chaturbate 主页/分类页的房间卡片上注入「+」按钮
    // 用 MutationObserver 监听动态加载，[data-username] 是稳定锚点
    // ===========================================================
    initQuickAdd();

    function initQuickAdd() {
      // 注入 QuickAdd 按钮的样式
      const style = $('style', { html: trustedHtml(`
        .multicam-quick-add {
          position: absolute; top: 6px; right: 6px; z-index: 99;
          min-width: 58px; height: 27px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,.18); cursor: pointer;
          background: rgba(15,23,42,.62); backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(6px);
          color: #fff; font-size: 11px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .15s, background .15s, transform .15s;
          padding: 0 9px; line-height: 1; box-shadow: 0 8px 22px rgba(0,0,0,.28);
        }
        .multicam-quick-add:hover { background: #2563eb; transform: translateY(-1px); }
        .multicam-qa-host:hover .multicam-quick-add,
        .multicam-quick-add:focus,
        .multicam-quick-add.added { opacity: 1; }
        .multicam-quick-add.added { background: #16a34a; opacity: 1; }
        .multicam-quick-add.added:hover { background: #c62828; }
      `)});
      document.head.appendChild(style);

      const observed = new WeakSet();   // 已注入按钮的元素
      const elToUsername = new WeakMap(); // 元素 → 用户名

      function updateBtnState(btn, username) {
        const inList = Storage.has(username);
        btn.classList.toggle('added', inList);
        btn.textContent = inList ? (LANG === 'zh' ? '已保存' : 'Saved') : 'Grid +';
        btn.title = inList ? t('quickRemoveTitle') : t('quickAddTitle');
      }

      function injectButton(host, username) {
        if (observed.has(host)) return;
        observed.add(host);
        elToUsername.set(host, username);
        host.classList.add('multicam-qa-host');
        // 给 host 提供定位上下文
        const cs = getComputedStyle(host);
        if (cs.position === 'static') host.style.position = 'relative';

        const btn = $('button', {
          class: 'multicam-quick-add',
          dataset: { multicamUsername: username, roomgridQuickAdd: '1' },
          onclick: (e) => {
            e.preventDefault(); e.stopPropagation();
            if (Storage.has(username)) {
              if (Storage.remove(username)) toast(t('removedNamed', username));
            } else {
              const r = Storage.add(username);
              if (r === 'added') toast(t('addedNamed', username));
            }
            refreshInjectorState();
            updateBtnState(btn, username);
          },
        }, 'Grid +');

        host.appendChild(btn);
        updateBtnState(btn, username);
      }

      // ---- 检测候选 host 元素 ----
      function scan() {
        if (document.hidden) return;
        // 策略 1: 元素本身有 data-username（最强信号）
        let checked = 0;
        for (const el of document.querySelectorAll('[data-username]')) {
          if (++checked > 900) break;
          const u = normalizeUsername(el.getAttribute('data-username'));
          if (!u || !isLikelyUsername(u)) continue;
          // 跳过过小的元素（如聊天里的 avatar）
          if (el.offsetWidth < 100 || el.offsetHeight < 80) continue;
          injectButton(el, u);
        }

        // 策略 2: 房间卡片 li，包含一个指向 /<username>/ 的 <a>
        // 兼容 chaturbate 列表页结构
        checked = 0;
        for (const li of document.querySelectorAll('li')) {
          if (++checked > 900) break;
          if (observed.has(li)) continue;
          if (li.offsetWidth < 100 || li.offsetHeight < 80) continue;
          // 找第一个匹配主播路径的 a
          const a = li.querySelector('a[href]');
          if (!a) continue;
          const href = a.getAttribute('href') || '';
          let path = href;
          if (/^https?:\/\//i.test(href)) {
            try { path = new URL(href).pathname; } catch (_) { continue; }
          }
          const m = path.match(ROOM_PATH);
          if (!m) continue;
          const u = normalizeUsername(m[1]);
          if (!isLikelyUsername(u)) continue;
          injectButton(li, u);
        }
      }

      // 节流 scan
      let scanScheduled = false;
      function scheduleScan() {
        if (document.hidden || scanScheduled) return;
        scanScheduled = true;
        const run = () => { scanScheduled = false; scan(); };
        try {
          if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 900 });
          else setTimeout(run, 260);
        } catch (_) { setTimeout(run, 260); }
      }

      document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleScan(); });
      scan();
      const mo = new MutationObserver(scheduleScan);
      mo.observe(document.body, { childList: true, subtree: true });

      // 跨标签页 storage 同步：刷新所有按钮状态
      storageSubs.add(() => {
        document.querySelectorAll('.multicam-quick-add').forEach(btn => {
          const u = btn.dataset.multicamUsername || btn.dataset.username;
          if (u) updateBtnState(btn, u);
        });
      });
    }
  }

  /* =============================================================
   * 7.5. Cam ARNA archive search — native RoomGrid dock tab
   * ============================================================= */
  function createCamArnaDock(container, options = {}) {
    const config = { version: '2.5', maxHistory: 10 };
    const archiveSites = [
      { name: 'Archivebate', url: 'https://archivebate.com/profile/{username}', domain: 'archivebate.com' },
      { name: 'recu', url: 'https://recu.me/performer/{username}', domain: 'recu.me' },
      { name: 'Showcamrips', url: 'https://showcamrips.com/model/en/{username}', domain: 'showcamrips.com' },
      { name: 'CamRecordings', url: 'https://www.camshowrecordings.com/model/{username}', domain: 'camshowrecordings.com' },
      { name: 'CamWH', url: 'https://camwh.com/tags/{username}/', domain: 'camwh.com' },
      { name: 'TopCam', url: 'https://www.topcamvideos.com/showall/?search={username}', domain: 'topcamvideos.com' },
      { name: 'LoveCam', url: 'https://lovecamporn.com/showall/?search={username}', domain: 'lovecamporn.com' },
      { name: 'Camwhores.tv', url: 'https://www.camwhores.tv/search/{username}/', domain: 'camwhores.tv' },
      { name: 'Bestcam', url: 'https://bestcam.tv/model/{username}', domain: 'bestcam.tv' },
      { name: 'XHome', url: 'https://xhomealone.com/tags/{username}/', domain: 'xhomealone.com' },
      { name: 'StreamLeak', url: 'https://stream-leak.com/models/{username}/', domain: 'stream-leak.com' },
      { name: 'MFCamHub', url: 'https://mfcamhub.com/models/{username}/', domain: 'mfcamhub.com' },
      { name: 'CamRecord', url: 'https://camshowrecord.net/video/list?page=1&model={username}', domain: 'camshowrecord.net' },
      { name: 'CW Bay', url: 'https://www.camwhoresbay.com/search/{username}/', domain: 'camwhoresbay.com' },
      { name: 'CamSave', url: 'https://www.camsave1.com/?search={username}&women=true', domain: 'camsave1.com' },
      { name: 'OnScreens', url: 'https://www.onscreens.me/m/{username}', domain: 'onscreens.me' },
      { name: 'LiveCamRips', url: 'https://livecamrips.to/search/{username}/1', domain: 'livecamrips.to' },
      { name: 'CumCams', url: 'https://cumcams.cc/performer/{username}', domain: 'cumcams.cc' },
      { name: 'AllMyCam', url: 'https://allmy.cam/search/{username}/', domain: 'allmy.cam' },
      { name: 'LCRip', url: 'https://www.livecamsrip.com/{username}/profile', domain: 'livecamsrip.com' },
      { name: 'CamsRip', url: 'https://camsrip.com/{username}/profile', domain: 'camsrip.com' },
    ];
    const notify = typeof options.notify === 'function' ? options.notify : () => {};
    const openExternal = typeof options.openExternal === 'function' ? options.openExternal : (url) => openNoopener(url);
    const onFoundCount = typeof options.onFoundCount === 'function' ? options.onFoundCount : () => {};
    let mounted = false;
    let searchRun = 0;
    let debounceTimer = 0;
    let lastAutoRoom = '';
    let input = null;
    let archiveGrid = null;
    let counter = null;
    let historyList = null;
    let savedList = null;
    let siteToggleList = null;
    let fileInput = null;
    const subTabs = new Map();
    const views = new Map();

    function activate(room) {
      if (!mounted) mount();
      const candidate = String(room || '').trim();
      if (isValidUsername(candidate) && candidate !== lastAutoRoom) {
        lastAutoRoom = candidate;
        input.value = candidate;
        showView('search');
        checkAll(candidate);
      }
    }

    function mount() {
      mounted = true;
      container.textContent = '';

      const brand = $('div', { class: 'roomgrid-arna-brand' }, [
        document.createTextNode('ARNA'),
        $('span', { class: 'roomgrid-arna-version' }, config.version),
      ]);
      container.appendChild($('div', { class: 'roomgrid-arna-head' }, [
        brand,
        $('span', { class: 'roomgrid-arna-caption' }, 'Archive search'),
      ]));

      const subtabBar = $('div', { class: 'roomgrid-arna-subtabs', role: 'tablist' });
      for (const [name, label] of [['search', 'Search'], ['history', 'History'], ['saved', 'Saved'], ['tools', 'Tools']]) {
        const button = $('button', {
          class: `roomgrid-arna-subtab${name === 'search' ? ' active' : ''}`,
          type: 'button',
          onclick: () => showView(name),
        }, label);
        button.setAttribute('aria-selected', name === 'search' ? 'true' : 'false');
        subTabs.set(name, button);
        subtabBar.appendChild(button);
      }
      container.appendChild(subtabBar);

      const searchIcon = $('span', { class: 'roomgrid-arna-search-icon', html: trustedHtml(iconSvg('search', 16)) });
      input = $('input', {
        class: 'roomgrid-arna-input',
        id: 'roomgrid-arna-user',
        type: 'text',
        placeholder: 'Search username...',
        autocomplete: 'off',
        spellcheck: false,
      });
      container.appendChild($('div', { class: 'roomgrid-arna-search' }, [searchIcon, input]));

      const searchView = $('div', { class: 'roomgrid-arna-view' });
      counter = $('span', {}, '0 / 0 found');
      searchView.appendChild($('div', { class: 'roomgrid-arna-label' }, [
        $('span', {}, 'Archives / Recorders'),
        counter,
      ]));
      archiveGrid = $('div', { class: 'roomgrid-arna-grid' });
      searchView.appendChild(archiveGrid);
      searchView.appendChild($('button', {
        class: 'roomgrid-arna-item roomgrid-arna-save',
        type: 'button',
        onclick: saveCurrentProfile,
      }, $('span', { class: 'roomgrid-arna-item-name' }, 'Save to Favorites')));
      views.set('search', searchView);

      const historyView = $('div', { class: 'roomgrid-arna-view', hidden: true });
      historyView.appendChild($('div', { class: 'roomgrid-arna-label' }, $('span', {}, 'Recent Searches')));
      historyList = $('div', { class: 'roomgrid-arna-list' });
      historyView.appendChild(historyList);
      views.set('history', historyView);

      const savedView = $('div', { class: 'roomgrid-arna-view', hidden: true });
      const importButton = $('button', { class: 'roomgrid-arna-button', type: 'button' }, 'Import JSON');
      const exportButton = $('button', { class: 'roomgrid-arna-button', type: 'button' }, 'Export JSON');
      fileInput = $('input', { type: 'file', accept: '.json,application/json', hidden: true });
      importButton.addEventListener('click', () => fileInput.click());
      exportButton.addEventListener('click', exportSavedProfiles);
      fileInput.addEventListener('change', importSavedProfiles);
      savedView.appendChild($('div', { class: 'roomgrid-arna-actions' }, [importButton, exportButton, fileInput]));
      savedList = $('div', { class: 'roomgrid-arna-list' });
      savedView.appendChild(savedList);
      views.set('saved', savedView);

      const toolsView = $('div', { class: 'roomgrid-arna-view', hidden: true });
      toolsView.appendChild($('div', { class: 'roomgrid-arna-label' }, $('span', {}, 'Quick Links')));
      const toolGrid = $('div', { class: 'roomgrid-arna-grid' });
      const tools = [
        ['Schedule', 'https://www.cbhours.com/user/{u}.html'],
        ['Statistics', 'https://statbate.com/search/1/{u}'],
        ['Finder', 'https://camgirlfinder.net/models/sc/{u}'],
        ['Images', 'https://nrtool.to/nrtool/search?site=&s={u}'],
      ];
      for (const [label, url] of tools) {
        toolGrid.appendChild($('button', {
          class: 'roomgrid-arna-item',
          type: 'button',
          onclick: () => {
            const username = input.value.trim();
            if (isValidUsername(username)) openExternal(url.replace('{u}', encodeURIComponent(username)));
            else notify('Enter a valid username');
          },
        }, $('span', { class: 'roomgrid-arna-item-name' }, label)));
      }
      toolsView.appendChild(toolGrid);
      toolsView.appendChild($('div', { class: 'roomgrid-arna-label', style: { marginTop: '7px' } }, $('span', {}, 'Manage Sites')));
      siteToggleList = $('div', { class: 'roomgrid-arna-sites' });
      toolsView.appendChild(siteToggleList);
      views.set('tools', toolsView);

      for (const view of views.values()) container.appendChild(view);
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => checkAll(input.value.trim()), 600);
      });
      buildArchiveGrid();
      buildSiteToggles();
    }

    function showView(name) {
      for (const [key, button] of subTabs) {
        const active = key === name;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      }
      for (const [key, view] of views) view.hidden = key !== name;
      if (name === 'history') loadHistory();
      if (name === 'saved') loadSavedProfiles();
    }

    function getValue(key, fallback) {
      try { return GM_getValue(key, fallback); }
      catch (_) { return fallback; }
    }

    function setValue(key, value) {
      try { GM_setValue(key, value); }
      catch (_) {}
    }

    function isValidUsername(value) {
      return typeof value === 'string' && /^[a-zA-Z0-9_-]{3,50}$/.test(value);
    }

    function disabledSites() {
      const value = getValue('ca_disabled_sites', []);
      return Array.isArray(value) ? value.filter(v => typeof v === 'string') : [];
    }

    function buildArchiveGrid() {
      archiveGrid.textContent = '';
      const disabled = disabledSites();
      for (const site of archiveSites) {
        if (disabled.includes(site.name)) continue;
        const icon = $('img', {
          src: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(site.domain)}&sz=32`,
          alt: '',
          loading: 'lazy',
        });
        const item = $('button', {
          class: 'roomgrid-arna-item roomgrid-arna-archive',
          type: 'button',
          dataset: { url: site.url, name: site.name },
          onclick: () => {
            const username = input.value.trim();
            if (isValidUsername(username)) openExternal(site.url.replace('{username}', encodeURIComponent(username)));
            else notify('Enter a valid username');
          },
        }, [
          icon,
          $('span', { class: 'roomgrid-arna-item-name' }, site.name),
          $('span', { class: 'roomgrid-arna-status' }),
        ]);
        archiveGrid.appendChild(item);
      }
      updateCounter(0, archiveGrid.children.length);
    }

    function buildSiteToggles() {
      siteToggleList.textContent = '';
      const disabled = disabledSites();
      for (const site of archiveSites) {
        const checkbox = $('input', { type: 'checkbox', checked: !disabled.includes(site.name) });
        checkbox.addEventListener('change', () => {
          let current = disabledSites();
          if (checkbox.checked) current = current.filter(name => name !== site.name);
          else if (!current.includes(site.name)) current.push(site.name);
          setValue('ca_disabled_sites', current);
          buildArchiveGrid();
          const username = input.value.trim();
          if (isValidUsername(username)) checkAll(username);
        });
        siteToggleList.appendChild($('label', { class: 'roomgrid-arna-site' }, [
          $('span', {}, site.name),
          checkbox,
        ]));
      }
    }

    function checkAll(username) {
      const runId = ++searchRun;
      const items = [...archiveGrid.querySelectorAll('.roomgrid-arna-archive')];
      if (!isValidUsername(username)) {
        for (const item of items) item.classList.remove('checking', 'found', 'not-found');
        updateCounter(0, items.length);
        return;
      }
      saveHistory(username);
      let foundCount = 0;
      for (const item of items) {
        item.classList.remove('found', 'not-found');
        item.classList.add('checking');
      }
      updateCounter(0, items.length);
      for (const item of items) {
        const url = item.dataset.url.replace('{username}', encodeURIComponent(username));
        checkPage(url).then(exists => {
          if (runId !== searchRun || !item.isConnected) return;
          item.classList.remove('checking');
          if (exists) {
            item.classList.add('found');
            foundCount++;
          } else {
            item.classList.add('not-found');
          }
          updateCounter(foundCount, items.length);
        });
      }
    }

    function updateCounter(found, total) {
      if (counter) counter.textContent = `${found} / ${total} found`;
      onFoundCount(found);
    }

    function checkPage(url) {
      return new Promise(resolve => {
        try {
          GM_xmlhttpRequest({
            method: 'GET',
            url,
            timeout: 10000,
            onload: response => resolve(analyzeResponse(response, url)),
            onerror: () => resolve(false),
            ontimeout: () => resolve(false),
          });
        } catch (_) { resolve(false); }
      });
    }

    function analyzeResponse(response, url) {
      try {
        if (!response || response.status === 404 || response.status >= 500) return false;
        const text = response.responseText;
        if (!text || typeof text !== 'string') return false;
        const lower = text.toLowerCase();
        const titleMatch = lower.match(/<title[^>]*>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';
        if (url.includes('livecamrips.to')) {
          if (['no records found', 'no models found', 'no results', '0 models found'].some(pattern => lower.includes(pattern))) return false;
          if (!text.includes('class="video"') && !text.includes('model-card')) return false;
        }
        if (url.includes('cumcams.cc')) {
          if (/<h1[^>]*>404<\/h1>/i.test(text) || /performer\s*not\s*found/i.test(text)) return false;
          if (!text.includes('profile-info') && !text.includes('class="performer"')) return false;
        }
        if (url.includes('allmy.cam') && !text.includes('class="video-card"')) return false;
        if (url.includes('showcamrips') && text.includes('data:image/png;base64')) return false;
        if (url.includes('camshowrecordings.com') && !text.includes('class="h1modelpage"')) return false;
        if (url.includes('livecamsrip.com') && lower.includes('no records found')) return false;
        if (url.includes('camwhores.tv') || url.includes('camwhoresbay.com')) {
          if (lower.includes('there is no data in this list.') || /no\s*videos?\s*found|0\s*videos/i.test(lower)) return false;
        }
        if (['not found', '404', 'error'].some(term => title.includes(term))) return false;
        if ([/no\s*videos?\s*found/i, /no\s*results?\s*found/i, /does\s*not\s*exist/i, /\b0\s*results?\b/i].some(pattern => pattern.test(lower))) return false;
        return true;
      } catch (_) { return false; }
    }

    function saveHistory(username) {
      let history = getValue('ca_history', []);
      if (!Array.isArray(history)) history = [];
      history = history.filter(entry => entry !== username);
      history.unshift(username);
      setValue('ca_history', history.slice(0, config.maxHistory));
      if (views.get('history') && !views.get('history').hidden) loadHistory();
    }

    function loadHistory() {
      historyList.textContent = '';
      let history = getValue('ca_history', []);
      if (!Array.isArray(history)) history = [];
      history = history.filter(isValidUsername);
      if (!history.length) {
        historyList.appendChild($('div', { class: 'roomgrid-arna-empty' }, 'No history yet'));
        return;
      }
      for (const username of history) {
        historyList.appendChild($('button', {
          class: 'roomgrid-arna-row',
          type: 'button',
          onclick: () => selectUsername(username),
        }, [
          $('strong', {}, username),
          $('span', { style: { color: 'var(--arna-muted)' } }, '↺'),
        ]));
      }
    }

    function normalizeSavedProfiles(raw) {
      if (!Array.isArray(raw)) return [];
      const seen = new Set();
      const normalized = [];
      for (const source of raw) {
        const item = typeof source === 'string' ? { user: source, platform: '?' } : source;
        if (!item || !isValidUsername(item.user) || seen.has(item.user)) continue;
        seen.add(item.user);
        normalized.push({
          user: item.user,
          platform: typeof item.platform === 'string' ? item.platform.slice(0, 24) : '?',
        });
      }
      return normalized;
    }

    function saveCurrentProfile() {
      const username = input.value.trim();
      if (!isValidUsername(username)) { notify('Enter a valid username'); return; }
      const saved = normalizeSavedProfiles(getValue('ca_saved', []));
      if (saved.some(item => item.user === username)) { notify(`${username} already saved`); return; }
      saved.push({ user: username, platform: 'CB' });
      setValue('ca_saved', saved);
      notify(`Saved ${username}`);
    }

    function loadSavedProfiles() {
      savedList.textContent = '';
      const saved = normalizeSavedProfiles(getValue('ca_saved', []));
      if (!saved.length) {
        savedList.appendChild($('div', { class: 'roomgrid-arna-empty' }, 'No saved profiles'));
        return;
      }
      for (const item of saved) {
        const removeButton = $('button', {
          class: 'roomgrid-arna-delete',
          type: 'button',
          title: 'Remove saved profile',
        }, '×');
        removeButton.addEventListener('click', event => {
          event.stopPropagation();
          setValue('ca_saved', saved.filter(entry => entry.user !== item.user));
          loadSavedProfiles();
        });
        const row = $('div', { class: 'roomgrid-arna-row' }, [
          $('div', { class: 'roomgrid-arna-row-main' }, [
            $('strong', {}, item.user),
            $('span', { class: 'roomgrid-arna-tag' }, item.platform || '?'),
          ]),
          removeButton,
        ]);
        row.addEventListener('click', () => selectUsername(item.user));
        savedList.appendChild(row);
      }
    }

    function selectUsername(username) {
      input.value = username;
      showView('search');
      checkAll(username);
    }

    function exportSavedProfiles() {
      const saved = normalizeSavedProfiles(getValue('ca_saved', []));
      if (!saved.length) { notify('Nothing to export'); return; }
      downloadBlob(
        new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json;charset=utf-8' }),
        `arna_backup_${new Date().toISOString().slice(0, 10)}.json`,
      );
      notify('Export successful');
    }

    function importSavedProfiles(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = loadEvent => {
        try {
          const imported = normalizeSavedProfiles(JSON.parse(loadEvent.target.result));
          const current = normalizeSavedProfiles(getValue('ca_saved', []));
          const known = new Set(current.map(item => item.user));
          const additions = imported.filter(item => !known.has(item.user));
          setValue('ca_saved', current.concat(additions));
          notify(`Imported ${additions.length} profiles`);
          loadSavedProfiles();
        } catch (_) { notify('Invalid JSON file'); }
      };
      reader.onerror = () => notify('Error reading file');
      reader.readAsText(file);
      event.target.value = '';
    }

    return { activate };
  }

  /* =============================================================
   * 8. 工作台 / Workstation
   * ============================================================= */
  function initWorkstation() {
    document.title = t('title');
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.content = 'width=device-width,initial-scale=1,viewport-fit=cover';
    // 在当前页打开工作台时，先停止原页面自带的 video/audio，避免页面清空后仍有声音。
    stopAllPageMedia();
    document.body.replaceChildren();
    const store = createStore();
    const phoneEnvironment = isPhoneLikeDevice();
    document.body.classList.toggle('rg-phone-device', phoneEnvironment);
    if (phoneEnvironment && store.state.settings.phoneModeAuto) {
      store.patchSettings({ viewMode: 'phone', sidebarCollapsed: true });
    }
    const service = createRoomService(store);
    Notify.init();

    // 离开工作台页时，统一停流，避免浏览器残留音轨。

    window.addEventListener('pagehide', () => {
      try { stopAllRecordings({ final: true, silent: true }); } catch (_) {}
      try { service.stopAll(); } catch (_) { stopAllPageMedia(); }
    });
    window.addEventListener('beforeunload', (e) => {
      if (!store.state.settings.recordingExitWarn || !recordings.size) return;
      const msg = t('recordingExitWarnMessage');
      e.preventDefault();
      e.returnValue = msg;
      return msg;
    });

    // 全局样式
    document.head.appendChild($('style', {
      html: trustedHtml(`
        :root {
          color-scheme: light;
          /* —— 更像标准 SaaS 产品的浅色设计系统：更清晰层级、更统一圆角、更轻的高光与阴影 —— */
          --bg: #f4f7fb;
          --bg-elevated: rgba(255,255,255,.88);
          --bg-card: #ffffff;
          --bg-input: #ffffff;
          --bg-hover: rgba(15,23,42,.05);
          --bg-overlay: rgba(15,23,42,.18);
          --border: #e6ebf2;
          --border-strong: #d3dce8;
          --text: #0f172a;
          --text-secondary: #334155;
          --text-muted: #64748b;
          --accent: #2563eb;
          --accent-hover: #1d4ed8;
          --accent-soft: rgba(37,99,235,.10);
          --info: #2563eb;
          --info-soft: rgba(37,99,235,.10);
          --success: #16a34a;
          --danger: #dc2626;
          --warning: #d97706;
          --radius-sm: 10px;
          --radius-md: 14px;
          --radius-lg: 18px;
          --shadow-sm: 0 1px 2px rgba(15,23,42,.04), 0 4px 14px rgba(15,23,42,.04);
          --shadow-md: 0 8px 24px rgba(15,23,42,.08);
          --shadow-lg: 0 18px 48px rgba(15,23,42,.12);
        }
        * { box-sizing: border-box; }
        body { margin:0; background:radial-gradient(circle at top left, rgba(37,99,235,.06), transparent 24%), linear-gradient(180deg, #f8fbff 0%, var(--bg) 100%); color:var(--text);
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; overflow:hidden; }
        button { font-family:inherit; }
        ::-webkit-scrollbar { width:10px; height:10px; }
        ::-webkit-scrollbar-thumb { background:var(--border-strong); border-radius:999px; border:2px solid transparent; background-clip:padding-box; }
        ::-webkit-scrollbar-thumb:hover { background:#c1cada; background-clip:padding-box; }
        ::-webkit-scrollbar-track { background:transparent; }
        video:focus { outline:none; }
        .cam-card { position:relative; background:#f8fafc; border-radius:var(--radius-md); overflow:hidden;
          border:1px solid rgba(15,23,42,.08); box-shadow:var(--shadow-sm); transition:border-color .2s, box-shadow .2s, transform .15s;
          display:block; min-height:0; min-width:0; width:100%; height:100%; isolation:isolate; contain:layout paint; }
        .grid.view-grid { align-content:start; align-items:stretch; }
        .grid.view-grid .cam-card { aspect-ratio:auto; }
        .cam-card.dragging { opacity:.4; transform:scale(.96); }
        .cam-card[draggable="true"] { cursor:grab; }
        .cam-card[draggable="true"].dragging { cursor:grabbing; }
        .cam-card .icon-btn, .cam-card button { cursor:pointer; }
        .cam-card.drop-before { box-shadow: inset 3px 0 0 0 var(--accent), inset 0 3px 0 0 var(--accent); }
        .cam-card.drop-after  { box-shadow: inset -3px 0 0 0 var(--accent), inset 0 -3px 0 0 var(--accent); }
        /* 避免使用 .overlay 通用类名：CB 站点样式会把它拉伸成整卡黑色遮罩。 */
        .cam-card .mc-hover-ui { opacity:0; transition:opacity .14s ease, transform .14s ease; pointer-events:none; transform:translateY(-2px);
          background:transparent !important; width:auto !important; height:auto !important;
          filter:none !important; mix-blend-mode:normal !important; }
        .cam-card:hover .mc-hover-ui,
        .cam-card:not(.compact) .mc-hover-ui { opacity:1; transform:translateY(0); }
        .cam-card .mc-hover-ui.ops-row { position:absolute !important; top:8px !important; right:8px !important; left:auto !important; bottom:auto !important; display:flex !important; }
        .cam-card .mc-hover-ui button { pointer-events:auto; }
        .cam-card:hover .cam-video, .cam-card .cam-video:hover { filter:none !important; opacity:1 !important; }
        .cam-card::before, .cam-card::after { pointer-events:none; background:transparent !important; }
        .cam-video { position:absolute; inset:0; width:100%; height:100%; object-fit:contain;
          background:transparent; z-index:1; pointer-events:none; }
        .cam-card.video-zoomed .cam-video { cursor:grab; }
        .cam-card.video-panning .cam-video { cursor:grabbing !important; }
        .cam-video::-webkit-media-controls,
        .cam-video::-webkit-media-controls-enclosure { display:none !important; opacity:0 !important; }
        .cam-card.not-online { background:linear-gradient(135deg, rgba(255,255,255,.92), rgba(241,245,249,.96)); }
        .status-layer { position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
          flex-direction:column; gap:6px; color:var(--text-muted); font-size:12px; text-align:center;
          padding:16px; pointer-events:none; background:transparent; z-index:4; }
        .status-layer .status-icon { font-size:24px; line-height:1; opacity:.9; }
        .status-layer .status-chip { font-weight:650; padding:3px 9px; border-radius:999px;
          background:rgba(17,24,39,.045); border:1px solid rgba(17,24,39,.06); }
        .cam-card.flash { animation: flash 1.5s ease 3; }
        @keyframes flash {
          0%,100% { box-shadow:0 0 0 0 rgba(35,165,89,0); border-color:var(--border); }
          50% { box-shadow:0 0 0 4px rgba(35,165,89,.55); border-color:var(--success); }
        }
        /* —— 卡片浮层控件：透明毛玻璃，避免遮挡画面 —— */
        .cam-card video { -webkit-user-drag:none; user-drag:none; }
        .pill { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px;
          font-size:11px; font-weight:700; backdrop-filter:blur(8px) !important; -webkit-backdrop-filter:blur(8px) !important;
          background:rgba(255,255,255,.86); color:var(--text); border:1px solid rgba(255,255,255,.55); box-shadow:0 6px 16px rgba(15,23,42,.08); }
        .dot { width:7px; height:7px; border-radius:50%; display:inline-block; }
        .svg-icon { width:1em; height:1em; display:inline-block; vertical-align:-.16em; flex:0 0 auto; }
        .btn-label { white-space:nowrap; }
        .ctrl-btn, .seg button { display:inline-flex; align-items:center; justify-content:center; gap:7px; }
        .icon-btn .svg-icon { width:15px; height:15px; }
        .status-dot-large { width:12px; height:12px; border-radius:999px; display:inline-block; background:currentColor; box-shadow:0 0 0 6px currentColor; opacity:.18; }
        .icon-btn { background:rgba(255,255,255,.88); backdrop-filter:blur(10px) !important; -webkit-backdrop-filter:blur(10px) !important;
          border:1px solid rgba(255,255,255,.7); color:var(--text-secondary); width:29px; height:29px; border-radius:9px; cursor:pointer;
          box-shadow:0 4px 12px rgba(15,23,42,.08); display:flex; align-items:center; justify-content:center; font-size:12px;
          transition:background .15s, transform .15s, color .15s, border-color .15s, box-shadow .15s; }
        .icon-btn:hover { background:#fff; color:var(--accent); border-color:rgba(37,99,235,.2); transform:translateY(-1px); box-shadow:0 8px 18px rgba(15,23,42,.12); }
        .icon-btn.danger:hover { background:var(--danger); }
        .icon-btn.recording { background:var(--danger); color:#fff; animation: recordPulse 1s ease infinite; }
        .icon-btn.recording.waiting { background:var(--warning); color:#fff; animation:none; }
        .cam-card.recording { outline:2px solid var(--danger); outline-offset:2px; }
        .cam-card.recording-waiting { outline-color:var(--warning); }
        @keyframes recordPulse { 0%,100% { opacity:1; } 50% { opacity:.58; } }
        /* —— 卡片响应式：根据宽度收起部分按钮 —— */
        .cam-card.compact .ops-extra { display:none; }
        .cam-card.compact .pill .pill-text { display:none; }
        .cam-card.compact .name-label { font-size:11px; padding:3px 7px; max-width:55%; }
        .cam-card.tiny .ops-row { gap:3px; }
        .cam-card.tiny .icon-btn { width:22px; height:22px; font-size:10px; }
        .cam-card.tiny .name-label { display:none; }
        .cam-card.tiny .pill { padding:2px 6px; font-size:10px; }

        /* —— 主屏（focus 模式）—— */
        .grid.view-focus { display:grid; grid-template-areas:'main' 'bar' 'thumbs';
          grid-template-rows:minmax(0,var(--focus-main-pct,68fr)) 10px minmax(108px,var(--focus-thumb-pct,32fr));
          grid-template-columns:minmax(0,1fr); gap:12px; padding:18px; height:100%; overflow:hidden; }
        .grid.view-focus .focused-row { grid-area:main; min-height:0; min-width:0; display:grid; place-items:center; overflow:hidden; position:relative; z-index:1; }
        .grid.view-focus .focused-row .cam-card { max-width:100%; max-height:100%; flex:0 0 auto; min-height:0; }
        .grid.view-focus .focused-row .cam-card.is-focus-main { border-color:var(--accent); box-shadow:0 0 0 1px rgba(16,163,127,.25); }
        .grid.view-focus .resizer { grid-area:bar; height:8px; min-height:8px; cursor:ns-resize; background:transparent; position:relative; z-index:2; }
        .grid.view-focus .resizer::before { content:''; position:absolute; left:50%;
          top:50%; transform:translate(-50%,-50%); width:50px; height:3px; border-radius:2px;
          background:var(--border-strong); transition:background .15s, width .15s; }
        .grid.view-focus .resizer:hover::before,
        .grid.view-focus .resizer.dragging::before { background:var(--accent); width:80px; }
        .grid.view-focus .thumbs-row { grid-area:thumbs; min-height:0; min-width:0; display:grid; grid-template-columns:repeat(auto-fill,minmax(var(--focus-thumb-min,180px),1fr));
          grid-auto-flow:row; gap:12px; overflow:auto; padding:2px 2px 8px; align-content:start; align-items:start; position:relative; z-index:1; }
        .grid.view-focus .thumbs-row .cam-card { cursor:pointer; width:100%; height:auto; min-height:0; aspect-ratio:var(--focus-thumb-aspect,16/9); }
        .grid.view-focus .thumbs-row .cam-card:hover { border-color:var(--accent); }

        /* —— 控件 —— */
        .group-tab { padding:10px 12px; border-radius:12px; cursor:pointer; font-size:13px;
          background:transparent; border:none; color:var(--text-secondary); text-align:left;
          transition:background .12s, color .12s, border-color .12s, box-shadow .12s; border:1px solid transparent;
          display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; }
        .group-tab:hover { background:#fff; color:var(--text); border-color:var(--border); box-shadow:var(--shadow-sm); }
        .group-tab.active { background:linear-gradient(180deg, rgba(37,99,235,.10), rgba(37,99,235,.06)); color:var(--accent); border-color:rgba(37,99,235,.18); box-shadow:var(--shadow-sm); }
        .group-tab.drop-target { background:var(--accent-soft); outline:1.5px dashed var(--accent); }
        .ctrl-input { background:var(--bg-input); border:1px solid var(--border); color:var(--text);
          padding:8px 12px; min-height:38px; border-radius:12px; font-size:13px; outline:none;
          box-shadow:0 1px 0 rgba(255,255,255,.7) inset; transition:border-color .15s, background .15s, box-shadow .15s; }
        .ctrl-input:focus { border-color:rgba(37,99,235,.38); box-shadow:0 0 0 4px rgba(37,99,235,.10); }
        .ctrl-input:hover:not(:focus) { border-color:var(--border-strong); }
        .ctrl-btn { background:var(--bg-input); border:1px solid var(--border); color:var(--text);
          padding:8px 12px; min-height:38px; border-radius:12px; font-size:13px; cursor:pointer;
          box-shadow:0 1px 0 rgba(255,255,255,.7) inset; transition:background .15s, border-color .15s, transform .15s, box-shadow .15s; }
        .ctrl-btn:hover { background:#fff; border-color:var(--border-strong); transform:translateY(-1px); box-shadow:var(--shadow-sm); }
        .ctrl-btn.primary { background:linear-gradient(180deg, rgba(37,99,235,.12), rgba(37,99,235,.08)); border-color:rgba(37,99,235,.28); color:var(--accent); }
        .ctrl-btn.primary:hover { background:var(--accent); color:#fff; border-color:var(--accent); }
        .ctrl-btn.disabled, .ctrl-btn:disabled { opacity:.5; cursor:not-allowed; }
        .toggle { display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-size:12px;
          color:var(--text-secondary); padding:7px 10px; border-radius:12px; user-select:none; border:1px solid transparent;
          transition:background .12s, border-color .12s; }
        .toggle:hover { background:#fff; color:var(--text); border-color:var(--border); }
        .toggle input { accent-color:var(--accent); }
        .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center;
          height:100%; color:var(--text-muted); gap:16px; padding:40px; text-align:center; }
        .menu-pop { position:absolute; background:var(--bg-elevated); backdrop-filter:none;
          border:1px solid var(--border); border-radius:8px; padding:5px; min-width:180px;
          box-shadow:var(--shadow-lg); z-index:1000;
          display:flex; flex-direction:column; gap:1px; }
        .menu-pop button { background:transparent; border:none; color:var(--text);
          padding:8px 12px; text-align:left; cursor:pointer; border-radius:5px; font-size:13px; }
        .menu-pop button:hover { background:var(--bg-hover); }
        .menu-pop button.danger { color:var(--danger); }
        .menu-pop button.danger:hover { background:rgba(242,63,67,.15); }

        /* —— 视图切换段 segmented control —— */
        .seg { display:inline-flex; background:var(--bg-input); border:1px solid var(--border);
          border-radius:12px; padding:3px; box-shadow:0 1px 0 rgba(255,255,255,.7) inset; }
        .seg button { background:transparent; border:none; color:var(--text-secondary);
          padding:6px 12px; border-radius:9px; cursor:pointer; font-size:12px; font-weight:600;
          transition:background .15s, color .15s; }
        .seg button.active { background:var(--accent); color:#fff; box-shadow:0 6px 16px rgba(37,99,235,.20); }
        .seg button:hover:not(.active) { color:var(--text); }
        .toolbar-group { display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:8px 10px; background:rgba(255,255,255,.76); border:1px solid var(--border); border-radius:14px; box-shadow:var(--shadow-sm); }
        .toolbar-group.compact { padding:6px 8px; }
        .toolbar-spacer { margin-left:auto; display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
        .sidebar-brand { padding:14px 14px 12px; border-radius:16px; background:linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.82)); border:1px solid var(--border); box-shadow:var(--shadow-sm); margin-bottom:10px; }
        .sidebar-brand .title { font-size:15px; font-weight:800; letter-spacing:.01em; color:var(--text); }
        .sidebar-brand .sub { font-size:12px; color:var(--text-muted); margin-top:4px; line-height:1.45; }
        .sidebar-section-title { font-size:11px; color:var(--text-muted); padding:6px 8px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
        .sidebar-stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-top:auto; padding:10px 4px 2px; }
        .sidebar-stat { background:rgba(255,255,255,.84); border:1px solid var(--border); border-radius:14px; padding:10px 8px; box-shadow:var(--shadow-sm); }
        .sidebar-stat .k { font-size:10px; color:var(--text-muted); margin-bottom:4px; }
        .sidebar-stat .v { font-size:14px; font-weight:800; color:var(--text); }

        .mc-tooltip { position:fixed; z-index:1000002; max-width:min(360px, calc(100vw - 24px));
          padding:6px 8px; border-radius:6px; background:rgba(17,24,39,.92); color:#fff;
          font-size:11px; line-height:1.35; pointer-events:none; box-shadow:var(--shadow-md);
          white-space:normal; transform:translateY(2px); opacity:0; transition:opacity .08s, transform .08s; }
        .mc-tooltip.show { opacity:1; transform:translateY(0); }


        /* —— Window-first：把空间留给窗口，所有操作只在需要时出现 —— */
        .app-shell { display:flex; height:100vh; gap:10px; padding:10px; }
        .grid { background:linear-gradient(180deg, rgba(255,255,255,.34), rgba(255,255,255,.14)); }
        body.rg-video-cover .cam-video { object-fit:cover !important; }
        body.rg-video-contain .cam-video { object-fit:contain !important; }
        body.rg-viewer-mode { background:#050607; }
        body.rg-viewer-mode .sidebar,
        body.rg-viewer-mode header,
        body.rg-viewer-mode .top-accent { display:none !important; }
        body.rg-viewer-mode .app-shell { padding:0 !important; gap:0 !important; }
        body.rg-viewer-mode main { width:100vw !important; height:100vh !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; background:#050607 !important; }
        body.rg-viewer-mode .grid { padding:8px !important; background:#050607 !important; }
        body.rg-viewer-mode .grid.view-grid { gap:8px !important; }

        .cam-card:not(.compact) .mc-hover-ui { opacity:0 !important; pointer-events:none !important; }
        .cam-card:hover .mc-hover-ui,
        .cam-card:focus-within .mc-hover-ui { opacity:1 !important; pointer-events:auto !important; }
        .cam-card .pill,
        .cam-card .name-label { opacity:0; pointer-events:none; transition:opacity .16s ease, transform .16s ease; }
        .cam-card:hover .pill,
        .cam-card:focus-within .pill,
        .cam-card:hover .name-label,
        .cam-card:focus-within .name-label { opacity:1; pointer-events:auto; }
        .cam-card.not-online .pill,
        .cam-card.recording .pill { opacity:1; }
        .cam-card.recording .name-label { opacity:1; }
        .cam-card .ops-row {
          top:auto !important; right:auto !important; bottom:10px !important; left:50% !important;
          transform:translateX(-50%) translateY(8px) !important;
          display:flex !important; align-items:center !important; gap:3px !important;
          padding:4px !important; border-radius:999px !important;
          background:rgba(15,23,42,.42) !important; border:1px solid rgba(255,255,255,.18) !important;
          backdrop-filter:blur(14px) !important; -webkit-backdrop-filter:blur(14px) !important;
          box-shadow:0 10px 30px rgba(0,0,0,.18) !important;
        }
        .cam-card:hover .ops-row,
        .cam-card:focus-within .ops-row { transform:translateX(-50%) translateY(0) !important; }
        .cam-card .ops-row .icon-btn { width:28px; height:28px; border-radius:999px; color:rgba(255,255,255,.92); background:transparent; border:0; box-shadow:none; }
        .cam-card .ops-row .icon-btn:hover { background:rgba(255,255,255,.16); color:#fff; transform:none; box-shadow:none; }
        .cam-card .ops-row .icon-btn.danger:hover { background:rgba(220,38,38,.86); color:#fff; }
        .cam-card.compact .ops-extra { display:flex; }
        .cam-card.tiny .ops-extra { display:none; }
        .cam-card.tiny .ops-row .icon-btn { width:24px; height:24px; }
        .cam-card .name-label { top:8px !important; bottom:auto !important; left:8px !important; transform:translateY(-4px); }
        .cam-card:hover .name-label,
        .cam-card:focus-within .name-label { transform:translateY(0); }
        .cam-card .pill { top:8px !important; right:8px !important; left:auto !important; }
        .grid.view-focus { grid-template-areas:'main thumbs' !important; grid-template-columns:minmax(0,1fr) minmax(190px,var(--focus-rail-width,260px)) !important; grid-template-rows:minmax(0,1fr) !important; gap:10px !important; padding:10px !important; background:#050607 !important; }
        .grid.view-focus .focused-row { background:#050607; border-radius:12px; }
        .grid.view-focus .focused-row .cam-card { border-radius:12px; border-color:rgba(255,255,255,.10); box-shadow:none; background:#000; }
        .grid.view-focus .focused-row .cam-video { background:#000; }
        .grid.view-focus .resizer { display:none !important; }
        .grid.view-focus .thumbs-row { grid-template-columns:1fr !important; gap:8px !important; padding:0 2px 0 0 !important; background:transparent; }
        .grid.view-focus .thumbs-row .cam-card { border-radius:10px; border-color:rgba(255,255,255,.12); opacity:.82; transition:opacity .14s,border-color .14s,transform .14s; }
        .grid.view-focus .thumbs-row .cam-card:hover { opacity:1; transform:translateY(-1px); }
        body.rg-focus-thumbs-collapsed .grid.view-focus { grid-template-areas:'main' !important; grid-template-columns:minmax(0,1fr) !important; }
        body.rg-focus-thumbs-collapsed .grid.view-focus .thumbs-row { display:none !important; }
        @media (max-width: 980px) {
          .grid.view-focus { grid-template-areas:'main' 'thumbs' !important; grid-template-columns:minmax(0,1fr) !important; grid-template-rows:minmax(0,1fr) minmax(92px,24vh) !important; }
          .grid.view-focus .thumbs-row { grid-template-columns:repeat(auto-fill,minmax(var(--focus-thumb-min,150px),1fr)) !important; padding:0 0 2px !important; }
        }

        /* —— v13.2：窗口优先最终覆盖。卡片默认只看画面，主屏默认只看主画面。 —— */
        .cam-card .ops-row .ops-extra,
        .cam-card .ops-row .icon-btn.danger { display:none !important; }
        .cam-card .ops-row .icon-btn.recording { display:flex !important; }
        .cam-card .ops-row { opacity:0; pointer-events:none; }
        .cam-card:hover .ops-row,
        .cam-card:focus-within .ops-row { opacity:1; pointer-events:auto; }
        .cam-card.is-online .pill,
        .cam-card.is-online .name-label { opacity:0 !important; pointer-events:none !important; }
        .cam-card.is-online:hover .pill,
        .cam-card.is-online:focus-within .pill,
        .cam-card.is-online:hover .name-label,
        .cam-card.is-online:focus-within .name-label { opacity:1 !important; }
        .grid.view-focus { display:block !important; position:relative !important; grid-template-areas:none !important; grid-template-columns:none !important; grid-template-rows:none !important; padding:0 !important; gap:0 !important; background:#000 !important; overflow:hidden !important; }
        .grid.view-focus .focused-row { position:absolute !important; inset:0 !important; grid-area:auto !important; min-width:0 !important; min-height:0 !important; display:grid !important; place-items:center !important; background:#000 !important; border-radius:0 !important; overflow:hidden !important; }
        .grid.view-focus .focused-row .cam-card { border:0 !important; border-radius:0 !important; box-shadow:none !important; background:#000 !important; }
        .grid.view-focus .focused-row .ops-row { top:14px !important; right:14px !important; bottom:auto !important; left:auto !important; transform:translateY(-6px) !important; }
        .grid.view-focus .focused-row .cam-card:hover .ops-row,
        .grid.view-focus .focused-row .cam-card:focus-within .ops-row { transform:translateY(0) !important; }
        .grid.view-focus .focused-row .name-label { top:auto !important; bottom:14px !important; left:14px !important; }
        .grid.view-focus .resizer { display:none !important; }
        .grid.view-focus .thumbs-row { position:absolute !important; grid-area:auto !important; left:14px !important; right:14px !important; bottom:10px !important; height:var(--focus-filmstrip-height,118px) !important;
          display:flex !important; gap:10px !important; overflow-x:auto !important; overflow-y:hidden !important; padding:10px !important; z-index:12 !important;
          background:rgba(15,23,42,.56) !important; border:1px solid rgba(255,255,255,.16) !important; border-radius:16px !important; box-shadow:0 14px 40px rgba(0,0,0,.32) !important;
          backdrop-filter:blur(14px) !important; -webkit-backdrop-filter:blur(14px) !important; transform:translateY(calc(100% - 20px)) !important; opacity:.20 !important;
          transition:transform .18s ease, opacity .18s ease, background .18s ease !important; }
        .grid.view-focus .thumbs-row:hover,
        .grid.view-focus .thumbs-row:focus-within { transform:translateY(0) !important; opacity:1 !important; background:rgba(15,23,42,.70) !important; }
        .grid.view-focus .thumbs-row .cam-card { flex:0 0 var(--focus-thumb-min,150px) !important; width:auto !important; height:100% !important; border-radius:10px !important; border-color:rgba(255,255,255,.18) !important; box-shadow:none !important; opacity:.86; }
        .grid.view-focus .thumbs-row .cam-card:hover { opacity:1; transform:translateY(-1px); }
        .grid.view-focus .thumbs-row .pill,
        .grid.view-focus .thumbs-row .name-label,
        .grid.view-focus .thumbs-row .ops-row { display:none !important; }
        body.rg-focus-thumbs-collapsed .grid.view-focus .thumbs-row { display:none !important; }
        body.rg-focus-mode { background:#000; }
        body.rg-focus-mode .app-shell { padding:0 !important; gap:0 !important; }
        body.rg-focus-mode .sidebar { display:none !important; }
        body.rg-focus-mode main { width:100vw !important; height:100vh !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; background:#000 !important; position:relative !important; }
        body.rg-focus-mode .top-accent { display:none !important; }
        body.rg-focus-mode header { position:absolute !important; left:12px !important; right:12px !important; top:10px !important; z-index:70 !important;
          transform:translateY(calc(-100% + 8px)) !important; opacity:.14 !important; transition:transform .18s ease, opacity .18s ease !important; }
        body.rg-focus-mode header:hover,
        body.rg-focus-mode header:focus-within { transform:translateY(0) !important; opacity:1 !important; }


        /* —— v14.0：重新按“多窗口视频优先”收敛。窗口是产品主体，控件只做临时 HUD。 —— */
        body { background:#0b0e13 !important; }
        .app-shell { gap:8px !important; padding:8px !important; background:#0b0e13 !important; }
        main { background:#07090d !important; border-color:rgba(255,255,255,.08) !important; border-radius:12px !important; box-shadow:none !important; }
        .top-accent { display:none !important; }
        header { padding:8px 10px !important; gap:8px !important; background:rgba(255,255,255,.92) !important; border-bottom:1px solid rgba(15,23,42,.08) !important; }
        .toolbar-group { padding:5px 7px !important; gap:6px !important; border-radius:10px !important; box-shadow:none !important; background:#fff !important; }
        .ctrl-btn, .ctrl-input { min-height:32px !important; border-radius:9px !important; padding:5px 9px !important; font-size:12px !important; }
        .seg { border-radius:10px !important; padding:2px !important; }
        .seg button { padding:5px 9px !important; border-radius:8px !important; }
        .toggle { padding:5px 7px !important; border-radius:9px !important; }
        .toolbar-spacer { gap:6px !important; }
        .sidebar { background:#111827 !important; color:#e5e7eb !important; border-color:rgba(255,255,255,.08) !important; border-radius:12px !important; box-shadow:none !important; padding:10px 8px !important; width:220px !important; }
        .sidebar-brand { background:transparent !important; border:0 !important; box-shadow:none !important; margin:0 0 4px !important; padding:8px 10px !important; }
        .sidebar-brand .title { color:#f8fafc !important; font-size:14px !important; }
        .sidebar-section-title { color:#94a3b8 !important; }
        .group-tab { color:#cbd5e1 !important; padding:8px 10px !important; border-radius:10px !important; }
        .group-tab:hover { background:rgba(255,255,255,.06) !important; border-color:rgba(255,255,255,.08) !important; box-shadow:none !important; color:#fff !important; }
        .group-tab.active { background:rgba(37,99,235,.18) !important; border-color:rgba(96,165,250,.30) !important; color:#bfdbfe !important; box-shadow:none !important; }
        .sidebar-stat { background:rgba(255,255,255,.04) !important; border-color:rgba(255,255,255,.08) !important; box-shadow:none !important; }
        .sidebar-stat .k { color:#94a3b8 !important; }
        .sidebar-stat .v { color:#f8fafc !important; }

        .grid.view-grid { background:#07090d !important; padding:8px !important; gap:6px !important; }
        .grid.view-grid .cam-card { border-radius:6px !important; }
        .cam-card { background:#000 !important; border:1px solid rgba(255,255,255,.075) !important; box-shadow:none !important; }
        .cam-card:hover, .cam-card:focus-within { border-color:rgba(96,165,250,.55) !important; box-shadow:0 0 0 1px rgba(96,165,250,.10) !important; }
        .cam-card.is-online .status-layer { display:none !important; }
        .cam-card .cam-video { background:#000 !important; }
        .cam-card .pill, .cam-card .name-label { opacity:0 !important; pointer-events:none !important; }
        .cam-card.not-online .pill,
        .cam-card.not-online .name-label,
        .cam-card.recording .name-label { opacity:1 !important; }
        .cam-card:hover .name-label,
        .cam-card:focus-within .name-label { opacity:1 !important; }
        .cam-card .name-label { left:8px !important; top:8px !important; bottom:auto !important; max-width:calc(100% - 52px) !important; background:rgba(0,0,0,.42) !important; color:#f8fafc !important; border-color:rgba(255,255,255,.10) !important; border-radius:6px !important; font-size:11px !important; padding:4px 7px !important; }
        .cam-card .pill { display:none !important; }
        .cam-card.not-online .pill { display:inline-flex !important; }
        .cam-card .ops-row {
          top:8px !important; right:8px !important; left:auto !important; bottom:auto !important;
          transform:none !important; padding:0 !important; background:transparent !important; border:0 !important; box-shadow:none !important;
          backdrop-filter:none !important; -webkit-backdrop-filter:none !important; opacity:0 !important;
        }
        .cam-card:hover .ops-row, .cam-card:focus-within .ops-row { opacity:1 !important; transform:none !important; }
        .cam-card .ops-row .icon-btn { width:30px !important; height:30px !important; border-radius:8px !important; background:rgba(0,0,0,.48) !important; color:#f8fafc !important; border:1px solid rgba(255,255,255,.14) !important; box-shadow:none !important; }
        .cam-card .ops-row .icon-btn:hover { background:rgba(37,99,235,.86) !important; border-color:rgba(96,165,250,.50) !important; }
        .cam-card .ops-row .icon-btn:not(:last-child) { display:none !important; }
        .cam-card.recording::after { content:'REC'; position:absolute; left:8px; bottom:8px; z-index:28; padding:3px 6px; border-radius:5px; background:rgba(220,38,38,.92); color:#fff; font-size:10px; font-weight:800; letter-spacing:.04em; pointer-events:none; }
        .cam-card.recording-waiting::after { content:'REC PAUSED'; background:rgba(217,119,6,.94); }
        .status-layer { color:#cbd5e1 !important; background:linear-gradient(180deg,rgba(15,23,42,.10),rgba(15,23,42,.24)) !important; }
        .status-layer .status-chip { background:rgba(255,255,255,.06) !important; color:#e5e7eb !important; border-color:rgba(255,255,255,.10) !important; }

        body.rg-viewer-mode .app-shell { padding:0 !important; gap:0 !important; }
        body.rg-viewer-mode .sidebar,
        body.rg-viewer-mode header,
        body.rg-viewer-mode .top-accent { display:none !important; }
        body.rg-viewer-mode main { width:100vw !important; height:100vh !important; border:0 !important; border-radius:0 !important; }
        body.rg-viewer-mode .grid.view-grid { padding:4px !important; gap:4px !important; }

        body.rg-focus-mode { background:#000 !important; }
        body.rg-focus-mode .app-shell { padding:0 !important; gap:0 !important; }
        body.rg-focus-mode .sidebar,
        body.rg-focus-mode .top-accent { display:none !important; }
        body.rg-focus-mode main { width:100vw !important; height:100vh !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; background:#000 !important; }
        body.rg-focus-mode header { transform:translateY(calc(-100% + 4px)) !important; opacity:.02 !important; pointer-events:auto !important; }
        body.rg-focus-mode header:hover,
        body.rg-focus-mode header:focus-within { transform:translateY(0) !important; opacity:1 !important; pointer-events:auto !important; }
        body.rg-focus-mode::before { content:''; position:fixed; left:0; right:0; top:0; height:14px; z-index:69; pointer-events:none; }
        body.rg-focus-mode:hover header { pointer-events:auto !important; }
        .grid.view-focus { padding:0 !important; background:#000 !important; }
        .grid.view-focus .focused-row .cam-card { border:0 !important; border-radius:0 !important; }
        .grid.view-focus .focused-row .name-label { top:auto !important; bottom:14px !important; left:14px !important; background:rgba(0,0,0,.34) !important; opacity:0 !important; }
        .grid.view-focus .focused-row .cam-card:hover .name-label,
        .grid.view-focus .focused-row .cam-card:focus-within .name-label { opacity:1 !important; }
        .grid.view-focus .focused-row .ops-row { top:14px !important; right:14px !important; opacity:0 !important; }
        .grid.view-focus .focused-row .cam-card:hover .ops-row,
        .grid.view-focus .focused-row .cam-card:focus-within .ops-row { opacity:1 !important; }
        .grid.view-focus .thumbs-row { transform:translateY(calc(100% + 6px)) !important; opacity:0 !important; bottom:8px !important; left:8px !important; right:8px !important; height:104px !important; }
        .grid.view-focus .thumbs-row:hover,
        .grid.view-focus .thumbs-row:focus-within { transform:translateY(0) !important; opacity:1 !important; }
        body:not(.rg-focus-thumbs-collapsed) .grid.view-focus::after { content:''; position:absolute; left:50%; bottom:7px; width:64px; height:4px; transform:translateX(-50%); border-radius:999px; background:rgba(255,255,255,.22); z-index:11; pointer-events:none; }
        body.rg-focus-thumbs-collapsed .grid.view-focus::after { display:none !important; }
        .grid.view-focus .thumbs-row .cam-card { border-radius:6px !important; }
        .grid.view-focus .thumbs-row .cam-card.is-focus-main { outline:2px solid rgba(96,165,250,.92) !important; outline-offset:-2px; }

        /* —— 纯净模式：隐藏工具栏、按钮和所有浮层，只保留画面 —— */
        body.rg-pure-mode { background:#000; }
        body.rg-pure-mode .sidebar,
        body.rg-pure-mode header,
        body.rg-pure-mode .top-accent,
        body.rg-pure-mode .mc-hover-ui,
        body.rg-pure-mode .favorite-toggle,
        body.rg-pure-mode .split-toggle,
        body.rg-pure-mode .pill,
        body.rg-pure-mode .name-label,
        body.rg-pure-mode .status-layer,
        body.rg-pure-mode .resizer,
        body.rg-pure-mode .menu-pop,
        body.rg-pure-mode .mc-tooltip { display:none !important; }
        body.rg-pure-mode main { width:100vw; height:100vh; background:#000; }
        body.rg-pure-mode .grid { padding:0 !important; gap:0 !important; background:#000; }
        body.rg-pure-mode .grid.view-focus { padding:0 !important; gap:0 !important; grid-template-areas:'main'; grid-template-rows:minmax(0,1fr) !important; }
        body.rg-pure-mode .grid.view-focus .focused-row { grid-area:main; }
        body.rg-pure-mode .grid.view-focus .thumbs-row { display:none !important; }
        body.rg-pure-mode .cam-card { border:none !important; border-radius:0 !important; box-shadow:none !important; background:#000 !important; outline:none !important; }
        body.rg-pure-mode .cam-video { background:#000 !important; }
        body.rg-pure-mode.pure-cursor-hidden,
        body.rg-pure-mode.pure-cursor-hidden * { cursor:none !important; }
        .pure-exit-chip { display:none; position:fixed; right:10px; bottom:10px; z-index:1000001;
          border:1px solid rgba(255,255,255,.22); background:rgba(0,0,0,.22); color:rgba(255,255,255,.72);
          border-radius:999px; padding:5px 9px; font-size:11px; cursor:pointer; opacity:.10; transition:opacity .15s, background .15s; }
        body.rg-pure-mode .pure-exit-chip { display:block; }
        body.rg-pure-mode .pure-exit-chip:hover,
        body.rg-pure-mode .pure-exit-chip:focus { opacity:1; background:rgba(0,0,0,.55); }

        /* 顶部一抹橙色细线，作为品牌呼应 */
        .top-accent { height:3px; background:linear-gradient(90deg,
          #60a5fa 0%, var(--accent) 35%, #22c55e 100%); flex-shrink:0; }

        /* v15 —— normal multiview product surface: light tone, collapsible shell, continuous layouts */
        body { background:#f3f1ea !important; }
        .app-shell { background:#f3f1ea !important; gap:8px !important; padding:8px !important; }
        main { background:#fbfaf6 !important; border-color:#dedbd2 !important; border-radius:14px !important; }
        .sidebar { background:#fbfaf6 !important; border-color:#dedbd2 !important; border-radius:14px !important; box-shadow:none !important; }
        header { background:#fbfaf6 !important; border-bottom-color:#dedbd2 !important; padding:10px 12px !important; gap:8px !important; }
        .top-accent { display:none !important; }
        .toolbar-group { background:#fffefb !important; border-color:#e3e0d7 !important; border-radius:10px !important; box-shadow:none !important; padding:6px 8px !important; }
        .toolbar-group-title { font-size:11px; line-height:1; font-weight:700; color:#7a7468; margin-right:2px; white-space:nowrap; }
        .ctrl-btn, .ctrl-input { border-radius:9px !important; min-height:34px !important; box-shadow:none !important; }
        .seg { border-radius:9px !important; box-shadow:none !important; }
        .seg button { border-radius:7px !important; }
        .layout-seg button { min-width:38px; }
        .shell-controls { position:fixed; left:10px; top:10px; z-index:1000001; display:flex; gap:6px; pointer-events:auto; }
        .shell-controls button { border:1px solid #dedbd2; background:rgba(255,254,251,.92); color:#334155; border-radius:9px; padding:6px 9px; min-height:30px; font-size:12px; cursor:pointer; box-shadow:0 6px 18px rgba(15,23,42,.08); }
        body:not(.rg-toolbar-collapsed) .shell-controls .show-toolbar-btn { display:none; }
        body:not(.rg-sidebar-collapsed) .shell-controls .show-sidebar-btn { display:none; }
        body.rg-toolbar-collapsed header,
        body.rg-toolbar-collapsed .top-accent { display:none !important; }
        body.rg-sidebar-collapsed .sidebar { display:none !important; }
        body.rg-sidebar-collapsed .app-shell { grid-template-columns:1fr !important; }

        .grid { background:#ece9df !important; padding:10px !important; }
        .grid.view-grid { height:100%; overflow:hidden !important; align-content:stretch !important; align-items:stretch !important; }
        .grid.view-grid .cam-card { border-radius:8px !important; border-color:#d4d0c6 !important; background:#f8f6ee !important; box-shadow:none !important; }
        .cam-card { background:#f8f6ee !important; }
        .cam-video { background:#f8f6ee !important; }
        .status-layer { background:#f8f6ee !important; }
        .cam-card .name-label, .cam-card .pill { background:rgba(255,254,251,.88) !important; color:#334155 !important; border-color:#e3e0d7 !important; box-shadow:none !important; }
        .cam-card .ops-row { bottom:8px !important; }
        .icon-btn { background:rgba(255,254,251,.88) !important; border-color:#e3e0d7 !important; box-shadow:none !important; color:#334155 !important; }
        .icon-btn:hover { background:#fff !important; color:var(--accent) !important; transform:none !important; }

        /* Focus multiview: main top-left, secondary right and bottom; resizers adapt secondaries */
        .grid.view-focus { display:grid !important; height:100% !important; overflow:hidden !important;
          grid-template-columns:minmax(260px,var(--focus-main-w,62fr)) 8px minmax(190px,var(--focus-side-w,38fr)) !important;
          grid-template-rows:minmax(220px,var(--focus-main-h,64fr)) 8px minmax(120px,var(--focus-bottom-h,36fr)) !important;
          grid-template-areas:'main vbar side' 'hbar hbar side' 'bottom bottom side' !important;
          gap:8px !important; padding:10px !important; background:#ece9df !important; }
        .grid.view-focus.no-bottom { grid-template-rows:minmax(0,1fr) !important; grid-template-areas:'main vbar side' !important; }
        .grid.view-focus.no-bottom .focus-bottom-row,
        .grid.view-focus.no-bottom .focus-h-resizer { display:none !important; }
        .grid.view-focus .focused-row { grid-area:main !important; display:grid !important; place-items:stretch !important; min-width:0; min-height:0; overflow:hidden; }
        .grid.view-focus .focus-side-row { grid-area:side; display:grid; grid-auto-flow:row; gap:8px; min-width:0; min-height:0; overflow:hidden; }
        .grid.view-focus .focus-bottom-row { grid-area:bottom; display:grid; grid-auto-flow:column; gap:8px; min-width:0; min-height:0; overflow:hidden; }
        .grid.view-focus .focus-side-row .cam-card,
        .grid.view-focus .focus-bottom-row .cam-card { width:100% !important; height:100% !important; min-height:0 !important; aspect-ratio:auto !important; border-radius:8px !important; }
        .grid.view-focus .focused-row .cam-card { width:100% !important; height:100% !important; max-width:100% !important; max-height:100% !important; border-radius:8px !important; }
        .grid.view-focus .resizer { display:block !important; background:transparent !important; position:relative; z-index:3; }
        .grid.view-focus .focus-v-resizer { grid-area:vbar; cursor:ew-resize; }
        .grid.view-focus .focus-h-resizer { grid-area:hbar; cursor:ns-resize; }
        .grid.view-focus .resizer::before { content:''; position:absolute; inset:0; margin:auto; border-radius:999px; background:#d4d0c6; opacity:.72; transition:opacity .12s, background .12s; }
        .grid.view-focus .focus-v-resizer::before { width:3px; height:52px; }
        .grid.view-focus .focus-h-resizer::before { width:52px; height:3px; }
        .grid.view-focus .resizer:hover::before,
        .grid.view-focus .resizer.dragging::before { background:var(--accent); opacity:1; }
        .grid.view-focus .thumbs-row { display:none !important; }

        body.rg-viewer-mode { background:#f3f1ea !important; }
        body.rg-viewer-mode .app-shell { padding:0 !important; gap:0 !important; background:#f3f1ea !important; }
        body.rg-viewer-mode main { background:#f3f1ea !important; }
        body.rg-viewer-mode .grid { background:#ece9df !important; padding:8px !important; }
        body.rg-viewer-mode .sidebar,
        body.rg-viewer-mode header,
        body.rg-viewer-mode .top-accent { display:none !important; }

        /* v15.1 repairs: reliable collapsed sidebar, wheel-safe controls and readable group contrast */
        .app-shell { display:flex !important; min-width:0 !important; min-height:0 !important; }
        .sidebar { width:220px !important; min-width:220px !important; max-width:220px !important; flex:0 0 220px !important; color:#1f2937 !important; }
        .sidebar.is-collapsed,
        body.rg-sidebar-collapsed .sidebar { display:none !important; width:0 !important; min-width:0 !important; max-width:0 !important; flex:0 0 0 !important; flex-basis:0 !important; padding:0 !important; margin:0 !important; border:0 !important; overflow:hidden !important; }
        body.rg-sidebar-collapsed main { flex:1 1 100% !important; min-width:0 !important; }
        body.rg-toolbar-collapsed header,
        body.rg-toolbar-collapsed .top-accent { display:none !important; }
        .shell-controls { display:flex; align-items:center; }
        body:not(.rg-toolbar-collapsed):not(.rg-sidebar-collapsed) .shell-controls { display:none !important; }
        body.rg-toolbar-collapsed .shell-controls .show-toolbar-btn { display:inline-flex !important; }
        body.rg-sidebar-collapsed .shell-controls .show-sidebar-btn { display:inline-flex !important; }
        .sidebar-brand .title { color:#111827 !important; }
        .sidebar-section-title { color:#5f574a !important; font-weight:800 !important; letter-spacing:.08em !important; }
        .sidebar .group-tab { color:#293241 !important; font-weight:650 !important; background:transparent !important; border-color:transparent !important; }
        .sidebar .group-tab:hover { background:#f1efe7 !important; color:#111827 !important; border-color:#d8d3c5 !important; box-shadow:none !important; }
        .sidebar .group-tab.active { background:#e8efff !important; color:#0f172a !important; border-color:#b8c9ff !important; box-shadow:inset 3px 0 0 #2563eb !important; }
        .sidebar .group-tab > span:first-child { color:inherit !important; }
        .sidebar .group-tab > span:last-child { color:#475569 !important; background:#eee9dc !important; border-color:#d8d3c5 !important; }
        .sidebar .group-tab.active > span:last-child { color:#1d4ed8 !important; background:#dbeafe !important; border-color:#bfdbfe !important; }
        .sidebar-collapse-btn { border:1px solid #d8d3c5; background:#f1efe7; color:#334155; border-radius:8px; padding:4px 8px; font-size:12px; line-height:1.2; cursor:pointer; }
        .sidebar-collapse-btn:hover { background:#e7e2d5; color:#0f172a; border-color:#c9c1b1; }
        .sidebar .group-tab { display:flex !important; align-items:center !important; justify-content:space-between !important; gap:8px !important; }
        .sidebar .group-name { color:inherit !important; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .sidebar .group-count { color:#334155 !important; background:#eee9dc !important; border:1px solid #d8d3c5 !important; border-radius:999px; padding:2px 7px; min-width:26px; text-align:center; font-size:11px; line-height:1.25; font-weight:750; }
        .sidebar .group-tab.active .group-count { color:#1d4ed8 !important; background:#dbeafe !important; border-color:#bfdbfe !important; }
        .sidebar .group-tab[style] { color:#293241 !important; }
        .sidebar-stat { background:#fffefb !important; border-color:#e3e0d7 !important; }
        .sidebar-stat .k { color:#6b6256 !important; }
        .sidebar-stat .v { color:#111827 !important; }
        input[type=range], input[type=number], select { overscroll-behavior:contain; }
        /* v15.3: top controls stay on one row; compact mode hides labels on narrower screens. */
        header { flex-wrap:nowrap !important; overflow-x:auto !important; overflow-y:hidden !important; scrollbar-width:thin; white-space:nowrap; }
        header .toolbar-group { flex-wrap:nowrap !important; flex:0 0 auto !important; align-items:center !important; }
        header .toolbar-spacer { flex-wrap:nowrap !important; flex:0 0 auto !important; margin-left:auto !important; }
        header .ctrl-input { height:34px !important; }
        header select.ctrl-input { max-width:150px; }
        header .roomgrid-compact-select { width:auto !important; min-width:92px; padding-right:24px !important; }
        header .toolbar-group-title { flex:0 0 auto; }
        @media (max-width: 1360px) {
          header { gap:8px !important; padding:10px 12px !important; }
          header .toolbar-group { gap:6px !important; padding:4px 6px !important; }
          header .toolbar-group-title { display:none !important; }
          header .ctrl-input { height:32px !important; padding-top:5px !important; padding-bottom:5px !important; }
          header .ctrl-btn { min-height:32px !important; padding:5px 8px !important; }
          header .ctrl-btn .btn-label { display:none !important; }
          header input[placeholder] { max-width:150px !important; }
          header select.ctrl-input { max-width:118px !important; }
          header input[type=range] { width:72px !important; }
        }

        /* v15.4: interaction polish. Keep core layout intact; make common actions one click and reduce visual jank. */
        .cam-card { backface-visibility:hidden; transform:translateZ(0); }
        .cam-card.rg-card-enter { animation:rg-card-enter .16s ease-out both; }
        @keyframes rg-card-enter { from { opacity:.55; transform:scale(.985); } to { opacity:1; transform:scale(1); } }
        .cam-card .ops-row { transition:opacity .12s ease, transform .12s ease !important; }
        .cam-card .ops-row .icon-btn.quick-op { display:flex !important; }
        .cam-card.tiny .ops-row .icon-btn.quick-optional { display:none !important; }
        .cam-card .ops-row .icon-btn.quick-more { display:flex !important; }
        .cam-card.favorite-online { border-color:#22c55e !important; box-shadow:inset 0 0 0 2px rgba(34,197,94,.28) !important; }
        .cam-card .favorite-toggle {
          position:absolute !important; right:8px !important; bottom:8px !important; z-index:26 !important;
          width:30px !important; height:30px !important; display:flex !important; align-items:center !important; justify-content:center !important;
          border-radius:999px !important; color:#64748b !important; background:rgba(255,254,251,.92) !important;
          border:1px solid rgba(148,163,184,.45) !important; box-shadow:0 3px 12px rgba(15,23,42,.14) !important;
          opacity:.92; cursor:pointer;
        }
        .cam-card .favorite-toggle:hover { color:#d97706 !important; background:#fff !important; transform:translateY(-1px) !important; }
        .cam-card .favorite-toggle.favorite-active { color:#f59e0b !important; background:#fffbeb !important; border-color:#fbbf24 !important; }
        .cam-card .favorite-toggle.favorite-active .svg-icon { fill:currentColor; }
        .cam-card .split-toggle {
          position:absolute !important; right:44px !important; bottom:8px !important; z-index:26 !important;
          width:30px !important; height:30px !important; display:flex !important; align-items:center !important; justify-content:center !important;
          border-radius:999px !important; color:#64748b !important; background:rgba(255,254,251,.92) !important;
          border:1px solid rgba(148,163,184,.45) !important; box-shadow:0 3px 12px rgba(15,23,42,.14) !important;
          opacity:.92; cursor:pointer;
        }
        .cam-card .split-toggle:hover { color:#2563eb !important; background:#eff6ff !important; border-color:#60a5fa !important; transform:translateY(-1px) !important; }
        .cam-card .split-toggle.split-active { color:#fff !important; background:#2563eb !important; border-color:#60a5fa !important; }

        /* v15.9.37: foldable Split View with previews, online-model cycling, and one-handed controls. */
        body.rg-split-mode { overflow:hidden !important; background:#000 !important; }
        body.rg-split-mode .sidebar,
        body.rg-split-mode header,
        body.rg-split-mode .top-accent,
        body.rg-split-mode .shell-controls { display:none !important; }
        body.rg-split-mode .app-shell { width:100vw !important; height:100dvh !important; min-height:0 !important; padding:0 !important; gap:0 !important; }
        body.rg-split-mode main { width:100vw !important; height:100dvh !important; min-width:0 !important; min-height:0 !important; border:0 !important; border-radius:0 !important; background:#000 !important; }
        .grid.view-split {
          position:relative !important; display:grid !important; width:100% !important; height:100% !important; min-height:0 !important;
          padding:max(4px, env(safe-area-inset-top)) max(4px, env(safe-area-inset-right)) max(4px, env(safe-area-inset-bottom)) max(4px, env(safe-area-inset-left)) !important;
          gap:0 !important; overflow:hidden !important; background:#000 !important;
          grid-template-columns:minmax(0, var(--split-ratio, 50%)) 8px minmax(0, 1fr) !important;
          grid-template-rows:minmax(0, 1fr) !important;
        }
        .grid.view-split .split-pane { position:relative; min-width:0; min-height:0; overflow:hidden; background:#000; }
        .grid.view-split .split-pane .cam-card { width:100% !important; height:100% !important; min-width:0 !important; min-height:0 !important; border:0 !important; border-radius:0 !important; aspect-ratio:auto !important; }
        .grid.view-split .split-pane .favorite-toggle,
        .grid.view-split .split-pane .split-toggle { display:none !important; }
        .grid.view-split .split-divider { position:relative; z-index:45; background:#111827; cursor:ew-resize; touch-action:none; }
        .grid.view-split .split-divider::after { content:''; position:absolute; inset:0; margin:auto; width:3px; height:48px; max-height:60%; border-radius:999px; background:rgba(255,255,255,.48); }
        .grid.view-split .split-divider.dragging::after { background:#60a5fa; }
        .split-pane-controls { position:absolute; left:8px; right:8px; bottom:8px; z-index:55; display:flex; align-items:center; justify-content:space-between; gap:8px; pointer-events:none; }
        .split-pane-controls .split-pane-label { max-width:55%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding:7px 10px; border-radius:999px; background:rgba(0,0,0,.58); color:#fff; font-size:12px; font-weight:750; backdrop-filter:blur(8px); }
        .split-pane-actions { display:flex; gap:6px; pointer-events:auto; }
        .split-pane-actions button,
        .split-toolbar button { min-width:42px; min-height:42px; display:inline-flex; align-items:center; justify-content:center; gap:6px; border:1px solid rgba(255,255,255,.22); border-radius:12px; background:rgba(15,23,42,.70); color:#fff; font:700 12px/1 system-ui,sans-serif; backdrop-filter:blur(10px); cursor:pointer; }
        .split-pane-actions button:hover,
        .split-pane-actions button.active,
        .split-toolbar button:hover { background:#2563eb; border-color:#60a5fa; }
        .split-pane-actions button:disabled { opacity:.38; cursor:not-allowed; background:rgba(15,23,42,.55); border-color:rgba(255,255,255,.14); }
        .split-toolbar { position:absolute; top:max(8px, env(safe-area-inset-top)); left:50%; z-index:60; display:flex; gap:6px; transform:translateX(-50%); padding:5px; border-radius:14px; background:rgba(0,0,0,.34); backdrop-filter:blur(10px); opacity:1; transition:opacity .2s ease, transform .2s ease; will-change:opacity,transform; }
        .split-toolbar.is-hidden { opacity:0; transform:translate(-50%,-10px); pointer-events:none; }
        .split-toolbar.position-lower-left { top:auto; bottom:max(64px, calc(env(safe-area-inset-bottom) + 56px)); left:max(8px, env(safe-area-inset-left)); right:auto; transform:none; }
        .split-toolbar.position-lower-right { top:auto; bottom:max(64px, calc(env(safe-area-inset-bottom) + 56px)); left:auto; right:max(8px, env(safe-area-inset-right)); transform:none; }
        .split-toolbar.position-lower-left.is-hidden,
        .split-toolbar.position-lower-right.is-hidden { transform:translateY(10px); }
        .split-toolbar .split-exit { background:rgba(185,28,28,.78); }
        .split-picker-row { display:grid; grid-template-columns:minmax(0,1fr) 46px; gap:6px; align-items:stretch; }
        .split-picker-row .split-picker-select { display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:10px; min-height:46px; width:100%; text-align:left; }
        .split-picker-preview-btn { min-width:44px; padding:0 !important; display:inline-flex; align-items:center; justify-content:center; }
        .split-quick-preview { display:none; margin-bottom:10px; padding:10px; border:1px solid var(--border); border-radius:12px; background:#f8fafc; }
        .split-quick-preview.is-open { display:block; }
        .split-preview-frame { position:relative; width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:10px; background:linear-gradient(135deg,#111827,#334155); }
        .split-preview-frame img { width:100%; height:100%; display:block; object-fit:contain; background:#05070a; }
        .split-preview-status { position:absolute; inset:auto 8px 8px; padding:6px 9px; border-radius:999px; background:rgba(0,0,0,.62); color:#fff; font-size:11px; font-weight:750; backdrop-filter:blur(6px); }
        .split-preview-head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }
        .split-preview-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:850; }
        .split-preview-actions { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:6px; margin-top:8px; }
        @media (prefers-reduced-motion: reduce) { .split-toolbar { transition:none; } }
        @media (orientation:portrait), (max-aspect-ratio:1/1) {
          .grid.view-split { grid-template-columns:minmax(0,1fr) !important; grid-template-rows:minmax(0, var(--split-ratio, 50%)) 8px minmax(0,1fr) !important; }
          .grid.view-split .split-divider { cursor:ns-resize; }
          .grid.view-split .split-divider::after { width:48px; height:3px; max-width:60%; }
        }
        @media (max-width:520px) {
          .split-pane-controls { left:6px; right:6px; bottom:6px; }
          .split-pane-controls .split-pane-label { max-width:42%; font-size:11px; }
          .split-pane-actions button, .split-toolbar button { min-width:44px; min-height:44px; }
          .split-toolbar .btn-label { display:none; }
        }
        .cam-card .ops-row .icon-btn:active,
        .ctrl-btn:active,
        .group-tab:active { transform:scale(.96) !important; }
        /* v15.9.26: keep the workstation usable in short/zoomed windows. */
        html { min-height:100%; overflow-y:auto; }
        body { min-height:100vh; overflow-x:hidden !important; overflow-y:auto !important; }
        .app-shell { min-height:640px !important; }
        .grid.view-grid { overflow:auto !important; overscroll-behavior:contain; }
        body.rg-pure-mode,
        body.rg-viewer-mode,
        body.rg-focus-mode { overflow:hidden !important; }
        body.rg-pure-mode .app-shell,
        body.rg-viewer-mode .app-shell,
        body.rg-focus-mode .app-shell { height:100vh !important; min-height:0 !important; }
        .grid.view-focus .focus-side-row .cam-card,
        .grid.view-focus .focus-bottom-row .cam-card { cursor:pointer; transition:border-color .12s ease, transform .12s ease, opacity .12s ease; }
        .grid.view-focus .focus-side-row .cam-card:hover,
        .grid.view-focus .focus-bottom-row .cam-card:hover { transform:translateY(-1px); border-color:rgba(37,99,235,.62) !important; }
        .roomgrid-modal-backdrop { position:fixed; inset:0; z-index:1000003; display:flex; align-items:center; justify-content:center; padding:18px; background:rgba(15,23,42,.40); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); }
        .roomgrid-modal { width:min(560px, calc(100vw - 36px)); background:#fffefb; border:1px solid #e3e0d7; border-radius:14px; box-shadow:0 22px 80px rgba(15,23,42,.24); padding:14px; color:#111827; }
        .roomgrid-modal-title { font-size:15px; font-weight:800; margin-bottom:6px; }
        .roomgrid-modal-hint { font-size:12px; line-height:1.45; color:#64748b; margin-bottom:10px; }
        .roomgrid-modal-textarea { width:100%; min-height:220px; resize:vertical; border:1px solid #dedbd2; border-radius:10px; padding:10px; outline:none; font:13px/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background:#fff; color:#111827; }
        .roomgrid-modal-textarea:focus { border-color:rgba(37,99,235,.45); box-shadow:0 0 0 3px rgba(37,99,235,.10); }
        .roomgrid-modal-count { margin-top:8px; font-size:12px; color:#64748b; }
        .roomgrid-modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }

        /* v15.10: continuous grid, compact navigation, and automatic phone workspace. */
        .grid.view-grid { overflow-x:hidden !important; overflow-y:auto !important; align-content:start !important; scroll-behavior:smooth; scrollbar-gutter:stable; }
        .sidebar-search { width:100% !important; min-height:38px; margin:5px 0 3px; }
        .sidebar-section-spaced { margin-top:10px !important; }
        .sidebar-group-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:4px; align-items:stretch; }
        .sidebar-group-row > .group-tab { min-width:0; width:100%; }
        .sidebar-group-more { width:34px; min-width:34px; border:1px solid transparent; border-radius:8px; background:transparent; color:#64748b; cursor:pointer; font-weight:850; }
        .sidebar-group-more:hover { background:#f1efe7; border-color:#d8d3c5; color:#111827; }
        .sidebar-summary { margin-top:auto; padding:10px 8px 4px; color:#64748b; font-size:12px; font-weight:650; }
        .sidebar-footer { display:grid; grid-template-columns:1fr 1fr; gap:6px; padding-top:4px; }
        .sidebar-footer .ctrl-btn { justify-content:center; min-width:0; }
        .grid.view-focus .focus-side-row { overflow-y:auto !important; overflow-x:hidden !important; align-content:start !important; overscroll-behavior:contain; padding-right:2px; }
        .grid.view-focus .focus-bottom-row,
        .grid.view-focus .focus-h-resizer { display:none !important; }

        body.rg-phone-device .ctrl-btn,
        body.rg-phone-device .icon-btn,
        body.rg-phone-device .group-tab,
        body.rg-phone-mode .ctrl-btn,
        body.rg-phone-mode .icon-btn,
        body.rg-phone-mode .group-tab { min-height:44px !important; }
        body.rg-phone-device .cam-card .ops-row,
        body.rg-phone-mode .cam-card .ops-row { opacity:1 !important; pointer-events:auto !important; transform:translateX(-50%) translateY(0) !important; }
        body.rg-phone-mode { width:100vw; height:100dvh; min-height:0 !important; overflow:hidden !important; background:#ece9df !important; }
        body.rg-phone-mode .app-shell { width:100vw !important; height:100dvh !important; min-height:0 !important; padding:max(3px,env(safe-area-inset-top)) max(3px,env(safe-area-inset-right)) max(3px,env(safe-area-inset-bottom)) max(3px,env(safe-area-inset-left)) !important; gap:0 !important; }
        body.rg-phone-mode main { position:relative; z-index:1; width:100% !important; height:100% !important; min-width:0 !important; min-height:0 !important; border-radius:10px !important; }
        body.rg-phone-mode header { position:relative; z-index:20; flex:0 0 auto; isolation:isolate; padding:5px 6px !important; gap:5px !important; min-height:52px; scrollbar-width:none; touch-action:pan-x; }
        body.rg-phone-mode header::-webkit-scrollbar { display:none; }
        body.rg-phone-mode header .toolbar-group { padding:2px 3px !important; gap:4px !important; }
        body.rg-phone-mode header .toolbar-group-title,
        body.rg-phone-mode header .btn-label { display:none !important; }
        body.rg-phone-mode header .ctrl-input { min-height:42px !important; max-width:112px !important; }
        body.rg-phone-mode .grid.view-phone { position:relative; z-index:1; padding:4px !important; gap:4px !important; min-height:0 !important; overflow-x:hidden !important; overflow-y:auto !important; overscroll-behavior:contain; scrollbar-gutter:auto; }
        body.rg-phone-mode .grid.view-phone .cam-card { border-radius:8px !important; }
        body.rg-phone-mode .sidebar { position:fixed !important; z-index:2147483000 !important; inset:max(4px,env(safe-area-inset-top)) auto max(4px,env(safe-area-inset-bottom)) max(4px,env(safe-area-inset-left)) !important; height:auto !important; border-radius:14px !important; box-shadow:0 22px 70px rgba(15,23,42,.32) !important; pointer-events:auto !important; touch-action:pan-y; overscroll-behavior:contain; }
        body.rg-phone-mode.rg-sidebar-collapsed .sidebar { display:none !important; }
        /* The base rule uses top:10px. Reset it here before anchoring to the
           phone safe-area bottom; otherwise the transparent flex box stretches
           across the viewport, centres Groups between cards, and intercepts taps. */
        body.rg-phone-mode .shell-controls { position:fixed !important; top:auto !important; right:auto !important; bottom:max(8px,env(safe-area-inset-bottom)) !important; left:max(8px,env(safe-area-inset-left)) !important; width:auto !important; height:auto !important; z-index:2147483500 !important; align-items:center !important; pointer-events:none !important; }
        body.rg-phone-mode .shell-controls button { min-width:48px; min-height:48px; padding:8px 12px; border-radius:14px; pointer-events:auto !important; touch-action:manipulation; }
        body.rg-phone-mode .shell-controls .show-sidebar-btn { width:48px; padding:0; font-size:0; }
        body.rg-phone-mode .shell-controls .show-sidebar-btn::before { content:'☰'; font-size:22px; line-height:1; }
        body.rg-phone-mode .roomgrid-modal-backdrop { align-items:flex-end; padding:0; }
        body.rg-phone-mode .roomgrid-modal { width:100%; max-height:88dvh; overflow-y:auto; border-radius:16px 16px 0 0; padding-bottom:max(14px,env(safe-area-inset-bottom)); }
        @media (orientation:landscape) and (max-height:600px) {
          body.rg-phone-mode header { min-height:46px; padding:2px 5px !important; }
          body.rg-phone-mode header .ctrl-btn,
          body.rg-phone-mode header .ctrl-input { min-height:38px !important; height:38px !important; }
          body.rg-phone-mode .cam-card .favorite-toggle,
          body.rg-phone-mode .cam-card .split-toggle { width:28px !important; height:28px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cam-card, .ctrl-btn, .icon-btn, .group-tab, .menu-pop, .mc-tooltip { transition:none !important; animation:none !important; }
        }
      `),
    }));

    // ---- 布局骨架 ----
    const sidebar = $('aside', { class: 'sidebar', style: {
      width: '248px', background: 'linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.78))', border: '1px solid var(--border)',
      borderRadius: '18px', padding: '14px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px',
      flexShrink: '0', transition: 'width .2s, padding .2s', boxShadow: 'var(--shadow-md)',
    } });

    const main = $('main', { style: { flex: '1', display: 'flex', flexDirection: 'column', minWidth: '0', background: 'linear-gradient(180deg, rgba(255,255,255,.82), rgba(255,255,255,.72))', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' } });
    const topAccent = $('div', { class: 'top-accent' });
    const toolbar = $('header', { style: {
      padding: '14px 16px', background: 'transparent',
      borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center',
      flexWrap: 'nowrap', flexShrink: '0', overflowX: 'auto', overflowY: 'hidden',
    } });
    const grid = $('section', { class: 'grid view-grid', style: {
      flex: '1', overflowY: 'auto', padding: '16px',
    } });

    main.append(topAccent, toolbar, grid);
    document.body.append($('div', { class: 'app-shell' }, [sidebar, main]));

    const toastHost = $('div', { style: { position: 'fixed', right: '16px', top: '16px', zIndex: '1000000', display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' } });
    document.body.appendChild(toastHost);
    function toast(msg) {
      const el = $('div', { style: { maxWidth: '360px', background: 'rgba(17,24,39,.88)', color: '#fff', padding: '9px 12px', borderRadius: '8px', boxShadow: 'var(--shadow-md)', fontSize: '12px', lineHeight: '1.35' } }, String(msg || ''));
      toastHost.appendChild(el);
      setTimeout(() => { try { el.style.opacity = '0'; el.style.transform = 'translateY(-4px)'; el.style.transition = 'opacity .18s, transform .18s'; } catch (_) {} }, 2200);
      setTimeout(() => { try { el.remove(); } catch (_) {} }, 2600);
    }

    function installHintSystem() {
      let tooltip = null;
      let timer = 0;
      let activeEl = null;

      const autoText = (el) => {
        if (!el) return '';
        const explicit = el.dataset?.hint || el.getAttribute?.('aria-label') || el.title;
        if (explicit) return explicit;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return el.placeholder || '';
        if (el.tagName === 'SELECT') return el.title || t('hintSort');
        if (el.tagName === 'BUTTON') return (el.textContent || '').replace(/\s+/g, ' ').trim();
        return '';
      };

      const ensure = (el) => {
        const text = autoText(el);
        if (text) setElementHint(el, text);
        return text;
      };

      const fill = (root = document.body) => {
        try {
          root.querySelectorAll('button,input,select,textarea,[title]').forEach(el => ensure(el));
        } catch (_) {}
      };

      const hide = () => {
        clearTimeout(timer);
        timer = 0;
        activeEl = null;
        if (tooltip) { try { tooltip.remove(); } catch (_) {} tooltip = null; }
      };

      const show = (el) => {
        if (!el || el.disabled || document.body.classList.contains('rg-pure-mode')) return;
        const text = ensure(el);
        if (!text) return;
        if (!tooltip) tooltip = $('div', { class: 'mc-tooltip' });
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        const rect = el.getBoundingClientRect();
        const tw = Math.min(tooltip.offsetWidth || 240, window.innerWidth - 24);
        let left = Math.max(8, Math.min(window.innerWidth - tw - 8, rect.left + rect.width / 2 - tw / 2));
        let top = rect.bottom + 8;
        if (top + (tooltip.offsetHeight || 32) > window.innerHeight - 8) top = Math.max(8, rect.top - (tooltip.offsetHeight || 32) - 8);
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        requestAnimationFrame(() => tooltip?.classList.add('show'));
      };

      const schedule = (el) => {
        clearTimeout(timer);
        activeEl = el;
        timer = setTimeout(() => show(el), 420);
      };

      document.addEventListener('pointerover', (e) => {
        const el = e.target?.closest?.('button,input,select,textarea,[data-hint],[title]');
        if (!el || el === activeEl) return;
        schedule(el);
      }, true);
      document.addEventListener('pointerout', (e) => {
        if (!activeEl) return;
        if (!activeEl.contains(e.relatedTarget)) hide();
      }, true);
      document.addEventListener('focusin', (e) => {
        const el = e.target?.closest?.('button,input,select,textarea,[data-hint],[title]');
        if (el) schedule(el);
      }, true);
      document.addEventListener('focusout', hide, true);
      document.addEventListener('click', hide, true);
      window.addEventListener('scroll', hide, true);
      try {
        const mo = new MutationObserver(ms => {
          for (const m of ms) for (const n of m.addedNodes || []) if (n.nodeType === 1) fill(n);
        });
        mo.observe(document.body, { childList: true, subtree: true });
      } catch (_) {}
      fill(document.body);
    }
    installHintSystem();

    function installWheelInputGuard() {
      const isGuarded = (el) => {
        if (!el || !el.closest) return false;
        const target = el.closest('input, select, textarea');
        if (!target) return false;
        const tag = target.tagName;
        const type = String(target.getAttribute('type') || '').toLowerCase();
        return tag === 'SELECT' || type === 'range' || type === 'number';
      };
      document.addEventListener('wheel', (e) => {
        if (!isGuarded(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        const target = e.target.closest('input, select, textarea');
        // 浏览器默认会用滚轮改 range / number / select 的值，进而触发整页重排；这里直接阻断。
        try { target.blur(); } catch (_) {}
      }, { capture: true, passive: false });
    }
    installWheelInputGuard();

    const recordings = new Map();
    const recordingLog = [];
    const pureExitChip = $('button', {
      class: 'pure-exit-chip',
      title: t('pureExitHint'),
      onclick: () => setPureMode(false),
    }, t('pureExitChip'));
    document.body.appendChild(pureExitChip);

    const shellControls = $('div', { class: 'shell-controls' });
    function setSidebarCollapsed(nextCollapsed) {
      const collapsed = !!nextCollapsed;
      document.body.classList.toggle('rg-sidebar-collapsed', collapsed);
      sidebar.classList.toggle('is-collapsed', collapsed);
      store.patchSettings({ sidebarCollapsed: collapsed });
    }

    const showToolbarBtn = $('button', {
      class: 'show-toolbar-btn',
      type: 'button',
      title: LANG === 'zh' ? '显示顶部工具栏' : 'Show toolbar',
      onclick: () => { document.body.classList.remove('rg-toolbar-collapsed'); store.patchSettings({ toolbarCollapsed: false }); },
    }, LANG === 'zh' ? '工具' : 'Tools');
    const showSidebarBtn = $('button', {
      class: 'show-sidebar-btn',
      type: 'button',
      title: LANG === 'zh' ? '显示左侧分组' : 'Show sidebar',
      'aria-label': LANG === 'zh' ? '显示左侧分组' : 'Show groups menu',
      onclick: (event) => { event.stopPropagation(); setSidebarCollapsed(false); },
    }, LANG === 'zh' ? '分组' : 'Groups');
    shellControls.append(showToolbarBtn, showSidebarBtn);
    document.body.appendChild(shellControls);
    function syncShellControls() {
      if (!shellControls) return;
      const hidden = !!store.state.settings.pureMode || !!store.state.settings.viewerMode || !!store.state.settings.splitViewActive;
      shellControls.style.display = hidden ? 'none' : 'flex';
    }

    let pureCursorTimer = 0;
    function closeTransientUi() {
      document.querySelectorAll('.menu-pop,.mc-tooltip').forEach(el => { try { el.remove(); } catch (_) {} });
    }
    function applyPureModeState() {
      const on = !!store.state.settings.pureMode;
      const viewerOn = !!store.state.settings.viewerMode && !on;
      const splitOn = !!store.state.settings.splitViewActive && !on && !viewerOn;
      const phoneOn = store.state.settings.viewMode === 'phone' && !on && !viewerOn && !splitOn;
      const focusOn = store.state.settings.viewMode === 'focus' && !on && !viewerOn && !splitOn;
      const thumbsCollapsed = !!store.state.settings.focusThumbsCollapsed;
      const videoFit = store.state.settings.videoFit === 'cover' ? 'cover' : 'contain';
      document.body.classList.toggle('rg-pure-mode', on);
      document.body.classList.toggle('rg-viewer-mode', viewerOn);
      document.body.classList.toggle('rg-toolbar-collapsed', !!store.state.settings.toolbarCollapsed && !on && !viewerOn);
      document.body.classList.toggle('rg-sidebar-collapsed', !!store.state.settings.sidebarCollapsed && !on && !viewerOn);
      document.body.classList.toggle('rg-focus-thumbs-collapsed', thumbsCollapsed);
      document.body.classList.toggle('rg-video-cover', videoFit === 'cover');
      document.body.classList.toggle('rg-video-contain', videoFit !== 'cover');
      document.body.classList.toggle('rg-focus-mode', focusOn);
      document.body.classList.toggle('rg-phone-mode', phoneOn);
      document.body.classList.toggle('rg-split-mode', splitOn);
      const hideSidebar = splitOn || on || viewerOn || focusOn || !!store.state.settings.sidebarCollapsed;
      sidebar.style.setProperty('display', hideSidebar ? 'none' : 'flex', 'important');
      if (splitOn) requestAnimationFrame(() => window.scrollTo(0, 0));
      syncShellControls?.();
      document.body.classList.remove('pure-cursor-hidden');
      setElementHint(pureExitChip, t('pureExitHint'));
      pureExitChip.textContent = t('pureExitChip');
      if (typeof pureModeBtn !== 'undefined' && pureModeBtn) {
        setTrustedHtml(pureModeBtn, trustedHtml(iconLabel('clean', on ? t('pureModeOff') : t('pureMode'))));
        pureModeBtn.classList.toggle('primary', on);
        setElementHint(pureModeBtn, on ? t('pureModeOff') + ' · Alt+P/C' : t('pureModeHint'));
      }
      if (typeof viewerModeBtn !== 'undefined' && viewerModeBtn) {
        setTrustedHtml(viewerModeBtn, trustedHtml(iconLabel('focus', viewerOn ? t('viewerModeOff') : t('viewerMode'))));
        viewerModeBtn.classList.toggle('primary', viewerOn);
        setElementHint(viewerModeBtn, viewerOn ? t('viewerModeOff') + ' · Alt+V' : t('viewerModeHint'));
      }
      if (typeof focusThumbToggleBtn !== 'undefined' && focusThumbToggleBtn) {
        setTrustedHtml(focusThumbToggleBtn, trustedHtml(iconLabel('grid', thumbsCollapsed ? t('focusThumbsShow') : t('focusThumbsHide'))));
        focusThumbToggleBtn.classList.toggle('primary', !thumbsCollapsed && store.state.settings.viewMode === 'focus');
        setElementHint(focusThumbToggleBtn, t('focusThumbsHint'));
      }
      if (typeof videoFitBtn !== 'undefined' && videoFitBtn) {
        setTrustedHtml(videoFitBtn, trustedHtml(iconLabel('expand', videoFit === 'cover' ? t('videoFitCover') : t('videoFitContain'))));
        videoFitBtn.classList.toggle('primary', videoFit === 'cover');
        setElementHint(videoFitBtn, t('videoFitHint'));
      }
      if (typeof splitViewBtn !== 'undefined' && splitViewBtn) syncSplitButton();
      if (on) closeTransientUi();
      requestAnimationFrame(() => { applyGridSize(); applyFocusMainSizing(); });
    }
    function setPureMode(on) {
      store.patchSettings({ pureMode: !!on });
      if (on) toast(t('pureModeOn') + ' · Alt+P/C / Esc');
    }
    function togglePureMode() { setPureMode(!store.state.settings.pureMode); }
    function toggleViewerMode() { store.patchSettings({ viewerMode: !store.state.settings.viewerMode }); }
    function toggleFocusThumbs() { store.patchSettings({ focusThumbsCollapsed: !store.state.settings.focusThumbsCollapsed }); }
    function toggleVideoFit() { store.patchSettings({ videoFit: store.state.settings.videoFit === 'cover' ? 'contain' : 'cover' }); }
    function bumpPureCursor() {
      if (!store.state.settings.pureMode) return;
      document.body.classList.remove('pure-cursor-hidden');
      clearTimeout(pureCursorTimer);
      pureCursorTimer = setTimeout(() => {
        if (store.state.settings.pureMode) document.body.classList.add('pure-cursor-hidden');
      }, 1800);
    }
    document.addEventListener('mousemove', bumpPureCursor, true);
    document.addEventListener('pointerdown', bumpPureCursor, true);

    const patchSettingsSoft = (() => {
      let pending = {};
      const flush = debounce(() => {
        const patch = pending;
        pending = {};
        if (Object.keys(patch).length) store.patchSettings(patch);
      }, 180);
      return (patch) => { Object.assign(pending, patch || {}); flush(); };
    })();

    // ---- Toolbar 渲染 ----
    const tbInput = $('input', {
      class: 'ctrl-input', placeholder: t('addPlaceholder'), title: t('hintAddInput'),
      style: { width: '200px' },
      onpaste: (e) => {
        setTimeout(() => {
          const raw = String(e.target.value || '');
          const parts = raw.split(/[\s,;，；]+/).map(x => x.trim()).filter(Boolean);
          if (parts.length <= 1) return;
          const r = importUsernameList(parts);
          e.target.value = '';
          toast(t('manualImportDone', r.added, r.exists));
        }, 0);
      },
      onkeypress: (e) => {
        if (e.key === 'Enter') {
          const v = normalizeUsername(e.target.value);
          if (!v) return;
          if (!isLikelyUsername(v)) { toast(t('invalidUsername')); return; }
          if (store.addRoom(v)) service.start(v);
          e.target.value = '';
        }
      },
    });

    const searchInput = $('input', {
      class: 'ctrl-input',
      placeholder: t('searchPlaceholder'), title: t('hintSearchInput'),
      value: store.state.settings.searchQuery || '',
      style: { width: '150px' },
      oninput: debounce((e) => store.patchSettings({ searchQuery: normalizeUsername(e.target.value), pageIndex: 0 }), 80),
    });

    const tempUrlBtn = $('button', {
      class: 'ctrl-btn',
      title: LANG === 'zh' ? '导入临时 URL，刷新后消失，不保存到配置' : 'Import temporary URLs; they disappear after refresh',
      onclick: () => importTemporaryUrls(),
    }, LANG === 'zh' ? '导入URL' : 'URL');

    const mkToggle = (label, key, sub = false) => {
      const cb = $('input', { type: 'checkbox', checked: sub ? store.state.settings.filter[key] : store.state.settings[key],
        onchange: (e) => sub ? store.update(s => { s.settings.filter[key] = e.target.checked; s.settings.pageIndex = 0; }, 'settings') : store.patchSettings({ [key]: e.target.checked, pageIndex: 0 }) });
      return $('label', { class: 'toggle', title: String(label).replace(/^[^\p{L}\p{N}]+/u, '').trim() || String(label) }, [cb, label]);
    };

    function filterModeFromState() {
      const f = store.state.settings.filter || {};
      if (f.onlyOnline) return 'online';
      if (f.hideOffline && f.hidePrivate) return 'hideOfflinePrivate';
      if (f.hideOffline) return 'hideOffline';
      if (f.hidePrivate) return 'hidePrivate';
      return 'all';
    }
    function applyFilterMode(mode) {
      const next = { hideOffline: false, hidePrivate: false, onlyOnline: false };
      if (mode === 'online') next.onlyOnline = true;
      else if (mode === 'hideOffline') next.hideOffline = true;
      else if (mode === 'hidePrivate') next.hidePrivate = true;
      else if (mode === 'hideOfflinePrivate') { next.hideOffline = true; next.hidePrivate = true; }
      store.update(s => { Object.assign(s.settings.filter, next); s.settings.pageIndex = 0; }, 'settings:filter,pageIndex');
    }
    const filterSel = $('select', {
      class: 'ctrl-input roomgrid-compact-select',
      title: LANG === 'zh' ? '筛选当前分组' : 'Filter current group',
      onchange: (e) => applyFilterMode(e.target.value),
    }, [
      $('option', { value: 'all' }, LANG === 'zh' ? '全部状态' : 'All status'),
      $('option', { value: 'online' }, t('onlyOnline')),
      $('option', { value: 'hideOffline' }, t('hideOffline')),
      $('option', { value: 'hidePrivate' }, t('hidePrivate')),
      $('option', { value: 'hideOfflinePrivate' }, LANG === 'zh' ? '隐藏离线/私密' : 'Hide offline/private'),
    ]);
    filterSel.value = filterModeFromState();

    const sortSel = $('select', {
      class: 'ctrl-input',
      title: t('hintSort'),
      style: { padding: '6px 8px' },
      onchange: (e) => store.patchSettings({ sortBy: e.target.value, pageIndex: 0 }),
    }, [
      $('option', { value: 'manual' }, t('sortManual')),
      $('option', { value: 'status' }, t('sortStatus')),
      $('option', { value: 'name' }, t('sortName')),
      $('option', { value: 'addedAt' }, t('sortAdded')),
    ]);
    sortSel.value = store.state.settings.sortBy;

    const refreshAllBtn = $('button', {
      class: 'ctrl-btn primary',
      title: t('refreshAll') + ' · R',
      style: { cursor: 'pointer' },
      onclick: () => service.refreshAll(),
      html: trustedHtml(iconLabel('refresh', t('refreshAll'))),
    });

    const sidebarToggleBtn = $('button', {
      class: 'ctrl-btn sidebar-toggle-btn',
      type: 'button',
      title: t('hintSidebarToggle'),
      'aria-label': LANG === 'zh' ? '切换分组菜单' : 'Toggle groups menu',
      style: { cursor: 'pointer', minWidth: '38px', padding: '6px 10px' },
      onclick: (event) => { event.stopPropagation(); setSidebarCollapsed(!store.state.settings.sidebarCollapsed); },
      html: trustedHtml(iconSvg('menu', 16)),
    });

    const toolbarCollapseBtn = $('button', {
      class: 'ctrl-btn',
      title: LANG === 'zh' ? '收起顶部工具栏' : 'Collapse toolbar',
      style: { cursor: 'pointer', minWidth: '38px', padding: '6px 10px' },
      onclick: () => store.patchSettings({ toolbarCollapsed: true }),
    }, LANG === 'zh' ? '收起' : 'Hide');

    // —— 视图模式：使用 select 减少顶部按钮数量 —— //
    function setViewMode(mode) {
      if (mode === 'phone') {
        store.patchSettings({ viewMode: 'phone', phoneModeAuto: true, sidebarCollapsed: true });
        return;
      }
      const phoneOverride = phoneEnvironment ? { phoneModeAuto: false } : {};
      if (mode !== 'focus') { store.patchSettings({ viewMode: 'grid', ...phoneOverride }); return; }
      if (!store.state.settings.focusedRoomId) {
        const vr = visibleRooms();
        const first = vr.find(r => r.lastStatus === 'online') || vr[0];
        if (first) store.patchSettings({ viewMode: 'focus', focusedRoomId: first.id, focusThumbsCollapsed: false, ...phoneOverride });
        else store.patchSettings({ viewMode: 'focus', focusThumbsCollapsed: false, ...phoneOverride });
      } else {
        store.patchSettings({ viewMode: 'focus', focusThumbsCollapsed: false, ...phoneOverride });
      }
    }
    const viewModeSel = $('select', {
      class: 'ctrl-input roomgrid-compact-select',
      title: t('viewModeLabel') + ' · G/F',
      onchange: (e) => setViewMode(e.target.value),
    }, [
      $('option', { value: 'grid' }, t('viewGrid')),
      $('option', { value: 'focus' }, t('viewFocus')),
      $('option', { value: 'phone' }, t('viewPhone')),
    ]);
    function syncViewSeg() {
      viewModeSel.value = ['grid', 'focus', 'phone'].includes(store.state.settings.viewMode) ? store.state.settings.viewMode : 'grid';
    }
    syncViewSeg();

    const layoutSel = $('select', {
      class: 'ctrl-input roomgrid-compact-select',
      title: t('visibleRooms'),
      onchange: (e) => {
        const key = store.state.settings.viewMode === 'phone' ? 'phoneLayoutSize' : 'layoutSize';
        store.patchSettings({ [key]: Number(e.target.value), pageIndex: 0 });
      },
    }, [2, 4, 6, 9].map(n => $('option', { value: String(n) }, LANG === 'zh' ? `单屏 ${n}` : `${n} visible`)));
    layoutSel.value = String(store.state.settings.layoutSize || 4);

    // 全局音量
    const volSlider = $('input', {
      type: 'range', min: '0', max: '100', value: String(store.state.settings.volume * 100), title: t('hintVolume'),
      style: { width: '90px', cursor: 'pointer', accentColor: 'var(--accent)' },
      oninput: (e) => {
        const v = Number(e.target.value) / 100;
        store.state.settings.volume = v;
        patchSettingsSoft({ volume: v });
        requestAnimationFrame(() => store.state.rooms.forEach(r => applyMute(r.id)));
      },
      onchange: (e) => store.patchSettings({ volume: Number(e.target.value) / 100 }),
    });
    const volLabel = $('span', { style: { fontSize: '14px', color: 'var(--text-muted)', display:'inline-flex', alignItems:'center' }, html: trustedHtml(iconSvg('volume', 15)) });

    // 网格大小
    const sizeSlider = $('input', {
      type: 'range', min: '220', max: '900', value: String(store.state.settings.gridSize), title: t('hintGridSize'),
      style: { width: '110px', cursor: 'pointer', accentColor: 'var(--accent)' },
      oninput: (e) => {
        const gridSize = parseInt(e.target.value, 10);
        store.state.settings.gridSize = gridSize;
        patchSettingsSoft({ gridSize });
        applyGridSize();
      },
      onchange: (e) => store.patchSettings({ gridSize: parseInt(e.target.value, 10) }),
    });

    const focusScaleSlider = $('input', {
      type: 'range', min: '78', max: '94', value: String(store.state.settings.focusMainPct || 84),
      title: t('hintMainRatio'),
      style: { width: '95px', cursor: 'pointer', accentColor: 'var(--accent)' },
      oninput: (e) => {
        const focusMainPct = parseInt(e.target.value, 10);
        store.state.settings.focusMainPct = focusMainPct;
        patchSettingsSoft({ focusMainPct });
        applyGridSize();
        applyFocusMainSizing();
      },
      onchange: (e) => store.patchSettings({ focusMainPct: parseInt(e.target.value, 10) }),
    });

    const focusAspectSel = $('select', {
      class: 'ctrl-input',
      title: t('hintMainAspect'),
      style: { padding: '6px 8px', width: '86px' },
      onchange: (e) => {
        store.patchSettings({ focusAspect: e.target.value });
        applyFocusMainSizing();
      },
    }, [
      $('option', { value: 'auto' }, LANG === 'zh' ? '自适应' : 'Auto'),
      $('option', { value: '16:9' }, '16:9'),
      $('option', { value: '4:3' }, '4:3'),
      $('option', { value: '1:1' }, '1:1'),
      $('option', { value: '9:16' }, '9:16'),
    ]);
    focusAspectSel.value = store.state.settings.focusAspect || 'auto';

    const focusThumbSlider = $('input', {
      type: 'range', min: '96', max: '260', value: String(store.state.settings.focusThumbSize || 150),
      title: t('hintThumbSize'),
      style: { width: '80px', cursor: 'pointer', accentColor: 'var(--accent)' },
      oninput: (e) => {
        const focusThumbSize = parseInt(e.target.value, 10);
        store.state.settings.focusThumbSize = focusThumbSize;
        patchSettingsSoft({ focusThumbSize });
        applyGridSize();
      },
      onchange: (e) => store.patchSettings({ focusThumbSize: parseInt(e.target.value, 10) }),
    });

    const viewerModeBtn = $('button', {
      class: 'ctrl-btn',
      title: t('viewerModeHint'),
      style: { cursor: 'pointer' },
      onclick: () => toggleViewerMode(),
      html: trustedHtml(iconLabel('focus', t('viewerMode'))),
    });

    const focusThumbToggleBtn = $('button', {
      class: 'ctrl-btn',
      title: t('focusThumbsHint'),
      style: { cursor: 'pointer' },
      onclick: () => toggleFocusThumbs(),
      html: trustedHtml(iconLabel('grid', t('focusThumbsHide'))),
    });

    const videoFitBtn = $('button', {
      class: 'ctrl-btn',
      title: t('videoFitHint'),
      style: { cursor: 'pointer' },
      onclick: () => toggleVideoFit(),
      html: trustedHtml(iconLabel('expand', t('videoFitContain'))),
    });

    const pureModeBtn = $('button', {
      class: 'ctrl-btn',
      title: t('pureModeHint'),
      style: { cursor: 'pointer' },
      onclick: () => togglePureMode(),
      html: trustedHtml(iconLabel('clean', t('pureMode'))),
    });

    const splitViewBtn = $('button', {
      class: 'ctrl-btn',
      title: t('splitView'),
      style: { cursor: 'pointer' },
      onclick: () => openSplitViewOrPicker(),
      html: trustedHtml(iconLabel('split', t('splitView'))),
    });
    function syncSplitButton() {
      const count = store.state.settings.splitRoomIds.length;
      setTrustedHtml(splitViewBtn, trustedHtml(iconLabel('split', `${t('splitView')} ${count}/2`)));
      splitViewBtn.classList.toggle('primary', !!store.state.settings.splitViewActive);
      setElementHint(splitViewBtn, count === 2 ? t('splitView') : t('splitNeedTwo'));
    }
    syncSplitButton();

    // 通知开关
    const notifyToggle = $('label', { class: 'toggle', title: t('notifyTitle') }, [
      $('input', {
        type: 'checkbox', checked: store.state.settings.notifyOnline,
        onchange: async (e) => {
          if (e.target.checked) {
            const ok = await Notify.request();
            if (!ok) alert(t('permDenied'));
          }
          store.patchSettings({ notifyOnline: e.target.checked });
        },
      }), t('notifyOnline'),
    ]);

    function importUsernameList(usernames) {
      const clean = [...new Set((usernames || [])
        .map(u => normalizeUsername(u))
        .filter(isLikelyUsername))];
      let added = 0, exists = 0;
      clean.forEach(u => {
        const hadRoom = !!store.state.rooms.find(r => r.id === u);
        if (store.addRoom(u)) {
          if (!hadRoom) service.start(u);
          added++;
        } else {
          exists++;
        }
      });
      return { added, exists, total: clean.length };
    }

    function openManualImportPrompt() {
      closeTransientUi();
      const backdrop = $('div', { class: 'roomgrid-modal-backdrop' });
      const panel = $('div', { class: 'roomgrid-modal' });
      const title = $('div', { class: 'roomgrid-modal-title' }, t('manualImport'));
      const hint = $('div', { class: 'roomgrid-modal-hint' }, t('manualImportPrompt'));
      const ta = $('textarea', {
        class: 'roomgrid-modal-textarea',
        placeholder: LANG === 'zh' ? 'alice\nbob\ncarol' : 'alice\nbob\ncarol',
      });
      const countEl = $('div', { class: 'roomgrid-modal-count' }, '0');
      let escHandler = null;
      const close = () => {
        if (escHandler) { document.removeEventListener('keydown', escHandler); escHandler = null; }
        try { backdrop.remove(); } catch (_) {}
      };
      const parse = () => String(ta.value || '').split(/[\s,;，；]+/).map(s => s.trim()).filter(Boolean);
      const update = () => {
        const count = [...new Set(parse().map(u => normalizeUsername(u)).filter(isLikelyUsername))].length;
        countEl.textContent = LANG === 'zh' ? `可添加 ${count} 个用户名` : `${count} valid usernames`;
      };
      const cancel = $('button', { class: 'ctrl-btn', onclick: close }, t('importReviewCancel'));
      const apply = $('button', {
        class: 'ctrl-btn primary',
        onclick: () => {
          const r = importUsernameList(parse());
          close();
          toast(t('manualImportDone', r.added, r.exists));
        },
      }, LANG === 'zh' ? '添加' : 'Add');
      ta.addEventListener('input', update);
      panel.append(title, hint, ta, countEl, $('div', { class: 'roomgrid-modal-actions' }, [cancel, apply]));
      backdrop.appendChild(panel);
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
      escHandler = (ev) => {
        if (ev.key === 'Escape') close();
      };
      document.addEventListener('keydown', escHandler);
      document.body.appendChild(backdrop);
      update();
      setTimeout(() => ta.focus(), 0);
    }

    // 批量添加按钮：只处理用户粘贴的用户名，不再抓取 followed-cams。
    const manualImportBtn = $('button', {
      class: 'ctrl-btn',
      style: { cursor: 'pointer' },
      title: t('manualImport'),
      onclick: openManualImportPrompt,
    }, t('manualImport'));

    // 更多菜单按钮（含语言切换、关于、捐赠）
    const moreBtn = $('button', {
      class: 'ctrl-btn',
      style: { cursor: 'pointer', minWidth: '40px', padding: '6px 12px' },
      title: t('hintMoreMenu'),
      onclick: (e) => openMoreMenu(e.currentTarget),
    }, t('moreMenu'));

    const settingsBtn = $('button', {
      class: 'ctrl-btn',
      style: { cursor: 'pointer' },
      title: t('settingsCenterHint'),
      html: trustedHtml(iconLabel('settings', t('settingsCenter'))),
      onclick: () => openSettingsCenter(),
    });

    // 横向分隔条：使用 var(--border) 而非硬编码
    const toolbarGroup = (children, style = {}, compact = false) => $('div', { class: 'toolbar-group' + (compact ? ' compact' : ''), style }, children);
    const lbl = (text) => $('span', { style: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' } }, text);

    const groupTitle = (text) => $('span', { class: 'toolbar-group-title' }, text);
    toolbar.append(
      toolbarGroup([sidebarToggleBtn, groupTitle(LANG === 'zh' ? '房间' : 'Rooms'), tbInput, tempUrlBtn, searchInput]),
      toolbarGroup([groupTitle(LANG === 'zh' ? '视图' : 'View'), viewModeSel, splitViewBtn, layoutSel, videoFitBtn, pureModeBtn, toolbarCollapseBtn], {}, true),
      toolbarGroup([groupTitle(LANG === 'zh' ? '筛选' : 'Filter'), filterSel, sortSel], {}, true),
      $('div', { class: 'toolbar-spacer' }, [
        toolbarGroup([groupTitle(LANG === 'zh' ? '播放' : 'Playback'), volLabel, volSlider, refreshAllBtn], {}, true),
        settingsBtn,
        moreBtn,
      ]),
    );

    function layoutSize() {
      const key = store.state.settings.viewMode === 'phone' ? 'phoneLayoutSize' : 'layoutSize';
      const n = Number(store.state.settings[key] || (key === 'phoneLayoutSize' ? 2 : 4));
      return [2, 4, 6, 9].includes(n) ? n : 4;
    }
    function layoutShape() {
      const n = layoutSize();
      const portrait = window.matchMedia?.('(orientation: portrait)')?.matches || grid.clientHeight > grid.clientWidth;
      if (n === 2) return portrait ? { cols: 1, rows: 2 } : { cols: 2, rows: 1 };
      if (n === 6) return portrait ? { cols: 2, rows: 3 } : { cols: 3, rows: 2 };
      if (n === 9) return { cols: 3, rows: 3 };
      return { cols: 2, rows: 2 };
    }
    function fullVisibleRooms() { return visibleRooms(); }
    function syncLayoutControls() {
      const size = layoutSize();
      layoutSel.value = String(size);
      const total = fullVisibleRooms().length;
      layoutSel.title = LANG === 'zh' ? `单屏显示 ${size} 个，共 ${total} 个；向下滚动查看更多` : `${size} visible at once, ${total} total; scroll down for more`;
    }

    function applyGridSize() {
      const mode = store.state.settings.viewMode;
      if (store.state.settings.splitViewActive) {
        grid.style.display = 'grid';
        grid.style.gridTemplateAreas = '';
        grid.style.gridTemplateColumns = '';
        grid.style.gridTemplateRows = '';
        grid.style.gap = '0';
        grid.style.alignItems = 'stretch';
        grid.style.alignContent = 'stretch';
        grid.style.overflow = 'hidden';
        grid.style.setProperty('--split-ratio', clampInt(store.state.settings.splitRatio, 20, 80, 50) + '%');
        return;
      }
      if (mode === 'focus') {
        const w = Math.max(45, Math.min(76, Number(store.state.settings.focusMainPct || 62)));
        const h = Math.max(44, Math.min(78, Number(store.state.settings.focusMainHPct || 64)));
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `minmax(260px, ${w}fr) 8px minmax(190px, ${100 - w}fr)`;
        grid.style.gridTemplateRows = `minmax(220px, ${h}fr) 8px minmax(120px, ${100 - h}fr)`;
        grid.style.gridTemplateAreas = `'main vbar side' 'hbar hbar side' 'bottom bottom side'`;
        grid.style.gap = '8px';
        grid.style.alignItems = 'stretch';
        grid.style.alignContent = 'stretch';
        grid.style.overflow = 'hidden';
        grid.style.setProperty('--focus-main-w', w + 'fr');
        grid.style.setProperty('--focus-side-w', (100 - w) + 'fr');
        grid.style.setProperty('--focus-main-h', h + 'fr');
        grid.style.setProperty('--focus-bottom-h', (100 - h) + 'fr');
        requestAnimationFrame(applyFocusMainSizing);
        return;
      }
      const shape = layoutShape();
      const gridStyle = getComputedStyle(grid);
      const paddingY = (parseFloat(gridStyle.paddingTop) || 0) + (parseFloat(gridStyle.paddingBottom) || 0);
      const gap = 8;
      const viewportHeight = Math.max(180, grid.clientHeight - paddingY);
      const rowHeight = Math.max(110, Math.floor((viewportHeight - gap * (shape.rows - 1)) / shape.rows));
      grid.style.display = 'grid';
      grid.style.gridTemplateAreas = '';
      grid.style.gridTemplateColumns = `repeat(${shape.cols}, minmax(0, 1fr))`;
      grid.style.gridTemplateRows = '';
      grid.style.gridAutoRows = `${rowHeight}px`;
      grid.style.gridAutoFlow = 'row';
      grid.style.gap = gap + 'px';
      grid.style.alignItems = 'stretch';
      grid.style.alignContent = 'start';
      grid.style.overflowX = 'hidden';
      grid.style.overflowY = 'auto';
      grid.style.overscrollBehavior = 'contain';
    }

    function gridMetrics() {
      const base = clampInt(store.state.settings.gridCellSize || 80, 56, 120, 80);
      const row = Math.max(32, Math.round(base * 9 / 16));
      return { base, row };
    }

    function defaultTileSize() {
      const { base, row } = gridMetrics();
      const target = clampInt(store.state.settings.gridSize || 400, 220, 900, 400);
      const cols = clampInt(Math.round(target / base), 3, 18, 5);
      const rows = clampInt(Math.round((cols * base * 9 / 16) / row), 3, 18, cols);
      return { cols, rows };
    }

    function tileSizeForRoom(room) {
      const groupId = store.state.settings.activeGroup || DEFAULT_GROUP_ID;
      const map = normalizeCardSizeMap(room?.cardSizeByGroup);
      return normalizeCardSize(map[groupId]) || defaultTileSize();
    }

    function applyCardGridSizing(card, room) {
      if (!card) return;
      card.classList.remove('is-focus-main');
      card.style.gridColumn = '';
      card.style.gridRow = '';
      card.style.width = '100%';
      card.style.height = '100%';
      card.style.maxWidth = '';
      card.style.maxHeight = '';
      card.style.aspectRatio = 'auto';
    }

    function parseFocusAspect() {
      const v = store.state.settings.focusAspect || 'auto';
      if (v === 'auto') return null;
      if (v === '4:3') return 4 / 3;
      if (v === '1:1') return 1;
      if (v === '9:16') return 9 / 16;
      return 16 / 9;
    }

    function resetCardSizing(card) {
      if (!card) return;
      card.classList.remove('is-focus-main');
      card.classList.remove('is-split-card');
      card.style.width = '';
      card.style.height = '';
      card.style.flex = '';
      card.style.margin = '';
      card.style.maxWidth = '';
      card.style.maxHeight = '';
      card.style.aspectRatio = '16 / 9';
      card.style.gridColumn = '';
      card.style.gridRow = '';
    }

    function applyFocusMainSizing() {
      if (store.state.settings.viewMode !== 'focus') return;
      const row = grid.querySelector('.focused-row');
      const card = row && row.querySelector('.cam-card');
      if (!row || !card) return;
      card.classList.add('is-focus-main');
      card.style.width = '100%';
      card.style.height = '100%';
      card.style.maxWidth = '100%';
      card.style.maxHeight = '100%';
      card.style.flex = '1 1 auto';
      card.style.aspectRatio = 'auto';
    }

    window.addEventListener('resize', debounce(() => {
      if (store.state.settings.viewMode === 'focus') applyFocusMainSizing();
      else renderGrid();
    }, 120));

    // ---- 侧边栏渲染 ----
    function renderSidebar() {
      sidebar.replaceChildren();
      const collapsed = !!store.state.settings.sidebarCollapsed;
      sidebar.dataset.collapsed = collapsed ? 'true' : 'false';
      sidebar.classList.toggle('is-collapsed', collapsed);
      document.body.classList.toggle('rg-sidebar-collapsed', collapsed);
      if (collapsed) {
        sidebar.style.setProperty('display', 'none', 'important');
        sidebar.style.setProperty('width', '0px', 'important');
        sidebar.style.setProperty('min-width', '0px', 'important');
        sidebar.style.setProperty('max-width', '0px', 'important');
        sidebar.style.setProperty('flex-basis', '0px', 'important');
        sidebar.style.setProperty('padding', '0px', 'important');
        sidebar.style.setProperty('border-width', '0px', 'important');
        return;
      }
      const phoneSidebar = phoneEnvironment || store.state.settings.viewMode === 'phone';
      const sidebarWidth = phoneSidebar ? 'min(86vw, 320px)' : '220px';
      sidebar.style.setProperty('display', 'flex', 'important');
      sidebar.style.setProperty('width', sidebarWidth, 'important');
      sidebar.style.setProperty('min-width', sidebarWidth, 'important');
      sidebar.style.setProperty('max-width', sidebarWidth, 'important');
      sidebar.style.setProperty('flex-basis', sidebarWidth, 'important');
      sidebar.style.setProperty('padding', '10px 8px', 'important');
      sidebar.style.setProperty('border-width', '1px', 'important');

      const counts = countByGroup();
      const sidebarRooms = allRoomsForView();
      const total = sidebarRooms.length;
      const online = sidebarRooms.filter(r => r.lastStatus === 'online').length;

      sidebar.append($('div', { class: 'sidebar-brand' }, [
        $('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' } }, [
          $('div', { class: 'title' }, 'RoomGrid'),
          $('button', {
            class: 'sidebar-collapse-btn',
            type: 'button',
            title: LANG === 'zh' ? '收起左侧分组' : 'Collapse groups',
            onclick: (event) => { event.stopPropagation(); setSidebarCollapsed(true); },
          }, LANG === 'zh' ? '收起' : 'Hide'),
        ]),
        $('div', { class: 'sub' }, LANG === 'zh' ? '快速找到并观看主播' : 'Find and watch models quickly'),
      ]));

      const sidebarSearch = $('input', {
        class: 'ctrl-input sidebar-search',
        type: 'search',
        placeholder: t('searchPlaceholder'),
        value: store.state.settings.searchQuery || '',
        oninput: debounce((e) => store.patchSettings({ searchQuery: normalizeUsername(e.target.value), pageIndex: 0 }), 80),
      });
      sidebar.appendChild(sidebarSearch);

      const groupDisplayName = (g) => {
        if (g.name === '__library__') return t('groupLibrary');
        if (g.name === '__all__') return t('groupAll');
        if (g.name === '__online_favorites__') return t('groupOnlineFav');
        if (g.name === '__online__') return t('groupOnline');
        if (g.name === '__fav__') return t('groupFav');
        return g.name;
      };

      const renderGroup = (g) => {
        if (!g) return;
        const isActive = store.state.settings.activeGroup === g.id;
        const tab = $('button', {
          class: 'group-tab' + (isActive ? ' active' : ''),
          dataset: { groupId: g.id },
          title: g.id === LIBRARY_GROUP_ID
            ? t('hintLibraryTab')
            : (g.id === ONLINE_FAVORITES_GROUP_ID ? t('hintOnlineFavoritesTab') : t('hintGroupTab', groupDisplayName(g))),
          onclick: () => {
            grid.scrollTop = 0;
            store.setActiveGroup(g.id);
            if (phoneEnvironment || store.state.settings.viewMode === 'phone') store.patchSettings({ sidebarCollapsed: true });
          },
          oncontextmenu: (e) => { if (!g.system) { e.preventDefault(); openGroupMenu(e, g); } },
          ondragover: (e) => { if (g.id === LIBRARY_GROUP_ID || g.id === ONLINE_GROUP_ID || g.id === ONLINE_FAVORITES_GROUP_ID) return; e.preventDefault(); tab.classList.add('drop-target'); },
          ondragleave: () => tab.classList.remove('drop-target'),
          ondrop: (e) => {
            if (g.id === LIBRARY_GROUP_ID || g.id === ONLINE_GROUP_ID || g.id === ONLINE_FAVORITES_GROUP_ID) return;
            e.preventDefault(); tab.classList.remove('drop-target');
            const id = e.dataTransfer.getData('text/room-id');
            if (id) store.moveToGroup(id, g.id);
          },
        }, [
          $('span', { class: 'group-name' }, groupDisplayName(g)),
          $('span', { class: 'group-count' }, String(counts[g.id] || 0)),
        ]);

        const row = $('div', { class: 'sidebar-group-row' }, [tab]);
        if (!g.system) {
          row.appendChild($('button', {
            class: 'sidebar-group-more',
            title: LANG === 'zh' ? '分组菜单' : 'Group menu',
            onclick: (e) => { e.stopPropagation(); openGroupMenu(e, g); },
          }, '•••'));
        }
        sidebar.appendChild(row);
      };

      const byId = new Map(store.state.groups.map(g => [g.id, g]));
      sidebar.append($('div', { class: 'sidebar-section-title' }, t('quickViewsHeading')));
      [ONLINE_FAVORITES_GROUP_ID, ONLINE_GROUP_ID, LIBRARY_GROUP_ID].forEach(id => renderGroup(byId.get(id)));

      sidebar.append($('div', { class: 'sidebar-section-title sidebar-section-spaced' }, t('myGroupsHeading')));
      [DEFAULT_GROUP_ID, FAVORITE_GROUP_ID].forEach(id => renderGroup(byId.get(id)));
      [...store.state.groups]
        .filter(g => !g.system)
        .sort((a, b) => a.order - b.order)
        .forEach(renderGroup);

      sidebar.appendChild($('button', {
        class: 'group-tab',
        title: t('hintNewGroup'),
        style: { color: 'var(--text-secondary)', marginTop: '8px', justifyContent: 'center', borderStyle: 'dashed' },
        onclick: () => {
          const name = prompt(t('newGroupPrompt'));
          if (name && name.trim()) store.addGroup(name.trim());
        },
      }, t('newGroup')));

      sidebar.appendChild($('div', { class: 'sidebar-summary' }, LANG === 'zh'
        ? `${total} 位主播 · ${online} 位在线`
        : `${total} models · ${online} online`));

      const sidebarSettings = $('button', { class: 'ctrl-btn', onclick: openSettingsCenter }, t('settingsCenter'));
      const sidebarMore = $('button', { class: 'ctrl-btn', onclick: () => openMoreMenu(sidebarMore) }, t('moreMenu'));
      sidebar.appendChild($('div', { class: 'sidebar-footer' }, [sidebarSettings, sidebarMore]));
    }

    function countByGroup() {
      const rooms = allRoomsForView();
      const c = {
        [LIBRARY_GROUP_ID]: rooms.length,
        [ONLINE_GROUP_ID]: rooms.filter(r => r.lastStatus === 'online').length,
        [ONLINE_FAVORITES_GROUP_ID]: rooms.filter(r => roomInGroup(r, ONLINE_FAVORITES_GROUP_ID)).length,
      };
      for (const r of rooms) for (const g of getRoomGroups(r)) c[g] = (c[g] || 0) + 1;
      return c;
    }

    function openGroupMenu(e, g) {
      const menu = $('div', { class: 'menu-pop',
        style: { left: e.clientX + 'px', top: e.clientY + 'px' } }, [
        $('button', { onclick: () => { const n = prompt(t('renameGroupPrompt'), g.name); if (n) store.renameGroup(g.id, n.trim()); menu.remove(); } }, t('renameGroup')),
        $('button', { class: 'danger', onclick: () => {
          if (confirm(t('deleteGroupConfirm', g.name))) store.removeGroup(g.id);
          menu.remove();
        } }, t('deleteGroup')),
      ]);
      document.body.appendChild(menu);
      const close = (ev) => { if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('click', close); } };
      setTimeout(() => document.addEventListener('click', close), 0);
    }

    // ---- 卡片管理 ----
    const cardMap = new Map();   // id -> {root, video, statusEl, badgeEl}
    const mediaViewportIds = new Set();
    const mediaAttachPendingIds = new Set();

    function isRoomMediaProtected(roomId) {
      const room = findRoomAny(roomId);
      return recordings.has(roomId)
        || store.state.settings.focusedRoomId === roomId && store.state.settings.viewMode === 'focus'
        || store.state.settings.splitRoomIds.includes(roomId)
        || !!room && room.muted === false;
    }

    function isCardNearViewport(roomId) {
      if (mediaViewportIds.has(roomId)) return true;
      const card = cardMap.get(roomId)?.root;
      if (!card?.isConnected) return false;
      const cardRect = card.getBoundingClientRect();
      const gridRect = grid.getBoundingClientRect();
      const margin = Math.max(120, gridRect.height * .75);
      return cardRect.bottom >= gridRect.top - margin && cardRect.top <= gridRect.bottom + margin;
    }

    function shouldAttachRoomMedia(roomId) {
      return isRoomMediaProtected(roomId) || isCardNearViewport(roomId);
    }

    function requestRoomMediaIfNeeded(roomId) {
      const room = findRoomAny(roomId);
      const cardEntry = cardMap.get(roomId);
      if (!room || !cardEntry || cardEntry.video || !shouldAttachRoomMedia(roomId)) return;
      if (room.sourceUrl) {
        attachTemporarySource(room);
        return;
      }
      if (!service.has(roomId)) service.start(roomId);
      if (room.lastStatus !== 'online' || mediaAttachPendingIds.has(roomId)) return;
      mediaAttachPendingIds.add(roomId);
      service.refresh(roomId);
      setTimeout(() => mediaAttachPendingIds.delete(roomId), 5000);
    }

    function releaseRoomMediaIfPossible(roomId) {
      if (isRoomMediaProtected(roomId) || isCardNearViewport(roomId)) return;
      const room = findRoomAny(roomId);
      const cardEntry = cardMap.get(roomId);
      if (!cardEntry?.video) return;
      mediaAttachPendingIds.delete(roomId);
      if (room?.sourceUrl) {
        try { cardEntry.tempHls?.destroy?.(); } catch (_) {}
        cardEntry.tempHls = null;
      } else {
        service.detachVideo(roomId);
      }
      try { cardEntry.video?.pause?.(); } catch (_) {}
      try { cardEntry.video?.remove?.(); } catch (_) {}
      cardEntry.video = null;
      if (room) renderCardState(room);
    }

    const cardMediaObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const roomId = entry.target?.dataset?.roomId;
        if (!roomId) return;
        if (entry.isIntersecting) {
          mediaViewportIds.add(roomId);
          requestRoomMediaIfNeeded(roomId);
        } else {
          mediaViewportIds.delete(roomId);
          releaseRoomMediaIfPossible(roomId);
        }
      });
    }, { root: grid, rootMargin: '75% 0px', threshold: .01 }) : null;

    function observeCardMedia(roomId) {
      const card = cardMap.get(roomId)?.root;
      if (!card) return;
      if (cardMediaObserver) cardMediaObserver.observe(card);
      else mediaViewportIds.add(roomId);
    }

    function forgetCardMedia(roomId) {
      const card = cardMap.get(roomId)?.root;
      if (card && cardMediaObserver) cardMediaObserver.unobserve(card);
      mediaViewportIds.delete(roomId);
      mediaAttachPendingIds.delete(roomId);
    }

    // v15.6-minimal: 临时 URL 窗口。只存在于当前页面内存，刷新后消失；不写入 localStorage。
    const tempRooms = [];
    function allRoomsForView() { return [...store.state.rooms, ...tempRooms]; }
    function findRoomAny(id) {
      id = String(id || '');
      return store.state.rooms.find(r => r.id === id) || tempRooms.find(r => r.id === id) || null;
    }
    function isDirectMediaUrl(url) { return /\.(m3u8|mp4|webm|mov|m4v)(?:[?#].*)?$/i.test(String(url || '')); }
    function isHlsUrl(url) { return /\.m3u8(?:[?#].*)?$/i.test(String(url || '')) || /m3u8/i.test(String(url || '')); }
    function tempIdFromUrl(url) {
      try {
        const u = new URL(String(url));
        const name = (u.hostname + u.pathname).replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'url';
        return 'tmp_' + name + '_' + Math.random().toString(36).slice(2, 7);
      } catch (_) { return 'tmp_url_' + Math.random().toString(36).slice(2, 9); }
    }
    function extractMediaUrlFromHtml(html, baseUrl) {
      const srcs = [];
      const push = (v) => {
        if (!v) return;
        let s = String(v).replace(/\\\//g, '/').replace(/&amp;/g, '&').trim();
        try { s = new URL(s, baseUrl).href; } catch (_) {}
        if (isSafeHttpUrl(s) && isDirectMediaUrl(s)) srcs.push(s);
      };
      String(html || '').replace(/https?:\\?\/\\?\/[^\s"'<>]+?(?:m3u8|mp4|webm|mov|m4v)(?:[^\s"'<>]*)?/ig, m => { push(m); return m; });
      String(html || '').replace(/(?:src|source|file|url)["']?\s*[:=]\s*["']([^"']+)["']/ig, (_, m) => { push(m); return _; });
      return srcs.find(isHlsUrl) || srcs[0] || '';
    }
    async function fetchTextBestEffort(url) {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('http ' + res.status);
      return res.text();
    }
    async function importTemporaryUrls() {
      const raw = prompt(LANG === 'zh' ? '粘贴 URL，支持房间页、m3u8、mp4/webm。普通网页会尝试解析真实播放源；失败请手动粘贴真实播放地址。' : 'Paste URLs. Room pages, m3u8, mp4/webm are supported. Normal pages will be parsed best-effort.');
      if (!raw) return;
      const parts = String(raw).split(/[\s,，]+/).map(x => x.trim()).filter(Boolean);
      let added = 0, failed = 0;
      for (const part of parts) {
        try {
          if (!isSafeHttpUrl(part)) { failed++; continue; }
          const u = new URL(part, location.href);
          if (safeChaturbateHost(u.hostname)) {
            const username = normalizeUsername(part);
            if (username && isLikelyUsername(username)) {
              const activeGroup = store.state.settings.activeGroup;
              const groupId = (!activeGroup || activeGroup === LIBRARY_GROUP_ID || activeGroup === ONLINE_GROUP_ID || activeGroup === ONLINE_FAVORITES_GROUP_ID) ? DEFAULT_GROUP_ID : activeGroup;
              if (!findRoomAny(username)) tempRooms.push({ id: username, group: groupId, groups: [groupId], addedAt: Date.now(), order: 100000 + tempRooms.length, lastStatus: 'unknown', lastSeenOnline: 0, muted: false, temporary: true });
              service.start(username);
              added++;
              continue;
            }
          }
          let mediaUrl = isDirectMediaUrl(part) ? part : '';
          if (!mediaUrl) {
            try { mediaUrl = extractMediaUrlFromHtml(await fetchTextBestEffort(part), part); } catch (_) {}
          }
          if (!mediaUrl) { failed++; continue; }
          const id = tempIdFromUrl(mediaUrl);
          const activeGroup = store.state.settings.activeGroup;
          const groupId = (!activeGroup || activeGroup === LIBRARY_GROUP_ID || activeGroup === ONLINE_GROUP_ID || activeGroup === ONLINE_FAVORITES_GROUP_ID) ? DEFAULT_GROUP_ID : activeGroup;
          tempRooms.push({ id, displayName: new URL(mediaUrl).hostname, sourceUrl: mediaUrl, group: groupId, groups: [groupId], addedAt: Date.now(), order: 100000 + tempRooms.length, lastStatus: 'online', lastSeenOnline: Date.now(), muted: false, temporary: true });
          added++;
        } catch (_) { failed++; }
      }
      store.patchSettings({ pageIndex: 0 });
      renderSidebar();
      renderGrid();
      toast(LANG === 'zh' ? `临时 URL：新增 ${added}，失败 ${failed}` : `Temporary URLs: ${added} added, ${failed} failed`);
    }

    function statusMeta(s) {
      switch (s) {
        case 'online': return { color: '#16a34a', label: t('stOnline') };
        case 'offline': return { color: '#64748b', label: t('stOffline') };
        case 'private': return { color: '#d97706', label: t('stPrivate') };
        case 'loading': return { color: '#2563eb', label: t('stLoading') };
        case 'error': return { color: '#dc2626', label: t('stError') };
        default: return { color: '#64748b', label: t('stUnknown') };
      }
    }

    function buildCard(room) {
      // v15.9.31: the card itself is the drag surface; controls remain normal click targets.
      const card = $('div', { class: 'cam-card rg-card-enter', dataset: { roomId: room.id }, draggable: !phoneEnvironment });
      setTimeout(() => { try { card.classList.remove('rg-card-enter'); } catch (_) {} }, 220);

      // 状态徽标（左上）
      const badge = $('div', { class: 'pill',
        style: { position: 'absolute', top: '8px', left: '8px', zIndex: '20' } });
      // 名字（左下，常驻）
      const name = $('div', {
        class: 'name-label',
        style: { position: 'absolute', bottom: '8px', left: '8px', zIndex: '20',
          background: 'rgba(15,23,42,.46)', color: '#fff', padding: '5px 9px', borderRadius: '999px',
          fontSize: '12px', fontWeight: '650', pointerEvents: 'none', maxWidth: '72%',
          border: '1px solid rgba(255,255,255,.16)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      }, room.id);

      const dragBlockedSelector = '.icon-btn,.menu-pop,.roomgrid-modal-backdrop,button,input,select,textarea,a';
      let dragStartBlocked = false;
      card.addEventListener('pointerdown', (e) => {
        dragStartBlocked = e.button !== 0 || !!e.target?.closest?.(dragBlockedSelector) || getVideoTransform(room.id).zoom !== 1;
      });
      card.addEventListener('pointerup', () => { dragStartBlocked = false; });
      card.addEventListener('pointercancel', () => { dragStartBlocked = false; });
      card.addEventListener('dragstart', (e) => {
        if (dragStartBlocked || getVideoTransform(room.id).zoom !== 1) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData('text/room-id', room.id);
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setDragImage(card, card.offsetWidth / 2, Math.min(48, card.offsetHeight / 2)); } catch (_) {}
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        dragStartBlocked = false;
        card.classList.remove('dragging');
        document.querySelectorAll('.cam-card').forEach(c => c.classList.remove('drop-before', 'drop-after'));
      });

      // 操作条（右上，hover 显示）
      const opsRow = $('div', { class: 'mc-hover-ui ops-row',
        style: { position: 'absolute', top: '10px', right: '10px', left: 'auto', bottom: 'auto', zIndex: '25', display: 'flex', gap: '6px', background: 'transparent', width: 'auto', height: 'auto' } });
      const mkOp = (iconName, title, onclick, opts = {}) =>
        setElementHint($('button', {
          class: 'icon-btn' + (opts.danger ? ' danger' : '') + (opts.extra ? ' ops-extra' : ''),
          title,
          html: trustedHtml(iconSvg(iconName, 15)),
          onclick: (e) => { e.stopPropagation(); onclick(e); },
        }), title);

      const refreshBtn = mkOp('refresh', t('opRefresh'), () => service.refresh(room.id), { extra: true });
      const muteBtn = mkOp(room.muted ? 'volume' : 'volumeOff', t('opMuteToggle'), () => {
        const target = store.state.rooms.find(r => r.id === room.id);
        if (!target) return;
        store.patchRoom(room.id, { muted: !target.muted });
        requestAnimationFrame(() => applyMute(room.id));
      });
      const shotBtn = mkOp('camera', t('opScreenshot'), () => captureCardScreenshot(room.id), { extra: true });
      const recordBtn = mkOp('record', t('opRecordStart'), () => toggleCardRecording(room.id), { extra: true });
      const openBtn = mkOp('external', t('opOpenRoom') + ' · O', () => openRoomPage(room.id));
      const pipBtn = mkOp('pip', t('opPiP'), async () => {
        const v = cardMap.get(room.id)?.video;
        if (!v) return;
        try { if (document.pictureInPictureElement) await document.exitPictureInPicture(); else await v.requestPictureInPicture(); }
        catch (_) {}
      }, { extra: true });
      const fullBtn = mkOp('expand', t('opFullscreen'), () => {
        document.fullscreenElement ? document.exitFullscreen() : card.requestFullscreen().catch(() => {});
      }, { extra: true });
      const moreOpsBtn = mkOp('more', t('moreOps'), (ev) => openCardOpsMenu(ev, room.id, card));
      const removeBtn = mkOp('close', t('opRemove'), () => {
        stopCardRecording(room.id, true);
        const globallyRemoved = store.removeRoomFromActiveGroup(room.id);
        if (globallyRemoved) service.stop(room.id);
        else service.detachVideo(room.id);
      }, { danger: true });
      const favoriteBtn = room.temporary ? null : mkOp('star', t('opFavoriteAdd'), () => {
        store.toggleRoomInGroup(room.id, FAVORITE_GROUP_ID);
      });
      favoriteBtn?.classList.add('favorite-toggle');
      const splitBtn = room.temporary ? null : mkOp('split', t('opAddSplit'), () => handleAddRoomToSplit(room.id));
      splitBtn?.classList.add('split-toggle');
      muteBtn.classList.add('quick-op', 'quick-mute');
      refreshBtn.classList.add('quick-op', 'quick-refresh', 'quick-optional');
      fullBtn.classList.add('quick-op', 'quick-full', 'quick-optional');
      openBtn.classList.add('quick-op', 'quick-open');
      moreOpsBtn.classList.add('quick-op', 'quick-more');
      opsRow.append(muteBtn, openBtn, refreshBtn, recordBtn, fullBtn, moreOpsBtn);

      // 状态文字（中央覆盖层）
      const statusEl = $('div', { class: 'status-layer' });

      card.append(badge, name, opsRow, statusEl);
      if (splitBtn) card.appendChild(splitBtn);
      if (favoriteBtn) card.appendChild(favoriteBtn);

      // —— 双击全屏 ——
      card.addEventListener('mouseenter', () => {
        try {
          card.style.filter = 'none';
          card.style.opacity = '1';
          const v = card.querySelector('.cam-video');
          if (v) { v.style.filter = 'none'; v.style.opacity = '1'; v.controls = false; v.removeAttribute('controls'); }
        } catch (_) {}
      });

      card.addEventListener('dblclick', (e) => {
        if (e.target.closest('.icon-btn')) return;
        const transform = getVideoTransform(room.id);
        if (transform.zoom !== 1 || transform.x || transform.y) {
          e.preventDefault();
          e.stopPropagation();
          patchVideoTransform(room.id, { zoom: 1, x: 0, y: 0 });
          return;
        }
        document.fullscreenElement ? document.exitFullscreen() : card.requestFullscreen().catch(() => {});
      });

      card.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.icon-btn')) return;
        e.preventDefault();
        openCardOpsMenu(e, room.id, card);
      });

      // —— 卡片作为 drop 目标（dragover/drop 不会被 video 拦截）——
      card.addEventListener('dragover', (e) => {
        const draggingEl = document.querySelector('.cam-card.dragging');
        if (!draggingEl) return;
        const draggingId = draggingEl.dataset.roomId;
        if (draggingId === room.id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        // 计算插入位置：鼠标在卡片左/上半 → before，右/下半 → after
        const rect = card.getBoundingClientRect();
        // grid 布局可能横可能竖，取占比更大的轴
        const useHoriz = rect.width >= rect.height;
        const ratio = useHoriz
          ? (e.clientX - rect.left) / rect.width
          : (e.clientY - rect.top) / rect.height;
        const before = ratio < 0.5;
        // 仅切换两个 class，避免反复 toggle 导致动画抖动
        if (before) {
          if (!card.classList.contains('drop-before')) {
            card.classList.add('drop-before'); card.classList.remove('drop-after');
          }
        } else {
          if (!card.classList.contains('drop-after')) {
            card.classList.add('drop-after'); card.classList.remove('drop-before');
          }
        }
      });
      card.addEventListener('dragleave', (e) => {
        // 只有真的离开卡片才移除（避免子元素事件冒泡误清）
        if (!card.contains(e.relatedTarget)) {
          card.classList.remove('drop-before', 'drop-after');
        }
      });
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        const fromId = e.dataTransfer.getData('text/room-id');
        const isBefore = card.classList.contains('drop-before');
        card.classList.remove('drop-before', 'drop-after');
        if (!fromId || fromId === room.id) return;
        reorderByDrop(fromId, room.id, isBefore ? 'before' : 'after');
      });

      installCardZoomHandlers(card, room.id);

      cardMap.set(room.id, { root: card, video: null, statusEl, badge, favoriteBtn, splitBtn, muteBtn, recordBtn, removeBtn, resizeObserver: null });
      observeCardMedia(room.id);

      // —— 响应式：根据卡片宽度自动加 .compact / .tiny class ——
      // 避免按钮 + pill + 名字标签在小卡片时互相覆盖
      try {
        const ro = new ResizeObserver(entries => {
          for (const entry of entries) {
            const w = entry.contentRect.width;
            card.classList.toggle('compact', w < 320);
            card.classList.toggle('tiny', w < 230);
          }
        });
        ro.observe(card);
        const entry = cardMap.get(room.id);
        if (entry) entry.resizeObserver = ro;
      } catch (_) { /* 旧浏览器忽略 */ }

      // —— focus 模式：单击非主屏卡片（缩略图）→ 设为主屏 ——
      card.addEventListener('click', (e) => {
        if (store.state.settings.viewMode !== 'focus') return;
        if (e.target.tagName === 'VIDEO') return; // 让 video 控件正常响应
        if (e.target.closest('.icon-btn')) return;
        if (store.state.settings.focusedRoomId === room.id) return;
        // v15.4：新主屏布局的右侧 / 下方副窗口也可以直接点击切主屏。
        const p = card.parentElement;
        const canPromote = p?.classList.contains('thumbs-row') || p?.classList.contains('focus-side-row') || p?.classList.contains('focus-bottom-row');
        if (!canPromote) return;
        focusRoom(room.id);
      });

      return card;
    }

    function updateCardButtons(id) {
      const c = cardMap.get(id);
      if (!c) return;
      const room = store.state.rooms.find(r => r.id === id);
      const favorite = !!room && roomInGroup(room, FAVORITE_GROUP_ID);
      if (c.favoriteBtn) {
        setElementHint(c.favoriteBtn, favorite ? t('opFavoriteRemove') : t('opFavoriteAdd'));
        c.favoriteBtn.classList.toggle('favorite-active', favorite);
        c.favoriteBtn.setAttribute('aria-pressed', favorite ? 'true' : 'false');
      }
      c.root.classList.toggle('is-favorite', favorite);
      c.root.classList.toggle('favorite-online', favorite && room?.lastStatus === 'online');
      const splitSelected = !!room && store.state.settings.splitRoomIds.includes(room.id);
      if (c.splitBtn) {
        setElementHint(c.splitBtn, splitSelected ? t('splitAlreadyAdded') : t('opAddSplit'));
        c.splitBtn.classList.toggle('split-active', splitSelected);
        c.splitBtn.setAttribute('aria-pressed', splitSelected ? 'true' : 'false');
      }
      c.root.classList.toggle('is-split-selected', splitSelected);
      if (c.muteBtn && room) {
        setTrustedHtml(c.muteBtn, trustedHtml(iconSvg(room.muted ? 'volume' : 'volumeOff', 15)));
        setElementHint(c.muteBtn, room.muted ? (LANG === 'zh' ? '取消静音' : 'Unmute') : (LANG === 'zh' ? '静音' : 'Mute'));
      }
      if (c.removeBtn) {
        setElementHint(c.removeBtn, (store.state.settings.activeGroup === LIBRARY_GROUP_ID || store.state.settings.activeGroup === ONLINE_GROUP_ID) ? t('opDeleteRoom') : (store.state.settings.activeGroup === ONLINE_FAVORITES_GROUP_ID ? t('opFavoriteRemove') : t('opRemove')));
      }
      const rec = recordings.get(id);
      if (c.recordBtn) {
        setTrustedHtml(c.recordBtn, trustedHtml(iconSvg(rec ? 'stop' : 'record', 15)));
        setElementHint(c.recordBtn, rec?.waitingForSource ? t('recordingWaiting') : (rec ? t('opRecordStop') : t('opRecordStart')));
        c.recordBtn.classList.toggle('recording', !!rec);
        c.recordBtn.classList.toggle('waiting', !!rec?.waitingForSource);
      }
      c.root.classList.toggle('recording', !!rec);
      c.root.classList.toggle('recording-waiting', !!rec?.waitingForSource);
    }

    function captureCardScreenshot(roomId) {
      const c = cardMap.get(roomId);
      const video = c?.video;
      if (!video || !video.videoWidth || !video.videoHeight) { toast(t('captureFailed')); return; }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) { toast(t('captureFailed')); return; }
          downloadBlob(blob, `roomgrid-${safeFilePart(roomId)}-${stampForFile()}.png`);
          toast(t('screenshotSaved'));
        }, 'image/png');
      } catch (err) {
        console.warn('[RoomGrid] screenshot failed', err);
        toast(t('captureFailed'));
      }
    }

    function getVideoCaptureStream(video) {
      if (!video) return null;
      if (typeof video.captureStream === 'function') return video.captureStream();
      if (typeof video.mozCaptureStream === 'function') return video.mozCaptureStream();
      return null;
    }

    function recordingSegmentMs() {
      return clampInt(store.state.settings.recordingSegmentMinutes, 1, 180, 10) * 60 * 1000;
    }

    function recordingVideoBitrate() {
      return clampInt(store.state.settings.recordingVideoBitrate, 500000, 20000000, 6000000);
    }

    function recordingMimeType() {
      if (typeof MediaRecorder === 'undefined') return '';
      const mimes = ['video/mp4;codecs=h264,aac', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
      return mimes.find(m => { try { return MediaRecorder.isTypeSupported(m); } catch (_) { return false; } }) || '';
    }

    function recordingFileExt(mimeType) {
      return String(mimeType || '').includes('mp4') ? 'mp4' : 'webm';
    }

    function recordingReasonSuffix(reason) {
      if (reason === 'source-loss') return '-source-paused';
      if (reason === 'manual' || reason === 'final') return '-final';
      return '';
    }

    function getRecordingVideo(roomId) {
      const c = cardMap.get(roomId);
      if (c?.video) return c.video;
      try {
        return document.querySelector(`video[data-multicam-room-id="${String(roomId).replace(/"/g, '')}"]`);
      } catch (_) {
        return null;
      }
    }

    function createRecordingStream(video) {
      const source = getVideoCaptureStream(video);
      if (!source) return null;
      const videoTracks = source.getVideoTracks().filter(track => track.readyState === 'live');
      const audioTracks = source.getAudioTracks().filter(track => track.readyState === 'live');
      if (!videoTracks.length || typeof MediaRecorder === 'undefined') {
        try { source.getTracks().forEach(track => track.stop()); } catch (_) {}
        return null;
      }
      return new MediaStream([...videoTracks, ...audioTracks]);
    }

    function cleanupRecordingStream(rec) {
      try { rec.stream?.getTracks?.().forEach(track => track.stop()); } catch (_) {}
      rec.stream = null;
    }

    function saveRecordingSegment(roomId, rec, reason = 'segment') {
      const chunks = Array.isArray(rec?.chunks) ? rec.chunks.filter(chunk => chunk && chunk.size) : [];
      if (!chunks.length) return false;
      const mimeType = rec.mimeType || 'video/webm';
      const blob = new Blob(chunks, { type: mimeType });
      const part = String(rec.segmentIndex || 1).padStart(3, '0');
      const ext = recordingFileExt(mimeType);
      downloadBlob(blob, `roomgrid-${safeFilePart(roomId)}-${stampForFile()}-part${part}${recordingReasonSuffix(reason)}.${ext}`);
      rec.savedSegments = (Number(rec.savedSegments) || 0) + 1;
      rec.savedBytes = (Number(rec.savedBytes) || 0) + blob.size;
      rec.lastSavedAt = Date.now();
      recordingLog.unshift({ roomId, reason, ts: Date.now(), size: blob.size, part, ext });
      recordingLog.splice(80);
      return true;
    }

    function finishCurrentRecordingSegment(roomId, rec, reason) {
      if (!rec || rec.stopping) return;
      try { clearTimeout(rec.timer); } catch (_) {}
      rec.timer = null;
      rec.stopReason = reason;
      const recorder = rec.recorder;
      if (recorder && recorder.state !== 'inactive') {
        rec.stopping = true;
        try { recorder.requestData?.(); } catch (_) {}
        try { recorder.stop(); } catch (_) { handleRecorderStop(roomId, rec); }
      } else {
        handleRecorderStop(roomId, rec);
      }
    }

    function handleRecorderStop(roomId, rec) {
      if (!rec) return;
      const reason = rec.stopReason || (rec.manualStop ? 'manual' : 'segment');
      try { clearTimeout(rec.timer); } catch (_) {}
      rec.timer = null;
      rec.stopping = false;
      const hadData = saveRecordingSegment(roomId, rec, reason);
      cleanupRecordingStream(rec);
      rec.recorder = null;
      rec.chunks = [];

      if (recordings.get(roomId) !== rec) return;

      if (rec.manualStop || reason === 'final' || reason === 'manual') {
        recordings.delete(roomId);
        setRecordingIntent(roomId, false);
        updateCardButtons(roomId);
        if (!rec.silentStop) toast(hadData ? t('recordingFinalSaved') : t('recordingNoData'));
        return;
      }

      if (reason === 'source-loss') {
        rec.waitingForSource = true;
        updateCardButtons(roomId);
        if (!rec.sourceLossToastShown && !rec.silentStop) {
          rec.sourceLossToastShown = true;
          toast(t('recordingPausedSource'));
        }
        return;
      }

      if (reason === 'segment') {
        if (hadData && !rec.silentStop) toast(t('recordingSegmentSaved'));
        if (!startRecordingSegment(roomId, rec)) {
          rec.waitingForSource = true;
          updateCardButtons(roomId);
          if (!rec.sourceLossToastShown && !rec.silentStop) {
            rec.sourceLossToastShown = true;
            toast(t('recordingPausedSource'));
          }
        }
      }
    }

    function startRecordingSegment(roomId, rec) {
      const video = getRecordingVideo(roomId);
      const stream = createRecordingStream(video);
      if (!stream) return false;

      const mimeType = recordingMimeType();
      const options = { videoBitsPerSecond: recordingVideoBitrate() };
      if (mimeType) options.mimeType = mimeType;

      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (_) {
        try { stream.getTracks().forEach(track => track.stop()); } catch (e) {}
        return false;
      }

      rec.roomId = roomId;
      rec.stream = stream;
      rec.recorder = recorder;
      rec.mimeType = mimeType || 'video/webm';
      rec.chunks = [];
      rec.startedAt = Date.now();
      rec.segmentIndex = (Number(rec.segmentIndex) || 0) + 1;
      rec.waitingForSource = false;
      rec.sourceLossToastShown = false;
      rec.manualStop = false;
      rec.silentStop = false;
      rec.stopReason = '';

      recorder.ondataavailable = ev => { if (ev.data && ev.data.size) rec.chunks.push(ev.data); };
      recorder.onstop = () => handleRecorderStop(roomId, rec);

      try {
        recorder.start(1000);
      } catch (_) {
        cleanupRecordingStream(rec);
        rec.recorder = null;
        rec.chunks = [];
        return false;
      }

      rec.timer = setTimeout(() => {
        const current = recordings.get(roomId);
        if (current === rec && !rec.manualStop && !rec.waitingForSource) {
          finishCurrentRecordingSegment(roomId, rec, 'segment');
        }
      }, recordingSegmentMs());
      updateCardButtons(roomId);
      return true;
    }

    function startCardRecording(roomId, options = {}) {
      if (recordings.has(roomId)) return;
      const opts = options && typeof options === 'object' ? options : {};
      if (!opts.skipConfirm && !confirm(t('recordingConsent'))) return;
      const rec = { roomId, segmentIndex: 0, chunks: [] };
      recordings.set(roomId, rec);
      if (!startRecordingSegment(roomId, rec)) {
        if (opts.waitForSource) {
          rec.waitingForSource = true;
          rec.sourceLossToastShown = true;
          rec.startedAt = Date.now();
          setRecordingIntent(roomId, true);
          updateCardButtons(roomId);
          return;
        }
        recordings.delete(roomId);
        updateCardButtons(roomId);
        toast(t('recordingUnsupported'));
        return;
      }
      setRecordingIntent(roomId, true);
      toast(t('recordingStarted'));
    }

    function pauseRecordingForSourceLoss(roomId, opts = {}) {
      const rec = recordings.get(roomId);
      if (!rec || rec.manualStop) return false;
      if (rec.waitingForSource && !rec.recorder) return false;
      rec.waitingForSource = true;
      rec.silentStop = !!opts.silent;
      finishCurrentRecordingSegment(roomId, rec, 'source-loss');
      updateCardButtons(roomId);
      return true;
    }

    function resumeWaitingRecording(roomId) {
      const rec = recordings.get(roomId);
      if (!rec || !rec.waitingForSource || rec.manualStop || rec.recorder) return false;
      if (!startRecordingSegment(roomId, rec)) return false;
      toast(t('recordingResumed'));
      return true;
    }

    function stopCardRecording(roomId, options = false) {
      const rec = recordings.get(roomId);
      if (!rec) return;
      const opts = typeof options === 'boolean' ? { silent: options, final: true } : (options || {});
      rec.manualStop = true;
      rec.waitingForSource = false;
      rec.silentStop = !!opts.silent;
      if (rec.recorder) {
        finishCurrentRecordingSegment(roomId, rec, opts.final === false ? 'manual' : 'final');
      } else {
        cleanupRecordingStream(rec);
        recordings.delete(roomId);
        setRecordingIntent(roomId, false);
        updateCardButtons(roomId);
        if (!rec.silentStop) toast(t('recordingNoData'));
      }
    }

    function toggleCardRecording(roomId) {
      if (recordings.has(roomId)) stopCardRecording(roomId);
      else startCardRecording(roomId);
    }

    function stopAllRecordings(options = {}) {
      [...recordings.keys()].forEach(id => stopCardRecording(id, options));
    }

    function openRecordingSettings() {
      openRecordingSettingsPanel();
    }

    function fmtDuration(ms) {
      const sec = Math.max(0, Math.floor(Number(ms || 0) / 1000));
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
    }

    function fmtBytes(bytes) {
      const n = Math.max(0, Number(bytes) || 0);
      if (n < 1024) return `${n} B`;
      if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
      if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
      return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
    }

    function openToolPanel(title, build) {
      closeTransientUi();
      document.querySelectorAll('.roomgrid-modal-backdrop').forEach(el => { try { el.remove(); } catch (_) {} });
      const backdrop = $('div', { class: 'roomgrid-modal-backdrop' });
      const panel = $('div', { class: 'roomgrid-modal', style: { width: 'min(760px, calc(100vw - 36px))', maxHeight: 'min(780px, calc(100vh - 36px))', overflowY: 'auto' } });
      const head = $('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' } }, [
        $('div', { class: 'roomgrid-modal-title', style: { marginBottom: '0' } }, title),
        $('button', { class: 'ctrl-btn', onclick: () => close() }, '×'),
      ]);
      const body = $('div');
      let cleanup = null;
      const close = () => {
        try { cleanup?.(); } catch (_) {}
        try { backdrop.remove(); } catch (_) {}
      };
      backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
      panel.append(head, body);
      backdrop.appendChild(panel);
      document.body.appendChild(backdrop);
      cleanup = build?.(body, close) || null;
      return { body, close };
    }

    function handleAddRoomToSplit(roomId) {
      roomId = normalizeUsername(roomId);
      if (!store.state.rooms.some(room => room.id === roomId)) return;
      const ids = [...store.state.settings.splitRoomIds];
      if (ids.includes(roomId)) {
        if (ids.length === 2) store.setSplitActive(true);
        else toast(t('splitAlreadyAdded'));
        return;
      }
      if (ids.length < 2) {
        const slot = ids.length;
        store.setSplitSlot(slot, roomId);
        if (slot === 0) toast(t('splitAddedFirst', roomId));
        return;
      }
      openSplitSlotChooser(roomId);
    }

    function openSplitSlotChooser(roomId) {
      const ids = [...store.state.settings.splitRoomIds];
      openToolPanel(t('splitChoosePane'), (body, close) => {
        const choices = $('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '10px' } });
        [0, 1].forEach(slot => {
          const current = ids[slot] || '—';
          choices.appendChild($('button', {
            class: 'ctrl-btn primary',
            style: { minHeight: '64px', whiteSpace: 'normal' },
            onclick: () => { store.setSplitSlot(slot, roomId); close(); },
          }, t('splitReplacePane', slot + 1, current)));
        });
        body.append(
          $('div', { class: 'roomgrid-modal-hint' }, roomId),
          choices,
        );
      });
    }

    function splitPreviewSnapshotUrl(roomId, fallback = false) {
      const id = encodeURIComponent(normalizeUsername(roomId));
      const stamp = Date.now();
      return fallback
        ? `https://jpeg.live.mmcdn.com/minifwap/${id}.jpg?f=${stamp}`
        : `https://jpeg.live.mmcdn.com/stream?room=${id}&f=${stamp}`;
    }

    function openSplitPicker(slot) {
      slot = slot === 1 ? 1 : 0;
      const otherId = store.state.settings.splitRoomIds[slot === 0 ? 1 : 0] || null;
      openToolPanel(t('splitPickerTitle', slot + 1), (body, close) => {
        let mode = 'onlineFavorites';
        let previewRoom = null;
        let previewTimer = 0;
        let previewFallback = false;
        const search = $('input', { class: 'ctrl-input', type: 'search', placeholder: t('splitPickerSearch'), style: { width: '100%' } });
        const tabs = $('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: '6px', margin: '10px 0' } });
        const list = $('div', { style: { display: 'grid', gap: '6px', maxHeight: 'min(58vh,520px)', overflowY: 'auto', paddingRight: '2px' } });
        const previewName = $('div', { class: 'split-preview-name' });
        const previewImage = $('img', { alt: '' });
        const previewStatus = $('div', { class: 'split-preview-status' }, t('splitQuickPreview'));
        const previewUseBtn = $('button', { class: 'ctrl-btn primary' });
        const previewPanel = $('div', { class: 'split-quick-preview' }, [
          $('div', { class: 'split-preview-head' }, [
            previewName,
            $('button', { class: 'ctrl-btn', title: t('splitPreviewClose'), html: trustedHtml(iconSvg('close', 17)), onclick: () => closePreview() }),
          ]),
          $('div', { class: 'split-preview-frame' }, [previewImage, previewStatus]),
          $('div', { class: 'split-preview-actions' }, [
            $('button', { class: 'ctrl-btn', title: t('splitPreviewRefresh'), html: trustedHtml(iconLabel('refresh', t('splitPreviewRefresh'), 16)), onclick: () => refreshPreview() }),
            previewUseBtn,
          ]),
        ]);
        const modes = [
          ['onlineFavorites', t('splitOnlineFavorites')],
          ['online', t('splitOnline')],
          ['favorites', t('splitFavorites')],
          ['all', t('splitAllSaved')],
        ];

        function closePreview() {
          clearInterval(previewTimer);
          previewTimer = 0;
          previewRoom = null;
          previewPanel.classList.remove('is-open');
          previewImage.removeAttribute('src');
        }
        function refreshPreview() {
          if (!previewRoom) return;
          previewFallback = false;
          previewStatus.textContent = statusMeta(previewRoom.lastStatus).label;
          previewImage.src = splitPreviewSnapshotUrl(previewRoom.id, false);
        }
        function openPreview(room) {
          clearInterval(previewTimer);
          previewRoom = room;
          previewName.textContent = room.id;
          previewImage.alt = `${t('splitQuickPreview')}: ${room.id}`;
          previewPanel.classList.add('is-open');
          const blocked = room.id === otherId || store.state.settings.splitRoomIds[slot] === room.id;
          previewUseBtn.disabled = blocked;
          previewUseBtn.textContent = room.id === otherId
            ? t('splitOtherPane')
            : (store.state.settings.splitRoomIds[slot] === room.id ? t('splitCurrentPane') : t('splitPreviewUse', slot + 1));
          previewUseBtn.onclick = () => {
            if (blocked) return;
            store.setSplitSlot(slot, room.id);
            close();
          };
          refreshPreview();
          previewTimer = setInterval(refreshPreview, 2200);
          requestAnimationFrame(() => previewPanel.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
        previewImage.addEventListener('load', () => {
          if (previewRoom) previewStatus.textContent = statusMeta(previewRoom.lastStatus).label;
        });
        previewImage.addEventListener('error', () => {
          if (!previewRoom) return;
          if (!previewFallback) {
            previewFallback = true;
            previewImage.src = splitPreviewSnapshotUrl(previewRoom.id, true);
          } else previewStatus.textContent = t('splitPreviewUnavailable');
        });

        const bindLongPressPreview = (target, room) => {
          let timer = 0;
          let longPressed = false;
          let startX = 0;
          let startY = 0;
          const cancel = () => { clearTimeout(timer); timer = 0; };
          target.addEventListener('pointerdown', event => {
            if (event.button !== 0) return;
            cancel();
            longPressed = false;
            startX = event.clientX;
            startY = event.clientY;
            timer = setTimeout(() => { longPressed = true; openPreview(room); }, 480);
          }, { passive: true });
          target.addEventListener('pointermove', event => {
            if (Math.abs(event.clientX - startX) > 10 || Math.abs(event.clientY - startY) > 10) cancel();
          }, { passive: true });
          target.addEventListener('pointerup', cancel, { passive: true });
          target.addEventListener('pointercancel', cancel, { passive: true });
          target.addEventListener('click', event => {
            if (!longPressed) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            longPressed = false;
          }, true);
          target.addEventListener('contextmenu', event => {
            event.preventDefault();
            openPreview(room);
          });
        };

        const render = () => {
          const q = normalizeUsername(search.value || '');
          tabs.querySelectorAll('button').forEach(btn => btn.classList.toggle('primary', btn.dataset.mode === mode));
          let rooms = [...store.state.rooms];
          if (mode === 'onlineFavorites') rooms = rooms.filter(room => roomInGroup(room, ONLINE_FAVORITES_GROUP_ID));
          else if (mode === 'online') rooms = rooms.filter(room => room.lastStatus === 'online');
          else if (mode === 'favorites') rooms = rooms.filter(room => roomInGroup(room, FAVORITE_GROUP_ID));
          if (q) rooms = rooms.filter(room => room.id.includes(q));
          rooms.sort((a, b) => (b.lastStatus === 'online' ? 1 : 0) - (a.lastStatus === 'online' ? 1 : 0) || a.id.localeCompare(b.id));
          list.replaceChildren();
          if (!rooms.length) {
            list.appendChild($('div', { class: 'roomgrid-modal-hint', style: { padding: '18px 4px' } }, t('splitNoMatches')));
            return;
          }
          rooms.forEach(room => {
            const meta = statusMeta(room.lastStatus);
            const inOtherPane = room.id === otherId;
            const currentPane = store.state.settings.splitRoomIds[slot] === room.id;
            const selectBtn = $('button', {
              class: 'ctrl-btn split-picker-select',
              disabled: inOtherPane || currentPane,
              title: inOtherPane ? t('splitOtherPane') : room.id,
              onclick: () => { store.setSplitSlot(slot, room.id); close(); },
            }, [
              $('span', { class: 'dot', style: { background: meta.color } }),
              $('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '750' } }, room.id),
              $('span', { style: { color: 'var(--text-muted)', fontSize: '11px' } }, inOtherPane ? t('splitOtherPane') : meta.label),
            ]);
            const previewBtn = $('button', {
              class: 'ctrl-btn split-picker-preview-btn',
              title: `${t('splitQuickPreview')}: ${room.id}`,
              html: trustedHtml(iconSvg('clean', 18)),
              onclick: () => openPreview(room),
            });
            const row = $('div', { class: 'split-picker-row', dataset: { roomId: room.id } }, [selectBtn, previewBtn]);
            bindLongPressPreview(selectBtn, room);
            list.appendChild(row);
          });
        };
        modes.forEach(([key, label]) => tabs.appendChild($('button', {
          class: 'ctrl-btn' + (key === mode ? ' primary' : ''),
          dataset: { mode: key },
          onclick: () => { mode = key; render(); },
        }, label)));
        search.addEventListener('input', debounce(render, 80));
        body.append(
          $('div', { class: 'roomgrid-modal-hint', style: { marginBottom: '8px' } }, t('splitPreviewHint')),
          previewPanel,
          search,
          tabs,
          list,
        );
        render();
        setTimeout(() => search.focus(), 0);
        return closePreview;
      });
    }

    function openSplitViewOrPicker() {
      const ids = store.state.settings.splitRoomIds;
      if (ids.length === 2) store.setSplitActive(true);
      else openSplitPicker(ids.length ? 1 : 0);
    }

    function buildShareSnapshot() {
      const snapshot = sanitizeState({
        ...store.state,
        settings: {
          ...store.state.settings,
          pageIndex: 0,
          focusedRoomId: null,
          pureMode: false,
          viewerMode: false,
          toolbarCollapsed: false,
          sidebarCollapsed: false,
          showRecordingOnly: false,
        },
      });
      return snapshot;
    }

    function buildShareLink() {
      const url = new URL(location.href);
      url.searchParams.set('multicam_mode', '1');
      url.hash = 'roomgrid=' + encodeSharePayload(buildShareSnapshot());
      return url.toString();
    }

    async function openSharePanel() {
      openToolPanel(t('sharePanel'), (body) => {
        const link = buildShareLink();
        const input = $('textarea', {
          class: 'roomgrid-modal-textarea',
          readonly: true,
          value: link,
          style: { minHeight: '120px' },
          onclick: (e) => e.currentTarget.select(),
        });
        body.append(
          $('div', { class: 'roomgrid-modal-hint' }, t('shareLinkHint')),
          input,
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn primary', onclick: async () => {
              await copyText(link);
              toast(t('copied'));
            } }, t('shareCopyLink')),
          ]),
        );
      });
    }

    function loadSharedWorkspaceFromHash() {
      const hash = String(location.hash || '').replace(/^#/, '');
      const payload = hash.startsWith('roomgrid=') ? hash.slice('roomgrid='.length) : '';
      if (!payload) return false;
      try {
        const shared = sanitizeState(decodeSharePayload(payload));
        if (!shared.rooms.length) throw new Error('empty share');
        if (!confirm(t('shareImportPrompt', shared.rooms.length))) return false;
        backupCurrentConfig();
        store.replaceState(shared, 'all');
        toast(t('shareImported'));
        try {
          const url = new URL(location.href);
          url.hash = '';
          history.replaceState(null, '', url.toString());
        } catch (_) {}
        return true;
      } catch (err) {
        console.warn('[RoomGrid] shared workspace import failed', err);
        toast(t('shareInvalid'));
        return false;
      }
    }

    function currentPageRoomIds() {
      const gridRect = grid.getBoundingClientRect();
      const visibleIds = [...grid.querySelectorAll('.cam-card[data-room-id]')]
        .filter(card => {
          const rect = card.getBoundingClientRect();
          return rect.bottom > gridRect.top && rect.top < gridRect.bottom && rect.right > gridRect.left && rect.left < gridRect.right;
        })
        .map(card => card.dataset.roomId)
        .filter(Boolean);
      return visibleIds.length ? [...new Set(visibleIds)] : fullVisibleRooms().slice(0, layoutSize()).map(r => r.id);
    }

    function currentGroupRoomIds() {
      return fullVisibleRooms().map(r => r.id);
    }

    function recordRoomIds(ids) {
      const clean = [...new Set((ids || []).map(normalizeUsername).filter(Boolean))];
      if (!clean.length) return;
      if (!confirm(t('recordingConsent'))) return;
      clean.forEach(id => startCardRecording(id, { skipConfirm: true, waitForSource: true }));
      renderGrid();
    }

    function recordCurrentPage() {
      recordRoomIds(currentPageRoomIds());
    }

    function recordCurrentGroup() {
      recordRoomIds(currentGroupRoomIds());
    }

    function recordOnlineRooms() {
      recordRoomIds(fullVisibleRooms().filter(r => r.lastStatus === 'online').map(r => r.id));
    }

    function pauseCurrentPage() {
      const ids = currentPageRoomIds();
      service.pauseAll(ids);
      requestAnimationFrame(() => ids.forEach(updateCardButtons));
      toast(t('pausedVisible'));
    }

    function openCurrentPageRooms() {
      currentPageRoomIds().forEach(id => openNoopener(location.origin + '/' + id + '/'));
    }

    function moveCurrentPageToGroup() {
      const name = prompt(t('newGroupPrompt'));
      if (!name || !name.trim()) return;
      const safeName = safeGroupName(name, '');
      let group = store.state.groups.find(g => safeGroupName(g.name, g.id).toLowerCase() === safeName.toLowerCase());
      const groupId = group?.id || store.addGroup(safeName);
      currentPageRoomIds().forEach(id => store.moveToGroup(id, groupId));
    }

    function queueRecordingIntent(roomId) {
      roomId = normalizeUsername(roomId);
      if (!roomId || recordings.has(roomId)) return;
      recordings.set(roomId, {
        roomId,
        segmentIndex: 0,
        chunks: [],
        waitingForSource: true,
        sourceLossToastShown: true,
        startedAt: Date.now(),
      });
      setRecordingIntent(roomId, true);
      updateCardButtons(roomId);
      if (findRoomAny(roomId)?.lastStatus === 'online') resumeWaitingRecording(roomId);
      else if (service.has(roomId)) service.refresh(roomId);
      else service.start(roomId);
    }

    function checkRecordingIntentRecovery() {
      const ids = loadRecordingIntents().filter(id => findRoomAny(id));
      if (!ids.length) return;
      if (!confirm(t('recordingRecoverPrompt', ids.length))) {
        saveRecordingIntents([]);
        return;
      }
      ids.forEach(queueRecordingIntent);
      renderGrid();
    }

    function renderRecordingCenterBody(body) {
      body.replaceChildren();
      const actions = $('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' } }, [
        $('button', { class: 'ctrl-btn primary', onclick: recordCurrentPage }, t('recordCurrentPage')),
        $('button', { class: 'ctrl-btn', onclick: recordCurrentGroup }, t('recordCurrentGroup')),
        $('button', { class: 'ctrl-btn', onclick: recordOnlineRooms }, t('recordOnlineRooms')),
        $('button', { class: 'ctrl-btn', onclick: () => { store.patchSettings({ showRecordingOnly: !store.state.settings.showRecordingOnly, pageIndex: 0 }); } }, store.state.settings.showRecordingOnly ? t('hideRecordingOnly') : t('showRecordingOnly')),
        $('button', { class: 'ctrl-btn danger', onclick: () => stopAllRecordings({ final: true }) }, t('stopAllRecordings')),
      ]);
      body.appendChild(actions);

      const rows = [...recordings.entries()];
      if (!rows.length) {
        body.appendChild($('div', { class: 'roomgrid-modal-hint' }, t('recordingCenterEmpty')));
      } else {
        const table = $('div', { style: { display: 'grid', gap: '8px' } });
        rows.forEach(([id, rec]) => {
          const status = rec.waitingForSource ? t('recordingWaitingShort') : t('recordingActive');
          const duration = rec.startedAt ? fmtDuration(Date.now() - rec.startedAt) : '0:00';
          table.appendChild($('div', { style: { border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' } }, [
            $('div', {}, [
              $('div', { style: { fontWeight: '750' } }, id),
              $('div', { style: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' } },
                `${status} · ${t('recordingDuration')}: ${duration} · ${t('recordingSavedSegments')}: ${Number(rec.savedSegments) || 0} · ${t('recordingBitrate')}: ${(recordingVideoBitrate() / 1000000).toFixed(1)} Mbps`),
            ]),
            $('button', { class: 'ctrl-btn danger', onclick: () => stopCardRecording(id) }, t('opRecordStop')),
          ]));
        });
        body.appendChild(table);
      }

      if (recordingLog.length) {
        body.appendChild($('div', { class: 'roomgrid-modal-title', style: { marginTop: '14px' } }, LANG === 'zh' ? '最近保存' : 'Recent saves'));
        body.appendChild($('div', { style: { display: 'grid', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' } },
          recordingLog.slice(0, 12).map(log => $('div', {}, `${new Date(log.ts).toLocaleTimeString()} · ${log.roomId} · ${log.ext.toUpperCase()} · ${fmtBytes(log.size)}`))));
      }
    }

    function openRecordingCenter() {
      openToolPanel(t('recordingCenter'), (body) => {
        renderRecordingCenterBody(body);
        const timer = setInterval(() => renderRecordingCenterBody(body), 1000);
        return () => clearInterval(timer);
      });
    }

    function openRecordingSettingsPanel() {
      const curMinutes = clampInt(store.state.settings.recordingSegmentMinutes, 1, 180, 10);
      const curMbps = Math.round(recordingVideoBitrate() / 100000) / 10;
      openToolPanel(t('recordingSettingsTitle'), (body, close) => {
        const minutesInput = $('input', { class: 'ctrl-input', type: 'number', min: '1', max: '180', value: String(curMinutes), style: { width: '100%' } });
        const bitrateInput = $('input', { class: 'ctrl-input', type: 'number', min: '0.5', max: '20', step: '0.5', value: String(curMbps), style: { width: '100%' } });
        const exitWarn = $('input', { type: 'checkbox', checked: store.state.settings.recordingExitWarn !== false });
        body.append(
          $('div', { class: 'roomgrid-modal-hint' }, t('recordingFormatHint')),
          $('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } }, [
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [t('recordingSegmentPrompt'), minutesInput]),
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [t('recordingBitratePrompt'), bitrateInput]),
          ]),
          $('label', { class: 'toggle', style: { marginTop: '10px' } }, [exitWarn, t('recordingExitWarnToggle')]),
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn', onclick: close }, t('importReviewCancel')),
            $('button', { class: 'ctrl-btn primary', onclick: () => {
              const minutes = clampInt(minutesInput.value, 1, 180, curMinutes);
              const bitrate = clampInt(Number(bitrateInput.value) * 1000000, 500000, 20000000, recordingVideoBitrate());
              store.patchSettings({ recordingSegmentMinutes: minutes, recordingVideoBitrate: bitrate, recordingExitWarn: !!exitWarn.checked });
              toast(t('recordingSettingsSaved'));
              close();
            } }, t('saveSettings')),
          ]),
        );
      });
    }

    function openLayoutSettings() {
      openToolPanel(t('layoutSettings'), (body, close) => {
        const layout = $('select', { class: 'ctrl-input' }, [2, 4, 6, 9].map(n => $('option', { value: String(n), selected: Number(store.state.settings.layoutSize) === n }, LANG === 'zh' ? `${n} 位可见` : `${n} visible`)));
        const phoneLayout = $('select', { class: 'ctrl-input' }, [2, 4, 6, 9].map(n => $('option', { value: String(n), selected: Number(store.state.settings.phoneLayoutSize) === n }, LANG === 'zh' ? `${n} 位可见` : `${n} visible`)));
        const mainW = $('input', { class: 'ctrl-input', type: 'number', min: '45', max: '76', value: String(store.state.settings.focusMainPct || 62) });
        const mainH = $('input', { class: 'ctrl-input', type: 'number', min: '44', max: '78', value: String(store.state.settings.focusMainHPct || 64) });
        const thumb = $('input', { class: 'ctrl-input', type: 'number', min: '96', max: '260', value: String(store.state.settings.focusThumbSize || 150) });
        const notify = $('input', { type: 'checkbox', checked: !!store.state.settings.notifyOnline });
        const notifyFavoritesOnly = $('input', { type: 'checkbox', checked: !!store.state.settings.notifyFavoritesOnly, disabled: !store.state.settings.notifyOnline });
        const startOnOnlineFavorites = $('input', { type: 'checkbox', checked: !!store.state.settings.startOnOnlineFavorites });
        const phoneModeAuto = $('input', { type: 'checkbox', checked: store.state.settings.phoneModeAuto !== false });
        notify.addEventListener('change', () => { notifyFavoritesOnly.disabled = !notify.checked; });
        body.append(
          $('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' } }, [
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [LANG === 'zh' ? '网格单屏可见' : 'Grid visible models', layout]),
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [LANG === 'zh' ? '手机单屏可见' : 'Phone visible models', phoneLayout]),
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [t('hintThumbSize'), thumb]),
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [LANG === 'zh' ? '主屏宽度' : 'Main width', mainW]),
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [LANG === 'zh' ? '主屏高度' : 'Main height', mainH]),
          ]),
          $('label', { class: 'toggle', style: { marginTop: '10px' } }, [phoneModeAuto, t('phoneAutoMode')]),
          $('label', { class: 'toggle', style: { marginTop: '10px' } }, [notify, t('notifyOnline')]),
          $('label', { class: 'toggle', style: { marginTop: '8px' } }, [notifyFavoritesOnly, t('notifyFavoritesOnly')]),
          $('label', { class: 'toggle', style: { marginTop: '8px' } }, [startOnOnlineFavorites, t('startOnOnlineFavorites')]),
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn', onclick: close }, t('importReviewCancel')),
            $('button', { class: 'ctrl-btn primary', onclick: async () => {
              if (notify.checked && !store.state.settings.notifyOnline) await Notify.request();
              store.patchSettings({
                layoutSize: Number(layout.value),
                phoneLayoutSize: Number(phoneLayout.value),
                phoneModeAuto: !!phoneModeAuto.checked,
                ...(phoneEnvironment && phoneModeAuto.checked ? { viewMode: 'phone', sidebarCollapsed: true } : {}),
                focusMainPct: clampInt(mainW.value, 45, 76, 62),
                focusMainHPct: clampInt(mainH.value, 44, 78, 64),
                focusThumbSize: clampInt(thumb.value, 96, 260, 150),
                notifyOnline: !!notify.checked,
                notifyFavoritesOnly: !!notifyFavoritesOnly.checked,
                startOnOnlineFavorites: !!startOnOnlineFavorites.checked,
              });
              close();
            } }, t('saveSettings')),
          ]),
        );
      });
    }

    function openPlaybackSettingsPanel() {
      openToolPanel(t('playbackSettingsTitle'), (body, close) => {
        const quality = $('select', { class: 'ctrl-input' }, [
          $('option', { value: '0' }, t('maxQualityAuto')),
          ...[240, 360, 480, 720, 1080, 1440, 2160].map(n => $('option', { value: String(n) }, `${n}p`)),
        ]);
        quality.value = String(Number(store.state.settings.maxStreamHeight) || 0);
        const freeZoom = $('input', { type: 'checkbox', checked: store.state.settings.freeZoom !== false });
        body.append(
          $('div', { style: { display: 'grid', gridTemplateColumns: '1fr', gap: '10px' } }, [
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [t('maxStreamHeight'), quality]),
            $('label', { class: 'toggle' }, [freeZoom, t('freeZoomLabel')]),
          ]),
          $('div', { class: 'roomgrid-modal-hint', style: { marginTop: '10px' } }, t('freeZoomHint')),
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn', onclick: close }, t('importReviewCancel')),
            $('button', { class: 'ctrl-btn primary', onclick: () => {
              store.patchSettings({ maxStreamHeight: Number(quality.value) || 0, freeZoom: !!freeZoom.checked });
              service.refreshQuality();
              close();
            } }, t('saveSettings')),
          ]),
        );
      });
    }

    function openBackupPanel() {
      openToolPanel(t('backupPanel'), (body) => {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(CONFIG_BACKUP_PREFIX)) keys.push(key);
        }
        keys.sort((a, b) => Number(b.slice(CONFIG_BACKUP_PREFIX.length)) - Number(a.slice(CONFIG_BACKUP_PREFIX.length)));
        if (!keys.length) { body.appendChild($('div', { class: 'roomgrid-modal-hint' }, t('noBackups'))); return; }
        keys.forEach(key => {
          const ts = Number(key.slice(CONFIG_BACKUP_PREFIX.length));
          body.appendChild($('div', { style: { display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '8px 0' } }, [
            $('div', {}, Number.isFinite(ts) ? new Date(ts).toLocaleString() : key),
            $('button', { class: 'ctrl-btn', onclick: () => { const raw = localStorage.getItem(key); if (raw) { backupCurrentConfig(); localStorage.setItem(STORE_KEY, raw); location.reload(); } } }, t('restoreBackup')),
            $('button', { class: 'ctrl-btn danger', onclick: () => { localStorage.removeItem(key); openBackupPanel(); } }, t('deleteBackup')),
          ]));
        });
      });
    }

    function openStatusHistoryPanel() {
      openToolPanel(t('statusHistory'), (body) => {
        const all = loadRoomStatusHistory();
        const rows = Object.entries(all).flatMap(([id, list]) => (Array.isArray(list) ? list : []).map(item => ({ id, ...item })))
          .sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0))
          .slice(0, 120);
        if (!rows.length) { body.appendChild($('div', { class: 'roomgrid-modal-hint' }, t('noStatusHistory'))); return; }
        rows.forEach(row => {
          body.appendChild($('div', { style: { display: 'grid', gridTemplateColumns: '150px 1fr auto', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' } }, [
            $('span', { style: { color: 'var(--text-muted)' } }, new Date(row.ts).toLocaleString()),
            $('span', {}, row.id),
            $('span', { style: { fontWeight: '750' } }, row.privateLabel || row.status),
          ]));
        });
      });
    }

    function openGroupRulesPanel() {
      openToolPanel(t('groupRules'), (body, close) => {
        const favorite = $('input', { type: 'checkbox', checked: store.state.settings.favoriteFirst !== false });
        body.append(
          $('label', { class: 'toggle' }, [favorite, t('favoriteFirst')]),
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn', onclick: close }, t('importReviewCancel')),
            $('button', { class: 'ctrl-btn primary', onclick: () => { store.patchSettings({ favoriteFirst: !!favorite.checked }); close(); } }, t('saveSettings')),
          ]),
        );
      });
    }

    function openTemporaryUrlManager() {
      openToolPanel(t('tempUrlManager'), (body) => {
        const saved = readJsonStorage(SAVED_TEMP_URLS_KEY, []);
        const current = tempRooms.filter(r => r.sourceUrl);
        body.appendChild($('button', { class: 'ctrl-btn primary', onclick: () => {
          const next = [...new Map([...saved, ...current.map(r => ({ url: r.sourceUrl, name: r.displayName || r.id }))].filter(x => x?.url).map(x => [x.url, x])).values()];
          writeJsonStorage(SAVED_TEMP_URLS_KEY, next.slice(0, 80));
          toast(t('copied'));
        } }, t('saveTempUrls')));
        const rows = [...saved, ...current.map(r => ({ url: r.sourceUrl, name: r.displayName || r.id }))];
        if (!rows.length) body.appendChild($('div', { class: 'roomgrid-modal-hint', style: { marginTop: '10px' } }, t('noTempUrls')));
        rows.forEach(row => body.appendChild($('div', { style: { padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px', wordBreak: 'break-all' } }, `${row.name || ''} ${row.url || ''}`)));
      });
    }

    function exportWorkstationSettings() {
      exportSuiteSettings(store.state);
    }

    function importWorkstationSettings() {
      importSuiteSettingsFromGithub({
        onImported: result => {
          document.querySelectorAll('.roomgrid-modal-backdrop').forEach(el => { try { el.remove(); } catch (_) {} });
          toast(t(result.roomsReplaced ? 'settingsImported' : 'settingsImportedLegacy'));
        },
      });
    }

    function openSettingsCenter() {
      openToolPanel(t('settingsCenter'), (body) => {
        const action = (label, handler, primary = false) => $('button', {
          class: 'ctrl-btn' + (primary ? ' primary' : ''),
          style: { minHeight: '44px', justifyContent: 'flex-start' },
          onclick: handler,
        }, label);
        body.append(
          $('div', { class: 'roomgrid-modal-hint' }, t('settingsOnlyHint')),
          $('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '9px' } }, [
            action(t('layoutSettings'), () => openLayoutSettings()),
            action(t('playbackSettingsTitle'), () => openPlaybackSettingsPanel()),
            action(t('recordingSettingsTitle'), () => openRecordingSettingsPanel()),
            action(t('shortcutPanel'), () => openShortcutPanel()),
            action(t('settingsExport'), () => exportWorkstationSettings(), true),
            action(t('settingsImport'), () => importWorkstationSettings(), true),
            action('Configure GitHub Cloud', () => openGithubSyncSetup()),
            action('Download local backup', () => exportSuiteSettingsLocal(store.state)),
            action('Import local backup', () => importSuiteSettingsFile({ onImported: result => toast(t(result.roomsReplaced ? 'settingsImported' : 'settingsImportedLegacy')) })),
          ]),
        );
      });
    }

    function openShortcutPanel() {
      openToolPanel(t('shortcutPanel'), (body, close) => {
        const actions = [
          ['focusAdd', t('shortcutFocusAdd')],
          ['refreshAll', t('shortcutRefreshAll')],
          ['gridView', t('shortcutGridView')],
          ['focusView', t('shortcutFocusView')],
          ['pureMode', t('shortcutPureMode')],
          ['viewerMode', t('shortcutViewerMode')],
          ['focusThumbs', t('shortcutFocusThumbs')],
          ['recordingCenter', t('shortcutRecordingCenter')],
          ['recordPage', t('shortcutRecordPage')],
          ['openRoom', t('shortcutOpenRoom')],
        ];
        const current = sanitizeShortcuts(store.state.settings.shortcuts, defaultShortcuts());
        const inputs = {};
        const gridBox = $('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(160px,1fr) minmax(140px,220px)', gap: '8px 10px', alignItems: 'center' } });
        actions.forEach(([action, label]) => {
          const input = $('input', {
            class: 'ctrl-input',
            value: shortcutLabel(current[action]),
            readonly: true,
            onkeydown: (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.key === 'Backspace' || e.key === 'Delete') {
                input.dataset.spec = '';
                input.value = '';
                return;
              }
              const spec = shortcutFromEvent(e);
              if (!spec) return;
              input.dataset.spec = spec;
              input.value = shortcutLabel(spec);
            },
          });
          input.dataset.spec = current[action];
          inputs[action] = input;
          gridBox.append($('div', { style: { fontSize: '12px', color: 'var(--text-muted)' } }, label), input);
        });
        body.append(
          $('div', { class: 'roomgrid-modal-hint' }, t('shortcutCaptureHint')),
          gridBox,
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn', onclick: () => {
              const defaults = defaultShortcuts();
              for (const [action, input] of Object.entries(inputs)) {
                input.dataset.spec = defaults[action] || '';
                input.value = shortcutLabel(defaults[action] || '');
              }
            } }, t('resetShortcuts')),
            $('button', { class: 'ctrl-btn', onclick: close }, t('importReviewCancel')),
            $('button', { class: 'ctrl-btn primary', onclick: () => {
              const next = {};
              for (const [action, input] of Object.entries(inputs)) next[action] = normalizeShortcutSpec(input.dataset.spec || '');
              store.patchSettings({ shortcuts: sanitizeShortcuts(next, defaultShortcuts()) });
              close();
            } }, t('saveSettings')),
          ]),
        );
      });
    }

    function loadSavedTemporarySources() {
      const saved = readJsonStorage(SAVED_TEMP_URLS_KEY, []);
      if (!Array.isArray(saved)) return;
      saved.slice(0, 80).forEach(item => {
        if (!isSafeHttpUrl(item?.url) || !isDirectMediaUrl(item.url)) return;
        const id = tempIdFromUrl(item.url);
        if (findRoomAny(id)) return;
        const activeGroup = store.state.settings.activeGroup;
        const groupId = (!activeGroup || activeGroup === LIBRARY_GROUP_ID || activeGroup === ONLINE_GROUP_ID || activeGroup === ONLINE_FAVORITES_GROUP_ID) ? DEFAULT_GROUP_ID : activeGroup;
        tempRooms.push({ id, displayName: item.name || new URL(item.url).hostname, sourceUrl: item.url, group: groupId, groups: [groupId], addedAt: Date.now(), order: 100000 + tempRooms.length, lastStatus: 'online', lastSeenOnline: Date.now(), muted: false, temporary: true });
      });
    }

    function openRoomPage(roomId) {
      roomId = normalizeUsername(roomId);
      if (!isLikelyUsername(roomId)) return false;
      openNoopener(location.origin + '/' + roomId + '/');
      return true;
    }

    function openShortcutRoom() {
      const hovered = document.querySelector('.cam-card:hover')?.dataset?.roomId;
      const focused = store.state.settings.focusedRoomId;
      const first = fullVisibleRooms()[0]?.id;
      const roomId = hovered || focused || first;
      if (!openRoomPage(roomId)) toast(t('emptyTitle'));
    }

    /* ---- 卡片"更多"操作菜单（PiP / 全屏 / 移动到分组 / 主屏聚焦）---- */
    function openCardOpsMenu(e, roomId, card) {
      // 关闭已有的卡片菜单
      const existing = document.querySelector('.card-ops-menu-pop');
      if (existing) { existing.remove(); return; }
      const rect = e.currentTarget?.getBoundingClientRect?.() || card?.getBoundingClientRect?.() || { left: e.clientX || 0, right: e.clientX || 0, bottom: e.clientY || 0 };
      const usePointer = Number.isFinite(e.clientX) && Number.isFinite(e.clientY) && !e.currentTarget?.classList?.contains('icon-btn');
      const menuStyle = usePointer
        ? { left: Math.min(e.clientX, window.innerWidth - 220) + 'px', top: Math.min(e.clientY, window.innerHeight - 360) + 'px', minWidth: '190px' }
        : { right: (window.innerWidth - rect.right) + 'px', top: (rect.bottom + 4) + 'px', minWidth: '190px' };
      const menu = $('div', { class: 'menu-pop card-ops-menu-pop', style: menuStyle });

      const item = (icon, label, onclick) => setElementHint($('button', {
        title: label,
        onclick: () => { menu.remove(); onclick(); },
      }, label), label);

      // 主屏切换（focus 模式专属）
      if (store.state.settings.viewMode === 'focus') {
        const isFocused = store.state.settings.focusedRoomId === roomId;
        menu.appendChild(item(isFocused ? '' : '', isFocused
          ? (LANG === 'zh' ? '已是主屏' : 'Currently main')
          : (LANG === 'zh' ? '设为主屏' : 'Set as main'),
          () => { if (!isFocused) store.patchSettings({ focusedRoomId: roomId }); }));
      }
      menu.appendChild(item('', service.isPaused(roomId) ? t('opResume') : t('opPause'), () => service.togglePause(roomId)));
      menu.appendChild(item('', t('opRefresh'), () => service.refresh(roomId)));
      const currentRoom = store.state.rooms.find(x => x.id === roomId);
      if (currentRoom) {
        menu.appendChild(item('', currentRoom.muted ? (LANG === 'zh' ? '取消静音' : 'Unmute') : (LANG === 'zh' ? '静音' : 'Mute'), () => {
          store.patchRoom(roomId, { muted: !currentRoom.muted });
          requestAnimationFrame(() => applyMute(roomId));
        }));
      }
      const inFav = currentRoom ? roomInGroup(currentRoom, FAVORITE_GROUP_ID) : false;
      menu.appendChild(item(inFav ? '' : '', inFav ? t('opFavoriteRemove') : t('opFavoriteAdd'), () => store.toggleRoomInGroup(roomId, FAVORITE_GROUP_ID)));
      if (!inFav) menu.appendChild(item('', t('opMoveToFavorites'), () => store.moveOnlyToGroup(roomId, FAVORITE_GROUP_ID)));
      if (currentRoom) menu.appendChild(item('', t('opAddSplit'), () => handleAddRoomToSplit(roomId)));
      menu.appendChild(item('', t('opScreenshot'), () => captureCardScreenshot(roomId)));
      menu.appendChild(item('', recordings.has(roomId) ? t('opRecordStop') : t('opRecordStart'), () => toggleCardRecording(roomId)));
      menu.appendChild(item('', t('opMirror'), () => {
        const cur = getVideoTransform(roomId);
        patchVideoTransform(roomId, { mirror: !cur.mirror });
      }));
      menu.appendChild(item('', t('opFlip'), () => {
        const cur = getVideoTransform(roomId);
        patchVideoTransform(roomId, { flip: !cur.flip });
      }));
      menu.appendChild(item('', t('opRotateLeft'), () => {
        const cur = getVideoTransform(roomId);
        patchVideoTransform(roomId, { rotation: (cur.rotation + 270) % 360 });
      }));
      menu.appendChild(item('', t('opRotateRight'), () => {
        const cur = getVideoTransform(roomId);
        patchVideoTransform(roomId, { rotation: (cur.rotation + 90) % 360 });
      }));
      menu.appendChild(item('', t('opResetView'), () => resetVideoTransform(roomId)));
      menu.appendChild(item('', t('opOpenRoom'), () => openRoomPage(roomId)));
      menu.appendChild(item('', t('opCopyUsername'), async () => { await copyText(roomId); toast(t('copied')); }));
      menu.appendChild(item('', t('opPiP'), async () => {
        const v = cardMap.get(roomId)?.video;
        if (!v) return;
        try { if (document.pictureInPictureElement) await document.exitPictureInPicture(); else await v.requestPictureInPicture(); }
        catch (_) {}
      }));
      menu.appendChild(item('', t('opFullscreen'), () => {
        document.fullscreenElement ? document.exitFullscreen() : card.requestFullscreen().catch(() => {});
      }));
      menu.appendChild(item('', t('opMoveGroup'), () => openMoveMenu(e, roomId)));
      menu.appendChild(item('', t('opDeleteRoom'), () => { stopCardRecording(roomId, true); service.stop(roomId); store.removeRoom(roomId); }));

      document.body.appendChild(menu);
      const close = (ev) => {
        if (!menu.contains(ev.target)) {
          menu.remove();
          document.removeEventListener('click', close);
        }
      };
      setTimeout(() => document.addEventListener('click', close), 0);
    }

    /* ---- 拖拽落点写回 store ---- */
    function reorderByDrop(fromId, toId, position /* 'before' | 'after' */) {
      fromId = normalizeUsername(fromId);
      toId = normalizeUsername(toId);
      if (!fromId || !toId || fromId === toId) return;

      const ag = store.state.settings.activeGroup || DEFAULT_GROUP_ID;
      const targetGroup = ag === ONLINE_FAVORITES_GROUP_ID
        ? FAVORITE_GROUP_ID
        : ((ag === LIBRARY_GROUP_ID || ag === ONLINE_GROUP_ID) ? undefined : ag);
      const manualRooms = (ag === LIBRARY_GROUP_ID ? [...store.state.rooms] : store.state.rooms.filter(r => roomInGroup(r, ag)))
        .sort((a, b) => roomOrderInGroup(a, ag) - roomOrderInGroup(b, ag) || a.id.localeCompare(b.id));
      const manualIds = manualRooms.map(r => r.id);

      // 以当前屏幕实际可见顺序为准进行插入；再把结果合并回完整手动顺序。
      // 这样在分页、搜索、隐藏离线/私密时，隐藏房间不会被错误重排或产生重复 order。
      const visibleIds = visibleRooms().map(r => r.id).filter(id => manualIds.includes(id));
      const fi = visibleIds.indexOf(fromId);
      let ti = visibleIds.indexOf(toId);
      if (fi < 0 || ti < 0) return;
      visibleIds.splice(fi, 1);
      if (fi < ti) ti--;
      if (position === 'after') ti++;
      visibleIds.splice(Math.max(0, Math.min(visibleIds.length, ti)), 0, fromId);

      const visibleSet = new Set(visibleIds);
      let cursor = 0;
      const mergedIds = manualIds.map(id => visibleSet.has(id) ? visibleIds[cursor++] : id);
      while (cursor < visibleIds.length) mergedIds.push(visibleIds[cursor++]);

      const patch = {};
      if (store.state.settings.sortBy !== 'manual') patch.sortBy = 'manual';
      if (store.state.settings.viewMode === 'focus') {
        const focusedId = store.state.settings.focusedRoomId;
        // 主屏与副屏互拖时按“交换屏幕位置”处理：拖副屏到主屏，副屏变主屏；拖主屏到副屏，目标变主屏。
        if (focusedId === toId && fromId !== focusedId) patch.focusedRoomId = fromId;
        else if (focusedId === fromId && toId !== focusedId) patch.focusedRoomId = toId;
      }

      store.reorderRooms(mergedIds, targetGroup);
      if (Object.keys(patch).length) store.patchSettings(patch);
    }

    function openMoveMenu(e, roomId) {
      const groups = [...store.state.groups].sort((a, b) => a.order - b.order);
      const r = store.state.rooms.find(x => x.id === roomId);
      const groupDisplayName = (g) => {
        if (g.name === '__library__') return t('groupLibrary');
        if (g.name === '__all__') return t('groupAll');
        if (g.name === '__online_favorites__') return t('groupOnlineFav');
        if (g.name === '__online__') return t('groupOnline');
        if (g.name === '__fav__') return t('groupFav');
        return g.name;
      };
      const menu = $('div', { class: 'menu-pop',
        style: { left: e.clientX + 'px', top: e.clientY + 'px' } });
      groups.filter(g => g.id !== LIBRARY_GROUP_ID && g.id !== ONLINE_GROUP_ID && g.id !== ONLINE_FAVORITES_GROUP_ID).forEach(g => {
        const inGroup = roomInGroup(r, g.id);
        const label = (inGroup ? ' ' : ' ') + groupDisplayName(g);
        menu.appendChild($('button', {
          title: groupDisplayName(g),
          onclick: () => { store.toggleRoomInGroup(roomId, g.id); menu.remove(); },
          style: inGroup ? { color: 'var(--accent)' } : {},
        }, label));
      });
      document.body.appendChild(menu);
      const close = (ev) => { if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('click', close); } };
      setTimeout(() => document.addEventListener('click', close), 0);
    }

    /* ---- 更多菜单按钮触发 ---- */
    let _moreMenuClose = null;
    function openMoreMenu(anchor) {
      const existing = document.querySelector('.more-menu-pop');
      if (existing) {
        existing.remove();
        if (_moreMenuClose) { document.removeEventListener('click', _moreMenuClose); _moreMenuClose = null; }
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const menu = $('div', {
        class: 'menu-pop more-menu-pop',
        style: {
          right: (window.innerWidth - rect.right) + 'px',
          top: (rect.bottom + 6) + 'px',
          minWidth: '240px',
          maxHeight: 'min(620px, calc(100vh - 96px))',
          overflowY: 'auto',
        },
      });

      const sectionLabel = (zh, en) => LANG === 'zh' ? zh : en;
      const divider = () => $('div', { style: { height: '1px', background: 'var(--border)', margin: '6px 0' } });
      const sectionTitle = (label) => $('div', {
        style: {
          padding: '7px 10px 4px',
          fontSize: '11px',
          lineHeight: '1',
          color: 'var(--text-muted)',
          fontWeight: '750',
          letterSpacing: '.02em',
        },
      }, label);
      const item = (label, onClick, opts = {}) => $('button', {
        class: opts.danger ? 'danger' : '',
        title: opts.title || label,
        onclick: () => {
          menu.remove();
          if (_moreMenuClose) { document.removeEventListener('click', _moreMenuClose); _moreMenuClose = null; }
          try { onClick?.(); } catch (err) { console.warn('[RoomGrid] menu action failed', err); }
        },
      }, label);
      const addSection = (label, items) => {
        menu.appendChild(sectionTitle(label));
        items.filter(Boolean).forEach(el => menu.appendChild(el));
        menu.appendChild(divider());
      };

      const currentPageIds = () => {
        return currentPageRoomIds();
      };

      addSection(sectionLabel('界面', 'Interface'), [
        item(t('settingsCenter'), () => openSettingsCenter()),
        item(t('menuLayoutSettings'), () => openLayoutSettings()),
        item(t('menuPlaybackSettings'), () => openPlaybackSettingsPanel()),
        item(store.state.settings.toolbarCollapsed ? sectionLabel('显示顶部工具栏', 'Show top controls') : sectionLabel('收起顶部工具栏', 'Collapse top controls'), () => {
          { const v = !store.state.settings.toolbarCollapsed; document.body.classList.toggle('rg-toolbar-collapsed', v); store.patchSettings({ toolbarCollapsed: v }); }
        }),
        item(store.state.settings.sidebarCollapsed ? sectionLabel('显示左侧分组', 'Show groups') : sectionLabel('收起左侧分组', 'Collapse groups'), () => {
          { const v = !store.state.settings.sidebarCollapsed; document.body.classList.toggle('rg-sidebar-collapsed', v); sidebar.classList.toggle('is-collapsed', v); store.patchSettings({ sidebarCollapsed: v }); }
        }),
        item(t('menuViewerMode'), () => toggleViewerMode(), { title: t('viewerModeHint') }),
        item(t('menuPureMode'), () => togglePureMode(), { title: t('pureModeHint') }),
      ]);

      addSection(sectionLabel('窗口', 'Windows'), [
        item(t('menuToggleFit'), () => toggleVideoFit(), { title: t('videoFitHint') }),
        item(t('menuToggleThumbs'), () => toggleFocusThumbs(), { title: t('focusThumbsHint') }),
        item(t('menuPauseVisible'), () => {
          const ids = currentPageIds();
          service.pauseAll(ids);
          requestAnimationFrame(() => ids.forEach(updateCardButtons));
          toast(t('pausedVisible'));
        }, { title: t('menuPauseVisible') }),
        item(t('menuResumeVisible'), () => {
          const ids = currentPageIds();
          service.resumeAll(ids);
          requestAnimationFrame(() => ids.forEach(updateCardButtons));
          toast(t('resumedVisible'));
        }, { title: t('menuResumeVisible') }),
        item(t('menuMuteAll'), () => {
          store.setAllMuted(true);
          requestAnimationFrame(() => store.state.rooms.forEach(r => applyMute(r.id)));
        }),
        item(t('menuUnmuteAll'), () => {
          store.setAllMuted(false);
          requestAnimationFrame(() => store.state.rooms.forEach(r => applyMute(r.id)));
        }),
        item(t('batchOpenCurrentPage'), () => openCurrentPageRooms()),
        item(t('batchMoveCurrentPage'), () => moveCurrentPageToGroup()),
      ]);

      addSection(sectionLabel('录制', 'Recording'), [
        item(t('menuRecordingCenter'), () => openRecordingCenter()),
        item(t('menuRecordingSettings'), () => openRecordingSettingsPanel()),
        item(t('recordCurrentPage'), () => recordCurrentPage()),
        item(t('recordCurrentGroup'), () => recordCurrentGroup()),
        item(t('recordOnlineRooms'), () => recordOnlineRooms()),
        item(store.state.settings.showRecordingOnly ? t('hideRecordingOnly') : t('showRecordingOnly'), () => {
          store.patchSettings({ showRecordingOnly: !store.state.settings.showRecordingOnly, pageIndex: 0 });
        }),
        item(t('menuStopRecordings'), () => stopAllRecordings({ final: true })),
      ]);

      addSection(sectionLabel('数据', 'Data'), [
        item(t('manualImport'), () => openManualImportPrompt(), { title: t('manualImport') }),
        item(t('menuBackupPanel'), () => openBackupPanel()),
        item(t('menuStatusHistory'), () => openStatusHistoryPanel()),
        item(t('menuGroupRules'), () => openGroupRulesPanel()),
        item(t('menuTempUrlManager'), () => openTemporaryUrlManager()),
        item(t('menuShareWorkspace'), () => openSharePanel()),
        item(t('menuExport'), () => {
          const data = JSON.stringify(sanitizeState(store.state), null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          downloadBlob(blob, `roomgrid-config-${Date.now()}.json`);
        }),
        item(t('menuImport'), () => {
          const inp = $('input', { type: 'file', accept: 'application/json',
            style: { display: 'none' },
            onchange: async (e) => {
              const f = e.target.files[0];
              if (!f) { try { inp.remove(); } catch (_) {} return; }
              try {
                if (f.size > MAX_CONFIG_BYTES) throw new Error('file too large');
                const text = await f.text();
                const obj = sanitizeState(JSON.parse(text));
                if (!obj.rooms.length && !confirm(LANG === 'zh' ? '导入文件里没有有效房间，仍要继续？' : 'No valid rooms found in this file. Continue?')) return;
                const summary = LANG === 'zh'
                  ? `导入配置将替换当前配置。\n\n当前：${store.state.rooms.length} 个房间 / ${store.state.groups.length} 个分组\n导入：${obj.rooms.length} 个房间 / ${obj.groups.length} 个分组\n\n已尽量保存最近 ${MAX_CONFIG_BACKUPS} 个备份。继续？`
                  : `Importing will replace the current config.\n\nCurrent: ${store.state.rooms.length} rooms / ${store.state.groups.length} groups\nImport: ${obj.rooms.length} rooms / ${obj.groups.length} groups\n\nThe last ${MAX_CONFIG_BACKUPS} backups are kept when possible. Continue?`;
                if (!confirm(summary)) return;
                obj.settings.toolbarCollapsed = false;
                obj.settings.sidebarCollapsed = false;
                backupCurrentConfig();
                writeStoreRaw(JSON.stringify(obj));
                location.reload();
              } catch (err) {
                alert('Import failed: ' + err.message);
              } finally {
                setTimeout(() => { try { inp.remove(); } catch (_) {} }, 0);
              }
            },
          });
          document.body.appendChild(inp); inp.click();
          setTimeout(() => { try { if (!inp.files || !inp.files.length) inp.remove(); } catch (_) {} }, 60000);
        }),
        item(t('menuCopyUsernames'), async () => {
          await copyText(store.state.rooms.map(r => r.id).sort().join('\n'));
          toast(t('copied'));
        }),
        item(t('menuExportUsernames'), () => {
          const names = store.state.rooms.map(r => r.id).sort().join('\n');
          downloadBlob(new Blob([names + (names ? '\n' : '')], { type: 'text/plain;charset=utf-8' }), `roomgrid-usernames-${Date.now()}.txt`);
        }),
        item(t('menuRepairData'), () => {
          store.repairData();
          alert(t('repairDone'));
        }),
      ]);

      addSection(sectionLabel('语言', 'Language'), [
        $('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '0 8px 4px' } }, [
          $('button', {
            style: {
              padding: '7px 8px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: LANG === 'zh' ? 'var(--accent)' : 'var(--bg-input)',
              color: LANG === 'zh' ? '#fff' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '12px',
            },
            onclick: () => { menu.remove(); setLang('zh'); },
          }, t('langZh')),
          $('button', {
            style: {
              padding: '7px 8px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: LANG === 'en' ? 'var(--accent)' : 'var(--bg-input)',
              color: LANG === 'en' ? '#fff' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '12px',
            },
            onclick: () => { menu.remove(); setLang('en'); },
          }, t('langEn')),
        ]),
      ]);

      addSection(sectionLabel('帮助', 'Help'), [
        item(t('menuShortcutPanel'), () => openShortcutPanel(), { title: t('menuShortcutPanel') }),
        item(t('menuShortcutHelp'), () => alert(t('shortcutsHelp')), { title: t('menuShortcutHelp') }),
        item(t('menuAbout'), () => showAboutPanel(), { title: t('menuAbout') }),
      ]);

      menu.appendChild(item(t('menuClearAll'), () => {
        if (confirm(t('clearAllConfirm'))) {
          try { service.stopAll(); } catch (_) { stopAllPageMedia(); }
          Storage.clearAll();
          location.reload();
        }
      }, { danger: true }));

      document.body.appendChild(menu);
      const close = (ev) => {
        if (!menu.contains(ev.target) && ev.target !== anchor) {
          menu.remove();
          document.removeEventListener('click', close);
          _moreMenuClose = null;
        }
      };
      _moreMenuClose = close;
      setTimeout(() => document.addEventListener('click', close), 0);
    }

    /* ---- 关于面板（含 ETH 捐赠地址）---- */

    function showAboutPanel() {
      const overlay = $('div', {
        style: {
          position: 'fixed', inset: '0', background: 'rgba(17,24,39,.32)', backdropFilter: 'blur(2px)',
          zIndex: '10000', display: 'flex', alignItems: 'center', justifyContent: 'center',
        },
        onclick: (e) => { if (e.target === overlay) overlay.remove(); },
      });

      const card = $('div', {
        style: {
          background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '14px',
          padding: '26px 28px', minWidth: '340px', maxWidth: '440px',
          boxShadow: 'var(--shadow-lg)', color: 'var(--text)',
        },
      });

      const row = (label, value) => $('div', {
        style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0',
          borderBottom: '1px solid var(--border)', fontSize: '13px' },
      }, [
        $('span', { style: { color: 'var(--text-muted)' } }, label),
        $('span', { style: { color: 'var(--text)', fontFamily: 'ui-monospace,monospace' } }, value),
      ]);

      const copyBtn = $('button', {
        style: {
          padding: '4px 10px', fontSize: '11px', background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)',
          border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '8px',
        },
        onclick: async () => {
          try {
            await navigator.clipboard.writeText(META.eth);
            copyBtn.textContent = t('aboutCopied');
            setTimeout(() => { copyBtn.textContent = t('aboutCopyAddr'); }, 1500);
          } catch (_) {
            // fallback
            const ta = $('textarea', { value: META.eth, style: { position: 'fixed', opacity: '0' } });
            document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); copyBtn.textContent = t('aboutCopied'); } catch(_) {}
            ta.remove();
            setTimeout(() => { copyBtn.textContent = t('aboutCopyAddr'); }, 1500);
          }
        },
      }, t('aboutCopyAddr'));

      card.append(
        $('div', { style: { fontSize: '20px', fontWeight: '700', marginBottom: '4px' } }, t('aboutTitle')),
        $('div', { style: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.45' } }, `${t('title')} · ${t('appTagline')}`),
        row(t('aboutAuthor'), META.author),
        row(t('aboutVersion'), 'v' + META.version),
        row(t('aboutLicense'), META.license),
        // 捐赠区（次级展示）
        $('div', {
          style: {
            marginTop: '20px', padding: '14px', background: 'var(--bg)',
            border: '1px dashed var(--border-strong)', borderRadius: '10px',
          },
        }, [
          $('div', { style: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' } }, t('aboutDonate')),
          $('div', { style: { fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' } }, t('aboutDonateAddrLabel') + ' (Ethereum / EVM):'),
          $('div', {
            style: {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-input)', padding: '8px 10px', borderRadius: '6px',
              fontSize: '11px', fontFamily: 'ui-monospace,monospace', wordBreak: 'break-all',
            },
          }, [
            $('span', { style: { flex: '1', color: 'var(--text-secondary)' } }, META.eth),
            copyBtn,
          ]),
        ]),
        $('div', { style: { display: 'flex', justifyContent: 'flex-end', marginTop: '20px' } }, [
          $('button', {
            style: { padding: '8px 18px', background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
            onclick: () => overlay.remove(),
          }, t('aboutClose')),
        ]),
      );

      overlay.appendChild(card);
      document.body.appendChild(overlay);
    }

    function visibleRooms() {
      const s = store.state;
      const ag = s.settings.activeGroup || DEFAULT_GROUP_ID;
      let list = ag === LIBRARY_GROUP_ID ? [...allRoomsForView()] : allRoomsForView().filter(r => roomInGroup(r, ag));
      const q = normalizeUsername(s.settings.searchQuery || '');
      if (q) list = list.filter(r => normalizeUsername(r.id).includes(q));
      const f = s.settings.filter;
      if (f.hideOffline) list = list.filter(r => r.lastStatus !== 'offline');
      if (f.hidePrivate) list = list.filter(r => r.lastStatus !== 'private');
      if (f.onlyOnline) list = list.filter(r => r.lastStatus === 'online');
      if (s.settings.showRecordingOnly) list = list.filter(r => recordings.has(r.id));
      const sb = s.settings.sortBy;
      if (sb === 'manual') list.sort((a, b) => roomOrderInGroup(a, ag) - roomOrderInGroup(b, ag));
      else if (sb === 'name') list.sort((a, b) => a.id.localeCompare(b.id));
      else if (sb === 'addedAt') list.sort((a, b) => b.addedAt - a.addedAt);
      else if (sb === 'status') {
        const rank = { online: 0, private: 1, loading: 2, error: 3, offline: 4, unknown: 5 };
        list.sort((a, b) => (rank[a.lastStatus] ?? 9) - (rank[b.lastStatus] ?? 9));
      }
      if (s.settings.favoriteFirst !== false && ag !== FAVORITE_GROUP_ID) {
        list = list
          .map((room, idx) => ({ room, idx, fav: roomInGroup(room, FAVORITE_GROUP_ID) ? 1 : 0 }))
          .sort((a, b) => (b.fav - a.fav) || (a.idx - b.idx))
          .map(item => item.room);
      }
      return list;
    }

    function renderCardState(room) {
      const c = cardMap.get(room.id);
      if (!c) return;
      const muted = room.muted;
      const meta = statusMeta(room.lastStatus);

      c.badge.replaceChildren();
      c.badge.append(
        $('span', { class: 'dot', style: { background: meta.color } }),
        $('span', { class: 'pill-text' }, meta.label),
        muted ? $('span', { style: { marginLeft: '4px', fontSize: '10px', color: 'var(--text-muted)' } }, LANG === 'zh' ? '静音' : 'Muted') : null,
      );
      updateCardButtons(room.id);

      // 状态覆盖层文本 + video DOM 清理
      if (room.lastStatus === 'online') {
        c.root.classList.remove('not-online');
        c.statusEl.style.display = 'none';
        applyMute(room.id);
        resumeWaitingRecording(room.id);
      } else {
        c.root.classList.add('not-online');
        c.statusEl.style.display = 'flex';
        pauseRecordingForSourceLoss(room.id);
        // 关键修复：状态非 online 时彻底清理 video 节点。
        // 否则会在卡片中央显示大黑块，且可能残留音频。
        if (c.video) {
          service.detachVideo(room.id);
          c.video = null;
        } else {
          service.detachVideo(room.id);
        }
        const lines = [
          $('div', { class: 'status-icon', style: { color: meta.color } }, [$('span', { class: 'status-dot-large' })]),
          $('div', { class: 'status-chip', style: { color: meta.color } }, meta.label),
          room.lastSeenOnline
            ? $('div', { style: { fontSize: '11px', color: 'var(--text-muted)' } }, t('lastSeen', fmtTime(room.lastSeenOnline)))
            : null,
          (room.lastStatus === 'offline' || room.lastStatus === 'private')
            ? $('div', { style: { fontSize: '10px', color: 'var(--text-muted)', opacity: '.7' } }, t('autoDetect'))
            : null,
        ];
        c.statusEl.replaceChildren();
        lines.forEach(l => l && c.statusEl.appendChild(l));
      }
    }

    function applyMute(id) {
      const c = cardMap.get(id);
      const r = findRoomAny(id);
      if (!c || !c.video || !r) return;
      const v = store.state.settings.volume;
      const splitIds = store.state.settings.splitRoomIds;
      const splitMuted = !!store.state.settings.splitViewActive && splitIds.includes(id) && store.state.settings.splitAudioRoomId !== id;
      c.video.volume = (r.muted || splitMuted) ? 0 : v;
      c.video.muted = r.muted || splitMuted || v === 0;
    }

    function getVideoTransform(roomId) {
      return sanitizeVideoTransform(store.state.settings.videoTransforms?.[normalizeUsername(roomId)]);
    }

    function buildVideoTransformCss(transform) {
      const t = sanitizeVideoTransform(transform);
      const parts = [];
      if (t.x || t.y) parts.push(`translate(${t.x}px, ${t.y}px)`);
      if (t.zoom !== 1) parts.push(`scale(${t.zoom})`);
      if (t.mirror || t.flip) parts.push(`scale(${t.mirror ? -1 : 1}, ${t.flip ? -1 : 1})`);
      if (t.rotation) parts.push(`rotate(${t.rotation}deg)`);
      return parts.join(' ');
    }

    function patchVideoTransform(roomId, patch) {
      roomId = normalizeUsername(roomId);
      if (!roomId) return;
      const next = sanitizeVideoTransform({ ...getVideoTransform(roomId), ...(patch || {}) });
      store.update(s => {
        s.settings.videoTransforms = sanitizeVideoTransformMap(s.settings.videoTransforms);
        if (isDefaultVideoTransform(next)) delete s.settings.videoTransforms[roomId];
        else s.settings.videoTransforms[roomId] = next;
      }, 'settings:videoTransforms');
      applyVideoTransform(roomId);
    }

    function resetVideoTransform(roomId) {
      patchVideoTransform(roomId, defaultVideoTransform());
    }

    function applyVideoTransform(roomId) {
      const c = cardMap.get(normalizeUsername(roomId));
      if (!c?.video) return;
      const transform = getVideoTransform(roomId);
      const css = buildVideoTransformCss(transform);
      c.video.style.transform = css;
      c.video.style.transformOrigin = 'center center';
      c.video.style.cursor = transform.zoom > 1 ? 'grab' : '';
      c.root.classList.toggle('video-transformed', !isDefaultVideoTransform(transform));
      c.root.classList.toggle('video-zoomed', transform.zoom > 1);
    }

    function applyAllVideoTransforms() {
      cardMap.forEach((_, id) => applyVideoTransform(id));
    }

    function installCardZoomHandlers(card, roomId) {
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      const isUiTarget = (target) => !!target?.closest?.('.icon-btn,.menu-pop,.roomgrid-modal-backdrop,button,input,select,textarea,a');
      card.addEventListener('wheel', (e) => {
        if (store.state.settings.freeZoom === false || (!e.ctrlKey && !e.metaKey) || isUiTarget(e.target)) return;
        e.preventDefault();
        const cur = getVideoTransform(roomId);
        const nextZoom = Math.max(1, Math.min(20, cur.zoom * (e.deltaY < 0 ? 1.12 : 0.88)));
        const rounded = Math.round(nextZoom * 100) / 100;
        patchVideoTransform(roomId, { zoom: rounded, x: rounded === 1 ? 0 : cur.x, y: rounded === 1 ? 0 : cur.y });
      }, { passive: false });
      card.addEventListener('mousedown', (e) => {
        if (store.state.settings.freeZoom === false || e.button !== 0 || isUiTarget(e.target)) return;
        const cur = getVideoTransform(roomId);
        if (cur.zoom <= 1) return;
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        card.classList.add('video-panning');
        const c = cardMap.get(roomId);
        if (c?.video) c.video.style.cursor = 'grabbing';
        e.preventDefault();
      });
      window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const cur = getVideoTransform(roomId);
        patchVideoTransform(roomId, {
          x: cur.x + e.clientX - lastX,
          y: cur.y + e.clientY - lastY,
        });
        lastX = e.clientX;
        lastY = e.clientY;
      });
      window.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        card.classList.remove('video-panning');
        applyVideoTransform(roomId);
      });
    }

    function attachVideoElement(roomId) {
      const c = cardMap.get(roomId);
      if (!c) return null;
      // 移除旧 video：必须同步销毁 HLS，否则旧 buffer 可能继续出声。
      if (c.video) {
        pauseRecordingForSourceLoss(roomId);
        service.detachVideo(roomId);
        c.video = null;
      }
      const video = $('video', {
        controls: false, autoplay: true, playsInline: true, draggable: false, disablePictureInPicture: false,
        controlsList: 'nodownload noplaybackrate nofullscreen',
        dataset: { multicamRoom: roomId, multicamRoomId: roomId },
        class: 'cam-video',
        style: { pointerEvents: 'none', filter: 'none', opacity: '1' },
      });
      try { video.controls = false; video.removeAttribute('controls'); } catch (_) {}
      const r = findRoomAny(roomId);
      const v = store.state.settings.volume;
      video.volume = r?.muted ? 0 : v;
      video.muted = r?.muted || v === 0;
      // 插入到状态层之前
      c.root.insertBefore(video, c.statusEl);
      c.video = video;
      applyMute(roomId);
      video.addEventListener('play', () => updateCardButtons(roomId));
      video.addEventListener('pause', () => updateCardButtons(roomId));
      video.addEventListener('loadeddata', () => resumeWaitingRecording(roomId));
      video.addEventListener('playing', () => resumeWaitingRecording(roomId));
      service.attachVideo(roomId, video);
      applyVideoTransform(roomId);
      updateCardButtons(roomId);
      setTimeout(() => resumeWaitingRecording(roomId), 1200);
      return video;
    }

    function attachTemporarySource(room) {
      if (!room || !room.sourceUrl) return;
      const c = cardMap.get(room.id);
      if (!c) return;
      const video = attachVideoElement(room.id);
      if (!video) return;
      video.controls = true;
      video.style.pointerEvents = 'auto';
      try { c.tempHls?.destroy?.(); } catch (_) {}
      c.tempHls = null;
      if (isHlsUrl(room.sourceUrl) && window.Hls && Hls.isSupported()) {
        const hls = new Hls({ lowLatencyMode: true, enableWorker: true });
        c.tempHls = hls;
        hls.loadSource(room.sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = room.sourceUrl;
      }
      video.play?.().catch?.(() => {});
      renderCardState(room);
    }

    // ---- Grid 渲染（增量，支持 grid / focus 双模式）----
    function activateSplitAudio(roomId) {
      roomId = normalizeUsername(roomId);
      if (!store.state.settings.splitRoomIds.includes(roomId)) return;
      store.setSplitAudio(roomId);
      const room = store.state.rooms.find(item => item.id === roomId);
      if (room?.muted) store.patchRoom(roomId, { muted: false });
      requestAnimationFrame(() => store.state.settings.splitRoomIds.forEach(applyMute));
    }

    function splitOnlineCycleIds(slot) {
      slot = slot === 1 ? 1 : 0;
      const otherId = store.state.settings.splitRoomIds[slot === 0 ? 1 : 0] || null;
      return store.state.rooms
        .filter(room => room.id !== otherId && roomInGroup(room, ONLINE_GROUP_ID))
        .sort((a, b) => roomOrderInGroup(a, ONLINE_GROUP_ID) - roomOrderInGroup(b, ONLINE_GROUP_ID) || a.id.localeCompare(b.id))
        .map(room => room.id);
    }

    function cycleSplitOnline(slot, direction) {
      slot = slot === 1 ? 1 : 0;
      direction = direction < 0 ? -1 : 1;
      const currentId = store.state.settings.splitRoomIds[slot] || null;
      const ids = splitOnlineCycleIds(slot);
      const alternatives = ids.filter(id => id !== currentId);
      if (!alternatives.length) {
        toast(t('splitNoOtherOnline'));
        return false;
      }
      const currentIndex = ids.indexOf(currentId);
      const targetId = currentIndex < 0
        ? (direction < 0 ? ids[ids.length - 1] : ids[0])
        : ids[(currentIndex + direction + ids.length) % ids.length];
      if (!targetId || targetId === currentId) return false;
      return store.setSplitSlot(slot, targetId);
    }

    const SPLIT_TOOLBAR_IDLE_MS = 2400;
    let splitToolbarHideTimer = 0;
    let splitToolbarActivityCleanup = null;
    let splitToolbarLastActivity = 0;

    function cleanupSplitToolbarAutohide(resetActivity = false) {
      clearTimeout(splitToolbarHideTimer);
      splitToolbarHideTimer = 0;
      splitToolbarActivityCleanup?.();
      splitToolbarActivityCleanup = null;
      if (resetActivity) splitToolbarLastActivity = 0;
    }

    function installSplitToolbarAutohide(toolbar) {
      cleanupSplitToolbarAutohide(false);
      const controller = new AbortController();
      const { signal } = controller;

      const setHidden = hidden => {
        if (!toolbar.isConnected) return;
        toolbar.classList.toggle('is-hidden', hidden);
        toolbar.dataset.autohide = hidden ? 'hidden' : 'visible';
        toolbar.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        if ('inert' in toolbar) toolbar.inert = hidden;
      };
      const scheduleHide = () => {
        clearTimeout(splitToolbarHideTimer);
        const remaining = Math.max(0, SPLIT_TOOLBAR_IDLE_MS - (Date.now() - splitToolbarLastActivity));
        splitToolbarHideTimer = setTimeout(() => {
          if (toolbar.matches(':hover') || toolbar.contains(document.activeElement)) {
            splitToolbarLastActivity = Date.now();
            scheduleHide();
            return;
          }
          setHidden(true);
        }, remaining);
      };
      const showAndRearm = () => {
        splitToolbarLastActivity = Date.now();
        setHidden(false);
        scheduleHide();
      };

      grid.addEventListener('pointermove', showAndRearm, { passive: true, signal });
      grid.addEventListener('pointerdown', showAndRearm, { passive: true, signal });
      grid.addEventListener('focusin', showAndRearm, { signal });
      document.addEventListener('keydown', showAndRearm, { signal });
      toolbar.addEventListener('pointerenter', showAndRearm, { passive: true, signal });
      toolbar.addEventListener('pointerleave', scheduleHide, { passive: true, signal });

      if (!splitToolbarLastActivity) splitToolbarLastActivity = Date.now();
      if (Date.now() - splitToolbarLastActivity >= SPLIT_TOOLBAR_IDLE_MS) setHidden(true);
      else {
        setHidden(false);
        scheduleHide();
      }
      splitToolbarActivityCleanup = () => controller.abort();
    }

    function splitToolbarPositionLabel(position) {
      if (position === 'lower-left') return t('splitControlsLowerLeft');
      if (position === 'lower-right') return t('splitControlsLowerRight');
      return t('splitControlsTop');
    }

    function cycleSplitToolbarPosition() {
      const order = ['top', 'lower-right', 'lower-left'];
      const current = store.state.settings.splitToolbarPosition || 'top';
      const next = order[(Math.max(0, order.indexOf(current)) + 1) % order.length];
      store.patchSettings({ splitToolbarPosition: next });
    }

    function cleanupSplitLayout() {
      cleanupSplitToolbarAutohide(true);
      grid.querySelectorAll('.split-pane').forEach(pane => {
        pane.querySelectorAll('.cam-card').forEach(card => grid.appendChild(card));
        pane.remove();
      });
      grid.querySelectorAll('.split-divider,.split-toolbar').forEach(el => el.remove());
    }

    function attachSplitDividerHandlers(divider) {
      let dragging = false;
      let pointerId = null;
      const updateRatio = event => {
        if (!dragging) return;
        const rect = grid.getBoundingClientRect();
        const portrait = rect.height >= rect.width;
        const raw = portrait
          ? ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100
          : ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        const ratio = clampInt(raw, 20, 80, 50);
        store.state.settings.splitRatio = ratio;
        grid.style.setProperty('--split-ratio', ratio + '%');
      };
      divider.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        dragging = true;
        pointerId = event.pointerId;
        divider.classList.add('dragging');
        try { divider.setPointerCapture(pointerId); } catch (_) {}
        event.preventDefault();
      });
      divider.addEventListener('pointermove', updateRatio);
      const finish = event => {
        if (!dragging) return;
        updateRatio(event);
        dragging = false;
        divider.classList.remove('dragging');
        try { divider.releasePointerCapture(pointerId); } catch (_) {}
        pointerId = null;
        store.patchSettings({ splitRatio: store.state.settings.splitRatio });
      };
      divider.addEventListener('pointerup', finish);
      divider.addEventListener('pointercancel', finish);
    }

    function renderSplitLayout() {
      reconcileSplitState(store.state);
      const ids = store.state.settings.splitRoomIds;
      const rooms = ids.map(id => store.state.rooms.find(room => room.id === id)).filter(Boolean);
      if (rooms.length !== 2) {
        store.setSplitActive(false);
        return;
      }

      const wantIds = new Set(ids);
      const allRoomIds = new Set(allRoomsForView().map(room => room.id));
      for (const [id, c] of cardMap) {
        if (wantIds.has(id)) continue;
        forgetCardMedia(id);
        pauseRecordingForSourceLoss(id, { silent: true });
        if (allRoomIds.has(id)) service.detachVideo(id); else service.stop(id);
        try { c.video?.pause(); } catch (_) {}
        try { c.video?.remove(); } catch (_) {}
        c.video = null;
        try { c.resizeObserver?.disconnect(); } catch (_) {}
        c.resizeObserver = null;
        try { c.root.remove(); } catch (_) {}
        cardMap.delete(id);
      }

      const panes = rooms.map((room, slot) => {
        let c = cardMap.get(room.id);
        if (!c) {
          buildCard(room);
          c = cardMap.get(room.id);
        }
        resetCardSizing(c.root);
        c.root.classList.add('is-split-card');
        c.root.style.width = '100%';
        c.root.style.height = '100%';
        c.root.style.aspectRatio = 'auto';
        requestRoomMediaIfNeeded(room.id);
        renderCardState(room);

        const cycleIds = splitOnlineCycleIds(slot);
        const canCycleOnline = cycleIds.some(id => id !== room.id);
        const prevOnlineBtn = $('button', {
          disabled: !canCycleOnline,
          title: canCycleOnline ? t('splitPrevOnline') : t('splitNoOtherOnline'),
          html: trustedHtml(iconSvg('chevronLeft', 20)),
          onclick: event => { event.stopPropagation(); cycleSplitOnline(slot, -1); },
        });
        const nextOnlineBtn = $('button', {
          disabled: !canCycleOnline,
          title: canCycleOnline ? t('splitNextOnline') : t('splitNoOtherOnline'),
          html: trustedHtml(iconSvg('chevronRight', 20)),
          onclick: event => { event.stopPropagation(); cycleSplitOnline(slot, 1); },
        });
        const audioActive = store.state.settings.splitAudioRoomId === room.id;
        const audioBtn = $('button', {
          class: audioActive ? 'active' : '',
          title: t('splitAudio'),
          html: trustedHtml(iconSvg(audioActive ? 'volume' : 'volumeOff', 18)),
          onclick: event => { event.stopPropagation(); activateSplitAudio(room.id); },
        });
        const replaceBtn = $('button', {
          title: t('splitReplace'),
          html: trustedHtml(iconLabel('refresh', t('splitReplace'), 17)),
          onclick: event => { event.stopPropagation(); openSplitPicker(slot); },
        });
        const controls = $('div', { class: 'split-pane-controls' }, [
          $('div', { class: 'split-pane-label' }, `${t('splitPane', slot + 1)} · ${room.id}`),
          $('div', { class: 'split-pane-actions' }, [prevOnlineBtn, nextOnlineBtn, audioBtn, replaceBtn]),
        ]);
        return $('div', { class: 'split-pane', dataset: { splitSlot: String(slot), roomId: room.id } }, [c.root, controls]);
      });

      const divider = $('div', { class: 'split-divider', title: t('splitDivider'), role: 'separator' });
      attachSplitDividerHandlers(divider);
      const swapBtn = $('button', {
        title: t('splitSwap'),
        html: trustedHtml(iconLabel('swap', t('splitSwap'), 17)),
        onclick: () => store.swapSplitRooms(),
      });
      const toolbarPosition = store.state.settings.splitToolbarPosition || 'top';
      const positionBtn = $('button', {
        title: `${t('splitControlsPosition')} · ${splitToolbarPositionLabel(toolbarPosition)}`,
        html: trustedHtml(iconSvg('move', 18)),
        onclick: () => cycleSplitToolbarPosition(),
      });
      const fullscreenBtn = $('button', {
        title: t('splitFullscreen'),
        html: trustedHtml(iconSvg('expand', 18)),
        onclick: () => { document.fullscreenElement ? document.exitFullscreen() : grid.requestFullscreen().catch(() => {}); },
      });
      const exitBtn = $('button', {
        class: 'split-exit',
        title: t('splitExit'),
        html: trustedHtml(iconLabel('close', t('splitExit'), 17)),
        onclick: () => store.clearSplitSelection(),
      });
      const splitToolbar = $('div', {
        class: `split-toolbar position-${toolbarPosition}`,
        dataset: { position: toolbarPosition },
      }, [positionBtn, swapBtn, fullscreenBtn, exitBtn]);

      grid.replaceChildren(panes[0], divider, panes[1], splitToolbar);
      installSplitToolbarAutohide(splitToolbar);
      grid.style.setProperty('--split-ratio', clampInt(store.state.settings.splitRatio, 20, 80, 50) + '%');
      store.state.settings.splitRoomIds.forEach(applyMute);
      syncSplitButton();
    }

    function renderGrid() {
      const mode = store.state.settings.viewMode;
      const splitActive = !!store.state.settings.splitViewActive
        && Array.isArray(store.state.settings.splitRoomIds)
        && store.state.settings.splitRoomIds.length === 2;
      // 切换 grid class
      grid.classList.toggle('view-grid', (mode === 'grid' || mode === 'phone') && !splitActive);
      grid.classList.toggle('view-phone', mode === 'phone' && !splitActive);
      grid.classList.toggle('view-focus', mode === 'focus' && !splitActive);
      grid.classList.toggle('view-split', splitActive);

      applyGridSize();
      if (splitActive) {
        renderSplitLayout();
        applyPureModeState();
        return;
      }

      cleanupSplitLayout();
      const fullList = fullVisibleRooms();
      syncLayoutControls();
      const list = fullList;
      const wantIds = new Set(list.map(r => r.id));

      // 移除不可见/已删除的卡片：先停流再移 DOM，避免删除后残留声音。
      // 如果只是被过滤/分组隐藏，不删除 session，只 detach 媒体，保留后续状态轮询。
      const allRoomIds = new Set(allRoomsForView().map(r => r.id));
      for (const [id, c] of cardMap) {
        if (!wantIds.has(id)) {
          forgetCardMedia(id);
          pauseRecordingForSourceLoss(id, { silent: true });
          const rr = findRoomAny(id);
          if (rr && rr.sourceUrl) { try { c.tempHls?.destroy?.(); } catch (_) {} }
          else if (allRoomIds.has(id)) service.detachVideo(id);
          else service.stop(id);
          try { c.video?.pause(); } catch (_) {}
          try { c.video?.remove(); } catch (_) {}
          c.video = null;
          try { c.resizeObserver?.disconnect(); } catch (_) {}
          c.resizeObserver = null;
          try { c.root.remove(); } catch (_) {}
          cardMap.delete(id);
        }
      }

      // 空态
      if (fullList.length === 0) {
        if (!grid.querySelector('.empty-state')) {
          grid.replaceChildren();
          grid.style.display = 'flex';
          grid.append($('div', { class: 'empty-state' }, [
            $('div', { style: { fontSize: '60px', opacity: '.3' } }, ''),
            $('div', { style: { fontSize: '15px' } }, t('emptyTitle')),
            $('div', { style: { fontSize: '12px', color: 'var(--text-muted)' } }, t('emptyHint')),
          ]));
        }
        return;
      }
      // 清掉空态（如果有）
      const empty = grid.querySelector('.empty-state');
      if (empty) empty.remove();

      if (mode === 'focus') {
        renderFocusLayout(list);
      } else {
        renderGridLayout(list);
      }
    }

    /* —— grid 布局：均分 —— */
    function renderGridLayout(list) {
      syncLayoutControls();
      grid.classList.remove('no-bottom');
      // 清掉 focus 模式专属容器
      grid.querySelectorAll('.focused-row, .thumbs-row, .focus-side-row, .focus-bottom-row, .resizer').forEach(el => {
        // 先把里面的 cam-card detach 出来，避免一并被 remove
        el.querySelectorAll('.cam-card').forEach(c => grid.appendChild(c));
        el.remove();
      });

      list.forEach((room, idx) => {
        let c = cardMap.get(room.id);
        if (!c) {
          buildCard(room);
          c = cardMap.get(room.id);
          grid.appendChild(c.root);
        } else {
          resetCardSizing(c.root);
          const cards = [...grid.children].filter(el => el.classList && el.classList.contains('cam-card'));
          const ref = cards[idx];
          if (c.root.parentElement !== grid || ref !== c.root) grid.insertBefore(c.root, ref || null);
        }
        resetCardSizing(c.root);
        applyCardGridSizing(c.root, room);
        requestRoomMediaIfNeeded(room.id);
        renderCardState(room);
      });
    }

    function focusRoom(roomId) {
      if (!roomId) return;
      store.patchSettings({ viewMode: 'focus', focusedRoomId: roomId, focusThumbsCollapsed: false });
    }

    function focusStep(delta) {
      const list = visibleRooms();
      if (!list.length) return;
      const cur = store.state.settings.focusedRoomId;
      let idx = list.findIndex(r => r.id === cur);
      if (idx < 0) idx = 0;
      const next = list[(idx + delta + list.length) % list.length];
      if (next) focusRoom(next.id);
    }

    /* —— focus 模式分隔条拖动：调整主屏宽高，副窗口自适应 —— */
    function attachFocusResizerHandlers(resizer, axis) {
      let dragging = false, startX = 0, startY = 0, startW = 62, startH = 64, currentW = 62, currentH = 64;
      const apply = (w, h) => {
        currentW = Math.max(45, Math.min(76, w));
        currentH = Math.max(44, Math.min(78, h));
        grid.style.gridTemplateColumns = `minmax(260px, ${currentW}fr) 8px minmax(190px, ${100 - currentW}fr)`;
        grid.style.gridTemplateRows = `minmax(220px, ${currentH}fr) 8px minmax(120px, ${100 - currentH}fr)`;
        grid.style.setProperty('--focus-main-w', currentW + 'fr');
        grid.style.setProperty('--focus-side-w', (100 - currentW) + 'fr');
        grid.style.setProperty('--focus-main-h', currentH + 'fr');
        grid.style.setProperty('--focus-bottom-h', (100 - currentH) + 'fr');
        requestAnimationFrame(applyFocusMainSizing);
      };
      resizer.addEventListener('mousedown', (e) => {
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startW = Math.max(45, Math.min(76, Number(store.state.settings.focusMainPct || 62)));
        startH = Math.max(44, Math.min(78, Number(store.state.settings.focusMainHPct || 64)));
        currentW = startW;
        currentH = startH;
        resizer.classList.add('dragging');
        document.body.style.cursor = axis === 'x' ? 'ew-resize' : 'ns-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
      });
      const move = (e) => {
        if (!dragging) return;
        if (axis === 'x') {
          const gridW = Math.max(1, grid.clientWidth || window.innerWidth || 1);
          apply(startW + ((e.clientX - startX) / gridW) * 100, currentH);
        } else {
          const gridH = Math.max(1, grid.clientHeight || window.innerHeight || 1);
          apply(currentW, startH + ((e.clientY - startY) / gridH) * 100);
        }
      };
      const up = () => {
        if (!dragging) return;
        dragging = false;
        resizer.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        store.patchSettings({ focusMainPct: Math.round(currentW), focusMainHPct: Math.round(currentH) });
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    }

    /* —— focus 布局：左上主屏；右侧 / 右下 / 下方为副窗口 —— */
    function renderFocusLayout(list) {
      let focusedId = store.state.settings.focusedRoomId;
      if (!list.some(r => r.id === focusedId)) {
        const preferred = list.find(r => r.lastStatus === 'online') || list[0];
        focusedId = preferred?.id || null;
        if (focusedId !== store.state.settings.focusedRoomId) store.state.settings.focusedRoomId = focusedId;
      }

      let focusedRow = grid.querySelector('.focused-row');
      let sideRow = grid.querySelector('.focus-side-row');
      let bottomRow = grid.querySelector('.focus-bottom-row');
      let vResizer = grid.querySelector('.focus-v-resizer');
      let hResizer = grid.querySelector('.focus-h-resizer');
      if (!focusedRow) focusedRow = $('div', { class: 'focused-row' });
      if (!sideRow) sideRow = $('div', { class: 'focus-side-row' });
      if (!bottomRow) bottomRow = $('div', { class: 'focus-bottom-row' });
      if (!vResizer) {
        vResizer = $('div', { class: 'resizer focus-v-resizer', title: LANG === 'zh' ? '拖动调整主屏宽度' : 'Drag to resize main width' });
        attachFocusResizerHandlers(vResizer, 'x');
      }
      if (!hResizer) {
        hResizer = $('div', { class: 'resizer focus-h-resizer', title: LANG === 'zh' ? '拖动调整主屏高度' : 'Drag to resize main height' });
        attachFocusResizerHandlers(hResizer, 'y');
      }

      focusedRow.style.gridArea = 'main';
      vResizer.style.gridArea = 'vbar';
      hResizer.style.gridArea = 'hbar';
      sideRow.style.gridArea = 'side';
      bottomRow.style.gridArea = 'bottom';

      [focusedRow, vResizer, hResizer, sideRow, bottomRow].forEach(el => {
        if (el.parentElement !== grid) grid.appendChild(el);
      });

      // Remove legacy containers if any
      grid.querySelectorAll('.thumbs-row').forEach(el => {
        el.querySelectorAll('.cam-card').forEach(c => sideRow.appendChild(c));
        el.remove();
      });

      // Direct children cards are collected before assigning.
      [...grid.children].forEach(el => {
        if (el.classList && el.classList.contains('cam-card')) sideRow.appendChild(el);
      });

      const focusedRoom = list.find(r => r.id === focusedId);
      const secondary = list.filter(r => r.id !== focusedId);
      const sideList = secondary;
      const bottomList = [];

      grid.classList.add('no-bottom');
      sideRow.style.gridTemplateRows = '';
      sideRow.style.gridAutoRows = 'minmax(104px, 140px)';
      sideRow.style.gridTemplateColumns = 'minmax(0, 1fr)';
      sideRow.style.overflowY = 'auto';
      bottomRow.style.gridTemplateColumns = bottomList.length ? `repeat(${bottomList.length}, minmax(0, 1fr))` : '1fr';
      bottomRow.style.gridTemplateRows = 'minmax(0, 1fr)';
      if (!bottomList.length) {
        grid.style.gridTemplateRows = 'minmax(0, 1fr)';
        grid.style.gridTemplateAreas = `'main vbar side'`;
      } else {
        applyGridSize();
      }

      const ensureCard = (room, parent, idx) => {
        let c = cardMap.get(room.id);
        if (!c) {
          buildCard(room);
          c = cardMap.get(room.id);
        }
        resetCardSizing(c.root);
        const cards = [...parent.children].filter(el => el.classList && el.classList.contains('cam-card'));
        const ref = cards[idx];
        if (c.root.parentElement !== parent || ref !== c.root) parent.insertBefore(c.root, ref || null);
        requestRoomMediaIfNeeded(room.id);
        renderCardState(room);
        c.root.classList.toggle('is-focus-main', room.id === focusedId);
        return c;
      };

      if (focusedRoom) {
        const c = ensureCard(focusedRoom, focusedRow, 0);
        c.root.classList.add('is-focus-main');
        applyFocusMainSizing();
      } else {
        [...focusedRow.children].forEach(el => { if (el.classList && el.classList.contains('cam-card')) sideRow.appendChild(el); });
      }

      sideList.forEach((room, idx) => ensureCard(room, sideRow, idx));
      bottomList.forEach((room, idx) => ensureCard(room, bottomRow, idx));

      const keep = new Set(list.map(r => r.id));
      [focusedRow, sideRow, bottomRow].forEach(parent => {
        [...parent.children].forEach(el => {
          const id = el.dataset?.roomId;
          if (id && !keep.has(id)) sideRow.appendChild(el);
        });
      });

      requestAnimationFrame(applyFocusMainSizing);
      syncLayoutControls();
    }

    // ---- 渲染调度：合并同一帧内的多次状态变化，减少批量添加、切页和状态刷新时的抖动 ----
    let sidebarRenderRaf = 0;
    let gridRenderRaf = 0;
    let focusSizingRaf = 0;
    function scheduleSidebarRender() {
      if (sidebarRenderRaf) return;
      sidebarRenderRaf = requestAnimationFrame(() => { sidebarRenderRaf = 0; renderSidebar(); });
    }
    function scheduleGridRender() {
      if (gridRenderRaf) return;
      gridRenderRaf = requestAnimationFrame(() => { gridRenderRaf = 0; renderGrid(); });
    }
    function scheduleFocusSizing() {
      if (focusSizingRaf) return;
      focusSizingRaf = requestAnimationFrame(() => { focusSizingRaf = 0; applyFocusMainSizing(); });
    }

    // ---- Store 订阅 ----
    store.subscribe((state, path) => {
      const isSettingsPath = path === 'settings' || (typeof path === 'string' && path.startsWith('settings:'));
      const settingKeys = isSettingsPath && typeof path === 'string' && path.includes(':')
        ? path.slice(path.indexOf(':') + 1).split(',').filter(Boolean)
        : [];
      const hasSetting = (...keys) => !settingKeys.length || keys.some(k => settingKeys.includes(k) || settingKeys.some(x => x.startsWith(k + '.')));

      if (path === 'groups' || path === 'rooms' || path === 'all' || isSettingsPath) {
        const fullRefresh = path === 'groups' || path === 'rooms' || path === 'all' || path === 'settings' || !settingKeys.length;
        const needsSidebar = fullRefresh || hasSetting('activeGroup', 'sidebarCollapsed');
        const needsGrid = fullRefresh || hasSetting(
          'activeGroup', 'filter', 'sortBy', 'searchQuery', 'layoutSize', 'phoneLayoutSize', 'phoneModeAuto', 'pageIndex',
          'viewMode', 'focusedRoomId', 'focusMainPct', 'focusMainHPct', 'focusAspect', 'focusThumbSize',
          'showRecordingOnly', 'favoriteFirst', 'splitRoomIds', 'splitViewActive', 'splitRatio', 'splitAudioRoomId', 'splitToolbarPosition'
        );

        if (needsSidebar) scheduleSidebarRender();
        if (needsGrid) scheduleGridRender();

        sortSel.value = state.settings.sortBy;
        filterSel.value = filterModeFromState();
        sizeSlider.value = String(state.settings.gridSize);
        if (document.activeElement !== searchInput) searchInput.value = state.settings.searchQuery || '';
        focusScaleSlider.value = String(state.settings.focusMainPct || 62);
        focusAspectSel.value = state.settings.focusAspect || 'auto';
        focusThumbSlider.value = String(state.settings.focusThumbSize || 150);
        syncViewSeg();
        syncLayoutControls();
        syncShellControls();
        applyPureModeState();
        if (hasSetting('maxStreamHeight')) service.refreshQuality();
        if (hasSetting('videoTransforms')) applyAllVideoTransforms();
        if (needsGrid || hasSetting('toolbarCollapsed', 'sidebarCollapsed', 'viewerMode', 'pureMode')) scheduleFocusSizing();
      }
      if (path && path.startsWith('room:')) {
        const id = path.slice(5);
        const r = state.rooms.find(x => x.id === id);
        if (r) renderCardState(r);
        scheduleSidebarRender();
        // 状态排序时，单卡状态变化也要重排
        if (state.settings.splitViewActive || state.settings.activeGroup === ONLINE_GROUP_ID || state.settings.activeGroup === ONLINE_FAVORITES_GROUP_ID || state.settings.sortBy === 'status' || state.settings.filter?.hideOffline || state.settings.filter?.hidePrivate || state.settings.filter?.onlyOnline) scheduleGridRender();
      }
    });

    // ---- EventBus 订阅 ----
    EventBus.on('room:online', ({ id, hlsSource }) => {
      if (!findRoomAny(id)) { service.stop(id); return; }
      mediaAttachPendingIds.delete(id);
      if (!shouldAttachRoomMedia(id)) {
        service.detachVideo(id);
        const offscreenRoom = findRoomAny(id);
        if (offscreenRoom) renderCardState(offscreenRoom);
        return;
      }
      const video = attachVideoElement(id);
      if (!video) return;
      service.startHls(id, hlsSource);
      const r = findRoomAny(id);
      if (r) renderCardState(r);
      requestAnimationFrame(applyFocusMainSizing);
    });
    EventBus.on('room:flash', (id) => {
      const c = cardMap.get(id);
      if (!c) return;
      c.root.classList.remove('flash');
      void c.root.offsetWidth;  // 强制重排重启动画
      c.root.classList.add('flash');
      setTimeout(() => c.root.classList.remove('flash'), 5000);
    });

    // ---- 跨标签页实时同步 ----
    // 当用户在主播页点击「加入」时，已打开的工作台立刻感知并新增卡片（无需刷新）
    window.addEventListener('storage', (e) => {
      if (e.key !== STORE_KEY) return;
      try {
        if (!e.newValue) { syncFromExternalState(defaultState()); return; }
        const ext = sanitizeState(JSON.parse(e.newValue));
        if (!ext || !Array.isArray(ext.rooms)) return;
        syncFromExternalState(ext);
      } catch (_) {}
    });

    function syncFromExternalState(ext) {
      const normalized = sanitizeState(ext && typeof ext === 'object' ? ext : defaultState());
      const currentById = new Map(store.state.rooms.map(r => [r.id, r]));
      const extRooms = (Array.isArray(normalized.rooms) ? normalized.rooms : []).map(r => {
        const local = currentById.get(r.id);
        if (local && isStableRoomStatus(local.lastStatus) && isTransientRoomStatus(r.lastStatus)) {
          return {
            ...r,
            lastStatus: local.lastStatus,
            lastSeenOnline: Math.max(numeric(local.lastSeenOnline, 0), numeric(r.lastSeenOnline, 0)),
            privateLabel: local.lastStatus === 'private' ? (local.privateLabel || r.privateLabel) : r.privateLabel,
          };
        }
        return r;
      });
      const curIds = new Set(store.state.rooms.map(r => r.id));
      const nextIds = new Set(extRooms.map(r => r.id));
      const removedRoomIds = [...curIds].filter(id => !nextIds.has(id));
      const newRoomIds = [...nextIds].filter(id => !curIds.has(id));

      // 多窗口只同步房间 / 分组，不同步 viewMode / focusedRoomId / filter 等本窗口视图设置。
      // 否则一个窗口切主屏会把另一个窗口的主屏也顶掉。
      const localSettings = JSON.parse(JSON.stringify(store.state.settings || defaultState().settings));
      const nextState = {
        ...normalized,
        rooms: extRooms,
        groups: Array.isArray(normalized.groups) && normalized.groups.length ? normalized.groups : store.state.groups,
        settings: localSettings,
      };
      const groupIds = new Set(nextState.groups.map(g => g.id));
      if (!groupIds.has(nextState.settings.activeGroup)) nextState.settings.activeGroup = DEFAULT_GROUP_ID;
      if (nextState.settings.focusedRoomId && !nextIds.has(nextState.settings.focusedRoomId)) {
        const preferred = extRooms.find(r => r.lastStatus === 'online') || extRooms[0];
        nextState.settings.focusedRoomId = preferred?.id || null;
      }

      // 外部标签页同步只替换内存状态，不回写 localStorage，避免多个工作台互相触发 storage ping-pong。
      store.replaceState(nextState, 'all');

      // service 启停（replaceState 之后，避免 service 提前 fire 状态时找不到对应数据）
      for (const id of removedRoomIds) service.stop(id);
      for (const id of newRoomIds) service.start(id);
      for (const id of nextIds) {
        if (!service.has(id)) service.start(id);
      }
    }

    // ---- 全局拖动结束 ----
    grid.addEventListener('dragover', (e) => e.preventDefault());

    // ---- 快捷键 ----
    function shortcutMatches(e, action) {
      const shortcuts = sanitizeShortcuts(store.state.settings.shortcuts, defaultShortcuts());
      return shortcutFromEvent(e) === shortcuts[action];
    }

    document.addEventListener('keydown', (e) => {
      const key = String(e.key || '').toLowerCase();
      if (e.key === 'Escape') closeTransientUi();
      if (shortcutMatches(e, 'pureMode') || (e.altKey && key === 'c')) { e.preventDefault(); togglePureMode(); return; }
      if (shortcutMatches(e, 'viewerMode')) { e.preventDefault(); toggleViewerMode(); return; }
      if (shortcutMatches(e, 'focusThumbs')) { e.preventDefault(); toggleFocusThumbs(); return; }
      if (e.key === 'Escape' && store.state.settings.pureMode) { e.preventDefault(); setPureMode(false); return; }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (shortcutMatches(e, 'refreshAll')) { e.preventDefault(); service.refreshAll(); return; }
      if (shortcutMatches(e, 'focusAdd')) { e.preventDefault(); tbInput.focus(); return; }
      if (shortcutMatches(e, 'recordingCenter')) { e.preventDefault(); openRecordingCenter(); return; }
      if (shortcutMatches(e, 'recordPage')) { e.preventDefault(); recordCurrentPage(); return; }
      if (shortcutMatches(e, 'openRoom')) { e.preventDefault(); openShortcutRoom(); return; }
      if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
      if (store.state.settings.viewMode === 'focus') {
        if (e.code === 'Space') {
          e.preventDefault();
          const id = store.state.settings.focusedRoomId;
          if (id) { service.togglePause(id); requestAnimationFrame(() => updateCardButtons(id)); }
        }
        if (e.key === 'ArrowRight' || e.key === ']') { e.preventDefault(); focusStep(1); }
        if (e.key === 'ArrowLeft' || e.key === '[') { e.preventDefault(); focusStep(-1); }
      }
      // 视图切换：g = grid, f = focus
      if (shortcutMatches(e, 'gridView')) { e.preventDefault(); setViewMode('grid'); return; }
      if (shortcutMatches(e, 'focusView')) {
        e.preventDefault();
        setViewMode('focus');
        return;
      }
    });

    // ---- 首次渲染 + 全量启动 service ----
    // service 独立于 UI 运行：所有 store 中的房间都参与轮询，
    // 这样切到其它分组时，被隐藏房间的上线事件也能被检测到并触发桌面通知。
    loadSharedWorkspaceFromHash();
    loadSavedTemporarySources();
    renderSidebar();
    renderGrid();
    applyPureModeState();
    for (const r of store.state.rooms) service.start(r.id);
    setTimeout(checkRecordingIntentRecovery, 1200);

    // 兜底：定期检查 sessions 与 rooms 是否一致（防止某些边缘 case 数据漂移）
    setInterval(() => {
      for (const r of store.state.rooms) {
        if (!service.has(r.id)) service.start(r.id);
      }
    }, 60000);

    // 调试入口默认不暴露到页面；需要时先在控制台设置 localStorage.ryujo_multicam_debug = '1' 后刷新。
    try {
      if (localStorage.getItem('ryujo_multicam_debug') === '1') window.__multicam = { store, service, EventBus };
      else if (window.__multicam) delete window.__multicam;
    } catch (_) {}
  }

})();


/* =============================================================
 * Integrated component: Chaturbate Reloaded 1.8.0
 * Original author: Ladroop. License: MIT.
 * Its storage resets are scoped so they cannot erase MultiCam.
 * ============================================================= */
(function() {
    'use strict';

    // Integrated Reloaded 1.8.0: keep it off the standalone MultiCam workstation and prevent duplicate startup.
    if (new URLSearchParams(location.search).get('multicam_mode') === '1') { return; }
    var reloadedPath = String(location.pathname || '');
    if (location.hostname === 'secure.chaturbate.com' || /^\/(?:security|auth|apps|api|b|fullvideo)(?:\/|$)/.test(reloadedPath) || /^\/accounts\/followers(?:\/|$)/.test(reloadedPath)) { return; }
    if (window.__chaturbateReloadedIntegratedRunning) { return; }
    window.__chaturbateReloadedIntegratedRunning = true;

    // Reloaded historically cleared all site storage. In the suite that would erase MultiCam.
    // Limit the reset to Reloaded settings and runtime caches.
    var reloadedOwnedStorageKeys = [
        'animationoff', 'bigthumb', 'defaultVideoWidth', 'hidemt', 'hpfltopen',
        'ignoredusers', 'isTheaterMode', 'login', 'newtabon', 'pclean',
        'recautosave', 'recvp9', 'refreshoff', 'regloaded', 'smallsnap',
        'videoControls', 'zoomoff'
    ];
    // The global chat-filter profile is intentionally not session-cleared so it is remembered for every room.
    function clearReloadedLocalStorage() {
        reloadedOwnedStorageKeys.forEach(function(key) { localStorage.removeItem(key); });
        for (var storageIndex = localStorage.length - 1; storageIndex >= 0; storageIndex--) {
            var storageKey = localStorage.key(storageIndex);
            if (storageKey && (storageKey.indexOf('region_') === 0 || /Tokens$/.test(storageKey))) {
                localStorage.removeItem(storageKey);
            }
        }
    }
    var currpage=document.location.href;
    var roomname= currpage.split("/")[3];
    if (!readCookie("ssession")){
        clearReloadedLocalStorage();
        createCookie("ssession","foo");
    }
    if (roomname=="messages"){
        if(window.opener){
            if (window.opener.innerWidth!=window.innerWidth){
                setTimeout(function(){document.getElementById("desktop-spa-header").style.display="none";},200);
                return;
            }
        }
    }

    if (roomname=="my_collection"){
        if (document.getElementsByTagName("video").length>0){
            savedprvdownload();
        }
        return;
    }
    setgenstyle();
    if (roomname=="photo_videos"){
        collectiondownload();
        return;
    }

    if (!document.getElementById("desktop-spa-header")){return;}
    var version=GM_info.script.version;
    var scriptname=GM_info.script.name;
    var i=0;
    var n=0;
    var stor="greg44609";
    var domain="https://"+window.location.hostname+"/";
    var thisfap="";
    var fapbr="";
    var cimg=new Image();
    var lt2=0;
    var usernoteslist = "";
    if (currpage.indexOf(stor)!=-1){document.location.href=domain;}
    var note='<svg style="height: 2.0em; width: 2.0em;" viewBox="0 0 12 12" xmlns="https://www.w3.org/2000/svg"><path fill="hsla(0, 100%, 50%, 0.8)" d="M5.5 2.00002H2C1.73478 2.00002 1.48043 2.10537 1.29289 2.29291C1.10536 2.48044 1 2.7348 1 3.00002V10C1 10.2652 1.10536 10.5196 1.29289 10.7071C1.48043 10.8947 1.73478 11 2 11H9C9.26522 11 9.51957 10.8947 9.70711 10.7071C9.89464 10.5196 10 10.2652 10 10V6.50002" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.25 1.24985C9.44891 1.05094 9.7187 0.939194 10 0.939194C10.2813 0.939194 10.5511 1.05094 10.75 1.24985C10.9489 1.44877 11.0607 1.71855 11.0607 1.99985C11.0607 2.28116 10.9489 2.55094 10.75 2.74985L6 7.49985L4 7.99985L4.5 5.99985L9.25 1.24985Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    var nonote='<svg style="height: 2.0em; width: 2.0em;" viewBox="0 0 12 12" xmlns="https://www.w3.org/2000/svg"><path fill="hsla(197, 10%, 98%, 0.3)" d="M5.5 2.00002H2C1.73478 2.00002 1.48043 2.10537 1.29289 2.29291C1.10536 2.48044 1 2.7348 1 3.00002V10C1 10.2652 1.10536 10.5196 1.29289 10.7071C1.48043 10.8947 1.73478 11 2 11H9C9.26522 11 9.51957 10.8947 9.70711 10.7071C9.89464 10.5196 10 10.2652 10 10V6.50002" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.25 1.24985C9.44891 1.05094 9.7187 0.939194 10 0.939194C10.2813 0.939194 10.5511 1.05094 10.75 1.24985C10.9489 1.44877 11.0607 1.71855 11.0607 1.99985C11.0607 2.28116 10.9489 2.55094 10.75 2.74985L6 7.49985L4 7.99985L4.5 5.99985L9.25 1.24985Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    var notegrey='<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 12 12" role="img"><path stroke="#48484E" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V6.5"></path><path stroke="#48484E" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.25 1.25a1.06 1.06 0 0 1 1.5 1.5L6 7.5 4 8l.5-2z"></path></svg>';
    var sitelocation="";
    var username="anonymous";
    var supporter=false;
    var login=false;
    var pageType="";
    var thumbobserver1=new MutationObserver(addevent2);
    var banusers=[];
    var noaccess=false;
    var hidurl=domain+"api/ts/roomlist/room-list/?&hidden=true&limit=90&offset=";
    var hprom=false;
    var hidoffset=0;
    var hiddenarray=[];
    var tr2="https://www.chaturbate.com/translate_a/";
    var observer3 = new MutationObserver(varea);
    var observerConfig3 = {childList: true, subtree: true};
    var region=["asia","europe_russia","northamerica","southamerica","other"];
    var niceregion=["Asia","Europe/Russia","North America","South America","Other (Australia, Africa, etc.)"];
    var rcount=0;
    var regoffset=0;
    var regioarray=[];
    var regiofetch=true;
    var biodata="";
    var openthumbname="";
    var referenceNode="";
    var fetching=0;
    var hlsfetching=false;
    var br="";
    var vfilter="brightness(100%) contrast(100%) invert(0%) saturate(100%) hue-rotate(0deg)";
    var ofils="";
    var vmirror="none";
    var pos1=0;
    var pos2=0;
    var pos3=0;
    var pos4=0;
    var vareaid="";
    var pageobserver=new MutationObserver(pageevent);
    var pageobserverConfig ={attributes : true, attributeFilter : ['class'] };
    var ctitle=document.title;
    var opennote="";
    var data="";
    var room_status="";
    var videoSrc="";
    var stream;
    var vidwidth=854;
    var hls = new Hls();
    var vidpausetime=0;
    var vidonpause=false;
    var gojpg=false;
    var fatalerror=0;
    var restarts=0;
    var pimg = new Image();
    var recording=false;
    var recpause=false;
    var mediaRecorder;
    var recordedBlobs=[];
    var blob = new Blob([]);
    var url = URL.createObjectURL(blob);
    var recname="";
    var stoppressed=false;
    var timerrecstop=false;
    var savetime=20;
    var rectime=0;
    var recparts=1;
    var recTimeoutID=0;
    var zeroData=0;
    var recwait=false;
    var prectime=0;
    var bitrate=2500000;
    var mimeTypes=['video/mp4; codecs="avc3.64001F, mp4a.40.2"',
                   'video/mp4; codecs="vp9, opus"',
                   'video/webm',
                   'video/webm'];
    var extentions=['.mp4',
                    '.mp4',
                    '.webm',
                    '.webm'];
    var vidcontainers=['video/mp4',
                       'video/mp4',
                       'video/webm',
                       'video/webm'];
    var mimeType=0;
    for(mimeType=0;mimeType < mimeTypes.length-1;mimeType++) {
        if (MediaRecorder.isTypeSupported(mimeTypes[mimeType])){break;}
    }
    var c1=0;
    var c2=0;
    var c3=0;
    var c4=0;
    var c5=0;
    var c6=0;
    var c7=0;
    var c7a=100;
    var c8=0;
    var c10=0;
    var reloadedChatSettingsKey='reloadedGlobalChatSettingsV1';
    var firstentry=true;
    var twaiting=false;
    var chatrules="";
    var tabblink=false;
    var alarmrun=false;
    var roomstatus="";
    var oldroomstatus="";
    var roomthumbs="";
    var followstar="";
    var nrt=0;
    var scBusy=false;
    var csBusy=false;
    var bcBusy=false;
    var c4Busy=false;
    var smBusy=false;
    var mfcBusy=false;

    function normalizeReloadedChatToggle(value){
        return Number(value)===1 ? 1 : 0;
    }

    function readReloadedChatSettings(){
        var defaults={version:1,c1:0,c2:0,c3:0,c4:0,c5:0,c6:0,c7:0,c7a:100,c8:0,c10:0,language:''};
        try {
            var raw=localStorage.getItem(reloadedChatSettingsKey);
            if (!raw){return defaults;}
            var saved=JSON.parse(raw);
            if ((!saved)||(typeof saved!='object')||(Array.isArray(saved))){return defaults;}
            var threshold=parseInt(saved.c7a,10);
            if (!Number.isFinite(threshold)){threshold=100;}
            threshold=Math.max(2,Math.min(1000,threshold));
            var language=typeof saved.language=='string'&&/^[a-z-]{2,8}$/i.test(saved.language) ? saved.language : '';
            return {
                version:1,
                c1:normalizeReloadedChatToggle(saved.c1),
                c2:normalizeReloadedChatToggle(saved.c2),
                c3:normalizeReloadedChatToggle(saved.c3),
                c4:normalizeReloadedChatToggle(saved.c4),
                c5:normalizeReloadedChatToggle(saved.c5),
                c6:normalizeReloadedChatToggle(saved.c6),
                c7:normalizeReloadedChatToggle(saved.c7),
                c7a:threshold,
                c8:normalizeReloadedChatToggle(saved.c8),
                c10:normalizeReloadedChatToggle(saved.c10),
                language:language
            };
        } catch (error) {
            return defaults;
        }
    }

    function applyReloadedChatSettings(){
        var saved=readReloadedChatSettings();
        c1=saved.c1;
        c2=saved.c2;
        c3=saved.c3;
        c4=saved.c4;
        c5=saved.c5;
        c6=saved.c6;
        c7=saved.c7;
        c7a=saved.c7a;
        c8=saved.c8;
        c10=saved.c10;
        ['c1','c2','c3','c4','c5','c6','c7','c8','c10'].forEach(function(id){
            var control=document.getElementById(id);
            if (control){control.value=String(saved[id]);}
        });
        var thresholdControl=document.getElementById('c7a');
        if (thresholdControl){thresholdControl.value=String(saved.c7a);}
        var languageControl=document.getElementById('language');
        if (languageControl&&saved.language){
            var languageExists=Array.from(languageControl.options).some(function(option){return option.value==saved.language;});
            if (languageExists){languageControl.value=saved.language;}
        }
        smallemoonoff();
    }

    function saveReloadedChatSettings(){
        var languageControl=document.getElementById('language');
        var settings={
            version:1,c1:Number(c1),c2:Number(c2),c3:Number(c3),c4:Number(c4),
            c5:Number(c5),c6:Number(c6),c7:Number(c7),c7a:Number(c7a),
            c8:Number(c8),c10:Number(c10),language:languageControl ? languageControl.value : ''
        };
        try {localStorage.setItem(reloadedChatSettingsKey,JSON.stringify(settings));} catch (error) {}
    }

    function applyReloadedChatSettingsToMessages(){
        twaiting=true;
        chatadjust();
        setTimeout(function(){twaiting=false;},200);
    }

    window.addEventListener('storage',function(event){
        if (event.key!=reloadedChatSettingsKey){return;}
        applyReloadedChatSettings();
        applyReloadedChatSettingsToMessages();
    });
    if (document.querySelector('[data-testid="close-entrance-terms"]')){
        document.querySelector('[data-testid="close-entrance-terms"]').click();
    }
    if (document.getElementsByClassName("dismiss_notice_tfa_and_email").length>0){
        document.getElementsByClassName("dismiss_notice_tfa_and_email")[0].click();
    }
    if (document.getElementsByClassName("siteNotice").length>0){
        var links = document.getElementsByClassName("siteNotice")[0].getElementsByTagName("a");
        for (n=0; n<links.length; n++){
            if (!links[n].hasAttribute("href")){
                links[n].click();
            }
        }
        n=0;
    }
    if (!document.hasFocus()){
        document.addEventListener("visibilitychange",headerReady);
        return;
    }
    headerReady();
    return;
    function headerReady(){
        document.removeEventListener("visibilitychange",headerReady);
        if (document.querySelector('[data-testid="header-top-row"]')){
            getUserinfo();
            return;
        }
        n++;
        if(n==100){return;}
        setTimeout(headerReady,100);
    }
    function getUserinfo(){
        refresher();
        var scripts=document.getElementsByTagName("script");
        for (n=0; n<scripts.length; n++){
            if(!scripts[n].hasAttribute("scr")){
                if (scripts[n].innerHTML.includes("Minimal extend implementation")){
                    var userinfo=scripts[n].innerHTML.split("logged_in_user: JSON.parse('")[1].split("')")[0];
                    if(userinfo=="null"){
                        break;
                    }
                    login=true;
                    var userinfojson=JSON.parse('"'+userinfo+'"').replaceAll('"','');
                    username=userinfojson.split('username: ')[1].split(',')[0];
                    if (userinfojson.split('is_supporter: ')[1].split(',')[0]=="true"){
                        supporter=true;
                    }
                    if (userinfojson.split('is_staff: ')[1].split(',')[0]=="true"){
                        alert("Please be nice Mr. Chaturbate staff. 😳");
                    }
                    break;
                }
            }
        }
        getsaving();
        hidemtenter();
        makeScriptMenu();
    }
    function makeScriptMenu(){
        var newdiv=document.createElement('div');
        newdiv.id="holdpage";
        newdiv.className="holdpage";
        document.getElementById("base").prepend(newdiv);
        var top="";
        if (login){
            top=document.querySelector('[data-testid="user-header-menu"]');
        }else{
            top=document.getElementsByClassName("HeaderTopRow__anon-buttons")[0];
        }
        newdiv=document.createElement('div');
        newdiv.id="scriptsettings";
        newdiv.className="HeaderUserProfileIconContainer";
        newdiv.title="Script menu";
        newdiv.innerHTML='<div class="HeaderUserProfileIcon" style="border-radius:25%;background:#a84808"><span class="HeaderUserProfileIcon__letter">&#128128</span></div>';
        newdiv.addEventListener("click",togglescriptMenu);
        top.prepend(newdiv);
        moreoptions();
        getignorelist();
        setTimeout(getPagetype,100);
    }
    function togglescriptMenu(){
        if(document.getElementById("scriptcontrols").style.display=="none"){
            document.getElementById("scriptcontrols").style.display="block";
            document.getElementById("main").addEventListener("click",togglescriptMenu);
        }else{
            document.getElementById("scriptcontrols").style.display="none";
            document.getElementById("main").removeEventListener("click",togglescriptMenu);
        }
    }
    function pageevent(){
        if (sitelocation==document.location.href.split("/")[3]){return;}
        document.getElementById("holdpage").style.display="block";
        pageobserver.disconnect();
        thumbobserver1.disconnect();
        document.querySelector('[data-testid="room-bio-tab-contents"]').innerHTML="";
        cleanuppage();
        getPagetype();
    }
    function getPagetype(){
        unfollowoption();
        currpage=document.location.href;
        roomname=currpage.split("/")[3];
        sitelocation=roomname;
        var newpageType="thumbs";
        if (document.getElementById("main")){
            if (document.getElementById("main").innerHTML.includes("HTTP 404")){newpageType="notfound";}
            var mainClass=document.getElementById("main").classList;
            if (mainClass.contains("roomPage")){newpageType="profile";}
            if (mainClass.contains("discover")){newpageType="discover";}
            if (mainClass.contains("tags")){newpageType="tags";}
            if (mainClass.contains("chat_roomlogin")){newpageType="password";}
            if (mainClass.contains("chat_profile")){newpageType="ppage";}
            pageobserver.observe(document.getElementById("main"),pageobserverConfig);
        }
        if (document.querySelector('[data-testid="denied-notice"]')){newpageType="noaccess";}
        pageType=newpageType;
        if (login){
            document.getElementById("ignore").style.display="none";
            if ((pageType=="profile")||(pageType=="password")||(pageType=="ppage")||(pageType=="noaccess")){
                document.getElementById("ignore").style.display="block";
            }
        }
        if (pageType!="thumbs"){
            document.getElementById("holdpage").style.display="none";
        }
        if (pageType=="thumbs"){
            setTimeout(function(){document.getElementById("holdpage").style.display="none";},4000);
            setTimeout(thumbpageset,500);
        }
        if (pageType=="profile"){
            profilepageset();
        }
        if (pageType=="ppage"){
            profilepageset();
        }
        if (pageType=="password"){
            roomname=currpage.split("/")[4];
            passwordfollow();
        }
        if (pageType=="noaccess"){
            bannedroom();
        }
    }
    function thumbpageset(){
        buildnotepop();
        reloadoption();
        getnoteslist();
    }
    function profilepageset(){
        n=0;
        bioreadytest();
    }
    function bioreadytest(){
        if (!document.querySelector('[data-testid="room-bio-tab-contents"]')){
            n++;
            if(n==100){return;}
            setTimeout(bioreadytest, 100);
            return;
        }
        n=0;
        bioreadytest2();
    }
    function bioreadytest2(){
        if (document.querySelector('[data-testid="room-bio-tab-contents"]').getElementsByTagName("table").length==0){
            n++;
            if(n==100){return;}
            setTimeout(bioreadytest2, 100);
            return;
        }
        setTimeout(dobiothings, 1000);
    }

    function reloadoption(){
        if (document.getElementById("reloadoption")){return;}
        var loc=document.querySelector('[data-paction="Search"]');
        var newelem=document.createElement('div');
        newelem.style.cursor="pointer";
        newelem.innerHTML="⟳";
        newelem.style.fontSize="25px";
        newelem.style.color="#0c6a93";
        newelem.id="reloadoption";
        newelem.addEventListener("click", function(){window.location.reload();});
        loc.prepend(newelem);
    }

    function hidemtenter(){
        subsel();
        var genroomname=document.location.href.split("/")[3];
        if (document.getElementsByClassName("gender-tab").length >1){
            var toptabs=document.getElementsByClassName("gender-tab");
            for (n=0; n<toptabs.length; n++){
                if (toptabs[n].href){
                    toptabs[n].style.display="block";
                }
            }
            if (!localStorage.getItem("hidemt")){return;}
            if (genroomname=="followed-cams"){return;}
            for (n=0; n<toptabs.length; n++){
                if (toptabs[n].href){
                    if (toptabs[n].href.indexOf("/male-")!=-1){
                        toptabs[n].style.display="none";
                    }
                    if (toptabs[n].href.indexOf("/male/")!=-1){
                        toptabs[n].style.display="none";
                    }
                    if (toptabs[n].href.indexOf("/trans-")!=-1){
                        toptabs[n].style.display="none";
                    }
                    if (toptabs[n].href.indexOf("/trans/")!=-1){
                        toptabs[n].style.display="none";
                    }
                }
            }
        }
        if(document.querySelector('[data-testid="gender-nav-m"]')){
            document.querySelector('[data-testid="gender-nav-m"]').style.display="block";
            document.querySelector('[data-testid="gender-nav-t"]').style.display="block";
            if (!localStorage.getItem("hidemt")){return;}
            if (genroomname=="followed-cams"){return;}
            document.querySelector('[data-testid="gender-nav-m"]').style.display="none";
            document.querySelector('[data-testid="gender-nav-t"]').style.display="none";
            if ((genroomname=="male-cams")||(genroomname=="trans-cams")){
                document.location.href=domain;
            }
        }
    }

    function cleanuppage(){
        observer3.disconnect();
        if (document.getElementById("notepop")){
            document.getElementById("notepop").remove();
        }
        var toolsMenuButton=document.getElementById("reloadedtoolsbutton");
        if (toolsMenuButton){
            toolsMenuButton.setAttribute("aria-expanded","false");
            toolsMenuButton.style.cursor="pointer";
        }
        if (document.getElementById("reloadedtoolspanel")){
            document.getElementById("reloadedtoolspanel").remove();
        }
        if (document.getElementById("clean")){
            document.getElementById("clean").remove();
        }
        if (document.getElementById("infore")){
            document.getElementById("infore").remove();
        }
        if (document.getElementById("controls")){
            document.getElementById("controls").remove();
        }
        if (document.getElementById("chatcontrols")){
            document.getElementById("chatcontrols").remove();
        }
        if (document.getElementById("rulespop")){
            document.getElementById("rulespop").remove();
        }
    }

    function moreoptions(){
        var newelem=document.createElement('div');
        newelem.id="scriptcontrols";
        newelem.style.display="none";
        newelem.className="scriptset";
        document.querySelector('[data-testid="header-top-row"]').appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="scriptinfo";
        newelem.innerHTML=scriptname+" Version: "+version;
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="suiteexport";
        newelem.style.cursor="pointer";
        newelem.innerHTML="Export MultiCam + Reloaded to GitHub";
        newelem.addEventListener("click", function(event){
            event.stopPropagation();
            if (window.__chaturbateSuiteSettings){window.__chaturbateSuiteSettings.exportSettings();}
        });
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="suiteimport";
        newelem.style.cursor="pointer";
        newelem.innerHTML="Import MultiCam + Reloaded from GitHub";
        newelem.addEventListener("click", function(event){
            event.stopPropagation();
            if (window.__chaturbateSuiteSettings){window.__chaturbateSuiteSettings.importSettings();}
        });
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="githubsyncbutton";
        newelem.style.cursor="pointer";
        newelem.innerHTML="GitHub Cloud: Setup required";
        newelem.addEventListener("click", function(event){
            event.stopPropagation();
            if (window.__chaturbateSuiteSettings){window.__chaturbateSuiteSettings.configureGithubSync();}
        });
        document.getElementById("scriptcontrols").appendChild(newelem);
        updateGithubSyncMenuLabel();

        newelem=document.createElement('span');
        newelem.id="reloadedtoolsbutton";
        newelem.style.cursor="pointer";
        newelem.innerHTML="Reloaded Tools";
        newelem.setAttribute("role","button");
        newelem.setAttribute("tabindex","0");
        newelem.setAttribute("aria-controls","reloadedtoolspanel");
        newelem.setAttribute("aria-expanded","false");
        newelem.addEventListener("click",toggleReloadedToolsFromMenu);
        newelem.addEventListener("keydown",function(event){
            if ((event.key=="Enter")||(event.key==" ")){
                event.preventDefault();
                toggleReloadedToolsFromMenu(event);
            }
        });
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('div');
        newelem.id="reloadedtoolsmount";
        newelem.style.clear="both";
        newelem.style.width="100%";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.innerHTML="--Script settings--<div style='float:right'>Off ↔ On</div>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h1";
        newelem.innerHTML="Thumbnail zoom : <input type='range' id='a1' min=0 max=1 value=1 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h2";
        newelem.innerHTML="Preview rooms : <input type='range' id='a2' min=0 max=1 value=1 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        if (supporter){
            newelem.style.display="none";
        }
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h3";
        newelem.innerHTML="Open rooms in new tab : <input type='range' id='a3' min=0 max=1 value=1 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h4";
        if (!login){
            newelem.style.display="none";
        }
        newelem.innerHTML="Auto refresh followed : <input type='range' id='a4' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h6";
        newelem.innerHTML="Big thumbnails : <input type='range' id='a6' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h5";
        newelem.innerHTML="Hide male/trans : <input type='range' id='a5' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h9";
        newelem.innerHTML="480px snapshots : <input type='range' id='a9' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h7";
        newelem.innerHTML="Auto save recordings every 20 mins: <input type='range' id='a7' min=0 max=1 value=1 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h8";
        newelem.style.display="none";
        if (mimeType==0){
            newelem.style.display="block";
        }
        newelem.innerHTML="Use vp9 video codec for recording: <input type='range' id='a8' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);
        if(login){
        newelem=document.createElement('span');
        newelem.id="saved";
        newelem.style.cursor="pointer";
        newelem.innerHTML="Save all settings.";
        newelem.addEventListener("click", savesetting );
        document.getElementById("scriptcontrols").appendChild(newelem);
        newelem=document.createElement('span');
        newelem.id="clear";
        newelem.style.cursor="pointer";
        newelem.innerHTML="Clear all saved settings.";
        newelem.addEventListener("click", clearsettings );
        document.getElementById("scriptcontrols").appendChild(newelem);
        newelem=document.createElement('span');
        newelem.id="clear";
        newelem.style.cursor="pointer";
        newelem.innerHTML="Manage ban's.";
        newelem.addEventListener("click", bantoggle );
        document.getElementById("scriptcontrols").appendChild(newelem);
        newelem=document.createElement('span');
        newelem.innerHTML="<select id='banusers' class='darkselect' style='width:220px'></select><br><input id='unbanbut' type='button' value='Unban' style='margin:8px 0px 0px 0px'><input id='permbut' type='button' value='Make permanent' style='margin:8px 15px 0px 8px'>";
        newelem.id="banlist";
        newelem.style.display="none";
        document.getElementById("scriptcontrols").appendChild(newelem);
        newelem=document.createElement('span');
        newelem.innerHTML="Ban/ignore this room.";
        newelem.id="ignore";
        newelem.style.cursor="pointer";
        newelem.addEventListener("click", banignore );
        document.getElementById("scriptcontrols").appendChild(newelem);
        }
        document.getElementById("a1").addEventListener("change",zoomoff);
        document.getElementById("a2").addEventListener("change",anionoff);
        document.getElementById("a3").addEventListener("change",newtabon);
        document.getElementById("a4").addEventListener("change",refreshoff);
        document.getElementById("a5").addEventListener("change",hidemt);
        document.getElementById("a6").addEventListener("change",bigthumb);
        document.getElementById("a7").addEventListener("change",recautosave);
        document.getElementById("a8").addEventListener("change",recvp9);
        document.getElementById("a9").addEventListener("change",smallsnap);
        setsw();
    }

    function setsw(){
        if (localStorage.getItem("smallsnap")){
            document.getElementById("a9").value=1;
        }else{
            document.getElementById("a9").value=0;
        }
        if (localStorage.getItem("recvp9")){
            document.getElementById("a8").value=1;
        }else{
            document.getElementById("a8").value=0;
        }
        if (localStorage.getItem("recautosave")){
            document.getElementById("a7").value=0;
        }else{
            document.getElementById("a7").value=1;
        }
        if (localStorage.getItem("bigthumb")){
            document.getElementById("a6").value=1;
        }else{
            document.getElementById("a6").value=0;
        }
        if (localStorage.getItem("hidemt")){
            document.getElementById("a5").value=1;
        }else{
            document.getElementById("a5").value=0;
        }
        if (localStorage.getItem("refreshoff")){
            document.getElementById("a4").value=1;
        }else{
            document.getElementById("a4").value=0;
        }
        if (localStorage.getItem("newtabon")){
            document.getElementById("a3").value=0;
        }else{
            document.getElementById("a3").value=1;
        }
        if (localStorage.getItem("animationoff")){
            document.getElementById("a2").value=0;
        }else{
            document.getElementById("a2").value=1;
        }
        if (localStorage.getItem("zoomoff")){
            document.getElementById("a1").value=0;
        }else{
            document.getElementById("a1").value=1;
        }
        if (roomname!="discover"){
            document.body.classList.add("thumbpage");
            setclass();
        }
    }

    function setclass(){
        document.body.classList.remove("zoom");
        document.body.classList.remove("bigzoom");
        document.body.classList.remove("bigThumb");
        if(localStorage.getItem("bigthumb")){
            document.body.classList.add("bigThumb");
        }
        if(!localStorage.getItem("zoomoff")){
            if(pageType=="profile"){
                document.body.classList.add("zoom");
                return;
            }
            if(localStorage.getItem("bigthumb")){
                document.body.classList.add("bigzoom");
            }else{
                document.body.classList.add("zoom");
            }
        }
    }

    function smallsnap(){
        if (document.getElementById("a9").value==1){
            localStorage.setItem("smallsnap","foo");
        }else{
            localStorage.removeItem("smallsnap");
        }
    }
    function recvp9(){
        if (document.getElementById("a8").value==1){
            localStorage.setItem("recvp9","foo");
            mimeType=1;
        }else{
            localStorage.removeItem("recvp9");
            mimeType=1;
        }
    }
    function recautosave(){
        if (document.getElementById("a7").value==0){
            localStorage.setItem("recautosave","foo");
            savetime=200000;
        }else{
            localStorage.removeItem("recautosave");
            savetime=20;
        }
    }

    function bigthumb(){
        if (document.getElementById("a6").value==1){
             localStorage.setItem("bigthumb","foo");
        }else{
            localStorage.removeItem("bigthumb");
        }
        setclass();
    }
    function zoomoff(){
        if (document.getElementById("a1").value==0){
            localStorage.setItem("zoomoff","foo");
        }else{
            localStorage.removeItem("zoomoff");
        }
        setclass();
    }
    function hidemt(){
        if (document.getElementById("a5").value==1){
            localStorage.setItem("hidemt","foo");
        }else{
            localStorage.removeItem("hidemt");
        }
        hidemtenter();
    }
    function refreshoff(){
        if (document.getElementById("a4").value==1){
            localStorage.setItem("refreshoff","foo");
        }else{
            localStorage.removeItem("refreshoff");
        }
    }
    function newtabon(){
        if (document.getElementById("a3").value==0){
             localStorage.setItem("newtabon","foo");
        }else{
            localStorage.removeItem("newtabon");
        }
    }
    function anionoff(){
        if (document.getElementById("a2").value==0){
            localStorage.setItem("animationoff","foo");
        }else{
            localStorage.removeItem("animationoff");
        }
    }

    function savesetting(){
        document.getElementById("saved").removeEventListener("click", savesetting );
        var theme_name="lightmode";
        if (readCookie("theme_name")){
            theme_name=readCookie("theme_name");
        }
        var bigthumb=0;
        if (localStorage.getItem("bigthumb")){
            bigthumb=1;
        }
        var hidemt=0;
        if (localStorage.getItem("hidemt")){
            hidemt=1;
        }
        var newtabon=0;
        if (localStorage.getItem("newtabon")){
            newtabon=1;
        }
        var refreshoff=0;
        if (localStorage.getItem("refreshoff")){
            refreshoff=1;
        }
        var zoomoff=0;
        if (localStorage.getItem("zoomoff")){
            zoomoff=1;
        }
        var animationoff=0;
        if (localStorage.getItem("animationoff")){
            animationoff=1;
        }
        var cleanprof=0;
        if (localStorage.getItem("pclean")){
            cleanprof=1;
        }
        var recautosave=0;
        if (localStorage.getItem("recautosave")){
            recautosave=1;
        }
        var recvp9=0;
        if (localStorage.getItem("recvp9")){
            recvp9=1;
        }
        var smallsnap=0;
        if (localStorage.getItem("smallsnap")){
            smallsnap=1;
        }
        var isTheaterMode=localStorage.getItem("isTheaterMode");
        var defaultVideoWidth =localStorage.getItem("defaultVideoWidth");
        var videoControls =localStorage.getItem("videoControls");
        var hpfltopen=localStorage.getItem("hpfltopen");
        var allstring="good boy#refreshoff#"+refreshoff+
            "#bigthumb#"+bigthumb+
            "#hidemt#"+hidemt+
            "#newtabon#"+newtabon+
            "#zoomoff#"+zoomoff+
            "#animationoff#"+animationoff+
            "#cleanprof#"+cleanprof+
            "#recautosave#"+recautosave+
            "#recvp9#"+recvp9+
            "#smallsnap#"+smallsnap+
            "#isTheaterMode#"+isTheaterMode+
            "#defaultVideoWidth#"+defaultVideoWidth+
            "#videoControls#"+videoControls+
            "#theme_name#"+theme_name+
            "#hpfltopen#"+hpfltopen;
        var url=domain+"api/notes/for_user/"+stor+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "text", allstring );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            body: data
        }).then(function(){document.getElementById("saved").innerHTML="Settings saved";setTimeout(function(){document.getElementById("saved").innerHTML="Save all settings.";document.getElementById("saved").addEventListener("click", savesetting );},2000);});
    }

    function clearsettings(){
        document.getElementById("clear").removeEventListener("click", clearsettings );
        var url=domain+"api/notes/for_user/"+stor+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "text", "" );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            body: data
        }).then(function(){document.getElementById("clear").innerHTML="Saved settings removed.";setTimeout(function(){document.getElementById("clear").innerHTML="Clear all saved settings.";document.getElementById("clear").addEventListener("click", clearsettings );},2000);});
    }

    function getsaving(){
        if (!login){
            localStorage.removeItem("login");
            return;
        }else{
            if (localStorage.getItem("login")){
                return;
            }
        }
        clearReloadedLocalStorage();
        localStorage.setItem("login","foo");
        var url=domain+"api/notes/for_user/"+stor+"/";
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                    return;
                }
                response.json().then(function(data) {
                    if (data.text == null){return;}
                    restoresettings(data.text);
                });
            });
    }

    function restoresettings(data){
        var resave=false;
        if (data.indexOf("good boy")!=0){return;}
        if (data.indexOf("refreshoff#")!=-1){
            var refreshoff=data.split("refreshoff#")[1].split("#")[0];
            localStorage.setItem("refreshoff","foo");
            if (refreshoff==0){localStorage.removeItem("refreshoff");}
        }
        if (data.indexOf("newtabon#")!=-1){
            var newtabon=data.split("newtabon#")[1].split("#")[0];
            localStorage.setItem("newtabon","foo");
            if (newtabon==0){localStorage.removeItem("newtabon");}
        }
        if (data.indexOf("hidemt#")!=-1){
            var hidemt=data.split("hidemt#")[1].split("#")[0];
            localStorage.setItem("hidemt","foo");
            if (hidemt==0){localStorage.removeItem("hidemt");}
        }
        if (data.indexOf("bigthumb#")!=-1){
            var bigthumb=data.split("bigthumb#")[1].split("#")[0];
            localStorage.setItem("bigthumb","foo");
            if (bigthumb==0){localStorage.removeItem("bigthumb");}
        }
        if (data.indexOf("zoomoff#")!=-1){
            var zoomoff=data.split("zoomoff#")[1].split("#")[0];
            localStorage.setItem("zoomoff","foo");
            if (zoomoff==0){localStorage.removeItem("zoomoff");}
        }
        if (data.indexOf("animationoff#")!=-1){
            var animationoff=data.split("animationoff#")[1].split("#")[0];
            localStorage.setItem("animationoff","foo");
            if (animationoff==0){localStorage.removeItem("animationoff");}
        }
        if (supporter){
            localStorage.removeItem("animationoff");
        }
        if (data.indexOf("cleanprof#")!=-1){
            var cleanprof=data.split("cleanprof#")[1].split("#")[0];
            localStorage.setItem("pclean","foo");
            if (cleanprof==0){localStorage.removeItem("pclean");}
        }
        if (data.indexOf("recautosave#")!=-1){
            var recautosave=data.split("recautosave#")[1].split("#")[0];
            localStorage.setItem("recautosave","foo");
            if (recautosave==0){localStorage.removeItem("recautosave");}
        }
        if (data.indexOf("recvp9#")!=-1){
            var recvp9=data.split("recvp9#")[1].split("#")[0];
            localStorage.setItem("recvp9","foo");
            if (recvp9==0){localStorage.removeItem("recvp9");}
        }
        if (data.indexOf("smallsnap#")!=-1){
            var smallsnap=data.split("smallsnap#")[1].split("#")[0];
            localStorage.setItem("smallsnap","foo");
            if (smallsnap==0){localStorage.removeItem("smallsnap");}
        }
        if (data.indexOf("isTheaterMode#")!=-1){
            var isTheaterMode=data.split("isTheaterMode#")[1].split("#")[0];
            if (!jsontest(isTheaterMode)){resave=true;isTheaterMode='{"isTheaterMode":false}';}
            localStorage.setItem("isTheaterMode",isTheaterMode);
        }
        if (data.indexOf("defaultVideoWidth#")!=-1){
            var defaultVideoWidth=data.split("defaultVideoWidth#")[1].split("#")[0];
            if (!jsontest(defaultVideoWidth)){resave=true;defaultVideoWidth='{"videoWidth":893,"videoHeight":502.3125,"lastChosenVideoWidth":902,"lastChosenChatWidth":962}';}
            localStorage.setItem("defaultVideoWidth",defaultVideoWidth);
        }
        if (data.indexOf("videoControls#")!=-1){
            var videoControls=data.split("videoControls#")[1].split("#")[0];
            if (!jsontest(videoControls)){resave=true;videoControls='{"volume":60,"isMuted":false}';}
            localStorage.setItem("videoControls",videoControls);
        }
        var exp=new Date().getTime()+86400000;
        if (data.indexOf("hpfltopen#")!=-1){
            var hpfltopen=data.split("hpfltopen#")[1].split("#")[0];
            hpfltopen=hpfltopen.split('expiration":')[0]+'expiration":'+exp+'}';
            if (!jsontest(hpfltopen)){resave=true;hpfltopen='{"value":"true","expiration":2780331592470}';}
            localStorage.setItem("hpfltopen",hpfltopen);
        }
        if (data.indexOf("theme_name#")!=-1){
            var theme_name=data.split("theme_name#")[1].split("#")[0];
            createCookie("theme_name",theme_name);
        }
        var outtime=500;
        if (resave){
            outtime=1000;
            savesetting();
        }
        setTimeout(function(){document.location.reload();},outtime);
    }

    function jsontest(jsonstr){
        if (jsonstr==""){return false;}
        if (jsonstr==null){return false;}
        try {
            JSON.parse(jsonstr);
            return true;
        } catch(e) {
            return false;
        }
    }

    function dobiothings(){
        hidemtenter();
        if(pageType=="ppage"){
            if (currpage.split("model=").length==1){return;}
            roomname=currpage.split("model=")[1].split("&")[0];
            if (roomname==username){return;}
            rebuildbio();
        }else{
            afterrebuild();
        }
    }

    function afterrebuild(){
        if (login){
            if((pageType=="ppage")){
                document.querySelector('[data-testid="bio-header"]').innerHTML="<a href='"+domain+roomname+"?tab=bio' id=biotop>"+roomname.charAt(0).toUpperCase()+roomname.slice(1)+"'s Bio (Go to the cam page)</a>";
            }else{
                document.querySelector('[data-testid="bio-header"]').innerHTML="<a href='"+domain+"p/"+username+"?tab=bio&model="+roomname+"' id=biotop>"+roomname.charAt(0).toUpperCase()+roomname.slice(1)+"'s Bio and Free Webcam (Go to the bio)</a>";
            }
            document.getElementById("biotop").addEventListener("click", function(event){window.location.replace(this.href);event.stopPropagation();event.preventDefault();return false;});
        }

        makevidcontrol();
        cleaninit();
        linkfix();
        info(true);
        buildnotepop();
        if (document.getElementsByTagName("video").length>0){
            getvid();
            vreset();
            iagree();
        }
    }

    function unfollowoption(){
        if (document.getElementById("unfollowit")){return;}
        var newelem=document.createElement('a');
        newelem.style.display="none";
        newelem.id="unfollowit";
        newelem.href="#";
        newelem.className="HeaderNavBar__link";
        newelem.innerHTML='<div class="type--smpx type--medium textColor HeaderNavBar__link-text">UNFOLLOW THIS PAGE(AND ERASE NOTES)</div>';
        document.querySelector('[data-testid="header-nav-bar"]').appendChild(newelem);
        document.getElementById("unfollowit").addEventListener("click",unfollowthispage);
    }

    function iagree(){
        triggerMouseEvent (document.getElementsByClassName("inputDiv")[0], "mousedown");
        if (document.getElementsByClassName("acceptRulesButton").length>0){
            document.getElementsByClassName("acceptRulesButton")[0].click();
        }
        if (document.querySelector('[data-testid="dismissible-message-dismiss"]')){
            document.querySelector('[data-testid="dismissible-message-dismiss"]').click();
        }
    }

    function triggerMouseEvent (node, eventType) {
        var clickEvent = new Event(eventType, { bubbles: true, cancelable: true });
        node.dispatchEvent (clickEvent);
    }

    function setgenstyle(){
        var style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.textContent = ".userUpload img{display:none}"+
            ".lockOverlayBg {background-color:rgba(0, 0, 0, 0) !important;top:50% !important}"+
            ".lockOverlayBg img{display:none}"+
            ".userUpload div{background-color:rgba(0, 0, 0, 0) !important}"+
            ".previewBorder {display:block !important}"+
            ".previewText {color:black !important}"+
            ".photoVideoDetailSection img{filter: blur(0px) !important;height:auto !important;width:auto !important; margin-left: auto;margin-right: auto;display:block;min-width:50%;min-height:50%;max-width:100%;max-height:100%}"+
            ".BioContents{position:relative !important}"+
            ".bioContentText div{background-color:rgba(0, 0, 0, 0) !important}"+
            ".cbLogo {display:none !important}"+
            ".overlay {display:none !important;}"+
            ".subsel{background-color: #0c6a93 !important; color:#fff;outline:0px}"+
            ".profplayer{z-index:99;position:absolute;top:10px;right:10px;border:1px solid rgb(221, 221, 221);border-radius:4px;box-shadow:0px 0px 32px rgba(0, 0, 0, 0.32)}"+
            ".darkmode .profplayer{z-index:99;position:absolute;top:10px;right:10px;border:1px solid rgb(29, 29, 29);border-radius:4px;box-shadow:0px 0px 32px rgba(255, 255, 255, 0.22)}"+
            ".profdivplayer{z-index:99;position:absolute;top:10px;right:10px;overflow:hidden;resize:horizontal;direction:rtl;border:1px solid rgb(221, 221, 221);border-radius:4px;box-shadow:0px 0px 32px rgba(0, 0, 0, 0.32);background-color:rgba(0, 0, 0, 0.32)}"+
            ".darkmode .profdivplayer{z-index:99;position:absolute;top:10px;right:10px;overflow:hidden;resize:horizontal;direction:rtl;border:1px solid rgb(29, 29, 29);border-radius:4px;box-shadow:0px 0px 32px rgba(255, 255, 255, 0.22);background-color:rgba(255, 255, 255, 0.22)}"+
            ".darkmode .darkselect{background-color: #202c39 !important; color:#b3b3b3 !important; border-color:#2d3e50 !important}"+//<<
            ".tinput {background-color: #dde9f5 !important; color:#5e81a4 !important; border-color:#8bb3da !important}"+
            ".darkmode .tinput {background-color: #202c39 !important; color:#b3b3b3 !important; border-color:#2d3e50 !important}"+
            ".proftext {width: 350px; height: 45px; line-height: 14px; border-width: 1px; border-style: solid; border-color: #acacac; border-radius: 4px; padding: 7px 8px; overflow: auto;background-color: rgb(230, 230, 230);color:#000;min-width:200px;min-height:45px}"+
            ".darkmode .proftext{width: 350px; height: 45px; line-height: 14px; border-width: 1px; border-style: solid; border-color: #2d3e50; border-radius: 4px; padding: 7px 8px; overflow: auto;background-color: rgb(20,20,20);color:#fff;min-width:200px;min-height:45px}"+
            ".profbutton {border-width: 1px; border-style: solid; border-color: #acacac; border-radius: 4px;background-color: rgb(230, 230, 230);color:#000;cursor: pointer;}"+
            ".darkmode .profbutton {border-color: #dddddd; border-radius: 4px;background-color: rgb(20,20,20);color:#fff;}"+
            ".profbutton:hover:active {transform: scale(0.92)}"+
            ".cleanprof .profpos {display:none !important}"+
            ".cleanprof .profmar {margin-top:0px !important;}"+
            ".cleanprof .profcur{cursor:default !important }"+
            ".translated {background-color:#FFFFE0;color:red;margin-left:10px;padding:0px 5px 0px 5px;text-shadow:0px 0px !important}"+
            ".darkmode .translated {background-color:#000020;color:red;margin-left:10px;padding:0px 5px 0px 5px;text-shadow:0px 0px !important}"+
            ".popclass {background-color:rgb(255, 255, 211)}"+
            ".darkmode .popclass {background-color:rgb(30, 30, 10)}"+
            ".smallemo img.emoticonImage {max-height:22px !important;}"+
            ".bigThumb .RoomCardGrid{grid-template-columns:repeat(auto-fill, minmax(302px, 1fr)) !important}"+
            ".RoomCardGrid{grid-template-columns:repeat(auto-fill, minmax(174px, 1fr)) !important}"+
            ".RoomCardGrid {overflow:visible !important}"+
            ".roomCard {transition: .5s}"+
            ".roomCard:hover {border-color:red;z-index:50}"+
            ".RoomCard {transition: .5s}"+
            ".RoomCard:hover {border-color:red;z-index:20}"+
            ".thumbpage .content{overflow: visible; !important ;margin-right:12px !important;margin-left:12px !important}"+
            ".list{overflow: visible !important}"+
            ".MoreRooms{overflow: visible !important}"+
            ".zoom .roomCard:hover {transform: scale(1.37)}"+
            ".bigzoom .RoomCard:hover {transform: scale(1.23)}"+
            ".zoom .RoomCard:hover {transform: scale(1.37)}"+
            ".FollowedDropdown__section-title{visibility:hidden !important}"+
            ".FollowedDropdown__rooms:nth-of-type(2n+1){display:none !important}"+
            ".FollowRecommendedRoomlist{display:none !important}"+
            ".HomepageFallbackRoomlist{display:none !important}"+
            ".DesktopRoomlistRoot__separator{display:none !important}"+
            ".scriptset {position:absolute;width:390px;max-width:calc(100vw - 20px);max-height:calc(100vh - 100px);overflow-y:auto;box-sizing:border-box;padding:12px;top:80px;right:10px;z-index:9999;background-color:#fff;border:1px solid #efefef; border-radius:8px; box-shadow:0 0 8px 0 rgba(0,0,0,.2);}"+
            ".darkmode .scriptset {position:absolute;width:390px;max-width:calc(100vw - 20px);max-height:calc(100vh - 100px);overflow-y:auto;box-sizing:border-box;padding:12px;top:80px;right:10px;z-index:9999;background-color:#17202a;border:1px solid #2d3e50; border-radius:8px; box-shadow:0px 4px 16px rgba(0,0,0,.24);}"+
            ".scriptset > span{text-align: left; width: 310px;color: #fff; background-color: #0c6a93;padding: 4px 10px 3px;  position: relative;  border-radius: 10px; float: right;margin: 2px;}"+
            "#reloadedtoolspanel button{color:#fff !important;background:#0c6a93 !important;border:0 !important;border-radius:10px !important;font-family:inherit !important;font-size:inherit !important;text-shadow:none !important;}"+
            "#reloadedtoolspanel span:not([style*='display: none']):not([style*='display:none']){display:block !important;width:100% !important;max-width:100% !important;box-sizing:border-box !important;float:none !important;top:auto !important;right:auto !important;margin:4px 0 !important;padding:6px 10px !important;color:#fff !important;background:#0c6a93 !important;border:0 !important;border-radius:10px !important;font-family:inherit !important;font-size:inherit !important;text-shadow:none !important;}"+
            "#reloadedtoolspanel br{display:none !important;}"+
            "#reloadedtoolspanel input[type='range']{accent-color:#f47321;}"+
            ".HeaderUserProfileMenu {z-index:104}"+
            ".holdpage {position: fixed;  display: block; width: 100%; height: 100%; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0); z-index: 200; cursor: wait;}"+
            ".InChatMessage {display:none}"+
            ".roomPage .main-content-wrapper{padding-left: 10px;padding-right: 0px !important}";
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    function getnoteslist(){
        if(!login){usernoteslist="";addevent2();return;}
        var url=domain+"api/notes/usernames/";
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200){
                    return;
                }
                response.json().then(function(data) {
                    usernoteslist=data;
                }).then(addevent2());
            });
    }

    function addevent2(){
        document.getElementById("holdpage").style.display="block";
        currpage=document.location.href;
        roomname= currpage.split("/")[3];
        thumbobserver1.disconnect();
        setTimeout(addevent2a,500);
    }

    function addevent2a(){
        if (document.getElementById("unfollowit")){
            document.getElementById("unfollowit").style.display="none";
            if (document.location.href.split("/")[4]=="offline"){
                document.getElementById("unfollowit").style.display="block";
            }
        }
        hidemtenter();
        if (currpage!=document.location.href){
            notepopclose();
        }
        currpage=document.location.href;
        var genclass="";
        var tags=document.querySelectorAll('[data-testid="room-card"]');
        if (localStorage.getItem("ignoredusers")){
            banusers=localStorage.getItem("ignoredusers").split(",");
        }
        for (n=0; n<tags.length; n++){
            var thumbroomname=tags[n].querySelector('[data-testid="room-card-username"]').innerHTML;
            if (banusers.indexOf(thumbroomname)!=-1){
                tags[n].style.display="none";
            }
            if ((localStorage.getItem("hidemt"))&&(roomname!="followed-cams")){
                if(tags[n].querySelector('[data-testid="room-card-gender"]')){
                    genclass=tags[n].querySelector('[data-testid="room-card-gender"]').classList;
                    if ((genclass.contains("genderm"))||(genclass.contains("genders"))){
                         tags[n].style.display="none";
                    }
                }
            }
            if(!tags[n].name){
                tags[n].name="Camslut";
                if (!supporter){
                    tags[n].querySelector('[data-testid="room-card-image-anchor"]').addEventListener("mouseenter", moveimg);
                    tags[n].querySelector('[data-testid="room-card-image-anchor"]').addEventListener("mouseleave", moveimgstop);
                }
                if (login){
                    tags[n].querySelector('[data-testid="room-card-image-anchor"]').title="Visit "+thumbroomname+"'s chatroom.";
                    tags[n].querySelector('[data-testid="room-card-image-anchor"]').addEventListener("click", function(event){
                        if (localStorage.getItem("newtabon")){
                            return;
                        }
                        event.stopPropagation();
                        event.preventDefault();
                        openInNewTab(this.href,"_blank");
                    });

                    tags[n].getElementsByClassName("RoomCardDetails")[0].addEventListener("click", function(event){event.stopPropagation();});
                    tags[n].getElementsByClassName("RoomCardDetails")[0].style.cursor="default";
                    tags[n].querySelector('[data-testid="room-card-username"]').href=domain+"p/"+username+"/?tab=bio&model="+thumbroomname;
                    tags[n].querySelector('[data-testid="room-card-username"]').title="Visit "+thumbroomname+"'s bio.";

                    tags[n].querySelector('[data-testid="room-card-username"]').addEventListener("click", function(event){
                        event.stopPropagation();
                        event.preventDefault();
                        var target="_self";
                        if (!localStorage.getItem("newtabon")){
                            target="_blank";
                        }
                        openInNewTab(this.href, target);
                    });
                }else{
                    tags[n].addEventListener("click", function(event){
                        if (localStorage.getItem("newtabon")){
                            return;
                        }
                        event.stopPropagation();
                        event.preventDefault();
                        openInNewTab(this.querySelector('[data-testid="room-card-username"]').href,"_blank");
                    });
                }

                if (usernoteslist!=""){
                    var newelem=document.createElement('div');
                    if (usernoteslist.usernames.indexOf(thumbroomname)!=-1){
                        newelem.innerHTML=note;
                    }else{
                        newelem.innerHTML=nonote;
                    }
                    newelem.style.position="absolute";
                    newelem.style.top="0px";
                    newelem.style.left="0px";
                    newelem.addEventListener("click", function(event){event.stopPropagation();shownote(this.name,event.pageY,event.pageX);});
                    newelem.style.cursor="pointer";
                    newelem.setAttribute("name", thumbroomname);
                    newelem.name=thumbroomname;
                    newelem.title="User notes";
                    tags[n].appendChild(newelem);
                }
            }
        }
        document.getElementById("holdpage").style.display="none";
        showhidden();
    }

    function openInNewTab(href,target){
        var a=document.createElement('a');
        a.style.display = 'none';
        a.target=target;
        a.rel='noopener noreferrer';
        a.href=href;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function startthumbobserver(){
        var node=document.querySelector('[data-testid="room-list"]');
        if (node) thumbobserver1.observe(node,{subtree:true,childList:true});
    }

    function showhidden(){
        if (document.location.href.split("/")[3]=="spy-on-cams"){showhidden4();startthumbobserver();return;}
        if (document.location.href.split("/")[3]!="followed-cams"){startthumbobserver();return;}
        if (document.location.href.split("/")[4]=="offline"){startthumbobserver();return;}
        hidoffset=0;
        hiddenarray=[];
        showhidden2();
    }
    function showhidden2(){
        if (hprom){return;}
        hprom=true;
        var url=hidurl+hidoffset*90;
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                    hprom=false;
                    return;
                }
                response.json().then(function(data){
                    if (data.rooms != null){
                        var hiddenlist=data.rooms;
                        for (n=0; n<hiddenlist.length; n++){
                            hiddenarray.push(hiddenlist[n].username);
                        }
                        var pages=Math.ceil(data.total_count/90);
                        hidoffset++;
                        if (hidoffset!=pages){
                            hprom=false;
                            showhidden2();
                        }else{
                            hprom=false;
                            showhidden3();
                        }
                    }
                });
            });
    }
    function showhidden3(){
        var tags=document.querySelector('[data-testid="room-list-container"]').querySelectorAll('[data-testid="room-card"]');
        for (n=0; n<tags.length; n++){
            var oldtext=tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML;
            var name=tags[n].querySelector('[data-testid="room-card-username"]').innerHTML;
            var newtext=oldtext.replace(" HIDDEN","");
            newtext=newtext.replace("HIDDEN","");
            tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML=newtext;
            tags[n].querySelector('[data-testid="thumbnail-label"]').style.backgroundColor = "";

            if (hiddenarray.indexOf(name)!=-1){
                if (newtext != ""){
                    tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML=newtext+" HIDDEN";
                }else{
                    tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML="HIDDEN";
                }
                tags[n].querySelector('[data-testid="thumbnail-label"]').style.backgroundColor = "blue";
            }
        }
        startthumbobserver();
    }
    function showhidden4(){
        if (document.querySelector('[data-testid="hidden-cams-roomlist"]')){
            var tags=document.querySelector('[data-testid="hidden-cams-roomlist"]').querySelectorAll('[data-testid="room-card"]');
            for (n=0; n<tags.length; n++){
                var oldtext=tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML;
                var newtext=oldtext.replace(" HIDDEN","");
                newtext=newtext.replace("HIDDEN","");
                tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML=newtext;
                if (newtext != ""){
                    tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML=newtext+" HIDDEN";
                }else{
                    tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML="HIDDEN";
                }
                tags[n].querySelector('[data-testid="thumbnail-label"]').style.backgroundColor = "blue";
            }
        }
    }
    function shownote(name,pageY,pageX){
        if(document.getElementById("notepop").style.display=="block"){
            notepopclose();
            if (openthumbname==name){
                return;
            }
        }
        document.getElementById("notepop").style.height="170px";
        document.getElementById("notearea").value="";
        document.getElementById("notenote").innerHTML=notegrey + " Note";
        document.getElementById("notepopLink").style.color="grey";
        opennote="";
        openthumbname=name;
        document.getElementById("notearea").innerHTML="";
        document.getElementById("notepop").style.top=pageY+100+"px";
        document.getElementById("notepop").style.left=pageX+20+"px";
        document.getElementById("notepop").style.display="block";
        document.getElementById("notepopName").style.color="grey";
        document.getElementById("notepopName").innerHTML=openthumbname;
        setTimeout(function(){document.getElementById("main").addEventListener("click",notepopclose);},100);
        var url=domain+"api/notes/for_user/"+openthumbname+"/";
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                    document.getElementById("notearea").value="!! This room is banned !!";
                    return;
                }
                response.json().then(function(data){
                    if (data.text != null){
                        document.getElementById("notearea").value=data.text;
                        opennote=data.text;
                        if (usernoteslist.usernames.indexOf(openthumbname)==-1){
                            usernoteslist.usernames.push(openthumbname);
                            updatedm2();
                        }
                    }
                    getusercolor();
                });
            });
    }

    function getusercolor(){
        var url=domain+"api/messaging/profile/"+openthumbname+"/";
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                    return;
                }
                response.json().then(function(data){
                    if (data.can_pm){document.getElementById("notepopLink").style.color="green";}
                    var Bcolor="#939393";
                    if (data.sitewide_user.has_tokens){Bcolor="#69a";}
                    if (data.sitewide_user.tipped_recently){Bcolor="#1e5cfb";}
                    if (data.sitewide_user.tipped_alot_recently){Bcolor="#be6aff";}
                    if (data.sitewide_user.tipped_tons_recently){Bcolor="#804baa";}
                    document.getElementById("notepopName").style.color=Bcolor;
                });
            });
    }

    function buildnotepop(){
        var newelem=document.createElement('span');
        newelem.id="notepop";
        newelem.style.display="none";
        newelem.style.position="absolute";
        newelem.style.overflow="hidden";
        newelem.style.backgroundColor="rgb(255, 255, 255)";
        newelem.style.border="1px solid rgb(221, 221, 221)";
        newelem.style.borderRadius="4px";
        newelem.style.width="188px";
        newelem.style.height="170px";
        newelem.style.zIndex="999";
        newelem.style.boxShadow="0px 0px 32px rgba(0, 0, 0, 0.32)";
        document.getElementById("footer-holder").appendChild(newelem);
        newelem=document.createElement('div');
        newelem.style.backgroundColor = "#dddddd";
        newelem.style.fontWeight="bold";
        newelem.style.height="15px";
        newelem.style.fontSize="15px";
        newelem.style.padding="8px";
        newelem.style.textAlign="left";
        newelem.innerHTML='<span id="notepopName" style="text-Overflow: ellipsis; overflow:hidden; width:150px; height:20px; display:inline-block;cursor:pointer " ></span><span><img src="https://web.static.mmcdn.com/tsdefaultassets/close-gray.svg" style="position: absolute; height: 13px; width: 13px; right: 8px;" title="Close" id="noteclose"></span>';
        document.getElementById("notepop").appendChild(newelem);
        document.getElementById("notepopName").addEventListener("click", function(){var target="_self";if (!localStorage.getItem("newtabon")){target="_blank";}window.open(domain+"p/"+username+"/?tab=bio&model="+openthumbname, target);});
        document.getElementById("noteclose").addEventListener("click", notepopclose);
        newelem=document.createElement('div');
        newelem.style.backgroundColor = "white";
        newelem.style.border="1px solid rgb(221, 221, 221)";
        newelem.style.height="15px";
        newelem.style.fontSize="12px";
        newelem.style.padding="8px";
        newelem.style.textAlign="left";
        newelem.style.cursor="pointer";
        newelem.addEventListener("click", function(){opendm2(openthumbname);});
        newelem.id="notepopLink";
        newelem.innerHTML='<img src="https://web.static.mmcdn.com/tsdefaultassets/popout-grey-d.svg" height="12px" width="12px"><b> Open DM in new window</b>';
        document.getElementById("notepop").appendChild(newelem);
        newelem=document.createElement('div');
        newelem.style.backgroundColor = "white";
        newelem.style.color="grey";
        newelem.style.height="10px";
        newelem.style.fontSize="12px";
        newelem.style.padding="8px";
        newelem.style.textAlign="left";
        newelem.id="notenote";
        newelem.innerHTML=notegrey + " Note";
        document.getElementById("notepop").appendChild(newelem);
        newelem=document.createElement('textarea');
        newelem.id="notearea";
        newelem.style.height="60px";
        newelem.style.fontSize="12px";
        newelem.style.border="1px solid rgb(172, 172, 172)";
        newelem.style.borderRadius="4px";
        newelem.style.backgroundColor="rgb(255, 255, 255)";
        newelem.style.resize="none";
        newelem.style.padding="5px";
        newelem.style.width="85%";
        newelem.setAttribute("placeholder", "Enter notes about this user (only seen by you)");
        newelem.setAttribute("spellcheck", false);
        newelem.addEventListener("input",openbutton);
        newelem.id="notearea";
        document.getElementById("notepop").appendChild(newelem);
        newelem=document.createElement('div');
        newelem.id="notecancelsubmit";
        document.getElementById("notepop").appendChild(newelem);
        newelem=document.createElement("span");
        newelem.style.position="relative";
        newelem.style.top="12px";
        newelem.style.left="-15px";
        newelem.addEventListener("click",closebutton);
        newelem.innerHTML='<a href="#" >Cancel</a>';
        document.getElementById("notecancelsubmit").appendChild(newelem);
        var subbutstyle="color: rgb(255, 255, 255); background: rgba(0, 0, 0, 0) linear-gradient(rgb(255, 151, 53) 0%, rgb(255, 158, 54) 50%, rgb(255, 112, 2) 60%) repeat scroll 0% 0%; font-family: UbuntuMedium, Helvetica, Arial, sans-serif; font-size: 12px; padding: 4px 10px 5px; position: relative; right: 40px; top:10px; float: right; border-radius: 4px; cursor: pointer;";
        newelem=document.createElement("span");
        newelem.setAttribute("style", subbutstyle);
        newelem.addEventListener("click",savenote);
        newelem.innerHTML="Save";
        document.getElementById("notecancelsubmit").appendChild(newelem);
    }

    function savenote(){
        var notetext=document.getElementById("notearea").value;
        var url=domain+"api/notes/for_user/"+openthumbname+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "text", notetext );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            body: data
        }).then(aftersave);
    }

    function aftersave(){
        var notetext=document.getElementById("notearea").value;
        var doupdate=false;
        if ((opennote=="")||(notetext=="")){
            doupdate=true;
        }
        opennote=notetext;
        closebutton();
        if (doupdate){updatedm();}
    }

    function notepopclose(){
        document.getElementById("main").removeEventListener("click",notepopclose);
        document.getElementById("notepop").style.display="none";
    }

    function openbutton(){
        document.getElementById("notepop").style.height="215px";
        document.getElementById("notenote").innerHTML=notegrey + " Note (unsaved)";
        document.getElementById("notearea").value=document.getElementById("notearea").value.replace("$"," "+new Date().toLocaleDateString()+" ");
        if(opennote==document.getElementById("notearea").value){
            closebutton();
        }
    }
    function closebutton(){
        document.getElementById("notenote").innerHTML=notegrey + " Note";
        document.getElementById("notepop").style.height="170px";
        document.getElementById("notearea").value=opennote;
    }

    function opendm2(that){
        var dmurl="messages/";
        if (document.getElementById("dmListIconRoot")){dmurl="dm/";}
        var url=domain+dmurl+that;
        var dmwindow=window.open(url,that,'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=1000,height=800');
        dmwindow.onload = function(){
            this.addEventListener('unload', function(){setTimeout(function(){updatedm();},1000);});
        };
    }

    function updatedm(){
        var url=domain+"api/notes/usernames/";
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200){
                    return;
                }
                response.json().then(function(data) {
                    usernoteslist=data;
                }).then(updatedm2);
            });
    }

    function updatedm2(){
        var tags=document.querySelectorAll('[title="User notes"]');
        for (n=0; n<tags.length; n++){
             if (usernoteslist.usernames.indexOf(tags[n].getAttribute("name"))!=-1){
                 tags[n].innerHTML=note;
             }else{
                 tags[n].innerHTML=nonote;
             }
         }
    }

    function moveimg(){
        if(localStorage.getItem("animationoff")){return;}
        thisfap=this;
        if (thisfap.getElementsByClassName("thumbnail_label_offline").length!=0){return;}
        fapbr=thisfap.getElementsByTagName("img")[0].src.split("/")[4].split("?")[0];
        cimg.addEventListener("load",regetimg);
        lt2=new Date().getTime();
        cimg.src = "https://jpeg.live.mmcdn.com/minifwap/"+fapbr+"?f="+lt2;
    }

    function moveimgstop(){
        cimg.removeEventListener("load",regetimg);
    }

    function regetimg(){
        var lt=new Date().getTime()-lt2;
        if (lt>180){lt=180;}
        thisfap.getElementsByTagName("img")[0].src=cimg.src;
        setTimeout(function(){lt2=new Date().getTime();cimg.src = "https://jpeg.live.mmcdn.com/minifwap/"+fapbr+"?f="+lt2;}, 200-lt);
    }

    function refresher(){
        document.addEventListener("visibilitychange", function(){
            if (document.hidden){return;}
            if (document.location.href.split("/")[3]=="followed-cams"){
                if (localStorage.getItem("refreshoff")){
                    openInNewTab(document.location.href, "_self");
                }
            }
            setsw();
        });
    }

    function subsel(){
        if (document.getElementById("subselection")){document.getElementById("subselection").remove();}
        if (pageType!="thumbs"){return;}
        if (document.location.search.indexOf("keywords")!=-1){return;}
        if((document.location.href.indexOf("spy-on-cams")==-1)&&(document.location.href.indexOf("followed-cams")==-1)&&(document.location.href.indexOf("/current_app_use/")==-1)){
            var newelem=document.createElement('button');
            newelem.className="ButtonColor-blue GenderNav__button active";
            newelem.style.height="34px";
            newelem.id="subselection";
            var data='<form><select class="subsel Button active" id="subsel" style="margin: -3px 0px 0px 0px;border:0px";background-color:#0c6a93;color:#ffffff outline:0px;>'+
                '<option value="/XX-cams">All cams in category</option>'+
                '<option value="/exhibitionist-cams/XX">Exhibitionist cams</option>'+
                '<option value="/gaming-cams/XX">Gaming cams</option>'+
                '<option value="/new-cams/XX">New Cams</option>'+
                '<option value="/teen-cams/XX">Teen cams (18+)</option>'+
                '<option value="/18to21-cams/XX">18 to 21 cams</option>'+
                '<option value="/21to35-cams/XX">21 to 35 cams</option>'+
                '<option value="/30to50-cams/XX">30 to 50 cams</option>'+
                '<option value="/mature-cams/XX">Mature cams (50+)</option>'+
                '<option value="/north-american-cams/XX">North American cams</option>'+
                '<option value="/euro-russian-cams/XX">Euro Russian cams</option>'+
                '<option value="/south-american-cams/XX">South American cams</option>'+
                '<option value="/asian-cams/XX">Asian cams</option>'+
                '<option value="/other-region-cams/XX">Other region cams</option>'+
                '<option value="/6-tokens-per-minute-private-cams/XX">6 Tokens per minute</option>'+
                '<option value="/12-18-tokens-per-minute-private-cams/XX">12 - 18 Tokens per minute</option>'+
                '<option value="/30-42-tokens-per-minute-private-cams/XX">30 - 42 Tokens per minute</option>'+
                '<option value="/60-72-tokens-per-minute-private-cams/XX">60 - 72 Tokens per minute</option>'+
                '<option value="/90-tokens-per-minute-private-cams/XX">90+ Tokens per minute</option>'+
                '</select></form>';
            var	uloc=document.location.href+"//";
            var loc=uloc.split("/");
            var	check=loc[3]+loc[4];
            var gen="";
            if(check.indexOf("male") != -1){gen="male";}
            if(check.indexOf("female") != -1){gen="female";}
            if(check.indexOf("couple") != -1){gen="couple";}
            if(check.indexOf("trans") != -1){gen="trans";}
            data=data.replace(/XX/gi,gen);
            if (gen === ""){data=data.replace("-cams","");}
            data=data.replace('<option value="/'+loc[3],'<option selected value="/'+loc[3]);
            newelem.innerHTML=data;
            document.querySelector('[data-testid="gender-nav-scrollable-container"]').appendChild(newelem);
            document.getElementById("subsel").addEventListener('change',subselected);
        }
    }

    function subselected(){
        document.location.href=document.getElementById("subsel").options[document.getElementById("subsel").selectedIndex].value;
    }

    function tabpm(){
        if (document.visibilityState=="visible"){return;}
        if (tabblink==true){return;}
        tabblink=true;
        tabblinker();
    }

    function tabblinker(){
        if (document.title == "PM !! PM"){
            document.title = "!! PM !!";
        }else{
            document.title = "PM !! PM";
        }
        if (document.visibilityState!="visible"){
            setTimeout(tabblinker,500);
        }else{
            document.title=ctitle;
            tabblink=false;
        }
    }

    function activateReloadedToolsTab(tabName){
        var toolsPanel=document.getElementById("reloadedtoolspanel");
        if (!toolsPanel){return;}
        if (recording&&(toolsPanel.dataset.activeTab=="video")&&(tabName!="video")){return;}
        var tabNames=["info","clean","chat","video"];
        var requestedTab=document.getElementById("reloaded-tab-"+tabName);
        if ((!requestedTab)||(requestedTab.style.display=="none")){tabName="info";}
        toolsPanel.dataset.activeTab=tabName;
        for (var tabIndex=0;tabIndex<tabNames.length;tabIndex++){
            var currentName=tabNames[tabIndex];
            var currentTab=document.getElementById("reloaded-tab-"+currentName);
            var currentPane=document.getElementById("reloaded-pane-"+currentName);
            var isActive=currentName==tabName;
            if (currentPane){currentPane.style.display=isActive?"block":"none";}
            if (currentTab){
                currentTab.setAttribute("aria-selected",isActive?"true":"false");
                currentTab.style.background="#0c6a93";
                currentTab.style.boxShadow=isActive?"inset 0 0 0 2px rgba(255,255,255,.9)":"none";
                currentTab.style.opacity=isActive?"1":".78";
            }
        }
        var videoControls=document.getElementById("controls");
        if (videoControls){videoControls.style.display=tabName=="video"?"block":"none";}
        var chatControls=document.getElementById("chatcontrols");
        if (chatControls){chatControls.style.display=tabName=="chat"?"block":"none";}
        if (tabName=="video"){setres();}
    }

    function setReloadedToolsMenuState(expanded,cursor){
        var toolsButton=document.getElementById("reloadedtoolsbutton");
        if (!toolsButton){return;}
        if (typeof expanded=="boolean"){
            toolsButton.setAttribute("aria-expanded",expanded?"true":"false");
        }
        if (cursor){toolsButton.style.cursor=cursor;}
    }

    function toggleReloadedTools(event){
        if (event){event.stopPropagation();}
        var toolsPanel=document.getElementById("reloadedtoolspanel");
        if (!toolsPanel){return;}
        if (toolsPanel.style.display=="block"){
            if (recording){return;}
            toolsPanel.style.display="none";
            setReloadedToolsMenuState(false);
            return;
        }
        toolsPanel.style.display="block";
        setReloadedToolsMenuState(true);
        activateReloadedToolsTab(toolsPanel.dataset.activeTab||"info");
    }

    function toggleReloadedToolsFromMenu(event){
        if (event){event.stopPropagation();}
        toggleReloadedTools(event);
    }

    function setReloadedToolsTabAvailable(tabName,available){
        var toolTab=document.getElementById("reloaded-tab-"+tabName);
        if (!toolTab){return;}
        toolTab.style.display=available?"block":"none";
        var toolsPanel=document.getElementById("reloadedtoolspanel");
        if ((!available)&&toolsPanel&&(toolsPanel.dataset.activeTab==tabName)){
            activateReloadedToolsTab("info");
        }
    }

    function makevidcontrol(){
        var butstyle="margin-right: 5px;color: rgb(255, 255, 255); background-color:#F47321; font-family: UbuntuMedium, Helvetica, Arial, sans-serif; font-size: 12px; padding: 4px 10px 3px; position: relative;right: 1px;top:-4px; float: right; border-radius: 4px; cursor: pointer; display: inline;";
        var slistyle="text-align: left; width: 310px;margin-right: 4px;color: rgb(255, 255, 255); background: rgba(0, 0, 0, 0) linear-gradient(rgb(255, 151, 53) 0%, rgb(255, 158, 54) 50%, rgb(255, 112, 2) 60%) repeat scroll 0% 0%; font-family: UbuntuMedium, Helvetica, Arial, sans-serif; font-size: 12px; text-shadow: rgb(241, 129, 18) 1px 1px 0px; padding: 4px 10px 3px; position: relative; top: 0px; right: 1px; float: right; border-radius: 4px; display: inline;";
        var cbutstyle="margin-right: 5px;color: rgb(255, 255, 255); background: rgba(0, 0, 0, 0) linear-gradient(rgb(255, 151, 53) 0%, rgb(255, 158, 54) 50%, rgb(255, 112, 2) 60%) repeat scroll 0% 0%; font-family: UbuntuMedium, Helvetica, Arial, sans-serif; font-size: 12px; text-shadow: rgb(241, 129, 18) 1px 1px 0px; padding: 4px 10px 3px; position: relative;right: 1px; float: right; border-radius: 4px; cursor: pointer; display: inline;";
        var place2=document.querySelector('[data-paction="BroadcasterFeedback"]');
        if(pageType=="ppage"){
            place2=document.getElementsByClassName("tabBar")[0];
        }
        if (pageType=="noaccess"){
            place2=document.getElementsByClassName("top-section")[0];
        }
        if (place2&&window.getComputedStyle(place2).position=="static"){place2.style.position="relative";}
        var newelem="";
        if(pageType=="ppage"){
            newelem=document.createElement('span');
            newelem.setAttribute("style", butstyle);
            newelem.innerHTML="FOLLOW";
            newelem.setAttribute("title", "Follow the bitch.");
            newelem.addEventListener("click", followbut);
            newelem.id="followbut";
            newelem.style.display="none";
            place2.appendChild(newelem);

            newelem=document.createElement('span');
            newelem.setAttribute("style", butstyle);
            newelem.innerHTML="UNFOLLOW";
            newelem.setAttribute("title", "Dump her.");
            newelem.addEventListener("click", unfollowbut);
            newelem.style.backgroundColor="#8b8b8b";
            newelem.id="unfollowbut";
            newelem.style.display="none";
            place2.appendChild(newelem);

            newelem=document.createElement('span');
            newelem.setAttribute("style", butstyle);
            newelem.innerHTML="JOIN FAN CLUB";
            newelem.addEventListener("click", function(){
                var fcwindow= window.open(domain+"fanclub/join/"+roomname+"/?source=SupporterSourceJoinFanClubButton","");
                fcwindow.onload = function(){
                    fcwindow.addEventListener('unload', function(){setTimeout(function(){
                        document.getElementById("fanclubbut").style.display="none";
                        document.getElementById("fanclubmembut").style.display="none";
                        newinfo();},1000);});
                };
            });
            newelem.style.backgroundColor="#009900";
            newelem.id="fanclubbut";
            newelem.style.display="none";
            place2.appendChild(newelem);
            newelem=document.createElement('span');
            newelem.setAttribute("style", butstyle);
            newelem.innerHTML="MEMBER";
            newelem.addEventListener("click", function(){window.open(domain+"fanclub/join/"+roomname+"/?source=SupporterSourceJoinFanClubButton","");});
            newelem.style.backgroundColor="#009900";
            newelem.id="fanclubmembut";
            newelem.style.display="none";
            place2.appendChild(newelem);
        }
        var toolsPanel=document.createElement('div');
        toolsPanel.id="reloadedtoolspanel";
        toolsPanel.style.display="none";
        toolsPanel.style.position="relative";
        toolsPanel.style.border="0";
        toolsPanel.style.borderRadius="0";
        toolsPanel.style.width="100%";
        toolsPanel.style.maxWidth="100%";
        toolsPanel.style.maxHeight="none";
        toolsPanel.style.overflow="visible";
        toolsPanel.style.boxSizing="border-box";
        toolsPanel.style.padding="4px 0";
        toolsPanel.style.margin="4px 0 6px";
        toolsPanel.style.top="auto";
        toolsPanel.style.right="auto";
        toolsPanel.style.zIndex="1";
        toolsPanel.style.background="transparent";
        toolsPanel.setAttribute("class","popclass");
        toolsPanel.addEventListener("click",function(event){event.stopPropagation();});
        var toolsMount=document.getElementById("reloadedtoolsmount");
        if (!toolsMount){
            toolsMount=document.createElement('div');
            toolsMount.id="reloadedtoolsmount";
            toolsMount.style.clear="both";
            toolsMount.style.width="100%";
            var toolsMenuButton=document.getElementById("reloadedtoolsbutton");
            if (toolsMenuButton&&toolsMenuButton.parentNode){
                toolsMenuButton.parentNode.insertBefore(toolsMount,toolsMenuButton.nextSibling);
            }else{
                var scriptMenu=document.getElementById("scriptcontrols");
                if (scriptMenu){scriptMenu.appendChild(toolsMount);}
            }
        }
        if (!toolsMount.parentNode){return;}
        toolsMount.appendChild(toolsPanel);

        var toolsTabs=document.createElement('div');
        toolsTabs.style.display="flex";
        toolsTabs.style.gap="5px";
        toolsTabs.style.alignItems="center";
        toolsTabs.style.marginBottom="10px";
        toolsTabs.setAttribute("role","tablist");
        toolsPanel.appendChild(toolsTabs);
        var toolTabNames=[["info","Info"],["clean","Clean"],["chat","Chat"],["video","Video"]];
        for (var toolTabIndex=0;toolTabIndex<toolTabNames.length;toolTabIndex++){
            var toolTab=document.createElement('button');
            toolTab.type="button";
            toolTab.id="reloaded-tab-"+toolTabNames[toolTabIndex][0];
            toolTab.dataset.tab=toolTabNames[toolTabIndex][0];
            toolTab.innerHTML=toolTabNames[toolTabIndex][1];
            toolTab.setAttribute("role","tab");
            toolTab.setAttribute("aria-controls","reloaded-pane-"+toolTabNames[toolTabIndex][0]);
            toolTab.style.flex="1";
            toolTab.style.border="0";
            toolTab.style.borderRadius="10px";
            toolTab.style.padding="6px 8px";
            toolTab.style.cursor="pointer";
            toolTab.style.fontWeight="700";
            toolTab.style.color="#fff";
            toolTab.style.background="#0c6a93";
            if ((toolTabNames[toolTabIndex][0]=="chat")||(toolTabNames[toolTabIndex][0]=="video")){toolTab.style.display="none";}
            toolTab.addEventListener("click",function(event){event.stopPropagation();activateReloadedToolsTab(this.dataset.tab);});
            toolsTabs.appendChild(toolTab);
        }
        var closeToolsTab=document.createElement('button');
        closeToolsTab.type="button";
        closeToolsTab.innerHTML="&times;";
        closeToolsTab.title="Close Reloaded tools";
        closeToolsTab.style.border="0";
        closeToolsTab.style.background="#0c6a93";
        closeToolsTab.style.borderRadius="10px";
        closeToolsTab.style.color="inherit";
        closeToolsTab.style.fontSize="20px";
        closeToolsTab.style.cursor="pointer";
        closeToolsTab.addEventListener("click",toggleReloadedTools);
        toolsTabs.appendChild(closeToolsTab);

        var toolPaneNames=["info","clean","chat","video"];
        for (var toolPaneIndex=0;toolPaneIndex<toolPaneNames.length;toolPaneIndex++){
            var toolPane=document.createElement('div');
            toolPane.id="reloaded-pane-"+toolPaneNames[toolPaneIndex];
            toolPane.style.display="none";
            toolPane.style.minHeight="44px";
            toolPane.setAttribute("role","tabpanel");
            toolPane.setAttribute("aria-labelledby","reloaded-tab-"+toolPaneNames[toolPaneIndex]);
            toolsPanel.appendChild(toolPane);
        }

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="RELOAD ROOM INFO";
        newelem.addEventListener("click", newinfo);
        if (pageType=="noaccess"){newelem.style.display="none";}
        newelem.id="infore";
        document.getElementById("reloaded-pane-info").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="CLEAN PROFILE = ON";
        newelem.style.display="none";
        newelem.id="clean";
        newelem.addEventListener("click", cleancookie);
        document.getElementById("reloaded-pane-clean").appendChild(newelem);
        newelem=document.createElement('div');
        newelem.id="controls";
        newelem.style.display="block";
        newelem.style.position="relative";
        newelem.style.border="0";
        newelem.style.width="100%";
        newelem.style.padding="0";
        newelem.style.top="auto";
        newelem.style.right="auto";
        newelem.style.zIndex="1";
        document.getElementById("reloaded-pane-video").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="RESET ALL";
        newelem.addEventListener("click",vreset);
        document.getElementById("controls").appendChild(newelem);


        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="MIRROR";
        newelem.addEventListener("click",mirror);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="INVERT";
        newelem.addEventListener("click",invert);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="DRAG";
        newelem.style.cursor="move";
        newelem.addEventListener("mousedown",dragMouseDown);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);
        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.innerHTML="BRIGHTNESS : <input type='range' id='myRange' min=50 max=250 value=100 style='width: 200px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("controls").appendChild(newelem);
        document.getElementById("myRange").addEventListener("input",badjust);

        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);
        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.innerHTML="CONTRAST : <input type='range' id='myRange1' min=25 max=225 value=100 style='width: 200px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("controls").appendChild(newelem);
        document.getElementById("myRange1").addEventListener("input",cadjust);

        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);
        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.innerHTML="SATURATION : <input type='range' id='myRange2' min=0 max=200 value=100 style='width: 200px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("controls").appendChild(newelem);
        document.getElementById("myRange2").addEventListener("input",sadjust);

        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);
        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.innerHTML="HUE : <input type='range' id='myRange3' min=180 max=540 value=360 style='width: 200px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("controls").appendChild(newelem);
        document.getElementById("myRange3").addEventListener("input",hadjust);

        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);
        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="SNAPSHOT";
        newelem.id="snapbut";
        newelem.addEventListener("click",snapshot);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="STOP RECORDING";
        newelem.id="stopbut";
        newelem.addEventListener("click",recstop);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="RECORD";
        newelem.id="recbut";
        newelem.addEventListener("click",recstart);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);
        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="HIDE CONTROL PANEL";
        newelem.id="vcontr2";
        newelem.addEventListener("click",vcontrol);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.id="rectime";
        newelem.style.display="none";
        newelem.style.cursor="default";
        newelem.innerHTML="REC(1): 00:00:00";
        document.getElementById("controls").appendChild(newelem);
        activateReloadedToolsTab("info");
        if ((pageType=="noaccess")||(pageType=="ppage")){return;}

        newelem=document.createElement('div');
        newelem.id="chatcontrols";
        newelem.style.display="none";
        newelem.style.position="relative";
        newelem.style.border="0";
        newelem.style.width="100%";
        newelem.style.padding="0";
        newelem.style.top="auto";
        newelem.style.right="auto";
        newelem.style.zIndex="1";
        newelem.style.overflow="auto";
        document.getElementById("reloaded-pane-chat").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Small emoticons : <input type='range' id='c1' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Notice : <input type='range' id='c2' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Subject change : <input type='range' id='c3' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Mod/fan enter-leave : <input type='range' id='c4' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        if (document.location.href.split(".").length>2){newelem.style.display="none";}
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Grey user chat : <input type='range' id='c5' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Moderator chat : <input type='range' id='c6' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Lovense messages : <input type='range' id='c8' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Tips smaller than : <input class='tinput' type='number' id='c7a' min='2' max='1000' value='100' style='width: 4em;height:11px;cursor: pointer; '> tokens.<input type='range' id='c7' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Translate chat to: <select id='language' class='darkselect'></select><input type='range' id='c10' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Tokens received : <span id='tclear' style='cursor:pointer'>  (Clear)</span><span id='c9' style='width: 40px;height:11px;float: right; color:black'>0</span>";
        document.getElementById("chatcontrols").appendChild(newelem);
        tr2=tr2.replace("www.chaturbate","translate.googleapis")+"single?client=gtx&sl=auto&tl=";
        var languages=["Afrikaans","Albanian","Arabic","Armenian","Azerbaijani","Balinese","Basque","Belarusian","Bengali","Bosnian","Bulgarian","Cantonese","Catalan","Chinese","Corsican","Croatian","Czech","Danish","Dutch","English","Estonian","Filipino","Finnish","French","Georgian","German","Greek","Hebrew","Hindi","Hungarian","Icelandic","Indonesian","Irish","Italian","Japanese","Javanese","Kazakh","Korean","Latvian","Limburgan","Lithuanian","Luxembourgish","Macedonian","Maltese","Mongolian","Myanmar","Norwegian","Papiamento","Persian","Polish","Portuguese","Punjabi","Romanian","Russian","Sanskrit","Serbian","Sicilian","Slovak","Slovenian","Somali","Spanish","Sundanese","Swahili","Swedish","Tamil","Thai","Turkish","Ukrainian","Urdu","Uzbek","Vietnamese","Yiddish"];
        var langcode=["af","sq","ar","hy","az","ban","eu","be","bn","bs","bg","yue","ca","zh","co","hr","cs","da","nl","en","et","fil","fi","fr","ka","de","el","he","hi","hu","is","id","ga","it","ja","jv","kk","ko","lv","li","lt","lb","mk","mt","mn","my","no","pap","fa","pl","pt","pa","ro","ru","sa","sr","scn","sk","sl","so","es","su","sw","sv","ta","th","tr","uk","ur","uz","vi","yi"];
        for(i=0;i < languages.length;i++) {
            var option=document.createElement('option');
            option.textContent=languages[i];
            option.value=langcode[i];
            document.getElementById("language").appendChild(option);
        }
    }

    function followbut(){
        var url=domain+"follow/follow/"+roomname+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "location", "FollowButton" );
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+roomname+"/",
            body: data
        }).then(function(){
        document.getElementById("followbut").style.display="none";
        document.getElementById("unfollowbut").style.display="block";
        });
    }

    function unfollowbut(){
        var url=domain+"follow/unfollow/"+roomname+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "location", "FollowButton" );
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+roomname+"/",
            body: data
        }).then(function(){
        document.getElementById("unfollowbut").style.display="none";
        document.getElementById("followbut").style.display="block";
        });
    }

    function snapshot(){
        document.getElementById("snapbut").removeEventListener("click",snapshot);
        document.getElementById("snapbut").style.color="red";
        var video = document.getElementsByTagName('video')[0];
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        var imgqual="0.95";
        var fontsize=12;
        if (video.videoWidth < video.videoHeight){
            fontsize=6;
        }
        if (localStorage.getItem("smallsnap")){
            imgqual="0.75";
            if (video.videoWidth > video.videoHeight){
                canvas.height = 480;
                canvas.width=parseInt(video.videoWidth*480/video.videoHeight);
            }else{
                canvas.width = 480;
                canvas.height = parseInt(video.videoHeight*480/video.videoWidth);

            }
        }
        ctx.font=fontsize*canvas.height/480+"px Georgia";
        ctx.drawImage(video, 0, 0,video.videoWidth,video.videoHeight,0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white";
        ctx.fillText(roomname+"@chaturbate. Made with chaturbate reloaded userscript by Ladroop.",10,canvas.height-10);
        var starttime=new Date().toISOString().split(".")[0]+"GMT";
        starttime=starttime.replaceAll(":","-");
        var snapname=roomname+"-"+starttime+".jpg";
        canvas.toBlob(function(blob) {
                GM_download({
                    url: blob,
                    name: snapname,
                    onload: imgdlready
                });
        }, 'image/jpeg', imgqual);
    }

    function imgdlready(){
        document.getElementById("snapbut").style.color="white";
        document.getElementById("snapbut").addEventListener("click",snapshot);
    }

    function getvid(){
        vareaid=document.getElementsByTagName("video")[0].id;
        observer3.observe(document.getElementsByTagName("video")[0].parentNode, observerConfig3);
    }

    function varea(){
        if((pageType=="ppage")||(pageType=="noaccess")){
            var video=document.getElementsByTagName("video")[0];
            video.style.filter=vfilter;
            video.style.transform=vmirror;
            return video;
        }
        var vnode=document.getElementById(vareaid);
        if(!vnode){
            vnode=document.getElementById("chat-player");
            if(!vnode){
                return;
            }
        }
        vnode.style.filter=vfilter;
		vnode.style.transform=vmirror;
        if (document.querySelector('[data-testid="video-container"]')&&vnode.src){
            document.querySelector('[data-testid="video-container"]').style.background="rgb(51, 51, 51)";
        }
        setReloadedToolsTabAvailable("video",true);
            if (!vnode.src){
            if (recording){
                recstop();
                setTimeout(function(){document.getElementById("controls").style.display="none";},5000);
            }else{
                document.getElementById("controls").style.display="none";
            }
        }
        return vnode;
    }

	function badjust(){
		br=document.getElementById("myRange").value;
		ofils=varea().style.filter.split(" ");
        vfilter="brightness("+br+"%) "+ofils[1]+" "+ofils[2]+" "+ofils[3]+" "+ofils[4];
        varea();
	}

	function cadjust(){
		br=document.getElementById("myRange1").value;
		ofils=varea().style.filter.split(" ");
        vfilter=ofils[0]+" contrast("+br+"%) "+ofils[2]+" "+ofils[3]+" "+ofils[4];
		varea();
    }

	function sadjust(){
		br=document.getElementById("myRange2").value;
		ofils=varea().style.filter.split(" ");
		vfilter=ofils[0]+" "+ofils[1]+" "+ofils[2]+" saturate("+br+"%) "+ofils[4];
        varea();
	}

	function hadjust(){
		br=document.getElementById("myRange3").value;
		if (br > 359){br=br-360;}
		ofils=varea().style.filter.split(" ");
		vfilter=ofils[0]+" "+ofils[1]+" "+ofils[2]+" "+ofils[3]+" hue-rotate("+br+"deg)";
        varea();
	}

	function invert(){
		ofils=varea().style.filter.split(" ");
		br=" invert(100%) ";
		if (ofils[2]=="invert(100%)"){br=" invert(0%) ";}
		vfilter=ofils[0]+" "+ofils[1]+br+ofils[3]+" "+ofils[4];
        varea();
	}

	function mirror(){
		if (varea().style.transform=="none"){
            vmirror="matrix(-1, 0, 0, 1, 0, 0)";
			varea();

		}else{
            vmirror="none";
			varea();
		}
	}

	function vreset(){
        vfilter="brightness(100%) contrast(100%) invert(0%) saturate(100%) hue-rotate(0deg)";
        vmirror="none";
  		varea();
 		document.getElementById("myRange").value=100;
		document.getElementById("myRange1").value=100;
		document.getElementById("myRange2").value=100;
		document.getElementById("myRange3").value=360;
	}

    function vcontrol(){
        var toolsPanel=document.getElementById("reloadedtoolspanel");
        if (!toolsPanel){return;}
        if ((toolsPanel.style.display=="block")&&(toolsPanel.dataset.activeTab=="video")){
            if (recording){return;}
            toolsPanel.style.display="none";
            setReloadedToolsMenuState(false);
            return;
        }
        toolsPanel.style.display="block";
        setReloadedToolsMenuState(true);
        activateReloadedToolsTab("video");
    }

    function setres(){
        if (document.querySelector('[data-testid="quality-option"]')){
            var voptions=document.querySelectorAll('[data-testid="quality-option"]');
            if (voptions[voptions.length-1].style.color){
                voptions[0].click();
            }
        }
    }

    function dragMouseDown(e) {
        e.preventDefault();
        pos1=e.pageX;
        pos2=e.pageY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

     function elementDrag(e) {
        e.preventDefault();
        pos3=pos1-e.pageX;
        pos4=pos2-e.pageY;
        pos1=e.pageX;
        pos2=e.pageY;
        if (e.clientY <130){return;}
        var pos5=parseInt(document.getElementById("controls").style.right)+pos3;
        var pos6=parseInt(document.getElementById("controls").style.top)-pos4;
        if (pos5 < -18){pos5=-18;}
        if (pos5 > window.innerWidth-450){pos5= window.innerWidth-450;}
        document.getElementById("controls").style.right = pos5 + "px";
        document.getElementById("controls").style.top = pos6 + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    function info(anon){
        var cred="same-origin";
        if (!anon){cred="omit";}
        var url=domain+"api/chatvideocontext/"+roomname+"/";
        fetching++;
        fetch(url,{ credentials: cred}).then(
            function(response) {
                if (response.status !== 200){
                    wprof("Error:","<div style='color:red'>You have no access to this room</div>");
                    if (anon){
                        noaccess=true;
                        fetching--;
                        info(false);
                        return;
                    }
                    fetching--;
                    return;
                }
                response.json().then(function(roomdata) {
                    data=roomdata;
                    fetching--;
                    if (biodata==""){
                        fanbiodata();
                    }else{
                        setprofileinfo();
                    }
                });
            });
    }

    function fanbiodata(){
        var url=domain+"api/biocontext/"+roomname;
        fetch(url,{ credentials: "omit",referrer: domain+roomname+"/"}).then(
            function(response) {
                if (response.status !== 200){
                    setprofileinfo();
                    return;
                }
                response.json().then(function(data) {
                    biodata=data;
                    setprofileinfo();
                });
            });
    }

    function setprofileinfo(){
        room_status=data.room_status;
        username=data.viewer_username;
        if (room_status =="offline"){
            setReloadedToolsTabAvailable("video",false);
        }
        if(pageType=="ppage"){
            setReloadedToolsTabAvailable("video",false);
            document.getElementsByClassName("voteText")[0].innerHTML="";
            document.getElementsByClassName("voteText")[1].innerHTML="";
            document.getElementsByClassName("highPercent")[0].innerHTML="";
            if (data.satisfaction_score.up_votes){
                document.getElementsByClassName("voteText")[0].innerHTML=data.satisfaction_score.up_votes;
                document.getElementsByClassName("voteText")[1].innerHTML=data.satisfaction_score.down_votes;
                document.getElementsByClassName("highPercent")[0].innerHTML=data.satisfaction_score.percent+"%";
                if (data.satisfaction_score.percent<85){
                    document.getElementsByClassName("highPercent")[0].style.color="red";
                }
            }
        }
        wprof("Find:","<a href='https://camgirlfinder.net/models/cb/"+roomname+"' rel=noreferrer target='_new'>Open in camgirlfinder</a>");
        wprof("Statistics:","<a href='https://statbate.com/search/1/"+roomname+"' rel=noreferrer target='_new'>Open in statbate</a>");
        wprof("Schedule:","<a href='https://www.cbhours.com/user/"+roomname+".html' rel=noreferrer target='_new'>Open in cbhours</a>");
        if ((!document.getElementById("reloaded-tab-video"))||(document.getElementById("reloaded-tab-video").style.display=="none")){
            if (!data.opt_out){
                wprof("Full video (anon):","<a href='https://www.girls4cock.com/fullvideo/?b="+roomname+"' rel=noreferrer target='_new'>Open full video mode as anonymous</a>");
                if (pageType!="noaccess"){
                    wprof("Full video:","<a href='"+domain+"fullvideo/?b="+roomname+"' rel=noreferrer target='_new'>Open full video mode</a>");
                }
            }
        }
        wprof("Myfreecams:","<a href='#' id='mfcName' rel=noreferrer target='_new'>dummy</a>&nbsp&nbsp<button type='button' class='profbutton' id='mfcCheck' > Check </button><span id=mfcStatus></span>","mfcProf");
        document.getElementById("mfcProf").style.display="none";
        wprof("Cam4:","<a href='#' id='c4Name' rel=noreferrer target='_new'>dummy</a>&nbsp&nbsp<button type='button' class='profbutton' id='c4Check' > Check </button><span id=c4Status></span>","c4Prof");
        document.getElementById("c4Prof").style.display="none";
        wprof("Bongacams:","<a href='#' id='bcName' rel=noreferrer target='_new'>dummy</a>&nbsp&nbsp<button type='button' class='profbutton' id='bcCheck' > Check </button><span id=bcStatus></span>","bcProf");
        document.getElementById("bcProf").style.display="none";
        wprof("Streamate:","<a href='#' id='smName' rel=noreferrer target='_new'>dummy</a>&nbsp&nbsp<button type='button' class='profbutton' id='smCheck' > Check </button><span id=smStatus></span>","smProf");
        document.getElementById("smProf").style.display="none";
        wprof("Camsoda:","<a href='#' id='csName' rel=noreferrer target='_new'>dummy</a>&nbsp&nbsp<button type='button' class='profbutton' id='csCheck' > Check </button><span id=csStatus></span>","csProf");
        document.getElementById("csProf").style.display="none";
        wprof("Stripchat:","<a href='#' id='scName' rel=noreferrer target='_new'>dummy</a>&nbsp&nbsp<button type='button' class='profbutton' id='scCheck' > Check </button><span id=scStatus></span>","scProf");
        document.getElementById("scProf").style.display="none";
        if (data.opt_out){
            wprof("On network sites:","No");
        }
        makerulesarea(data.chat_rules);
        if(data.chat_rules!=""){
            wprof ("Chat rules:","Yes <button type='button' class='profbutton' id='rulesview'>Show chatrules</button>");
            document.getElementById("rulesview").addEventListener("click",function(){
                if(document.getElementById("rulespop").style.display=="none"){
                    document.getElementById("rulespop").innerHTML=chatrules;
                    document.getElementById("rulespop").style.display="block";
                }
                else{
                    document.getElementById("rulespop").style.display="none";
                    document.getElementById("rulespop").innerHTML="";
                }
            });
        }
        if(pageType=="ppage"){
            if(!noaccess){
                if (data.following){
                    document.getElementById("unfollowbut").style.display="block";
                }else{
                    document.getElementById("followbut").style.display="block";
                }
                if (data.fan_club_is_member){
                    document.getElementById("fanclubmembut").style.display="block";
                }else{
                    if (data.performer_has_fanclub){
                        document.getElementById("fanclubbut").style.display="block";
                    }
                }
            }
        }
        if (room_status =="offline"){
            if (biodata.last_broadcast){
                wprof("Last online:",biodata.last_broadcast.split("T")[0]);
            }
        }
        if (data.num_viewers!=0){
            wprof("Users in room:",data.num_viewers+" <button class='profbutton' type='button' id='userview' style='display:none'> Show userlist.</button>");
            document.getElementById("userview").addEventListener("click",getuserlist);
        }else{
            wprof("Users in room:","0<a href=# id='userview' style='display:none'></a>");
        }
        if (data.low_satisfaction_score){
            wprof("Satisfaction score:","<font color=#CC0000>LOW !!!</font>");
        }
        if (data.is_moderator){
            wprof("Moderator:","Yes");
        }
        if (data.fan_club_is_member){
            wprof("Fanclub member:","Yes");
        }
        videoSrc=data.hls_source;
        wprof("Room status:",'<span id="rstatus">'+room_status+'</span> <button class="profbutton" type="button" id="hls">Update/copy URL</button>');
        document.getElementById("hls").addEventListener("click",function(){getnewhls(!noaccess,true);});
        if(document.querySelector('[data-testid="offline-content-container"]')){
            if(document.querySelector('[data-testid="offline-content-container"]').style.display=="block"){
                wprof("<div id='alarmmode1'>Status alarm mode:</div>","<div id='alarmmode'><input type='range' id='alrmtype' min=0 max=1 value=0 style='width: 35px;height:auto;cursor: pointer'> Reload if visible <-> Alarm on status change<div>");
           }
        }else{
            if (videoSrc == ""){
                wprof("<div id='alarmmode1'>Status alarm mode:</div>","<div id='alarmmode'><input type='range' id='alrmtype' min=0 max=1 value=0 style='width: 35px;height:auto;cursor: pointer'> Reload if visible <-> Alarm on status change<div>");
            }
        }
        wprof("Status alarm:","<div><input type='range' id='alrm' min=0 max=1 value=0 style='width: 35px;height:auto;cursor: pointer'> Off <-> On<div>");
        document.getElementById("alrm").addEventListener("change",setalrm);
        document.title=ctitle;
        if (data.tips_in_past_24_hours !== 0){
            wprof("You tipped:",data.tips_in_past_24_hours+" Tk/24h");
        }
        wprof("Nationality:","<span id='flaginfo'>wait....</span>");
        wprof("Region:","<span id='regioninfo'>wait....</span>");
        getregion(false);
        if (pageType=="ppage"){
            if (room_status.indexOf("hidden")!=-1){
                wprof("Hidden show message:",data.hidden_message);
            }
        }
        if ((room_status=="offline")||(pageType=="ppage")){
            wprof("Room topic:","<div style='width:450px;height:auto'>"+data.room_title+"</div>");
        }
        if (biodata.performer_has_fanclub){
            wprof("Fanclub costs:",biodata.fan_club_cost*3+" Tk / 3 Months");
        }
        if (!data.is_age_verified){
            wprof("Status:","Exhibitionist");
        }else{
            if (data.allow_private_shows){
                wprof("Private recording:",data.allow_show_recordings ? "Yes":"No");
                if (data.spy_private_show_price!=0){
                    if (data.premium_private_price!=0){
                        wprof("Min. premium private:",data.premium_private_min_minutes+" Minutes");
                        wprof("Premium privateshow:",data.premium_private_price+" Tk/min");
                    }
                }
                if (data.spy_private_show_price !== 0){
                    if ((data.fan_club_spy_private_show_price !==null)&&(data.fan_club_spy_private_show_price!==data.spy_private_show_price)){
                        if(data.fan_club_spy_private_show_price==0){
                            wprof("Fan Spy on private:","Free");
                        }else{
                            wprof("Fan Spy on private:",data.fan_club_spy_private_show_price+" Tk/min");
                        }
                    }
                    wprof("Spy on private:",data.spy_private_show_price+" Tk/min");
                }else{
                    wprof("Spy on private:","Disabled");
                }
                wprof("Minimum private:",data.private_min_minutes+" Minutes");
                wprof("Privateshow:",data.private_show_price+" Tk/min");
            }else{
                wprof("Privateshow:","Disabled");
            }
        }
        if (login){
            if (pageType!="noaccess"){
                if (roomname!=username){
                    var dmurl="messages/";
                    if (document.getElementById("dmListIconRoot")){dmurl="dm/";}
                    wprof ("DM:","<a href='"+domain+dmurl+roomname+"/' id='dmpop'>Open window</a>");
                    document.getElementById("dmpop").addEventListener("click", function(event){opendm(this);event.stopPropagation();event.preventDefault();return false;});
                }
            }
            getnotes();
            gojpg=false;
            createimage();
        }
        if ((room_status!="offline")&&(pageType!="ppage")){chatchange();}
    }

    function getuserlist(){
        if (regiofetch){alert("Please wait");return;}
        if(document.getElementById("rulespop").style.display=="block"){
            document.getElementById("rulespop").style.display="none";
            document.getElementById("rulespop").innerHTML="";
            return;
        }else{
            document.getElementById("rulespop").style.display="block";
        }

        var listurl=domain+"api/getchatuserlist/?sort_by=a&roomname="+roomname+"&exclude_staff=false";
        fetch(listurl,{credentials: "omit",referrerPolicy: "no-referrer"}).then(
            function(response) {
                if (response.status !== 200){
                    return;
                }
                response.text().then(function(userdata) {
                    formatuserlist(userdata);
                });
            });
    }

    function setalrm(){
        if (document.getElementById("alrm").value==0){document.title=ctitle;return;}
        ctitle=document.title;
        getnewhls(true,false);
        setTimeout(function(){
            oldroomstatus=roomstatus;
            if(!alarmrun){
            alarmrun=true;
            testalarm();}},1000);
    }

    function testalarm(){
        document.title="\u23F0 "+ctitle;
        setTimeout(function(){
            if(document.getElementById("alrm").value==0){alarmrun=false;return;}
            getnewhls(true,false,2);
        }, 60000);
    }

    function testalarm2(){
        if (roomstatus != oldroomstatus){
            if (!document.getElementById("alrmtype")){
                playalarm();
                alarmtab();
                alarmrun=false;
            }else{
                if(document.getElementById("alrmtype").value==0){
                    if ((roomstatus=="public")||(roomstatus.indexOf("watching")!=-1)){
                        if (pageType=="ppage"){
                            window.focus();
                            setTimeout(newinfo,1000);
                            return;
                        }
                        forceopen(roomname);
                    }
                    oldroomstatus=roomstatus;
                    if (alarmrun){
                        testalarm();
                        return;
                    }
                }
                playalarm();
                alarmtab();
                alarmrun=false;
            }
        }else{
            if (alarmrun){
                testalarm();
            }
        }
    }

    function playalarm(){
        if (document.getElementById("alrm")){
            if (document.getElementById("alrm").value==0){return;}
        }
        setTimeout(playalarm,2000);
    }

    function alarmtab(){
        if (document.getElementById("alrm")){
            if (document.getElementById("alrm").value==0){document.title=ctitle;return;}
        }
        if (document.title != "ALARM"){
            document.title = "ALARM";
        }else{
            document.title = "!!!!!!";
        }
        setTimeout(alarmtab,500);
    }

    function formatuserlist(userdata){
        var broadcastarray=[];
        for(i=0;i < region.length;i++) {
            broadcastarray[i]=JSON.parse(localStorage.getItem("region_"+region[i]));
        }
        var bc="";
        var userarray=userdata.split(",");
        var height=15*userarray.length+120;
        var scroll="";
        if (height<240){height=240;}
        if (height>500){height=500;scroll=";overflow-y:scroll";}
        var userstring="<div style='float:right;color:black'>(Close)</div><div onclick='event.stopPropagation()' style='cursor:default;color:black;width:350px;height:"+height+"px"+scroll+"'>";
        for (i=1; i<userarray.length; i++){
            var user=userarray[i].split("|");
            if (user[1]=="o"){user[1]="#dc5500";}
            if (user[1]=="m"){user[1]="#dc0000";}
            if (user[1]=="f"){user[1]="#090";}
            if (user[1]=="l"){user[1]="#804baa";}
            if (user[1]=="p"){user[1]="#be6aff";}
            if (user[1]=="tr"){user[1]="#1e5cfb";}
            if (user[1]=="t"){user[1]="#69a";}
            if (user[1]=="g"){user[1]="#939393";}
            if (user[2]=="m"){user[2]="https://web.static.mmcdn.com/tsdefaultassets/gendericons/male.svg";}
            if (user[2]=="f"){user[2]="https://web.static.mmcdn.com/tsdefaultassets/gendericons/female.svg";}
            if (user[2]=="c"){user[2]="https://web.static.mmcdn.com/tsdefaultassets/gendericons/couple.svg";}
            if (user[2]=="s"){user[2]="https://web.static.mmcdn.com/tsdefaultassets/gendericons/trans.svg";}
            if (user[3]=="t"){user[3]="<span title='follower'>⭐</span>";}
            if (user[3]=="f"){user[3]="";}
            bc="";
            for(n=0;n < region.length;n++) {
                if (broadcastarray[n].indexOf(user[0])!=-1){
                    bc="<span title='broadcaster' name='broadcast' broadcaster='"+user[0]+"'>🖥️</span>";
                    break;
                }
            }
            if (user[0]==roomname){
                bc="<span title='broadcaster' name='broadcast' broadcaster='"+user[0]+"'>🖥️</span>";
            }
            if ((user[0]==roomname)||(user[0]==username)){
                userstring=userstring+"<img style='height:16px' src='"+user[2]+"'>"+bc+"<a style='font-weight: bold;color:"+user[1]+"'>"+user[0]+"</a> "+user[3]+"<br>";
            }else{
                if (login){
                    userstring=userstring+"<img style='height:16px' src='"+user[2]+"'>"+bc+"<a target=_blank style='font-weight: bold;color:"+user[1]+"' href='"+domain+"p/"+username+"?tab=bio&model="+user[0]+"'>"+user[0]+"</a> "+user[3]+"<br>";
                }else{
                    userstring=userstring+"<img style='height:16px' src='"+user[2]+"'>"+bc+"<a target=_blank style='font-weight: bold;color:"+user[1]+"' href='"+domain+user[0]+"'>"+user[0]+"</a> "+user[3]+"<br>";
                }
            }
        }
        userstring=userstring+"+"+userarray[0].split("|")[0]+" Anonymous users.</div>";
        document.getElementById("rulespop").innerHTML=userstring;
        broadcastarray="";
        broadcastcheck(document.getElementsByName("broadcast").length-1);
    }

    function broadcastcheck(n){
        if (n<0){return;}
        var name=document.getElementsByName("broadcast")[n].getAttribute("broadcaster");
        var url=domain+"get_edge_hls_url_ajax/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "room_slug", name );
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,{
            credentials: "omit",
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+name+"/",
            body: data
        }).then(function(response){
            response.json().then(function(data){
                if(data.room_status=="offline"){
                    document.getElementsByName("broadcast")[n].innerHTML="🖥️❌";
                    document.getElementsByName("broadcast")[n].title="broadcaster offline";
                }
                document.getElementsByName("broadcast")[n].addEventListener("mouseenter",showicon);
                document.getElementsByName("broadcast")[n].addEventListener("mouseout",unshowicon);
                n--;
                broadcastcheck(n);
                return;
            });
        });
    }
    function showicon(){
        var newimg=document.createElement('img');
        newimg.id="picon";
        newimg.style.width="250px";
        newimg.style.position="absolute";
        newimg.style.top="0px";
        newimg.style.right="0px";
        newimg.src="https://thumb.live.mmcdn.com/riw/"+this.getAttribute("broadcaster")+".jpg?"+new Date().getTime();
        document.getElementById("rulespop").prepend(newimg);

    }
    function unshowicon(){
        document.getElementById("picon").remove();
    }

    function chatchange(){
        setReloadedToolsTabAvailable("chat",true);
        applyReloadedChatSettings();
        document.getElementById("c1").addEventListener("change",chatsetchange);
        document.getElementById("c2").addEventListener("change",chatsetchange);
        document.getElementById("c3").addEventListener("change",chatsetchange);
        document.getElementById("c4").addEventListener("change",chatsetchange);
        document.getElementById("c5").addEventListener("change",chatsetchange);
        document.getElementById("c6").addEventListener("change",chatsetchange);
        document.getElementById("c7").addEventListener("change",chatsetchange);
        document.getElementById("c7a").addEventListener("change",chatsetchange);
        document.getElementById("c8").addEventListener("change",chatsetchange);
        document.getElementById("c10").addEventListener("change",chatsetchange);
        document.getElementById("language").addEventListener("change",saveReloadedChatSettings);
        var chatobserver = new MutationObserver(chatadjust);
        var pmchatobserver = new MutationObserver(pmchatadjust);
        var chatobserverConfig = {childList: true};
        var observenode=document.getElementsByClassName("message-list")[0];
        var pmobservenode=document.getElementsByClassName("message-list")[1];
        if (localStorage.getItem(roomname+"Tokens")){
            document.getElementById("c9").innerHTML=localStorage.getItem(roomname+"Tokens");
            firstentry=false;
        }
        document.getElementById("tclear").addEventListener("click",cleartokens);
        if (observenode) chatobserver.observe(observenode,chatobserverConfig);
        if (pmobservenode) pmchatobserver.observe(pmobservenode,chatobserverConfig);
        applyReloadedChatSettingsToMessages();
    }

    function pmchatadjust(){
        tabpm();
        chatadjust();
    }

    function cleartokens(){
        document.getElementById("c9").innerHTML=0;
        localStorage.removeItem(roomname+"Tokens");
    }

    function chatsetchange(){
        c1=document.getElementById("c1").value;
        c2=document.getElementById("c2").value;
        c3=document.getElementById("c3").value;
        c4=document.getElementById("c4").value;
        c5=document.getElementById("c5").value;
        c6=document.getElementById("c6").value;
        c7=document.getElementById("c7").value;
        c7a=document.getElementById("c7a").value;
        if (c7a<2){c7a=2;document.getElementById("c7a").value=2;}
        if (c7a>1000){c7a=1000;document.getElementById("c7a").value=1000;}
        c8=document.getElementById("c8").value;
        c10=document.getElementById("c10").value;
        saveReloadedChatSettings();
        smallemoonoff();
        applyReloadedChatSettingsToMessages();
    }

    function chatadjust(){
        if (!firstentry){
            twaiting=true;
            setTimeout(function(){twaiting=false;}, 200);
            firstentry=true;
        }
        var tags=document.getElementsByClassName('msg-list-fvm');
        for (n=0; n<tags.length; n++){
            chattamper(n);
        }
    }

    function chattamper(tag){
        var messages=document.getElementsByClassName('msg-list-fvm')[tag].querySelectorAll('[data-testid="chat-message"]');
        var chatmessages=messages.length;
        if (chatmessages==0){return;}
        var translated=0;
        for (i = chatmessages-1; i > 0; i--) {

            var noticeelm=messages[i].querySelector('[data-testid="room-notice"]');
            if (noticeelm!=null){
                var noticeclasses=noticeelm.classList;
                var notetext=noticeelm.querySelector('[data-testid="room-notice-viewport"]').textContent;
                if (noticeclasses.length==1){
                    if (notetext.indexOf("Notice:")==0){
                        if (c2==1){
                            messages[i].style.display="none";
                        }else{
                            messages[i].style.display="block";
                        }
                    }
                    if (notetext.indexOf("Moderator")==0){
                        if (c4==1){
                            messages[i].style.display="none";
                        }else{
                            messages[i].style.display="block";
                        }
                    }
                    if (notetext.indexOf("Fan club member")==0){
                        if (c4==1){
                            messages[i].style.display="none";
                        }else{
                            messages[i].style.display="block";
                        }
                    }
                }
                if (noticeclasses.contains("titleChange")){
                    if (c3==1){
                        messages[i].style.display="none";
                    }else{
                        messages[i].style.display="block";
                    }
                }
                if (noticeclasses.contains("isTip")){
                    var tokens=parseInt(notetext.split("tipped ")[1].split(" ")[0]);
                    if (tag==0){
                        if(messages[i].style.display=="flex"){
                            if(!twaiting){
                                document.getElementById("c9").innerHTML=parseInt(document.getElementById("c9").innerHTML)+tokens;
                                localStorage.setItem(roomname+"Tokens",document.getElementById("c9").innerHTML);
                            }
                        }
                    }
                    if ((c7==1)&&(tokens<c7a)){
                        messages[i].style.display="none";
                    }else{
                        messages[i].style.display="block";
                    }
                }
            }

            if (messages[i].querySelector('[data-testid="chat-message-text"]')!=null){
                var chattext=messages[i].querySelector('[data-testid="chat-message-text"]').textContent;
                if (messages[i].querySelector('[data-testid="chat-message-username"]').className=="broadcaster"){
                    if ((chattext.indexOf("Lovense")!=-1)||(chattext.indexOf("------")!=-1)||(chattext.indexOf("******")!=-1)||(chattext.indexOf("The High Tipper")!=-1)||(chattext.indexOf("The king Tipper")!=-1)||(chattext.indexOf("Special Commands:")!=-1)||(chattext.indexOf("Blitz Mode")!=-1)||(chattext.indexOf("the critical hit rate")!=-1)){
                        messages[i].name="notranslate";
                        if (c8==1){
                            messages[i].style.display="none";
                        }else{
                            messages[i].style.display="block";
                        }
                    }
                }

                if (messages[i].querySelector('[data-testid="chat-message-username"]').className=="defaultUser"){
                    if (c5==1){
                        messages[i].style.display="none";
                    }else{
                        messages[i].style.display="block";
                    }
                }
                if (messages[i].querySelector('[data-testid="chat-message-username"]').className=="mod"){
                    if (c6==1){
                        messages[i].style.display="none";
                    }else{
                        messages[i].style.display="block";
                    }
                }

                if (c10==1){
                    if(!messages[i].name){
                        if (messages[i].style.display!="none"){
                            var splitmode=true;
                            var splitchatblock=false;
                            if(document.getElementsByClassName('msg-list-fvm')[tag].classList.contains("message-list")){splitchatblock=true;}
                            if(document.getElementById("ChatTabContainer").style.display=="none"){splitmode=false;}
                            if ((splitmode&&splitchatblock)||(!splitmode&&!splitchatblock)){
                                messages[i].name="translate";
                                translated++;
                                if (translated<8){
                                    translate(messages[i]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function translate(elm){
        var chattext=elm.querySelector('[data-testid="chat-message-text"]').textContent;
        var result="";
        chattext=chattext.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g,"");
        chattext=chattext.replace(/\./gi,"{.}");
        chattext=chattext.replace(/\?/gi,"{?}");
        chattext=chattext.replace(/\!/gi,"{!}");
        chattext=chattext.replace(/\|/gi,"{|}");
        chattext=chattext.replace(/\&/gi,"{{");
        chattext=chattext.toLowerCase();
        if (chattext.length>2){
            chattext=encodeURI(chattext);
            var lang=document.getElementById("language").options[document.getElementById("language").selectedIndex].value;
            GM_xmlhttpRequest({
                method: "GET",
                timeout: 5000,
                mozAnon: true,
                anonymous: true,
                url: tr2+lang+"&dt=t&q="+chattext,
                onload: function(response) {
                    if (response.status !== 200){
                        result="Translate error "+response.status;
                    }else{
                        result=JSON.parse(response.responseText)[0][0][0];
                        result=result.replace(/\\u200b/gi,"");
                        result=result.replace(/\\u003d/gi,"=");
                        result=result.replace(/\\u003c/gi,"<");
                        result=result.replace(/\\u003e/gi,">");
                        result=result.replace(/\{\{/gi,"&");
                        result=result.replace(/\{/gi,"");
                        result=result.replace(/\}/gi,"");
                    }
                    showtranslate(result,elm);
                },
                ontimeout: function(){
                    result="Translate error timeout";
                    showtranslate(result,elm);
                }
            });
        }
    }

    function showtranslate(result,elm){
        var newelem=document.createElement('span');
        newelem.innerHTML=result;
        newelem.className="translated";
        elm.firstChild.lastElementChild.appendChild(newelem);
    }

    function smallemoonoff(){
        if (c1==1){
            document.body.classList.add("smallemo");
        }else{
            document.body.classList.remove("smallemo");
        }
    }

    function ccontrol(){
        var toolsPanel=document.getElementById("reloadedtoolspanel");
        if (!toolsPanel){return;}
        if ((toolsPanel.style.display=="block")&&(toolsPanel.dataset.activeTab=="chat")){
            toolsPanel.style.display="none";
            setReloadedToolsMenuState(false);
            return;
        }
        toolsPanel.style.display="block";
        setReloadedToolsMenuState(true);
        activateReloadedToolsTab("chat");
    }

    function opendm(that){
       var dmwindow= window.open(that.href,'DMpop','toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=1000,height=800');
       dmwindow.onload = function(){
           this.addEventListener('unload', function(){setTimeout(function(){newinfo();},1000);});
       };
    }

    function getnotes(){
        var url=domain+"api/notes/for_user/"+roomname+"/";
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                     wprof("Attention:","This room is banned.");
                    return;
                }
                response.json().then(function(data) {
                    if (data.text == null){data.text="";}
                    opennote=data.text;
                    buildprofnote();
                });
            });
    }

    function makerulesarea(rule){
        if (document.getElementById("rulespop")){return;}
        var rulestyle="cursor:pointer;z-index:999;top:10px;left:10px;box-shadow:0px 0px 32px rgba(0, 0, 0, 0.32);border-radius:4px;border:1px solid rgb(221, 221, 221);background-color:rgb(200, 200, 200);position:absolute; display:none; white-space: pre-line; text-align: left; line-height: 1.4; height: auto; width:500px; padding: 10px 10px 10px 10px; box-sizing: border-box; overflow-wrap: break-word; word-break: break-word; padding: 15px;";
        var newelem=document.createElement('span');
        newelem.setAttribute("style", rulestyle);
        newelem.id="rulespop";
        chatrules="<div style='color:black'><b>"+roomname+" chatrules:</b><br><br>"+rule+"<br><br><center>(Click to close)</center></div>";
        newelem.addEventListener("click",function(){this.style.display="none";this.innerHTML="";});
        document.querySelector('[data-testid="room-bio-tab-contents"]').appendChild(newelem);
    }

    function createimage(){
        if ((pageType!="ppage")&&(pageType!="noaccess")){return;}
        hls.detachMedia();
        if (document.getElementById("profimg")){
            document.getElementById("profimg").remove();
        }
        if (document.getElementById("profjpgimg")){
            pimg.removeEventListener("load",regetimgprof);
            pimg.removeEventListener("error",errorimgprof);
            document.getElementById("profjpgimg").remove();
        }
        if (document.getElementById("profplayer")){
            document.removeEventListener("visibilitychange",vidpause);
            document.getElementById("profplayer").remove();
            document.getElementById("controls").style.display="none";
            setReloadedToolsTabAvailable("video",false);
        }
        if ((room_status=="public")||(room_status.indexOf("watching")!=-1)){
            if (!gojpg){
                if (videoSrc!=""){
                    makevidplayer();
                    startvid();
                    return;
                }
            }
            makejpgplayer();
            return;
        }
        var url="https://jpeg.live.mmcdn.com/minifwap/"+roomname+".jpg";
        fetch(url,{
            cache: "no-cache",
            credentials: "same-origin",referrer: domain}).then(
            function(response){
                response.blob().then(
                    function(rawimg){
                        var imgsize=rawimg.size;
                        if ((imgsize<4408)||(imgsize>4415)){
                            makeimg();
                        }else{
                            makecrd();
                        }
                    });
                }
        );
    }

    function makecrd(){
        if (noaccess){return;}
        if (data.summary_card_image==""){return;}
        var newelem=document.createElement('img');
        newelem.src=data.summary_card_image;
        newelem.className="profplayer";
        newelem.id="profimg";
        newelem.style.height="480px";
        newelem.style.maxWidth="854px";
        document.querySelector('[data-testid="room-bio-tab-contents"]').appendChild(newelem);
    }

    function makeimg(){
        var newelem=document.createElement('img');
        newelem.src="https://jpeg.live.mmcdn.com/minifwap/"+roomname+".jpg";
        newelem.className="profplayer";
        newelem.id="profimg";
        newelem.style.height="270px";
        newelem.style.width="480px";
        document.querySelector('[data-testid="room-bio-tab-contents"]').appendChild(newelem);
    }

    function makejpgplayer(){
        var newelem=document.createElement('canvas');
        newelem.width="854";
        newelem.height="480";
        newelem.id="profjpgimg";
        newelem.style.display="none";
        document.querySelector('[data-testid="room-bio-tab-contents"]').appendChild(newelem);
        pimg.addEventListener("load",regetimgprof);
        pimg.addEventListener("error",errorimgprof);
        pimg.crossOrigin = "Anonymous";
        n=new Date().getTime();
        pimg.src = "https://jpeg.live.mmcdn.com/stream?room="+roomname+"&f="+n;
        var canvas=document.querySelector('canvas');
        stream = canvas.captureStream ? canvas.captureStream() : canvas.mozCaptureStream();
        makevidplayer();
        document.querySelector('video').srcObject=stream;
        document.querySelector('video').play();
    }

    function errorimgprof(){
        if (gojpg){return;}
        recstop();
        setTimeout(function(){getnewhls(true,false,1);},2000);
    }

    function regetimgprof(){
        var lt=new Date().getTime()-n;
        if (lt>180){lt=180;}
        if ((document.visibilityState!="visible")&&(!recording)){
            setTimeout(regetimgprof,2000);
        }else{
            var canvas = document.querySelector('canvas');
            canvas.getContext('2d').drawImage(pimg, 0, 0, pimg.width, pimg.height);
            setTimeout(function(){n=new Date().getTime();pimg.src = "https://jpeg.live.mmcdn.com/stream?room="+roomname+"&f="+n;}, 200-lt);
        }
    }

    function makevidplayer(){
         if(document.getElementById("tabs_content_container")){
            document.getElementById("tabs_content_container").style.minHeight=parseInt(0.562*window.innerWidth-5)+"px";
        }
        var vidobserver=new MutationObserver(vidsize);
        var vidobserverConfig ={attributes : true, attributeFilter : ['style'] };
        var control=localStorage.getItem("videoControls");
        var newdivelem=document.createElement('div');
        newdivelem.className="profdivplayer";
        newdivelem.style.width=vidwidth+"px";
        newdivelem.id="profplayer";
        newdivelem.style.backgroundImage = "url('https://jpeg.live.mmcdn.com/minifwap/"+roomname+".jpg')";
        newdivelem.style.backgroundPosition="top";
        newdivelem.style.backgroundRepeat="no-repeat";
        newdivelem.style.backgroundSize="100% calc(100% - 3px)";
        var newelem=document.createElement('video');
        newelem.style.width="100%";
        newelem.controls=true;
        if (control.indexOf("true")!=-1){newelem.muted=true;}
        var volume=control.split(":")[1].split(",")[0];
        newelem.volume=volume/100;
        newelem.poster="https://jpeg.live.mmcdn.com/stream?room="+roomname+"&f="+ new Date().getTime();
        newelem.height=parseInt(vidwidth*0.562)+1;
        newelem.id="profvid";
        newelem.setAttribute("playsinline", "");
        newelem.setAttribute("autoplay", "");
        newdivelem.appendChild(newelem);
        document.querySelector('[data-testid="room-bio-tab-contents"]').appendChild(newdivelem);
        vidobserver.observe(document.getElementById("profplayer"), vidobserverConfig);
        if(!document.querySelector('canvas')){
            document.addEventListener("visibilitychange",vidpause);
        }
        setReloadedToolsTabAvailable("video",true);
    }

    function vidsize(){
        vidwidth=parseInt(document.getElementById("profplayer").style.width);
        if (vidwidth<80){vidwidth=80;document.getElementById("profplayer").style.width=vidwidth+"px";}
        if (vidwidth>window.innerWidth-75){vidwidth=window.innerWidth-75;document.getElementById("profplayer").style.width=vidwidth+"px";}
        document.getElementById("profvid").height=parseInt(vidwidth*0.562)+1;
    }

    function startvid(){
        getnewhls(true,false,3);
    }

    function startvid2(){
        if(document.visibilityState!="visible"){return;}
        setReloadedToolsTabAvailable("video",true);
        if (videoSrc==""){
            createimage();
            return;
        }
        var video=document.getElementsByTagName('video')[0];
        video.poster="https://jpeg.live.mmcdn.com/stream?room="+roomname+"&f="+ new Date().getTime();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (fatalerror==0){
                setTimeout(function(){
                    fatalerror=0;
                  }, 15000);
            }
            fatalerror++;
            if (fatalerror > 10){
                restarts++;
                setTimeout(function(){restarts=0;}, 15000);
                if (restarts==3){
                    restarts=0;
                    if (!recording){
                        gojpg=true;
                        hls.detachMedia();
                        createimage();
                        setTimeout(function(){gojpg=false;getnewhls(true,false,1);},15000);
                        return;
                    }
                    fatalerror=0;
                    hls.detachMedia();
                    getnewhls(true,false,3);
                    return;
                }
            }

        });
    }

    function vidpause(){
        if (recording){return;}
        if (document.hidden){
            clearTimeout(vidpausetime);
            vidpausetime=setTimeout(function(){
                if (document.hidden){
                    vidonpause=true;
                    hls.stopLoad();
                    hls.detachMedia();
                }
            },10000);
        }else{
            if (!document.hidden){
                clearTimeout(vidpausetime);
                if (vidonpause){
                    vidonpause=false;
                    startvid();
                }
            }
        }
    }

    function recstop(){
        if (!recording){return;}
        stoppressed=true;
        mediaRecorder.stop();
    }
    function recstart(){
        stoppressed=false;
        if (recording){
            if (recwait){return;}
            if (!recpause){
                clearTimeout(recTimeoutID);
                mediaRecorder.pause();
                recpause=true;
                return;
            }
            mediaRecorder.resume();
            document.getElementById("recbut").style.color="white";
            recpause=false;
            return;
        }
        recording=true;
        setReloadedToolsMenuState(null,"not-allowed");
        document.getElementById("vcontr2").style.cursor="not-allowed";
        document.getElementById("recbut").innerHTML="&nbsp&nbspPAUSE&nbsp&nbsp";
        document.getElementById("rectime").style.display="block";
        if (!document.getElementById('profjpgimg')){
            var video=document.querySelector('video');
            video.addEventListener("pause", function(){video.play();});
            stream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
            if (!video.captureStream) {
                var ctx = new AudioContext();
                var dest = ctx.createMediaStreamSource(stream);
                dest.connect(ctx.destination);
            }
        }
        mediaRecorder = new MediaRecorder(stream,{
            mimeType:mimeTypes[mimeType],
            videoBitsPerSecond: bitrate
         });
        mediaRecorder.onstop = autosave;
        mediaRecorder.ondataavailable = handleDataAvailable;
        timedisplay();
        recstart2();
    }
    function recstart2(){
        prectime=0;
        recwait=false;
        recpause=false;
        clearTimeout(recTimeoutID);
        var starttime=new Date().toISOString().split(".")[0]+"GMT";
        starttime=starttime.replaceAll(":","-");
        recname=roomname+"("+recparts+")-"+starttime;
        try {
            mediaRecorder.start(1000);
        } catch (e) {
            endrecord();
            return;
        }
        recTimeoutID=setTimeout(recstop,10000);
    }
    function handleDataAvailable(event) {
        clearTimeout(recTimeoutID);
        if (event.data){
            if (event.data.size){
                if (event.data.size>0){
                    recordedBlobs.push(event.data);
                    zeroData=0;
                }else{
                    zeroData++;
                }
            }else{
                zeroData++;
            }
        }
        if (zeroData>10){
            recstop();
            return;
        }
        if (!recpause){
            if(!recwait){
                recTimeoutID=setTimeout(recstop,10000);
            }
        }
    }
    function timedisplay(){
        if (recording){
            setTimeout(timedisplay,1000);
            if(!recpause){
                if(!recwait){
                    var h = Math.floor(rectime / 3600);
                    var H=("0"+h).substr(-2);
                    var m = Math.floor(rectime % 3600 / 60);
                    var M=("0"+m).substr(-2);
                    var s = Math.floor(rectime % 3600 % 60);
                    var S=("0"+s).substr(-2);
                    document.getElementById("rectime").innerHTML="REC("+recparts+"): "+H+" : "+M+" : "+S;
                    rectime++;
                    prectime++;
                }
            }
            if (recpause){
                if (document.getElementById("recbut").style.color=="red"){
                    document.getElementById("recbut").style.color="white";
                }else{
                    document.getElementById("recbut").style.color="red";
                }
            }
            if (prectime==savetime*60){
                timerrecstop=true;
                mediaRecorder.stop();
            }
        }
    }

    function autosave(){
        recwait=true;
        document.getElementById("recbut").style.color="white";
        clearTimeout(recTimeoutID);
        if (prectime<10){
            recparts--;
            dlready();
            return;
        }
        if (recordedBlobs.length <3){
            stoppressed=true;
            dlready();
            return;
        }
        document.getElementById("rectime").innerHTML="SAVING";
        blob = new Blob(recordedBlobs, {type: vidcontainers[mimeType]});
        URL.revokeObjectURL(url);
        url = URL.createObjectURL(blob);
        GM_download({
            url: blob,
            name: recname+extentions[mimeType],
            onload: dlready,
        });
    }

    function dlready(){
        recordedBlobs=[];
        blob = new Blob([]);
        if(stoppressed==false){
            recparts++;
            if (timerrecstop==false){
                    document.getElementById("rectime").innerHTML="WAITING";
                    setTimeout(recstart2,10000);
                    return;
            }
            timerrecstop=false;
            recstart2();
            return;
        }else{
            endrecord();
        }
    }

    function endrecord(){
        setReloadedToolsMenuState(null,"pointer");
        document.getElementById("vcontr2").style.cursor="pointer";
        document.getElementById("recbut").innerHTML="RECORD";
        document.getElementById("recbut").style.color="white";
        document.getElementById("rectime").style.display="none";
        document.getElementById("rectime").innerHTML="";
        recparts=1;
        rectime=0;
        recording=false;
        recpause=false;
        recwait=false;
        stoppressed=false;
    }

    function buildprofnote(){
        var subbutraw="<span id='profsubmit' style='color: rgb(255, 255, 255); background: rgb(244, 115, 33); font-family: UbuntuMedium, Helvetica, Arial, sans-serif; font-size: 12px; padding: 4px 10px 5px; position: relative; left: 120px; float: left; border-radius: 4px; cursor: pointer;'>Save</span>";
        wprof("",'<div width="200px" id="profnote" style="display:none"><a href=# id="profcancel">Cancel</a>'+subbutraw+'</div>');
//        wprof("Personal notes:","<textarea id='proftext' class='proftext' spellcheck='false' placeholder='Enter notes about this user (only seen by you)'></textarea>");
        wprof("Personal notes:","<textarea id='proftext' class='proftext' spellcheck='false' placeholder='Enter notes about this user (only seen by you)\nWrite site short code (sc:, cs:, bc:, c4:, mfc:, sm:) and modelname to check if the model is online on other sites'></textarea>");
        document.getElementById("proftext").value=opennote;
        document.getElementById("proftext").addEventListener("input",profopenbutton);
        document.getElementById("profcancel").addEventListener("click",profclosebutton);
        document.getElementById("profsubmit").addEventListener("click",profsavenote);
        setExtern();
    }

    function profsavenote(){
        var notetext=document.getElementById("proftext").value;
        var url=domain+"api/notes/for_user/"+roomname+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "text", notetext );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+roomname+"/",
            body: data
        }).then(profaftersave);
    }

    function profaftersave(){
        opennote=document.getElementById("proftext").value;
        profclosebutton();
    }

    function profopenbutton(){
        document.getElementById("profnote").style.display="block";
        document.getElementById("proftext").value=document.getElementById("proftext").value.replace("$"," "+new Date().toLocaleDateString()+" ");
        if(opennote==document.getElementById("proftext").value){
            profclosebutton();
        }
    }

    function profclosebutton(){
        document.getElementById("profnote").style.display="none";
        document.getElementById("proftext").value=opennote;
    }

    function setExtern(){
        var testnote=opennote.toLowerCase().replaceAll((/[\r\n]+/g)," ");
        if (testnote.includes("cs:")){
            var csName=testnote.split("cs:")[1].split(" ")[0];
            if (csName.length>2){
                document.getElementById("csName").innerHTML=csName;
                document.getElementById("csName").href="https://camsoda.com/"+csName;
                document.getElementById("csCheck").addEventListener("click",function(){csCheck(csName);});
                document.getElementById("csProf").style.display="";
            }
        }
        if (testnote.includes("sc:")){
            var scName=testnote.split("sc:")[1].split(" ")[0];
            if (scName.length>2){
                document.getElementById("scName").innerHTML=scName;
                document.getElementById("scName").href="https://stripchat.com/"+scName;
                document.getElementById("scCheck").addEventListener("click",function(){scCheck(scName);});
                document.getElementById("scProf").style.display="";
            }
        }
        if (testnote.includes("sm:")){
            var smName=testnote.split("sm:")[1].split(" ")[0];
            if (smName.length>2){
                document.getElementById("smName").innerHTML=smName;
                document.getElementById("smName").href="https://streamate.com/cam/"+smName;
                document.getElementById("smCheck").addEventListener("click",function(){smCheck(smName);});
                document.getElementById("smProf").style.display="";
            }
        }
        if (testnote.includes("bc:")){
            var bcName=testnote.split("bc:")[1].split(" ")[0];
            if (bcName.length>2){
                document.getElementById("bcName").innerHTML=bcName;
                document.getElementById("bcName").href="https://bongacams.com/"+bcName;
                document.getElementById("bcCheck").addEventListener("click",function(){bcCheck(bcName);});
                document.getElementById("bcProf").style.display="";
            }
        }
        if (testnote.includes("c4:")){
            var c4Name=testnote.split("c4:")[1].split(" ")[0];
            if (c4Name.length>2){
                document.getElementById("c4Name").innerHTML=c4Name;
                document.getElementById("c4Name").href="https://cam4.com/"+c4Name;
                document.getElementById("c4Check").addEventListener("click",function(){c4Check(c4Name);});
                document.getElementById("c4Prof").style.display="";
            }
        }
        if (testnote.includes("mfc:")){
            var mfcName=testnote.split("mfc:")[1].split(" ")[0];
            if (mfcName.length>2){
                document.getElementById("mfcName").innerHTML=mfcName;
                document.getElementById("mfcName").href="https://myfreecams.com/#"+mfcName;
                document.getElementById("mfcCheck").addEventListener("click",function(){mfcCheck(mfcName);});
                document.getElementById("mfcProf").style.display="";
            }
        }

    }

    function wprof(col1,col2,id){
        var container=document.getElementsByClassName("BioContents")[0];
        var newtr=document.createElement('tr');
        if (id){newtr.id=id;}
        newtr.setAttribute("style", "font-size: 14px; font-weight: normal; line-height: 15px; vertical-align: top; text-align: left;");
        newtr.setAttribute("name", "info");
        var newtd=document.createElement('td');
        newtd.setAttribute("style", "padding-bottom: 9px; font-family: UbuntuMedium, Arial, Helvetica, sans-serif; height: 16px;");
        newtd.className="label";
        var newspan=document.createElement('span');
        newspan.className="defaultColor";
        newspan.innerHTML=col1;
        newtd.appendChild(newspan);
        var newtd2=document.createElement('td');
        newtd2.setAttribute("style", "font-size: 14px; line-height: 16px; font-family: UbuntuRegular, Arial, Helvetica, sans-serif;");
        newtd2.className="contentText";
        newtd2.innerHTML=col2;
        newtr.appendChild(newtd);
        newtr.appendChild(newtd2);
        var referenceNode=container.getElementsByTagName("table")[0];
        referenceNode.insertBefore(newtr, referenceNode.getElementsByTagName("tr")[2]);
    }

    function newinfo(easy){
        if (fetching!==0){alert("Slow down !");return;}
        if (regiofetch){alert("Please wait !");return;}
        regiofetch=true;
        if (easy!=1){
            localStorage.setItem("regloaded","bar");
        }
        if(document.getElementById("rulespop")){document.getElementById("rulespop").style.display="none";}
        var tags=document.getElementsByName("info");
  		for(i=tags.length-1;i>=0;i--){
            tags[i].remove();
        }
        info(true);
    }

    function cleaninit(){
        var p=0;
        var maxoke="";
        var attr="";
        var tags=document.querySelectorAll('[rel="nofollow"]');
        for (n=0; n<tags.length; n++){
            if (tags[n].style.position){
                if (tags[n].style.position=="fixed"){
                    tags[n].style.position="absolute";
                }
                if (tags[n].style.position.indexOf("var")!=-1){
                    tags[n].style.position="absolute";
                }
                if (tags[n].style.position.indexOf("absolute")!=-1){
                    if (tags[n].getAttribute("style").indexOf("!important")!=-1){
                        attr=tags[n].getAttribute("style");
                        attr=attr.split("!important").join("");
                        tags[n].setAttribute("style",attr);
                    }
                    tags[n].classList.add("profpos");
                    p++;
                }
            }
            if (tags[n].style.marginTop){
                maxoke=-30;
                if(tags[n].style.marginTop.indexOf("px")!=-1){maxoke=-200;}
                if (parseFloat(tags[n].style.marginTop)<maxoke){
                    if (tags[n].getAttribute("style").indexOf("!important")!=-1){
                        attr=tags[n].getAttribute("style");
                        attr=attr.split("!important").join("");
                        tags[n].setAttribute("style",attr);
                    }
                    tags[n].classList.add("profmar");
                    p++;
                }
            }
            if (tags[n].style.margin){
                maxoke=-30;
                if(tags[n].style.margin.split(" ")[0].indexOf("px")!=-1){maxoke=-200;}
                if (parseFloat(tags[n].style.margin)<maxoke){
                    if (tags[n].getAttribute("style").indexOf("!important")!=-1){
                        attr=tags[n].getAttribute("style");
                        attr=attr.split("!important").join("");
                        tags[n].setAttribute("style",attr);
                    }
                    tags[n].classList.add("profmar");
                    p++;
                }
            }
            if (tags[n].style.cursor){
                if (tags[n].getAttribute("style").indexOf("!important")!=-1){
                    attr=tags[n].getAttribute("style");
                    attr=attr.split("!important").join("");
                    tags[n].setAttribute("style",attr);
                }
                tags[n].classList.add("profcur");
                p++;
            }
        }
        document.getElementById("clean").style.display="none";
        if (p!==0){
            document.getElementById("clean").style.display="block";
            cleanup();
        }
    }

	function cleancookie(){
        if (localStorage.getItem("pclean")){
            localStorage.removeItem("pclean");
		}else{
            localStorage.setItem("pclean", "foo");
        }
		cleanup();
	}

    function cleanup(){
        var claction=!localStorage.getItem("pclean");
        if (claction){
            document.getElementById("clean").innerHTML= "CLEAN PROFILE = ON&nbsp;";
            document.body.classList.add("cleanprof");
        }else{
            document.getElementById("clean").innerHTML= "CLEAN PROFILE = OFF";
            document.body.classList.remove("cleanprof");
        }
    }

   function linkfix(){
        var bioarea= document.getElementsByClassName('BioContents')[0];
        var tags = bioarea.getElementsByTagName('a');
        for (i=0; i<tags.length; i++){
            if (tags[i].href.indexOf('?url=') != -1){
                var linkout=decodeURIComponent(tags[i].href).split("?url=")[1];
                tags[i].href=linkout;
            }
         }
    }

    function collectiondownload(){
        document.getElementById("main").addEventListener("click", collectiondownload2);
        collectiondownload2();
    }

    function collectiondownload2(){
        setTimeout(function(){collectiondownload3();}, 2000);
    }

    function collectiondownload3(){
        if(document.getElementsByTagName("video").length>0){
            if(document.getElementsByTagName("video")[0].src){
                if(!document.getElementById("link")){
                    var newelem=document.createElement('a');
                    newelem.id="link";
                    newelem.style.position="relative";
                    newelem.style.left="250px";
                    newelem.style.top="5px";
                    newelem.href= document.getElementsByTagName("video")[0].src;
                    newelem.target="_blank";
                    newelem.innerHTML="Right click, save to disk.";
                    newelem.style.backgroundColor="white";
                    newelem.style.marginLeft="20px";
                    document.getElementsByClassName("createdAt")[0].parentNode.appendChild(newelem);
                }
            }
        }
    }

    function savedprvdownload(){
        setTimeout(function(){savedprvdownload3();}, 2000);
    }

    function savedprvdownload3(){
        var newelem=document.createElement('a');
        newelem.href= document.getElementsByTagName("video")[0].src;
        newelem.target="_blank";
        newelem.innerHTML="Right click, save to disk.<br>";
        newelem.style.backgroundColor="white";
        newelem.style.marginLeft="20px";
        document.getElementById("tsRecordedShowPlayer").appendChild(newelem);
    }

    function passwordfollow(){
        setTimeout(function(){
            var unfollow=document.querySelector('[data-testid="unfollow-button"]');
            var follow=document.querySelector('[data-testid="follow-button"]');
            if (unfollow.style.display=="none"){
                follow.parentNode.parentNode.style.display="block";
                follow.style.display="block";
            }
                unfollow.addEventListener("click", function(){setTimeout(function(){document.location.reload();}, 500);} );
                follow.addEventListener("click", function(){setTimeout(function(){document.location.reload();}, 500);} );
        }, 1000);
        var newelem=document.createElement('div');
        newelem.className="BioContents";
        var newtable=document.createElement('table');
        newelem.appendChild(newtable);
        var newtr=document.createElement('tr');
        newtable.appendChild(newtr);
        newtr=document.createElement('tr');
        newelem.style.position="relative";
        newelem.style.float="left";
        newtable.appendChild(newtr);
        document.getElementsByClassName("defaultColor")[0].appendChild(newelem);
        var dmurl="messages/";
        if (document.getElementById("dmListIconRoot")){dmurl="dm/";}
        wprof("Find:","<a href='https://camgirlfinder.net/models/cb/"+roomname+"' rel=noreferrer target='_new'>Open in camgirlfinder</a>");
        wprof("Statistics:","<a href='https://statbate.com/search/1/"+roomname+"' rel=noreferrer target='_new'>Open in statbate</a>");
        wprof ("DM:","<a href='"+domain+dmurl+roomname+"/' id='dmpop'>Open window</a>");
        wprof("Video:",'<div id="rstatus"></div>');
        wprof("Video status:","<a href=# id='hls'>Update status</a>");
        wprof("Check:","Off <input type='range' id='pwalrm' min=0 max=1 value=0 style='width: 35px;height:auto;cursor: pointer'> On || Enter the room if you get access.");
        document.getElementById("pwalrm").addEventListener("change",setpwalrm);
        getnewhls(true,false);
        document.getElementById("hls").addEventListener("click",function(){getnewhls(true,true);});
        document.getElementById("dmpop").addEventListener("click", function(event){opendm3(this);event.stopPropagation();event.preventDefault();return false;});
        getnotes();
        document.getElementsByClassName("tooltip")[0].innerHTML="If follow does not work this room banned your region or gender.";
        document.getElementById("tsContent").style.minHeight="400px";
    }

    function setpwalrm(){
        if (document.getElementById("pwalrm").value==0){return;}
        if (alarmrun==false){
            alarmrun=true;
            checkpwalarm();
        }
    }

    function checkpwalarm(){
        setTimeout(function(){
            if(document.getElementById("pwalrm").value==0){alarmrun=false;return;}
            var url=domain+"api/chatvideocontext/"+roomname+"/";
            fetch(url,{credentials: "same-origin"}).then(
            function(response) {
                if (response.status == 200){
                    forceopen(roomname);
                    return;
                }
                checkpwalarm();
            });
        },60000);
    }

    function forceopen(room){
        window.focus();
        setTimeout(function(){document.location.href=domain+room;},1000);
    }

    function opendm3(that){
       window.open(that.href,'DMpop','toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=1000,height=800');
    }

    function bannedroom(){
        var url=domain+"api/chatvideocontext/"+roomname+"/";
        fetch(url,{method: 'HEAD', credentials: "omit"}).then(
            function(response) {
                if (response.status !== 200){
                    noaccess=true;
                    setprofile();
                    return;
                }else{
                    document.location.href=domain+'p/'+username+'?tab=bio&model='+roomname;
                    return;
                }
            });
    }

    function setprofile(){
        document.getElementsByClassName("BaseRoomContents")[0].style.minHeight=parseInt(0.562*window.innerWidth-5)+"px";
        var newelem=document.createElement('div');
        newelem.style.width="100%";
        newelem.style.height="1px";
        newelem.setAttribute('data-testid', 'room-bio-tab-contents');
        document.getElementsByClassName("BaseRoomContents")[0].appendChild(newelem);
        newelem=document.createElement('div');
        newelem.style.margin="14px 14px";
        document.getElementsByClassName("BaseRoomContents")[0].appendChild(newelem);
        newelem=document.createElement('div');
        newelem.className="BioContents";
        newelem.style.margin="20px";
        var newtable=document.createElement('table');
        newelem.appendChild(newtable);
        var newtr=document.createElement('tr');
        newtable.appendChild(newtr);
        newtr=document.createElement('tr');
        newtable.appendChild(newtr);
        document.getElementsByClassName("BaseRoomContents")[0].appendChild(newelem);
        putinlinks();
        makevidcontrol();
        getnewhls(true,false,1);
        setTimeout(function(){
            if (room_status!="public"){
                if(room_status.indexOf("watching")==-1){
                    setReloadedToolsTabAvailable("video",false);
                    document.getElementById("controls").style.display="none";
                }
            }
        },1000);
    }

    function putinlinks(){
        wprof("","<a href=# id=moreinfo>Click here to search for more info.</a>");
        document.getElementById("moreinfo").addEventListener("click",moreinfo);
        wprof("Find:","<a href='https://camgirlfinder.net/models/cb/"+roomname+"' rel=noreferrer target='_new'>Open in camgirlfinder</a>");
        wprof("Statistics:","<a href='https://statbate.com/search/1/"+roomname+"' rel=noreferrer target='_new'>Open in statbate</a>");
        wprof("Schedule:","<a href='https://www.cbhours.com/user/"+roomname+".html' rel=noreferrer target='_new' id='userview'>Open in cbhours</a>");
        wprof("Video status:","<a href=# id='hls'>Update status</a>");
        document.getElementById("hls").addEventListener("click",function(){getnewhls(true,true,1);});
        wprof("Video:",'<div id="rstatus">'+room_status+'</div>');
        wprof("Nationality:","<span id='flaginfo'>wait....</span>");
        wprof("Region:","<span id='regioninfo'>wait....</span>");
        setTimeout(function(){
            getregion(false);
        },1000);
        if(login){
            getnotes();
        }
    }

    function moreinfo(){
        if (room_status!="public"){
            document.getElementById("moreinfo").innerHTML="Room is not public.";
            setTimeout(function(){document.getElementById("moreinfo").innerHTML="Click here to search for more info.";},3000);
            return;
        }
        document.getElementById("moreinfo").removeEventListener("click",moreinfo);
        document.getElementById("moreinfo").innerHTML="Please wait....";
        var dataurl=domain+"affiliates/api/onlinerooms/?format=json&wm=DEieF";
        fetch(dataurl,{credentials: "omit",referrerPolicy: "no-referrer"}).then(
            function(response) {
                if (response.status !== 200){
                    document.getElementById("moreinfo").innerHTML="Error reading roomlist.";
                    return;
                }
                response.json().then(function(data) {
                    for (n=0; n<data.length; n++){
                        if (data[n].username==roomname){
                            wprof("Gender:",data[n].gender);
                            wprof("Given location:",data[n].location);
                            if (data[n].country !=""){
                                if (document.getElementById("flaginfo").innerHTML!=data[n].country){
                                    wprof("Nationality:",data[n].country);
                                }
                            }
                            wprof("Room topic:","<div style='width:450px;height:auto'>"+data[n].room_subject+"</div>");
                            wprof("Spoken languages:",data[n].spoken_languages);
                            wprof("Name:", data[n].display_name);
                            wprof("Birthday:",data[n].birthday);
                            wprof("Age:",data[n].age);
                            wprof("Time online:",toTime(data[n].seconds_online));
                            wprof("Users in room:",data[n].num_users);
                            wprof("Followers:",data[n].num_followers);
                            document.getElementById("moreinfo").innerHTML="";
                            data="";
                            break;
                        }
                    }
                    if (n==data.length){
                        document.getElementById("moreinfo").innerHTML="No information found, user may no longer be in public or opt-out.";
                        setTimeout(function(){
                            document.getElementById("moreinfo").innerHTML="Click here to search for more info.";
                            document.getElementById("moreinfo").addEventListener("click",moreinfo);
                        },3000);
                    }
                    data="";
                });
            });
    }
    function toTime(seconds) {
        var date = new Date(null);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8).replace(":","h").replace(":","m")+"s";
    }

	function createCookie(name,value,days,cdomain){
        var expires="";
        if (cdomain){
            cdomain=";domain=."+cdomain;
        }else{
            cdomain = "";
        }
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = "; expires="+date.toGMTString();
        }
        document.cookie = name+"="+value+expires+"; path=/"+cdomain;
	}

	function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' '){
                c = c.substring(1,c.length);
            }
            if (c.indexOf(nameEQ) === 0){
                return c.substring(nameEQ.length,c.length);
            }
        }
        return null;
	}

    function rebuildbio(){
        referenceNode=document.getElementsByClassName("BioContents")[0].getElementsByTagName("table")[0];
        document.querySelector('[data-paction="RoomTabs"]').remove();
        removebionode();
        document.getElementsByClassName("editbio")[0].remove();
        document.getElementsByClassName("tooltip defaultTooltipColor")[0].remove();
        document.querySelector('[data-paction-name="ActiveRoom"]').innerHTML=tocap(roomname) + "'s Bio";
        document.querySelector('[data-paction-name="ActiveRoom"]').title=tocap(roomname) + "'s Bio";
        document.title=tocap(roomname) + "'s Bio";
        ctitle=document.title;
        getbiodata(true);
    }

    function tocap(name){
        if (!name){return "";}
        return name.charAt(0).toUpperCase()+name.slice(1);
    }

    function getbiodata(anon){
        var cred="same-origin";
        if (!anon){cred="omit";}
        var url=domain+"api/biocontext/"+roomname;
        fetch(url,{ credentials: cred,referrer: domain+roomname+"/"}).then(
            function(response) {
                if (response.status !== 200){
                    if (anon){
                        getbiodata(false);
                        return;
                    }
                    document.location.href=domain+roomname+"/";
                    return;
                }
                response.json().then(function(data) {
                    biodata=data;
                    buildbio();
                    afterrebuild();
                });
            });
    }

    function removebionode(){
        if (referenceNode.getElementsByTagName("tr")[3]){
            referenceNode.getElementsByTagName("tr")[3].remove();
            removebionode();
        }
    }

    function buildbio(){
        referenceNode.getElementsByTagName("tr")[2].getElementsByTagName("span")[0].innerHTML="Real Name:";
        referenceNode.getElementsByTagName("tr")[2].getElementsByTagName("td")[1].innerHTML=tocap(biodata.real_name);

        var newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
        newnode.getElementsByTagName("span")[0].innerHTML="Followers:";
        newnode.getElementsByTagName("td")[1].innerHTML=biodata.follower_count;
        referenceNode.appendChild(newnode);

        if (biodata.display_birthday){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Birth Date:";
            newnode.getElementsByTagName("td")[1].innerHTML=biodata.display_birthday;
            referenceNode.appendChild(newnode);
        }
        if (biodata.display_age){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Age:";
            newnode.getElementsByTagName("td")[1].innerHTML=biodata.display_age;
            referenceNode.appendChild(newnode);
        }

            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="I Am";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.sex)+" "+tocap(biodata.subgender);
            referenceNode.appendChild(newnode);

            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Interested In:";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.interested_in[0])+" "+tocap(biodata.interested_in[1])+" "+tocap(biodata.interested_in[2])+" "+tocap(biodata.interested_in[3]);
            referenceNode.appendChild(newnode);

        if (biodata.location){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Location:";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.location);
            referenceNode.appendChild(newnode);
        }
        if (biodata.time_since_last_broadcast){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Last Broadcast:";
            newnode.getElementsByTagName("td")[1].innerHTML=biodata.time_since_last_broadcast;
            referenceNode.appendChild(newnode);
        }
        if (biodata.languages){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Language(s):";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.languages);
            referenceNode.appendChild(newnode);
        }
       if (biodata.body_type){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Body Type:";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.body_type);
            referenceNode.appendChild(newnode);
        }
        if (biodata.smoke_drink){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Smoke / Drink:";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.smoke_drink);
            referenceNode.appendChild(newnode);
        }
        if (biodata.body_decorations){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Body Decorations:";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.body_decorations);
            referenceNode.appendChild(newnode);
        }
        if (biodata.social_medias[0]){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Social Media:";
            newnode.getElementsByTagName("td")[1].innerHTML="Available on cam page.";
            referenceNode.appendChild(newnode);
        }
        if (biodata.photo_sets[0]){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Photo/video:";
            newnode.getElementsByTagName("td")[1].innerHTML="<a href='"+domain+"photo_videos/photoset/detail/"+roomname+"/"+biodata.photo_sets[0].id+"' target=_blank> Open in new tab.</a>";
            referenceNode.appendChild(newnode);
        }
        newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
        newnode.getElementsByTagName("span")[0].innerHTML="About Me:";
        newnode.getElementsByTagName("td")[1].innerHTML=biodata.about_me;
        referenceNode.appendChild(newnode);
        if (biodata.wish_list){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Wish List:";
            newnode.getElementsByTagName("td")[1].innerHTML=biodata.wish_list;
            referenceNode.appendChild(newnode);
        }
    }

   function getnewhls(anon,clicked,next){
        if (hlsfetching==true){return;}
        hlsfetching=true;
        var cred="same-origin";
        if (!anon){cred="omit";}
        var oldmsg=document.getElementById("hls").innerHTML;
        if(clicked){
            document.getElementById("hls").innerHTML="Copying....";
        }else{
            document.getElementById("hls").innerHTML="Checking....";
        }
        var url=domain+"get_edge_hls_url_ajax/";
        var csrftoken= readCookie("csrftoken");
        var edge="";
        if (videoSrc!=""){
            edge=videoSrc.split("/")[2];
        }
        var data = new FormData();
        data.append( "room_slug", roomname );
        data.append( "jpeg", 1 );
        if (next==1){
            data.append( "bandwidth", "high" );
            data.append( "current_edge", edge );
            data.append( "exclude_edge", "" );
        }
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,{
            credentials: cred,
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+roomname+"/",
            body: data
        }).then(function(response){
            if (response.status !== 200) {
                if (anon){
                    hlsfetching=false;
                    getnewhls(false,clicked,next);
                    return;
                }
                document.getElementById("hls").innerHTML=oldmsg;
                if (next==2){testalarm2();}
                hlsfetching=false;
                return;
            }
            response.json().then(function(data){
                var oldstatus=document.getElementById("rstatus").innerHTML;
                document.getElementById("rstatus").innerHTML=data.room_status;
                document.getElementById("hls").innerHTML=oldmsg;
                roomstatus=data.room_status;
                room_status=data.room_status;
                videoSrc=data.url;
                if (pageType=="ppage"){
                    if(!next){
                        var cansee=true;
                        var couldsee=false;
                        if (data.url==""){cansee=false;}
                        if (oldstatus=="public"){couldsee=true;}
                        if (oldstatus.includes("watching")){couldsee=true;}
                        if (couldsee != cansee){newinfo(1);}
                    }
                }
                if (clicked){navigator.clipboard.writeText(videoSrc);}
                hlsfetching=false;
                if (next==1){createimage();}
                if (next==2){testalarm2();}
                if (next==3){startvid2();}
            });
        });
    }

    function getregion(again){
        for(i=0;i < region.length;i++) {
            if (!localStorage.getItem("region_"+region[i])){
               localStorage.removeItem("regloaded");
            }
        }
        if (localStorage.getItem("regloaded")=="bar"){
            loadregion();
            return;
        }
        if (localStorage.getItem("regloaded")){
            for(i=0;i < region.length;i++) {
                regioarray=JSON.parse(localStorage.getItem("region_"+region[i]));
                 if (regioarray.indexOf(roomname)!=-1){
                    document.getElementById("regioninfo").innerHTML=niceregion[i];
                    if (regioarray[regioarray.indexOf(roomname)+1].length==2){
                        document.getElementById("flaginfo").innerHTML=regioarray[regioarray.indexOf(roomname)+1];
                    }else{
                        document.getElementById("flaginfo").parentNode.parentNode.style.display="none";
                    }
                     regiofetch=false;
                     document.getElementById("userview").style.display="initial";
                     return;
                }
            }
            if ((room_status=="offline")||(room_status=="away")){
                document.getElementById("regioninfo").parentNode.parentNode.style.display="none";
                document.getElementById("flaginfo").parentNode.parentNode.style.display="none";
                regiofetch=false;
                document.getElementById("userview").style.display="initial";
                return;
            }
            if(!again){
                loadregion();
                return;
            }
        }else{
            if(!again){
                loadregion();
                return;
            }
        }
        regiofetch=false;
        document.getElementById("userview").style.display="initial";
        document.getElementById("regioninfo").parentNode.parentNode.style.display="none";
        document.getElementById("flaginfo").parentNode.parentNode.style.display="none";
    }
    function loadregion(){
        regioarray=[];
        if (localStorage.getItem("regloaded")){
            regioarray=JSON.parse(localStorage.getItem("region_"+region[rcount]));
        }
        getregiondata();
    }
    function getregiondata(){
        var url=domain+"api/public/affiliates/onlinerooms/?limit=500&offset="+regoffset*500+"&region="+region[rcount]+"&wm=DEieF&client_ip=212.77.7.51";
        fetch(url,{ credentials: "omit"}).then(
            function(response) {
                if (response.status !== 200) {
                    return;
                }
                response.json().then(function(data){
                    if (data.results != null){
                        var regiolist=data.results;
                        for (n=0; n<regiolist.length; n++){
                            var name=regiolist[n].username;
                            if (regioarray.indexOf(name)==-1){
                                var flag=regiolist[n].country;
                                regioarray.push(name);
                                if (flag.length==2){
                                    regioarray.push(flag);
                                }
                            }
                        }
                        var pages=Math.ceil(data.count/500);
                        regoffset++;
                        if (regoffset!=pages){
                            getregiondata();
                            return;
                        }else{
                            regioarray.push("");
                            localStorage.setItem("region_"+region[rcount],JSON.stringify(regioarray));
                            rcount++;
                            regoffset=0;
                            if (rcount!=region.length){
                                loadregion();
                            }else{
                                rcount=0;
                                localStorage.setItem("regloaded","foo");
                                getregion(true);
                            }
                        }
                    }
                });
            });
    }

    function bantoggle(){
        if (document.getElementById("banlist").style.display=="none"){
            document.getElementById("banlist").style.display="block";
            banusers=[];
            getbanlist(1);
        }else{
            document.getElementById("banusers").innerHTML="";
            document.getElementById("unbanbut").removeEventListener("click", unbanit );
            document.getElementById("permbut").removeEventListener("click", permban );
            document.getElementById("banlist").style.display="none";
        }
    }

    function getbanlist(page){
        var url=domain+"api/ts/chat/ban-list/?page="+page;
        var nowdate=new Date();
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                    return;
                }
                response.json().then(function(data){
                    var selectnode=document.getElementById("banusers");
                    var option=document.createElement('option');
                    option.textContent="Select a user.";
                    option.value=0;
                    selectnode.appendChild(option);
                    var banlist=data.ban_dict.bans;
                    for (n=0; n<banlist.length; n++){
                        var expdate=new Date(banlist[n].expires_at);
                        var expwhen=expdate-nowdate;
                        var expdays=Math.ceil(expwhen/86400000);
                        option=document.createElement('option');
                        option.textContent=banlist[n].username;
                        if (expdays>100){
                            option.textContent=option.textContent+" 🔒";
                        }else{
                            option.textContent=option.textContent+" ("+expdays+" days)";
                        }
                        option.value=banlist[n].id;
                        selectnode.appendChild(option);
                        banusers.push(banlist[n].username);
                    }
                    if (data.ban_dict.current_page!=data.ban_dict.page_count){
                        page++;
                        getbanlist(page);
                        return;
                    }
                    localStorage.setItem("ignoredusers",banusers.toString());
                    document.getElementById("unbanbut").addEventListener("click", unbanit );
                    document.getElementById("permbut").addEventListener("click", permban );
                });
            });
    }

    function unbanit(){
        var banid=document.getElementById("banusers").options[document.getElementById("banusers").selectedIndex].value;
        if (banid==0){return;}
        var url=domain+"edit_room_ban/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "banid", banid);
        data.append( "action", "remove_ban");
        data.append( "room_username", username);
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,{
            credentials: "same-origin",
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+username+"/",
            body: data
        }).then(function(response){
            if (response.status !== 200) {
                alert("Error "+response.status);
                return;
            }
            document.getElementById("banusers").innerHTML="";
            banusers=[];
            getbanlist(1);
       });
    }
    function permban(){
        var banid=document.getElementById("banusers").options[document.getElementById("banusers").selectedIndex].value;
        if (banid==0){return;}
        if (document.getElementById("banusers").options[document.getElementById("banusers").selectedIndex].textContent.split(" ").length<3){return;}
        var url=domain+"edit_room_ban/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "banid", banid);
        data.append( "action", "ban_perm");
        data.append( "room_username", username);
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,{
            credentials: "same-origin",
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+username+"/",
            body: data
        }).then(function(response){
            if (response.status !== 200) {
                alert("Error "+response.status);
                return;
            }
            document.getElementById("banusers").innerHTML="";
            banusers=[];
            getbanlist(1);
       });
    }

    function unfollowthispage(){
        var thumbholder=document.getElementsByClassName("RoomCardGrid")[0];
        roomthumbs=thumbholder.getElementsByClassName("RoomCard");
        nrt=roomthumbs.length;
        if(confirm("Do you want to unfollow these "+thumbholder.getElementsByClassName("RoomCard__followStar").length+" rooms?")){
            thumbobserver1.disconnect();
            document.getElementById("unfollowit").removeEventListener("click",unfollowthispage);
            unfollowroom2();
        }
    }

    function unfollowroom(){
        setTimeout(unfollowroom2,600);
    }

    function unfollowroom2(){
        document.getElementById("unfollowit").innerHTML="<a href=#>WAIT... "+nrt+"</a>";
        nrt--;
        if (nrt<0){
            var page=parseInt(document.location.href.split("page=")[1]);
            if (page){page--;}
            document.location.href=domain+"followed-cams/offline/?page="+page;
        }
        followstar=roomthumbs[nrt].querySelector('[data-testid="follow-star"]');
        var name=roomthumbs[nrt].querySelector('[data-testid="room-card-image-anchor"]').getAttribute("data-room");
        if (followstar.title=="Unfollow"){
            unfollowpage(name);
        }else{
            followpage(name);
        }

    }

    function followpage(name){
        var url=domain+"follow/follow/"+name+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "location", "FollowButton" );
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+roomname+"/",
            body: data
        }).then(function(){
            followstar.title="Unfollow";
            unfollowroom();
        });
    }

    function unfollowpage(name){
        var url=domain+"follow/unfollow/"+name+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "location", "FollowButton" );
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            body: data
        }).then(function(response){
            if (response.status !== 200) {
                alert("Unfollowing failed.");
                return;
            }
            clearnote(name);
        });
    }

    function clearnote(name){
        var url=domain+"api/notes/for_user/"+name+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "text", "" );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            body: data
        }).then(function(){
            if (name==roomname){makeban2(name);return;}
            roomthumbs[nrt].remove();
            unfollowroom();
        });
    }

    function getignorelist(){
        if (!login){return;}
        if (localStorage.getItem("ignoredusers")){
            checkignore();
            return;
        }
        getignoreusers(1);
    }

    function getignoreusers(page){
        var url=domain+"api/ts/chat/ban-list/?page="+page;
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                    return;
                }
                response.json().then(function(data){
                    var banlist=data.ban_dict.bans;
                    for (n=0; n<banlist.length; n++){
                        banusers.push(banlist[n].username);
                    }
                    if (data.ban_dict.current_page!=data.ban_dict.page_count){
                        page++;
                        getignoreusers(page);
                        return;
                    }
                    localStorage.setItem("ignoredusers",banusers.toString());
                    checkignore();
                });
            });
    }

    function checkignore(){
        if (roomname==""){return;}
        banusers=localStorage.getItem("ignoredusers").split(",");
        if (banusers.indexOf(roomname)!=-1){
            document.location.href=domain;
        }

        if (roomname=="roomlogin"){
            if (banusers.indexOf(currpage.split("/")[4])!=-1){
                document.location.href=domain;
            }
        }
        if(pageType=="ppage"){
            if (currpage.split("model=").length==1){return;}
            if (roomname==username){return;}
            if (banusers.indexOf(currpage.split("model=")[1].split("&")[0])!=-1){
                document.location.href=domain;
            }
        }
    }

    function banignore(){
        if ((roomname==username)||(roomname==stor)||(roomname=="p")){
            alert("Sorry, i can not let you do that.");
            return;
        }
        makeban(roomname);

    }

    function makeban(bname){
        if(!confirm("Do you want to ban/ignore "+bname+" ?\n"+bname+" will never be able to contact you and you will never be able to visit this room again.")){return;}
        unfollowpage(bname);
    }

    function makeban2(bname){
        var url=domain+"api/messaging/delete-conversation/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "csrfmiddlewaretoken", csrftoken );
        data.append( "to_username", bname );
        fetch(url,{
            credentials: "same-origin",
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+"messages/",
            body: data
        }).then(function(){
            makeban3(bname);
        });
    }

    function makeban3(bname){
        var url=domain+"roomban/"+bname+"/"+username+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,{
            credentials: "same-origin",
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+username+"/",
            body: data
        }).then(function(response){
            if (response.status !== 200) {
                alert("Error "+response.status);
                return;
            }
            response.json().then(function(data){
                banusers=localStorage.getItem("ignoredusers").split(",");
                banusers.push(bname);
                localStorage.setItem("ignoredusers",banusers.toString());
                setTimeout(function(){document.location.href=domain;},200);
            });
        });
    }
    function csCheck(model){
        if (csBusy){return;}
        csBusy=true;
        setCsStatus("");
        var scStatus="unkown";
        url="https://www.camsoda.com/api/v1/chat/react/"+model+"?"+new Date().getTime();
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    setCsStatus("error");
                    return;
                }
                var result=JSON.parse(response.responseText);
                scStatus=result.chat.status;
                if (scStatus=="online"){
                    scStatus="Online - playlist copied";
                    var playlist="https://"+result.stream.edge_servers[0]+"/"+result.stream.stream_name+"_v1/index.m3u8?token="+result.stream.token;
                    navigator.clipboard.writeText(playlist);
                }
                setCsStatus(scStatus);
            },
            ontimeout: function(){
                setCsStatus("Timeout error");
            }
        });
    }
    function setCsStatus(csStatus){
        document.getElementById("csStatus").innerHTML=" "+csStatus;
        setTimeout(function(){csBusy=false;},1000);
    }

    function scCheck(model){
        if (scBusy){return;}
        scBusy=true;
        setScStatus("");
        var scStatus="unkown";
        url="https://stripchat.com/api/front/v2/models/username/"+model+"/cam?"+new Date().getTime();
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    setScStatus("error");
                    return;
                }else{
                    var result=JSON.parse(response.responseText);
                    scStatus=result.user.user.status;
                    if (scStatus=="off"){
                        scStatus="Offline";
                    }
                    if (scStatus=="public"){
                        scStatus = "Online - playlist copied.";
                        var scId=result.user.user.id;
                        var playlist="https://edge-hls.growcdnssedge.com/hls/"+scId+"/master/"+scId+"_480p.m3u8";
                        navigator.clipboard.writeText(playlist);
                    }
                    setScStatus(scStatus);
                }
            },
            ontimeout: function(){
                setScStatus("Timeout error");
            }
        });
    }
    function setScStatus(scStatus){
        document.getElementById("scStatus").innerHTML=" "+scStatus;
        setTimeout(function(){scBusy=false;},1000);
    }

    function smCheck(model){
        if (smBusy){return;}
        smBusy=true;
        setSmStatus("");
        var smStatus="Error";
        url="https://manifest-server.naiadsystems.com/live/s:"+model+".json";
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    smStatus="Offline";
                }
                if (response.status == 403){
                    smStatus="Private";
                }
                if (response.status == 200){
                    smStatus="Online - playlist copied";
                    var result=JSON.parse(response.responseText);
                    var playlist=result.formats["mp4-hls"].manifest;
                    navigator.clipboard.writeText(playlist);
                }
                setSmStatus(smStatus);
            },
            ontimeout: function(){
                setSmStatus("Timeout error");
            }
        });
    }
    function setSmStatus(smStatus){
        document.getElementById("smStatus").innerHTML=" "+smStatus;
        setTimeout(function(){smBusy=false;},1000);
    }

    function bcCheck(model){
        if (bcBusy){return;}
        bcBusy=true;
        setBcStatus("");
        var bcStatus="Online - playlist copied";
        url="https://bongacams.com/tools/amf.php";
        GM_xmlhttpRequest({
            method: "POST",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            data: "method=getRoomData&args%5B%5D="+model+"&args%5B%5D=false&args%5B%5D=false",
            referrer: "https://bongacams.com/"+model,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
            },
            credentials: "omit",
            onload: function(response) {
                    if (response.status !== 200){
                        setBcStatus("Site error");
                        return;
                    }else{
                        var result=JSON.parse(response.responseText);
                         if (result.status=="error"){
                            setBcStatus("Model not found");
                            return;
                        }
                        var show=result.performerData.showType;
                        if (show!="public"){bcStatus="Private";}
                        if (show=="group"){bcStatus="Groupshow";}
                        if (result.performerData.isAway==true){bcStatus="Away";}
                        if (result.performerData.isOnline==false){bcStatus="Offline";}
                        if (bcStatus=="Online - playlist copied"){
                            var edge=result.localData.videoServerUrl;
                            var playlist="https:"+edge+"/hls/stream_"+result.performerData.displayName+"/playlist.m3u8";
                            navigator.clipboard.writeText(playlist);
                        }
                        setBcStatus(bcStatus);
                    }
            },
            ontimeout: function(){
                setBcStatus("Timeout error");
            }
        });
    }
    function setBcStatus(bcStatus){
        document.getElementById("bcStatus").innerHTML=" "+bcStatus;
        setTimeout(function(){bcBusy=false;},1000);
    }

    function c4Check(model){
        if (c4Busy){return;}
        c4Busy=true;
        setC4Status("");
        url="https://webchat.cam4.com/requestAccess?roomname="+model;
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    setC4Status("Error");
                    return;
                }
                var result=JSON.parse(response.responseText);
                if (result.status=="roomOffline"){
                    setC4Status("Offline");
                    return;
                }
                if (result.privateStream==true){
                    setC4Status("Private");
                    return;
                }
                getC4Video(model);
            },
            ontimeout: function(){
                setC4Status("Timeout error");
            }
        });
    }
    function setC4Status(c4Status){
        document.getElementById("c4Status").innerHTML=" "+c4Status;
        setTimeout(function(){c4Busy=false;},1000);
    }

    function getC4Video(model){
        url="https://cam4.com/rest/v1.0/profile/"+model+"/streamInfo";
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    setC4Status("Error");
                    return;
                }
                var result=JSON.parse(response.responseText);
                if (result.canUseCDN==false){
                    setC4Status("Private");
                    return;
                }
                if (!result.cdnURL){
                    setC4Status("Connecting");
                    return;
                }
                var playlist=result.cdnURL;
                navigator.clipboard.writeText(playlist);
                setC4Status("Online - playlist copied");
            },
            ontimeout: function(){
                setC4Status("Timeout error");
            }
        });

    }

    function mfcCheck(model){
        if (mfcBusy){return;}
        mfcBusy=true;
        setMfcStatus("");
        url="https://api-edge.myfreecams.com/usernameLookup/"+model;
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    setMfcStatus("Error");
                    return;
                }
                var result=JSON.parse(response.responseText);
                if (result.result.message != "user found"){
                    setMfcStatus("User not found");
                    return;
                }
                if (!result.result.user.sessions[0]){
                    setMfcStatus("Offline");
                    return;
                }

                var status=result.result.user.sessions[0].vstate;
                if (status==0){
                    var modelnr=result.result.user.id;
                    var videoserver=result.result.user.sessions[0].server_name;
                    var phase=result.result.user.sessions[0].phase;
                    getmfcvideo(modelnr,videoserver,phase);
                    return;
                }
                if (status==12){
                    setMfcStatus("Private");
                    return;
                }
                if (status==13){
                    setMfcStatus("Group show");
                    return;
                }
                if (status==14){
                    setMfcStatus("Clubshow");
                    return;
                }
                if (status==2){
                    setMfcStatus("Not broadcasting");
                    return;
                }
                if (status==90){
                    setMfcStatus("Online - webcam off");
                    return;
                }
                setMfcStatus("Unknown status "+status);

            },
            ontimeout: function(){
                setMfcStatus("Timeout error");
            }
        });
    }
    function setMfcStatus(mfcStatus){
        document.getElementById("mfcStatus").innerHTML=" "+mfcStatus;
        setTimeout(function(){mfcBusy=false;},1000);
    }
    function getmfcvideo(modelnr,videoserver,phase){
        modelnr=modelnr+100000000;
        var servernr=videoserver.split("ideo")[1];
        url="https://edgevideo.myfreecams.com/llhls/NxServer/"+servernr+"/ngrp:mfc_"+phase+modelnr+".f4v_cmaf/playlist.m3u8?nc=0.6190622874050598&v=1.97.23";
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    setMfcStatus("Connecting or away");
                    return;
                }
                data=response.responseText;
                var chunk="chunklist"+data.split("chunklist")[1].split("m3u8")[0]+"m3u8";
                var playlist="https://"+videoserver+".myfreecams.com/NxServer/ngrp:mfc_"+phase+modelnr+".f4v_cmaf/"+chunk+"?nc=0.813118007341&v=1.96";
                setMfcStatus("Online - playlist copied");
                navigator.clipboard.writeText(playlist);
            },
            ontimeout: function(){
                setMfcStatus("Timeout error");
            }
        });
    }

})();
