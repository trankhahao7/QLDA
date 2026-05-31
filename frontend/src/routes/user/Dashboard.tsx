import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../services/core/apiClient";
import { fetchIncomingDocuments } from "../../services/documents/documentsApi";
import { fetchDashboardStats } from "../../services/reports/reportsApi";
import { fetchPendingApprovals, type PendingApprovalItem } from "../../services/workflows/approvalsApi";
import { fetchOverdueDocuments } from "../../services/reports/reportsWorkflowApi";
import type { DashboardStats } from "../../services/reports/reportsApi";

const TRANG_THAI_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Nháp", className: "badge badge--ghost" },
  1: { label: "Đang xử lý", className: "badge badge--info" },
  2: { label: "Đã chuyển xử lý", className: "badge badge--warning" },
  3: { label: "Trình ký", className: "badge badge--primary" },
  4: { label: "Đã ký", className: "badge badge--success" },
  5: { label: "Đã phát hành", className: "badge badge--success" },
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDocs, setRecentDocs] = useState<Array<{
    id: number; soKyHieu: string; trichYeu: string; tenLoaiVanBan?: string;
    donViBanHanh: string; ngayTiepNhan: string; trangThai: number;
  }>>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovalItem[]>([]);
  const [overdueDocs, setOverdueDocs] = useState<Array<{
    documentId: number; soKyHieu: string; trichYeu: string; soNgayTre: number;
  }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboard, incoming, approvals, overdue] = await Promise.all([
          fetchDashboardStats(),
          fetchIncomingDocuments({ page: 0, size: 5 }),
          fetchPendingApprovals({ page: 0, size: 5 }),
          fetchOverdueDocuments({ page: 0, size: 5 }),
        ]);

        setStats(dashboard);
        setRecentDocs(
          (incoming.content || []).map((doc) => ({
            id: doc.id,
            soKyHieu: doc.soKyHieu || "-",
            trichYeu: doc.trichYeu,
            tenLoaiVanBan: doc.tenLoaiVanBan,
            donViBanHanh: doc.donViBanHanh || "-",
            ngayTiepNhan: doc.ngayTiepNhan || "",
            trangThai: doc.trangThai ?? -1,
          }))
        );
        setPendingApprovals(approvals.content || []);
        setOverdueDocs(overdue.content || []);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải dashboard";
        setError(message);
      }
    };

    loadDashboard();
  }, []);

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Tổng quan</h1>
          <p>Tình hình xử lý văn bản của bạn.</p>
        </div>
        <div className="topbar__actions">
          <Link to="/inbox" className="button">
            Văn bản đến
          </Link>
          <Link to="/search" className="button secondary">
            Tìm kiếm
          </Link>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 16, color: "#ef4444" }}>
          {error}
        </div>
      )}

      <div className="grid-4">
        <div className="stat-card-user stat-card-user--info">
          <div className="stat-card-user__label">📥 Văn bản đến</div>
          <div className="stat-card-user__value">{stats?.incomingDocuments ?? 0}</div>
          <span className="badge badge--info">Cần xử lý</span>
        </div>
        <div className="stat-card-user stat-card-user--warning">
          <div className="stat-card-user__label">🔄 Đang xử lý</div>
          <div className="stat-card-user__value">{stats?.processingDocuments ?? 0}</div>
          <span className="badge badge--warning">Đang tiến hành</span>
        </div>
        <div className="stat-card-user stat-card-user--primary">
          <div className="stat-card-user__label">✅ Cần phê duyệt</div>
          <div className="stat-card-user__value">{pendingApprovals.length}</div>
          <span className="badge badge--primary">Chờ duyệt</span>
        </div>
        <div className="stat-card-user stat-card-user--success">
          <div className="stat-card-user__label">🏁 Đã hoàn tất</div>
          <div className="stat-card-user__value">{stats?.completedDocuments ?? 0}</div>
          <span className="badge badge--success">Hoàn thành</span>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h3>Văn bản đến gần đây</h3>
          {recentDocs.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Chưa có văn bản đến.</p>
          ) : (
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Mã</th>
                  <th style={{ whiteSpace: "nowrap" }}>Loại</th>
                  <th>Nội dung</th>
                  <th style={{ whiteSpace: "nowrap" }}>Ngày</th>
                  <th style={{ whiteSpace: "nowrap" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc) => {
                  const stt = TRANG_THAI_MAP[doc.trangThai] ?? { label: "Không xác định", className: "badge badge--ghost" };
                  return (
                    <tr key={doc.id}>
                      <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{doc.soKyHieu}</td>
                      <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>{doc.tenLoaiVanBan || "-"}</td>
                      <td>
                        <Link to={`/documents/${doc.id}`}>{doc.trichYeu}</Link>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{doc.donViBanHanh}</div>
                      </td>
                      <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                        {doc.ngayTiepNhan ? new Date(doc.ngayTiepNhan).toLocaleDateString("vi-VN") : "-"}
                      </td>
                      <td><span className={stt.className}>{stt.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Phê duyệt chờ xử lý</h3>
          {pendingApprovals.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Không có phê duyệt nào đang chờ.</p>
          ) : (
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Mã</th>
                  <th>Nội dung</th>
                  <th style={{ whiteSpace: "nowrap" }}>Người gửi</th>
                  <th style={{ whiteSpace: "nowrap" }}>Hạn xử lý</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((item) => (
                  <tr key={item.processingId}>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{item.soKyHieu || "-"}</td>
                    <td>
                      <Link to={`/documents/${item.documentId}`}>{item.trichYeu}</Link>
                    </td>
                    <td style={{ fontSize: 13 }}>{item.nguoiGuiTen || `#${item.nguoiGuiId}`}</td>
                    <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                      {item.hanXuLy ? new Date(item.hanXuLy).toLocaleDateString("vi-VN") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid var(--border)" }} />

          <h3>Văn bản quá hạn</h3>
          {overdueDocs.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Không có văn bản quá hạn.</p>
          ) : (
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Mã</th>
                  <th>Nội dung</th>
                  <th style={{ whiteSpace: "nowrap" }}>Số ngày trễ</th>
                </tr>
              </thead>
              <tbody>
                {overdueDocs.map((item) => (
                  <tr key={item.documentId}>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{item.soKyHieu}</td>
                    <td>
                      <Link to={`/documents/${item.documentId}`}>{item.trichYeu}</Link>
                    </td>
                    <td style={{ whiteSpace: "nowrap", fontSize: 13, color: "#ef4444" }}>
                      {item.soNgayTre} ngày
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
