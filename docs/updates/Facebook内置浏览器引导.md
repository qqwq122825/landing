# Facebook 内置浏览器直接唤起系统浏览器

更新日期：2026-10-15

## 当前行为

- 所有经 `render_landing()` 输出的真实项目落地页共用 `public/assets/in-app-browser.js`。
- 脚本检测 Facebook、Instagram 和 Messenger 的 Android 内置浏览器；Facebook 审核爬虫不参与。
- 页面打开时不显示提示、遮罩或弹窗。
- 用户点击真实 `.download-link` 后，脚本读取 PHP 已经写入 HTML 的最终 `/p/{slug}/dl` 地址，并立即通过 Android `intent://` 请求系统默认浏览器打开该下载路由。
- Intent 不锁定 Chrome 包名，交给 Android 选择当前可处理网页的系统浏览器。
- 总站预览、客户预览、普通外部浏览器、禁用按钮和非下载链接均不受影响。
- iOS 不支持 APK 安装，也没有网页可强制唤起 Safari 的通用公开协议，因此不显示提示且保留链接的普通行为。

## 下载地址边界

- PHP 在输出落地页之前，把所有带有 `.download-link` 标记的静态下载入口直接写成当前项目的 `/p/{slug}/dl`。
- Intent 使用用户实际点击的最终项目下载路由，不使用模板来源站的下载地址，也不先显示旧地址再替换。
- DPTV 参考页捕获时残留的旧项目下载地址已经从模板、适配脚本和渲染器中清除。
- 语言、搜索、法律链接和内容卡片不会被误改为下载入口。
- `alphapundits.com/landing-static/` 仅作为展示媒体热链，不参与 APK 下载和跳转。
