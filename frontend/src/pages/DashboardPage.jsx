import Header from "../components/Header.jsx";
import StatCard from "../components/StatCard.jsx";
import Analyzer from "../components/Analyzer.jsx";
import QuickScenarios from "../components/QuickScenarios.jsx";
import ActivityFeed from "../components/ActivityFeed.jsx";

const STATS = [
  { key:"CRITICAL", label:"Critical threats", icon:"🔴", topColor:"#ef4444", numColor:"#ef4444", bgColor:"rgba(239, 68, 68, 0.1)", borderColor:"rgba(239, 68, 68, 0.3)" },
  { key:"HIGH",     label:"High risk",         icon:"🟠", topColor:"#f97316", numColor:"#f97316", bgColor:"rgba(249, 115, 22, 0.1)", borderColor:"rgba(249, 115, 22, 0.3)" },
  { key:"MEDIUM",   label:"Medium risk",       icon:"🟡", topColor:"#eab308", numColor:"#eab308", bgColor:"rgba(234, 179, 8, 0.1)", borderColor:"rgba(234, 179, 8, 0.3)" },
  { key:"LOW",      label:"Low / Normal",      icon:"🔵", topColor:"#00d4ff", numColor:"#00d4ff", bgColor:"rgba(0, 212, 255, 0.1)", borderColor:"rgba(0, 212, 255, 0.3)" },
];

export default function DashboardPage({
  counts,
  alerts,
  threatScore,
  scoreColor,
  onResult,
  analyzerRef
}) {

  // Wrapper function to handle result and pass RAG explanation
  const handleResultWithRag = (result) => {
    // Call the original onResult with the result
    // The result already contains ragExplanation from Analyzer
    onResult(result);
  };

  return (
    <div className="space-y-5 p-6">

      <Header
        threatScore={threatScore}
        scoreColor={scoreColor}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((c) => (
          <StatCard
            key={c.key}
            count={counts[c.key]}
            {...c}
          />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">

        <Analyzer
          ref={analyzerRef}
          onResult={handleResultWithRag}
        />

        <QuickScenarios
          onScenario={(v) =>
            analyzerRef.current?.runWithValues(v)
          }
        />

      </div>

      <ActivityFeed alerts={alerts} />

    </div>
  );
}