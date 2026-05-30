import { useEffect, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { getCurrentUser } from "../../services/auth/authApi";
import {
  fetchNotifications,
  markNotificationRead,
  type NotificationItem,
} from "../../services/notifications/notificationsApi";

const LOAI_MAP: Record<string, string> = {
  SYSTEM: "Hệ thống",
  APPROVAL: "Phê duyệt",
  REMINDER: "Nhắc việc",
  SLA: "SLA",
  TRANSFER: "Luân chuyển",
};

function getLoaiLabel(loai?: string) {
  if (!loai) return null;
  return LOAI_MAP[loai] ?? loai;
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
      // silently ignore single mark-read failures
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
            Thông báo{" "}
            {unreadCount > 0 && (
              <span
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "#ef4444", color: "#fff", borderRadius: "50%",
                  width: 22, height: 22, fontSize: 12, fontWeight: 700, marginLeft: 8,
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
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

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className={filter === "all" ? "button" : "button secondary"}
          onClick={() => handleFilterChange("all")}
          style={{ fontSize: 13 }}
        >
          Tất cả ({items.length})
        </button>
        <button
          type="button"
          className={filter === "unread" ? "button" : "button secondary"}
          onClick={() => handleFilterChange("unread")}
          style={{ fontSize: 13 }}
        >
          Chưa đọc ({unreadCount})
        </button>
      </div>

      <div className="card">
        {loading && (
          <p style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>Đang tải...</p>
        )}
        {error && <p style={{ padding: 16, color: "#ef4444" }}>{error}</p>}
        {!loading && !error && displayedItems.length === 0 && (
          <p style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>
            {filter === "unread" ? "Không có thông báo chưa đọc." : "Chưa có thông báo nào."}
          </p>
        )}

        {displayedItems.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {displayedItems.map((item) => (
              <li
                key={item.id}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border-color, #e5e7eb)",
                  background: item.daDoc ? "transparent" : "rgba(59,130,246,0.04)",
                  cursor: item.daDoc ? "default" : "pointer",
                }}
                onClick={() => handleMarkRead(item)}
              >
                <div
                  style={{
                    flexShrink: 0, width: 8, height: 8, borderRadius: "50%",
                    background: item.daDoc ? "transparent" : "#3b82f6",
                    marginTop: 6,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: item.daDoc ? 400 : 600, fontSize: 14 }}>
                      {item.tieuDe}
                    </span>
                    {item.loaiThongBao && (
                      <span className="badge badge--ghost" style={{ fontSize: 11 }}>
                        {getLoaiLabel(item.loaiThongBao)}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted, #6b7280)" }}>
                    {item.noiDung}
                  </p>
                  {item.ngayGui && (
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted, #9ca3af)" }}>
                      {new Date(item.ngayGui).toLocaleString("vi-VN")}
                    </p>
                  )}
                </div>
                {!item.daDoc && (
                  <button
                    type="button"
                    className="button secondary"
                    style={{ fontSize: 11, padding: "2px 8px", flexShrink: 0 }}
                    onClick={(e) => { e.stopPropagation(); handleMarkRead(item); }}
                  >
                    Đã đọc
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
