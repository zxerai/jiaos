# Novelix — AI 小说写作系统

Novelix 是一个开源的 AI 小说写作系统，核心是由 10 个 AI Agent 组成的写作管线。它不像 ChatGPT 那样"写一段话"，而是像一支创作团队一样分工协作——有人规划剧情、有人写正文、有人检查漏洞、有人修复问题、有人追踪伏笔。

## 一句话

**Novelix = 10 个 AI Agent 接力写小说，自带 33 维审计和反 AI 检测。**

## 它能做什么

- **全自动写作**：一键写下一章，自动审、自动改、自动追踪状态
- **33 维连续性审计**：检查角色记忆、物资位置、伏笔回收——主角不会凭空"想起"没见过的事
- **反 AI 检测**：内置 22 条改写规则，降低被朱雀等工具检测的概率
- **7 本真相文件**：世界状态、物资账本、伏笔池、角色矩阵等实时同步
- **多模型路由**：写作用 Claude，审计用 GPT-4o，按需分配
- **续写/同人/仿写**：导入已有小说续写，或从原作素材创建同人
- **Web 工作台 + CLI**：浏览器管理或终端操作

## 适用场景

- **网文作者**：想用 AI 辅助创作，但受不了 ChatGPT 丢三落四
- **技术爱好者**：对多 Agent 系统、LLM 应用感兴趣
- **量产创作者**：短篇、番外、仿写、续写

## 技术特点

- TypeScript monorepo（pnpm workspace）
- 10 Agent 管线（Planner → Composer → Writer → Observer → Reflector → Auditor → Reviser）
- 33 维度审计 + 15 条后写校验规则
- Zod schema 校验运行时状态
- Studio UI（Vite + React + Hono）+ CLI + TUI（Ink）
- 支持 15+ 题材

## 快速体验

```bash
npm i -g @actalk/novelix
novelix init my-project
novelix doctor
novelix book create --title "我的第一本书" --genre xianxia
novelix write next 我的第一本书
```

GitHub: [github.com/zxerai/novelix](https://github.com/zxerai/novelix)
