/**
 * 本地演示数据层（仅在未配置 Supabase 时启用）
 * ---------------------------------------------------------
 * 作用：让项目 clone 下来就能直接跑起来，不需要先去注册云数据库。
 * 数据保存在服务器硬盘的 data/tasks.json 文件里，不是浏览器 localStorage，
 * 所以关掉浏览器再打开数据依然在（重启服务也不会丢）。
 *
 * 一旦你在 .env 里填了 SUPABASE_URL / SUPABASE_ANON_KEY，
 * 下面的 supabase.js 就会接管，数据自动存到云端。代码无需改动。
 */
const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = process.env.LOCAL_DATA_DIR || path.join(__dirname, '..', '..', 'data');
const FILE = path.join(DATA_DIR, 'tasks.json');

let cache = null;
let queue = Promise.resolve();

function today(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/** 首次启动时放几条示例任务，方便直接看到界面效果 */
function seed() {
  const now = Date.now();
  return [
    {
      id: 1,
      title: '完成实训报告初稿',
      priority: '高',
      completed: false,
      created_at: new Date(now - 1000 * 60 * 12).toISOString(),
      due_date: today(1),
    },
    {
      id: 2,
      title: '复习 React 组件的状态管理',
      priority: '中',
      completed: false,
      created_at: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      due_date: today(-1),
    },
    {
      id: 3,
      title: '注册 Supabase 并创建 tasks 数据表',
      priority: '高',
      completed: true,
      created_at: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      due_date: null,
    },
    {
      id: 4,
      title: '整理这周的学习笔记',
      priority: '低',
      completed: false,
      created_at: new Date(now - 1000 * 60 * 60 * 50).toISOString(),
      due_date: today(3),
    },
  ];
}

async function load() {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    const parsed = JSON.parse(raw);
    cache = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    cache = seed();
    await persist();
  }
  return cache;
}

async function persist() {
  const snapshot = JSON.stringify(cache, null, 2);
  queue = queue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${FILE}.tmp`;
    await fs.writeFile(tmp, snapshot, 'utf8');
    await fs.rename(tmp, FILE);
  });
  await queue;
}

const sortDesc = (list) =>
  [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

function createLocalStore() {
  return {
    mode: 'local',

    supportsDueDate: async () => true,

    async list({ priority, search } = {}) {
      const rows = await load();
      let result = sortDesc(rows);
      if (priority && priority !== '全部') {
        result = result.filter((t) => t.priority === priority);
      }
      if (search) {
        const kw = String(search).trim().toLowerCase();
        result = result.filter((t) => t.title.toLowerCase().includes(kw));
      }
      return result;
    },

    async create({ title, priority, due_date }) {
      const rows = await load();
      const nextId = rows.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0) + 1;
      const task = {
        id: nextId,
        title,
        priority,
        completed: false,
        created_at: new Date().toISOString(),
        due_date: due_date || null,
      };
      rows.push(task);
      await persist();
      return task;
    },

    async update(id, patch) {
      const rows = await load();
      const index = rows.findIndex((t) => String(t.id) === String(id));
      if (index === -1) {
        const err = new Error('任务不存在，可能已被删除');
        err.status = 404;
        throw err;
      }
      rows[index] = { ...rows[index], ...patch };
      await persist();
      return rows[index];
    },

    async remove(id) {
      const rows = await load();
      const index = rows.findIndex((t) => String(t.id) === String(id));
      if (index === -1) {
        const err = new Error('任务不存在，可能已被删除');
        err.status = 404;
        throw err;
      }
      const [removed] = rows.splice(index, 1);
      await persist();
      return removed;
    },

    async removeCompleted() {
      const rows = await load();
      const before = rows.length;
      const keep = rows.filter((t) => !t.completed);
      cache = keep;
      await persist();
      return before - keep.length;
    },
  };
}

module.exports = { createLocalStore };
