import "./App.css";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <main className="dashboard">
        <h1>📊 Professional Dashboard</h1>
        <p>Akky OS Command Center - Live Business Overview</p>

        <section className="cards">
          <div className="card">
            <p>Total Leads</p>
            <h2>1,245</h2>
            <span>+12% this week</span>
          </div>

          <div className="card">
            <p>Clients</p>
            <h2>328</h2>
            <span>+8 new</span>
          </div>

          <div className="card">
            <p>Tasks</p>
            <h2>47</h2>
            <span>12 urgent</span>
          </div>

          <div className="card">
            <p>AI Agents</p>
            <h2>8 Active</h2>
            <span>All systems online</span>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel">
            <h2>🤖 AI Agent Status</h2>

            <div className="agent">
              <span>Lead Finder Agent</span>
              <strong className="online">🟢 Online</strong>
            </div>

            <div className="agent">
              <span>Task Manager Agent</span>
              <strong className="working">🟡 Working</strong>
            </div>

            <div className="agent">
              <span>Report Agent</span>
              <strong className="offline">🔴 Offline</strong>
            </div>
          </div>

          <div className="panel">
            <h2>✅ Today's Tasks</h2>

            <ul className="task-list">
              <li>Call 5 new leads</li>
              <li>Prepare client follow-up report</li>
              <li>Review AI agent output</li>
              <li>Update dashboard data</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;