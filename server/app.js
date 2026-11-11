/**
 * Express 应用（本地启动和 Vercel 部署共用同一份代码）
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { getMode, getStore, isCloud } = require('./db');

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));

/**
 * 接口前缀兼容：
 * 本地访问 /api/tasks，Vercel 的 catch-all 函数也是 /api/tasks，
 * 这里统一去掉 /api 前缀，内部路由一律按 /tasks 定义，两边行为一致。
 */
app.use((req, _res, next) => {
  if (req.url === '/api' || req.url.startsWith('/api/')) {
    req.isApiRequest = true;
    req.url = req.url.slice(4) || '/';
  }
  next();
});

/* ------------------------------- 健康检查 ------------------------------- */
app.get('/health', async (_req, res) => {
  const store = getStore();
  let dueDate = true;
  try {
    dueDate = await store.supportsDueDate();
  } catch (err) {
    dueDate = false;
  }

  res.json({
    success: true,
    data: {
      status: 'ok',
      storage: getMode(), // supabase = 云端数据库，local = 本地演示存储
      cloud: isCloud(),
      dueDate, // 云端表是否已有 due_date 字段
      time: new Date().toISOString(),
    },
  });
});

/* ------------------------------- 业务接口 ------------------------------- */
app.use('/tasks', require('./routes/tasks'));

/* ------------------------------- 静态页面 ------------------------------- */
// 本地运行时直接托管前端构建产物；Vercel 上由 outputDirectory 负责
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    // 接口路径不返回页面，交给后面的 404 处理
    if (req.isApiRequest || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

/* ------------------------------- 404 / 错误 ------------------------------- */
app.use((req, res) => {
  res.status(404).json({ success: false, error: `接口不存在：${req.method} ${req.originalUrl}` });
});

// 兜底错误处理，保证任何异常都返回 JSON，前端能显示中文提示
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  console.error('[API ERROR]', err.message);
  res.status(status).json({
    success: false,
    error: err.message || '服务器内部错误，请稍后重试',
  });
});

module.exports = app;
