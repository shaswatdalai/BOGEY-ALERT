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
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-white/10 px-8">
      <div>
        <h2 className="text-xl font-bold leading-none text-white serif-font tracking-wide">{title}</h2>
        <p className="mt-1 text-xs text-luxury-blue/80 tracking-widest uppercase">{sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-white/40" />
          <input 
            type="text" 
            placeholder="Search employees…" 
            className="w-56 rounded-xl border border-white/10 bg-[#0a0a0f] py-2 pl-9 pr-4 text-xs text-white placeholder-white/30 outline-none transition focus:border-luxury-blue focus:ring-1 focus:ring-luxury-blue focus:bg-[#111116]"
          />
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/50 transition hover:bg-white/10 hover:text-white">
          <RefreshCw size={13} />
        </button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white/50 transition hover:bg-white/10 hover:text-white">
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