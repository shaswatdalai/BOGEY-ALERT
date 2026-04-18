export default function RiskResult({ result }) {

  if (!result) return null;

  const {
    score,
    level,
    action,
    color,
    bgColor,
    tScore,
    vScore,
    sScore,
    bScore
  } = result;

  const bars = [
    { label: "Time", val: tScore, color: "#E24B4A" },
    { label: "Volume", val: vScore, color: "#D97706" },
    { label: "Sensitive", val: sScore, color: "#B45309" },
    { label: "Behavior", val: bScore, color: "#1D4ED8" },
  ];

  return (
    <div
      className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
      style={{ animation: "slideUp 0.3s ease" }}
    >

      <style>
        {`
          @keyframes slideUp {
            from { opacity:0; transform:translateY(6px) }
            to   { opacity:1; transform:translateY(0) }
          }
        `}
      </style>


      <div className="flex items-center gap-4 p-4">

        <div
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 font-mono text-xl font-bold"
          style={{
            color,
            borderColor: color,
            background: bgColor
          }}
        >
          {score}
        </div>


        <div className="flex-1">

          <div
            className="text-base font-bold"
            style={{ color }}
          >
            {level}
          </div>

          <div className="mt-1 text-xs leading-relaxed text-slate-500">
            {action}
          </div>

        </div>

      </div>


      <div className="px-4 pb-3">

        <div className="mb-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <span>Risk score</span>
          <span>{score} / 100</span>
        </div>


        <div className="h-2 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${score}%`,
              background: color
            }}
          />

        </div>

      </div>


      <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200">

        {[
          ["Hour", result.hr + ":00"],
          ["Files", result.files],
          ["MB", result.mb]
        ].map(([label, value]) => (

          <div key={label} className="py-3 text-center">

            <div className="font-mono text-base font-bold text-slate-800">
              {value}
            </div>

            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-400">
              {label}
            </div>

          </div>

        ))}

      </div>


      <div className="border-t border-slate-200 p-4">

        <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Score Breakdown
        </div>


        {bars.map(({ label, val, color: barColor }) => (

          <div
            key={label}
            className="mb-2 flex items-center gap-2.5"
          >

            <span className="w-16 text-right text-xs font-medium text-slate-400">
              {label}
            </span>


            <div className="flex-1 h-2 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${val}%`,
                  background: barColor
                }}
              />

            </div>


            <span
              className="w-6 text-right font-mono text-xs font-bold"
              style={{ color: barColor }}
            >
              {val}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}