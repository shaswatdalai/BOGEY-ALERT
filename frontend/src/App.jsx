import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import EmployeesPage from "./pages/EmployeesPage";
import AlertsPage from "./pages/AlertsPage";
import SettingsPage from "./pages/SettingsPage";
import Analyzer from "./components/Analyzer";

// Wrapper so QuickScenarios can trigger Analyzer from outside
const AnalyzerWithRef = forwardRef(function AnalyzerWithRef({ onResult }, ref) {
  const innerRef = useRef();
  useImperativeHandle(ref, () => ({
    runWithValues: (values) => innerRef.current?.runWithValues(values),
  }));
  return <Analyzer ref={innerRef} onResult={onResult} />;
});

export default function App() {
  const [page, setPage]          = useState("dashboard");
  const [counts, setCounts]      = useState({ CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 });
  const [alerts, setAlerts]      = useState([]);
  const [threatScore, setThreat] = useState(0);
  const [scoreColor, setColor]   = useState("#34D399");
  const analyzerRef              = useRef();

  function handleResult(result) {
    setThreat(result.score);
    setColor(result.color);
    const bucket = result.level === "NORMAL" ? "LOW" : result.level;
    setCounts((c) => ({ ...c, [bucket]: c[bucket] + 1 }));
    setAlerts((prev) => [
      {
        emp:   result.emp   || "EMP_000",
        hr:    result.hr,
        files: result.files,
        sens:  result.sens  || 0,
        mb:    result.mb,
        score: result.score,
        level: result.level,
        time:  new Date().toLocaleTimeString("en-US", { hour12: false }),
      },
      ...prev.slice(0, 49),
    ]);
  }

  const unresolved = alerts.filter((a) => ["CRITICAL", "HIGH"].includes(a.level)).length;

  const PAGES = {
    dashboard: (
      <DashboardPage
        counts={counts}
        alerts={alerts}
        threatScore={threatScore}
        scoreColor={scoreColor}
        onResult={handleResult}
        analyzerRef={analyzerRef}
        AnalyzerWithRef={AnalyzerWithRef}
      />
    ),
    analytics: <AnalyticsPage alerts={alerts} />,
    employees: <EmployeesPage />,
    alerts:    <AlertsPage liveAlerts={alerts} />,
    settings:  <SettingsPage />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100" style={{ fontFamily: "Inter, sans-serif" }}>
      <Sidebar active={page} onChange={setPage} alertCount={unresolved} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar page={page} alertCount={unresolved} />
        <main className="flex-1 overflow-y-auto">
          {PAGES[page] || PAGES.dashboard}
        </main>
      </div>
    </div>
  );
}