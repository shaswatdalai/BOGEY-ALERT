import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

function Sparkline({ data, color = "#3B82F6", height = 40 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1), min = Math.min(...data), range = max - min || 1;
  const W = 120, H = height;
  const pts = data.map((v, i) => [((i / (data.length - 1)) * W), H - ((v - min) / range) * (H - 6) - 3]);
  const line = pts.map((p, i) => (i === 0 ? `M${p}` : `L${p}`)).join(" ");
  const area = line + ` L${W},${H} L0,${H} Z`;
  const gid  = `g${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color} />
    </svg>
  );
}

function BarChart({ data, labels, colors }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-36 items-end justify-between gap-2 pt-2">
      {data.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="font-mono text-[10px] font-semibold text-slate-500">{v}</span>
          <div className="w-full rounded-t-lg transition-all duration-700"
            style={{ height:`${Math.max((v/max)*100,4)}%`, background:colors[i%colors.length], minHeight:"4px" }} />
          <span className="w-full truncate text-center text-[9px] font-medium text-slate-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Donut({ segments }) {
  const total = segments.reduce((s, g) => s + g.value, 0) || 1;
  const circ  = 2 * Math.PI * 40;
  let offset  = 0;
  const arcs  = segments.map((seg) => { const dash=(seg.value/total)*circ; const arc={dash,gap:circ-dash,offset,color:seg.color}; offset+=dash; return arc; });
  return (
    <div className="flex items-center gap-6">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="14" />
        {arcs.map((a, i) => (
          <circle key={i} cx="50" cy="50" r="40" fill="none" stroke={a.color} strokeWidth="14"
            strokeDasharray={`${a.dash} ${a.gap}`} strokeDashoffset={circ/4-a.offset}
            style={{ transition:"stroke-dasharray 0.8s ease" }} />
        ))}
        <text x="50" y="54" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0F172A"
          style={{ fontFamily:"JetBrains Mono,monospace" }}>{total}</text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ background:seg.color }} />
            <span className="text-xs font-medium text-slate-600">{seg.label}</span>
            <span className="ml-auto pl-4 font-mono text-xs font-bold text-slate-800">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const WEEKLY  = { labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], data:[2,5,3,8,4,1,0] };
const SPARK   = { score:[24,38,31,52,44,61,48,35,42,55,49,41], crit:[2,1,4,5,3,8,4,2,1,3,5,2], high:[5,8,6,11,9,12,8,6,7,9,10,8], med:[12,16,14,20,15,18,13,11,14,16,18,15] };
const METRICS = [
  { label:"Avg Risk Score",   value:"41.2", delta:"+3.4",  trend:"up",   data:SPARK.score, color:"#E24B4A", sub:"Last 30 days"   },
  { label:"Critical Events",  value:"28",   delta:"-12%",  trend:"down", data:SPARK.crit,  color:"#E24B4A", sub:"This month"     },
  { label:"High Risk Events", value:"84",   delta:"+8%",   trend:"up",   data:SPARK.high,  color:"#D97706", sub:"This month"     },
  { label:"Detection Rate",   value:"94%",  delta:"+1.2%", trend:"up",   data:SPARK.med,   color:"#1D4ED8", sub:"Model accuracy" },
];
const TOP_EMP = [
  { id:"EMP_003", role:"Intern",   events:8,  avg:74, peak:92, status:"CRITICAL" },
  { id:"EMP_001", role:"Manager",  events:5,  avg:55, peak:78, status:"HIGH"     },
  { id:"EMP_002", role:"Analyst",  events:12, avg:38, peak:61, status:"MEDIUM"   },
  { id:"EMP_000", role:"Engineer", events:22, avg:14, peak:35, status:"LOW"      },
];
const LC = { CRITICAL:{bg:"#FCEBEB",text:"#E24B4A"}, HIGH:{bg:"#FFFBEB",text:"#D97706"}, MEDIUM:{bg:"#FEF3C7",text:"#B45309"}, LOW:{bg:"#EFF6FF",text:"#1D4ED8"} };
const BAR_COLORS = ["#E24B4A","#D97706","#B45309","#1D4ED8","#065F46","#6D28D9","#BE185D"];

export default function AnalyticsPage({ alerts }) {
  const [range, setRange] = useState("7d");
  const dist = alerts.reduce((acc, a) => { const k=a.level==="NORMAL"?"NORMAL":a.level; acc[k]=(acc[k]||0)+1; return acc; }, {CRITICAL:0,HIGH:0,MEDIUM:0,LOW:0,NORMAL:0});
  const hasReal = alerts.length > 0;
  const donut = [
    { label:"Critical",     value:hasReal?dist.CRITICAL:5,                color:"#E24B4A" },
    { label:"High",         value:hasReal?dist.HIGH:12,                   color:"#D97706" },
    { label:"Medium",       value:hasReal?dist.MEDIUM:23,                 color:"#B45309" },
    { label:"Low / Normal", value:hasReal?dist.LOW+dist.NORMAL:60,        color:"#1D4ED8" },
  ];
  return (
    <div className="space-y-5 p-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{m.label}</div>
                <div className="mt-1 font-mono text-2xl font-bold text-slate-800">{m.value}</div>
              </div>
              <span className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${m.trend==="up"?"bg-red-50 text-red-600":"bg-emerald-50 text-emerald-600"}`}>
                {m.trend==="up"?<TrendingUp size={10}/>:<TrendingDown size={10}/>}{m.delta}
              </span>
            </div>
            <Sparkline data={m.data} color={m.color} height={36} />
            <div className="mt-1.5 text-[10px] text-slate-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Bar + Donut */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Weekly Events</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-700">Threat activity by day</div>
            </div>
            <div className="flex gap-1">
              {["7d","30d","90d"].map((r) => (
                <button key={r} onClick={() => setRange(r)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${range===r?"bg-blue-600 text-white":"bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <BarChart data={WEEKLY.data} labels={WEEKLY.labels} colors={BAR_COLORS} />
          <div className="mt-3 flex gap-4 text-[10px] font-semibold text-slate-400">
            {[["bg-red-400","Critical"],["bg-amber-400","High"],["bg-yellow-400","Medium"]].map(([bg,lbl]) => (
              <span key={lbl} className="flex items-center gap-1"><span className={`h-2 w-2 rounded-sm ${bg}`}/>{lbl}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Risk Distribution</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-700">{hasReal?"From your sessions":"Sample data"}</div>
          </div>
          <Donut segments={donut} />
        </div>
      </div>

      {/* Top risk table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Risk Employees</div>
          <div className="mt-0.5 text-sm font-semibold text-slate-700">Highest cumulative risk scores this month</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employee","Role","Events","Avg Score","Peak Score","Status"].map((h) => (
                  <th key={h} className="pb-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {TOP_EMP.map((emp) => {
                const c = LC[emp.status] || LC.LOW;
                return (
                  <tr key={emp.id} className="transition hover:bg-slate-50">
                    <td className="py-3 font-mono text-xs font-semibold text-slate-800">{emp.id}</td>
                    <td className="py-3 text-xs text-slate-500">{emp.role}</td>
                    <td className="py-3 font-mono text-xs text-slate-600">{emp.events}</td>
                    <td className="py-3 font-mono text-xs font-semibold text-slate-700">{emp.avg}</td>
                    <td className="py-3 font-mono text-xs font-bold" style={{color:c.text}}>{emp.peak}</td>
                    <td className="py-3">
                      <span className="rounded-md px-2.5 py-1 text-[10px] font-bold" style={{background:c.bg,color:c.text}}>{emp.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}