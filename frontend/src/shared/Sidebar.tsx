import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Tổng quan" },
  { to: "/inbox", label: "Văn bản đến" },
  { to: "/upload", label: "Tải lên" },
  { to: "/search", label: "Tìm kiếm" },
  { to: "/projects", label: "Dự án" },
  { to: "/profile", label: "Tài khoản" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
          <h2>eOffice Intelligence System (eOIS)</h2>
          <span>Hệ thống xử lý văn bản </span>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span>{item.label}</span>
            <span aria-hidden>→</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__card">
        <h3>Trạng thái kết nối</h3>
        <p>Đang đồng bộ Office 365. Cập nhật lúc 09:20.</p>
        <button className="button secondary" type="button">
          Xem lịch sử
        </button>
      </div>
    </aside>
  );
}
