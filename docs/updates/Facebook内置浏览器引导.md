# Facebook 内置浏览器引导

更新日期：2026-10-15

## 实现范围

- 所有经 `render_landing()` 输出的真实项目落地页共用 `public/assets/in-app-browser.js`。
- 检测 Facebook、Instagram 和 Messenger 内置浏览器的 User-Agent，自动显示“请使用系统浏览器打开”引导。
- Android 按钮使用 `intent://` 请求系统的可浏览应用打开当前 HTTPS 页面；不锁定某个浏览器包名。
- iOS 提供复制当前页面链接按钮，并保留右上角菜单中“在浏览器中打开”的操作提示。
- 用户暂时关闭引导后，再次点击真实 `.download-link` 会阻止内置浏览器直连 APK，并重新显示引导。
- 总站全局预览和客户项目预览不显示引导；普通 Chrome、Safari 等外部浏览器不受影响。

## 交互与兼容

引导提供中文、英文、西班牙文和葡萄牙文文案，其他语言回退英文。实现不改写 APK 下载地址、不伪装响应头，仍由项目的 `/p/{slug}/dl` 统一跳转到客户配置的地址。Android 内置浏览器或系统策略可能拒绝 Intent，所以页面始终显示右上角手动打开说明。
