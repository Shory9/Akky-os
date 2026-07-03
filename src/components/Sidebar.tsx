function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <h2>Akky OS</h2>
        <p>Business Command Center</p>
      </div>

      <nav className="menu">
        <a className="active">Dashboard</a>
        <a>Leads</a>
        <a>Clients</a>
        <a>Tasks</a>
        <a>Agents</a>
        <a>Reports</a>
        <a>Settings</a>
      </nav>
    </aside>
  );
}

export default Sidebar;