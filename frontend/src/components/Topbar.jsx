import { Bell, Search, RefreshCw } from "lucide-react";

const PAGE_META = {
  dashboard: { title: "Dashboard",  sub: "Real-time behavioral monitoring"  },
  analytics:  { title: "Analytics",  sub: "Historical trends and patterns"   },
  employees:  { title: "Employees",  sub: "Employee profiles and baselines"  },
  alerts:     { title: "Alerts",     sub: "Flagged incidents and reviews"    },
  settings:   { title: "Settings",   sub: "System configuration"             },
};

export default function Topbar({ page, alertCount }) {
  const { title, sub } = PAGE_META[page] || PAGE_META.dashboard;
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h2 className="text-base font-bold leading-none text-slate-800">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex w-48 cursor-text items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 transition hover:border-slate-300">
          <Search size={12} />Search employees…
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
          <RefreshCw size={13} />
        </button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
          <Bell size={13} />
          {alertCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </button>
        <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
          SO
        </div>
      </div>
    </header>
  );
}