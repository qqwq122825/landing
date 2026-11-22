# ENSA / XVIDEOS 接入记录

## 来源与范围
- 来源 URL / 检查日期：`https://dah910c.site/ensa/`，2026-11-23。
- 模板 ID / 显示名：`ensa` / `ENSA / XVIDEOS`；默认品牌名 `XVIDEOS`。
- 已观察视觉：黑色背景、橙色渐变按钮、双栏首屏、横向热门卡片、15 张内容卡、视频、评论、下载弹层、手机底部 CTA。
- 展示媒体策略：18 张 JPG 与 1 个 WebM 直接热链参考站；以总站域名作为 Referer 抽样请求均为 HTTP 200。未下载 APK，也未复制参考站的 Pixel 或统计初始化。
- 版权、素材授权与对外声明由实际运营方确认；本记录只说明技术来源。

## 原站语言核查
- 页面 `lang=id`，正文为印度尼西亚语；桌面与手机均未观察到语言选择器。
- 未观察到 URL / Cookie / localStorage 语言切换，也未观察到其他语言正文。
- 本次忠实保留印度尼西亚语单语界面；剧名、人名与图片内容保持来源展示，不声称多语言支持。

## 本地实现
- 品牌插槽：页头图片字标（`data-hub-wordmark` + `data-hub-logo`）、favicon、apple-touch-icon、页脚名称。
- 48 个真实下载入口全部是静态 `.download-link`，由服务端改写为当前项目 `/p/{slug}/dl`；卡片查看器、关闭按钮不是下载入口。
- 删除 MeetU 下载 SDK、固定 APK 查询、参考站 Pixel / Meta SDK、Cloudflare beacon；只使用总站公共 `brand-settings.js` 与 `collector.js`。
- 新模板登记在目录首位；历史默认模板仍为 `feiyue` / `dptv`，既有账号权限与选择不自动扩大。

## 验证与交付
- 需执行 `npm test`、PHP / JS 语法、`php bin/check.php`、独立数据目录权限 / 预览 / Pixel 替身、320 / 390 / 768 / 1440 浏览器检查。
- 线上部署状态：待本次提交与部署后更新。
