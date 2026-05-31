import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../services/core/apiClient";
import { fetchIncomingDocuments, type DocumentListItem } from "../../services/documents/documentsApi";
import { transferDocument } from "../../services/workflows/workflowsTransferApi";
import { getCurrentUser } from "../../services/auth/authApi";
import { fetchUsers, type UserItem } from "../../services/auth/usersApi";
import { fetchUnits, type UnitItem } from "../../services/units/unitsApi";

const TRANG_THAI_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Nháp", className: "badge badge--ghost" },
  1: { label: "Đang xử lý", className: "badge badge--info" },
  2: { label: "Đã chuyển xử lý", className: "badge badge--warning" },
  3: { label: "Trình ký", className: "badge badge--primary" },
  4: { label: "Đã ký", className: "badge badge--success" },
  5: { label: "Đã phát hành", className: "badge badge--success" },
};

const DO_KHAN_LABEL: Record<string, { label: string; className: string }> = {
  BINH_THUONG: { label: "Bình thường", className: "badge badge--ghost" },
  KHAN: { label: "Khẩn", className: "badge badge--danger" },
  THUONG_KHAN: { label: "Thượng khẩn", className: "badge badge--danger" },
  HOA_TOC: { label: "Hỏa tốc", className: "badge badge--danger" },
};

function getTrangThaiBadge(trangThai?: number) {
  const stt = trangThai ?? -1;
  return TRANG_THAI_MAP[stt] ?? { label: "Không xác định", className: "badge badge--ghost" };
}

function getDoKhanBadge(doKhan?: string) {
  if (!doKhan) return null;
  return DO_KHAN_LABEL[doKhan] ?? { label: doKhan, className: "badge badge--ghost" };
}

interface VanBanDen {
  id: number;
  soKyHieu: string;
  trichYeu: string;
  tenLoaiVanBan?: string;
  donViBanHanh: string;
  ngayTiepNhan: string;
  doKhan?: string;
  trangThai?: number;
  hanXuLy?: string;
}

export default function Inbox() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<VanBanDen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [units, setUnits] = useState<UnitItem[]>([]);

  const [showTransfer, setShowTransfer] = useState(false);
  const [transferDoc, setTransferDoc] = useState<VanBanDen | null>(null);
  const [transferForm, setTransferForm] = useState({ nguoiNhanId: "", donViXuLyId: "", noiDungChuyen: "", hanXuLy: "" });
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferResult, setTransferResult] = useState<string | null>(null);

  useEffect(() => {
    fetchIncomingDocuments({ page: 0, size: 50 })
      .then((response) => {
        setDocuments(
          (response.content || []).map((doc: DocumentListItem) => ({
            id: doc.id,
            soKyHieu: doc.soKyHieu || "-",
            trichYeu: doc.trichYeu,
            tenLoaiVanBan: doc.tenLoaiVanBan,
            donViBanHanh: doc.donViBanHanh || "-",
            ngayTiepNhan: doc.ngayTiepNhan || "",
            doKhan: doc.doKhan,
            trangThai: doc.trangThai,
            hanXuLy: doc.hanXuLy,
          }))
        );
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không thể tải văn bản đến"))
      .finally(() => setLoading(false));
    getCurrentUser().then((u) => setCurrentUserId(u.id)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchUsers({ size: 200 }).then((r) => setUsers(r?.content || [])).catch(() => {});
    fetchUnits({ size: 100 }).then((r) => setUnits(r?.content || [])).catch(() => {});
  }, []);

  const reloadDocuments = () => {
    fetchIncomingDocuments({ page: 0, size: 50 })
      .then((response) => {
        setDocuments(
          (response.content || []).map((doc: DocumentListItem) => ({
            id: doc.id,
            soKyHieu: doc.soKyHieu || "-",
            trichYeu: doc.trichYeu,
            tenLoaiVanBan: doc.tenLoaiVanBan,
            donViBanHanh: doc.donViBanHanh || "-",
            ngayTiepNhan: doc.ngayTiepNhan || "",
            doKhan: doc.doKhan,
            trangThai: doc.trangThai,
            hanXuLy: doc.hanXuLy,
          }))
        );
      })
      .catch(() => {});
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === documents.length && documents.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(documents.map((d) => d.id)));
    }
  };

  const openTransfer = (doc: VanBanDen) => {
    setTransferDoc(doc);
    setTransferForm({ nguoiNhanId: "", donViXuLyId: "", noiDungChuyen: "", hanXuLy: doc.hanXuLy || "" });
    setTransferResult(null);
    setShowTransfer(true);
  };

  const closeTransfer = () => {
    setShowTransfer(false);
    setTransferDoc(null);
    setTransferResult(null);
  };

  const handleSelfProcess = (doc: VanBanDen) => {
    navigate(`/documents/${doc.id}`);
  };

  const handleTransfer = async () => {
    if (!transferDoc) return;
    const nguoiNhanId = parseInt(transferForm.nguoiNhanId, 10);
    if (isNaN(nguoiNhanId)) { setTransferResult("Vui lòng chọn người nhận"); return; }
    if (!currentUserId) { setTransferResult("Không xác định được người dùng hiện tại"); return; }
    setTransferSubmitting(true);
    setTransferResult(null);
    try {
      const parsedDonVi = parseInt(transferForm.donViXuLyId, 10);
      await transferDocument(transferDoc.id, {
        nguoiGuiId: currentUserId,
        nguoiNhanId,
        ...(!isNaN(parsedDonVi) ? { donViXuLyId: parsedDonVi } : {}),
        hanhDongXuLy: "TRANSFER",
        ...(transferForm.noiDungChuyen.trim() ? { yKienXuLy: transferForm.noiDungChuyen.trim() } : {}),
        ...(transferForm.hanXuLy ? { hanXuLy: `${transferForm.hanXuLy}T00:00:00` } : {}),
      });
      setTransferResult("success");
      setDocuments((prev) => prev.filter((d) => d.id !== transferDoc.id));
      setTimeout(() => { closeTransfer(); }, 1000);
    } catch (err) {
      setTransferResult(err instanceof ApiError ? err.message : "Luân chuyển thất bại");
    } finally {
      setTransferSubmitting(false);
    }
  };

  const handleBatchTransfer = () => {
    if (selectedIds.size === 0) { setError("Vui lòng chọn ít nhất một văn bản"); return; }
    const first = documents.find((d) => selectedIds.has(d.id));
    if (!first) return;
    openTransfer(first);
  };

  const exportCsv = () => {
    const headers = ["Mã", "Loại", "Nội dung", "Nơi gửi", "Ngày tiếp nhận", "Ưu tiên", "Trạng thái"];
    const rows = documents.map((d) => [
      d.soKyHieu,
      d.tenLoaiVanBan || "",
      `"${d.trichYeu.replace(/"/g, '""')}"`,
      d.donViBanHanh,
      d.ngayTiepNhan ? new Date(d.ngayTiepNhan).toLocaleDateString("vi-VN") : "",
      getDoKhanBadge(d.doKhan)?.label || "",
      getTrangThaiBadge(d.trangThai).label,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `van-ban-den_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Văn bản đến</h1>
          <p>Danh sách văn bản cần xử lý và luân chuyển.</p>
        </div>
        <div className="topbar__actions">
          <button className="button" type="button" onClick={handleBatchTransfer} disabled={selectedIds.size === 0}>
            📤 Luân chuyển ({selectedIds.size})
          </button>
          <button className="button secondary" type="button" onClick={exportCsv}>
            Xuất CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert--error" style={{ marginBottom: 16 }}>
          <div className="alert__title">Lỗi</div>
          {error}
        </div>
      )}

      <div className="card">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Đang tải văn bản đến...</p>
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <h3>Chưa có văn bản đến</h3>
            <p>Tất cả văn bản đến sẽ xuất hiện tại đây.</p>
          </div>
        )}

        {documents.length > 0 && (
          <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: "center" }}>
                  <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.size === documents.length && documents.length > 0} />
                </th>
                <th>Mã</th>
                <th>Loại</th>
                <th>Nội dung</th>
                <th>Nơi gửi</th>
                <th>Ngày</th>
                <th>Ưu tiên</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((item) => {
                const khan = getDoKhanBadge(item.doKhan);
                const stt = getTrangThaiBadge(item.trangThai);
                const isOverdue = item.hanXuLy && new Date(item.hanXuLy) < new Date();
                return (
                  <tr
                    key={item.id}
                    style={{ background: selectedIds.has(item.id) ? "rgba(15,118,110,0.04)" : undefined }}
                  >
                    <td style={{ textAlign: "center" }}>
                      <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} />
                    </td>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{item.soKyHieu}</td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>{item.tenLoaiVanBan || "-"}</td>
                    <td style={{ maxWidth: 260 }}>
                      <Link
                        to={`/documents/${item.id}`}
                        title={item.trichYeu}
                        style={{
                          color: "var(--accent-strong)",
                          fontWeight: 500,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.trichYeu}
                      </Link>
                    </td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>{item.donViBanHanh}</td>
                    <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                      {item.ngayTiepNhan ? new Date(item.ngayTiepNhan).toLocaleDateString("vi-VN") : "-"}
                      {isOverdue && <span style={{ marginLeft: 4, color: "var(--danger)", fontSize: 11 }}>⚠</span>}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {khan ? <span className={khan.className}>{khan.label}</span> : <span className="badge badge--ghost">—</span>}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span className={stt.className}>{stt.label}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="action-group">
                        <button className="btn-xs btn-xs--primary" type="button" onClick={() => handleSelfProcess(item)}>
                          Tự xử lý
                        </button>
                        <button className="btn-xs btn-xs--ghost" type="button" onClick={() => openTransfer(item)}>
                          Luân chuyển
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {showTransfer && transferDoc && (
        <div className="modal-overlay" onClick={closeTransfer}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📤 Luân chuyển văn bản</h3>
              <button className="modal-close" onClick={closeTransfer}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-doc-ref">
                <strong>{transferDoc.soKyHieu}</strong> — {transferDoc.trichYeu}
              </div>

              <div className="form-section">
                <div className="form-field">
                  <label className="form-label">Người nhận xử lý <span>*</span></label>
                  <select
                    className="form-control"
                    value={transferForm.nguoiNhanId}
                    onChange={(e) => setTransferForm({ ...transferForm, nguoiNhanId: e.target.value })}
                  >
                    <option value="">-- Chọn người nhận --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.hoTen} ({u.tenDonVi || "—"})</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Đơn vị xử lý</label>
                  <select
                    className="form-control"
                    value={transferForm.donViXuLyId}
                    onChange={(e) => setTransferForm({ ...transferForm, donViXuLyId: e.target.value })}
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.tenDonVi}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Nội dung chuyển</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Ghi chú nội dung chuyển xử lý..."
                    value={transferForm.noiDungChuyen}
                    onChange={(e) => setTransferForm({ ...transferForm, noiDungChuyen: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Hạn xử lý</label>
                  <input
                    type="date"
                    className="form-control"
                    value={transferForm.hanXuLy}
                    onChange={(e) => setTransferForm({ ...transferForm, hanXuLy: e.target.value })}
                  />
                </div>
              </div>

              {transferResult === "success" && (
                <div className="alert alert--success">Luân chuyển thành công!</div>
              )}
              {transferResult && transferResult !== "success" && (
                <div className="alert alert--error">{transferResult}</div>
              )}
            </div>
            <div className="modal-footer">
              <button className="button secondary" type="button" onClick={closeTransfer} disabled={transferSubmitting}>Hủy</button>
              <button className="button" type="button" onClick={handleTransfer} disabled={transferSubmitting}>
                {transferSubmitting ? "Đang xử lý..." : "Xác nhận luân chuyển"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
