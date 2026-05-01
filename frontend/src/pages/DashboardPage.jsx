import Header from "../components/Header.jsx";
import StatCard from "../components/StatCard.jsx";
import Analyzer from "../components/Analyzer.jsx";
import QuickScenarios from "../components/QuickScenarios.jsx";
import ActivityFeed from "../components/ActivityFeed.jsx";

const STATS = [
  { key:"CRITICAL", label:"Critical threats", icon:"🔴", topColor:"#E24B4A", numColor:"#E24B4A", bgColor:"#FCEBEB", borderColor:"#fca5a5" },
  { key:"HIGH",     label:"High risk",         icon:"🟠", topColor:"#D97706", numColor:"#D97706", bgColor:"#FFFBEB", borderColor:"#fcd34d" },
  { key:"MEDIUM",   label:"Medium risk",       icon:"🟡", topColor:"#B45309", numColor:"#B45309", bgColor:"#FEF3C7", borderColor:"#fde68a" },
  { key:"LOW",      label:"Low / Normal",      icon:"🔵", topColor:"#1D4ED8", numColor:"#1D4ED8", bgColor:"#EFF6FF", borderColor:"#bfdbfe" },
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