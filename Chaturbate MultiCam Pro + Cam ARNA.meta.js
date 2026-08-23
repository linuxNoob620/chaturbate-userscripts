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
