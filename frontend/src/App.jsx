import { useState, useRef, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import EmployeesPage from "./pages/EmployeesPage.jsx";
import AlertsPage from "./pages/AlertsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ExceptionManager from "./pages/ExceptionManager.jsx";

export default function App() {

  const [page, setPage] = useState("dashboard");

  const [counts, setCounts] = useState({
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  });

  const [alerts, setAlerts] = useState([]);

  const [threatScore, setThreat] = useState(0);

  const [scoreColor, setColor] = useState("#34D399");

  const analyzerRef = useRef();


  function handleResult(result) {

    setThreat(result.score);

    setColor(result.color);

    const bucket =
      result.level === "NORMAL"
        ? "LOW"
        : result.level;

    setCounts((c) => ({
      ...c,
      [bucket]: c[bucket] + 1
    }));


    setAlerts((prev) => [

      {
        emp: result.emp || "EMP_000",
        hr: result.hr,
        files: result.files,
        sens: result.sens || 0,
        mb: result.mb,
        score: result.score,
        level: result.level,
        time: new Date().toLocaleTimeString("en-US", {
          hour12: false
        }),
        ragExplanation: result.ragExplanation || null
      },

      ...prev.slice(0, 49)

    ]);

  }

  // NEW: WebSocket connection for live alerts (e.g., from friend_agent.py)
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:9091/ws/alerts");
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Map the backend response to the frontend alert format
        setAlerts((prev) => [
          {
            emp: data.employee_id || "EMP_000",
            hr: data.details?.current_login_hour || 0,
            files: data.details?.current_files || 0,
            sens: data.sensitive_files || 0,
            mb: data.data_mb || 0,
            score: data.risk_score,
            level: data.risk_level.replace(/[^a-zA-Z]/g, '').trim().toUpperCase(), // Strip emojis like "🔴 CRITICAL" -> "CRITICAL"
            time: new Date().toLocaleTimeString("en-US", { hour12: false }),
            ragExplanation: data.rag_explanation || null,
            file_names: data.file_names || []
          },
          ...prev.slice(0, 49)
        ]);

        // Update counts
        const rawLevel = data.risk_level.replace(/[^a-zA-Z]/g, '').trim().toUpperCase();
        const bucket = rawLevel === "NORMAL" || rawLevel === "EXEMPTED" ? "LOW" : rawLevel;
        
        setCounts((c) => ({
          ...c,
          [bucket]: (c[bucket] || 0) + 1
        }));

        // Flash latest threat score if we want (optional)
        setThreat(data.risk_score);
        if (data.risk_score >= 80) setColor("#E24B4A");
        else if (data.risk_score >= 60) setColor("#D97706");
        else if (data.risk_score >= 35) setColor("#B45309");
        else setColor("#34D399");
        
      } catch (err) {
        console.error("Error parsing live alert:", err);
      }
    };

    ws.onclose = () => console.log("WebSocket disconnected");
    
    return () => ws.close();
  }, []);

  const unresolved =
    alerts.filter((a) =>
      ["CRITICAL", "HIGH"].includes(a.level)
    ).length;


  const PAGES = {

    dashboard: (
      <DashboardPage
        counts={counts}
        alerts={alerts}
        threatScore={threatScore}
        scoreColor={scoreColor}
        onResult={handleResult}
        analyzerRef={analyzerRef}
      />
    ),

    analytics: (
      <AnalyticsPage alerts={alerts} />
    ),

    employees: (
      <EmployeesPage />
    ),

    alerts: (
      <AlertsPage liveAlerts={alerts} />
    ),

    settings: (
      <SettingsPage />
    ),

    exceptions: (
      <ExceptionManager />
    )

  };


  return (

    <div
      className="flex h-screen overflow-hidden bg-slate-100"
      style={{ fontFamily: "Inter, sans-serif" }}
    >

      <Sidebar
        active={page}
        onChange={setPage}
        alertCount={unresolved}
      />

      <div className="flex flex-1 flex-col overflow-hidden">

        <Topbar
          page={page}
          alertCount={unresolved}
        />

        <main className="flex-1 overflow-y-auto">
          {PAGES[page] || PAGES.dashboard}
        </main>

      </div>

    </div>

  );

}