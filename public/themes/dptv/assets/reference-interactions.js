
	let isDownloading = false;

	function downloadApp() {
	    
		if (isDownloading) return;
		isDownloading = true;

		window.location.href = window.APP_CONFIG.apkUrl;
		setTimeout(() => {
			isDownloading = false;
		}, 5000);
	}

    function openDownloadModal(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const modal = document.getElementById('forceModal');
        if (!modal) {
            downloadApp();
            return false;
        }
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        return false;
    }

    function closeDownloadModal(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const modal = document.getElementById('forceModal');
        if (modal) {
            modal.style.display = 'none';
        }
        document.body.style.overflow = '';
        return false;
    }

    function handleLandingSearch(event) {
        if (event) {
            event.preventDefault();
        }
        openDownloadModal(event);
        return false;
    }


        function getLanguage() {
            const path = window.location.pathname;
            const match = path.match(/\/([a-z]{2,3}(?:-[a-z]{2})?)(?:\/|$)/);
            return match ? match[1] : 'en';
        }

        function updateCurrentLanguage() {
            const currentLanguageElement = document.getElementById('desktopCurrentLanguage');
            if (!currentLanguageElement) {
                return;
            }

            const currentLang = getLanguage();
            const languageData = [{ "language": "ru", "name": "Russian" }, { "language": "de", "name": "Deutsch" }, { "language": "en", "name": "English" }, { "language": "fr", "name": "Français" }, { "language": "es", "name": "Español" }, { "language": "fil", "name": "Filipino" }, { "language": "pt", "name": "Português" }, { "language": "ko", "name": "한국어" }, { "language": "th", "name": "ไทย" }, { "language": "ms", "name": "Bahasa Melayu" }, { "language": "id", "name": "Bahasa Indonesia" }, { "language": "ja", "name": "日本語" }, { "language": "zh", "name": "简体中文" }, { "language": "zh-tw", "name": "繁體中文" }];
            const currentLangData = languageData.find(lang => lang.language === currentLang);
            if (currentLangData) {
                currentLanguageElement.textContent = currentLangData.name;
                document.querySelectorAll('.language-btn').forEach(btn => {
                    if (btn.dataset.lang === currentLang) {
                        btn.classList.add('text-[#FF4463]');
                        btn.classList.remove('text-gray-300');
                    } else {
                        btn.classList.remove('text-[#FF4463]');
                        btn.classList.add('text-gray-300');
                    }
                });
            }
        }

        document.addEventListener('DOMContentLoaded', function () {
            updateCurrentLanguage();
            updateAuthButtons();
            updateVipButtons();
            updateVipButtonsHref();
        });

        function updateAuthButtons() {
            const isLoggedIn = checkLoginStatus();

            const desktopLoginBtn = document.getElementById('desktopLoginBtn');
            const desktopProfileBtn = document.getElementById('desktopProfileBtn');

            const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
            const sidebarRegisterBtn = document.getElementById('sidebarRegisterBtn');
            const sidebarProfileBtn = document.getElementById('sidebarProfileBtn');

            if (isLoggedIn) {
                if (desktopLoginBtn) desktopLoginBtn.classList.add('hidden');
                if (desktopProfileBtn) desktopProfileBtn.classList.remove('hidden');

                if (sidebarLoginBtn) sidebarLoginBtn.classList.add('hidden');
                if (sidebarRegisterBtn) sidebarRegisterBtn.classList.add('hidden');
                if (sidebarProfileBtn) sidebarProfileBtn.classList.remove('hidden');
            } else {
                if (desktopLoginBtn) desktopLoginBtn.classList.remove('hidden');
                if (desktopProfileBtn) desktopProfileBtn.classList.add('hidden');

                if (sidebarLoginBtn) sidebarLoginBtn.classList.remove('hidden');
                if (sidebarRegisterBtn) sidebarRegisterBtn.classList.remove('hidden');
                if (sidebarProfileBtn) sidebarProfileBtn.classList.add('hidden');
            }
        }

        function checkLoginStatus() {
            const userToken = localStorage.getItem('userToken');
            const userData = localStorage.getItem('userData');
            return !!(userToken && userData);
        }

        function updateVipButtonsHref() {
            try {
                const currentPageUrl = window.location.href;
                const separator = (url) => (url.indexOf('?') === -1 ? '?' : '&');
                const setHref = (el) => {
                    if (!el || typeof el.getAttribute !== 'function') return;
                    const base = el.getAttribute('href') || el.href || '';
                    if (!base) return;
                    el.setAttribute('href', base + separator(base) + 'redirect=' + encodeURIComponent(currentPageUrl));
                };
                setHref(document.getElementById('desktopVipBtn'));
                setHref(document.getElementById('mobileVipBtn'));
                setHref(document.getElementById('sidebarVipBtn'));
                setHref(document.getElementById('desktopProfileBtn'));
                setHref(document.getElementById('sidebarProfileBtn'));
            } catch (e) {
                console.warn('[navbar] updateVipButtonsHref failed:', e);
            }
        }

        function updateVipButtons() {
            const mobileVipBtn = document.getElementById('mobileVipBtn');
            const desktopVipBtn = document.getElementById('desktopVipBtn');
            const sidebarVipBtn = document.getElementById('sidebarVipBtn');

            const cachedVipInfo = localStorage.getItem('vipInfo');
            let isVip = false;

            if (cachedVipInfo) {
                try {
                    const vipInfo = JSON.parse(cachedVipInfo);
                    isVip = vipInfo.status === 1;
                } catch (e) {
                    console.error('Failed to parse vipInfo:', e);
                }
            }

            if (isVip) {
                if (mobileVipBtn) mobileVipBtn.style.display = 'none';
                if (desktopVipBtn) desktopVipBtn.style.display = 'none';
                if (sidebarVipBtn) sidebarVipBtn.style.display = 'none';
            } else {
                if (mobileVipBtn) mobileVipBtn.style.display = '';
                if (desktopVipBtn) desktopVipBtn.style.display = '';
                if (sidebarVipBtn) sidebarVipBtn.style.display = '';
            }
        }

        function toggleMobileMenu() {
            const mobileMenu = document.getElementById('mobileMenu');
            const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
            const mobileMenuContent = document.getElementById('mobileMenuContent');
            const isRTL = document.documentElement.dir === 'rtl';

            const isHidden = mobileMenu.classList.contains('hidden');

            if (isHidden) {
                if (isRTL) {
                    mobileMenuContent.style.right = '0';
                    mobileMenuContent.style.left = 'auto';
                    mobileMenuContent.style.transform = 'translateX(100%)';
                } else {
                    mobileMenuContent.style.left = '0';
                    mobileMenuContent.style.right = 'auto';
                    mobileMenuContent.style.transform = 'translateX(-100%)';
                }

                mobileMenu.classList.remove('hidden');
                mobileMenu.offsetHeight;
                mobileMenuOverlay.classList.remove('opacity-0');
                mobileMenuContent.style.transform = 'translateX(0)';
            } else {
                mobileMenuOverlay.classList.add('opacity-0');
                if (isRTL) {
                    mobileMenuContent.style.transform = 'translateX(100%)';
                } else {
                    mobileMenuContent.style.transform = 'translateX(-100%)';
                }
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                }, 300);
            }
        }

        var categoryDataLoaded = false;
        var categoryData = null;
        var languageCodeNavbar = "en";
        var channelNavbar = "";

        function getLandingCategories() {
            return [
                {
                    id: 'genres',
                    name: 'Genres',
                    subCategories: [
                        { name: 'Romance' },
                        { name: 'Revenge' },
                        { name: 'Mystery' },
                        { name: 'Strong Women' }
                    ]
                },
                {
                    id: 'moments',
                    name: 'When to watch',
                    subCategories: [
                        { name: 'Commute' },
                        { name: 'Chai break' },
                        { name: 'Evening' },
                        { name: 'Weekend' }
                    ]
                }
            ];
        }

        // 渲染分类列表
        function renderCategories(categories) {
            var primaryContainer = document.getElementById('categoryPrimary');
            var secondaryContainer = document.getElementById('categorySecondary');

            if (!primaryContainer || !secondaryContainer) return;

            // 清空容器
            primaryContainer.innerHTML = '';
            secondaryContainer.innerHTML = '';

            // 渲染一级分类
            categories.forEach(function (category, index) {
                // 一级分类项
                var primaryItem = document.createElement('div');
                primaryItem.className = 'category-primary-item' + (index === 0 ? ' active' : '');
                primaryItem.setAttribute('data-category', category.id);
                primaryItem.innerHTML = '<span>' + category.name + '</span><i class="fas fa-chevron-right"></i>';
                primaryContainer.appendChild(primaryItem);

                // 二级分类列表
                var secondaryList = document.createElement('div');
                secondaryList.className = 'category-secondary-list' + (index === 0 ? ' active' : '');
                secondaryList.setAttribute('data-parent', category.id);

                if (category.subCategories && category.subCategories.length > 0) {
                    category.subCategories.forEach(function (subCategory) {
                        var link = document.createElement('a');
                        link.className = 'category-secondary-item';
                        link.href = '#download';
                        link.onclick = openDownloadModal;
                        link.textContent = subCategory.name;
                        secondaryList.appendChild(link);
                    });
                }

                secondaryContainer.appendChild(secondaryList);
            });

            // 绑定交互事件
            bindCategoryEvents();
        }

        // 绑定一级分类的 hover 事件
        function bindCategoryEvents() {
            var primaryItems = document.querySelectorAll('.category-primary-item');
            var secondaryLists = document.querySelectorAll('.category-secondary-list');

            primaryItems.forEach(function (item) {
                item.addEventListener('mouseenter', function () {
                    var category = this.getAttribute('data-category');

                    // 移除所有 active 状态
                    primaryItems.forEach(function (el) {
                        el.classList.remove('active');
                    });
                    secondaryLists.forEach(function (el) {
                        el.classList.remove('active');
                    });

                    // 添加当前 active 状态
                    this.classList.add('active');
                    var targetList = document.querySelector('.category-secondary-list[data-parent="' + category + '"]');
                    if (targetList) {
                        targetList.classList.add('active');
                    }
                });
            });
        }

        // 加载分类数据
        async function loadCategoryData() {
            if (categoryDataLoaded) return;

            var loading = document.getElementById('categoryLoading');
            var dropdown = document.getElementById('categoryDropdown');

            try {
                categoryData = getLandingCategories();
                categoryDataLoaded = true;

                // 渲染分类
                renderCategories(categoryData);

                // 隐藏 loading，显示内容
                if (loading) loading.style.display = 'none';
                if (dropdown) dropdown.style.display = 'flex';

            } catch (error) {
                console.error('[分类下拉] 加载失败:', error);
                // 显示错误提示
                if (loading) {
                    loading.innerHTML = '<span style="color: rgba(255,255,255,0.5); font-size: 14px;">Could not load</span>';
                }
            }
        }

        // 初始化：监听下拉菜单显示
        var dropdownShowTimer = null;
        var dropdownHideTimer = null;
        var isDropdownReady = false;
        var hasLeftOnce = false; // 是否已经离开过下拉区域一次

        function showDropdown() {
            var menu = document.getElementById('shortDropdownMenu');
            var arrow = document.querySelector('#shortDropdownContainer .nav-tab-arrow');

            if (menu) menu.classList.add('is-visible');
            if (arrow) arrow.classList.add('is-rotated');

            loadCategoryData();
        }

        function hideDropdown() {
            var menu = document.getElementById('shortDropdownMenu');
            var arrow = document.querySelector('#shortDropdownContainer .nav-tab-arrow');

            if (menu) menu.classList.remove('is-visible');
            if (arrow) arrow.classList.remove('is-rotated');
        }

        function initCategoryDropdown() {
            var dropdownContainer = document.getElementById('shortDropdownContainer');

            if (!dropdownContainer) return;

            // 检测鼠标初始是否在下拉区域内
            var rect = dropdownContainer.getBoundingClientRect();
            var initialMouseCheck = function (e) {
                // 检查鼠标是否在下拉区域外
                if (e.clientX < rect.left || e.clientX > rect.right ||
                    e.clientY < rect.top || e.clientY > rect.bottom) {
                    hasLeftOnce = true;
                }
                document.removeEventListener('mousemove', initialMouseCheck);
            };

            // 监听一次鼠标移动来判断初始位置
            document.addEventListener('mousemove', initialMouseCheck);

            // 延迟后才允许显示
            setTimeout(function () {
                isDropdownReady = true;
            }, 500);

            dropdownContainer.addEventListener('mouseenter', function () {
                // 必须满足：1. 已准备好 2. 已经离开过一次（排除页面刷新时鼠标已在区域内的情况）
                if (!isDropdownReady || !hasLeftOnce) return;

                // 清除隐藏定时器
                if (dropdownHideTimer) {
                    clearTimeout(dropdownHideTimer);
                    dropdownHideTimer = null;
                }

                // 设置显示延迟（100ms，防止快速滑过时闪烁）
                dropdownShowTimer = setTimeout(function () {
                    showDropdown();
                }, 100);
            });

            dropdownContainer.addEventListener('mouseleave', function () {
                // 标记已经离开过
                hasLeftOnce = true;

                // 清除显示定时器
                if (dropdownShowTimer) {
                    clearTimeout(dropdownShowTimer);
                    dropdownShowTimer = null;
                }

                // 设置隐藏延迟（150ms，给用户移动到菜单的时间）
                dropdownHideTimer = setTimeout(function () {
                    hideDropdown();
                }, 150);
            });
        }

        // 页面加载完成后初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCategoryDropdown);
        } else {
            initCategoryDropdown();
        }

        // ========== 移动端分类下拉菜单 ==========
        var mobileCategoryDataLoaded = false;
        var mobileCategoryData = null;

        function toggleMobileCategoryDropdown(event) {
            if (event) event.stopPropagation();

            var menu = document.getElementById('mobileCategoryMenu');
            var arrow = document.getElementById('mobileCategoryArrow');

            if (!menu) return;

            var isVisible = menu.classList.contains('is-visible');

            if (isVisible) {
                closeMobileCategoryDropdown();
            } else {
                menu.classList.add('is-visible');
                if (arrow) arrow.classList.add('is-rotated');
                loadMobileCategoryData();
            }
        }

        function closeMobileCategoryDropdown() {
            var menu = document.getElementById('mobileCategoryMenu');
            var arrow = document.getElementById('mobileCategoryArrow');

            if (menu) menu.classList.remove('is-visible');
            if (arrow) arrow.classList.remove('is-rotated');
        }

        async function loadMobileCategoryData() {
            if (mobileCategoryDataLoaded) return;

            var loading = document.getElementById('mobileCategoryLoading');
            var content = document.getElementById('mobileCategoryContent');

            try {
                mobileCategoryData = getLandingCategories();
                mobileCategoryDataLoaded = true;

                renderMobileCategories(mobileCategoryData);

                if (loading) loading.style.display = 'none';
                if (content) content.style.display = 'flex';

            } catch (error) {
                console.error('[移动端分类] 加载失败:', error);
                if (loading) {
                    loading.innerHTML = '<span style="color: rgba(255,255,255,0.5); font-size: 14px;">Could not load</span>';
                }
            }
        }

        function renderMobileCategories(categories) {
            var content = document.getElementById('mobileCategoryContent');
            if (!content || !categories || categories.length === 0) return;

            // 创建左侧一级分类列表
            var primaryHtml = '<div class="mobile-category-primary">';
            categories.forEach(function (cat, index) {
                primaryHtml += '<div class="mobile-category-primary-item' + (index === 0 ? ' active' : '') + '" data-category="' + cat.id + '">' + cat.name + '</div>';
            });
            primaryHtml += '</div>';

            // 创建右侧二级分类列表
            var secondaryHtml = '<div class="mobile-category-secondary">';
            categories.forEach(function (cat, index) {
                secondaryHtml += '<div class="mobile-category-secondary-list' + (index === 0 ? ' active' : '') + '" data-parent="' + cat.id + '">';
                if (cat.subCategories && cat.subCategories.length > 0) {
                    cat.subCategories.forEach(function (sub) {
                        secondaryHtml += '<a class="mobile-category-secondary-item" href="index.html#download" onclick="return openDownloadModal(event)">' + sub.name + '</a>';
                    });
                }
                secondaryHtml += '</div>';
            });
            secondaryHtml += '</div>';

            content.innerHTML = primaryHtml + secondaryHtml;

            // 绑定一级分类点击事件
            bindMobileCategoryEvents();
        }

        function bindMobileCategoryEvents() {
            var primaryItems = document.querySelectorAll('.mobile-category-primary-item');
            var secondaryLists = document.querySelectorAll('.mobile-category-secondary-list');

            primaryItems.forEach(function (item) {
                item.addEventListener('click', function () {
                    var categoryId = this.getAttribute('data-category');

                    // 移除所有 active
                    primaryItems.forEach(function (el) { el.classList.remove('active'); });
                    secondaryLists.forEach(function (el) { el.classList.remove('active'); });

                    // 添加当前 active
                    this.classList.add('active');
                    var targetList = document.querySelector('.mobile-category-secondary-list[data-parent="' + categoryId + '"]');
                    if (targetList) targetList.classList.add('active');
                });
            });
        }

        // 点击页面其他地方关闭移动端分类下拉菜单
        document.addEventListener('click', function (e) {
            var menu = document.getElementById('mobileCategoryMenu');
            var container = document.getElementById('mobileCategoryContainer');

            if (menu && menu.classList.contains('is-visible')) {
                // 点击的不是下拉容器内的元素则关闭
                if (container && !container.contains(e.target)) {
                    closeMobileCategoryDropdown();
                }
            }
        });

        function toggleLanguageDropdown(dropdownId, arrowId) {
            const dropdown = document.getElementById(dropdownId);
            const arrow = document.getElementById(arrowId);
            const isHidden = dropdown.classList.contains('hidden');

            if (isHidden) {
                dropdown.classList.remove('hidden', 'opacity-0', 'invisible');
                arrow.style.transform = 'rotate(180deg)';
            } else {
                dropdown.classList.add('hidden', 'opacity-0', 'invisible');
                arrow.style.transform = 'rotate(0deg)';
            }
        }

        function toggleSidebarLanguageDropdown() {
            toggleLanguageDropdown('sidebarLanguageDropdown', 'sidebarLanguageArrow');
        }

        function toggleDesktopLanguageDropdown() {
            const dropdown = document.getElementById('desktopLanguageDropdown');
            const arrow = document.getElementById('desktopLanguageArrow');
            const button = event.target.closest('button');
            const isRTL = document.documentElement.dir === 'rtl';

            if (dropdown.style.display === 'none' || dropdown.style.display === '') {
                const rect = button.getBoundingClientRect();
                if (isRTL) {
                    dropdown.style.left = rect.left + 'px';
                } else {
                    dropdown.style.left = (rect.right - 128) + 'px';
                }
                dropdown.style.top = (rect.bottom + 4) + 'px';
                dropdown.style.display = 'block';
                arrow.style.transform = 'rotate(180deg)';
            } else {
                dropdown.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            }
        }

        document.addEventListener('click', (e) => {
            const sidebarDropdown = document.getElementById('sidebarLanguageDropdown');
            const sidebarButton = document.querySelector('button[onclick="toggleSidebarLanguageDropdown()"]');
            if (sidebarDropdown && !sidebarDropdown.classList.contains('hidden') &&
                !e.target.closest('#sidebarLanguageDropdown') && !e.target.closest('button[onclick="toggleSidebarLanguageDropdown()"]')) {
                sidebarDropdown.classList.add('hidden', 'opacity-0', 'invisible');
                document.getElementById('sidebarLanguageArrow').style.transform = 'rotate(0deg)';
            }

            const desktopDropdown = document.getElementById('desktopLanguageDropdown');
            if (desktopDropdown && desktopDropdown.style.display === 'block' &&
                !e.target.closest('#desktopLanguageDropdown') && !e.target.closest('button[onclick="toggleDesktopLanguageDropdown()"]')) {
                desktopDropdown.style.display = 'none';
                document.getElementById('desktopLanguageArrow').style.transform = 'rotate(0deg)';
            }
        });

        function goToLogin(event) {
            event.preventDefault();
            openDownloadModal(event);
        }

        function goToRegister(event) {
            event.preventDefault();
            openDownloadModal(event);
        }

    

            (function () {
                'use strict';

                const MOBILE_BREAKPOINT = 768;
                let isLoadingMore = false;
                let currentPage = 1;
                let hasMoreData = false;
                let scrollLoadTimer = null;
                let loadedCategoryIds = new Set();
                const languageCode = 'en';
                const channel = '';

                /* =============== Banner 轮播 =============== */
                function initBanner() {
                    const carousel = document.querySelector('[data-md-banner]');
                    if (!carousel) return;

                    const track = carousel.querySelector('.md-banner-track');
                    const slides = Array.from(carousel.querySelectorAll('.md-banner-slide'));
                    const dots = Array.from(carousel.querySelectorAll('.md-banner-dot'));
                    const prevBtn = carousel.querySelector('.md-banner-arrow--prev');
                    const nextBtn = carousel.querySelector('.md-banner-arrow--next');

                    if (!track || slides.length === 0) return;

                    let currentIndex = 0;
                    let autoplayTimer = null;

                    function goTo(index) {
                        const total = slides.length;
                        currentIndex = (index + total) % total;

                        slides.forEach(function (slide, i) {
                            slide.classList.toggle('is-active', i === currentIndex);
                        });
                        dots.forEach(function (dot, i) {
                            dot.classList.toggle('is-active', i === currentIndex);
                        });
                    }

                    function next() {
                        goTo(currentIndex + 1);
                    }

                    function prev() {
                        goTo(currentIndex - 1);
                    }

                    function startAutoplay() {
                        stopAutoplay();
                        autoplayTimer = window.setInterval(next, 5000);
                    }

                    function stopAutoplay() {
                        if (autoplayTimer) {
                            window.clearInterval(autoplayTimer);
                            autoplayTimer = null;
                        }
                    }

                    if (nextBtn) {
                        nextBtn.addEventListener('click', function () {
                            next();
                            startAutoplay();
                        });
                    }
                    if (prevBtn) {
                        prevBtn.addEventListener('click', function () {
                            prev();
                            startAutoplay();
                        });
                    }

                    dots.forEach(function (dot, index) {
                        dot.addEventListener('click', function () {
                            goTo(index);
                            startAutoplay();
                        });
                    });

                    /* 触摸滑动（主要用于手机端） */
                    let touchStartX = 0;
                    let touchMoved = false;

                    if (track) {
                        track.addEventListener('touchstart', function (e) {
                            if (!e.touches || e.touches.length !== 1) return;
                            touchMoved = false;
                            touchStartX = e.touches[0].clientX;
                        }, { passive: true });

                        track.addEventListener('touchmove', function () {
                            touchMoved = true;
                        }, { passive: true });

                        track.addEventListener('touchend', function (e) {
                            if (!touchMoved) return;
                            if (!e.changedTouches || e.changedTouches.length !== 1) return;
                            var deltaX = e.changedTouches[0].clientX - touchStartX;
                            if (Math.abs(deltaX) > 40) {
                                if (deltaX < 0) {
                                    next();
                                } else {
                                    prev();
                                }
                                startAutoplay();
                            }
                        }, { passive: true });
                    }

                    goTo(0);
                    startAutoplay();
                }

                /* =============== 横向剧集列表 =============== */
                function initRows() {
                    const rows = Array.from(document.querySelectorAll('[data-md-row]'));
                    if (!rows.length) return;

                    rows.forEach(function (row) {
                        setupRow(row);
                    });
                }

                function setupRow(rowEl) {
                    const track = rowEl.querySelector('.md-row-track');
                    const cards = Array.from(rowEl.querySelectorAll('.md-card'));
                    const prevBtn = rowEl.querySelector('.md-row-arrow--prev');
                    const nextBtn = rowEl.querySelector('.md-row-arrow--next');

                    if (!track || cards.length === 0) return;

                    var state = {
                        index: 0,
                        itemsPerView: 6,
                        step: 6,
                        cardWidth: 0,
                        gap: 12
                    };

                    function computeConfig() {
                        var isMobile = window.innerWidth < MOBILE_BREAKPOINT;
                        state.itemsPerView = isMobile ? 3 : 6;
                        state.step = isMobile ? 3 : 6;
                        // 移动端间距 10px，PC端间距 12px
                        state.gap = isMobile ? 10 : 12;

                        var viewportWidth = rowEl.querySelector('.md-row-viewport').offsetWidth;
                        // 移动端左右边距 10px，PC端左右边距 50px
                        var sidePadding = isMobile ? 10 : 50;

                        // 总预留空间：左边距 + (n-1)个间距 + 右边距
                        // 移动端：10 + 2*10 + 10 = 40px
                        // PC端：50 + 5*12 + 50 = 160px
                        var totalReserved = sidePadding * 2 + (state.itemsPerView - 1) * state.gap;
                        state.cardWidth = (viewportWidth - totalReserved) / state.itemsPerView;

                        var maxStart = Math.max(0, cards.length - state.itemsPerView);
                        if (state.index > maxStart) {
                            state.index = maxStart;
                        }
                    }

                    function applyCardWidths() {
                        cards.forEach(function (card, i) {
                            card.style.width = state.cardWidth + 'px';
                            card.style.flex = '0 0 auto';
                            var isMobile = window.innerWidth < MOBILE_BREAKPOINT;
                            var sidePadding = isMobile ? 10 : 50;
                            var halfGap = state.gap / 2;

                            if (i === 0) {
                                card.style.marginLeft = sidePadding + 'px';
                                card.style.marginRight = halfGap + 'px';
                            } else if (i === cards.length - 1) {
                                card.style.marginLeft = halfGap + 'px';
                                card.style.marginRight = sidePadding + 'px';
                            } else {
                                card.style.marginLeft = halfGap + 'px';
                                card.style.marginRight = halfGap + 'px';
                            }
                        });
                    }

                    function update() {
                        var maxStart = Math.max(0, cards.length - state.itemsPerView);
                        var scrollOffset = 0;

                        if (state.index > 0 && cards[0]) {
                            var isMobile = window.innerWidth < MOBILE_BREAKPOINT;
                            var sidePadding = isMobile ? 10 : 50;

                            var itemStep = state.cardWidth + state.gap;

                            if (state.index >= maxStart) {
                                var lastCard = cards[cards.length - 1];
                                var lastCardStyle = window.getComputedStyle(lastCard);
                                var lastCardMarginRight = parseFloat(lastCardStyle.marginRight) || 0;
                                var trackWidth = track.scrollWidth + lastCardMarginRight;
                                var viewportWidth = rowEl.querySelector('.md-row-viewport').offsetWidth;
                                scrollOffset = trackWidth - viewportWidth;
                            } else {
                                scrollOffset = sidePadding + state.index * itemStep;
                            }
                        }
                        track.style.transform = 'translateX(-' + scrollOffset + 'px)';

                        if (prevBtn) {
                            prevBtn.style.display = state.index <= 0 ? 'none' : 'flex';
                        }
                        if (nextBtn) {
                            nextBtn.style.display = state.index >= maxStart ? 'none' : 'flex';
                        }

                        rowEl.classList.toggle('is-scrollable', maxStart > 0);
                    }

                    function goNext() {
                        var maxStart = Math.max(0, cards.length - state.itemsPerView);
                        if (state.index >= maxStart) return;
                        state.index = Math.min(state.index + state.step, maxStart);
                        update();
                    }

                    function goPrev() {
                        if (state.index <= 0) return;
                        state.index = Math.max(0, state.index - state.step);
                        update();
                    }

                    if (nextBtn) {
                        nextBtn.addEventListener('click', goNext);
                    }
                    if (prevBtn) {
                        prevBtn.addEventListener('click', goPrev);
                    }

                    computeConfig();
                    applyCardWidths();
                    update();

                    var onResize = debounce(function () {
                        computeConfig();
                        applyCardWidths();
                        update();
                    }, 150);

                    window.addEventListener('resize', onResize);
                }

                function debounce(fn, delay) {
                    var timer = null;
                    return function () {
                        if (timer) {
                            window.clearTimeout(timer);
                        }
                        timer = window.setTimeout(function () {
                            fn();
                        }, delay);
                    };
                }

                /* =============== 图片懒加载 =============== */
                function initializeLazyLoading() {
                    const imageObserver = new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const img = entry.target;
                                const src = img.dataset.src;
                                if (src) {
                                    img.src = src;
                                    img.dataset.src = '';
                                    observer.unobserve(img);
                                }
                            }
                        });
                    }, {
                        rootMargin: '50px 0px',
                        threshold: 0.1
                    });

                    document.querySelectorAll('img[data-src]').forEach(img => {
                        imageObserver.observe(img);
                    });
                }

                /* =============== 下拉加载更多 =============== */
                function initScrollLoadMore() {
                    if (!hasMoreData) {
                        return;
                    }
                    loadedCategoryIds = new Set();
                    document.querySelectorAll('.md-section[data-category-id]').forEach(section => {
                        const id = section.getAttribute('data-category-id');
                        if (id) {
                            loadedCategoryIds.add(String(id));
                        }
                    });
                    window.addEventListener('scroll', handleScrollLoad);
                }

                function handleScrollLoad() {
                    if (scrollLoadTimer) {
                        window.clearTimeout(scrollLoadTimer);
                    }
                    scrollLoadTimer = window.setTimeout(checkScrollPosition, 100);
                }

                function checkScrollPosition() {
                    if (isLoadingMore || !hasMoreData) {
                        return;
                    }
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const windowHeight = window.innerHeight;
                    const documentHeight = document.documentElement.scrollHeight;

                    if (scrollTop + windowHeight >= documentHeight - 200) {
                        loadMoreCategories();
                    }
                }

                async function loadMoreCategories() {
                    if (isLoadingMore || !hasMoreData) {
                        return;
                    }
                    isLoadingMore = true;
                    showLoadingIndicator();

                    try {
                        const nextPage = currentPage + 1;
                        const apiUrl = buildNextPageUrl(nextPage);
                        const response = await fetch(apiUrl, {
                            method: 'POST'
                        });

                        if (!response.ok) {
                            hasMoreData = false;
                            showLoadCompleteIndicator();
                            return;
                        }

                        const data = await response.json();
                        if (data && data.resultCode === 0 && data.dataResult && Array.isArray(data.dataResult.categoryInfos)) {
                            appendCategorySections(data.dataResult.categoryInfos);
                            currentPage = nextPage;
                            hasMoreData = !!data.dataResult.hasMore;
                            if (!hasMoreData) {
                                showLoadCompleteIndicator();
                            }
                        } else {
                            hasMoreData = false;
                            showLoadCompleteIndicator();
                        }
                    } catch (error) {
                        console.error('[home_v2] load more failed:', error);
                        hasMoreData = false;
                        showLoadCompleteIndicator();
                    } finally {
                        isLoadingMore = false;
                        hideLoadingIndicator();
                    }
                }

                function buildNextPageUrl(pageNum) {
                    const path = channel ? `/f/${channel}/${languageCode}/home/pageNum/${pageNum}` : `/${languageCode}/home/pageNum/${pageNum}`;
                    return `${window.location.origin}${path}`;
                }

                function appendCategorySections(categoryInfos) {
                    if (!categoryInfos || categoryInfos.length === 0) {
                        return;
                    }
                    const container = document.querySelector('.md-home-v2-inner');
                    if (!container) {
                        return;
                    }
                    const insertBeforeTarget = document.getElementById('scrollLoadIndicator') || document.getElementById('loadCompleteIndicator');

                    categoryInfos.forEach(category => {
                        if (!category || !category.categoryId) {
                            return;
                        }
                        const categoryId = String(category.categoryId);
                        if (loadedCategoryIds.has(categoryId)) {
                            return;
                        }
                        const tvs = Array.isArray(category.tvs) ? category.tvs : [];
                        if (tvs.length === 0) {
                            loadedCategoryIds.add(categoryId);
                            return;
                        }
                        const section = buildCategorySection(category);
                        if (insertBeforeTarget) {
                            container.insertBefore(section, insertBeforeTarget);
                        } else {
                            container.appendChild(section);
                        }
                        loadedCategoryIds.add(categoryId);
                        const row = section.querySelector('[data-md-row]');
                        if (row) {
                            setupRow(row);
                        }
                    });

                    initializeLazyLoading();
                }

                function buildCategorySection(category) {
                    const section = document.createElement('section');
                    section.className = 'md-section';
                    section.setAttribute('aria-label', category.categoryName || '');
                    section.setAttribute('data-category-id', category.categoryId);

                    const header = document.createElement('div');
                    header.className = 'md-section-header';

                    const headerLink = document.createElement('a');
                    headerLink.className = 'md-section-link';
                    headerLink.href = category.link || '#';

                    const title = document.createElement('h2');
                    title.className = 'md-section-title';
                    title.textContent = category.categoryName || '';

                    const arrow = document.createElement('span');
                    arrow.className = 'md-section-arrow';
                    arrow.innerHTML = '<i class="fas fa-chevron-right"></i>';

                    headerLink.appendChild(title);
                    headerLink.appendChild(arrow);
                    header.appendChild(headerLink);
                    section.appendChild(header);

                    const row = document.createElement('div');
                    row.className = 'md-row';
                    row.setAttribute('data-md-row', '');

                    const prevBtn = document.createElement('button');
                    prevBtn.className = 'md-row-arrow md-row-arrow--prev';
                    prevBtn.type = 'button';
                    prevBtn.setAttribute('aria-label', 'Previous dramas');
                    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

                    const viewport = document.createElement('div');
                    viewport.className = 'md-row-viewport';

                    const track = document.createElement('div');
                    track.className = 'md-row-track';

                    (category.tvs || []).forEach(tv => {
                        const card = document.createElement('a');
                        card.className = 'md-card';
                        card.href = tv.link || '#';

                        const cardInner = document.createElement('div');
                        cardInner.className = 'md-card-inner';

                        const poster = document.createElement('div');
                        poster.className = 'md-card-poster';

                        const img = document.createElement('img');
                        img.src = '/default.png';
                        if (tv.coverUrl) {
                            img.setAttribute('data-src', tv.coverUrl);
                        }
                        img.alt = tv.title || '';
                        img.onerror = function () {
                            this.onerror = null;
                            this.src = '/default.png';
                        };

                        const overlay = document.createElement('div');
                        overlay.className = 'md-card-overlay';

                        const play = document.createElement('div');
                        play.className = 'md-card-play';
                        play.innerHTML = '<i class="fas fa-play"></i>';

                        poster.appendChild(img);
                        poster.appendChild(overlay);
                        poster.appendChild(play);
                        cardInner.appendChild(poster);
                        card.appendChild(cardInner);
                        track.appendChild(card);
                    });

                    viewport.appendChild(track);

                    const nextBtn = document.createElement('button');
                    nextBtn.className = 'md-row-arrow md-row-arrow--next';
                    nextBtn.type = 'button';
                    nextBtn.setAttribute('aria-label', 'Next dramas');
                    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

                    row.appendChild(prevBtn);
                    row.appendChild(viewport);
                    row.appendChild(nextBtn);

                    section.appendChild(row);

                    return section;
                }

                function showLoadingIndicator() {
                    const indicator = document.getElementById('scrollLoadIndicator');
                    if (indicator) {
                        indicator.style.display = 'flex';
                    }
                }

                function hideLoadingIndicator() {
                    const indicator = document.getElementById('scrollLoadIndicator');
                    if (indicator) {
                        indicator.style.display = 'none';
                    }
                }

                function showLoadCompleteIndicator() {
                    const indicator = document.getElementById('loadCompleteIndicator');
                    if (indicator) {
                        indicator.style.display = 'block';
                    }
                }

                /* =============== 设置导航栏背景为透明 =============== */
                var navbarInitialized = false;
                var navbarElement = null;
                var navbarInnerDiv = null;

                function setNavbarTransparent() {
                    const deviceType = window.deviceType || 'Android';
                    if (deviceType !== 'Desktop') {
                        return;
                    }
                    navbarElement = document.getElementById('top-navbar');
                    if (navbarElement) {
                        navbarElement.classList.remove('bg-black');
                        navbarElement.classList.add('bg-transparent');
                        // 同时修改内部容器
                        navbarInnerDiv = navbarElement.querySelector('.bg-black');
                        if (navbarInnerDiv) {
                            navbarInnerDiv.classList.remove('bg-black');
                            navbarInnerDiv.classList.add('bg-transparent');
                        }
                        navbarInitialized = true;
                        // 初始化滚动监听
                        initNavbarScrollListener();
                    }
                    // 让内容区域向上移动，使导航栏覆盖在内容上
                    var homeContainer = document.querySelector('.md-home-v2');
                    if (homeContainer) {
                        homeContainer.style.marginTop = '0px';
                    }
                }

                /* =============== 导航栏滚动监听 =============== */
                function initNavbarScrollListener() {
                    if (!navbarInitialized || !navbarElement) return;

                    var scrollStart = 0;    // 开始渐变的位置
                    var scrollEnd = 150;    // 完全变黑的位置

                    function updateNavbarBackground() {
                        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                        // 计算透明度（0 到 1）
                        var opacity = 0;
                        if (scrollTop <= scrollStart) {
                            opacity = 0;
                        } else if (scrollTop >= scrollEnd) {
                            opacity = 1;
                        } else {
                            opacity = (scrollTop - scrollStart) / (scrollEnd - scrollStart);
                        }

                        // 移除 Tailwind 类，使用内联样式
                        navbarElement.classList.remove('bg-black', 'bg-transparent');
                        navbarElement.style.backgroundColor = 'rgba(0, 0, 0, ' + opacity + ')';

                        if (navbarInnerDiv) {
                            navbarInnerDiv.classList.remove('bg-black', 'bg-transparent');
                            navbarInnerDiv.style.backgroundColor = 'rgba(0, 0, 0, ' + opacity + ')';
                        }
                    }

                    window.addEventListener('scroll', updateNavbarBackground);
                    // 初始检查
                    updateNavbarBackground();
                }

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function () {
                        initBanner();
                        initRows();
                        initScrollLoadMore();

                        // 初始化图片懒加载
                        initializeLazyLoading();

                        // 设置导航栏透明
                        setNavbarTransparent();

                        // 如果 window.deviceType 还未设置，延迟执行
                        if (typeof window.deviceType === 'undefined') {
                            setTimeout(function () {
                                setNavbarTransparent();
                            }, 100);

                            // 轮询检查 deviceType
                            var checkCount = 0;
                            var checkInterval = setInterval(function () {
                                checkCount++;
                                if (typeof window.deviceType !== 'undefined' || checkCount > 10) {
                                    clearInterval(checkInterval);
                                    setNavbarTransparent();
                                }
                            }, 100);
                        }

                        document.addEventListener('click', function (e) {
                            const dramaLink = e.target && e.target.closest && (e.target.closest('a.md-card') || e.target.closest('div.md-banner-slide'));
                            if (dramaLink) {
                                if (window.dataLayer && typeof window.dataLayer.push === 'function') {
                                    window.dataLayer.push({ event: 'landpage_play' });
                                }
                            }
                        });
                    });
                } else {
                    initBanner();
                    initRows();
                    initScrollLoadMore();

                    // 初始化图片懒加载
                    initializeLazyLoading();

                    // 设置导航栏透明
                    setNavbarTransparent();

                    // 如果 window.deviceType 还未设置，延迟执行
                    if (typeof window.deviceType === 'undefined') {
                        setTimeout(function () {
                            setNavbarTransparent();
                        }, 100);

                        // 轮询检查 deviceType
                        var checkCount = 0;
                        var checkInterval = setInterval(function () {
                            checkCount++;
                            if (typeof window.deviceType !== 'undefined' || checkCount > 10) {
                                clearInterval(checkInterval);
                                setNavbarTransparent();
                            }
                        }, 100);
                    }
                }
            })();
        

        document.addEventListener('click', function (event) {
            if (event.target && event.target.id === 'forceModal') {
                closeDownloadModal(event);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeDownloadModal(event);
            }
        });
    