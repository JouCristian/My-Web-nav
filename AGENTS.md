# AGENTS.md

## Project
这是一个基于 Supabase + Vercel + Cursor + GitHub 的网站项目。

## Tech Stack
- Frontend: React / Next.js / TypeScript
- Backend/Data: Supabase
- Deployment: Vercel
- Version Control: GitHub

## Rules
- 不要直接修改生产环境配置
- 不要提交 .env、API secret、service_role key
- 不要随意引入新依赖，除非明确说明原因
- 保持现有 UI 风格一致
- 修改数据库结构时，优先创建 migration，不要只改线上表
- 涉及 Supabase 权限时，必须考虑 RLS
- 每次修改后说明：改了哪些文件、为什么改、可能风险是什么

## Commands
- 安装依赖：npm install
- 本地开发：npm run dev
- 代码检查：npm run lint
- 构建检查：npm run build

## Review Checklist
- 是否破坏现有功能
- 是否有加载、错误、空状态
- 是否有权限绕过风险
- 是否把密钥暴露到前端
- 是否影响 Vercel 部署
