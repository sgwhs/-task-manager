import { IconCheck, IconTrash, IconCalendar } from './Icons';
import { formatCreated, dueInfo } from '../lib/format';

const toneOf = (priority) => (priority === '高' ? 'high' : priority === '中' ? 'mid' : 'low');

export default function TaskItem({ task, index, onToggle, onDelete, busy }) {
  const due = dueInfo(task.due_date, task.completed);
  const tone = toneOf(task.priority);

  return (
    <li
      className={`task ${task.completed ? 'is-done' : ''} ${due.tone === 'overdue' ? 'is-overdue' : ''}`}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <button
        type="button"
        className="check"
        onClick={() => onToggle(task)}
        disabled={busy}
        aria-pressed={task.completed}
        aria-label={task.completed ? '标记为未完成' : '标记为已完成'}
        title={task.completed ? '标记为未完成' : '标记为已完成'}
      >
        <IconCheck />
      </button>

      <div className="task-body">
        <p className="task-title">{task.title}</p>
        <div className="task-meta">
          <span className={`badge badge-${tone}`}>{task.priority}优先级</span>

          {due.tone !== 'none' && (
            <span className={`meta-item due due-${due.tone}`}>
              <IconCalendar />
              {due.label}
            </span>
          )}

          <span className="meta-item muted">{formatCreated(task.created_at)}</span>
        </div>
      </div>

      <button
        type="button"
        className="del"
        onClick={() => onDelete(task)}
        aria-label="删除任务"
        title="删除任务"
      >
        <IconTrash />
      </button>
    </li>
  );
}
