(function(){
"use strict";
var languages=[
{code:"en",name:"English",flag:null},
{code:"zh-CN",name:"简体中文",flag:null},
{code:"zh-TW",name:"繁體中文",flag:null},
{code:"es",name:"Español",flag:null},
{code:"fr",name:"Français",flag:null},
{code:"de",name:"Deutsch",flag:null},
{code:"ja",name:"日本語",flag:null},
{code:"ko",name:"한국어",flag:null},
{code:"pt",name:"Português",flag:null},
{code:"it",name:"Italiano",flag:null},
{code:"ru",name:"Русский",flag:null},
{code:"ar",name:"العربية",flag:null},
{code:"hi",name:"हिन्दी",flag:null},
{code:"id",name:"Bahasa Indonesia",flag:null},
{code:"th",name:"ไทย",flag:null},
{code:"vi",name:"Tiếng Việt",flag:null},
{code:"tr",name:"Türkçe",flag:null},
{code:"nl",name:"Nederlands",flag:null},
{code:"pl",name:"Polski",flag:null},
{code:"sv",name:"Svenska",flag:null},
{code:"da",name:"Dansk",flag:null},
{code:"fi",name:"Suomi",flag:null}
];
var GLOBE='<svg class="rs-flag-globe" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.6" stroke="currentColor" stroke-width="1.7"/><path d="M3.4 12h17.2M12 3.4c2.4 2.5 2.4 14.7 0 17.2M12 3.4c-2.4 2.5-2.4 14.7 0 17.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
var CHECK='<svg class="rs-i18n-check" viewBox="0 0 24 24" fill="none"><path d="M5 12.6 9.6 17 19 7.6" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var translations={
"en":{"menu.title":"Select Language",
"nav.home":"Home","nav.categories":"Categories","nav.fandom":"Fandom","nav.brand":"Brand","common.viewAll":"View all",
"sec.new":"New Release","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Hidden Identity 🎭","sec.love":"Love at First Sight 💘","sec.baby":"Pregnancy & Babies 🍼","sec.interact":"ReelShort Interactives 💕","sec.talk":"ReelTalk 🎤","sec.second":"Second Chance 💫","sec.young":"Young Love ❤",
"app.download":"Download","app.unlock":"Unlock Episodes Free Only in APP",
"cookie.title":"Cookie","cookie.accept":"Accept All",
"footer.about":"ABOUT","footer.support":"SUPPORT","footer.terms":"Terms of Service","footer.privacy":"Privacy Policy","footer.contact":"Contact Us","footer.feedback":"Feedback","footer.media":"Media & Public Relations","footer.cookiePolicy":"Cookie Policies","footer.rights":"© 2026 Crazy Maple Studio™, Inc. All Rights Reserved.",
"aria.search":"Search",
"seo.title":"ReelShort: Every Second Is Drama",
"seo.desc":"Dive into ReelShort, your must-watch online theater for HD short dramas and vertical stories. From werewolf and billionaire romances to mafia tales and campus love, we've got your quick fix for movies and TV series."},
"zh-CN":{"menu.title":"选择语言",
"nav.home":"首页","nav.categories":"分类","nav.fandom":"Fandom","nav.brand":"品牌","common.viewAll":"查看全部",
"sec.new":"新片上映","sec.top":"排行榜","sec.original":"Reel原创 🌏","sec.hidden":"隐藏身份 🎭","sec.love":"一见钟情 💘","sec.baby":"怀孕育儿 🍼","sec.interact":"ReelShort互动剧 💕","sec.talk":"ReelTalk 🎤","sec.second":"二次心动 💫","sec.young":"年少之恋 ❤",
"app.download":"下载","app.unlock":"仅在 App 内免费解锁剧集",
"cookie.title":"Cookie","cookie.accept":"全部接受",
"footer.about":"关于","footer.support":"支持","footer.terms":"服务条款","footer.privacy":"隐私政策","footer.contact":"联系我们","footer.feedback":"意见反馈","footer.media":"媒体与公关","footer.cookiePolicy":"Cookie 政策","footer.rights":"© 2026 Crazy Maple Studio™, Inc. 保留所有权利。",
"aria.search":"搜索",
"seo.title":"ReelShort：每一秒都精彩",
"seo.desc":"欢迎来到 ReelShort，在线畅享高清竖屏短剧：狼人、亿万富翁、黑帮、校园恋爱等热门题材应有尽有，随时随地看大片。"},
"zh-TW":{"menu.title":"選擇語言",
"nav.home":"首頁","nav.categories":"分類","nav.fandom":"Fandom","nav.brand":"品牌","common.viewAll":"查看全部",
"sec.new":"新片上映","sec.top":"排行榜","sec.original":"Reel原創 🌏","sec.hidden":"隱藏身分 🎭","sec.love":"一見鍾情 💘","sec.baby":"懷孕育兒 🍼","sec.interact":"ReelShort互動劇 💕","sec.talk":"ReelTalk 🎤","sec.second":"二次心動 💫","sec.young":"年少之戀 ❤",
"app.download":"下載","app.unlock":"僅在 App 內免費解鎖劇集",
"cookie.title":"Cookie","cookie.accept":"全部接受",
"footer.about":"關於","footer.support":"支援","footer.terms":"服務條款","footer.privacy":"隱私權政策","footer.contact":"聯絡我們","footer.feedback":"意見回饋","footer.media":"媒體與公關","footer.cookiePolicy":"Cookie 政策","footer.rights":"© 2026 Crazy Maple Studio™, Inc. 保留所有權利。",
"aria.search":"搜尋",
"seo.title":"ReelShort：每一秒都精彩",
"seo.desc":"歡迎來到 ReelShort，線上暢享高清直式短劇：狼人、億萬富翁、黑幫、校園戀愛等熱門題材應有盡有，隨時隨地看大片。"},
"es":{"menu.title":"Seleccionar idioma",
"nav.home":"Inicio","nav.categories":"Categorías","nav.fandom":"Fandom","nav.brand":"Marca","common.viewAll":"Ver todo",
"sec.new":"Nuevos lanzamientos","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Identidad oculta 🎭","sec.love":"Amor a primera vista 💘","sec.baby":"Embarazo y bebés 🍼","sec.interact":"ReelShort Interactivos 💕","sec.talk":"ReelTalk 🎤","sec.second":"Segunda oportunidad 💫","sec.young":"Amor joven ❤",
"app.download":"Descargar","app.unlock":"Desbloquea episodios gratis solo en la app",
"cookie.title":"Cookies","cookie.accept":"Aceptar todo",
"footer.about":"ACERCA DE","footer.support":"SOPORTE","footer.terms":"Términos del servicio","footer.privacy":"Política de privacidad","footer.contact":"Contáctanos","footer.feedback":"Comentarios","footer.media":"Medios y relaciones públicas","footer.cookiePolicy":"Política de cookies","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Todos los derechos reservados.",
"aria.search":"Buscar",
"seo.title":"ReelShort: Cada segundo es drama",
"seo.desc":"Disfruta de ReelShort, tu cine online de minidramas verticales en HD: romances de hombres lobo y multimillonarios, historias de la mafia y amor universitario."},
"fr":{"menu.title":"Choisir la langue",
"nav.home":"Accueil","nav.categories":"Catégories","nav.fandom":"Fandom","nav.brand":"Marque","common.viewAll":"Voir tout",
"sec.new":"Nouveautés","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Identité secrète 🎭","sec.love":"Amour au premier regard 💘","sec.baby":"Grossesse et bébés 🍼","sec.interact":"ReelShort Interactifs 💕","sec.talk":"ReelTalk 🎤","sec.second":"Seconde chance 💫","sec.young":"Amour de jeunesse ❤",
"app.download":"Télécharger","app.unlock":"Débloquez des épisodes gratuitement uniquement dans l'appli",
"cookie.title":"Cookies","cookie.accept":"Tout accepter",
"footer.about":"À PROPOS","footer.support":"ASSISTANCE","footer.terms":"Conditions d'utilisation","footer.privacy":"Politique de confidentialité","footer.contact":"Nous contacter","footer.feedback":"Commentaires","footer.media":"Médias et relations publiques","footer.cookiePolicy":"Politique relative aux cookies","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Tous droits réservés.",
"aria.search":"Rechercher",
"seo.title":"ReelShort : Chaque seconde est un drame",
"seo.desc":"Plongez dans ReelShort, votre plateforme de mini-séries verticales HD : loups-garous, milliardaires, mafia et amours universitaires."},
"de":{"menu.title":"Sprache wählen",
"nav.home":"Startseite","nav.categories":"Kategorien","nav.fandom":"Fandom","nav.brand":"Marke","common.viewAll":"Alle ansehen",
"sec.new":"Neuerscheinungen","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Verborgene Identität 🎭","sec.love":"Liebe auf den ersten Blick 💘","sec.baby":"Schwangerschaft & Babys 🍼","sec.interact":"ReelShort Interaktives 💕","sec.talk":"ReelTalk 🎤","sec.second":"Zweite Chance 💫","sec.young":"Junge Liebe ❤",
"app.download":"Herunterladen","app.unlock":"Episoden nur in der App kostenlos freischalten",
"cookie.title":"Cookies","cookie.accept":"Alle akzeptieren",
"footer.about":"ÜBER UNS","footer.support":"SUPPORT","footer.terms":"Nutzungsbedingungen","footer.privacy":"Datenschutzrichtlinie","footer.contact":"Kontaktiere uns","footer.feedback":"Feedback","footer.media":"Medien & Öffentlichkeitsarbeit","footer.cookiePolicy":"Cookie-Richtlinien","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Alle Rechte vorbehalten.",
"aria.search":"Suche",
"seo.title":"ReelShort: Jede Sekunde ein Drama",
"seo.desc":"Erlebe ReelShort, dein Online-Kino für kurze vertikale HD-Dramen: Werwölfe, Milliardäre, Mafia und Campus-Liebe."},
"ja":{"menu.title":"言語を選択",
"nav.home":"ホーム","nav.categories":"カテゴリー","nav.fandom":"Fandom","nav.brand":"ブランド","common.viewAll":"すべて見る",
"sec.new":"新着リリース","sec.top":"TOP","sec.original":"Reelオリジナル 🌏","sec.hidden":"正体不明 🎭","sec.love":"一目惚れ 💘","sec.baby":"妊娠＆ベビー 🍼","sec.interact":"ReelShortインタラクティブ 💕","sec.talk":"ReelTalk 🎤","sec.second":"やり直しの恋 💫","sec.young":"若き恋 ❤",
"app.download":"ダウンロード","app.unlock":"本編無料解放はアプリのみ",
"cookie.title":"Cookie","cookie.accept":"すべて同意",
"footer.about":"概要","footer.support":"サポート","footer.terms":"利用規約","footer.privacy":"プライバシーポリシー","footer.contact":"お問い合わせ","footer.feedback":"ご意見・ご要望","footer.media":"メディア＆広報","footer.cookiePolicy":"Cookieポリシー","footer.rights":"© 2026 Crazy Maple Studio™, Inc. All rights reserved.",
"aria.search":"検索",
"seo.title":"ReelShort：一瞬一瞬がドラマ",
"seo.desc":"ReelShortは、縦型HDショートドラマのオンラインシアター。人狼や億万長者、マフィア、キャンパスラブなど人気作品が満載。"},
"ko":{"menu.title":"언어 선택",
"nav.home":"홈","nav.categories":"카테고리","nav.fandom":"Fandom","nav.brand":"브랜드","common.viewAll":"전체 보기",
"sec.new":"신규 출시","sec.top":"TOP","sec.original":"Reel 오리지널 🌏","sec.hidden":"숨겨진 정체 🎭","sec.love":"첫눈에 반한 사랑 💘","sec.baby":"임신&베이비 🍼","sec.interact":"ReelShort 인터랙티브 💕","sec.talk":"ReelTalk 🎤","sec.second":"두 번째 기회 💫","sec.young":"어린 시절의 사랑 ❤",
"app.download":"다운로드","app.unlock":"회차 무료 잠금 해제는 앱에서만",
"cookie.title":"Cookie","cookie.accept":"모두 허용",
"footer.about":"정보","footer.support":"지원","footer.terms":"이용약관","footer.privacy":"개인정보 처리방침","footer.contact":"문의하기","footer.feedback":"피드백","footer.media":"미디어&홍보","footer.cookiePolicy":"쿠키 정책","footer.rights":"© 2026 Crazy Maple Studio™, Inc. All rights reserved.",
"aria.search":"검색",
"seo.title":"ReelShort: 1초마다 드라마",
"seo.desc":"ReelShort에서 늑대인간, 억만장자, 마피아, 캠퍼스 로맨스 등 HD 세로형 숏드라마를 마음껏 즐겨보세요."},
"pt":{"menu.title":"Selecionar idioma",
"nav.home":"Início","nav.categories":"Categorias","nav.fandom":"Fandom","nav.brand":"Marca","common.viewAll":"Ver tudo",
"sec.new":"Novos lançamentos","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Identidade oculta 🎭","sec.love":"Amor à primeira vista 💘","sec.baby":"Gravidez e bebês 🍼","sec.interact":"ReelShort Interativos 💕","sec.talk":"ReelTalk 🎤","sec.second":"Segunda chance 💫","sec.young":"Amor jovem ❤",
"app.download":"Baixar","app.unlock":"Desbloqueie episódios grátis somente no app",
"cookie.title":"Cookies","cookie.accept":"Aceitar tudo",
"footer.about":"SOBRE","footer.support":"SUPORTE","footer.terms":"Termos de Serviço","footer.privacy":"Política de Privacidade","footer.contact":"Fale conosco","footer.feedback":"Comentários","footer.media":"Mídia e Relações Públicas","footer.cookiePolicy":"Política de Cookies","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Todos os direitos reservados.",
"aria.search":"Pesquisar",
"seo.title":"ReelShort: Cada Segundo É Drama",
"seo.desc":"Mergulhe na ReelShort, seu cinema online de minidramas verticais em HD: lobisomens, bilionários, máfia e amor no campus."},
"it":{"menu.title":"Seleziona lingua",
"nav.home":"Home","nav.categories":"Categorie","nav.fandom":"Fandom","nav.brand":"Brand","common.viewAll":"Vedi tutto",
"sec.new":"Nuove uscite","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Identità nascosta 🎭","sec.love":"Amore a prima vista 💘","sec.baby":"Gravidanza e bebè 🍼","sec.interact":"ReelShort Interattivi 💕","sec.talk":"ReelTalk 🎤","sec.second":"Seconda possibilità 💫","sec.young":"Amore giovane ❤",
"app.download":"Scarica","app.unlock":"Sblocca episodi gratis solo nell'app",
"cookie.title":"Cookie","cookie.accept":"Accetta tutto",
"footer.about":"INFORMAZIONI","footer.support":"SUPPORTO","footer.terms":"Termini di servizio","footer.privacy":"Informativa sulla privacy","footer.contact":"Contattaci","footer.feedback":"Feedback","footer.media":"Media e pubbliche relazioni","footer.cookiePolicy":"Politica sui cookie","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Tutti i diritti riservati.",
"aria.search":"Cerca",
"seo.title":"ReelShort: Ogni secondo è dramma",
"seo.desc":"Scopri ReelShort, il tuo cinema online di mini-drammi verticali in HD: lupi mannari, miliardari, mafia e amori universitari."},
"ru":{"menu.title":"Выберите язык",
"nav.home":"Главная","nav.categories":"Категории","nav.fandom":"Fandom","nav.brand":"Бренд","common.viewAll":"Смотреть все",
"sec.new":"Новинки","sec.top":"ТОП","sec.original":"Reel Original 🌏","sec.hidden":"Тайная личность 🎭","sec.love":"Любовь с первого взгляда 💘","sec.baby":"Беременность и дети 🍼","sec.interact":"ReelShort Интерактив 💕","sec.talk":"ReelTalk 🎤","sec.second":"Второй шанс 💫","sec.young":"Юная любовь ❤",
"app.download":"Скачать","app.unlock":"Бесплатно открывайте серии только в приложении",
"cookie.title":"Cookie","cookie.accept":"Принять все",
"footer.about":"О НАС","footer.support":"ПОДДЕРЖКА","footer.terms":"Условия использования","footer.privacy":"Политика конфиденциальности","footer.contact":"Связаться с нами","footer.feedback":"Отзывы","footer.media":"СМИ и связи с общественностью","footer.cookiePolicy":"Политика использования cookie","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Все права защищены.",
"aria.search":"Поиск",
"seo.title":"ReelShort: Каждая секунда — драма",
"seo.desc":"ReelShort — ваш онлайн-кинотеатр вертикальных HD-сериалов: оборотни, миллиардеры, мафия и студенческая любовь."},
"ar":{"menu.title":"اختر اللغة",
"nav.home":"الرئيسية","nav.categories":"الفئات","nav.fandom":"Fandom","nav.brand":"العلامة التجارية","common.viewAll":"عرض الكل",
"sec.new":"أحدث الإصدارات","sec.top":"الأفضل","sec.original":"Reel Original 🌏","sec.hidden":"هوية خفية 🎭","sec.love":"حب من النظرة الأولى 💘","sec.baby":"الحمل والأطفال 🍼","sec.interact":"ReelShort تفاعلي 💕","sec.talk":"ReelTalk 🎤","sec.second":"فرصة ثانية 💫","sec.young":"حب الشباب ❤",
"app.download":"تنزيل","app.unlock":"افتح الحلقات مجانًا داخل التطبيق فقط",
"cookie.title":"Cookie","cookie.accept":"قبول الكل",
"footer.about":"حول","footer.support":"الدعم","footer.terms":"شروط الخدمة","footer.privacy":"سياسة الخصوصية","footer.contact":"اتصل بنا","footer.feedback":"ملاحظات","footer.media":"الإعلام والعلاقات العامة","footer.cookiePolicy":"سياسات Cookie","footer.rights":"© 2026 Crazy Maple Studio™, Inc. جميع الحقوق محفوظة.",
"aria.search":"بحث",
"seo.title":"ReelShort: كل ثانية دراما",
"seo.desc":"استمتع بـ ReelShort، مسرحك الإلكتروني للدراما القصيرة العمودية بجودة HD: قصص المستذئبين والمليارديرات والمافيا وحب الجامعة."},
"hi":{"menu.title":"भाषा चुनें",
"nav.home":"होम","nav.categories":"श्रेणियां","nav.fandom":"Fandom","nav.brand":"ब्रांड","common.viewAll":"सभी देखें",
"sec.new":"नई रिलीज़","sec.top":"टॉप","sec.original":"Reel Original 🌏","sec.hidden":"छिपी पहचान 🎭","sec.love":"पहली नज़र का प्यार 💘","sec.baby":"प्रेग्नेंसी और शिशु 🍼","sec.interact":"ReelShort इंटरैक्टिव 💕","sec.talk":"ReelTalk 🎤","sec.second":"दूसरा मौका 💫","sec.young":"युवा प्रेम ❤",
"app.download":"डाउनलोड","app.unlock":"ऐप में ही एपिसोड मुफ़्त अनलॉक करें",
"cookie.title":"Cookie","cookie.accept":"सभी स्वीकार करें",
"footer.about":"हमारे बारे में","footer.support":"सहायता","footer.terms":"सेवा की शर्तें","footer.privacy":"गोपनीयता नीति","footer.contact":"हमसे संपर्क करें","footer.feedback":"फ़ीडबैक","footer.media":"मीडिया और जनसंपर्क","footer.cookiePolicy":"Cookie नीतियां","footer.rights":"© 2026 Crazy Maple Studio™, Inc. सर्वाधिकार सुरक्षित।",
"aria.search":"खोजें",
"seo.title":"ReelShort: हर सेकंड ड्रामा",
"seo.desc":"ReelShort में डूब जाएं — HD वर्टिकल शॉर्ट ड्रामा का ऑनलाइन थिएटर: वेयरवुल्फ़, अरबपति, माफ़िया और कैंपस प्रेम कहानियां।"},
"id":{"menu.title":"Pilih bahasa",
"nav.home":"Beranda","nav.categories":"Kategori","nav.fandom":"Fandom","nav.brand":"Merek","common.viewAll":"Lihat semua",
"sec.new":"Rilis Baru","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Identitas Tersembunyi 🎭","sec.love":"Cinta pada Pandangan Pertama 💘","sec.baby":"Kehamilan & Bayi 🍼","sec.interact":"ReelShort Interaktif 💕","sec.talk":"ReelTalk 🎤","sec.second":"Kesempatan Kedua 💫","sec.young":"Cinta Muda ❤",
"app.download":"Unduh","app.unlock":"Buka episode gratis hanya di Aplikasi",
"cookie.title":"Cookie","cookie.accept":"Terima semua",
"footer.about":"TENTANG","footer.support":"DUKUNGAN","footer.terms":"Ketentuan Layanan","footer.privacy":"Kebijakan Privasi","footer.contact":"Hubungi Kami","footer.feedback":"Masukan","footer.media":"Media & Humas","footer.cookiePolicy":"Kebijakan Cookie","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Semua hak dilindungi.",
"aria.search":"Cari",
"seo.title":"ReelShort: Setiap Detik Adalah Drama",
"seo.desc":"Selami ReelShort, bioskop online untuk drama pendek vertikal HD: werewolf, miliarder, mafia, dan cinta kampus."},
"th":{"menu.title":"เลือกภาษา",
"nav.home":"หน้าแรก","nav.categories":"หมวดหมู่","nav.fandom":"Fandom","nav.brand":"แบรนด์","common.viewAll":"ดูทั้งหมด",
"sec.new":"ออกใหม่","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"ตัวตนที่ซ่อนอยู่ 🎭","sec.love":"รักแรกพบ 💘","sec.baby":"การตั้งครรภ์และทารก 🍼","sec.interact":"ReelShort อินเทอร์แอกทีฟ 💕","sec.talk":"ReelTalk 🎤","sec.second":"รักครั้งที่สอง 💫","sec.young":"รักวัยเยาว์ ❤",
"app.download":"ดาวน์โหลด","app.unlock":"ปลดล็อกตอนฟรีเฉพาะในแอปเท่านั้น",
"cookie.title":"Cookie","cookie.accept":"ยอมรับทั้งหมด",
"footer.about":"เกี่ยวกับ","footer.support":"ฝ่ายสนับสนุน","footer.terms":"ข้อกำหนดการให้บริการ","footer.privacy":"นโยบายความเป็นส่วนตัว","footer.contact":"ติดต่อเรา","footer.feedback":"ข้อเสนอแนะ","footer.media":"สื่อและประชาสัมพันธ์","footer.cookiePolicy":"นโยบาย Cookie","footer.rights":"© 2026 Crazy Maple Studio™, Inc. สงวนลิขสิทธิ์",
"aria.search":"ค้นหา",
"seo.title":"ReelShort: ทุกวินาทีคือดราม่า",
"seo.desc":"ดื่มด่ำกับ ReelShort โรงละครออนไลน์สำหรับซีรีส์สั้นแนวตั้งระดับ HD: มนุษย์หมาป่า มหาเศรษฐี มาเฟีย และความรักในวิทยาเขต"},
"vi":{"menu.title":"Chọn ngôn ngữ",
"nav.home":"Trang chủ","nav.categories":"Thể loại","nav.fandom":"Fandom","nav.brand":"Thương hiệu","common.viewAll":"Xem tất cả",
"sec.new":"Mới phát hành","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Danh tính ẩn 🎭","sec.love":"Yêu từ cái nhìn đầu tiên 💘","sec.baby":"Mang thai & Em bé 🍼","sec.interact":"ReelShort Tương tác 💕","sec.talk":"ReelTalk 🎤","sec.second":"Cơ hội thứ hai 💫","sec.young":"Tình yêu tuổi trẻ ❤",
"app.download":"Tải xuống","app.unlock":"Mở khóa tập phim miễn phí chỉ trên Ứng dụng",
"cookie.title":"Cookie","cookie.accept":"Chấp nhận tất cả",
"footer.about":"GIỚI THIỆU","footer.support":"HỖ TRỢ","footer.terms":"Điều khoản dịch vụ","footer.privacy":"Chính sách quyền riêng tư","footer.contact":"Liên hệ với chúng tôi","footer.feedback":"Phản hồi","footer.media":"Truyền thông & Quan hệ công chúng","footer.cookiePolicy":"Chính sách Cookie","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Bảo lưu mọi quyền.",
"aria.search":"Tìm kiếm",
"seo.title":"ReelShort: Mỗi giây đều là drama",
"seo.desc":"Khám phá ReelShort, rạp phim trực tuyến các bộ drama ngắn dọc HD: người sói, tỷ phú, mafia và tình yêu học đường."},
"tr":{"menu.title":"Dil seç",
"nav.home":"Ana Sayfa","nav.categories":"Kategoriler","nav.fandom":"Fandom","nav.brand":"Marka","common.viewAll":"Tümünü gör",
"sec.new":"Yeni Çıkanlar","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Gizli Kimlik 🎭","sec.love":"İlk Bakışta Aşk 💘","sec.baby":"Hamilelik ve Bebekler 🍼","sec.interact":"ReelShort Etkileşimli 💕","sec.talk":"ReelTalk 🎤","sec.second":"İkinci Şans 💫","sec.young":"Gençlik Aşkı ❤",
"app.download":"İndir","app.unlock":"Bölümleri yalnızca Uygulamada ücretsiz aç",
"cookie.title":"Cookie","cookie.accept":"Tümünü kabul et",
"footer.about":"HAKKINDA","footer.support":"DESTEK","footer.terms":"Hizmet Şartları","footer.privacy":"Gizlilik Politikası","footer.contact":"Bize Ulaşın","footer.feedback":"Geri Bildirim","footer.media":"Medya ve Halkla İlişkiler","footer.cookiePolicy":"Cookie Politikaları","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Tüm hakları saklıdır.",
"aria.search":"Ara",
"seo.title":"ReelShort: Her Saniye Bir Drama",
"seo.desc":"ReelShort ile HD dikey kısa dramaların çevrimiçi sahnesine dal: kurt adamlar, milyarderler, mafya ve kampüs aşkı."},
"nl":{"menu.title":"Kies taal",
"nav.home":"Startpagina","nav.categories":"Categorieën","nav.fandom":"Fandom","nav.brand":"Merk","common.viewAll":"Alles bekijken",
"sec.new":"Nieuw uitgebracht","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Verborgen identiteit 🎭","sec.love":"Liefde op het eerste gezicht 💘","sec.baby":"Zwangerschap & baby's 🍼","sec.interact":"ReelShort Interactives 💕","sec.talk":"ReelTalk 🎤","sec.second":"Tweede kans 💫","sec.young":"Jonge liefde ❤",
"app.download":"Downloaden","app.unlock":"Ontgrendel afleveringen gratis, alleen in de app",
"cookie.title":"Cookies","cookie.accept":"Alles accepteren",
"footer.about":"OVER ONS","footer.support":"ONDERSTEUNING","footer.terms":"Servicevoorwaarden","footer.privacy":"Privacybeleid","footer.contact":"Neem contact met ons op","footer.feedback":"Feedback","footer.media":"Media & public relations","footer.cookiePolicy":"Cookiebeleid","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Alle rechten voorbehouden.",
"aria.search":"Zoeken",
"seo.title":"ReelShort: Elke seconde is drama",
"seo.desc":"Duik in ReelShort, jouw online bioscoop voor korte verticale HD-drama's: weerwolven, miljardairs, maffia en campusliefde."},
"pl":{"menu.title":"Wybierz język",
"nav.home":"Strona główna","nav.categories":"Kategorie","nav.fandom":"Fandom","nav.brand":"Marka","common.viewAll":"Zobacz wszystkie",
"sec.new":"Nowości","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Ukryta tożsamość 🎭","sec.love":"Miłość od pierwszego wejrzenia 💘","sec.baby":"Ciąża i dzieci 🍼","sec.interact":"ReelShort Interaktywne 💕","sec.talk":"ReelTalk 🎤","sec.second":"Druga szansa 💫","sec.young":"Młoda miłość ❤",
"app.download":"Pobierz","app.unlock":"Odblokuj odcinki za darmo tylko w aplikacji",
"cookie.title":"Cookie","cookie.accept":"Zaakceptuj wszystkie",
"footer.about":"O NAS","footer.support":"WSPARCIE","footer.terms":"Regulamin usług","footer.privacy":"Polityka prywatności","footer.contact":"Skontaktuj się z nami","footer.feedback":"Opinia","footer.media":"Media i relacje publiczne","footer.cookiePolicy":"Polityka cookie","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Wszelkie prawa zastrzeżone.",
"aria.search":"Szukaj",
"seo.title":"ReelShort: Każda sekunda to dramat",
"seo.desc":"Wejdź do ReelShort — internetowego kina krótkich pionowych dramatów HD: wilkołaki, miliarderzy, mafia i miłość na kampusie."},
"sv":{"menu.title":"Välj språk",
"nav.home":"Hem","nav.categories":"Kategorier","nav.fandom":"Fandom","nav.brand":"Varumärke","common.viewAll":"Visa alla",
"sec.new":"Nyheter","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Dold identitet 🎭","sec.love":"Kärlek vid första ögonkastet 💘","sec.baby":"Graviditet & barn 🍼","sec.interact":"ReelShort Interactives 💕","sec.talk":"ReelTalk 🎤","sec.second":"Andra chansen 💫","sec.young":"Ung kärlek ❤",
"app.download":"Ladda ner","app.unlock":"Lås upp avsnitt gratis endast i appen",
"cookie.title":"Cookies","cookie.accept":"Acceptera alla",
"footer.about":"OM OSS","footer.support":"SUPPORT","footer.terms":"Användarvillkor","footer.privacy":"Integritetspolicy","footer.contact":"Kontakta oss","footer.feedback":"Feedback","footer.media":"Medier & PR","footer.cookiePolicy":"Cookiepolicy","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Alla rättigheter förbehållna.",
"aria.search":"Sök",
"seo.title":"ReelShort: Varje sekund är drama",
"seo.desc":"Dyk in i ReelShort – din onlinebiograf för korta vertikala HD-dramer: varulvar, miljardärer, maffia och campus-kärlek."},
"da":{"menu.title":"Vælg sprog",
"nav.home":"Forside","nav.categories":"Kategorier","nav.fandom":"Fandom","nav.brand":"Brand","common.viewAll":"Se alle",
"sec.new":"Nye udgivelser","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Skjult identitet 🎭","sec.love":"Kærlighed ved første blik 💘","sec.baby":"Graviditet og babyer 🍼","sec.interact":"ReelShort Interactives 💕","sec.talk":"ReelTalk 🎤","sec.second":"Ny chance 💫","sec.young":"Ung kærlighed ❤",
"app.download":"Download","app.unlock":"Lås episoder op gratis kun i appen",
"cookie.title":"Cookies","cookie.accept":"Accepter alle",
"footer.about":"OM OS","footer.support":"SUPPORT","footer.terms":"Servicevilkår","footer.privacy":"Privatlivspolitik","footer.contact":"Kontakt os","footer.feedback":"Feedback","footer.media":"Medier & PR","footer.cookiePolicy":"Cookiepolitik","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Alle rettigheder forbeholdes.",
"aria.search":"Søg",
"seo.title":"ReelShort: Hvert sekund er drama",
"seo.desc":"Dyk ned i ReelShort – dit online-teater for korte, lodrette HD-dramaer: varulve, milliardærer, mafia og campus-kærlighed."},
"fi":{"menu.title":"Valitse kieli",
"nav.home":"Etusivu","nav.categories":"Luokat","nav.fandom":"Fandom","nav.brand":"Brändi","common.viewAll":"Näytä kaikki",
"sec.new":"Uutuudet","sec.top":"TOP","sec.original":"Reel Original 🌏","sec.hidden":"Piilotettu henkilöllisyys 🎭","sec.love":"Rakkautta ensisilmäyksellä 💘","sec.baby":"Raskaus & vauvat 🍼","sec.interact":"ReelShort Interactives 💕","sec.talk":"ReelTalk 🎤","sec.second":"Toinen mahdollisuus 💫","sec.young":"Nuori rakkaus ❤",
"app.download":"Lataa","app.unlock":"Avaa jaksot ilmaiseksi vain sovelluksessa",
"cookie.title":"Cookie","cookie.accept":"Hyväksy kaikki",
"footer.about":"TIETOA","footer.support":"TUKI","footer.terms":"Palveluehdot","footer.privacy":"Tietosuojakäytäntö","footer.contact":"Ota yhteyttä","footer.feedback":"Palaute","footer.media":"Media & suhdetoiminta","footer.cookiePolicy":"Cookie-käytännöt","footer.rights":"© 2026 Crazy Maple Studio™, Inc. Kaikki oikeudet pidätetään.",
"aria.search":"Hae",
"seo.title":"ReelShort: Jokainen sekunti on draamaa",
"seo.desc":"Sukella ReelShortiin – verkossa toimiva pystysuuntaisten HD-lyhytdraamojen teatteri: ihmissusia, miljardöörejä, mafiaa ja kampusrakkautta."}
};
/* ===== rs-i18n extended packs (auto-merged) ===== */
var EXTRA={
"en":{"cta.play":"Play","nav.topup":"Top Up","hint.bottom":"You have scrolled to the bottom","more.rec":"More Recommended","footer.hours":"Service Hours: Monday to Sunday, 12am to 8am(ET)","footer.dramaworld":"ReelShort Drama World","player.replay":"Replay","player.live":"Live","player.fullscreen":"Fullscreen","player.drag":"Click and hold to drag","suffix.series":" Full Series","aria.home":"ReelShort home","aria.history":"History","aria.avatar":"avatar","aria.featured":"Featured series","aria.prevThumbs":"Previous banner thumbnails","aria.nextThumbs":"Next banner thumbnails","aria.prev":"Previous","aria.next":"Next","aria.addList":"Add to My List","aria.share":"Share","aria.show":"Show {name}","aria.preview":"Preview {name}",
"desc.1":"Elijah Baran is a genie in a magic lamp who can grant three wishes. After thousands of years, a billionaire uses his last wish to grant Elijah freedom, but on one condition, Elijah must marry his granddaughter, Christine, for five years! To fulfill the wish, Elijah transforms into a human, marries Christine, and secretly helps her become a successful CEO. However, Christine ignores and constantly belittles him during their marriage. When the five years are almost up, Elijah starts to realize that Christine might never truly love him. He decides to divorce her.",
"desc.2":"Owen — discarded heir of the Hull family, the one and only disciple of the master of the Dragon Knight Sanctum. He awakens the Ten Dragon God Marks and forges a soul-deep bond with Akura, bearer of the ancient Golden Dragon bloodline. Betrayed by his own family, stripped of his name, and tormented by the very Sanctum that should have been his home — when the buried truth finally breaks free, the outcast of old rises in the full wrath of a Dragon God and grinds every last humiliation to dust. From that moment on, the young dragonlord sets forth across the land with his dragon at his side, and the entire continent shudders as the sky itself begins to change.",
"desc.3":"Bella's arranged marriage becomes a nightmare when she catches her fiancé cheating. Seeking revenge, she sleeps with a stranger, unwittingly bedding her fiancé's powerful mafia boss brother, Damian Gotti. Forced back into the Gotti family, Bella faces dangerous secrets and forbidden desires. Damian relentlessly pursues her under his brother's nose. Eventually, Damian exposes his brother's crimes, saves Bella, and they unite to defend their mafia throne.",
"desc.4":"Pampered real alpha princess Evie is framed and sent to the ruthless Werewolf Military Academy by her own family. They believe she is living comfortably, completely unaware that under the fake alpha princess's orders, Evie suffers brutal abuse. Three years later, she returns, broken inside, yet her family still views her as a spoiled brat. It is only when her father strikes her and her prosthetic limb falls off that they finally realize the horrifying truth...",
"desc.5":"In a post-apocalyptic world overrun by mutant beasts, Kane is humanity's one and only War God — yet he hides his identity, secretly gifting seventeen top military honors to his girlfriend Sena. On her promotion day, she coldly dumps him as a \"worthless nobody soldier.\" Meanwhile, City Lord Eve, forced into a political marriage by the corrupt government, proposes a fake marriage to Kane — never suspecting who he truly is. As elites humiliate him and scheme against her, the War God finally rises. Revenge, romance, and absolute power collide.",
"desc.6":"On mating night, Charlie is claimed by the Alpha and his Beta. By morning, she's publicly declared \"unsatisfactory\" and replaced. But when she discovers she can hear their private mind-link—and their chosen mate can't—the question becomes: if she was never meant for them, why is she the only one who feels the bond?",
"desc.7":"To Jason, Tessa was only a disposable practice run for the girl he actually wanted. After the blood on the sheets became a public trophy and her dignity a ghost, young Tessa finally stops trying to mend the shards. She is done with her first love. She is leaving him behind for a future that doesn't taste like salt and shame. But at the edge of the wreckage stands the one person who shouldn’t be there: another boy with no intention of letting her go alone.",
"desc.8":"Sold into marriage to the dragon-riding warlord of the brutal Blackclaw horde, a sheltered northern princess must decide whether surrendering to the man who bought her is her greatest betrayal or the only thing that can save her dying people."},
"zh-CN":{"cta.play":"播放","nav.topup":"充值","hint.bottom":"已经滑到底部啦","more.rec":"更多推荐","footer.hours":"服务时间：周一至周日 0:00–8:00（美国东部时间）","footer.dramaworld":"ReelShort 短剧世界","player.replay":"重播","player.live":"直播","player.fullscreen":"全屏","player.drag":"按住拖动","suffix.series":" 全集","aria.home":"ReelShort 首页","aria.history":"历史记录","aria.avatar":"头像","aria.featured":"精选剧集","aria.prevThumbs":"上一组横幅缩略图","aria.nextThumbs":"下一组横幅缩略图","aria.prev":"上一个","aria.next":"下一个","aria.addList":"加入片单","aria.share":"分享","aria.show":"显示：{name}","aria.preview":"预览：{name}",
"desc.1":"伊利亚·巴兰是神灯里的精灵，能实现三个愿望。千年之后，一位亿万富翁用最后一个愿望还他自由，条件只有一个：他必须娶自己的孙女克莉丝汀为妻，为期五年！为了完成愿望，伊利亚化为人形，娶了克莉丝汀，并暗中助她成为成功的CEO。然而婚后克莉丝汀始终冷落他、贬低他。当五年之约将尽，伊利亚渐渐明白她或许永远不会真正爱自己。他决定离婚。",
"desc.2":"欧文——赫尔家族被弃的继承人，龙骑士圣殿主人唯一的亲传弟子。他觉醒十龙神印，与身负远古金龙血脉的阿库拉缔结灵魂羁绊。被家族背叛、夺去姓名，又被本该是归处的圣殿百般折磨——当尘封的真相终被揭开，昔日弃子携龙神之怒归来，将所有屈辱碾为齑粉。自此，少年龙主携龙行走天下，整片大陆为之震颤，天色为之骤变。",
"desc.3":"贝拉的包办婚姻在撞破未婚夫出轨后变成噩梦。为了复仇，她与陌生人一夜缠绵，却不知对方正是未婚夫权势滔天的黑手党大佬哥哥——达米安·戈蒂。被迫重回戈蒂家族，贝拉面对危险的秘密与禁忌的欲望，达米安在弟弟眼皮底下对她步步紧追。最终，达米安揭发弟弟的罪行、救下贝拉，两人联手守住了他们的黑手党王座。",
"desc.4":"集万千宠爱于一身的真阿尔法公主伊薇遭人陷害，被亲生家人送入残酷的狼人军事学院。家人以为她在那里养尊处优，却完全不知在假阿尔法公主的指使下，伊薇受尽凌虐。三年后她带着破碎的心归来，家人仍当她是娇纵的大小姐。直到父亲一掌打来、她的假肢应声落地，他们才终于意识到可怕的真相……",
"desc.5":"在异兽横行的末世，凯恩是人类唯一的战神——他却隐姓埋名，暗中把十七枚顶级军功章都给了女友赛娜。授衔当日，她却冷漠地把他当作“一无是处的小兵”甩掉。与此同时，被腐败政府逼婚的城主伊芙向凯恩提出假结婚——她怎么也想不到他的真实身份。当权贵羞辱他、算计她时，战神终于崛起。复仇、爱情与绝对权力正面碰撞。",
"desc.6":"结合之夜，查莉被阿尔法和他的贝塔同时标记。清晨，她却被当众宣布“不合格”并遭替换。可当她发现自己能听见他们私密的心语链接——而他们选中的伴侣却不能——问题来了：如果她从不属于他们，为何只有她能感知这份羁绊？",
"desc.7":"对杰森而言，泰莎只是他追求真爱前一个可以随意丢弃的练习对象。当床单上的血迹成了他公开炫耀的勋章、她的尊严荡然无存，年轻的泰莎终于不再试图修补这段感情。她受够了初恋，要离开他，去追寻不再充满咸涩与羞耻的未来。可在废墟边缘站着一个本不该出现的人——另一个绝不打算放她独自离开的男孩。",
"desc.8":"一位养在深闺的北方公主被卖婚给残暴黑爪部落的御龙军阀，她必须抉择：委身于买下她的男人，究竟是她最大的背叛，还是拯救濒死族人的唯一出路。"},
"zh-TW":{"cta.play":"播放","nav.topup":"儲值","hint.bottom":"已經滑到底部啦","more.rec":"更多推薦","footer.hours":"服務時間：週一至週日 0:00–8:00（美東時間）","footer.dramaworld":"ReelShort 短劇世界","player.replay":"重播","player.live":"直播","player.fullscreen":"全螢幕","player.drag":"按住拖曳","suffix.series":" 全集","aria.home":"ReelShort 首頁","aria.history":"歷史紀錄","aria.avatar":"頭像","aria.featured":"精選劇集","aria.prevThumbs":"上一組橫幅縮圖","aria.nextThumbs":"下一組橫幅縮圖","aria.prev":"上一個","aria.next":"下一個","aria.addList":"加入片單","aria.share":"分享","aria.show":"顯示：{name}","aria.preview":"預覽：{name}",
"desc.1":"伊萊亞·巴蘭是神燈裡的精靈，能實現三個願望。千年之後，一位億萬富翁用最後一個願望還他自由，條件只有一個：他必須娶自己的孫女克莉絲汀為妻，為期五年！為了完成願望，伊萊亞化為人形，娶了克莉絲汀，並暗中助她成為成功的CEO。然而婚後克莉絲汀始終冷落他、貶低他。當五年之約將盡，伊萊亞漸漸明白她或許永遠不會真正愛自己。他決定離婚。",
"desc.2":"歐文——赫爾家族被棄的繼承人，龍騎士聖殿主人唯一的親傳弟子。他覺醒十龍神印，與身負遠古金龍血脈的阿庫拉締結靈魂羈絆。被家族背叛、奪去姓名，又被本該是歸處的聖殿百般折磨——當塵封的真相終被揭開，昔日棄子挾龍神之怒歸來，將所有屈辱碾為齏粉。自此，少年龍主攜龍行走天下，整片大陸為之震顫，天色為之驟變。",
"desc.3":"貝拉的包辦婚姻在撞破未婚夫出軌後變成夢魘。為了復仇，她與陌生人一夜纏綿，卻不知對方正是未婚夫權勢滔天的黑手黨大佬哥哥——達米安·戈蒂。被迫重回戈蒂家族，貝拉面對危險的秘密與禁忌的慾望，達米安在弟弟眼皮底下對她步步進逼。最終，達米安揭發弟弟的罪行、救下貝拉，兩人聯手守住了他們的黑手黨王座。",
"desc.4":"集萬千寵愛於一身的真阿爾法公主伊薇遭人陷害，被親生家人送入殘酷的狼人軍事學院。家人以為她在那裡養尊處優，卻完全不知在假阿爾法公主的指使下，伊薇受盡凌虐。三年後她帶著破碎的心歸來，家人仍當她是嬌縱的大小姐。直到父親一掌打來、她的假肢應聲落地，他們才終於意識到可怕的真相……",
"desc.5":"在異獸橫行的末世，凱恩是人類唯一的戰神——他卻隱姓埋名，暗中把十七枚頂級軍功章都給了女友賽娜。授銜當日，她卻冷漠地把他當作「一無是處的小兵」甩掉。與此同時，被腐敗政府逼婚的城主伊芙向凱恩提出假結婚——她怎麼也想不到他的真實身分。當權貴羞辱他、算計她時，戰神終於崛起。復仇、愛情與絕對權力正面碰撞。",
"desc.6":"結合之夜，查莉被阿爾法和他的貝塔同時標記。清晨，她卻被當眾宣布「不合格」並遭替換。可當她發現自己能聽見他們私密的心語連結——而他們選中的伴侶卻不能——問題來了：如果她從不屬於他們，為何只有她能感知這份羈絆？",
"desc.7":"對傑森而言，泰莎只是他追求真愛前一個可以隨意丟棄的練習對象。當床單上的血跡成了他公開炫耀的勳章、她的尊嚴蕩然無存，年輕的泰莎終於不再試圖修補這段感情。她受夠了初戀，要離開他，去追尋不再充滿鹹澀與羞恥的未來。可在廢墟邊緣站著一個本不該出現的人——另一個絕不打算放她獨自離開的男孩。",
"desc.8":"一位養在深閨的北方公主被賣婚給殘暴黑爪部落的御龍軍閥，她必須抉擇：委身於買下她的男人，究竟是她最大的背叛，還是拯救瀕死族人的唯一出路。"},
"es":{"cta.play":"Reproducir","nav.topup":"Recargar","hint.bottom":"Has llegado al final","more.rec":"Más recomendaciones","footer.hours":"Horario de atención: de lunes a domingo, de 12:00 a. m. a 8:00 a. m. (hora del Este)","footer.dramaworld":"El mundo drama de ReelShort","player.replay":"Repetir","player.live":"En directo","player.fullscreen":"Pantalla completa","player.drag":"Mantén pulsado para arrastrar","suffix.series":" Serie completa","aria.home":"Inicio de ReelShort","aria.history":"Historial","aria.avatar":"Avatar","aria.featured":"Series destacadas","aria.prevThumbs":"Miniaturas anteriores","aria.nextThumbs":"Miniaturas siguientes","aria.prev":"Anterior","aria.next":"Siguiente","aria.addList":"Añadir a mi lista","aria.share":"Compartir","aria.show":"Mostrar: {name}","aria.preview":"Vista previa: {name}"},
"fr":{"cta.play":"Lecture","nav.topup":"Recharger","hint.bottom":"Vous avez atteint le bas","more.rec":"À recommander aussi","footer.hours":"Horaires : du lundi au dimanche, de minuit à 8 h (HE)","footer.dramaworld":"Le monde des dramas ReelShort","player.replay":"Revoir","player.live":"En direct","player.fullscreen":"Plein écran","player.drag":"Maintenez pour glisser","suffix.series":" Série complète","aria.home":"Accueil ReelShort","aria.history":"Historique","aria.avatar":"Avatar","aria.featured":"Séries en vedette","aria.prevThumbs":"Miniatures précédentes","aria.nextThumbs":"Miniatures suivantes","aria.prev":"Précédent","aria.next":"Suivant","aria.addList":"Ajouter à ma liste","aria.share":"Partager","aria.show":"Afficher : {name}","aria.preview":"Aperçu : {name}"},
"de":{"cta.play":"Abspielen","nav.topup":"Aufladen","hint.bottom":"Du bist am Ende angekommen","more.rec":"Mehr Empfehlungen","footer.hours":"Servicezeiten: Montag bis Sonntag, 0:00–8:00 Uhr (ET)","footer.dramaworld":"ReelShort Drama-Welt","player.replay":"Erneut abspielen","player.live":"Live","player.fullscreen":"Vollbild","player.drag":"Gedrückt halten zum Ziehen","suffix.series":" Ganze Serie","aria.home":"ReelShort-Startseite","aria.history":"Verlauf","aria.avatar":"Avatar","aria.featured":"Empfohlene Serien","aria.prevThumbs":"Vorherige Banner-Vorschaubilder","aria.nextThumbs":"Nächste Banner-Vorschaubilder","aria.prev":"Zurück","aria.next":"Weiter","aria.addList":"Zur Liste hinzufügen","aria.share":"Teilen","aria.show":"{name} anzeigen","aria.preview":"Vorschau: {name}"},
"ja":{"cta.play":"再生","nav.topup":"チャージ","hint.bottom":"一番下までスクロールしました","more.rec":"その他のおすすめ","footer.hours":"サービス時間：月曜～日曜 0:00～8:00（米国東部時間）","footer.dramaworld":"ReelShort ドラマの世界","player.replay":"もう一度再生","player.live":"ライブ","player.fullscreen":"全画面","player.drag":"長押しでドラッグ","suffix.series":" 全シリーズ","aria.home":"ReelShortホーム","aria.history":"履歴","aria.avatar":"アバター","aria.featured":"おすすめシリーズ","aria.prevThumbs":"前のバナーサムネイル","aria.nextThumbs":"次のバナーサムネイル","aria.prev":"前へ","aria.next":"次へ","aria.addList":"マイリストに追加","aria.share":"共有","aria.show":"表示：{name}","aria.preview":"プレビュー：{name}"},
"ko":{"cta.play":"재생","nav.topup":"충전","hint.bottom":"맨 아래까지 스크롤했습니다","more.rec":"더 많은 추천","footer.hours":"서비스 시간: 월요일~일요일, 오전 12시~오전 8시(미 동부 시간)","footer.dramaworld":"ReelShort 드라마 월드","player.replay":"다시 보기","player.live":"라이브","player.fullscreen":"전체화면","player.drag":"길게 눌러 드래그","suffix.series":" 전체 시리즈","aria.home":"ReelShort 홈","aria.history":"기록","aria.avatar":"프로필","aria.featured":"추천 시리즈","aria.prevThumbs":"이전 배너 썸네일","aria.nextThumbs":"다음 배너 썸네일","aria.prev":"이전","aria.next":"다음","aria.addList":"내 목록에 추가","aria.share":"공유","aria.show":"{name} 보기","aria.preview":"{name} 미리보기"},
"pt":{"cta.play":"Reproduzir","nav.topup":"Recarregar","hint.bottom":"Você chegou ao fim","more.rec":"Mais recomendados","footer.hours":"Horário de atendimento: segunda a domingo, das 0h às 8h (ET)","footer.dramaworld":"Mundo de dramas ReelShort","player.replay":"Repetir","player.live":"Ao vivo","player.fullscreen":"Tela cheia","player.drag":"Clique e segure para arrastar","suffix.series":" Série completa","aria.home":"Início ReelShort","aria.history":"Histórico","aria.avatar":"Avatar","aria.featured":"Séries em destaque","aria.prevThumbs":"Miniaturas anteriores","aria.nextThumbs":"Miniaturas seguintes","aria.prev":"Anterior","aria.next":"Próximo","aria.addList":"Adicionar à minha lista","aria.share":"Compartilhar","aria.show":"Mostrar: {name}","aria.preview":"Prévia: {name}"},
"it":{"cta.play":"Riproduci","nav.topup":"Ricarica","hint.bottom":"Hai scorso fino in fondo","more.rec":"Altri consigliati","footer.hours":"Orari: dal lunedì alla domenica, 0:00–8:00 (ET)","footer.dramaworld":"Il mondo dei drama ReelShort","player.replay":"Replay","player.live":"Diretta","player.fullscreen":"Schermo intero","player.drag":"Tieni premuto per trascinare","suffix.series":" Serie completa","aria.home":"Home ReelShort","aria.history":"Cronologia","aria.avatar":"Avatar","aria.featured":"Serie in evidenza","aria.prevThumbs":"Miniature banner precedenti","aria.nextThumbs":"Miniature banner successive","aria.prev":"Precedente","aria.next":"Successivo","aria.addList":"Aggiungi alla mia lista","aria.share":"Condividi","aria.show":"Mostra: {name}","aria.preview":"Anteprima: {name}"},
"ru":{"cta.play":"Смотреть","nav.topup":"Пополнить","hint.bottom":"Вы пролистали до конца","more.rec":"Ещё рекомендации","footer.hours":"Часы работы: с понедельника по воскресенье, 00:00–08:00 (вост. время США)","footer.dramaworld":"Мир дорам ReelShort","player.replay":"Повтор","player.live":"Эфир","player.fullscreen":"Полный экран","player.drag":"Нажмите и удерживайте, чтобы перетащить","suffix.series":" Вся серия","aria.home":"Главная ReelShort","aria.history":"История","aria.avatar":"Аватар","aria.featured":"Избранные сериалы","aria.prevThumbs":"Предыдущие миниатюры баннера","aria.nextThumbs":"Следующие миниатюры баннера","aria.prev":"Назад","aria.next":"Вперёд","aria.addList":"В мой список","aria.share":"Поделиться","aria.show":"Показать: {name}","aria.preview":"Предпросмотр: {name}"},
"ar":{"cta.play":"تشغيل","nav.topup":"شحن الرصيد","hint.bottom":"لقد وصلت إلى الأسفل","more.rec":"المزيد من المقترحات","footer.hours":"ساعات الخدمة: الاثنين إلى الأحد، 12ص إلى 8ص (بتوقيت شرق الولايات المتحدة)","footer.dramaworld":"عالم دراما ReelShort","player.replay":"إعادة","player.live":"مباشر","player.fullscreen":"ملء الشاشة","player.drag":"اضغط مع الاستمرار للسحب","suffix.series":" السلسلة كاملة","aria.home":"الصفحة الرئيسية ReelShort","aria.history":"السجل","aria.avatar":"الصورة الرمزية","aria.featured":"مسلسلات مميزة","aria.prevThumbs":"الصور المصغرة السابقة","aria.nextThumbs":"الصور المصغرة التالية","aria.prev":"السابق","aria.next":"التالي","aria.addList":"أضف إلى قائمتي","aria.share":"مشاركة","aria.show":"إظهار: {name}","aria.preview":"معاينة: {name}"},
"hi":{"cta.play":"चलाएं","nav.topup":"टॉप अप","hint.bottom":"आप सबसे नीचे स्क्रॉल कर चुके हैं","more.rec":"और सुझाव","footer.hours":"सेवा समय: सोमवार से रविवार, 12am से 8am (ET)","footer.dramaworld":"ReelShort ड्रामा वर्ल्ड","player.replay":"रीप्ले","player.live":"लाइव","player.fullscreen":"फ़ुलस्क्रीन","player.drag":"खींचने के लिए दबाकर रखें","suffix.series":" पूरी सीरीज़","aria.home":"ReelShort होम","aria.history":"इतिहास","aria.avatar":"अवतार","aria.featured":"विशेष सीरीज़","aria.prevThumbs":"पिछले बैनर थंबनेल","aria.nextThumbs":"अगले बैनर थंबनेल","aria.prev":"पिछला","aria.next":"अगला","aria.addList":"मेरी सूची में जोड़ें","aria.share":"शेयर करें","aria.show":"दिखाएं: {name}","aria.preview":"पूर्वावलोकन: {name}"},
"id":{"cta.play":"Putar","nav.topup":"Isi Pulsa","hint.bottom":"Anda telah menggulir ke bagian bawah","more.rec":"Rekomendasi lainnya","footer.hours":"Jam layanan: Senin–Minggu, 00.00–08.00 (ET)","footer.dramaworld":"Dunia Drama ReelShort","player.replay":"Putar ulang","player.live":"Live","player.fullscreen":"Layar penuh","player.drag":"Klik dan tahan untuk menyeret","suffix.series":" Semua Episode","aria.home":"Beranda ReelShort","aria.history":"Riwayat","aria.avatar":"Avatar","aria.featured":"Serial unggulan","aria.prevThumbs":"Gambar mini sebelumnya","aria.nextThumbs":"Gambar mini berikutnya","aria.prev":"Sebelumnya","aria.next":"Berikutnya","aria.addList":"Tambahkan ke daftar saya","aria.share":"Bagikan","aria.show":"Tampilkan: {name}","aria.preview":"Pratinjau: {name}"},
"th":{"cta.play":"เล่น","nav.topup":"เติมเงิน","hint.bottom":"เลื่อนมาถึงด้านล่างสุดแล้ว","more.rec":"แนะนำเพิ่มเติม","footer.hours":"เวลาให้บริการ: วันจันทร์–อาทิตย์ 00:00–08:00 น. (เวลาตะวันออก)","footer.dramaworld":"โลกดราม่า ReelShort","player.replay":"เล่นซ้ำ","player.live":"สด","player.fullscreen":"เต็มจอ","player.drag":"กดค้างเพื่อลาก","suffix.series":" ดูทุกตอน","aria.home":"หน้าแรก ReelShort","aria.history":"ประวัติดู","aria.avatar":"โปรไฟล์","aria.featured":"ซีรีส์แนะนำ","aria.prevThumbs":"ภาพตัวอย่างก่อนหน้า","aria.nextThumbs":"ภาพตัวอย่างถัดไป","aria.prev":"ก่อนหน้า","aria.next":"ถัดไป","aria.addList":"เพิ่มในลิสต์ของฉัน","aria.share":"แชร์","aria.show":"แสดง: {name}","aria.preview":"ตัวอย่าง: {name}"},
"vi":{"cta.play":"Phát","nav.topup":"Nạp xu","hint.bottom":"Bạn đã cuộn xuống cuối trang","more.rec":"Đề xuất thêm","footer.hours":"Giờ phục vụ: Thứ Hai–Chủ Nhật, 0:00–8:00 sáng (Giờ miền Đông)","footer.dramaworld":"Thế giới drama ReelShort","player.replay":"Phát lại","player.live":"Trực tiếp","player.fullscreen":"Toàn màn hình","player.drag":"Nhấn và giữ để kéo","suffix.series":" Toàn bộ tập","aria.home":"Trang chủ ReelShort","aria.history":"Lịch sử","aria.avatar":"Ảnh đại diện","aria.featured":"Series nổi bật","aria.prevThumbs":"Ảnh thu nhỏ trước","aria.nextThumbs":"Ảnh thu nhỏ sau","aria.prev":"Trước","aria.next":"Sau","aria.addList":"Thêm vào danh sách của tôi","aria.share":"Chia sẻ","aria.show":"Hiển thị: {name}","aria.preview":"Xem trước: {name}"},
"tr":{"cta.play":"Oynat","nav.topup":"Yükle","hint.bottom":"En alta kaydınız","more.rec":"Daha fazla öneri","footer.hours":"Hizmet saatleri: Pazartesi–Pazar, 00:00–08:00 (ET)","footer.dramaworld":"ReelShort Drama Dünyası","player.replay":"Tekrar oynat","player.live":"Canlı","player.fullscreen":"Tam ekran","player.drag":"Sürüklemek için basılı tutun","suffix.series":" Tüm Bölümler","aria.home":"ReelShort ana sayfa","aria.history":"Geçmiş","aria.avatar":"Avatar","aria.featured":"Öne çıkan diziler","aria.prevThumbs":"Önceki banner küçük görselleri","aria.nextThumbs":"Sonraki banner küçük görselleri","aria.prev":"Önceki","aria.next":"Sonraki","aria.addList":"Listeme ekle","aria.share":"Paylaş","aria.show":"Göster: {name}","aria.preview":"Önizleme: {name}"},
"nl":{"cta.play":"Afspelen","nav.topup":"Opwaarderen","hint.bottom":"Je bent aan het einde","more.rec":"Meer aanbevolen","footer.hours":"Servicetijden: maandag t/m zondag, 00:00–08:00 (ET)","footer.dramaworld":"ReelShort Dramawereld","player.replay":"Opnieuw afspelen","player.live":"Live","player.fullscreen":"Volledig scherm","player.drag":"Klik en houd vast om te slepen","suffix.series":" Volledige serie","aria.home":"ReelShort-startpagina","aria.history":"Geschiedenis","aria.avatar":"Avatar","aria.featured":"Uitgelichte series","aria.prevThumbs":"Vorige banner-miniaturen","aria.nextThumbs":"Volgende banner-miniaturen","aria.prev":"Vorige","aria.next":"Volgende","aria.addList":"Aan mijn lijst toevoegen","aria.share":"Delen","aria.show":"Tonen: {name}","aria.preview":"Voorvertoning: {name}"},
"pl":{"cta.play":"Odtwarzaj","nav.topup":"Doładuj","hint.bottom":"Przewinięto na sam dół","more.rec":"Więcej polecanych","footer.hours":"Godziny obsługi: pon.–niedz., 00:00–08:00 (ET)","footer.dramaworld":"Świat dramatów ReelShort","player.replay":"Odtwórz ponownie","player.live":"Na żywo","player.fullscreen":"Pełny ekran","player.drag":"Kliknij i przytrzymaj, aby przeciągnąć","suffix.series":" Cała seria","aria.home":"Strona główna ReelShort","aria.history":"Historia","aria.avatar":"Avatar","aria.featured":"Polecane seriale","aria.prevThumbs":"Poprzednie miniatury banera","aria.nextThumbs":"Następne miniatury banera","aria.prev":"Wstecz","aria.next":"Dalej","aria.addList":"Dodaj do mojej listy","aria.share":"Udostępnij","aria.show":"Pokaż: {name}","aria.preview":"Podgląd: {name}"},
"sv":{"cta.play":"Spela upp","nav.topup":"Ladda","hint.bottom":"Du har bläddrat till botten","more.rec":"Fler rekommendationer","footer.hours":"Servicetider: måndag–söndag, 00:00–08:00 (ET)","footer.dramaworld":"ReelShort dramavärld","player.replay":"Spela om","player.live":"Live","player.fullscreen":"Fullskärm","player.drag":"Klicka och håll för att dra","suffix.series":" Hela serien","aria.home":"ReelShort startsida","aria.history":"Historik","aria.avatar":"Avatar","aria.featured":"Rekommenderade serier","aria.prevThumbs":"Föregående banderoll-miniatyrer","aria.nextThumbs":"Nästa banderoll-miniatyrer","aria.prev":"Föregående","aria.next":"Nästa","aria.addList":"Lägg till i min lista","aria.share":"Dela","aria.show":"Visa: {name}","aria.preview":"Förhandsvisa: {name}"},
"da":{"cta.play":"Afspil","nav.topup":"Optank","hint.bottom":"Du er nået til bunden","more.rec":"Flere anbefalinger","footer.hours":"Servicetid: mandag–søndag kl. 00:00–08:00 (ET)","footer.dramaworld":"ReelShort dramaverden","player.replay":"Afspil igen","player.live":"Live","player.fullscreen":"Fuld skærm","player.drag":"Klik og hold for at trække","suffix.series":" Hele serien","aria.home":"ReelShort startside","aria.history":"Historik","aria.avatar":"Avatar","aria.featured":"Fremhævede serier","aria.prevThumbs":"Forrige banner-miniaturer","aria.nextThumbs":"Næste banner-miniaturer","aria.prev":"Forrige","aria.next":"Næste","aria.addList":"Føj til min liste","aria.share":"Del","aria.show":"Vis: {name}","aria.preview":"Forhåndsvisning: {name}"},
"fi":{"cta.play":"Toista","nav.topup":"Lataa","hint.bottom":"Olet vierittänyt loppuun","more.rec":"Lisää suosituksia","footer.hours":"Palveluajat: ma–su klo 00:00–08:00 (ET)","footer.dramaworld":"ReelShort-draamamaailma","player.replay":"Toista uudelleen","player.live":"Suora","player.fullscreen":"Koko näyttö","player.drag":"Napsauta ja pidä vetääksesi","suffix.series":" Koko sarja","aria.home":"ReelShort-etusivu","aria.history":"Historia","aria.avatar":"Avatar","aria.featured":"Suositellut sarjat","aria.prevThumbs":"Edelliset bannerin pienoiskuvat","aria.nextThumbs":"Seuraavat bannerin pienoiskuvat","aria.prev":"Edellinen","aria.next":"Seuraava","aria.addList":"Lisää listaani","aria.share":"Jaa","aria.show":"Näytä: {name}","aria.preview":"Esikatselu: {name}"}
};
/* genre/badge tags (zh only; other languages fall back to English) */
var TAGS={
"zh-CN":{"Affair":"婚外情","All":"全部","All Ages":"全年龄","Alpha":"阿尔法","Animation":"动画","Artist":"艺术家","Athlete":"运动员","Billionaire":"亿万富豪","Campus":"校园","Comeback":"逆袭归来","Crime Lord":"黑帮大佬","Dark Romance":"暗黑言情","Dragons":"龙族","Drama":"剧情","Family Drama":"家庭伦理","Fantasy":"奇幻","Female":"女频","Film":"影视","Flight Attendant":"空乘","Fool":"扮傻","Forbidden Love":"禁忌之恋","Gay":"男同","Harem":"后宫","Heiress/Socialite":"名媛淑女","Hidden Feelings":"暗恋","Hidden Identity":"隐藏身份","High Fantasy":"宏大奇幻","High-Stakes":"高风险","Hot":"火爆","Interactive":"互动","Jock":"体育生","New":"新剧","LGBTQ":"LGBTQ+","LGBTQ+":"LGBTQ+","Laborer":"劳动者","Lesbian":"女同","Luna":"露娜","Magic":"魔法","Male":"男频","Marriage of Convenience":"契约婚姻","Marshal/General":"将帅","Misunderstanding":"误会","Mistaken Identity":"认错人","Modern":"现代","Mythology":"神话","Playing Dumb":"装傻","Podcast":"播客","Possessive":"占有欲强","Protective Husband":"护妻老公","Rags to Riches":"草根逆袭","Reality Show":"真人秀","Rebirth":"重生","Reborn":"重生","Revenge":"复仇","Reverse Harem":"逆后宫","Romance":"言情","Romantic":"浪漫","Royalty":"王室","Royalty/Nobility":"王室贵族","Sci-Fi":"科幻","Second Chance":"第二次机会","Secret Identity":"秘密身份","Series":"连续剧","Servant":"仆人","Strong Heroine":"大女主","Student":"学生","Supernatural":"超自然","Sweet Romance":"甜宠","Time Travel":"穿越","Toxic Romance":"虐恋","Trending":"热门","Werewolf":"狼人","Young Adult":"青少年"},
"zh-TW":{"Affair":"婚外情","All":"全部","All Ages":"全年齡","Alpha":"阿爾法","Animation":"動畫","Artist":"藝術家","Athlete":"運動員","Billionaire":"億萬富豪","Campus":"校園","Comeback":"逆襲歸來","Crime Lord":"黑幫大佬","Dark Romance":"暗黑言情","Dragons":"龍族","Drama":"劇情","Family Drama":"家庭倫理","Fantasy":"奇幻","Female":"女頻","Film":"影視","Flight Attendant":"空服員","Fool":"扮傻","Forbidden Love":"禁忌之戀","Gay":"男同","Harem":"後宮","Heiress/Socialite":"名媛淑女","Hidden Feelings":"暗戀","Hidden Identity":"隱藏身分","High Fantasy":"宏大奇幻","High-Stakes":"高風險","Hot":"火爆","Interactive":"互動","Jock":"體育生","New":"新劇","LGBTQ":"LGBTQ+","LGBTQ+":"LGBTQ+","Laborer":"勞動者","Lesbian":"女同","Luna":"露娜","Magic":"魔法","Male":"男頻","Marriage of Convenience":"契約婚姻","Marshal/General":"將帥","Misunderstanding":"誤會","Mistaken Identity":"認錯人","Modern":"現代","Mythology":"神話","Playing Dumb":"裝傻","Podcast":"播客","Possessive":"佔有慾強","Protective Husband":"護妻老公","Rags to Riches":"草根逆襲","Reality Show":"真人實境秀","Rebirth":"重生","Reborn":"重生","Revenge":"復仇","Reverse Harem":"逆後宮","Romance":"言情","Romantic":"浪漫","Royalty":"王室","Royalty/Nobility":"王室貴族","Sci-Fi":"科幻","Second Chance":"第二次機會","Secret Identity":"祕密身分","Series":"連續劇","Servant":"僕人","Strong Heroine":"大女主","Student":"學生","Supernatural":"超自然","Sweet Romance":"甜寵","Time Travel":"穿越","Toxic Romance":"虐戀","Trending":"熱門","Werewolf":"狼人","Young Adult":"青少年"}
};
(function(){
for(var c in EXTRA){var pack=translations[c];if(!pack)continue;var add=EXTRA[c];for(var k in add)if(pack[k]==null)pack[k]=add[k];}
var enx=EXTRA.en;
for(var code in translations){if(code==="en")continue;var p=translations[code];for(var k2 in enx)if(p[k2]==null)p[k2]=enx[k2];}
})();
var dynBadges=[],dynMetas=[],dynSeries=[],dynArias=[];
var ARIA_EXACT={"ReelShort home":"aria.home","Search":"aria.search","History":"aria.history","avatar":"aria.avatar","Featured series":"aria.featured","Previous banner thumbnails":"aria.prevThumbs","Next banner thumbnails":"aria.nextThumbs","Previous":"aria.prev","Next":"aria.next","Add to My List":"aria.addList","Share":"aria.share"};
function normTxt(s){return (s||"").replace(/\s+/g," ").trim();}
function registerDynamic(){
var hero=document.querySelector('[aria-label="Featured series"]');
if(hero){var bs=hero.querySelectorAll('span[class*="backdrop-blur"]');for(var i=0;i<bs.length;i++){var bx=normTxt(bs[i].textContent);if(bx)dynBadges.push({el:bs[i],orig:bx});}}
var reds=document.querySelectorAll('[style*="E52E2E"],[style*="rgb(229, 46, 46)"],[style*="rgb(229,46,46)"]');
for(var r=0;r<reds.length;r++){var rd=reds[r];if(rd.childElementCount>0)continue;var rx=normTxt(rd.textContent);if(rx&&rx.length<=20)dynBadges.push({el:rd,orig:rx});}
var metas=document.querySelectorAll('div.mt-8px.truncate');
for(var m=0;m<metas.length;m++){var d=metas[m];if(d.childElementCount>0)continue;var dx=normTxt(d.textContent);if(dx)dynMetas.push({el:d,orig:dx});}
var as=document.querySelectorAll('h3 a');
for(var a=0;a<as.length;a++){var ax=normTxt(as[a].textContent);if(/ Full Series$/.test(ax))dynSeries.push({el:as[a],orig:ax});}
var labs=document.querySelectorAll('[aria-label]');
for(var q=0;q<labs.length;q++){
var el=labs[q];
if(el.hasAttribute("data-i18n-aria"))continue;
if(el.closest&&el.closest("#rs-i18n-root"))continue;
var raw=normTxt(el.getAttribute("aria-label")),key=null,name="";
if(ARIA_EXACT.hasOwnProperty(raw))key=ARIA_EXACT[raw];
else{var sm=raw.match(/^Show (.+)$/);var pm=raw.match(/^Preview (.+)$/);
if(sm){key="aria.show";name=sm[1];}else if(pm){key="aria.preview";name=pm[1];}}
if(key)dynArias.push({el:el,orig:raw,key:key,name:name});
}
}
function applyDynamic(code){
var tags=TAGS[code]||{};
for(var i=0;i<dynBadges.length;i++){var b=dynBadges[i];b.el.textContent=tags[b.orig]||b.orig;}
for(var m=0;m<dynMetas.length;m++){var mt=dynMetas[m];
var toks=mt.orig.split("｜").map(function(x){x=normTxt(x);return tags[x]||x;});
mt.el.textContent=toks.join(" ｜ ");
}
for(var a=0;a<dynSeries.length;a++){var sr=dynSeries[a];
if(code==="en")sr.el.textContent=sr.orig;
else sr.el.textContent=sr.orig.replace(/\s*Full Series$/,"")+t(code,"suffix.series");
}
for(var q=0;q<dynArias.length;q++){var ar=dynArias[q];
if(code==="en")ar.el.setAttribute("aria-label",ar.orig);
else ar.el.setAttribute("aria-label",t(code,ar.key).replace("{name}",ar.name));
}
}

var PHRASES={
"Home":"nav.home","Categories":"nav.categories","Fandom":"nav.fandom","Brand":"nav.brand",
"View all":"common.viewAll",
"Download":"app.download","Unlock Episodes Free Only in APP":"app.unlock",
"Cookie":"cookie.title","Accept All":"cookie.accept",
"ABOUT":"footer.about","SUPPORT":"footer.support","Terms of Service":"footer.terms","Privacy Policy":"footer.privacy","Contact Us":"footer.contact","Feedback":"footer.feedback","Media & Public Relations":"footer.media","Cookie Policies":"footer.cookiePolicy",
"© 2026 Crazy Maple Studio™, Inc. All Rights Reserved.":"footer.rights","Play":"cta.play","Replay":"player.replay","Live":"player.live","Fullscreen":"player.fullscreen","Click and hold to drag":"player.drag","Top Up":"nav.topup","More Recommended":"more.rec","You have scrolled to the bottom":"hint.bottom","Service Hours: Monday to Sunday, 12am to 8am(ET)":"footer.hours","ReelShort Drama World":"footer.dramaworld"
};
var SUPPORTED={};languages.forEach(function(l){SUPPORTED[l.code]=l;});
var PREFIX_MAP={en:"en",fr:"fr",de:"de",ja:"ja",ko:"ko",es:"es",it:"it",ru:"ru",ar:"ar",hi:"hi",id:"id",th:"th",vi:"vi",tr:"tr",nl:"nl",pl:"pl",sv:"sv",da:"da",fi:"fi",pt:"pt",zh:"zh"};
var TZ_MAP={
"Asia/Shanghai":"zh-CN","Asia/Chongqing":"zh-CN","Asia/Urumqi":"zh-CN","Asia/Singapore":"zh-CN",
"Asia/Taipei":"zh-TW","Asia/Hong_Kong":"zh-TW","Asia/Macau":"zh-TW",
"Asia/Tokyo":"ja","Asia/Seoul":"ko","Asia/Bangkok":"th","Asia/Jakarta":"id","Asia/Ho_Chi_Minh":"vi",
"Europe/Paris":"fr","Europe/Brussels":"fr","Europe/Berlin":"de","Europe/Vienna":"de","Europe/Zurich":"de",
"Europe/Madrid":"es","Europe/Lisbon":"pt","Europe/London":"en","Europe/Dublin":"en","Europe/Rome":"it","Europe/Moscow":"ru",
"Europe/Istanbul":"tr","Europe/Amsterdam":"nl","Europe/Warsaw":"pl","Europe/Stockholm":"sv","Europe/Copenhagen":"da","Europe/Helsinki":"fi",
"America/New_York":"en","America/Los_Angeles":"en","America/Chicago":"en","America/Toronto":"en","America/Sao_Paulo":"pt","America/Mexico_City":"es","America/Argentina/Buenos_Aires":"es",
"Asia/Riyadh":"ar","Asia/Dubai":"ar","Asia/Kolkata":"hi","Asia/Tehran":"ar","Africa/Cairo":"ar","Australia/Sydney":"en","Pacific/Auckland":"en"
};
function t(code,key){
var pack=translations[code]||translations.en,en=translations.en;
return (pack&&pack[key]!=null)?pack[key]:(en[key]!=null?en[key]:key);
}
function storageGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function storageSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function mapBrowser(raw){
if(!raw)return null;
var s=String(raw).toLowerCase().replace(/_/g,"-");
if(s.indexOf("zh")===0){
if(/-(tw|hk|mo|hant)/.test(s))return "zh-TW";
if(/-(cn|sg|hans)/.test(s))return "zh-CN";
return "zh-CN";
}
if(s.indexOf("pt")===0)return "pt";
var base=s.split("-")[0];
if(PREFIX_MAP.hasOwnProperty(base)){
var code=PREFIX_MAP[base];
return SUPPORTED[code]?code:null;
}
return null;
}
function mapTimezone(tz){
if(!tz)return null;
var code=TZ_MAP[tz];
return (code&&SUPPORTED[code])?code:null;
}
function detectLanguage(){
var query=new URLSearchParams(location.search).get("lang");
if(query){var mapped=mapBrowser(query);if(mapped)return mapped;}
var saved=storageGet("language");
if(saved&&SUPPORTED[saved])return saved;
var list=[];
try{if(navigator.languages&&navigator.languages.length)list=Array.prototype.slice.call(navigator.languages);}catch(e){}
if(navigator.language)list.push(navigator.language);
if(!list.length)list=["en"];
for(var i=0;i<list.length;i++){var c=mapBrowser(list[i]);if(c)return c;}
try{var tz=Intl.DateTimeFormat().resolvedOptions().timeZone;var zc=mapTimezone(tz);if(zc)return zc;}catch(e){}
return "en";
}
function fillFlag(container,lang){
if(lang.flag){
container.classList.remove("rs-flag--none");
container.innerHTML='<img src="static/img/flags/'+lang.flag+'" alt="" loading="lazy" onerror="this.parentNode.classList.add(\'rs-flag--none\')">'+GLOBE;
}else{
container.classList.add("rs-flag--none");
container.innerHTML=GLOBE;
}
}
function setMeta(selector,attr,val){
var el=document.querySelector(selector);
if(el)el.setAttribute(attr,val);
}
var currentLang=null;
var phraseNodes=[];
var textNodeCache=[];
function cacheTextNode(el){
for(var i=0;i<textNodeCache.length;i++){if(textNodeCache[i].el===el)return textNodeCache[i].node;}
var target=null,children=el.childNodes;
for(var i=0;i<children.length;i++){
if(children[i].nodeType===3&&children[i].nodeValue.replace(/\s+/g," ").trim()){target=children[i];break;}
}
textNodeCache.push({el:el,node:target});
return target;
}
function setI18nText(el,val){
if(el.childElementCount===0){el.textContent=val;return;}
var node=cacheTextNode(el);
if(node)node.nodeValue=val;else el.textContent=val;
}
function registerPhrases(){
var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null);
var node;
while((node=walker.nextNode())){
var el=node.parentNode;
if(!el||!el.closest)continue;
if(el.closest("#rs-i18n-root")||el.closest("[data-i18n]"))continue;
var key=PHRASES[node.nodeValue.replace(/\s+/g," ").trim()];
if(key)phraseNodes.push({node:node,key:key});
}
}
function injectHreflang(){
if(document.querySelector('link[data-rs-i18n="hreflang"]'))return;
var base=(location.origin||"")+(location.pathname||"/");
languages.forEach(function(l){
var link=document.createElement("link");
link.rel="alternate";link.hreflang=l.code;link.href=base;
link.setAttribute("data-rs-i18n","hreflang");
document.head.appendChild(link);
});
var xd=document.createElement("link");
xd.rel="alternate";xd.hreflang="x-default";xd.href=base;
xd.setAttribute("data-rs-i18n","hreflang");
document.head.appendChild(xd);
}
function applyLanguage(code,save){
if(!SUPPORTED[code])code="en";
currentLang=code;
if(save)storageSet("language",code);
var html=document.documentElement;
html.setAttribute("lang",code);
html.setAttribute("dir",code==="ar"?"rtl":"ltr");
document.title=t(code,"seo.title");
setMeta('meta[name="description"]',"content",t(code,"seo.desc"));
setMeta('meta[name="twitter:title"]',"content",t(code,"seo.title"));
setMeta('meta[name="twitter:description"]',"content",t(code,"seo.desc"));
var nodes=document.querySelectorAll("[data-i18n]");
for(var i=0;i<nodes.length;i++)setI18nText(nodes[i],t(code,nodes[i].getAttribute("data-i18n")));
var ariaNodes=document.querySelectorAll("[data-i18n-aria]");
for(var j=0;j<ariaNodes.length;j++)ariaNodes[j].setAttribute("aria-label",t(code,ariaNodes[j].getAttribute("data-i18n-aria")));
for(var k=0;k<phraseNodes.length;k++){
var item=phraseNodes[k];
if(document.contains(item.node))item.node.nodeValue=t(code,item.key);
}
applyDynamic(code);
updateWidget(code);
}
function updateWidget(code){
var lang=SUPPORTED[code]||SUPPORTED.en;
var name=document.getElementById("rs-i18n-current");
if(name)name.textContent=lang.name;
var flag=document.querySelector("#rs-i18n-btn .rs-i18n-flag");
if(flag)fillFlag(flag,lang);
var items=document.querySelectorAll("#rs-i18n-list .rs-i18n-item");
for(var i=0;i<items.length;i++){
var on=items[i].getAttribute("data-lang")===code;
items[i].classList.toggle("rs-active",on);
items[i].setAttribute("aria-selected",on?"true":"false");
}
var title=document.getElementById("rs-i18n-menu-title");
if(title)title.textContent=t(code,"menu.title");
}
function buildMenu(){
var list=document.getElementById("rs-i18n-list");
if(!list)return;
var frag=document.createDocumentFragment();
languages.forEach(function(l,idx){
var li=document.createElement("li");
var a=document.createElement("a");
a.className="rs-i18n-item";a.setAttribute("role","option");a.setAttribute("data-lang",l.code);
a.style.animationDelay=(idx*14)+"ms";
var flag=document.createElement("span");
flag.className="rs-flag rs-flag"+(l.flag?"":" rs-flag--none");
flag.innerHTML=(l.flag?'<img src="static/img/flags/'+l.flag+'" alt="" loading="lazy" onerror="this.parentNode.classList.add(\'rs-flag--none\')">':"")+GLOBE;
var nm=document.createElement("span");
nm.className="rs-i18n-name";nm.textContent=l.name;
a.appendChild(flag);a.appendChild(nm);
a.insertAdjacentHTML("beforeend",CHECK);
a.addEventListener("click",function(e){
e.preventDefault();e.stopPropagation();
applyLanguage(l.code,true);
closeMenu();
});
li.appendChild(a);frag.appendChild(li);
});
list.appendChild(frag);
}
function openMenu(){
var root=document.getElementById("rs-i18n-root");
var btn=document.getElementById("rs-i18n-btn");
var menu=document.getElementById("rs-i18n-menu");
if(!root||!btn||!menu)return;
root.classList.add("rs-open");
btn.setAttribute("aria-expanded","true");
menu.setAttribute("aria-hidden","false");
}
function closeMenu(){
var root=document.getElementById("rs-i18n-root");
var btn=document.getElementById("rs-i18n-btn");
var menu=document.getElementById("rs-i18n-menu");
if(!root)return;
root.classList.remove("rs-open");
if(btn)btn.setAttribute("aria-expanded","false");
if(menu)menu.setAttribute("aria-hidden","true");
}
function init(){
buildMenu();
registerPhrases();registerDynamic();
injectHreflang();
applyLanguage(detectLanguage(),false);
var btn=document.getElementById("rs-i18n-btn");
var root=document.getElementById("rs-i18n-root");
if(btn){
btn.addEventListener("click",function(e){
e.stopPropagation();
if(root.classList.contains("rs-open"))closeMenu();else openMenu();
});
}
document.addEventListener("click",function(e){
if(root&&!e.target.closest("#rs-i18n-root"))closeMenu();
});
document.addEventListener("keydown",function(e){
if(e.key==="Escape"||e.keyCode===27)closeMenu();
});
window.addEventListener("blur",closeMenu);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
else init();
})();
