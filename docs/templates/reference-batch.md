# 参考后台模板移植 · 2026-09-21

## 本次实际交付

参考账号显示 35 款。本批新增 **14 款平台适配版**；总站从 4 款变为 **18 款**。已有 ReelShort / MinuteDrama 不重复新增。下面“接入”表示已接入平台与测试链路，不表示所有页面的每个细节都完成逐像素 1:1 验收。

| 参考编号 | 名称 | 本站 ID | 语言状态 |
| --- | --- | --- | --- |
| 68 | GGTV | `ggtv` | en 参考主体语言，zh 部分映射 |
| 69 | Google Play / 应用详情 | `appstore` | en 参考主体语言，zh 部分映射 |
| 74 | Ultra Play | `ultraplay` | hi 参考主体语言，zh 部分映射 |
| 77 | Yacine TV | `yacinetv` | fr 参考主体语言，zh 部分映射 |
| 83 | DPTV / 电视介绍 | `dptvplus` | en 参考主体语言，zh 部分映射 |
| 85 | Fizzio Live | `fizzio` | en / hi 部分双语，zh 部分 |
| 88 | KYSS | `kyss` | en 参考主体语言，zh 部分映射 |
| 90 | Sparkle | `sparkle` | en 参考主体语言，zh 部分映射 |
| 92 | NEW-F | `newf` | en / es / fr 主要界面，zh 部分 / 英文回退 |
| 93 | Soccer Queens | `soccerqueens` | en 参考主体语言，zh 部分映射 |
| 96 | Netflix Gratis / 影视目录 | `cinema` | es 参考主体语言，zh 部分映射 |
| 100 | NOXX TV | `noxxtv` | en 参考主体语言，zh 部分映射 |
| 101 | SmartTrade | `smarttrade` | en 参考主体语言，zh 部分映射 |
| 102 | StockVault | `stockvault` | en 参考主体语言，zh 部分映射 |

每款有同名 Markdown 接入记录；`reference-batch.json` 为本批测试清单，不替代运行时注册表。

## 其余 21 个参考入口（含 2 个已有）

- 72 ReelShort、98 MinuteDrama：已有对应模板。
- 70 KuaiBo：有引导关闭系统防护 / 特殊权限的安装流程，本批未移植。
- 73 Tik APK、76 交友、82 Cyber Heart Show、89 印度：素材、正文及交互继续核查，未注册到总站。76 / 82 观察到主要媒体缺失，来源页本身未形成完整可比对页面。
- 71 LoveApp、75 qiyou、78 STRIPCHAT、79 Porm Paradise、80 Pornhub、81 Chatee Live Now、84 Cosplay、87 Lusty Live、91 NightPlay、94 Website Bokep、97 XHAMSTER、99 MyLive：成人内容入口未移植。
- 86 Promotions、95 ApuestaMX：博彩推广入口未移植。

## 热链与请求头

- 14 款图片 / 海报以参考站 `alphapundits.com/landing-static/` 和原页面已观察到的媒体域名热链为主；仓库只新增 HTML、CSS、适配 JS 和少量 SVG 占位图。
- 普通跨域 `<img>` 展示不要求同源。当前已可直接加载的资源保持原链接，没有添加伪造 Referer / Origin、放宽本站 CORS 或新增图片代理。
- Referer / Origin 由浏览器管理，给本站响应加头不等于远端解除防盗链。若后续热链失效，需记录具体响应及允许的媒体来源后处理；热链不承诺长期可用。
- NOXX 原首屏 6 个背景是无效 `&` 地址；用其页面中已存在的对应剧集海报作背景。这是已记录的视觉差异，不是已恢复原横版图。
- 图片上的品牌 / 字幕不等于可编辑 DOM 插槽，Soccer Queens 整页活动海报特别保留原字样。

## 功能及测试范围

- 每款都接上当前项目下载入口、公共 Pixel、第一方统计、独立名称 / 图标、逐账号权限和两种预览；不沿用源站安装包、固定 Pixel ID、支付或账号 API。
- APK / Pixel 新项目默认空；新增模板不自动给旧账号扩大权限。
- `npm test`：178 项通过。改动 PHP / JS 语法检查、全部本地样式 / 脚本依赖检查和只读 `php bin/check.php` 均通过。
- 本地浏览器：14 款实际页面均验证首个可见下载按钮真实跳转到 QA 目标，SDK 替身记录一次 `PageView` + 一次 `DownloadClick`。
- 其余下载位置由标记扫描及公共事件监听器测试覆盖；并非每张海报都在浏览器中手工点击。
- 全局 / 项目预览 HTTP 均通过；浏览器实际检查 GGTV 全局预览、DPTV 介绍页项目预览，点击预览下载不跳转、不上报。
- 浏览器检查 390px 手机及 1280px 桌面，无页面级横向滚动。320 / 768 / 1440px 视口工具返回的真实宽度不一致，本次不声称已验证这些断点。
- NEW-F 英 / 西 / 法主界面字典接入，法语手机和桌面排版、西语切换及刷新保持已检查；Fizzio 保留英 / 印地语节点。各模板的中文均为部分映射，未宣称完整常用多语言适配。
- 品牌四种组合 HTTP 检查，全部模板长名称 + 测试图标浏览器 DOM 检查。嵌在海报中的字样和营销正文不自动替换。
- 只用隔离数据库和本地 SDK 替身，未向真实 Meta 账号发送测试事件；生产接收未验证。

## 残留差异与部署

保留主要布局、色彩和媒体，不保留第三方业务脚本。详情按钮使用本站统一弹窗，部分轮播改为手动 / 原生滚动，语言仍有混排和回退。金融页面为静态行情样例，交友聊天和评分均为展示素材，正式运营需替换为真实业务内容。

已在只含 Git 暂存内容的干净副本中运行预检及 178 项测试，全部通过。代码随 Git 交付，无构建步骤、无额外部署压缩包。本次没有操作生产服务器或改 Cloudflare / Nginx 配置；服务器拉取后还需按逐账号模板权限开放。
