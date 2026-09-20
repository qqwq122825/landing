# Tabler 1.5.1 — 本地预编译组件库

- 上游：https://github.com/tabler/tabler
- 官方文档：https://docs.tabler.io/ui/getting-started/installation
- 来源：npm 官方包 `@tabler/core@1.5.1` 内的 `dist/css/tabler.min.css` 与 `dist/js/tabler.min.js`，原样保留。
- 包完整性：`sha512-PI9rJq4H4lBh53YP/J+m5Uz6lqVQbsGPmWCMN34IP4KQQ/wy28YMO6a3Eiz1cQHdFFr+3MlU3yYhXdzvFGJfqw==`
- CSS SHA-256：`6aa5677e9cfc2620405bf97a98074ba43ff06a411cb35c5337acfb56d124c273`
- JS SHA-256：`d4c4c2768f166c308391e0cea44db593056f12b84a4eeef46d55e35ca46d6e60`
- 许可证：MIT，见本目录 `LICENSE`（取自上游仓库）；原始发行文件的版权声明保留；另附随组件使用的 Bootstrap 与 Popper MIT 许可证（`LICENSE-bootstrap`、`LICENSE-popper`）。

JS 已包含 Bootstrap 组件，不需要另引入 Bootstrap。CSS 使用系统字体，没有外部字体请求。仅引入这两个文件，不引入打包内未使用的第三方插件。

部署和日常开发均不需要 npm install 或前端编译。升级组件库时下载新的固定版本，核验来源、许可证和校验和，并完整回归弹窗、菜单、表单及移动端。
