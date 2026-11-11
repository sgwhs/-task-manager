/**
 * 数据层入口：根据环境变量自动选择「云端 Supabase」或「本地演示存储」
 * ---------------------------------------------------------
 * 只要 .env 里填好 SUPABASE_URL 和 SUPABASE_ANON_KEY，就走云端；
 * 否则用 data/tasks.json 兜底，保证项目随时能跑起来。
 * 两种模式下，上层路由代码完全一样。
 */
const { createSupabaseStore } = require('./supabase');
const { createLocalStore } = require('./local');

let store = null;

function resolveStore() {
  if (store) return store;

  // 同时兼容两种命名：SUPABASE_* 和 VITE_SUPABASE_*（后者是前端习惯写法）
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const key = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (url && key) {
    store = createSupabaseStore(url, key);
  } else {
    store = createLocalStore();
  }
  return store;
}

module.exports = {
  getStore: resolveStore,
  /** 当前存储模式：supabase | local */
  getMode: () => resolveStore().mode,
  isCloud: () => resolveStore().mode === 'supabase',
};
