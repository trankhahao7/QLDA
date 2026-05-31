import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { fetchAuditLogs, fetchAuditLogDetail, exportAuditLogs, type AuditLogItem } from "../../services/auth/auditLogsApi";

interface AuditLog {
  id: number;
  time: string;
  user: string;
  action: string;
  object: string;
  details: string;
  status: "success" | "failed" | "pending";
  ipAddress: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detailLog, setDetailLog] = useState<AuditLogItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const mapStatus = (trangThai?: number): AuditLog["status"] => {
    if (trangThai === 1) return "success";
    if (trangThai === 0) return "failed";
    return "pending";
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAuditLogs({
        page: 0, size: 100,
        keyword: filterUser || undefined,
        fromDate: dateFrom || undefined,
        toDate: dateTo || undefined,
      });
      const mapped: AuditLog[] = (response.content || []).map((log: AuditLogItem) => ({
        id: log.id,
        time: new Date(log.thoiGianThucHien).toLocaleString("vi-VN"),
        user: log.hoTen || `User #${log.nguoiDungId}`,
        action: log.hanhDong,
        object: log.doiTuong || "Hệ thống",
        details: log.noiDungChiTiet || "",
        status: mapStatus(log.trangThai),
        ipAddress: log.diaChiIP || "-",
      }));
      setLogs(mapped);
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "Không thể tải nhật ký");
    }
    setLoading(false);
  };

  const handleViewDetail = async (logId: number) => {
    setDetailLoading(true);
    try {
      const detail = await fetchAuditLogDetail(logId);
      setDetailLog(detail);
    } catch {
      // silently ignore, keep detail null
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportAuditLogs({
        keyword: filterUser || undefined,
        fromDate: dateFrom || undefined,
        toDate: dateTo || undefined,
        format: "csv",
      });
      if (res.fileUrl) {
        const a = document.createElement("a");
        a.href = res.fileUrl;
        a.download = res.fileName || "audit_logs.csv";
        a.click();
      }
    } catch {
      // Fallback to client-side CSV if backend export fails
      const csv = "time,user,action,object,status,ipAddress\n" +
        filteredLogs.map(log =>
          `"${log.time}","${log.user}","${log.action}","${log.object}","${log.status}","${log.ipAddress}"`
        ).join("\n");
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
      element.setAttribute("download", "audit_logs.csv");
      element.click();
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: AuditLog["status"]) => {
    switch (status) {
      case "success": return "badge-success";
      case "failed": return "badge-danger";
      case "pending": return "badge-warning";
      default: return "badge-info";
    }
  };

  const getStatusText = (status: AuditLog["status"]) => {
    switch (status) {
      case "success": return "Thành công";
      case "failed": return "Thất bại";
      case "pending": return "Chờ xử lý";
      default: return "Không xác định";
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => (
      (filterUser === "" || log.user.includes(filterUser)) &&
      (filterAction === "" || log.action === filterAction) &&
      (filterStatus === "" || log.status === filterStatus)
    ));
  }, [logs, filterUser, filterAction, filterStatus]);

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải nhật ký hệ thống...</span></div>;
  }

  if (error) {
    return <div className="admin-loading">{error}</div>;
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Nhật ký hệ thống</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="button secondary" onClick={fetchLogs}>🔄 Làm mới</button>
          <button className="button secondary" onClick={handleExport} disabled={exporting}>
            {exporting ? "Đang xuất..." : "📥 Xuất CSV"}
          </button>
        </div>
      </div>

      <div className="audit-filters">
        <input
          type="text" placeholder="Tìm kiếm theo người dùng..."
          value={filterUser} onChange={(e) => setFilterUser(e.target.value)}
          className="filter-input"
        />
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="filter-select">
          <option value="">Tất cả hành động</option>
          <option value="Tạo">Tạo</option>
          <option value="Sửa">Sửa</option>
          <option value="Xóa">Xóa</option>
          <option value="Xem">Xem</option>
          <option value="Phê duyệt">Phê duyệt</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option value="success">Thành công</option>
          <option value="failed">Thất bại</option>
          <option value="pending">Chờ xử lý</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="filter-input" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="filter-input" />
        <button className="button" onClick={fetchLogs} style={{ fontSize: 13 }}>Lọc</button>
      </div>

      <table className="audit-table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Người dùng</th>
            <th>Hành động</th>
            <th>Đối tượng</th>
            <th>Chi tiết</th>
            <th>Trạng thái</th>
            <th>Địa chỉ IP</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td className="time-cell">{log.time}</td>
              <td>{log.user}</td>
              <td className="action-cell">{log.action}</td>
              <td><span className="object-badge">{log.object}</span></td>
              <td className="details-cell">{log.details}</td>
              <td>
                <span className={`badge ${getStatusBadge(log.status)}`}>{getStatusText(log.status)}</span>
              </td>
              <td className="ip-cell">{log.ipAddress}</td>
              <td>
                <button
                  className="button small"
                  onClick={() => handleViewDetail(log.id)}
                  style={{ fontSize: 12, padding: "2px 8px" }}
                >
                  Chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <p>Tổng: {filteredLogs.length} bản ghi</p>
      </div>

      {/* Detail Modal */}
      {(detailLog || detailLoading) && (
        <div className="modal-overlay" onClick={() => setDetailLog(null)}>
          <div className="modal-card" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết nhật ký #{detailLog?.id}</h3>
              <button className="modal-close" onClick={() => setDetailLog(null)}>✕</button>
            </div>
            <div className="modal-body">
              {detailLoading && <p style={{ color: "var(--text-muted)" }}>Đang tải...</p>}
              {detailLog && (
                <table className="doc-meta-table">
                  <tbody>
                    <tr><td>Thời gian</td><td>{new Date(detailLog.thoiGianThucHien).toLocaleString("vi-VN")}</td></tr>
                    <tr><td>Người dùng</td><td>{detailLog.hoTen || `#${detailLog.nguoiDungId}`}</td></tr>
                    <tr><td>Hành động</td><td>{detailLog.hanhDong}</td></tr>
                    <tr><td>Đối tượng</td><td>{detailLog.doiTuong || "-"}{detailLog.doiTuongId ? ` #${detailLog.doiTuongId}` : ""}</td></tr>
                    <tr><td>Địa chỉ IP</td><td>{detailLog.diaChiIP || "-"}</td></tr>
                    <tr><td>Trạng thái</td><td>{detailLog.trangThai === 1 ? "✅ Thành công" : detailLog.trangThai === 0 ? "❌ Thất bại" : "⏳ Chờ xử lý"}</td></tr>
                    {detailLog.noiDungChiTiet && (
                      <tr>
                        <td>Nội dung chi tiết</td>
                        <td style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{detailLog.noiDungChiTiet}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="button secondary" onClick={() => setDetailLog(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
