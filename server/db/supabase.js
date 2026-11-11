/**
 * Supabase 云端数据层
 * ---------------------------------------------------------
 * 通过 @supabase/supabase-js 调用 Supabase 的 REST 接口操作 tasks 表。
 * 表结构见 supabase/schema.sql：
 *   id           bigint  自增主键
 *   title        text    任务标题
 *   priority     text    '高' / '中' / '低'
 *   completed    boolean 是否完成
 *   created_at   timestamptz 创建时间
 *   due_date     date    截止日期（可为空）
 */
const { createClient } = require('@supabase/supabase-js');

const TABLE = 'tasks';

/** 把 Supabase 的英文报错翻译成初学者看得懂的中文提示 */
function translateError(error) {
  const code = error.code || '';
  const msg = error.message || '未知错误';

  if (code === '42P01' || /does not exist/i.test(msg)) {
    return '云端没有找到 tasks 数据表，请先在 Supabase 的 SQL Editor 里执行 supabase/schema.sql';
  }
  if (code === '42501' || /row-level security/i.test(msg)) {
    return 'Supabase 的行级安全策略（RLS）拦截了这次操作，请执行 schema.sql 里的 RLS 策略（见手册 4.3 节）';
  }
  if (code === '42703' || /column .* does not exist/i.test(msg)) {
    return '数据表缺少字段，请重新执行 supabase/schema.sql 补齐 due_date 等字段';
  }
  if (/invalid api key|invalid jwt|jwt expired|unauthorized/i.test(msg) || code === '401') {
    return 'Supabase 密钥无效，请检查 .env 中的 SUPABASE_ANON_KEY（必须是 sb_publishable_ 开头的 Publishable key）';
  }
  if (/invalid url|failed to fetch|fetch failed|ENOTFOUND/i.test(msg)) {
    return '无法连接 Supabase，请检查 .env 中的 SUPABASE_URL 是否正确、网络是否可访问外网';
  }
  return `Supabase 操作失败：${msg}`;
}

function createSupabaseStore(url, key) {
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 老版本的 tasks 表可能没有 due_date 字段，这里探测一次并缓存结果，
  // 没有该字段时自动降级（仍可正常增删改查，只是不能存截止日期）
  let dueDateSupported = null;
  let probePromise = null;
  function probeDueDate() {
    if (dueDateSupported !== null) return Promise.resolve(dueDateSupported);
    if (!probePromise) {
      probePromise = client
        .from(TABLE)
        .select('due_date')
        .limit(1)
        .then(({ error }) => {
          const missing =
            Boolean(error) &&
            (error.code === '42703' ||
              error.code === 'PGRST204' ||
              /due_date/.test(error.message || ''));
          dueDateSupported = !missing;
          return dueDateSupported;
        })
        .catch(() => {
          dueDateSupported = false;
          return false;
        });
    }
    return probePromise;
  }

  return {
    mode: 'supabase',

    supportsDueDate: probeDueDate,

    async list({ priority, search } = {}) {
      let query = client.from(TABLE).select('*').order('created_at', { ascending: false });
      if (priority && priority !== '全部') query = query.eq('priority', priority);
      if (search) query = query.ilike('title', `%${String(search).trim()}%`);

      const { data, error } = await query;
      if (error) throw Object.assign(new Error(translateError(error)), { status: 502 });
      return data || [];
    },

    async create({ title, priority, due_date }) {
      const payload = { title, priority };
      if (due_date && (await probeDueDate())) payload.due_date = due_date;

      const { data, error } = await client.from(TABLE).insert(payload).select().single();
      if (error) throw Object.assign(new Error(translateError(error)), { status: 502 });
      return data;
    },

    async update(id, patch) {
      const payload = { ...patch };
      if (payload.due_date !== undefined && !(await probeDueDate())) {
        delete payload.due_date;
      }

      if (Object.keys(payload).length === 0) {
        const { data } = await client.from(TABLE).select('*').eq('id', id).maybeSingle();
        if (!data) {
          const err = new Error('任务不存在，可能已被删除');
          err.status = 404;
          throw err;
        }
        return data;
      }

      const { data, error } = await client
        .from(TABLE)
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw Object.assign(new Error(translateError(error)), { status: 502 });
      if (!data) {
        const err = new Error('任务不存在，可能已被删除');
        err.status = 404;
        throw err;
      }
      return data;
    },

    async remove(id) {
      const { data, error } = await client
        .from(TABLE)
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw Object.assign(new Error(translateError(error)), { status: 502 });
      if (!data) {
        // 已不存在也视为删除成功，避免前端报错
        return { id };
      }
      return data;
    },

    async removeCompleted() {
      const { data, error } = await client
        .from(TABLE)
        .delete()
        .eq('completed', true)
        .select('id');
      if (error) throw Object.assign(new Error(translateError(error)), { status: 502 });
      return (data || []).length;
    },
  };
}

module.exports = { createSupabaseStore };
