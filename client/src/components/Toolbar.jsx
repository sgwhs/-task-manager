import { IconSearch, IconX, IconTrash } from './Icons';

const FILTERS = ['全部', '高', '中', '低'];

export default function Toolbar({
  filter,
  onFilterChange,
  counts,
  keyword,
  onKeywordChange,
  completedCount,
  onClearCompleted,
}) {
  return (
    <section className="toolbar">
      <div className="filters" role="group" aria-label="按优先级筛选">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`chip ${filter === f ? 'is-active' : ''}`}
            aria-pressed={filter === f}
            onClick={() => onFilterChange(f)}
          >
            {f === '全部' ? '全部' : `${f}优先级`}
            <b>{counts[f] ?? 0}</b>
          </button>
        ))}
      </div>

      <div className="toolbar-right">
        <div className={`search ${keyword ? 'has-value' : ''}`}>
          <IconSearch className="search-icon" />
          <input
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="搜索任务标题"
            aria-label="搜索任务"
          />
          {keyword && (
            <button
              type="button"
              className="search-clear"
              onClick={() => onKeywordChange('')}
              aria-label="清空搜索"
            >
              <IconX />
            </button>
          )}
        </div>

        <button
          type="button"
          className="ghost-btn"
          onClick={onClearCompleted}
          disabled={completedCount === 0}
          title={completedCount === 0 ? '还没有已完成的任务' : '删除所有已完成的任务'}
        >
          <IconTrash />
          清除已完成
        </button>
      </div>
    </section>
  );
}
