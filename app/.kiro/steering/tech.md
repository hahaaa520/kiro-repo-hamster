# tech.md · 代码仓鼠

## 技术栈
- 前端：原生 HTML / CSS / JavaScript（无框架、无构建）
- 图形：手写内联 SVG（仓鼠、图标、Logo）
- 分享卡：Canvas 2D → PNG
- 本地服务：Node.js 原生 `http`（`app/server.mjs`，零依赖）
- 数据：GitHub REST API（CORS，前端直连；无 token 时 60 次/小时）
- 预览：`node server.mjs` → http://localhost:5173

## 约定
- 不引入 npm 依赖，保持「双击就能跑」。
- 所有资源本地化，不用 CDN / 远程字体 / 外部图片。
- 文案中文，集中在 `js/engine.js`；不要散落在 HTML。
- 状态公式只改 `engine.js`，UI 只读 profile。
- 仓鼠 SVG 的状态差异用内联 `display` 属性，便于序列化进分享卡。
- 颜色只用 `css/style.css` 顶部 token。
- 响应式断点：1080px（单列布局）、720px（移动端）。

## 常用命令
```bash
node app/server.mjs          # 产品
node serve-root.mjs          # 路演页预览 http://localhost:8081/deck/
curl -X POST http://localhost:5173/feed   # 手动投喂（Kiro Hook 用）
```

## 数据格式
`Engine.demo(key)` / `Engine.local(login)` / `Engine.fromGitHub(user, repo, commits, bugs)` 都返回同一个 `Profile`，UI 不关心数据来源。

## 演示模式
- `?demo=champion|lazy|normal&noloading=1` 直接进入演示档案
- `?nohook=1` 关闭 SSE（截图/录屏用）
- `?cardonly=1` 只渲染分享卡（导出 PNG 用）
