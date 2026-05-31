import { useState } from "react";
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
  { to: "/admin/audit-logs", label: "Nhật ký hệ thống", icon: "📝" },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`admin-sidebar${collapsed ? " admin-sidebar--collapsed" : ""}`}>
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__brand-icon">⚙️</div>
        {!collapsed && (
          <div className="admin-sidebar__brand-text">
            <h2>Admin Panel</h2>
            <span>Quản trị hệ thống</span>
          </div>
        )}
        <button
          className="admin-sidebar__toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      <nav className="admin-sidebar__nav">
        {!collapsed && <span className="admin-nav-section">Quản lý</span>}
        {adminNavItems.slice(0, 6).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {!collapsed && <span className="admin-nav-section">Vận hành</span>}
        {adminNavItems.slice(6).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

      </nav>

      {!collapsed && (
        <div className="admin-sidebar__footer">
          <p>eOIS Admin v1.0</p>
        </div>
      )}
    </aside>
  );
}
