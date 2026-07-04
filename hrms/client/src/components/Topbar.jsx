import { useAuth } from "../context/AuthContext";

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Topbar({ title }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div className="user-chip">
        <div className="avatar" style={{ background: user?.avatarColor || "#1F7A5C" }}>
          {initials(user?.name)}
        </div>
        <div className="who">
          <div className="name">{user?.name}</div>
          <div className="role">{user?.role === "admin" ? "HR / Admin" : "Employee"}</div>
        </div>
      </div>
    </header>
  );
}
