const express = require('express');
const { getStore } = require('../db');

const router = express.Router();

const PRIORITIES = ['高', '中', '低'];
const MAX_TITLE = 120;

/** 统一返回格式：{ success: true, data: ... } / { success: false, error: '...' } */
function ok(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}

function fail(res, message, status = 400) {
  res.status(status).json({ success: false, error: message });
}

/** 校验并清洗前端传来的数据 */
function normalizeTitle(raw) {
  const title = String(raw ?? '').trim().replace(/\s+/g, ' ');
  if (!title) return { error: '请先输入任务标题' };
  if (title.length > MAX_TITLE) return { error: `任务标题不能超过 ${MAX_TITLE} 个字` };
  return { value: title };
}

function normalizePriority(raw) {
  const value = String(raw ?? '中').trim();
  if (!PRIORITIES.includes(value)) {
    return { error: '优先级只能是：高 / 中 / 低' };
  }
  return { value };
}

function normalizeDueDate(raw) {
  if (raw === undefined || raw === null || raw === '') return { value: null };
  const value = String(raw).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { error: '截止日期格式应为 YYYY-MM-DD' };
  }
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { error: '截止日期不是一个有效日期' };
  return { value };
}

// 统一捕获 async 路由里的异常
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ------------------------------- 查询列表 ------------------------------- */
// GET /api/tasks?priority=高&search=报告
router.get(
  '/',
  wrap(async (req, res) => {
    const { priority, search } = req.query;
    const tasks = await getStore().list({ priority, search });
    ok(res, tasks);
  })
);

/* ------------------------------- 新增任务 ------------------------------- */
router.post(
  '/',
  wrap(async (req, res) => {
    const title = normalizeTitle(req.body?.title);
    if (title.error) return fail(res, title.error);

    const priority = normalizePriority(req.body?.priority);
    if (priority.error) return fail(res, priority.error);

    const due = normalizeDueDate(req.body?.due_date);
    if (due.error) return fail(res, due.error);

    const task = await getStore().create({
      title: title.value,
      priority: priority.value,
      due_date: due.value,
    });
    ok(res, task, 201);
  })
);

/* --------------------------- 批量清除已完成任务 --------------------------- */
// 注意：要放在 /:id 路由之前，否则 completed 会被当成 id
router.delete(
  '/completed',
  wrap(async (req, res) => {
    const count = await getStore().removeCompleted();
    ok(res, { count });
  })
);

/* --------------------------- 修改（切换完成状态） --------------------------- */
router.patch(
  '/:id',
  wrap(async (req, res) => {
    const patch = {};

    if (req.body?.completed !== undefined) {
      patch.completed = Boolean(req.body.completed);
    }
    if (req.body?.title !== undefined) {
      const title = normalizeTitle(req.body.title);
      if (title.error) return fail(res, title.error);
      patch.title = title.value;
    }
    if (req.body?.priority !== undefined) {
      const priority = normalizePriority(req.body.priority);
      if (priority.error) return fail(res, priority.error);
      patch.priority = priority.value;
    }
    if (req.body?.due_date !== undefined) {
      const due = normalizeDueDate(req.body.due_date);
      if (due.error) return fail(res, due.error);
      patch.due_date = due.value;
    }

    if (Object.keys(patch).length === 0) {
      return fail(res, '没有需要更新的字段');
    }

    const task = await getStore().update(req.params.id, patch);
    ok(res, task);
  })
);

/* ------------------------------- 删除任务 ------------------------------- */
router.delete(
  '/:id',
  wrap(async (req, res) => {
    const task = await getStore().remove(req.params.id);
    ok(res, task);
  })
);

module.exports = router;
