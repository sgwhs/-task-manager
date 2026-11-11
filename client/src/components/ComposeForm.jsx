import { IconPlus, IconCalendar, IconX } from './Icons';

export const PRIORITIES = [
  { value: '高', hint: '重要且紧急' },
  { value: '中', hint: '按计划推进' },
  { value: '低', hint: '有空再做' },
];

export default function ComposeForm({
  title,
  onTitleChange,
  priority,
  onPriorityChange,
  dueDate,
  onDueDateChange,
  onSubmit,
  submitting,
  inputRef,
  dueDateEnabled = true,
}) {
  return (
    <section className="compose">
      <form className="compose-form" onSubmit={onSubmit}>
        <div className="compose-input">
          <span className="compose-input-icon">
            <IconPlus />
          </span>
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="今天要完成什么？例如：复习 React 的 useState"
            maxLength={120}
            aria-label="任务标题"
          />
        </div>

        <div className="seg" role="group" aria-label="选择优先级">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              title={p.hint}
              className={`seg-btn p-${p.value === '高' ? 'high' : p.value === '中' ? 'mid' : 'low'} ${
                priority === p.value ? 'is-active' : ''
              }`}
              aria-pressed={priority === p.value}
              onClick={() => onPriorityChange(p.value)}
            >
              <i className="dot" />
              {p.value}
            </button>
          ))}
        </div>

        <div className={`date-field ${dueDate ? 'has-value' : ''} ${dueDateEnabled ? '' : 'is-disabled'}`}>
          <IconCalendar className="date-icon" />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            disabled={!dueDateEnabled}
            aria-label="截止日期"
            title={dueDateEnabled ? '设置截止日期' : '云端数据表还没有 due_date 字段，暂不可用'}
          />
          {dueDate && dueDateEnabled && (
            <button
              type="button"
              className="date-clear"
              onClick={() => onDueDateChange('')}
              aria-label="清除截止日期"
            >
              <IconX />
            </button>
          )}
        </div>

        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? <span className="spinner" /> : <IconPlus />}
          {submitting ? '添加中' : '添加任务'}
        </button>
      </form>

      <p className="compose-hint">
        提示：填好标题后按 <kbd>Enter</kbd> 即可快速添加；截止日期可以留空。
      </p>
    </section>
  );
}
