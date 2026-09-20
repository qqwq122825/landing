# Git 直接部署（无需 dist）

**服务器运行 PHP 即可。** 本仓库已经包含浏览器直接使用的 HTML / CSS / JS、Tabler 组件库及模板图片。部署时没有 `npm install`、`npm run build`、Composer 安装或单独上传 `dist` 的步骤。Git 推送后，服务器仍需执行拉取；未配置自动部署。

## 1. 首次安装：克隆到新目录

以下使用 `/www/wwwroot/landing-hub` 举例；换成自己的程序目录。该目标目录应尚不存在，避免与旧站文件混合。

```sh
cd /www/wwwroot
git clone --branch main --single-branch https://github.com/qqwq122825/landing.git landing-hub
cd landing-hub
```

服务器需要 Git、Web 服务及 PHP 8.1+，PHP 扩展包括 PDO SQLite、mbstring、OpenSSL AES-256-GCM、session，以及 `getimagesizefromstring` 图像信息函数。PHP 的受支持版本选择见 [PHP 官方支持表](https://www.php.net/supported-versions.php)。不需要另建 MySQL 数据库。

### 宝塔 / Nginx 一次性设置

1. **网站目录**选择 `/www/wwwroot/landing-hub`，**运行目录**选择 `/public`；实际 Web 文档根目录就是 `/www/wwwroot/landing-hub/public`。不要把 Git 仓库根目录暴露为网站目录。
2. 启用 PHP 解析和 HTTPS，证书对应正式域名。完整 Nginx 示例见 [nginx.conf.example](nginx.conf.example)，按服务器实际路径和 PHP-FPM socket 修改。
3. 伪静态粘贴 [nginx-rewrite.conf](nginx-rewrite.conf) 的内容。不需要给每个 `/p/项目编号` 建目录。Apache 使用仓库内的 `public/.htaccess`，需启用 rewrite。
4. 数据默认保存在程序根目录的 `runtime/`，只让 **PHP-FPM 运行用户**读写。以实际运行用户为 `www` 的新安装为例：

   ```sh
   chown www:www /www/wwwroot/landing-hub/runtime
   chmod 700 /www/wwwroot/landing-hub/runtime
   ```

   `www` 不是通用用户名，先在服务器确认；这些命令只设置数据目录，不对整个代码仓库递归改权限。已有站点的数据文件权限按原运行用户保留。代码由部署用户维护，PHP 只需读取代码。
5. 推荐在 PHP-FPM 池中设置 `HUB_ORIGIN=https://你的域名`、`HUB_DEV=0`。如需让数据独立于代码目录，另外创建私有目录并设置 `HUB_DATA_DIR` 为其绝对路径。配置示例见 [php-fpm.env.example](php-fpm.env.example)，修改后重载相应 PHP-FPM。程序不自动读取 `.env`。数据目录始终放在公开目录之外，也不要从 `public/` 建符号链接指向私有文件。
6. 可先运行只读预检：

   ```sh
   php bin/check.php
   # 使用独立数据目录时，CLI 明确传入和 PHP-FPM 一致的值：
   # HUB_DATA_DIR=/var/lib/landing-hub php bin/check.php
   ```

   预检不安装、不改密、不读数据库内容、不创建文件。若 CLI 和 PHP-FPM 使用不同用户，目录权限结果只代表当前 CLI 用户；使用同一个 PHP 版本和进程用户复核，勿为让检查通过而放宽私有数据权限。
7. 浏览器打开 `https://你的域名/install.php`，再核对网页环境检测、设置管理员并安装。安装后生成私有 `install.lock`。默认凭据只供初始化，正式使用请在安装时设置独立强密码；入口尽量在维护 / 访问限制下完成安装。安装成功后登录总站开户，客户自行填写 APK 地址。

**首次配置完后，后续更新只需备份、Git 拉取和验收，不再上传资源包。**

## 2. 日常更新：保留数据，只拉代码

先使用现有 [备份流程](../README.md#备份与管理账号恢复) 保存一致性数据库快照、密钥和环境配置，同时记录代码版本。CLI 备份要使用和 PHP-FPM 一致的数据目录及运行用户。不要只复制运行中的 `hub.sqlite` 主文件。

```sh
cd /www/wwwroot/landing-hub
git status --short
git rev-parse --short HEAD
# 工作区干净并完成备份后：
git pull --ff-only origin main
php bin/check.php
```

- 数据目录在 `.gitignore` 中；Git 只跟踪 `runtime/.gitkeep`，不会随更新替换数据库、密钥、客户密码或安装锁。**保留 `install.lock`，日常更新不访问安装流程。**
- 有本地代码修改时先核对 `git diff`，再合并或另存自己的修改；不使用强制覆盖或清空未跟踪文件的方式更新。备份和配置放在版本控制之外。
- `public/` 就是现成的运行资源，不是编译产物；新模板的 HTML、图片、样式也必须一起提交。
- 如果 PHP OPcache 关闭了文件时间检查，按服务器配置刷新 OPcache / 重载 PHP。页面重新打开后会使用带内容版本号的业务 CSS / JS。
- 拉取后检查总站登录、原客户登录、模板预览、项目落地页和下载配置；原项目编号与账号应保持原样。
- 暂不包含自动 Git webhook。`git push` 更新 GitHub，服务器执行上述拉取才更新站点。

## 3. 旧压缩包部署转 Git

不要直接在正在服务的旧文件夹里强制套入新仓库。

1. 先备份旧站代码、数据库快照、`secret.key`、`credentials.key`、`install.lock` 与部署环境。记录旧 `HUB_DATA_DIR` 的实际值；不确定时先核对 PHP-FPM 池配置。
2. 将仓库克隆到独立新目录，保留旧站与旧数据目录。新、旧程序只做短时间维护切换，避免同时写入同一份数据。
3. 最省事的保留方式：新站 PHP-FPM 的 `HUB_DATA_DIR` 指向原先的**私有数据目录**，例如 `/旧程序绝对路径/runtime`。确认代码拥有读取权限、PHP 用户拥有数据读写权限，之后保留这个旧目录；也可以在暂停写入后整体迁移数据到独立私有目录，并更新环境配置。
4. 确认新程序读到的是原数据，尤其检查安装锁、原项目及客户账号；不要向空数据目录重新安装来“恢复”客户。
5. 将站点 Web 文档根目录切到新目录的 `public/`，保持原域名、HTTPS 和伪静态。刷新 PHP 缓存并完成下面的验收。

只有明确重新初始化 / 恢复主管理员时才使用安装工具，详见 [网页安装说明](../docs/网页安装说明.md)。源码目录切换不是重新开户，不应改变现有项目编号或密码。

## 4. 上线验收与回退

- `/` 打开总站；已有站点的 `/install.php` 显示安装锁。
- 总站、子账号登录，原项目和数据仍存在；子账号只管理自己的项目。
- `/p/项目编号` 与 `/p/项目编号/admin` 正常，模板的图片 / CSS / JS 无 404。
- 新项目下载地址为空；配置后下载入口进入该项目的 `/dl`。
- `/runtime/hub.sqlite`、`/.git/config`、`/app/bootstrap.php` 等私有路径返回 403 / 404，不暴露文件内容。
- Cloudflare 保持现有代理 / 防护；后台、API、项目 HTML、下载跳转遵守 `no-store`。根目录配置不涉及关闭防护。

此预检及本地测试不等于线上验收。需要回退时先停止写入并保留故障现场，再将 Web 文档根目录切回已保存的代码副本；涉及数据结构变化时按匹配的数据库快照与密钥恢复。不要将旧代码与不兼容的新数据混用。

## 目录与维护规则

| 目录 | 用途 | 服务器处理 |
| --- | --- | --- |
| `app/`、`resources/` | PHP 业务和非公开模板 HTML | 随 Git 拉取，保持在公开目录之外 |
| `public/` | Web 根目录，已就绪的组件库 / 静态资源 / PHP 入口 | 直接使用，无构建步骤 |
| `runtime/` 或 `HUB_DATA_DIR` | 私有数据库、密钥、会话、锁 | 不进 Git，单独备份，保留 |
| `bin/` | PHP 预检、安装、备份与本地开发工具 | 生产不执行 `dev.mjs` |
| `deploy/` | 本指南与服务器配置示例 | 配置需一次性按实际环境设置 |
| `docs/` | 安装指南、历史更新记录 | 不参与运行 |
| `tests/`、`package.json` | 开发自动测试 | 生产无需安装 Node / npm |

旧工作区的独立项目、压缩包不在这个 Git 仓库内，不会传到服务器；后续以 Git 为主交付，历史补丁说明仅供追溯。
