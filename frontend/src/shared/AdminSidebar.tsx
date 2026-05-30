import { NavLink } from "react-router-dom";

const adminNavItems = [
  { to: "/admin/dashboard", label: "Tổng quan", icon: "📊" },
  { to: "/admin/users", label: "Quản lý người dùng", icon: "👥" },
  { to: "/admin/permissions", label: "Phân quyền", icon: "🔐" },
  { to: "/admin/units", label: "Quản lý đơn vị", icon: "🏢" },
  { to: "/admin/document-types", label: "Loại văn bản", icon: "📄" },
  { to: "/admin/workflows", label: "Quy trình xử lý", icon: "⚙️" },
  { to: "/admin/sla", label: "Quản lý SLA", icon: "⏱️" },
  { to: "/admin/templates", label: "Template văn bản", icon: "📋" },
  { to: "/admin/reports", label: "Báo cáo & Thống kê", icon: "📈" },
  { to: "/admin/monitoring", label: "Giám sát hệ thống", icon: "🖥️" },
  { to: "/admin/audit-logs", label: "Nhật ký hệ thống", icon: "📝" },
  { to: "/dashboard", label: "Quay lại người dùng", icon: "←" },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <h2>⚙️ Admin Panel</h2>
        <span>Quản trị hệ thống</span>
      </div>

      <nav className="admin-sidebar__nav">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
            <span className="arrow" aria-hidden>→</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <p>Admin System v1.0</p>
      </div>
    </aside>
  );
}
