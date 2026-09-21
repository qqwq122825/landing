# 参考后台模板移植 · 2026-09-21

## 批次说明

参考账号显示 35 款。已有 ReelShort / MinuteDrama 对应 `feiyue` / `dptv`。其余参考入口分两批接入平台；“接入”表示已接入下载 / Pixel / 权限 / 预览链路，不表示每个细节都完成逐像素 1:1 验收。

当前总站已登记模板 = 原有 4 款（feiyue / dptv / quest / aivideo）+ 参考移植 **33** 款。`reference-batch.json` 为本批测试清单，不替代运行时注册表。

## 第一批（14 款）

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

## 第二批（19 款）

| 参考编号 | 名称 | 本站 ID | 备注 |
| --- | --- | --- | --- |
| 70 | KuaiBo | `kuaibo` | 主视觉 / 下载区已对齐；**不含**关闭 Play Protect、跳过扫描、无障碍等安全绕过安装引导 |
| 71 | LoveApp | `loveapp` | 成人目录；媒体热链 |
| 73 | Tik APK | `tikapk` | |
| 75 | qiyou | `qiyou` | 成人目录；媒体热链 |
| 76 | 交友 | `jiaoyou` | |
| 78 | STRIPCHAT | `stripchat` | 成人目录；媒体热链 |
| 79 | Porm Paradise | `pornparadise` | 成人目录；媒体热链 |
| 80 | Pornhub | `pornhub` | 成人目录；媒体热链 |
| 81 | Chatee Live Now | `chatee` | 成人目录；媒体热链 |
| 82 | Cyber Heart Show | `cyberheart` | 首批「媒体缺失」为闸门页误判；主层 9 格 MP4 热链可用，已补自动播放与爱心动效 |
| 84 | Cosplay | `cosplay` | 成人目录；媒体热链 |
| 86 | Promotions | `promotions` | 博彩 / 游戏推广外观 |
| 87 | Lusty Live | `lustylive` | 成人目录；媒体热链 |
| 89 | 印度 | `india` | 来源极薄；全屏海报 + CTA，缺口见接入记录 |
| 91 | NightPlay | `nightplay` | 成人目录；媒体热链 |
| 94 | Website Bokep | `bokep` | 成人目录；媒体热链 |
| 95 | ApuestaMX | `apuestamx` | 博彩推广外观 |
| 97 | XHAMSTER | `xhamster` | 成人目录；媒体热链 |
| 99 | MyLive | `mylive` | 成人目录；媒体热链 |

未再单独保留的参考编号：72 ReelShort、98 MinuteDrama（已有对应模板）。

## 热链与请求头

- 展示图片 / 海报以参考站 `alphapundits.com/landing-static/` 及原页已观察到的媒体域名热链为主；仓库只新增 HTML、CSS、适配 JS 和少量 SVG 占位图。
- 普通跨域 `<img>` 展示不要求同源。当前可直接加载的资源保持原链接，没有添加伪造 Referer / Origin、放宽本站 CORS 或新增图片代理。
- Referer / Origin 由浏览器管理；热链不承诺长期可用。
- NOXX 原首屏 6 个背景是无效 `&` 地址；用其页面中已存在的对应剧集海报作背景。这是已记录的视觉差异。
- 图片上的品牌 / 字幕不等于可编辑 DOM 插槽。

## 功能及测试范围

- 每款都接上当前项目下载入口、公共 Pixel、第一方统计、独立名称 / 图标、逐账号权限和两种预览；不沿用源站安装包、固定 Pixel ID、支付或账号 API。
- APK / Pixel 新项目默认空；新增模板不自动给旧账号扩大权限。
- `node --test tests/reference-templates.test.mjs`：覆盖 `reference-batch.json` 全部条目；`php bin/check.php` 只读预检。
- 只用隔离数据库和本地 SDK 替身，未向真实 Meta 账号发送测试事件。

## 残留差异与部署

保留主要布局、色彩和媒体，不保留第三方业务脚本。详情按钮使用本站统一弹窗，部分轮播改为手动 / 原生滚动，语言仍有混排和回退。KuaiBo 不含安全绕过安装步骤；Cyber Heart / 印度按来源可用壳迁移。金融与博彩页面为静态展示样例，正式运营需替换为真实业务内容。

代码随 Git 交付，无构建步骤。服务器拉取后还需按逐账号模板权限开放。
