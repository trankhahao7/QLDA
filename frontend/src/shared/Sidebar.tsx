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
  { to: "/dashboard", label: "Tổng quan" },
  { to: "/inbox", label: "Văn bản đến" },
  { to: "/outgoing", label: "Văn bản đi" },
  { to: "/approvals", label: "Phê duyệt" },
  { to: "/case-files", label: "Hồ sơ công việc" },
  { to: "/delegation", label: "Ủy quyền xử lý" },
  { to: "/upload", label: "Tải lên" },
  { to: "/search", label: "Tìm kiếm" },
  { to: "/profile", label: "Tài khoản" },
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
        <h2>eOffice Intelligence System (eOIS)</h2>
        <span>Hệ thống xử lý văn bản</span>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            <span>{item.label}</span>
            <span aria-hidden>→</span>
          </NavLink>
        ))}

        <NavLink
          to="/notifications"
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Thông báo
            {unreadCount > 0 && (
              <span
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "#ef4444", color: "#fff", borderRadius: "50%",
                  width: 18, height: 18, fontSize: 10, fontWeight: 700,
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </span>
          <span aria-hidden>→</span>
        </NavLink>

        {isAdmin && (
          <>
            <div className="nav-divider" />
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-link active admin-link" : "nav-link admin-link"
              }
            >
              <span>⚙️ Admin</span>
              <span aria-hidden>→</span>
            </NavLink>
          </>
        )}
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
