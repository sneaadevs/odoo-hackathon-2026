import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ title, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-col">
        <Topbar title={title} />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
