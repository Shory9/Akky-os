import { useMemo, useState, type CSSProperties } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";

type Metric = {
  label: string;
  value: string;
  hint: string;
  tone: "violet" | "cyan" | "amber" | "green";
};

const pipelineStages = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Won",
];

function App() {
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [search, setSearch] = useState("");
  const [showCapture, setShowCapture] = useState(false);

  const metrics = useMemo<Metric[]>(
    () => [
      {
        label: "Total leads",
        value: "—",
        hint: "Connect lead data",
        tone: "violet",
      },
      {
        label: "New today",
        value: "—",
        hint: "No activity yet",
        tone: "cyan",
      },
      {
        label: "Follow-ups due",
        value: "—",
        hint: "Agenda is clear",
        tone: "amber",
      },
      {
        label: "Won value",
        value: "—",
        hint: "No closed deals",
        tone: "green",
      },
    ],
    [],
  );

  return (
    <div className="app-shell">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <main className="dashboard-shell">
        <header className="topbar">
          <div className="mobile-brand">
            <span>AO</span>
            <strong>AkkyOS</strong>
          </div>

          <label className="global-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search leads, contacts or tasks"
              aria-label="Search workspace"
            />
            <kbd>⌘ K</kbd>
          </label>

          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications">
              <span>○</span>
            </button>
            <button className="profile-button">
              <span className="avatar">AP</span>
              <span className="profile-copy">
                <strong>Workspace owner</strong>
                <small>Company workspace</small>
              </span>
              <span>⌄</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-row">
            <div>
              <p className="section-kicker">LEADS COMMAND DECK</p>
              <h1>Make every lead move forward.</h1>
              <p className="welcome-copy">
                One focused view for pipeline health, next actions and your
                team’s momentum.
              </p>
            </div>

            <div className="welcome-actions">
              <button className="secondary-button">Import leads</button>
              <button
                className="primary-button"
                onClick={() => setShowCapture(true)}
              >
                <span>＋</span> Capture lead
              </button>
            </div>
          </section>

          <section className="metric-grid" aria-label="Lead metrics">
            {metrics.map((metric) => (
              <article className={`metric-card ${metric.tone}`} key={metric.label}>
                <div className="metric-topline">
                  <span>{metric.label}</span>
                  <span className="metric-dot" />
                </div>
                <strong>{metric.value}</strong>
                <small>{metric.hint}</small>
              </article>
            ))}
          </section>

          <section className="dashboard-grid">
            <article className="panel pipeline-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-label">PIPELINE PULSE</span>
                  <h2>Lead movement</h2>
                </div>
                <button className="text-button">View pipeline →</button>
              </div>

              <div className="pipeline-track">
                {pipelineStages.map((stage, index) => (
                  <div className="pipeline-stage" key={stage}>
                    <div className="stage-rail">
                      <span style={{ "--stage-index": index } as CSSProperties} />
                    </div>
                    <strong>{stage}</strong>
                    <small>No leads</small>
                  </div>
                ))}
              </div>

              <div className="panel-empty compact-empty">
                <span className="empty-orbit">↗</span>
                <div>
                  <strong>Your pipeline is ready.</strong>
                  <p>Capture or import the first lead to see movement here.</p>
                </div>
              </div>
            </article>

            <article className="panel focus-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-label">TODAY’S FOCUS</span>
                  <h2>Next actions</h2>
                </div>
                <span className="live-badge">LIVE</span>
              </div>

              <div className="focus-ring">
                <div>
                  <strong>0</strong>
                  <span>due now</span>
                </div>
              </div>

              <div className="focus-copy">
                <strong>Nothing is overdue</strong>
                <p>New follow-ups will appear here by priority.</p>
              </div>
              <button className="wide-ghost-button">Open follow-up desk</button>
            </article>

            <article className="panel leads-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-label">LATEST SIGNALS</span>
                  <h2>Recent leads</h2>
                </div>
                <div className="segmented-control">
                  <button className="selected">All</button>
                  <button>Mine</button>
                </div>
              </div>

              <div className="table-head">
                <span>Lead</span>
                <span>Source</span>
                <span>Stage</span>
                <span>Next action</span>
              </div>
              <div className="panel-empty lead-empty">
                <span className="empty-stack">◇</span>
                <strong>No leads in this workspace yet</strong>
                <p>Start with a single lead or bring your existing list.</p>
                <div>
                  <button className="secondary-button">Import list</button>
                  <button
                    className="primary-button small"
                    onClick={() => setShowCapture(true)}
                  >
                    Add first lead
                  </button>
                </div>
              </div>
            </article>

            <article className="panel source-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-label">SOURCE QUALITY</span>
                  <h2>Where leads convert</h2>
                </div>
              </div>
              <div className="source-visual">
                <div className="source-axis">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="source-placeholder">
                  <span>Connect lead sources</span>
                </div>
              </div>
              <p className="source-note">
                Conversion insights appear after your first qualified lead.
              </p>
            </article>
          </section>
        </div>
      </main>

      {showCapture && (
        <div className="modal-backdrop" role="presentation">
          <section className="capture-modal" role="dialog" aria-modal="true">
            <button
              className="modal-close"
              onClick={() => setShowCapture(false)}
              aria-label="Close"
            >
              ×
            </button>
            <span className="panel-label">QUICK CAPTURE</span>
            <h2>Add your first lead</h2>
            <p>
              Lead storage will activate after the secure Supabase schema is
              connected.
            </p>
            <div className="modal-preview-fields">
              <span>Full name</span>
              <span>Mobile number</span>
              <span>Lead source</span>
            </div>
            <button className="primary-button" onClick={() => setShowCapture(false)}>
              Continue setup
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
