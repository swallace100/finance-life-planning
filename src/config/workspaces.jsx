// Single source of truth for the three workspaces: launcher tiles, sidebar nav,
// accent theming, and default pages. Icon paths are Heroicons outline paths
// (moved from Sidebar.jsx). Accent classes are complete literals for Tailwind JIT.

function icon(...ds) {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {ds.map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />)}
    </svg>
  );
}

function tileIcon(...ds) {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {ds.map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />)}
    </svg>
  );
}

// ── Icon paths ────────────────────────────────────────────────────────────────

const D = {
  dashboard: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  budget: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  allocation1: "M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z",
  allocation2: "M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z",
  projection: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
  bank: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z",
  cds: "M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122",
  crypto: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  clock: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  heart: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  card: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
  cube: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
  monitor: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3",
  rocket1: "M3 3l1.664 9.526a2 2 0 001.168 1.489l9.526 4.763a2 2 0 002.342-.588l3.154-4.43a2 2 0 00-.099-2.498L13.086 4.57a2 2 0 00-1.916-.57L3 3z",
  rocket2: "M7.5 13.5l5-5",
  trophy: "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0",
  check: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  book: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
  media: "M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15",
  star: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.601a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  contacts: "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z",
  user: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  collection: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z",
  map1: "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z",
};

// ── Workspaces ────────────────────────────────────────────────────────────────

export const WORKSPACES = [
  {
    id: "finance",
    label: "Finance",
    tagline: "Net worth, budget & projections",
    tileIcon: tileIcon(D.budget),
    defaultPage: "dashboard",
    accent: {
      navActive:  "bg-blue-600 text-white",
      text:       "text-blue-400",
      tileBorder: "hover:border-blue-500/60",
      tileGlow:   "bg-blue-500/10 text-blue-400",
    },
    sections: [
      {
        label: "Overview",
        items: [
          { id: "dashboard",  label: "Dashboard",  icon: icon(D.dashboard) },
          { id: "budget",     label: "Budget",     icon: icon(D.budget) },
          { id: "allocation", label: "Allocation", icon: icon(D.allocation1, D.allocation2) },
          { id: "projection", label: "Projection", icon: icon(D.projection) },
        ],
      },
      {
        label: "Accounts",
        items: [
          { id: "nontangible", label: "Accounts",   icon: icon(D.bank) },
          { id: "cds",         label: "CDs",        icon: icon(D.cds) },
          { id: "crypto",      label: "Crypto",     icon: icon(D.crypto) },
          { id: "retirement",  label: "Retirement", icon: icon(D.clock) },
          { id: "donations",   label: "Donations",  icon: icon(D.heart) },
          { id: "debts",       label: "Debts",      icon: icon(D.card) },
        ],
      },
    ],
  },
  {
    id: "collections",
    label: "Collections",
    tagline: "Things you own & track",
    tileIcon: tileIcon(D.collection),
    defaultPage: "collections-overview",
    accent: {
      navActive:  "bg-amber-600 text-white",
      text:       "text-amber-400",
      tileBorder: "hover:border-amber-500/60",
      tileGlow:   "bg-amber-500/10 text-amber-400",
    },
    sections: [
      {
        label: "Overview",
        items: [
          { id: "collections-overview", label: "Overview", icon: icon(D.dashboard) },
        ],
      },
      {
        label: "Assets",
        items: [
          { id: "tangible", label: "Tangible Assets", icon: icon(D.cube) },
          { id: "digital",  label: "Digital Assets",  icon: icon(D.monitor) },
        ],
      },
      {
        label: "Library",
        items: [
          { id: "media",    label: "Media",    icon: icon(D.media) },
          { id: "wishlist", label: "Wishlist", icon: icon(D.star) },
        ],
      },
    ],
  },
  {
    id: "planning",
    label: "Goals & Planning",
    tagline: "Goals, tasks & life tracking",
    tileIcon: tileIcon(D.map1),
    defaultPage: "planning-overview",
    accent: {
      navActive:  "bg-emerald-600 text-white",
      text:       "text-emerald-400",
      tileBorder: "hover:border-emerald-500/60",
      tileGlow:   "bg-emerald-500/10 text-emerald-400",
    },
    sections: [
      {
        label: "Overview",
        items: [
          { id: "planning-overview", label: "Overview", icon: icon(D.dashboard) },
        ],
      },
      {
        label: "Goals",
        items: [
          { id: "goals",        label: "Goals",        icon: icon(D.rocket1, D.rocket2) },
          { id: "achievements", label: "Achievements", icon: icon(D.trophy) },
        ],
      },
      {
        label: "Life",
        items: [
          { id: "tasks",    label: "Tasks",    icon: icon(D.check) },
          { id: "research", label: "Research", icon: icon(D.book) },
        ],
      },
      {
        label: "Personal",
        items: [
          { id: "profile",  label: "Personal Info", icon: icon(D.user) },
          { id: "contacts", label: "Contacts",      icon: icon(D.contacts) },
        ],
      },
    ],
  },
];

export const WORKSPACE_MAP = Object.fromEntries(WORKSPACES.map((w) => [w.id, w]));
