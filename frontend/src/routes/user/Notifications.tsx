import { useEffect, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { getCurrentUser } from "../../services/auth/authApi";
import {
  fetchNotifications,
  markNotificationRead,
  deleteNotification,
  type NotificationItem,
} from "../../services/notifications/notificationsApi";

const LOAI_MAP: Record<string, string> = {
  SYSTEM: "Hệ thống",
  APPROVAL: "Phê duyệt",
  REMINDER: "Nhắc việc",
  SLA: "SLA",
  TRANSFER: "Luân chuyển",
};

const LOAI_ICON: Record<string, string> = {
  SYSTEM: "⚙️",
  APPROVAL: "✅",
  REMINDER: "⏰",
  SLA: "📊",
  TRANSFER: "📤",
};

function getLoaiLabel(loai?: string) {
  if (!loai) return null;
  return LOAI_MAP[loai] ?? loai;
}

function getLoaiIcon(loai?: string) {
  if (!loai) return "🔔";
  return LOAI_ICON[loai] ?? "🔔";
}

type FilterTab = "all" | "unread";

export default function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = items.filter((i) => !i.daDoc).length;

  const loadNotifications = (userId: number, tab: FilterTab) => {
    const params: Parameters<typeof fetchNotifications>[0] = {
      nguoiNhanId: userId,
      page: 0,
      size: 100,
      ...(tab === "unread" ? { daDoc: false } : {}),
    };
    return fetchNotifications(params);
  };

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        setCurrentUserId(u.id);
        return loadNotifications(u.id, filter);
      })
      .then((res) => setItems(res.content || []))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Không thể tải thông báo")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = (tab: FilterTab) => {
    if (!currentUserId || tab === filter) return;
    setFilter(tab);
    setLoading(true);
    setError(null);
    loadNotifications(currentUserId, tab)
      .then((res) => setItems(res.content || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không thể tải thông báo"))
      .finally(() => setLoading(false));
  };

  const handleMarkRead = async (item: NotificationItem) => {
    if (item.daDoc || !currentUserId) return;
    try {
      await markNotificationRead(item.id, currentUserId);
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, daDoc: true } : n))
      );
    } catch {
      // silently ignore
    }
  };

  const handleDelete = async (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    try {
      await deleteNotification(itemId);
      setItems((prev) => prev.filter((n) => n.id !== itemId));
    } catch {
      // silently ignore
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUserId || unreadCount === 0) return;
    setMarkingAll(true);
    const unread = items.filter((i) => !i.daDoc);
    await Promise.allSettled(
      unread.map((i) => markNotificationRead(i.id, currentUserId))
    );
    setItems((prev) => prev.map((n) => ({ ...n, daDoc: true })));
    setMarkingAll(false);
  };

  const displayedItems =
    filter === "unread" ? items.filter((i) => !i.daDoc) : items;

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>
            Thông báo
            {unreadCount > 0 && <span className="count-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </h1>
          <p>Các thông báo từ hệ thống và quy trình xử lý.</p>
        </div>
        <div className="topbar__actions">
          <button
            className="button secondary"
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
          >
            {markingAll ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-tabs">
          <button
            type="button"
            className={`filter-tab${filter === "all" ? " active" : ""}`}
            onClick={() => handleFilterChange("all")}
          >
            Tất cả ({items.length})
          </button>
          <button
            type="button"
            className={`filter-tab${filter === "unread" ? " active" : ""}`}
            onClick={() => handleFilterChange("unread")}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Đang tải thông báo...</p>
          </div>
        )}

        {!loading && !error && displayedItems.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">🔔</div>
            <h3>{filter === "unread" ? "Không có thông báo chưa đọc" : "Chưa có thông báo nào"}</h3>
            <p>Thông báo từ hệ thống và quy trình sẽ xuất hiện tại đây.</p>
          </div>
        )}

        {displayedItems.length > 0 && (
          <ul className="notif-list">
            {displayedItems.map((item) => (
              <li
                key={item.id}
                className={`notif-item${!item.daDoc ? " notif-item--unread" : ""}`}
                onClick={() => handleMarkRead(item)}
              >
                <div style={{ font: "22px/1 serif", width: 32, textAlign: "center", flexShrink: 0, paddingTop: 2 }}>
                  {getLoaiIcon(item.loaiThongBao)}
                </div>
                <div className="notif-content">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span className="notif-title">{item.tieuDe}</span>
                    {item.loaiThongBao && (
                      <span className="badge badge--ghost" style={{ fontSize: 10.5 }}>
                        {getLoaiLabel(item.loaiThongBao)}
                      </span>
                    )}
                  </div>
                  <p className="notif-body">{item.noiDung}</p>
                  {item.ngayGui && (
                    <p className="notif-meta">
                      {new Date(item.ngayGui).toLocaleString("vi-VN")}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {!item.daDoc && (
                    <button
                      type="button"
                      className="btn-xs btn-xs--ghost"
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(item); }}
                    >
                      Đã đọc
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-xs"
                    style={{ color: "#ef4444" }}
                    onClick={(e) => handleDelete(e, item.id)}
                    title="Xóa thông báo"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
