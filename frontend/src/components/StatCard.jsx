export default function StatCard({ label, count, icon, topColor, numColor, bgColor, borderColor }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      style={{ borderColor, borderTopColor: topColor, borderTopWidth: "3px" }}>
      <div className="pointer-events-none absolute -bottom-6 -right-3 h-16 w-16 rounded-full opacity-10"
        style={{ background: topColor }} />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl text-base" style={{ background: bgColor }}>
          {icon}
        </div>
        <span className="rounded-lg px-2 py-0.5 text-xs font-bold" style={{ background: bgColor, color: numColor }}>
          +{count}
        </span>
      </div>
      <div className="font-mono text-4xl font-bold leading-none" style={{ color: numColor }}>{count}</div>
      <div className="mt-1 text-xs font-medium text-slate-400">{label}</div>
    </div>
  );
}