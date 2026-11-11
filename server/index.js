/**
 * 本地启动入口：node server/index.js
 */
require('dotenv').config();
const app = require('./app');
const { getMode } = require('./db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  const mode = getMode();
  console.log('');
  console.log('  ✅ 智能任务管理系统已启动');
  console.log(`  🌐 本地地址： http://localhost:${PORT}`);
  console.log(
    mode === 'supabase'
      ? '  ☁️  存储模式： Supabase 云端数据库（已连接）'
      : '  💾 存储模式： 本地演示存储（data/tasks.json）'
  );
  if (mode !== 'supabase') {
    console.log('      想用云端数据库？把 .env.example 复制成 .env，填入 Supabase 的 URL 和 Key 后重启即可');
  }
  console.log('');
});
