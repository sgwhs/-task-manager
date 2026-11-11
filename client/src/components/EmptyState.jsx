import { IconInbox, IconSearch, IconSparkle } from './Icons';

const CONTENT = {
  empty: {
    icon: <IconSparkle />,
    title: '还没有任何任务',
    desc: '在上面的输入框写下第一件要做的事，慢慢来，一件一件完成。',
  },
  filter: {
    icon: <IconInbox />,
    title: '这个优先级下还没有任务',
    desc: '换个筛选条件看看，或者添加一条新的任务。',
  },
  search: {
    icon: <IconSearch />,
    title: '没有找到匹配的任务',
    desc: '试试换一个关键词，或者清空搜索框查看全部任务。',
  },
};

export default function EmptyState({ variant = 'empty', onReset }) {
  const content = CONTENT[variant] || CONTENT.empty;
  return (
    <div className="empty">
      <div className="empty-icon">{content.icon}</div>
      <h3>{content.title}</h3>
      <p>{content.desc}</p>
      {variant !== 'empty' && (
        <button type="button" className="ghost-btn" onClick={onReset}>
          查看全部任务
        </button>
      )}
    </div>
  );
}
