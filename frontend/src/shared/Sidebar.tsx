import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getAccessToken } from "../services/core/apiClient";
import { getCurrentUser } from "../services/auth/authApi";
import { fetchNotifications } from "../services/notifications/notificationsApi";

function decodeJwtRoles(token: string): string[] {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return (decoded.roles as string[]) ?? [];
  } catch {
    return [];
  }
}

const navItems = [
  { to: "/dashboard", label: "Tổng quan", icon: "🏠" },
  { to: "/inbox", label: "Văn bản đến", icon: "📥" },
  { to: "/outgoing", label: "Văn bản đi", icon: "📤" },
  { to: "/approvals", label: "Phê duyệt", icon: "✅" },
  { to: "/case-files", label: "Hồ sơ công việc", icon: "🗂️" },
  { to: "/delegation", label: "Ủy quyền xử lý", icon: "🤝" },
  { to: "/upload", label: "Tải lên", icon: "⬆️" },
  { to: "/search", label: "Tìm kiếm", icon: "🔍" },
  { to: "/profile", label: "Tài khoản", icon: "👤" },
];

export default function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const roles = decodeJwtRoles(token);
      setIsAdmin(roles.some((r) => r === "ADMIN" || r === "ROLE_ADMIN"));
    }

    getCurrentUser()
      .then((u) => setCurrentUserId(u.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    fetchNotifications({ nguoiNhanId: currentUserId, daDoc: false, page: 0, size: 1 })
      .then((res) => setUnreadCount(res.totalElements ?? 0))
      .catch(() => {});
  }, [currentUserId]);

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">📋</div>
        <div className="sidebar__brand-text">
          <h2>eOIS</h2>
          <span>Hệ thống xử lý văn bản</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        <span className="sidebar__nav-section">Nghiệp vụ</span>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            <span className="nav-link__icon">{item.icon}</span>
            <span className="nav-link__label">{item.label}</span>
          </NavLink>
        ))}

        <NavLink
          to="/notifications"
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          <span className="nav-link__icon">🔔</span>
          <span className="nav-link__label">Thông báo</span>
          {unreadCount > 0 && (
            <span className="nav-link__badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </NavLink>

        {isAdmin && (
          <>
            <div className="nav-divider" />
            <span className="sidebar__nav-section">Quản trị</span>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-link active admin-link" : "nav-link admin-link"
              }
            >
              <span className="nav-link__icon">⚙️</span>
              <span className="nav-link__label">Quản trị hệ thống</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar__card">
        <h3>Trạng thái kết nối</h3>
        <p>Đang đồng bộ Office 365. Cập nhật lúc 09:20.</p>
        <button className="button secondary" type="button" style={{ fontSize: 12, padding: "6px 12px" }}>
          Xem lịch sử
        </button>
      </div>
    </aside>
  );
}
