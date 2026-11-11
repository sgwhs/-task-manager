/** 日期相关的小工具函数 */

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const pad = (n) => String(n).padStart(2, '0');

/** 今天的 YYYY-MM-DD（按本地时区） */
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 头部显示的日期：2025年3月5日 周三 */
export function todayLabel() {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`;
}

/** 创建时间的友好显示：今天 09:12 / 昨天 18:30 / 3月5日 10:00 */
export function formatCreated(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday - startOfThat) / 86400000);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (diffDays === 0) return `今天 ${time}`;
  if (diffDays === 1) return `昨天 ${time}`;
  if (diffDays === 2) return `前天 ${time}`;
  if (diffDays > 2 && diffDays < 7) return `${WEEK[d.getDay()]} ${time}`;
  if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/**
 * 截止日期状态
 * 返回 { label, tone }  tone: overdue | today | soon | normal | done | none
 */
export function dueInfo(dueDate, completed) {
  if (!dueDate) return { label: '', tone: 'none' };

  const today = todayISO();
  const d = new Date(`${dueDate}T00:00:00`);
  const text = `${d.getMonth() + 1}月${d.getDate()}日`;

  if (dueDate < today) {
    const days = Math.round(
      (new Date(`${today}T00:00:00`) - new Date(`${dueDate}T00:00:00`)) / 86400000
    );
    return {
      label: completed ? `截止 ${text}` : `已逾期 ${days} 天`,
      tone: completed ? 'done' : 'overdue',
      text,
    };
  }
  if (dueDate === today) {
    return { label: '今天到期', tone: 'today', text };
  }

  const days = Math.round(
    (new Date(`${dueDate}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000
  );
  if (days === 1) return { label: '明天到期', tone: 'soon', text };
  if (days <= 3) return { label: `${days} 天后到期`, tone: 'soon', text };
  return { label: `${text} 到期`, tone: 'normal', text };
}

/** 完成率文案 */
export function rateText(rate) {
  return `${rate}%`;
}
