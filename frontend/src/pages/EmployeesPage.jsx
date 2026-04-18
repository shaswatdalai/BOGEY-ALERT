import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

const EMPS = [
  { id:"EMP_000", name:"Alex Chen",     role:"Senior Engineer", dept:"Engineering", risk:14, level:"LOW",      lastSeen:"2 min ago",   events:22, baseline:{files:10,hour:9,mb:50}  },
  { id:"EMP_001", name:"Jordan Lee",    role:"Product Manager", dept:"Product",     risk:55, level:"HIGH",     lastSeen:"18 min ago",  events:5,  baseline:{files:15,hour:10,mb:80} },
  { id:"EMP_002", name:"Sam Rivera",    role:"Data Analyst",    dept:"Analytics",   risk:38, level:"MEDIUM",   lastSeen:"1 hr ago",    events:12, baseline:{files:8,hour:9,mb:40}   },
  { id:"EMP_003", name:"Taylor Morgan", role:"Intern",          dept:"Engineering", risk:82, level:"CRITICAL", lastSeen:"Just now",    events:8,  baseline:{files:5,hour:9,mb:20}   },
];
const LC = {
  CRITICAL:{bg:"#FCEBEB",text:"#E24B4A",bar:"#E24B4A"},
  HIGH:    {bg:"#FFFBEB",text:"#D97706",bar:"#D97706"},
  MEDIUM:  {bg:"#FEF3C7",text:"#B45309",bar:"#B45309"},
  LOW:     {bg:"#EFF6FF",text:"#1D4ED8",bar:"#1D4ED8"},
};
const GRADS = ["from-blue-500 to-indigo-600","from-violet-500 to-purple-600","from-emerald-500 to-teal-600","from-rose-500 to-pink-600"];
const initials = (n) => n.split(" ").map((x)=>x[0]).join("").slice(0,2).toUpperCase();

function Card({ emp, idx }) {
  const [open, setOpen] = useState(false);
  const c = LC[emp.level] || LC.LOW;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white ${GRADS[idx%GRADS.length]}`}>
            {initials(emp.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-800">{emp.name}</span>
              <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{background:c.bg,color:c.text}}>{emp.level}</span>
            </div>
            <div className="mt-0.5 text-xs text-slate-400">{emp.role} · {emp.dept}</div>
            <div className="mt-0.5 font-mono text-[10px] text-slate-300">{emp.id}</div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="font-mono text-2xl font-bold" style={{color:c.text}}>{emp.risk}</div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400">risk score</div>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full transition-all duration-700" style={{width:`${emp.risk}%`,background:c.bar}} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[10px] text-slate-400">
            Last active: <span className="font-semibold text-slate-600">{emp.lastSeen}</span>
            <span className="mx-2 text-slate-200">·</span>
            <span className="font-semibold text-slate-600">{emp.events} events</span>
          </div>
          <button onClick={() => setOpen((o)=>!o)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-slate-600">
            Baseline {open?<ChevronUp size={10}/>:<ChevronDown size={10}/>}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Normal Baseline</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[["Login Hour",emp.baseline.hour+":00"],["Daily Files",emp.baseline.files],["Data (MB)",emp.baseline.mb]].map(([l,v])=>(
              <div key={l} className="rounded-xl border border-slate-200 bg-white py-2.5">
                <div className="font-mono text-sm font-bold text-slate-700">{v}</div>
                <div className="mt-0.5 text-[9px] text-slate-400">{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const filtered = EMPS.filter((e) => {
    const ms = e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()) || e.dept.toLowerCase().includes(search.toLowerCase());
    return ms && (filter==="ALL" || e.level===filter);
  });
  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name, ID or dept…" value={search} onChange={(e)=>setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15" />
        </div>
        <div className="flex flex-wrap gap-2">
          {["ALL","CRITICAL","HIGH","MEDIUM","LOW"].map((f) => {
            const c=LC[f]||{}; const active=filter===f;
            return (
              <button key={f} onClick={()=>setFilter(f)} className="rounded-xl border px-3 py-1.5 text-xs font-bold transition"
                style={active?{background:f==="ALL"?"#1D4ED8":c.bg,color:f==="ALL"?"#fff":c.text,borderColor:f==="ALL"?"#1D4ED8":c.text}:{background:"#fff",color:"#94A3B8",borderColor:"#E2E8F0"}}>
                {f}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Total",EMPS.length,"#1D4ED8"],["Critical",EMPS.filter(e=>e.level==="CRITICAL").length,"#E24B4A"],["High Risk",EMPS.filter(e=>e.level==="HIGH").length,"#D97706"],["Normal",EMPS.filter(e=>e.level==="LOW").length,"#065F46"]].map(([l,v,col])=>(
          <div key={l} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center">
            <div className="font-mono text-2xl font-bold" style={{color:col}}>{v}</div>
            <div className="mt-0.5 text-[10px] font-medium text-slate-400">{l}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((emp, i) => <Card key={emp.id} emp={emp} idx={i} />)}
      </div>
      {filtered.length===0 && (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-400">No employees match your search</div>
      )}
    </div>
  );
}