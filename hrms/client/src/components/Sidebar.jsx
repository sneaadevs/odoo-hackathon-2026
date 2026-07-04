import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HomeIcon, UserIcon, ClockIcon, CalendarIcon, WalletIcon, LogoutIcon } from "./icons";

export default function Sidebar() {
  const { logout } = useAuth();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { to: "/profile", label: "Profile", icon: <UserIcon /> },
    { to: "/attendance", label: "Attendance", icon: <ClockIcon /> },
    { to: "/leave", label: "Leave", icon: <CalendarIcon /> },
    { to: "/payroll", label: "Payroll", icon: <WalletIcon /> },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        HR<span>MS</span>
      </div>
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button className="logout-btn" onClick={logout}>
        <LogoutIcon />
        Log out
      </button>
    </aside>
  );
}
