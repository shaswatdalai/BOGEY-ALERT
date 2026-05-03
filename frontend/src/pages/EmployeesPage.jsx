import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

const EMPS = [
  { id:"EMP_000", name:"Alex Chen",     role:"Senior Engineer", dept:"Engineering", risk:14, level:"LOW",      lastSeen:"2 min ago",   events:22, baseline:{files:10,hour:9,mb:50}  },
  { id:"EMP_001", name:"Jordan Lee",    role:"Product Manager", dept:"Product",     risk:55, level:"HIGH",     lastSeen:"18 min ago",  events:5,  baseline:{files:15,hour:10,mb:80} },
  { id:"EMP_002", name:"Sam Rivera",    role:"Data Analyst",    dept:"Analytics",   risk:38, level:"MEDIUM",   lastSeen:"1 hr ago",    events:12, baseline:{files:8,hour:9,mb:40}   },
  { id:"EMP_003", name:"Taylor Morgan", role:"Intern",          dept:"Engineering", risk:82, level:"CRITICAL", lastSeen:"Just now",    events:8,  baseline:{files:5,hour:9,mb:20}   },
];
const LC = {
  CRITICAL:{bg:"rgba(239,68,68,0.15)",text:"#ef4444",bar:"#ef4444"},
  HIGH:    {bg:"rgba(249,115,22,0.15)",text:"#f97316",bar:"#f97316"},
  MEDIUM:  {bg:"rgba(234,179,8,0.15)",text:"#eab308",bar:"#eab308"},
  LOW:     {bg:"rgba(59,130,246,0.15)",text:"#3b82f6",bar:"#3b82f6"},
};
const GRADS = ["from-blue-500 to-indigo-600","from-violet-500 to-purple-600","from-emerald-500 to-teal-600","from-rose-500 to-pink-600"];
const initials = (n) => n.split(" ").map((x)=>x[0]).join("").slice(0,2).toUpperCase();

function Card({ emp, idx }) {
  const [open, setOpen] = useState(false);
  const c = LC[emp.level] || LC.LOW;
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md transition hover:shadow-[0_0_15px_rgba(0,212,255,0.15)] hover:border-luxury-blue/30">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-lg ${GRADS[idx%GRADS.length]}`}>
            {initials(emp.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-white/90">{emp.name}</span>
              <span className="rounded-md px-2 py-0.5 text-[10px] font-bold border border-current" style={{background:c.bg,color:c.text}}>{emp.level}</span>
            </div>
            <div className="mt-0.5 text-xs text-white/50">{emp.role} · {emp.dept}</div>
            <div className="mt-0.5 font-mono text-[10px] text-white/30">{emp.id}</div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="font-mono text-2xl font-bold drop-shadow-md" style={{color:c.text}}>{emp.risk}</div>
            <div className="text-[9px] uppercase tracking-wider text-white/40">risk score</div>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full transition-all duration-700 shadow-[0_0_8px_currentColor]" style={{width:`${emp.risk}%`,background:c.bar, color:c.bar}} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[10px] text-white/40">
            Last active: <span className="font-semibold text-white/80">{emp.lastSeen}</span>
            <span className="mx-2 text-white/20">·</span>
            <span className="font-semibold text-white/80">{emp.events} events</span>
          </div>
          <button onClick={() => setOpen((o)=>!o)}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/50 transition hover:bg-white/10 hover:text-white">
            Baseline {open?<ChevronUp size={10}/>:<ChevronDown size={10}/>}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-black/20 px-5 py-4 animate-fade-in">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-luxury-blue">Normal Baseline</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[["Login Hour",emp.baseline.hour+":00"],["Daily Files",emp.baseline.files],["Data (MB)",emp.baseline.mb]].map(([l,v])=>(
              <div key={l} className="rounded-xl border border-white/10 bg-black/30 py-2.5 hover:bg-black/50 transition">
                <div className="font-mono text-sm font-bold text-white/90">{v}</div>
                <div className="mt-0.5 text-[9px] text-white/40">{l}</div>
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
    <div className="space-y-5 p-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input type="text" placeholder="Search by name, ID or dept…" value={search} onChange={(e)=>setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-luxury-blue focus:ring-1 focus:ring-luxury-blue hover:border-white/20" />
        </div>
        <div className="flex flex-wrap gap-2">
          {["ALL","CRITICAL","HIGH","MEDIUM","LOW"].map((f) => {
            const c=LC[f]||{}; const active=filter===f;
            return (
              <button key={f} onClick={()=>setFilter(f)} className="rounded-xl border px-3 py-1.5 text-xs font-bold transition hover:opacity-80"
                style={active?{background:f==="ALL"?"rgba(0,212,255,0.2)":c.bg,color:f==="ALL"?"#00d4ff":c.text,borderColor:f==="ALL"?"rgba(0,212,255,0.4)":c.text}:{background:"rgba(0,0,0,0.4)",color:"rgba(255,255,255,0.4)",borderColor:"rgba(255,255,255,0.1)"}}>
                {f}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Total",EMPS.length,"#00d4ff"],["Critical",EMPS.filter(e=>e.level==="CRITICAL").length,"#ef4444"],["High Risk",EMPS.filter(e=>e.level==="HIGH").length,"#f97316"],["Normal",EMPS.filter(e=>e.level==="LOW").length,"#10b981"]].map(([l,v,col])=>(
          <div key={l} className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-3 text-center transition hover:-translate-y-1 hover:shadow-lg">
            <div className="font-mono text-3xl font-bold drop-shadow-md" style={{color:col}}>{v}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">{l}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((emp, i) => <Card key={emp.id} emp={emp} idx={i} />)}
      </div>
      {filtered.length===0 && (
        <div className="rounded-2xl border border-white/10 bg-black/40 py-12 text-center text-white/50 italic">No employees match your search</div>
      )}
    </div>
  );
}