# Kiro 安装 / 登录 / 现场使用说明

> 本机已装好：**Kiro IDE 1.4.13**（`%LOCALAPPDATA%\Programs\Kiro`）+ **Kiro CLI 2.33.1**（`%LOCALAPPDATA%\Kiro-Cli`，已加入用户 PATH）。
> 工程目录：`代码仓鼠/app`（内含 `.kiro` Spec / Hooks / Steering）。

---

## 一、为什么本机没登录成功

Kiro 的登录门户是 `https://app.kiro.dev`。这台机器命令行能访问，但当前浏览器打不开该页面（网络环境问题），所以 OAuth 授权走不完。

**但不影响比赛**：线下赛「活动现场提供 Kiro 账号」（IDE 账号），到场直接登录即可，不需要提前在家里登录。

---

## 二、现场怎么用（推荐）

1. 到场领取 Kiro 账号，打开 Kiro IDE 或终端。
2. 打开工程目录：`代码仓鼠/app`。Kiro 会自动加载：
   - `.kiro/specs/repo-hamster/`：requirements / design / tasks
   - `.kiro/hooks/`：feed-hamster / weekly-report
   - `.kiro/steering/`：product / tech / structure
3. 在 Kiro 里新建一个 Chat 或按 Spec 继续，直接说：

> 读取 `.kiro/specs/repo-hamster/` 三件套，按 `tasks.md` 的波次核对当前工程；运行本地服务，自测 `/feed` 与页面；修掉发现的问题；最后输出 `KIRO-验收报告.md`。

4. 演示 Hook：把 `.kiro/hooks/feed-hamster.kiro.hook` 放进 Kiro Hooks 面板（或用 Kiro CLI），保存代码时自动跑测试 + 投喂。

---

## 三、如果之后想在别的网络登录

用能访问 `app.kiro.dev` 的网络（VPN / 手机热点），任选：

```powershell
# CLI 浏览器登录（会拉起浏览器）
kiro-cli login --social github
kiro-cli login --social google

# 或设备码方式（CLI 会给 Code，在 https://app.kiro.dev/device 输入）
kiro-cli login --social github --use-device-flow
```

登录成功后验证：

```powershell
kiro-cli whoami
kiro-cli chat --list-models
```

然后让 Kiro 跑工程：

```powershell
cd "D:\校外活动 三掌柜\代码仓鼠\app"
kiro-cli chat --no-interactive --trust-all-tools "读取 .kiro/specs/repo-hamster 三件套，按 tasks.md 验证工程，运行服务并自测 /feed 与页面，修复问题，最后写 KIRO-验收报告.md"
```

---

## 四、安装包与路径

| 内容 | 路径 |
|---|---|
| Kiro IDE 安装包（209 MB，已验签） | `代码仓鼠/tools/kiro-ide-1.4.13-win32-x64.exe` |
| Kiro IDE | `%LOCALAPPDATA%\Programs\Kiro\Kiro.exe` |
| Kiro CLI | `%LOCALAPPDATA%\Kiro-Cli\kiro-cli.exe` |
| CLI 官方安装脚本 | `https://cli.kiro.dev/install.ps1` |
| 工程 | `代码仓鼠/app` |

安装包可用于拷到自己的笔记本安装，避免现场排队/网络问题。

---

## 五、注意

- 线下赛规则要求「项目主体现场开发（自有代码组件复用不限）」，`app/` 请当组件库 + 参考实现使用，页面主体与交互现场用 Kiro 重组。
- 如果现场 Kiro 账号也无法登录，直接用已完成的成品演示 + 录屏兜底（`deliver/` 里都有）。
