/**
 * Vercel Serverless 入口（catch-all）
 * ---------------------------------------------------------
 * 前端请求 /api/tasks、/api/health 都会进入这个函数，
 * 内部复用 server/app.js，与本地运行的代码 100% 一致。
 */
module.exports = require('../server/app');
