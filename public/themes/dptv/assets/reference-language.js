(function () {
  var LANGS = ["zh","zh-tw","en","es","pt","fr","de","ar","hi","id","th","vi","ko","ja","ru","tr","ms","bn","it"];
  var PACK = {
    download: {
      en:"Download", es:"Descargar", pt:"Baixar", fr:"Télécharger", de:"Herunterladen",
      ar:"تنزيل", hi:"डाउनलोड", id:"Unduh", th:"ดาวน์โหลด", vi:"Tải xuống",
      ko:"다운로드", ja:"ダウンロード", ru:"Скачать", tr:"İndir", ms:"Muat turun",
      bn:"ডাউনলোড", it:"Scarica", zh:"下载", "zh-tw":"下載"
    },
    download_now: {
      en:"Download Now", es:"Descargar ahora", pt:"Baixar agora", fr:"Télécharger maintenant", de:"Jetzt herunterladen",
      ar:"نزّل الآن", hi:"अभी डाउनलोड करें", id:"Unduh sekarang", th:"ดาวน์โหลดเลย", vi:"Tải ngay",
      ko:"지금 다운로드", ja:"今すぐダウンロード", ru:"Скачать сейчас", tr:"Şimdi indir", ms:"Muat turun sekarang",
      bn:"এখনই ডাউনলোড", it:"Scarica ora", zh:"立即下载", "zh-tw":"立即下載"
    },
    download_app: {
      en:"Download App", es:"Descargar app", pt:"Baixar app", fr:"Télécharger l'appli", de:"App herunterladen",
      ar:"تنزيل التطبيق", hi:"ऐप डाउनलोड करें", id:"Unduh aplikasi", th:"ดาวน์โหลดแอป", vi:"Tải ứng dụng",
      ko:"앱 다운로드", ja:"アプリをダウンロード", ru:"Скачать приложение", tr:"Uygulamayı indir", ms:"Muat turun aplikasi",
      bn:"অ্যাপ ডাউনলোড", it:"Scarica l'app", zh:"下载应用", "zh-tw":"下載應用"
    },
    download_apk: {
      en:"Download APK", es:"Descargar APK", pt:"Baixar APK", fr:"Télécharger l'APK", de:"APK herunterladen",
      ar:"تنزيل APK", hi:"APK डाउनलोड करें", id:"Unduh APK", th:"ดาวน์โหลด APK", vi:"Tải APK",
      ko:"APK 다운로드", ja:"APKをダウンロード", ru:"Скачать APK", tr:"APK indir", ms:"Muat turun APK",
      bn:"APK ডাউনলোড", it:"Scarica APK", zh:"下载 APK", "zh-tw":"下載 APK"
    },
    download_free: {
      en:"Download Free APK", es:"Descargar APK gratis", pt:"Baixar APK grátis", fr:"Télécharger l'APK gratuit", de:"Kostenlose APK",
      ar:"تنزيل APK مجاناً", hi:"मुफ़्त APK डाउनलोड", id:"Unduh APK gratis", th:"ดาวน์โหลด APK ฟรี", vi:"Tải APK miễn phí",
      ko:"무료 APK 다운로드", ja:"無料APKをダウンロード", ru:"Скачать APK бесплатно", tr:"Ücretsiz APK indir", ms:"Muat turun APK percuma",
      bn:"ফ্রি APK ডাউনলোড", it:"Scarica APK gratis", zh:"免费下载 APK", "zh-tw":"免費下載 APK"
    },
    install: {
      en:"Install", es:"Instalar", pt:"Instalar", fr:"Installer", de:"Installieren",
      ar:"تثبيت", hi:"इंस्टॉल", id:"Pasang", th:"ติดตั้ง", vi:"Cài đặt",
      ko:"설치", ja:"インストール", ru:"Установить", tr:"Yükle", ms:"Pasang",
      bn:"ইনস্টল", it:"Installa", zh:"安装", "zh-tw":"安裝"
    },
    install_open: {
      en:"Install & Open", es:"Instalar y abrir", pt:"Instalar e abrir", fr:"Installer et ouvrir", de:"Installieren und öffnen",
      ar:"تثبيت وفتح", hi:"इंस्टॉल करें और खोलें", id:"Pasang & buka", th:"ติดตั้งแล้วเปิด", vi:"Cài và mở",
      ko:"설치 후 열기", ja:"インストールして開く", ru:"Установить и открыть", tr:"Yükle ve aç", ms:"Pasang & buka",
      bn:"ইনস্টল ও খুলুন", it:"Installa e apri", zh:"安装并打开", "zh-tw":"安裝並開啟"
    },
    tap_download: {
      en:"Tap to download and continue", es:"Toca para descargar y continuar", pt:"Toque para baixar e continuar", fr:"Appuyez pour télécharger", de:"Tippen zum Herunterladen",
      ar:"اضغط للتنزيل والمتابعة", hi:"डाउनलोड करने के लिए टैप करें", id:"Ketuk untuk unduh dan lanjut", th:"แตะเพื่อดาวน์โหลด", vi:"Nhấn để tải và tiếp tục",
      ko:"탭하여 다운로드하고 계속", ja:"タップしてダウンロード", ru:"Нажмите, чтобы скачать", tr:"İndirmek için dokun", ms:"Ketik untuk muat turun",
      bn:"ডাউনলোড করতে ট্যাপ করুন", it:"Tocca per scaricare", zh:"点击下载并继续", "zh-tw":"點一下下載並繼續"
    },
    tap_install: {
      en:"tap anywhere to install", es:"toca para instalar", pt:"toque para instalar", fr:"appuyez pour installer", de:"tippen zum Installieren",
      ar:"اضغط في أي مكان للتثبيت", hi:"इंस्टॉल करने के लिए टैप करें", id:"ketuk di mana saja untuk pasang", th:"แตะที่ใดก็ได้เพื่อติดตั้ง", vi:"nhấn để cài đặt",
      ko:"아무 곳이나 탭하여 설치", ja:"タップしてインストール", ru:"нажмите для установки", tr:"yüklemek için dokun", ms:"ketik untuk pasang",
      bn:"ইনস্টল করতে ট্যাপ", it:"tocca per installare", zh:"点击任意处安装", "zh-tw":"點一下即可安裝"
    },
    get_app: {
      en:"Get the app", es:"Obtener la app", pt:"Baixar o app", fr:"Obtenir l'appli", de:"App holen",
      ar:"احصل على التطبيق", hi:"ऐप प्राप्त करें", id:"Dapatkan aplikasinya", th:"รับแอป", vi:"Tải ứng dụng",
      ko:"앱 받기", ja:"アプリを入手", ru:"Получить приложение", tr:"Uygulamayı al", ms:"Dapatkan aplikasi",
      bn:"অ্যাপ নিন", it:"Ottieni l'app", zh:"获取应用", "zh-tw":"取得應用"
    },
    free: {
      en:"Free", es:"Gratis", pt:"Grátis", fr:"Gratuit", de:"Kostenlos",
      ar:"مجاني", hi:"मुफ़्त", id:"Gratis", th:"ฟรี", vi:"Miễn phí",
      ko:"무료", ja:"無料", ru:"Бесплатно", tr:"Ücretsiz", ms:"Percuma",
      bn:"ফ্রি", it:"Gratis", zh:"免费", "zh-tw":"免費"
    },
    version: {
      en:"Version", es:"Versión", pt:"Versão", fr:"Version", de:"Version",
      ar:"الإصدار", hi:"संस्करण", id:"Versi", th:"เวอร์ชัน", vi:"Phiên bản",
      ko:"버전", ja:"バージョン", ru:"Версия", tr:"Sürüm", ms:"Versi",
      bn:"ভার্সন", it:"Versione", zh:"版本", "zh-tw":"版本"
    },
    size: {
      en:"Size", es:"Tamaño", pt:"Tamanho", fr:"Taille", de:"Größe",
      ar:"الحجم", hi:"आकार", id:"Ukuran", th:"ขนาด", vi:"Dung lượng",
      ko:"크기", ja:"サイズ", ru:"Размер", tr:"Boyut", ms:"Saiz",
      bn:"সাইজ", it:"Dimensione", zh:"大小", "zh-tw":"大小"
    },
    rating: {
      en:"Ratings", es:"Valoraciones", pt:"Avaliações", fr:"Notes", de:"Bewertungen",
      ar:"التقييمات", hi:"रेटिंग", id:"Peringkat", th:"คะแนน", vi:"Đánh giá",
      ko:"평점", ja:"評価", ru:"Оценки", tr:"Puan", ms:"Penilaian",
      bn:"রেটিং", it:"Valutazioni", zh:"评分", "zh-tw":"評分"
    },
    features: {
      en:"Features", es:"Funciones", pt:"Recursos", fr:"Fonctionnalités", de:"Funktionen",
      ar:"الميزات", hi:"विशेषताएँ", id:"Fitur", th:"ฟีเจอร์", vi:"Tính năng",
      ko:"기능", ja:"機能", ru:"Возможности", tr:"Özellikler", ms:"Ciri",
      bn:"ফিচার", it:"Funzioni", zh:"功能", "zh-tw":"功能"
    },
    how_to: {
      en:"How to use", es:"Cómo usar", pt:"Como usar", fr:"Comment utiliser", de:"So geht's",
      ar:"طريقة الاستخدام", hi:"कैसे इस्तेमाल करें", id:"Cara pakai", th:"วิธีใช้", vi:"Cách dùng",
      ko:"사용 방법", ja:"使い方", ru:"Как пользоваться", tr:"Nasıl kullanılır", ms:"Cara guna",
      bn:"কীভাবে ব্যবহার করবেন", it:"Come si usa", zh:"使用方法", "zh-tw":"使用方法"
    },
    install_guide: {
      en:"Installation Guide", es:"Guía de instalación", pt:"Guia de instalação", fr:"Guide d'installation", de:"Installationsanleitung",
      ar:"دليل التثبيت", hi:"इंस्टॉल गाइड", id:"Panduan pemasangan", th:"คู่มือติดตั้ง", vi:"Hướng dẫn cài đặt",
      ko:"설치 가이드", ja:"インストール手順", ru:"Инструкция по установке", tr:"Kurulum kılavuzu", ms:"Panduan pemasangan",
      bn:"ইনস্টল গাইড", it:"Guida all'installazione", zh:"安装指南", "zh-tw":"安裝指南"
    },
    unknown_src: {
      en:"Enable Unknown Sources", es:"Activar orígenes desconocidos", pt:"Ativar origens desconhecidas", fr:"Autoriser sources inconnues", de:"Unbekannte Quellen",
      ar:"السماح بالمصادر غير المعروفة", hi:"अज्ञात स्रोत चालू करें", id:"Izinkan sumber tidak dikenal", th:"อนุญาตแหล่งที่ไม่รู้จัก", vi:"Cho phép nguồn không xác định",
      ko:"알 수 없는 출처 허용", ja:"提供元不明のアプリを許可", ru:"Неизвестные источники", tr:"Bilinmeyen kaynaklar", ms:"Benarkan sumber tidak diketahui",
      bn:"অজানা উৎস চালু করুন", it:"Origini sconosciute", zh:"允许未知来源", "zh-tw":"允許未知來源"
    },
    step1: {
      en:"Step 1", es:"Paso 1", pt:"Passo 1", fr:"Étape 1", de:"Schritt 1",
      ar:"الخطوة 1", hi:"चरण 1", id:"Langkah 1", th:"ขั้นตอน 1", vi:"Bước 1",
      ko:"1단계", ja:"ステップ1", ru:"Шаг 1", tr:"1. Adım", ms:"Langkah 1",
      bn:"ধাপ ১", it:"Passo 1", zh:"第 1 步", "zh-tw":"步驟 1"
    },
    step2: {
      en:"Step 2", es:"Paso 2", pt:"Passo 2", fr:"Étape 2", de:"Schritt 2",
      ar:"الخطوة 2", hi:"चरण 2", id:"Langkah 2", th:"ขั้นตอน 2", vi:"Bước 2",
      ko:"2단계", ja:"ステップ2", ru:"Шаг 2", tr:"2. Adım", ms:"Langkah 2",
      bn:"ধাপ ২", it:"Passo 2", zh:"第 2 步", "zh-tw":"步驟 2"
    },
    step3: {
      en:"Step 3", es:"Paso 3", pt:"Passo 3", fr:"Étape 3", de:"Schritt 3",
      ar:"الخطوة 3", hi:"चरण 3", id:"Langkah 3", th:"ขั้นตอน 3", vi:"Bước 3",
      ko:"3단계", ja:"ステップ3", ru:"Шаг 3", tr:"3. Adım", ms:"Langkah 3",
      bn:"ধাপ ৩", it:"Passo 3", zh:"第 3 步", "zh-tw":"步驟 3"
    },
    step4: {
      en:"Step 4", es:"Paso 4", pt:"Passo 4", fr:"Étape 4", de:"Schritt 4",
      ar:"الخطوة 4", hi:"चरण 4", id:"Langkah 4", th:"ขั้นตอน 4", vi:"Bước 4",
      ko:"4단계", ja:"ステップ4", ru:"Шаг 4", tr:"4. Adım", ms:"Langkah 4",
      bn:"ধাপ ৪", it:"Passo 4", zh:"第 4 步", "zh-tw":"步驟 4"
    },
    faq: {
      en:"FAQ", es:"Preguntas", pt:"Perguntas", fr:"FAQ", de:"FAQ",
      ar:"أسئلة شائعة", hi:"सवाल-जवाब", id:"FAQ", th:"คำถามที่พบบ่อย", vi:"Hỏi đáp",
      ko:"자주 묻는 질문", ja:"よくある質問", ru:"Вопросы", tr:"SSS", ms:"Soalan lazim",
      bn:"প্রশ্নোত্তর", it:"FAQ", zh:"常见问题", "zh-tw":"常見問題"
    },
    home: {
      en:"Home", es:"Inicio", pt:"Início", fr:"Accueil", de:"Start",
      ar:"الرئيسية", hi:"होम", id:"Beranda", th:"หน้าแรก", vi:"Trang chủ",
      ko:"홈", ja:"ホーム", ru:"Главная", tr:"Ana sayfa", ms:"Laman utama",
      bn:"হোম", it:"Home", zh:"首页", "zh-tw":"首頁"
    },
    latest: {
      en:"Latest Version", es:"Última versión", pt:"Última versão", fr:"Dernière version", de:"Neueste Version",
      ar:"أحدث إصدار", hi:"नवीनतम संस्करण", id:"Versi terbaru", th:"เวอร์ชันล่าสุด", vi:"Bản mới nhất",
      ko:"최신 버전", ja:"最新バージョン", ru:"Последняя версия", tr:"Son sürüm", ms:"Versi terbaru",
      bn:"সর্বশেষ ভার্সন", it:"Ultima versione", zh:"最新版本", "zh-tw":"最新版本"
    },
    android: {
      en:"Android", es:"Android", pt:"Android", fr:"Android", de:"Android",
      ar:"أندرويد", hi:"Android", id:"Android", th:"Android", vi:"Android",
      ko:"Android", ja:"Android", ru:"Android", tr:"Android", ms:"Android",
      bn:"Android", it:"Android", zh:"安卓", "zh-tw":"安卓"
    },
    continue_btn: {
      en:"Continue", es:"Continuar", pt:"Continuar", fr:"Continuer", de:"Weiter",
      ar:"متابعة", hi:"जारी रखें", id:"Lanjut", th:"ดำเนินการต่อ", vi:"Tiếp tục",
      ko:"계속", ja:"続ける", ru:"Продолжить", tr:"Devam", ms:"Teruskan",
      bn:"চালিয়ে যান", it:"Continua", zh:"继续", "zh-tw":"繼續"
    },
    update: {
      en:"Update", es:"Actualizar", pt:"Atualizar", fr:"Mettre à jour", de:"Aktualisieren",
      ar:"تحديث", hi:"अपडेट", id:"Perbarui", th:"อัปเดต", vi:"Cập nhật",
      ko:"업데이트", ja:"更新", ru:"Обновить", tr:"Güncelle", ms:"Kemas kini",
      bn:"আপডেট", it:"Aggiorna", zh:"更新", "zh-tw":"更新"
    },
    allow_install: {
      en:"Allow Install", es:"Permitir instalación", pt:"Permitir instalação", fr:"Autoriser l'installation", de:"Installation erlauben",
      ar:"السماح بالتثبيت", hi:"इंस्टॉल की अनुमति दें", id:"Izinkan pemasangan", th:"อนุญาตให้ติดตั้ง", vi:"Cho phép cài đặt",
      ko:"설치 허용", ja:"インストールを許可", ru:"Разрешить установку", tr:"Yüklemeye izin ver", ms:"Benarkan pemasangan",
      bn:"ইনস্টল অনুমতি", it:"Consenti installazione", zh:"允许安装", "zh-tw":"允許安裝"
    }
  };

  var ALIAS = {
    "download":"download","télécharger":"download","descargar":"download","baixar":"download",
    "herunterladen":"download","indir":"download","unduh":"download","muat turun":"download",
    "下载":"download","下載":"download","下载应用":"download_app","下載應用":"download_app",
    "download now":"download_now","download app":"download_app","download apk":"download_apk",
    "download free apk":"download_free","descargar apk":"download_apk","descargar gratis":"download_free",
    "descargar ahora":"download_now","baixar agora":"download_now","unduh sekarang":"download_now",
    "download android version":"download_apk","apk download":"download_apk",
    "▶ download tik apk":"download_apk","fast android apk download":"download_apk",
    "free android apk download":"download_apk","high-speed download":"download",
    "alternative download":"download","android download":"download_apk","huawei download":"download",
    "download free for android":"download_free","download and install":"install",
    "download to continue":"tap_download","tap to download and continue":"tap_download",
    "go to downloading page...":"download_now","go to downloading page":"download_now",
    "install":"install","installer":"install","instalar":"install","pasang":"install",
    "installieren":"install","yükle":"install","安装":"install","安裝":"install",
    "install & open":"install_open","install &amp; open":"install_open",
    "install & launch":"install_open","allow install":"allow_install",
    "tap anywhere to install":"tap_install","watch install tutorial":"install_guide",
    "installation guide":"install_guide","quick install guide":"install_guide",
    "enable unknown sources":"unknown_src","unknown sources":"unknown_src",
    "install unknown apps":"unknown_src","get the app":"get_app","get app":"get_app",
    "free":"free","gratis":"free","gratuit":"free","version":"version","versión":"version",
    "size":"size","features":"features","faq":"faq","home":"home","inicio":"home",
    "latest version":"latest","continue":"continue_btn","update":"update",
    "ratings":"rating","how to use":"how_to","step 1":"step1","step 2":"step2",
    "step 3":"step3","step 4":"step4","ดาวน์โหลด":"download","ติดตั้ง":"install",
    "unduh aplikasi":"download_app","télécharger l'application":"download_app",
    "ดาวน์โหลดเลย":"download_now","立即下载":"download_now","立即下載":"download_now",
    "点击下载并继续":"tap_download"
  };

  function detectLang(hint) {
    var raw = (hint || navigator.language || navigator.userLanguage || "en").toString().toLowerCase();
    if (raw.indexOf("zh-tw") === 0 || raw.indexOf("zh-hant") === 0 || raw.indexOf("zh-hk") === 0) return "zh-tw";
    var two = raw.slice(0, 2);
    if (two === "zh") return "zh";
    if (LANGS.indexOf(two) >= 0) return two;
    return "en";
  }

  function t(key, lang) {
    var row = PACK[key];
    if (!row) return "";
    return row[lang] || row.en || "";
  }

  function lookupKey(text) {
    var n = (text || "").replace(/\s+/g, " ").trim();
    if (!n) return "";
    var low = n.toLowerCase();
    if (ALIAS[low]) return ALIAS[low];
    if (ALIAS[n]) return ALIAS[n];
    return "";
  }

  function norm(s) {
    return (s || "").replace(/\s+/g, " ").trim();
  }

  function skipText(s) {
    if (!s || s.length <= 1) return true;
    if (/^[\d\s.,:%+\-_/|#$@*]+$/.test(s)) return true;
    if (/^https?:\/\//i.test(s)) return true;
    return false;
  }

  function translateText(mid, lang, map) {
    var cfg = window.LANDING_CFG || {};
    if (cfg.appName && mid === cfg.appName) return mid;
    if (map && map[mid]) return map[mid];
    if (map && map[mid.toLowerCase()]) return map[mid.toLowerCase()];
    var key = lookupKey(mid);
    if (key) {
      var tr = t(key, lang);
      if (tr) return tr;
    }
    var next = mid;
    Object.keys(ALIAS).sort(function (a, b) { return b.length - a.length; }).forEach(function (alias) {
      if (alias.length < 4) return;
      var k = ALIAS[alias];
      var tr = t(k, lang);
      if (!tr) return;
      var re = new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
      next = next.replace(re, tr);
    });
    return next;
  }

  function applyLang(lang, map) {
    map = map || window.LP_I18N_MAP || {};
    window.LP_I18N_MAP = map;
    window.LP_I18N_LANG = lang;
    document.documentElement.lang = lang === "zh-tw" ? "zh-Hant" : lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    if (lang === "ar") document.body && (document.body.style.direction = "rtl");

    var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var n;
    while ((n = walk.nextNode())) {
      var p = n.parentElement;
      if (p && /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(p.tagName)) continue;
      nodes.push(n);
    }
    nodes.forEach(function (node) {
      var raw = node.nodeValue;
      if (!raw || !raw.trim()) return;
      var lead = raw.match(/^\s*/)[0];
      var tail = raw.match(/\s*$/)[0];
      var mid = raw.slice(lead.length, raw.length - tail.length);
      if (skipText(mid)) return;
      if (!node.lpSrc) node.lpSrc = mid;
      var tr = translateText(node.lpSrc, lang, map);
      if (tr && tr !== node.nodeValue.slice(lead.length, raw.length - tail.length)) {
        node.nodeValue = lead + tr + tail;
      } else if (tr && tr !== node.lpSrc) {
        node.nodeValue = lead + tr + tail;
      }
    });

    document.querySelectorAll("input, button, textarea, [placeholder], [title], [aria-label], img[alt]").forEach(function (el) {
      ["value", "placeholder", "aria-label", "title", "alt"].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (!v || skipText(v)) return;
        var key = "lpSrc_" + attr;
        if (!el[key]) el[key] = v;
        var tr = translateText(el[key], lang, map);
        if (tr && tr !== v) el.setAttribute(attr, tr);
      });
    });
  }

  function missingTexts(lang, map) {
    map = map || window.LP_I18N_MAP || {};
    var need = [];
    var seen = {};
    var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walk.nextNode())) {
      var src = node.lpSrc || norm(node.nodeValue);
      if (skipText(src) || seen[src]) continue;
      if (map[src] || lookupKey(src)) continue;
      if (translateText(src, lang, map) !== src) continue;
      seen[src] = 1;
      need.push(src);
    }
    return need;
  }

  function fillMissing(lang, map, done) {
    if (done) done(map || {});
  }

  window.LP_I18N = {
    detect: detectLang,
    apply: applyLang,
    fill: fillMissing,
    missing: missingTexts,
    t: t
  };
})();
