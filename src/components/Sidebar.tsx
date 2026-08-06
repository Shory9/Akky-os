type SidebarProps = {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
};

const menuGroups = [
  {
    label: "WORKSPACE",
    items: [
      { mark: "01", label: "Overview" },
      { mark: "02", label: "Leads" },
      { mark: "03", label: "Pipeline" },
      { mark: "04", label: "Follow-ups" },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { mark: "05", label: "Reports" },
      { mark: "06", label: "Team" },
    ],
  },
];

function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark">
          <span>A</span>
          <i />
        </div>
        <div>
          <strong>AkkyOS</strong>
          <small>Leads CRM</small>
        </div>
      </div>

      <div className="workspace-switcher">
        <span className="workspace-avatar">AW</span>
        <span>
          <small>ACTIVE WORKSPACE</small>
          <strong>AkkyOS Workspace</strong>
        </span>
        <button aria-label="Switch workspace">⌄</button>
      </div>

      <nav className="menu">
        {menuGroups.map((group) => (
          <div className="menu-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map((item) => (
              <button
                key={item.label}
                className={activeMenu === item.label ? "active" : ""}
                onClick={() => onMenuChange(item.label)}
              >
                <span className="menu-mark">{item.mark}</span>
                <span>{item.label}</span>
                {activeMenu === item.label && <i />}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="settings-button">
          <span>⚙</span>
          Settings
        </button>
        <div className="system-card">
          <div className="system-orb"><span /></div>
          <div>
            <small>SYSTEM STATUS</small>
            <strong>Workspace ready</strong>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
