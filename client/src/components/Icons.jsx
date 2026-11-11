/** 统一风格的线性图标（stroke 使用 currentColor，跟随文字颜色） */
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const IconCheck = (props) => (
  <svg {...base} {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconPlus = (props) => (
  <svg {...base} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconTrash = (props) => (
  <svg {...base} {...props}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
  </svg>
);

export const IconSearch = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const IconCalendar = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

export const IconLayers = (props) => (
  <svg {...base} {...props}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </svg>
);

export const IconCircleCheck = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </svg>
);

export const IconClock = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconTrend = (props) => (
  <svg {...base} {...props}>
    <path d="M3 17l5-5 4 4 8-8" />
    <path d="M15 8h5v5" />
  </svg>
);

export const IconCloud = (props) => (
  <svg {...base} {...props}>
    <path d="M17.5 19a4.5 4.5 0 0 0 .5-8.96A6 6 0 0 0 6.2 9.5 4.5 4.5 0 0 0 6.5 19h11Z" />
  </svg>
);

export const IconDatabase = (props) => (
  <svg {...base} {...props}>
    <ellipse cx="12" cy="5.5" rx="8" ry="3" />
    <path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13" />
    <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
  </svg>
);

export const IconInbox = (props) => (
  <svg {...base} {...props}>
    <path d="M3 10.5 5.6 4.6A2 2 0 0 1 7.4 3.4h9.2a2 2 0 0 1 1.8 1.2L21 10.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7.5Z" />
    <path d="M3 10.5h5l1 2.5h6l1-2.5h5" />
  </svg>
);

export const IconX = (props) => (
  <svg {...base} {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconSparkle = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3v4M12 17v4M5.5 12h-3M21.5 12h-3M7 7l-2-2M19 19l-2-2M7 17l-2 2M19 5l-2 2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconAlert = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5v.01" />
  </svg>
);
