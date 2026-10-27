# requirements.md · 代码仓鼠（repo-hamster）

> Kiro Feature Spec 的「需求」产物。现场可把本文件直接放进 `.kiro/specs/repo-hamster/`，让 Kiro 继续设计 / 拆任务 / 实现。

## 0. 一句话

输入一个 GitHub 用户名，生成一只住在他仓库里的仓鼠：按提交记录计算体重、心情、饥饿、亲密度；会吐槽、会 emo、会离家出走；读最近一次 diff 藏 bug；生成可分享的体检报告；支持 Kiro Agent Hook 保存即投喂。

## 1. 目标与非目标

### 目标
- 现场 150 分钟内可完成、可演示、可讲清。
- 评审输入自己的 GitHub 用户名后，3 秒内看到第一只仓鼠与第一句吐槽。
- 断网 / GitHub 限流时仍可完整演示（本地演示档案兜底）。
- 全程用 Kiro 开发，并让 Kiro Hook 成为产品运行机制的一部分。

### 非目标
- 不做 OAuth / 登录 / 私有仓库。
- 不做数据库、不存用户数据。
- 不做正式 code review（只做「仓鼠零食」级轻提示）。
- 不做移动端原生 App。

## 2. 用户故事与验收标准

### US-1 领养
WHEN 用户输入合法 GitHub 用户名并提交
THE SYSTEM SHALL 在 3 秒内展示：仓鼠名、账号年龄、主仓库、四个状态、第一句吐槽。
WHEN GitHub API 失败、限流或超时
THE SYSTEM SHALL 使用本地演示档案完成渲染，并明确提示「演示档案」。

### US-2 状态
WHEN 最近一次提交在 7 天以内
THE SYSTEM SHALL 计算体重/心情/饥饿/亲密度，状态为 happy / hungry。
WHEN 最近一次提交 ≥ 7 天
THE SYSTEM SHALL 进入 emo 状态（乌云、眼泪、垂眼）。
WHEN 最近一次提交 ≥ 14 天
THE SYSTEM SHALL 进入离家出走状态（空笼子、爪印、留言）。
WHEN 用户投喂
THE SYSTEM SHALL 让饥饿 -18、体重 +1、心情 +6、亲密度 +2，并在 2.6 秒后恢复原状态。

### US-3 投喂
WHEN 点击「投喂一颗瓜子」
THE SYSTEM SHALL 播放进食动画（笑眼、咀嚼、瓜子、掉落粒子）并弹出投喂反馈。
WHEN 在离家出走状态下投喂
THE SYSTEM SHALL 让仓鼠回到 emo 状态并说「瓜子留下，我考虑一下」。

### US-4 Kiro Hook 投喂
WHEN 本地服务收到 `POST /feed`
THE SYSTEM SHALL 通过 SSE 在 500ms 内通知页面，页面触发投喂并提示「来自 Kiro Hook 的投喂」。

### US-5 腮帮子里的 bug
WHEN 拿到最新一次 commit 的文件 diff
THE SYSTEM SHALL 输出最多 3 条轻量提示，按 hot / medium / mild 排序，包含文件位置、标题、一句人话解释。
WHEN 没有任何可识别问题
THE SYSTEM SHALL 输出 2 条兜底吐槽，不允许空白。

### US-6 体检报告
WHEN 用户点击「保存报告」
THE SYSTEM SHALL 导出 1080×1350 PNG，包含：仓鼠、名字、仓库、四个状态、瓜子数、bug 数、一句 quote、活动署名。

### US-7 周报
WHEN 用户点击「生成周报」
THE SYSTEM SHALL 生成可复制文本：本周提交数、最近一次时间、四状态、最辣嗓子的 bug、下周目标。

### US-8 视觉与适配
THE SYSTEM SHALL 使用奶油纸感 + 贴纸描边 + Kiro 紫点缀；仓鼠需有呼吸、眨眼、耳朵、爪子动画。
THE SYSTEM SHALL 在 390px–1920px 宽度下无横向滚动；移动端单列布局。

## 3. 约束

- 只读公开数据；不写入、不缓存个人数据；不在前端暴露任何密钥。
- 不依赖外部模型 API 也能运行（内置文案引擎）。
- 所有字体 / 图形 / 图标本地化，不依赖 CDN（现场可能断网）。
- 文案中文、语气可爱但不低俗；不涉及暴力、敏感话题。

## 4. 现场优先级（150 分钟）

MUST：领养 + 四状态 + 投喂 + Kiro Hook + 一句吐槽。
SHOULD：腮帮子 bug 清单。
COULD：体检报告 / 周报。
WON'T：登录、数据库、正式 review、多页面。
