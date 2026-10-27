# design.md · 代码仓鼠（repo-hamster）

> Kiro Feature Spec 的「设计」产物。技术选型刻意简单：无构建、无框架、无数据库，保证 150 分钟内能跑通、断网不翻车。

## 1. 架构

```
浏览器（原生 HTML/CSS/JS）
├─ js/hamster.js   手写 SVG 仓鼠 + 图标 + Logo（4 种状态：happy/hungry/emo/eating）
├─ js/engine.js    数据 → 状态 → 文案；3 只演示仓鼠；本地兜底
├─ js/app.js       领养 / 渲染 / 投喂 / 分享卡 / SSE Hook / 错误兜底
└─ css/style.css   奶油纸感设计系统 + 仓鼠动画

可选本地 Node 服务 server.mjs（零依赖）
├─ 静态托管：http://localhost:5173
├─ GET  /events  SSE：向页面广播投喂事件
├─ POST /feed    供 Kiro Agent Hook 调用
└─ GET  /health
```

- 数据源：GitHub REST API（`api.github.com` 支持 CORS，前端直连）。
- 无构建步骤；Node 仅用于静态托管与 Hook 投喂，不用也能直接打开 index.html。
- 断网时 app 自动回退到内置演示档案（`Engine.demo()`）。

## 2. 文件清单

| 文件 | 职责 |
|---|---|
| `app/index.html` | 单页结构：舞台 / 领养面板 / 报告面板 / 数据面板 / 加载 / Toast / 模态 |
| `app/css/style.css` | 设计 token、布局、卡片、动效、响应式 |
| `app/js/hamster.js` | `Hamster.svg(state)`、`Hamster.logo()`、图标 |
| `app/js/engine.js` | `Engine.demo / local / fromGitHub`、状态公式、文案、周报、分享卡数据 |
| `app/js/app.js` | 交互、GitHub 请求、bug 启发式、分享卡 Canvas、SSE |
| `app/server.mjs` | 静态服务 + `/feed` + `/events` |
| `app/启动代码仓鼠.bat` | 双击启动（可选） |

## 3. 数据模型

```ts
type Profile = {
  source: 'github' | 'demo' | 'local';
  user: { login; name; created_at; followers; public_repos; url };
  repo: { name; full_name; stars; language; url };
  commits: { sha; message; date; ago; add; del; files; url }[];
  bugs: { severity: 'mild'|'medium'|'hot'; title; file; note }[];
  stats: { weight; mood; hunger; bond; commits7d; commits30d; lastDays; ... };
  state: 'happy' | 'hungry' | 'emo' | 'runaway';
  persona: { title; emoji };
  hamsterName: string;
  age: { badge; text };
  lines: { monologue; bubble; report; shareQuote };
};
```

## 4. 状态计算（engine.js 核心）

```
lastDays   = 今天 - 最近一次 commit
commits7d  = 最近 7 天提交数
genericRatio = 无信息量 commit message 占比（fix/update/update./单个词…）

weight = clamp(34 + commits7d*5 + commits30d*0.9, 26, 97)
hunger = clamp(18 + lastDays*9 - commits7d*1.6, 8, 99)
mood   = clamp(92 - lastDays*6.2 + min(commits7d,10)*1.4 - genericRatio*26, 6, 98)
bond   = clamp(30 + stars*0.18 + followers*0.12 + commits30d*0.8, 14, 99)

state = lastDays >= 14        ? 'runaway'
      : lastDays >= 7 || mood < 30 ? 'emo'
      : hunger >= 70          ? 'hungry'
      :                         'happy'
```

投喂：`hunger-18 / weight+1 / mood+6 / bond+2`，2.6 秒后回到计算出的状态；离家出走被投喂 → 回到 emo。

## 5. GitHub 数据与 bug 启发式

请求顺序（约 5 次）：
1. `/users/{login}`
2. `/users/{login}/repos?per_page=100&sort=pushed` → 取最近 push 的非 fork 仓库
3. `/repos/{full_name}/commits?per_page=30`
4. `/repos/{full_name}/commits/{sha}`（拿 patch / stats）

bug 启发式（最多 3 条，按严重度排序）：
- `password|secret|api_key|token` 赋字面量 → hot
- `debugger` / 空 `catch {}` / 大改动无测试 → medium
- `console.log` / `TODO|FIXME|HACK` / TS 里的 `any` → mild
- 无命中时输出 2 条可爱兜底文案，不允许空白。

失败兜底：任何一步失败 → `Engine.local(login)` 生成确定性模拟档案，页面提示「GitHub 在摸鱼，先给你一只模拟仓鼠」。

## 6. 设计系统

| Token | 值 |
|---|---|
| 奶油底 | `#FFF8EC` / `#FFF1D8` |
| 墨色 | `#2E2117` / 副文字 `#6B5745` |
| 仓鼠金 | `#F3B54A` / `#FFD27A` |
| Kiro 紫 | `#7C5CFF` / 深 `#5B3BE0` |
| 描边 / 分割 | `#EAD8BE` / `#F2E6D2` |
| 圆角 | 卡片 26–36px、按钮 14–16px、胶囊 99px |
| 字体 | PingFang SC / 微软雅黑，标题 900，正文 400–700 |
| 阴影 | 大 `0 30px 70px -24px rgba(138,90,59,.38)` |

仓鼠 SVG：手工绘制，奶油金渐变 + 粉色腮红 + 贴纸描边；状态差异用内联 `display` 属性控制（便于序列化进分享卡）；动画用 CSS 类（呼吸、眨眼、耳朵、爪子、咀嚼、眼泪、乌云）。

## 7. Kiro Hook 协议

`.kiro/hooks/feed-hamster.kiro.hook`：
- `when`: `fileEdit`，patterns `app/**/*.tsx|js`
- `then`: `askAgent` → 跑 `npm test`，再 `curl -X POST http://localhost:5173/feed`
- 页面通过 `EventSource('/events')` 接收 `feed` 事件，触发投喂并显示「来自 Kiro Hook 的投喂」。

## 8. 分享卡

Canvas 1080×1350：奶油底 + 点阵 + 圆角外框 + 胶带；仓鼠 SVG 序列化为 `data:image/svg+xml` 后 `drawImage`；四状态 2×2 卡片、瓜子数 / bug 数胶囊、一句 quote、活动署名。导出 `PNG`。

## 9. 风险与兜底

| 风险 | 兜底 |
|---|---|
| GitHub 限流 / 断网 | 演示档案 + 本地生成档案 + 明确提示 |
| Kiro Hook 不触发 | 先点投喂按钮演示；Hook 用录屏/配置截图补齐 |
| 现场投影分辨率低 | 核心信息用 14–17px 以上；投喂/状态放首屏 |
| 150 分钟不够 | 只做 MUST：领养 + 状态 + 投喂 + Hook + 一句吐槽 |
| 评审问「AI 在哪」 | 说明：Kiro 是开发 Agent；产品内文案引擎、轻量审查、人格生成都由 Kiro 产出并沉淀 |

## 10. 线下合规

线下规则要求「不得使用赛前已完成的项目主体（自有代码组件复用不限）」。
因此本工程包按**组件库**使用：SVG 仓鼠、设计系统、分享卡渲染、状态公式可作为组件复用；
现场从 Spec 重新生成页面结构、数据接入与交互编排，保留 Kiro 的 Spec / tasks / Hook 执行记录作为过程证据。
