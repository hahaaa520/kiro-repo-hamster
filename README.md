# 🐹 代码仓鼠 · Repo Hamster

> **你写代码，它吃饭。**
> Kiro 鬼点子计划 · 无用之用 / USELESS BUT USEFUL

![代码仓鼠产品界面](deck/shots/app-dashboard-1600.png)

**代码仓鼠**是一个住在 GitHub 仓库里的电子宠物：输入用户名 3 秒领养；提交频率、commit message 与最新 diff 会变成它的体重、心情、饥饿和亲密度；7 天不提交它会 emo，14 天它会离家出走；它还会把你 diff 里漏掉的 bug 藏进腮帮子，并生成一张可分享的「仓鼠体检报告」。

---

## 🌐 在线体验

- **直接玩**：<https://hahaaa520.github.io/kiro-repo-hamster/>
- 演示档案直达：<https://hahaaa520.github.io/kiro-repo-hamster/app/index.html?demo=champion&noloading=1>
- 仓库地址：<https://github.com/hahaaa520/kiro-repo-hamster>

> 在线版是纯静态 Demo，内置演示档案与分享卡；Kiro Hook 联动需要本地运行 `node app/server.mjs`。

---

## ✨ 它能做什么

| 功能 | 说明 |
|---|---|
| 🐹 3 秒领养 | 输入 GitHub 用户名，只读公开仓库；不用登录、不用授权 |
| 📊 四个状态 | 体重 / 心情 / 饥饿 / 亲密度，由提交频率、message、diff 计算 |
| 🌰 投喂瓜子 | 咀嚼动画 + 瓜子粒子；饥饿 −18、体重 +1、心情 +6、亲密度 +2 |
| 🌧️ emo 与出走 | 7 天不提交进入 emo（乌云/眼泪）；14 天空笼子 + 爪印 + 留言 |
| 🦷 腮帮子 bug | 读取最新 diff，输出 ≤3 条轻量提示（hot / medium / mild） |
| 📮 体检报告 | Canvas 生成 1080×1350 分享卡，可保存/发布 |
| 🪝 Kiro Hook | 在 Kiro 里保存代码 → 自动跑测试 → 投喂仓鼠（SSE 实时联动） |
| 📴 断网可演 | 内置卷王 / 摆烂 / 普通三只演示仓鼠，无网络也能完整演示 |

---

## 🚀 快速开始

### 方式 A：免安装（推荐，不需要 Node）

1. 下载/克隆本仓库，保持 `app/` 目录结构
2. 双击 `app/打开演示.bat`
3. 或直接双击 `app/index.html`

> 演示档案：`app/index.html?demo=champion&noloading=1`（`champion` / `lazy` / `normal`）

### 方式 B：本地服务（完整体验，含 Kiro Hook）

```bash
cd app
node server.mjs
# 打开 http://localhost:5173
```

- 演示档案：`http://localhost:5173/?demo=champion&noloading=1`
- 手动投喂：`curl -X POST http://localhost:5173/feed`
- Kiro Hook 模板：`.kiro/hooks/feed-hamster.kiro.hook`

---

## 🖼️ 截图

| 卷王仓鼠 | 摆烂仓鼠（emo） |
|---|---|
| ![](deck/shots/app-champion.png) | ![](deck/shots/app-lazy.png) |

| 投喂状态 | 体检报告 |
|---|---|
| ![](deck/shots/app-eating.png) | ![](deck/shots/card-pure.png) |

---

## 🧠 用 Kiro 开发

整个项目用 **Kiro** 开发，工程配置在 `app/.kiro/` 与 `kiro/`：

- **Quick Spec**：一句话拆成 `requirements.md` / `design.md` / `tasks.md`
- **并行 tasks**：依赖图分波，独立任务同时执行
- **Crew 子 Agent**：仓鼠人格 / commit 考古 / 界面三个 Agent 分工
- **Agent Hooks**：保存代码 → 跑测试 → `POST /feed` → 仓鼠当场进食
- **多模型**：Claude 写人格文案，DeepSeek 审代码，Auto 负责调度

> 一句话：**Kiro Hook 就是它的消化系统。**

Spec 三件套：

- [`app/.kiro/specs/repo-hamster/requirements.md`](app/.kiro/specs/repo-hamster/requirements.md)
- [`app/.kiro/specs/repo-hamster/design.md`](app/.kiro/specs/repo-hamster/design.md)
- [`app/.kiro/specs/repo-hamster/tasks.md`](app/.kiro/specs/repo-hamster/tasks.md)

Hook 模板：

- [`app/.kiro/hooks/feed-hamster.kiro.hook`](app/.kiro/hooks/feed-hamster.kiro.hook)
- [`app/.kiro/hooks/weekly-report.kiro.hook`](app/.kiro/hooks/weekly-report.kiro.hook)

---

## 📦 交付物

| 内容 | 文件 |
|---|---|
| 单文件路演页（动画版） | [`deliver/代码仓鼠-路演.html`](deliver/代码仓鼠-路演.html) |
| 路演 PPT（8 页，含演讲备注） | [`deliver/代码仓鼠-路演.pptx`](deliver/代码仓鼠-路演.pptx) |
| Demo 成果说明 PDF（10 页） | [`deliver/代码仓鼠-Demo成果说明.pdf`](deliver/代码仓鼠-Demo成果说明.pdf) |
| 路演逐字稿（5 分钟 + 30 秒 + Q&A） | [`deliver/路演逐字稿.md`](deliver/路演逐字稿.md) |
| 8 页 Deck 总览 | [`deck/shots/contact-sheet.png`](deck/shots/contact-sheet.png) |

---

## 🗂️ 目录结构

```
.
├─ app/                        产品本体（纯 HTML/CSS/JS，无构建、无依赖）
│  ├─ index.html
│  ├─ css/style.css
│  ├─ js/hamster.js            手写 SVG 仓鼠（四状态 + 动画）
│  ├─ js/engine.js             状态公式 / 文案 / 演示档案
│  ├─ js/app.js                交互 / GitHub / 分享卡 / SSE
│  ├─ server.mjs               静态服务 + /feed + /events（零依赖）
│  └─ .kiro/                   Spec / Hooks / Steering
├─ deck/                       路演源文件与构建脚本
│  ├─ 代码仓鼠-路演.html
│  ├─ build_pptx.py
│  ├─ build_html.mjs
│  ├─ build_demo_pdf.py
│  └─ shots/                   产品截图与 deck 截图
├─ deliver/                    可直接使用的交付物（HTML/PPTX/PDF）
├─ kiro/                       Kiro 工程包与现场方案
└─ serve-root.mjs              deck 本地预览
```

---

## ⚙️ 技术实现

- **纯前端**：原生 HTML / CSS / JavaScript，无框架、无构建步骤、无 npm 依赖
- **仓鼠**：手写内联 SVG，四状态（happy / hungry / emo / eating）+ 呼吸/眨眼/耳朵/爪子/咀嚼/眼泪动画
- **GitHub 数据**：GitHub REST API 只读公开仓库（profile / repos / commits / diff），失败自动回退到演示档案
- **状态公式**：提交频率 + commit message 质量 + 最近 diff → 体重/心情/饥饿/亲密度/状态机
- **腮帮子 bug**：diff 启发式审查（console.log / 空 catch / any / TODO / 硬编码密钥 / 大改动无测试）
- **分享卡**：Canvas 2D 生成 1080×1350 PNG
- **Kiro Hook**：零依赖 Node 服务提供 `POST /feed` + `GET /events`（SSE），Kiro Agent Hook 保存代码时自动投喂

---

## 🎯 活动背景

- 活动：Kiro「鬼点子」计划 · 你的奇思妙想，Kiro 来实现
- 赛道：**无用之用**（USELESS BUT USEFUL）
- 形式：线下 150 分钟极限开发 + 路演评审
- 评分：脑洞 35% + Kiro 深度 35% + 交付 30%
- 时间：2026.10

---

## 📌 说明

- 只读公开 GitHub 数据，不登录、不写数据库、不在前端存密钥
- 内置演示档案，断网也能完整演示
- 这是一个「没什么用」的创意项目：**它没什么用，但你会因为它，想多写一行好代码。**

---

<p align="center"><b>代码仓鼠 · 你写代码，它吃饭。</b></p>
