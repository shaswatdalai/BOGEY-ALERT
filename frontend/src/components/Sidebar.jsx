import { Shield, LayoutDashboard, BarChart2, Users, Bell, Settings, ChevronRight, LogOut } from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { id: "analytics", label: "Analytics",  icon: BarChart2 },
  { id: "employees", label: "Employees",  icon: Users },
  { id: "alerts",    label: "Alerts",     icon: Bell },
  { id: "settings",  label: "Settings",   icon: Settings },
];

export default function Sidebar({ active, onChange, alertCount }) {
  return (
    <aside className="flex h-screen w-56 flex-shrink-0 flex-col border-r border-white/5" style={{ background: "#0D1424" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600">
          <Shield size={15} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold leading-none text-white">ThreatWatch</div>
          <div className="mt-0.5 text-[10px] text-white/30">v2.4.1</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <div className="mb-3 px-2 text-[9px] font-bold uppercase tracking-widest text-white/20">Main Menu</div>
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-150
                ${isActive ? "bg-blue-600 text-white shadow-lg" : "text-white/40 hover:bg-white/5 hover:text-white/80"}`}
            >
              <Icon size={16} className={isActive ? "text-white" : "text-white/40 group-hover:text-white/70"} />
              <span className="flex-1">{label}</span>
              {id === "alerts" && alertCount > 0 && (
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold
                  ${isActive ? "bg-white/20 text-white" : "bg-red-500 text-white"}`}>
                  {alertCount > 99 ? "99+" : alertCount}
                </span>
              )}
              {isActive && <ChevronRight size={12} className="text-white/50" />}
            </button>
          );
        })}
      </nav>

      {/* User card */}
      <div className="border-t border-white/5 p-3">
        <div className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
            SO
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-white/80">SOC Analyst</div>
            <div className="truncate text-[10px] text-white/30">admin@threatwatch.io</div>
          </div>
          <LogOut size={14} className="flex-shrink-0 text-white/20 transition hover:text-white/60" />
        </div>
      </div>
    </aside>
  );
}