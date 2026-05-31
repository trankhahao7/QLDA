import { useEffect, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { fetchPendingApprovals } from "../../services/workflows/approvalsApi";
import { fetchDocumentTypes } from "../../services/documents/documentTypesApi";
import { fetchDashboardStats } from "../../services/reports/reportsApi";
import type { DashboardStats } from "../../services/reports/reportsApi";
import { fetchDocumentStatistics } from "../../services/reports/reportsDocumentsApi";
import type { DocumentStatisticsItem } from "../../services/reports/reportsDocumentsApi";
import { fetchUnits } from "../../services/units/unitsApi";
import { fetchUsers } from "../../services/auth/usersApi";
import { fetchAuditLogs } from "../../services/auth/auditLogsApi";
import type { AuditLogItem } from "../../services/auth/auditLogsApi";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalDocuments: number;
  processingDocuments: number;
  completedToday: number;
  pendingApprovals: number;
  units: number;
  documentTypes: number;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn thành",
  REJECTED: "Từ chối",
};

const ACTION_LABELS: Record<string, string> = {
  AZURE_LOGIN: "Đăng nhập Azure",
  LOGOUT: "Đăng xuất",
  CREATE_USER: "Tạo người dùng",
  UPDATE_USER: "Cập nhật người dùng",
  UPDATE_USER_STATUS: "Đổi trạng thái",
  ASSIGN_ROLE: "Phân quyền",
  DELETE_USER: "Xóa người dùng",
  SYNC_AZURE_USERS: "Đồng bộ Azure",
};

function toLocalDate(dt: string): Date {
  // Server returns UTC without Z suffix — append Z so browser converts to local time
  return new Date(dt.endsWith("Z") || dt.includes("+") ? dt : dt + "Z");
}

function formatTime(dt: string): string {
  const d = toLocalDate(dt);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const time = `${hh}:${mm}`;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(d, today)) return `${time} - Hôm nay`;
  if (sameDay(d, yesterday)) return `${time} - Hôm qua`;
  return `${time} - ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function statusBadge(trangThai: number | undefined): string {
  if (trangThai == null) return "badge badge-success";
  return trangThai === 1 ? "badge badge-success" : "badge badge-warning";
}

function statusText(trangThai: number | undefined): string {
  if (trangThai == null) return "Thành công";
  return trangThai === 1 ? "Thành công" : "Cảnh báo";
}

function actionLabel(hanhDong: string): string {
  return ACTION_LABELS[hanhDong] || hanhDong;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDocuments: 0,
    processingDocuments: 0,
    completedToday: 0,
    pendingApprovals: 0,
    units: 0,
    documentTypes: 0,
  });

  const [recentActivities, setRecentActivities] = useState<AuditLogItem[]>([]);
  const [statusStats, setStatusStats] = useState<Record<string, number>>({
    PENDING: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    REJECTED: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const [dashboard, usersAll, usersActive, units, documentTypes, approvals, auditLogs, docStats] = await Promise.all([
          fetchDashboardStats(),
          fetchUsers({ page: 0, size: 1 }),
          fetchUsers({ page: 0, size: 1, trangThai: 1 }),
          fetchUnits({ page: 0, size: 1 }),
          fetchDocumentTypes({}),
          fetchPendingApprovals({ page: 0, size: 1 }),
          fetchAuditLogs({ page: 0, size: 5 }),
          fetchDocumentStatistics({ groupBy: "status" }).catch(() => null),
        ]);

        const statusCounts: Record<string, number> = { PENDING: 0, PROCESSING: 0, COMPLETED: 0, REJECTED: 0 };
        if (docStats?.items) {
          docStats.items.forEach((item: DocumentStatisticsItem) => {
            if (statusCounts[item.label] !== undefined) {
              statusCounts[item.label] = item.value;
            }
          });
        }

        setStats({
          totalUsers: usersAll.totalElements || 0,
          activeUsers: usersActive.totalElements || 0,
          totalDocuments: dashboard.totalDocuments || 0,
          processingDocuments: dashboard.processingDocuments || 0,
          completedToday: dashboard.completedDocuments || 0,
          pendingApprovals: approvals.totalElements || 0,
          units: units.totalElements || 0,
          documentTypes: documentTypes.length,
        });
        setRecentActivities(auditLogs.content.slice(0, 5));
        setStatusStats(statusCounts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        const message = error instanceof ApiError ? error.message : "Không thể tải thống kê";
        setError(message);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>Đang tải dữ liệu thống kê...</span>
      </div>
    );
  }

  if (error) {
    return <div className="admin-error">⚠️ {error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Tổng người dùng</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <span className="stat-sublabel">Hoạt động: {stats.activeUsers}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>Tổng văn bản</h3>
            <p className="stat-value">{stats.totalDocuments}</p>
            <span className="stat-sublabel">Đang xử lý: {stats.processingDocuments}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>Hoàn thành hôm nay</h3>
            <p className="stat-value">{stats.completedToday}</p>
            <span className="stat-sublabel">Chờ phê duyệt: {stats.pendingApprovals}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>Đơn vị</h3>
            <p className="stat-value">{stats.units}</p>
            <span className="stat-sublabel">Loại: {stats.documentTypes}</span>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <div className="section-header"><h2>📋 Hoạt động gần đây</h2></div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người dùng</th>
              <th>Hành động</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recentActivities.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "#888" }}>Chưa có hoạt động nào</td>
              </tr>
            ) : (
              recentActivities.map((a) => (
                <tr key={a.id}>
                  <td>{formatTime(a.thoiGianThucHien)}</td>
                  <td>{a.hoTen || `#${a.nguoiDungId}`}</td>
                  <td>{actionLabel(a.hanhDong)}</td>
                  <td><span className={statusBadge(a.trangThai)}>{statusText(a.trangThai)}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-section">
        <div className="section-header"><h2>📊 Thống kê theo trạng thái</h2></div>
        <div className="status-stats">
          {Object.entries(statusStats).map(([key, value]) => (
            <div key={key} className="status-item">
              <span className="status-label">{STATUS_LABELS[key]}:</span>
              <span className="status-count">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
