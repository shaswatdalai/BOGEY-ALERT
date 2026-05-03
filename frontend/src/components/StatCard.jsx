export default function StatCard({ label, count, icon, topColor, numColor, bgColor, borderColor }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-black/40 backdrop-blur-md p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]"
      style={{ borderColor, borderTopColor: topColor, borderTopWidth: "3px" }}>
      <div className="pointer-events-none absolute -bottom-6 -right-3 h-24 w-24 rounded-full opacity-20 blur-xl"
        style={{ background: topColor }} />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-base" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
          {icon}
        </div>
        <span className="rounded-lg px-2 py-0.5 text-xs font-bold border" style={{ background: bgColor, color: numColor, borderColor }}>
          +{count}
        </span>
      </div>
      <div className="font-mono text-4xl font-bold leading-none tracking-tight drop-shadow-md" style={{ color: numColor }}>{count}</div>
      <div className="mt-2 text-xs font-medium text-white/50 tracking-wide uppercase">{label}</div>
    </div>
  );
}