# 智能任务管理系统（Smart Task Manager）

一个可以直接运行、可以直接上线的全栈任务管理应用。

| 层次 | 技术 |
| --- | --- |
| 前端 | React 18 + Vite（卡片式蓝白设计，适配电脑与手机） |
| 后端 | Node.js + Express（REST API） |
| 数据库 | Supabase（云端 PostgreSQL） |
| 部署 | Vercel（前后端同一个项目，一次部署） |

功能：添加任务 · 优先级（高/中/低）· 完成状态切换 · 删除 · 优先级筛选 · 标题搜索 · 截止日期与逾期红色提醒 · 任务总数/已完成/未完成/完成率统计 · 最新任务置顶 · 已完成任务删除线。

---

## 一、目录结构

```
task-manager/
├── client/                  # 前端（React）
│   ├── index.html
│   └── src/
│       ├── App.jsx          # 页面主逻辑（状态、请求、统计）
│       ├── main.jsx
│       ├── styles.css       # 全部样式（含响应式）
│       ├── lib/
│       │   ├── api.js       # 统一封装后端接口
│       │   └── format.js    # 日期格式化、逾期判断
│       └── components/      # 拆分后的 UI 组件
│           ├── StatCards.jsx     统计卡片
│           ├── ComposeForm.jsx   添加任务
│           ├── Toolbar.jsx       筛选 + 搜索
│           ├── TaskItem.jsx      单条任务
│           ├── EmptyState.jsx    空状态
│           ├── ConfirmDialog.jsx 删除确认弹窗
│           └── Toast.jsx         轻提示
├── server/                  # 后端（Express）
│   ├── app.js               # 应用装配（本地和 Vercel 共用）
│   ├── index.js             # 本地启动入口
│   ├── routes/tasks.js      # 任务接口
│   └── db/
│       ├── index.js         # 自动选择存储方式
│       ├── supabase.js      # 云端数据库实现
│       └── local.js         # 本地演示存储（未配置 Supabase 时兜底）
├── api/[...path].js         # Vercel Serverless 入口
├── supabase/schema.sql      # 建表 + RLS 策略，复制到 Supabase 执行
├── vercel.json              # Vercel 部署配置
├── vite.config.mjs
└── .env.example             # 环境变量模板
```

---

## 二、本地运行

```bash
npm install       # 第一次需要，安装依赖
npm run build     # 构建前端
npm start         # 启动服务，浏览器打开 http://localhost:3000
```

开发模式（改代码自动刷新）：

```bash
npm run dev       # 前端 5173，后端 3000，自动代理 /api
```

> 没配置 Supabase 时，数据会存到服务器上的 `data/tasks.json`（不是浏览器 localStorage），
> 关掉浏览器再打开数据还在，方便先看效果。配置好 Supabase 后自动切换为云端，代码不用改。

---

## 三、接入自己的 Supabase（3 步）

1. 打开 <https://supabase.com> → New Project，Region 选 `Southeast Asia (Singapore)`，等状态变成 Active。
2. 左侧 **SQL Editor** → New query → 粘贴 `supabase/schema.sql` 全部内容 → Run，
   看到 `Success. No rows returned` 就成功了（这一步同时建表 + 开 RLS 策略）。
3. 把 `.env.example` 复制成 `.env`，填入两个值：

```env
SUPABASE_URL=https://你的项目ID.supabase.co
SUPABASE_ANON_KEY=sb_publishable_你的key
```

然后重启 `npm start`。页面右上角出现 **「云端已连接」** 就说明数据已经存到云端了，
可以到 Supabase 的 Table Editor → tasks 表里核对。

---

## 四、接口一览（后端 API）

所有接口统一返回 `{ success: true, data: ... }`，出错返回 `{ success: false, error: '中文提示' }`。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查，返回当前存储模式（supabase / local） |
| GET | `/api/tasks?priority=高&search=报告` | 查询任务（按创建时间倒序，可选筛选与搜索） |
| POST | `/api/tasks` | 新增任务 `{ title, priority, due_date }` |
| PATCH | `/api/tasks/:id` | 修改任务（切换完成状态、改标题/优先级/截止日期） |
| DELETE | `/api/tasks/:id` | 删除单条任务 |
| DELETE | `/api/tasks/completed` | 清除全部已完成任务 |

---

## 五、上传 GitHub

先在 GitHub 新建仓库 `task-manager`（**不要**勾选 Add a README，仓库设为 Public），然后在本项目目录执行：

```bash
git init
git add .
git commit -m "feat: 智能任务管理系统初版"
git branch -M main
git remote add origin https://github.com/你的用户名/task-manager.git
git push -u origin main
```

> push 时如果要求登录，用 GitHub 的 Personal Access Token 当密码（Settings → Developer settings → Personal access tokens → Fine-grained tokens，勾选该仓库的 Contents 读写权限）。

上传后请在 GitHub 网页上确认：**仓库里没有 `.env` 文件**。如果不小心传了，立刻去 Supabase 轮换 key。

---

## 六、Vercel 部署

1. 打开 <https://vercel.com> → Add New → Project → 选择刚才的 `task-manager` 仓库 → Import。
2. Framework 会被识别为 Vite，构建命令 `npm run build`、输出目录 `dist` 已写在 `vercel.json` 里，不用改。
3. 在 **Environment Variables** 中添加（Production / Preview / Development 都勾上）：

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | `https://你的项目ID.supabase.co` |
| `SUPABASE_ANON_KEY` | `sb_publishable_你的key` |

4. 点 Deploy，1～3 分钟后拿到 `https://xxx.vercel.app` 网址。
5. 验证：在 Vercel 网址上添加一条任务 → 打开 Supabase → Table Editor → tasks，能看到这条新数据即全链路打通。

> 前端和接口在同一个 Vercel 项目里，`/api/*` 由 `api/[...path].js` 这个 Serverless 函数处理，不需要单独部署后端。

---

## 七、绑定自己的域名

1. Vercel 项目 → Settings → Domains → Add，输入你的域名（如 `zhangsan01.rangzijigenghao.online`）。
2. 按 Vercel 提示到域名服务商处添加记录：
   - **CNAME**：主机记录填前缀（如 `zhangsan01`），记录值填 `cname.vercel-dns.com`
   - **TXT**：主机记录 `_vercel`，记录值为 Vercel 给出的校验串
3. 回 Vercel 点 Refresh，等待状态变成 Valid，HTTPS 证书会自动签发。

---

## 八、常见问题

| 现象 | 原因与解决 |
| --- | --- |
| 添加任务报 `row-level security` | RLS 策略没开，重新执行 `supabase/schema.sql` 第 3 段 |
| 报 `relation "tasks" does not exist` | 表没建成功，重新执行建表 SQL |
| 页面提示「本地演示模式」 | 没读到环境变量：确认 `.env` 文件名正确、重启服务；Vercel 上确认环境变量已配置并 Redeploy |
| 部署后接口 500 | Vercel → Deployments → 最新一次 → Build Logs / Functions 日志，通常是环境变量名拼错 |
| 改了环境变量没生效 | Vercel 里改完必须 Redeploy 才会生效 |
| 云端有数据但页面看不到 | 本地和 Vercel 连的不是同一个 Supabase 项目，核对 `SUPABASE_URL` 里的项目 ID |

---

## 九、可继续扩展的方向

- 任务编辑（双击标题直接改）
- 拖拽排序、任务分组 / 标签
- 接入 Supabase Auth，实现「每个用户只看自己的任务」
- 任务提醒（到期邮件 / 微信推送）
