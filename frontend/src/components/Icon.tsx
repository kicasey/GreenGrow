type IconName =
  | "leaf"
  | "sprout"
  | "cart"
  | "box"
  | "tag"
  | "users"
  | "employee"
  | "receipt"
  | "chart"
  | "dashboard"
  | "lock"
  | "login"
  | "refresh"
  | "search"
  | "back"
  | "check"
  | "alert"
  | "trash"
  | "edit"
  | "plus";

const paths: Record<IconName, React.ReactNode> = {
  leaf: (
    <>
      <path d="M20 4c-7 0-13 4-13 12 0 2 0 4 1 5 1-8 6-11 11-12-4 2-8 5-10 11 0 0 3 1 6 1 6 0 11-5 11-12V4h-6z" />
      <path d="M7 21c1-4 3-7 6-9" strokeLinecap="round" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 20V10" strokeLinecap="round" />
      <path d="M12 10c0-3 2-5 6-5-1 4-3 6-6 6z" />
      <path d="M12 10c0-3-2-5-6-5 1 4 3 6 6 6z" />
      <path d="M6 20h12" strokeLinecap="round" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.5 12.5a2 2 0 002 1.5h8.5a2 2 0 002-1.5L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  box: (
    <>
      <path d="M3.5 7L12 3l8.5 4v10L12 21 3.5 17V7z" strokeLinejoin="round" />
      <path d="M3.5 7L12 11l8.5-4M12 11v10" strokeLinejoin="round" />
    </>
  ),
  tag: (
    <>
      <path d="M20 12l-8 8-8-8V4h8l8 8z" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3 19c0-3.5 3-5.5 6-5.5s6 2 6 5.5" strokeLinecap="round" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M15 19c0-2.5 2-4 4-4s2 1 2 2" strokeLinecap="round" />
    </>
  ),
  employee: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c0-4 3-6 7-6s7 2 7 6" strokeLinecap="round" />
      <path d="M8 4l4-1 4 1" strokeLinecap="round" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="10" rx="1.5" />
      <rect x="13" y="3" width="8" height="6" rx="1.5" />
      <rect x="13" y="11" width="8" height="10" rx="1.5" />
      <rect x="3" y="15" width="8" height="6" rx="1.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </>
  ),
  login: (
    <>
      <path d="M10 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12H3" strokeLinecap="round" />
      <path d="M15 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" strokeLinecap="round" />
    </>
  ),
  refresh: (
    <>
      <path d="M4 10a8 8 0 0114-4M20 14a8 8 0 01-14 4" strokeLinecap="round" />
      <path d="M4 4v6h6M20 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />,
  check: <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />,
  alert: (
    <>
      <path d="M12 3l10 18H2L12 3z" strokeLinejoin="round" />
      <path d="M12 10v4M12 17v.5" strokeLinecap="round" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" strokeLinejoin="round" strokeLinecap="round" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l10-10-4-4L4 16v4z" strokeLinejoin="round" />
      <path d="M14 6l4 4" strokeLinecap="round" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" strokeLinecap="round" />,
};

interface Props {
  name: IconName;
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}

export default function Icon({ name, size = 18, className, ...rest }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={className}
      aria-hidden={rest["aria-hidden"] ?? true}
    >
      {paths[name]}
    </svg>
  );
}
