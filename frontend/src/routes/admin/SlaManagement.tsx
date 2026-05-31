import { useEffect, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { fetchWorkflows, type WorkflowItem } from "../../services/workflows/workflowsApi";
import {
  fetchSlaList,
  fetchSlaViolations,
  updateStepSla,
  type SlaItem,
  type SlaViolationItem,
} from "../../services/sla/slaApi";

const DON_VI_OPTIONS = ["PHUT", "GIO", "NGAY"];
const DON_VI_LABEL: Record<string, string> = {
  PHUT: "Phút",
  GIO: "Giờ",
  NGAY: "Ngày",
};

type EditState = {
  thoiGianXuLy: string;
  donViThoiGian: string;
  ghiChu: string;
};

export default function SlaManagement() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(null);
  const [slaItems, setSlaItems] = useState<SlaItem[]>([]);
  const [loadingWf, setLoadingWf] = useState(true);
  const [loadingSla, setLoadingSla] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editRow, setEditRow] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState>({ thoiGianXuLy: "", donViThoiGian: "NGAY", ghiChu: "" });
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"config" | "violations">("config");
  const [violations, setViolations] = useState<SlaViolationItem[]>([]);
  const [loadingViolations, setLoadingViolations] = useState(false);

  useEffect(() => {
    fetchWorkflows({ page: 0, size: 100, suDung: true })
      .then((res) => setWorkflows(res.content || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không thể tải quy trình"))
      .finally(() => setLoadingWf(false));
  }, []);

  const loadSla = (workflowId: number) => {
    setLoadingSla(true);
    setError(null);
    setEditRow(null);
    setSaveResult(null);
    fetchSlaList(workflowId)
      .then((items) => setSlaItems(Array.isArray(items) ? items : []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không thể tải cấu hình SLA"))
      .finally(() => setLoadingSla(false));
  };

  const handleSelectWorkflow = (id: number) => {
    setSelectedWorkflowId(id);
    loadSla(id);
  };

  const openEdit = (item: SlaItem) => {
    setEditRow(item.stepId);
    setEditState({
      thoiGianXuLy: String(item.thoiGianXuLy ?? ""),
      donViThoiGian: item.donViThoiGian ?? "NGAY",
      ghiChu: "",
    });
    setSaveResult(null);
  };

  const cancelEdit = () => {
    setEditRow(null);
    setSaveResult(null);
  };

  const loadViolations = () => {
    setLoadingViolations(true);
    fetchSlaViolations({ page: 0, size: 100 })
      .then((items) => setViolations(Array.isArray(items) ? items : []))
      .catch(() => setViolations([]))
      .finally(() => setLoadingViolations(false));
  };

  const handleSave = async (item: SlaItem) => {
    const value = parseInt(editState.thoiGianXuLy, 10);
    if (isNaN(value) || value <= 0) {
      setSaveResult("Thời gian xử lý phải là số dương");
      return;
    }
    setSaving(true);
    setSaveResult(null);
    try {
      await updateStepSla(item.workflowId, item.stepId, {
        thoiGianXuLy: value,
        donViThoiGian: editState.donViThoiGian,
        ghiChu: editState.ghiChu.trim() || undefined,
      });
      setSlaItems((prev) =>
        prev.map((s) =>
          s.stepId === item.stepId
            ? { ...s, thoiGianXuLy: value, donViThoiGian: editState.donViThoiGian }
            : s
        )
      );
      setEditRow(null);
      setSaveResult(null);
    } catch (err) {
      setSaveResult(err instanceof ApiError ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Quản lý SLA</h1>
          <p>Cấu hình thời gian xử lý và theo dõi vi phạm SLA.</p>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <div className="filter-tabs">
          <button
            type="button"
            className={`filter-tab${activeTab === "config" ? " active" : ""}`}
            onClick={() => setActiveTab("config")}
          >
            Cấu hình SLA
          </button>
          <button
            type="button"
            className={`filter-tab${activeTab === "violations" ? " active" : ""}`}
            onClick={() => { setActiveTab("violations"); if (violations.length === 0) loadViolations(); }}
          >
            Vi phạm SLA {violations.length > 0 && `(${violations.length})`}
          </button>
        </div>
      </div>

      {activeTab === "violations" && (
        <div className="card">
          {loadingViolations && (
            <p style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>Đang tải...</p>
          )}
          {!loadingViolations && violations.length === 0 && (
            <div className="empty-state" style={{ padding: "32px 0" }}>
              <div className="empty-state__icon">✅</div>
              <h3>Không có vi phạm SLA</h3>
              <p>Tất cả văn bản đang được xử lý đúng hạn.</p>
            </div>
          )}
          {!loadingViolations && violations.length > 0 && (
            <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Văn bản</th>
                  <th>Bước vi phạm</th>
                  <th style={{ textAlign: "right" }}>Số ngày trễ</th>
                  <th>Hạn xử lý</th>
                </tr>
              </thead>
              <tbody>
                {violations.map((v, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.soKyHieu || `#${v.documentId}`}</div>
                      {v.trichYeu && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{v.trichYeu}</div>}
                    </td>
                    <td>{v.tenBuoc}</td>
                    <td style={{ textAlign: "right", color: "#ef4444", fontWeight: 700 }}>
                      {v.soNgayTre != null ? `${v.soNgayTre} ngày` : "-"}
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {v.hanXuLy ? new Date(v.hanXuLy).toLocaleDateString("vi-VN") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ padding: "12px 0 4px", display: "flex", justifyContent: "flex-end" }}>
            <button className="button secondary" onClick={loadViolations} style={{ fontSize: 13 }}>🔄 Làm mới</button>
          </div>
        </div>
      )}

      {activeTab !== "violations" && (
        <>
      <div className="card" style={{ marginBottom: 16, padding: "16px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, maxWidth: 400 }}>
          <strong>Chọn quy trình</strong>
          {loadingWf ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Đang tải quy trình...</p>
          ) : (
            <select
              value={selectedWorkflowId ?? ""}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) handleSelectWorkflow(val);
              }}
            >
              <option value="">-- Chọn quy trình --</option>
              {workflows.map((wf) => (
                <option key={wf.id} value={wf.id}>{wf.tenQuyTrinh} ({wf.maQuyTrinh})</option>
              ))}
            </select>
          )}
        </label>
      </div>

      {error && <div className="admin-error">⚠️ {error}</div>}

      {selectedWorkflowId && (
        <div className="card">
          {loadingSla && (
            <p style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>Đang tải...</p>
          )}
          {!loadingSla && slaItems.length === 0 && (
            <p style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>
              Quy trình chưa có bước nào hoặc chưa cấu hình SLA.
            </p>
          )}
          {!loadingSla && slaItems.length > 0 && (
            <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Tên bước</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "right" }}>Thời gian xử lý</th>
                  <th style={{ whiteSpace: "nowrap" }}>Đơn vị</th>
                  <th style={{ textAlign: "center", width: 160 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {slaItems.map((item) => {
                  const isEditing = editRow === item.stepId;
                  return (
                    <tr key={item.stepId} style={{ verticalAlign: "middle" }}>
                      <td style={{ fontWeight: 500 }}>{item.tenBuoc}</td>
                      <td style={{ textAlign: "right" }}>
                        {isEditing ? (
                          <input
                            type="number"
                            min={1}
                            value={editState.thoiGianXuLy}
                            onChange={(e) => setEditState({ ...editState, thoiGianXuLy: e.target.value })}
                            style={{ width: 80, textAlign: "right" }}
                          />
                        ) : (
                          <span style={{ fontWeight: 600 }}>{item.thoiGianXuLy ?? "—"}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            value={editState.donViThoiGian}
                            onChange={(e) => setEditState({ ...editState, donViThoiGian: e.target.value })}
                            style={{ width: 90 }}
                          >
                            {DON_VI_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{DON_VI_LABEL[opt]}</option>
                            ))}
                          </select>
                        ) : (
                          <span>{DON_VI_LABEL[item.donViThoiGian ?? "NGAY"] ?? item.donViThoiGian ?? "Ngày"}</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                className="button button--small"
                                type="button"
                                onClick={() => handleSave(item)}
                                disabled={saving}
                                style={{ fontSize: 12, padding: "2px 10px" }}
                              >
                                {saving ? "..." : "Lưu"}
                              </button>
                              <button
                                className="button button--small secondary"
                                type="button"
                                onClick={cancelEdit}
                                disabled={saving}
                                style={{ fontSize: 12, padding: "2px 10px" }}
                              >
                                Hủy
                              </button>
                            </div>
                            {saveResult && (
                              <span style={{ fontSize: 11, color: "#ef4444" }}>{saveResult}</span>
                            )}
                          </div>
                        ) : (
                          <button
                            className="button button--small secondary"
                            type="button"
                            onClick={() => openEdit(item)}
                            style={{ fontSize: 12, padding: "2px 10px" }}
                          >
                            Chỉnh sửa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!selectedWorkflowId && !loadingWf && (
        <div className="card">
          <p style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
            Chọn một quy trình ở trên để xem và chỉnh sửa cấu hình SLA.
          </p>
        </div>
      )}
        </>
      )}
    </section>
  );
}

