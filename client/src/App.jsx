import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './lib/api';
import { todayLabel } from './lib/format';
import StatCards from './components/StatCards';
import ComposeForm from './components/ComposeForm';
import Toolbar from './components/Toolbar';
import TaskItem from './components/TaskItem';
import EmptyState from './components/EmptyState';
import ConfirmDialog from './components/ConfirmDialog';
import Toast from './components/Toast';
import { IconCheck, IconCloud, IconDatabase } from './components/Icons';

function Skeleton() {
  return (
    <ul className="tasks" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li className="task skeleton" key={i}>
          <span className="sk sk-check" />
          <div className="task-body">
            <span className="sk sk-title" />
            <span className="sk sk-meta" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [storage, setStorage] = useState(null);

  const [filter, setFilter] = useState('全部');
  const [keyword, setKeyword] = useState('');

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('中');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [rlsHint, setRlsHint] = useState(false);

  const inputRef = useRef(null);
  const toastTimer = useRef(null);

  /* ------------------------------ 轻提示 ------------------------------ */
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  /** 统一处理错误：弹提示，如果是 RLS 权限问题则额外显示修复指引 */
  const reportError = useCallback(
    (err) => {
      showToast(err.message, 'error');
      if (/行级安全|RLS|policy|permission/i.test(err.message)) setRlsHint(true);
    },
    [showToast]
  );

  /* ------------------------------ 读取数据 ------------------------------ */
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [health, list] = await Promise.all([
        api.health().catch(() => null),
        api.list(),
      ]);
      if (health) setStorage(health);
      setTasks(list);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // 云端表还没有 due_date 字段时，清空已选的日期，避免提交无用字段
  useEffect(() => {
    if (storage && storage.dueDate === false) setDueDate('');
  }, [storage]);

  /* ------------------------------ 派生数据 ------------------------------ */
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    return {
      total,
      completed,
      active: total - completed,
      rate: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [tasks]);

  const counts = useMemo(
    () => ({
      全部: tasks.length,
      高: tasks.filter((t) => t.priority === '高').length,
      中: tasks.filter((t) => t.priority === '中').length,
      低: tasks.filter((t) => t.priority === '低').length,
    }),
    [tasks]
  );

  const visibleTasks = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchPriority = filter === '全部' || t.priority === filter;
      const matchKeyword = !kw || t.title.toLowerCase().includes(kw);
      return matchPriority && matchKeyword;
    });
  }, [tasks, filter, keyword]);

  /* ------------------------------ 添加任务 ------------------------------ */
  async function handleAdd(e) {
    e.preventDefault();
    const value = title.trim();
    if (!value) {
      showToast('请先输入任务标题', 'error');
      inputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const task = await api.create({ title: value, priority, due_date: dueDate || null });
      setTasks((prev) => [task, ...prev]);
      setTitle('');
      setDueDate('');
      setRlsHint(false);
      showToast('任务已添加');

      // 如果当前筛选/搜索会让新任务看不见，自动回到全部
      if (filter !== '全部' && filter !== task.priority) setFilter('全部');
      if (keyword && !task.title.toLowerCase().includes(keyword.trim().toLowerCase())) setKeyword('');

      inputRef.current?.focus();
    } catch (err) {
      reportError(err);
    } finally {
      setSubmitting(false);
    }
  }

  /* --------------------------- 切换完成 / 未完成 --------------------------- */
  async function handleToggle(task) {
    const next = !task.completed;
    setBusyId(task.id);
    // 先乐观更新，界面立即响应
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: next } : t)));

    try {
      const updated = await api.update(task.id, { completed: next });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...updated } : t)));
    } catch (err) {
      // 失败则回滚
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
      );
      reportError(err);
    } finally {
      setBusyId(null);
    }
  }

  /* ------------------------------ 删除任务 ------------------------------ */
  async function handleConfirm() {
    if (!confirm) return;
    setConfirmLoading(true);
    try {
      if (confirm.type === 'delete') {
        await api.remove(confirm.task.id);
        setTasks((prev) => prev.filter((t) => t.id !== confirm.task.id));
        showToast('任务已删除');
      } else {
        const { count } = await api.clearCompleted();
        setTasks((prev) => prev.filter((t) => !t.completed));
        showToast(`已清除 ${count} 条已完成任务`);
      }
      setConfirm(null);
    } catch (err) {
      reportError(err);
    } finally {
      setConfirmLoading(false);
    }
  }

  const isCloud = storage?.cloud === true;
  const emptyVariant = tasks.length === 0 ? 'empty' : keyword.trim() ? 'search' : 'filter';

  return (
    <div className="app">
      <div className="bg-blob blob-a" aria-hidden="true" />
      <div className="bg-blob blob-b" aria-hidden="true" />

      <div className="shell">
        {/* 顶部标题 */}
        <header className="hero">
          <div className="brand">
            <div className="brand-mark">
              <IconCheck />
            </div>
            <div className="brand-text">
              <h1>
                智能任务管理<span>系统</span>
              </h1>
              <p>把要做的事情写下来，然后一件一件完成它</p>
            </div>
          </div>

          <div className="hero-side">
            <span
              className={`mode-chip ${isCloud ? 'is-cloud' : 'is-local'}`}
              title={
                isCloud
                  ? '数据保存在 Supabase 云端数据库'
                  : '尚未配置 Supabase，当前数据保存在服务器上的 data/tasks.json'
              }
            >
              {isCloud ? <IconCloud /> : <IconDatabase />}
              {storage ? (isCloud ? '云端已连接' : '本地演示模式') : '连接中…'}
            </span>
            <span className="today">{todayLabel()}</span>
          </div>
        </header>

        {/* 数据统计 */}
        <StatCards {...stats} />

        {/* 添加任务 */}
        <ComposeForm
          title={title}
          onTitleChange={setTitle}
          priority={priority}
          onPriorityChange={setPriority}
          dueDate={dueDate}
          onDueDateChange={setDueDate}
          onSubmit={handleAdd}
          submitting={submitting}
          inputRef={inputRef}
          dueDateEnabled={storage?.dueDate !== false}
        />

        {/* 云端表缺字段提示 */}
        {storage && storage.dueDate === false && (
          <div className="notice notice-warn">
            <strong>云端数据表还缺少「截止日期」字段</strong>
            <p>
              其他功能都可以正常使用，只是截止日期暂时存不进去。到 Supabase → SQL Editor
              执行下面这一句，然后刷新页面即可恢复：
            </p>
            <code className="sql-hint">alter table tasks add column if not exists due_date date;</code>
          </div>
        )}

        {/* RLS 策略缺失提示 */}
        {rlsHint && (
          <div className="notice notice-warn">
            <strong>云端数据库还不允许写入（RLS 行级安全策略缺失）</strong>
            <p>
              读取是通的，但 Supabase 默认拒绝匿名写入，所以添加/修改/删除会被拦截。到
              Supabase → SQL Editor 执行下面这段，然后刷新页面即可：
            </p>
            <code className="sql-hint">{`drop policy if exists "Allow anon insert" on tasks;
drop policy if exists "Allow anon update" on tasks;
drop policy if exists "Allow anon delete" on tasks;
create policy "Allow anon insert" on tasks for insert with check (true);
create policy "Allow anon update" on tasks for update using (true) with check (true);
create policy "Allow anon delete" on tasks for delete using (true);`}</code>
          </div>
        )}

        {/* 筛选 + 搜索 */}
        <Toolbar
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
          keyword={keyword}
          onKeywordChange={setKeyword}
          completedCount={stats.completed}
          onClearCompleted={() => setConfirm({ type: 'clear' })}
        />

        {/* 任务列表 */}
        {loading ? (
          <Skeleton />
        ) : loadError ? (
          <div className="notice notice-error">
            <strong>无法加载任务列表</strong>
            <p>{loadError}</p>
            <button type="button" className="ghost-btn" onClick={loadTasks}>
              重新加载
            </button>
          </div>
        ) : visibleTasks.length === 0 ? (
          <EmptyState
            variant={emptyVariant}
            onReset={() => {
              setFilter('全部');
              setKeyword('');
            }}
          />
        ) : (
          <ul className="tasks">
            {visibleTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                busy={busyId === task.id}
                onToggle={handleToggle}
                onDelete={(t) => setConfirm({ type: 'delete', task: t })}
              />
            ))}
          </ul>
        )}

        {/* 页脚说明 */}
        <footer className="foot">
          <span className={`foot-mode ${isCloud ? 'is-cloud' : 'is-local'}`}>
            {isCloud ? <IconCloud /> : <IconDatabase />}
            {isCloud
              ? '数据存储：Supabase 云端数据库（tasks 表）'
              : '数据存储：本地演示存储 data/tasks.json（配置 Supabase 后自动切换云端）'}
          </span>
          <span className="foot-brand">React + Node.js + Supabase</span>
        </footer>
      </div>

      <Toast toast={toast} />

      <ConfirmDialog
        open={Boolean(confirm)}
        loading={confirmLoading}
        title={confirm?.type === 'clear' ? '清除所有已完成的任务？' : '删除这条任务？'}
        description={
          confirm?.type === 'clear'
            ? `将删除 ${stats.completed} 条已完成任务，删除后无法恢复。`
            : confirm?.task?.title
        }
        confirmText={confirm?.type === 'clear' ? '全部清除' : '删除'}
        onCancel={() => !confirmLoading && setConfirm(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
