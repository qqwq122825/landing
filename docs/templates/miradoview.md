# MiradoView 模板接入记录

- 参考入口：`https://appmiradoview.com/?pl=pl_mvba0q4b_3b95cf545e`
- 实际跳转：`https://plusmiradoview.com/?pl=pl_mvba0q4b_3b95cf545e`
- 核查日期：2026-10-18
- 模板编号：`miradoview`
- 默认显示名：`MiradoView`

## 页面与语言

参考页面为西班牙语（`es-MX`），未发现可操作的语言选择器。本站按已观察到的单一西班牙语页面接入，没有宣称额外语言版本。桌面与 390 × 844 手机视口均核查：固定字标、沉浸式首屏、三组内容卡片、下载区、功能区与页脚会按视口自适应。

## 素材与交互

页面保留 34 张内容图和 1 张首屏背景图，来源为 `plusmiradoview.com/landing-assets/`。核查时所有 URL 在本站来源 Referer 下均返回 HTTP 200，因此按模板规范热链；本地只保存独立 SVG 图标、CSS 与交互脚本。

目标页页头默认只有 `MiradoView` 文字字标，没有前置方形图标。本站默认预览保持这一结构；本地 SVG 只作为 favicon 与品牌图标回退资源，客户上传自定义图标后才在页头字标前显示该图标。

页面有 2 个真实下载入口，全部标记为 `.download-link`。PHP 在响应 HTML 前把它们统一写成当前项目 `/p/{slug}/dl`，所以浏览器收到页面时下载地址已经完成，不再依赖前端替换。34 张内容卡片与“Mas Info”由模板脚本拦截默认链接行为并平滑滚动到下载区；这样即使总站注入了模板资源 `<base>`，也不会错误跳到 `/themes/miradoview/#download`，且不触发下载。

MiradoView 的 CSS 与交互脚本使用版本化查询参数；模板更新后浏览器和 CDN 会请求新版本，避免旧缓存继续保留页头或“Mas Info”行为。

参考页面自带的 Meta Pixel、归因接口、运行时下载地址、跳转脚本及其 Pixel ID 均已移除。本站只注入公共 `brand-settings.js`、`collector.js` 与项目自己的 Pixel ID / 下载路由。

## 抓取 UA 核查与收录控制

分别以桌面浏览器、移动浏览器、Googlebot 和 `facebookexternalhit` User-Agent 请求目标页面，均得到 HTTP 200、约 37 KB 的完整 HTML 与同一主标题。参考页面的运行时数据会记录 `isCrawler`，并带 `googlebot` 的 `noindex` 元信息，但没有观察到“爬虫返回空壳、真人返回完整页面”的差异响应。

本站新增的是标准、可一键关闭的“禁止搜索引擎收录”项目开关：

- 开启：对所有 User-Agent 返回同一完整页面，同时输出 `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex` 与同值 `<meta name="robots">`。
- 关闭：不输出项目级收录限制。
- 模板预览继续使用原有 `noindex, nofollow` 头。

该实现不按 User-Agent 隐藏、删减或替换正文。
