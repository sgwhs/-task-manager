import { IconLayers, IconCircleCheck, IconClock, IconTrend } from './Icons';

/** 完成率环形进度 */
function Ring({ value }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <svg className="ring" width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
      <circle className="ring-track" cx="26" cy="26" r={r} />
      <circle
        className="ring-value"
        cx="26"
        cy="26"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function Stat({ icon, tone, label, value, unit }) {
  return (
    <div className={`stat stat-${tone}`}>
      <div className="stat-head">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon tone-${tone}`}>{icon}</span>
      </div>
      <div className="stat-value">
        {value}
        <small>{unit}</small>
      </div>
    </div>
  );
}

export default function StatCards({ total, completed, active, rate }) {
  return (
    <section className="stats" aria-label="任务统计">
      <Stat icon={<IconLayers />} tone="blue" label="全部任务" value={total} unit="条" />
      <Stat icon={<IconCircleCheck />} tone="green" label="已完成" value={completed} unit="条" />
      <Stat icon={<IconClock />} tone="amber" label="未完成" value={active} unit="条" />

      <div className="stat stat-rate">
        <div className="stat-head">
          <span className="stat-label">完成率</span>
          <span className="stat-icon tone-indigo">
            <IconTrend />
          </span>
        </div>
        <div className="stat-rate-body">
          <Ring value={rate} />
          <div className="stat-rate-text">
            <div className="stat-value">
              {rate}
              <small>%</small>
            </div>
            <div className="stat-sub">
              {total === 0 ? '先添加第一条任务吧' : completed === total ? '全部完成，太棒了！' : `还剩 ${active} 条待完成`}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
