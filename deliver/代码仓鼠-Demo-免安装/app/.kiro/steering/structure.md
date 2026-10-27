# structure.md · 代码仓鼠

```
app/
├─ index.html            单页：舞台 / 领养 / 报告 / 数据面板 / 加载 / Toast / 模态
├─ css/style.css         设计 token、布局、卡片、动画、响应式、card-only 导出模式
├─ js/hamster.js         Hamster.svg(state) 四状态仓鼠 + 图标 + Logo
├─ js/engine.js          状态公式 / 文案引擎 / 演示档案 / 周报 / 分享卡数据
├─ js/app.js             领养 / 渲染 / 投喂 / bug 启发式 / Canvas 分享卡 / SSE
├─ server.mjs            静态服务 + /feed + /events（零依赖）
├─ 启动代码仓鼠.bat
└─ .kiro/
   ├─ specs/repo-hamster/   requirements.md / design.md / tasks.md
   ├─ hooks/                feed-hamster.kiro.hook / weekly-report.kiro.hook
   └─ steering/             product.md / tech.md / structure.md
```

## 关键入口
| 想改什么 | 去哪 |
|---|---|
| 视觉 / 布局 / 动画 | `css/style.css` |
| 仓鼠长什么样 | `js/hamster.js` |
| 状态公式 / 文案 | `js/engine.js` |
| 交互 / 接口 / 分享卡 | `js/app.js` |
| Kiro Hook 投喂 | `server.mjs` + `.kiro/hooks/` |

## 不动的边界
- 不新增页面；所有体验在一个页面内完成。
- 不引入打包器 / 框架 / 外部 UI 库。
- 不把密钥写进前端。
