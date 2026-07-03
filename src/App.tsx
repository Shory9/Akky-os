import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";

function App() {
  const [command, setCommand] = useState("");
  const [reply, setReply] = useState("");

  return (
    <div className="app">
      <Sidebar />

      <main className="dashboard">
        <div className="hero-section">
          <div>
            <p className="eyebrow">Akky OS Command Center</p>
            <h1>📊 Professional Dashboard</h1>
            <p className="subtitle">
              Live business overview, AI agents, tasks and growth control.
            </p>
          </div>

          <button className="primary-btn">
            ⚡ Run Daily System
          </button>
        </div>

        <section className="ai-command">
          <h2>🤖 Ask Akky AI</h2>

          <p>
            Type your command and let Akky OS prepare the next action.
          </p>

          <div className="command-row">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Example: Show today's leads..."
            />

            <button
              onClick={() => {
                if (command === "") {
                  setReply("Please type a command.");
                } else {
                  setReply("Akky AI received");
                }
              }}
            >
              Execute
            </button>
          </div>

          {reply && (
            <div style={{ marginTop: "15px", color: "#22c55e" }}>
              {reply}
            </div>
          )}

          <div className="quick-actions">
            <button>📊 Daily Report</button>
            <button>👥 New Lead</button>
            <button>📞 Follow Up</button>
            <button>🤖 Run Agents</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;