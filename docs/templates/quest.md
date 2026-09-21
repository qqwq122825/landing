# Quest / Pasion TV 接入记录

## 来源与范围
- 来源：https://questmasterx.cyou/；核查日期：2026-09-21。
- 模板 ID：`quest`；默认应用名称：`Pasion TV`；资源：`public/themes/quest/`。
- 浏览器检查了首页 DOM、可见桌面页面、390px 手机断点、下载弹窗的 DOM 结构和页面样式。未取得或使用服务端源码。
- 复刻范围：黑橙配色、50px 固定页头、滚动公告、三项特点、2:3 竖版卡片、HD/VIP 角标、底部下载条、深色圆角下载弹窗；目录海报按原站 1:1 使用其 CDN 动图地址。布局断点与原站保持：320px 一列、390px 两列、550–767px 三列、768px 起四列，内容最大宽度 1200px。
- 海报：原站缩略图托管在第三方 CDN `imagex1.sx.cdn.live`（CDN77），不是 `questmasterx.cyou` 本机；格式为 **动态 WebP**（非 GIF）。模板直接热链该 CDN（带 `?width=620`），以保留动效并与参考站视觉一致。仍不携带原站固定 Pixel ID、APK / 下载脚本或其他第三方运行时；下载与 Pixel 继续走本站公共实现。
- 差异：页面独立实现；新增真实的标题搜索、语言菜单、键盘可操作的原生 dialog。没有伪造播放进度、认证标识、热度/点赞统计或上门服务宣传。点击海报打开内容/下载提示，不播放视频。CDN 图源若防盗链、变更或下线，预览会出现破图，属热链风险。
- 首屏 8 张示例卡片，加载更多后共 10 张；角标 `VIP` 仅为模板视觉示例，不接入收费会员系统。底部明确标注示例目录。
- CSS、JS、功能图标 SVG 为本站实现。默认播放图标不含参考站的图像素材。

## 原站语言核查
- 首页 `lang="es"`；桌面及手机可见文案为西班牙语。
- 当前 DOM 未发现语言菜单、语言链接或语言选项。页头菜单/搜索/用户为图标元素；没有据此声称原站具备四语支持。
- 原站隐藏下载弹窗 DOM 文案也是西语；尚未逐设备验证原站弹窗运行分支。未验证浏览器语言自动识别和语言持久化行为。

| 原站语言 | 菜单 | 正文 | 下载/弹窗 | 手机布局 | RTL | 结论 |
| --- | --- | --- | --- | --- | --- | --- |
| es | 未见 | 已观察 | 下载按钮与弹窗 DOM 为西语 | 390px 两列 | 不适用 | 已观察范围为西语；完整交互分支未全部验证 |
| 其他 | 未见 | 未验证 | 未验证 | 未验证 | 未验证 | 不声明原站支持 |

## 本地实现
- 品牌：`HUB_TEMPLATE_NAMES['quest'] = 'Pasion TV'`；默认图标 `logo.svg`。品牌槽覆盖页头、菜单、固定下载栏图标、弹窗图标/名称、favicon、apple-touch-icon。
- 默认页头使用 `Pasion` + 橙色 `TV` 字标；有自定义名称时整个字标变为项目名称。页头和下载栏的独立图标默认隐藏，上传项目图标后显示；菜单和弹窗有默认播放图标。海报和功能图标不是品牌插槽。
- 名称与图标独立回退，长名称换行/省略处理，图标 `contain` 不拉伸。无选择文件不清空原图标，沿用公共品牌脚本。
- 本次支持简体中文 `zh`、英语 `en`、西语 `es`、葡语 `pt` 的全部界面键；中/英/葡为平台扩展，不属于原站已验证能力。四种语言均为 LTR；不声明 RTL、繁中或其他语言支持。
- 有 `lang` 参数：有效代码优先，未知代码明确回退 es；无参数：按项目保存的选择 → 浏览器语言 → es。区域代码如 en-US / pt-BR 归并基础语言，zh 统一简体界面。选择语言使用 `history.replaceState`，保留项目路径及其他查询参数。
- 文案位于 `i18n.js`，静态界面、搜索空状态、加载更多、弹窗、辅助名称、复制提示均使用字典键；剧名和海报内文字保留原文，不声称这些内容已四语翻译。复制失败提示从地址栏手动复制。
- 真正下载入口仅两个：底部下载按钮、弹窗最终下载按钮，都有 `.download-link`，指向项目 `/p/{slug}/dl`。菜单、语言、搜索、海报、复制、加载更多不计下载。
- 经 `render_landing()` 注入且仅注入一份公共 `brand-settings.js`、`collector.js`；模板不重复初始化 Pixel。空/无效 ID、预览、显式暂停维持公共规则。
- 下载地址默认留空；无配置时 `/dl` 返回未配置提示；有配置才进行 302。未增加默认 APK 或参考站回退链接。
- 已登记模板目录、默认品牌、全局预览、项目预览白名单、总站开户/详情/权限卡片、子账号卡片与名称映射、只读部署预检。
- `HUB_DEFAULT_TEMPLATES` 固定历史默认的 Feiyue/DPTV；既有 `allowed_templates` 与历史迁移保持不变。新模板需总站主动勾选开放，新开户选 Quest 时同时勾选其开放权限。没有批量修改现有客户。

## 验证与交付
- 海报改为 CDN 热链后，本地不再保留 `public/themes/quest/posters/`；自动测试只检查主题 CSS / JS / i18n / logo 与 CDN 地址写入。
- 修改的 PHP / JS 逐文件语法检查；`php bin/check.php` 只读预检；`git diff --check`。
- 浏览器验证实际落地页、总站全局预览、项目预览；确认热链动图可加载。测试全部使用独立临时数据，不改现有客户数据。
- 交付以 Git 源码为准；线上站点部署需服务器拉取本次代码。CDN 图源若防盗链、变更或下线会导致破图，属已知热链风险。

### 海报素材对应（参考站 CDN 热链）

来源页：[questmasterx.cyou](https://questmasterx.cyou/)。图片主机：`imagex1.sx.cdn.live`（响应头可见 CDN77）。模板目录卡片在 `quest.js` 的 `catalog` 中写死以下地址，运行时不再请求本地 `posters/`。

| 序号 | 标题 / ID | CDN 地址 |
| --- | --- | --- |
| 1 | 29109800 | `https://imagex1.sx.cdn.live/images/pinporn/2023/03/22/29109800.webp?width=620` |
| 2 | 24048352 | `https://imagex1.sx.cdn.live/images/pinporn/2020/11/28/24048352.webp?width=620` |
| 3 | 26322428 | `https://imagex1.sx.cdn.live/images/pinporn/2021/12/01/26322428.webp?width=620` |
| 4 | 26379889 | `https://imagex1.sx.cdn.live/images/pinporn/2021/12/12/26379889.webp?width=620` |
| 5 | 28462238 | `https://imagex1.sx.cdn.live/images/pinporn/2022/11/27/28462238.webp?width=620` |
| 6 | 29762614 | `https://imagex1.sx.cdn.live/images/pinporn/2023/07/24/29762614.webp?width=620` |
| 7 | 23068299 | `https://imagex1.sx.cdn.live/images/pinporn/2020/05/23/23068299.webp?width=620` |
| 8 | 29246787 | `https://imagex1.sx.cdn.live/images/pinporn/2023/04/17/29246787.webp?width=620` |
| 9 | 28294480 | `https://imagex1.sx.cdn.live/images/pinporn/2022/10/27/28294480.webp?width=620` |
| 10 | 25820627 | `https://imagex1.sx.cdn.live/images/pinporn/2021/09/03/25820627.webp?width=620` |
