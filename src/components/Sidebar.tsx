function Sidebar() {
  const menuItems = [
    { icon: "🏠", label: "Dashboard" },
    { icon: "🤖", label: "AI Agents" },
    { icon: "👥", label: "CRM" },
    { icon: "💰", label: "Sales" },
    { icon: "📋", label: "Projects" },
    { icon: "📞", label: "Recovery" },
    { icon: "📊", label: "Reports" },
    { icon: "⚙️", label: "Settings" },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">A</div>
        <div>
          <h2>Akky OS</h2>
          <p>Business Command Center</p>
        </div>
      </div>

      <nav className="menu">
        {menuItems.map((item, index) => (
          <a key={item.label} className={index === 0 ? "active" : ""}>
            <span>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>System Status</p>
        <strong>● Online</strong>
      </div>
    </aside>
  );
}

export default Sidebar;