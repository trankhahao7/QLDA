import { useEffect, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { fetchDashboardStats, type DashboardStats } from "../../services/reports/reportsApi";
import {
  fetchDocumentStatistics,
  type DocumentStatisticsItem,
} from "../../services/reports/reportsDocumentsApi";
import {
  fetchWorkflowProgress,
  fetchOverdueDocuments,
} from "../../services/reports/reportsWorkflowApi";
import { exportReport } from "../../services/reports/reportsExportApi";

type WorkflowProgress = {
  totalTasks: number;
  completedTasks: number;
  processingTasks: number;
  overdueTasks: number;
};

type OverdueItem = {
  documentId: number;
  soKyHieu: string;
  trichYeu: string;
  soNgayTre: number;
};

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div
      style={{
        background: "#fff", borderRadius: 12, padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)", flex: "1 1 180px", minWidth: 160,
        borderTop: `3px solid ${color ?? "#3b82f6"}`,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? "#3b82f6" }}>{value}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted, #6b7280)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ items, maxValue }: { items: DocumentStatisticsItem[]; maxValue: number }) {
  if (items.length === 0) return <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Không có dữ liệu.</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 90, fontSize: 12, textAlign: "right", color: "var(--text-muted, #6b7280)", flexShrink: 0 }}>
            {item.label}
          </div>
          <div
            style={{
              flex: 1, height: 22, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", position: "relative",
            }}
          >
            <div
              style={{
                height: "100%", borderRadius: 4,
                width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : "0%",
                background: "#3b82f6",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div style={{ width: 32, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [docStats, setDocStats] = useState<DocumentStatisticsItem[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowProgress | null>(null);
  const [overdue, setOverdue] = useState<OverdueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadAll = (from?: string, to?: string) => {
    setLoading(true);
    setError(null);
    const params = { fromDate: from || undefined, toDate: to || undefined };

    Promise.allSettled([
      fetchDashboardStats(params),
      fetchDocumentStatistics({ ...params, groupBy: "month" }),
      fetchWorkflowProgress(params),
      fetchOverdueDocuments({ page: 0, size: 20 }),
    ]).then(([statsRes, docRes, wfRes, overdueRes]) => {
      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (docRes.status === "fulfilled") setDocStats(docRes.value?.items ?? []);
      if (wfRes.status === "fulfilled") setWorkflow(wfRes.value);
      if (overdueRes.status === "fulfilled") setOverdue(overdueRes.value?.content ?? []);
      if (statsRes.status === "rejected" && docRes.status === "rejected" && wfRes.status === "rejected") {
        setError("Không thể tải dữ liệu báo cáo");
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const handleFilter = () => loadAll(fromDate || undefined, toDate || undefined);
  const handleReset = () => { setFromDate(""); setToDate(""); loadAll(); };

  const exportCsv = () => {
    if (!stats) return;
    const rows = [
      ["Chỉ số", "Giá trị"],
      ["Tổng văn bản", stats.totalDocuments],
      ["Văn bản đến", stats.incomingDocuments],
      ["Văn bản đi", stats.outgoingDocuments],
      ["Đã xử lý", stats.completedDocuments],
      ["Đang xử lý", stats.processingDocuments],
      ["Quá hạn", stats.overdueDocuments],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bao-cao_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportBackend = async (format: "xlsx" | "pdf") => {
    setExporting(true);
    try {
      const res = await exportReport({
        reportType: "DOCUMENT_STATISTICS",
        format,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      if (res.fileUrl) {
        const a = document.createElement("a");
        a.href = res.fileUrl;
        a.download = res.fileName || `bao-cao.${format}`;
        a.click();
      }
    } catch {
      // Fallback: use local CSV
      exportCsv();
    } finally {
      setExporting(false);
    }
  };

  const completionRate = workflow && workflow.totalTasks > 0
    ? Math.round((workflow.completedTasks / workflow.totalTasks) * 100)
    : (stats?.completionRate !== undefined ? Math.round(stats.completionRate) : null);

  const maxDocValue = docStats.length > 0 ? Math.max(...docStats.map((i) => i.value), 1) : 1;

  return (
    <section>
      <div className="topbar">
        <div />
        <div className="topbar__actions">
          <button className="button secondary" type="button" onClick={exportCsv} disabled={!stats}>
            Xuất CSV
          </button>
          <button className="button secondary" type="button" onClick={() => handleExportBackend("xlsx")} disabled={exporting || !stats}>
            {exporting ? "Đang xuất..." : "Xuất Excel"}
          </button>
          <button className="button secondary" type="button" onClick={() => handleExportBackend("pdf")} disabled={exporting || !stats}>
            {exporting ? "Đang xuất..." : "Xuất PDF"}
          </button>
          <button className="button secondary" type="button" onClick={() => loadAll(fromDate || undefined, toDate || undefined)}>
            Làm mới
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            Từ ngày
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            Đến ngày
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button" type="button" onClick={handleFilter} style={{ fontSize: 13 }}>Lọc</button>
            <button className="button secondary" type="button" onClick={handleReset} style={{ fontSize: 13 }}>Xóa lọc</button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="card">
          <p style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>Đang tải...</p>
        </div>
      )}
      {error && <div className="admin-error">⚠️ {error}</div>}

      {!loading && stats && (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            <StatCard label="Tổng văn bản" value={stats.totalDocuments} color="#3b82f6" />
            <StatCard label="Văn bản đến" value={stats.incomingDocuments} color="#8b5cf6" />
            <StatCard label="Văn bản đi" value={stats.outgoingDocuments} color="#06b6d4" />
            <StatCard label="Đã xử lý" value={stats.completedDocuments} color="#22c55e" />
            <StatCard label="Đang xử lý" value={stats.processingDocuments} color="#f59e0b" />
            <StatCard
              label="Quá hạn"
              value={stats.overdueDocuments}
              color={stats.overdueDocuments > 0 ? "#ef4444" : "#22c55e"}
            />
            {completionRate !== null && (
              <StatCard
                label="Tỉ lệ hoàn thành"
                value={`${completionRate}%`}
                color={completionRate >= 80 ? "#22c55e" : completionRate >= 50 ? "#f59e0b" : "#ef4444"}
              />
            )}
          </div>

          {workflow && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 16 }}>Tiến độ xử lý quy trình</h3>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  { label: "Tổng nhiệm vụ", value: workflow.totalTasks, color: "#3b82f6" },
                  { label: "Hoàn thành", value: workflow.completedTasks, color: "#22c55e" },
                  { label: "Đang xử lý", value: workflow.processingTasks, color: "#f59e0b" },
                  { label: "Quá hạn", value: workflow.overdueTasks, color: "#ef4444" },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted, #6b7280)" }}>{item.label}</div>
                  </div>
                ))}
              </div>
              {workflow.totalTasks > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span>Tỉ lệ hoàn thành</span>
                    <span style={{ fontWeight: 600 }}>{Math.round((workflow.completedTasks / workflow.totalTasks) * 100)}%</span>
                  </div>
                  <div style={{ height: 10, background: "#e5e7eb", borderRadius: 5, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(workflow.completedTasks / workflow.totalTasks) * 100}%`,
                        background: "#22c55e",
                        borderRadius: 5,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {docStats.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 16 }}>Số văn bản theo tháng</h3>
              <BarChart items={docStats} maxValue={maxDocValue} />
            </div>
          )}

          {overdue.length > 0 && (
            <div className="card">
              <h3 style={{ marginTop: 0, marginBottom: 16 }}>
                Văn bản quá hạn chưa xử lý
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    background: "#ef4444", color: "#fff", borderRadius: "50%",
                    width: 22, height: 22, fontSize: 12, fontWeight: 700, marginLeft: 8,
                  }}
                >
                  {overdue.length}
                </span>
              </h3>
              <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Mã văn bản</th>
                    <th>Nội dung</th>
                    <th style={{ whiteSpace: "nowrap", textAlign: "right" }}>Số ngày trễ</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map((item) => (
                    <tr key={item.documentId}>
                      <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{item.soKyHieu || `#${item.documentId}`}</td>
                      <td>{item.trichYeu}</td>
                      <td style={{ textAlign: "right", color: "#ef4444", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {item.soNgayTre} ngày
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
