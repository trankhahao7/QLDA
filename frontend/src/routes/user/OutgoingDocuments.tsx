import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../services/core/apiClient";
import { fetchOutgoingDocuments } from "../../services/documents/documentsOutgoingApi";
import { createOutgoingDocument } from "../../services/documents/documentsOutgoingCreateApi";
import { fetchDocumentTypes, type DocumentTypeItem } from "../../services/documents/documentTypesApi";
import type { DocumentListItem } from "../../services/documents/documentsApi";

const TRANG_THAI_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Nháp", className: "badge badge--ghost" },
  1: { label: "Chờ duyệt", className: "badge badge--warning" },
  2: { label: "Đang duyệt", className: "badge badge--info" },
  3: { label: "Trình ký", className: "badge badge--primary" },
  4: { label: "Đã ký", className: "badge badge--success" },
  5: { label: "Đã phát hành", className: "badge badge--success" },
};

const DO_KHAN_MAP: Record<string, { label: string; className: string }> = {
  BINH_THUONG: { label: "Bình thường", className: "badge badge--ghost" },
  KHAN: { label: "Khẩn", className: "badge badge--danger" },
  THUONG_KHAN: { label: "Thượng khẩn", className: "badge badge--danger" },
  HOA_TOC: { label: "Hỏa tốc", className: "badge badge--danger" },
};

function getTrangThaiBadge(trangThai?: number) {
  const key = trangThai ?? -1;
  return TRANG_THAI_MAP[key] ?? { label: "Không xác định", className: "badge badge--ghost" };
}

type CreateForm = {
  trichYeu: string; soKyHieu: string; loaiVanBanId: string;
  nguoiKy: string; ngayVanBan: string; doKhan: string;
};

const EMPTY_FORM: CreateForm = {
  trichYeu: "", soKyHieu: "", loaiVanBanId: "", nguoiKy: "", ngayVanBan: "", doKhan: "BINH_THUONG",
};

export default function OutgoingDocuments() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docTypes, setDocTypes] = useState<DocumentTypeItem[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const load = (status?: number, from?: string, to?: string) => {
    setLoading(true);
    setError(null);
    fetchOutgoingDocuments({ page: 0, size: 50, trangThai: status, fromDate: from, toDate: to })
      .then((res) => setDocuments(res.content || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không thể tải văn bản đi"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetchDocumentTypes({ suDung: true }).then(setDocTypes).catch(() => {});
  }, []);

  const handleFilter = () => {
    load(filterStatus ? parseInt(filterStatus, 10) : undefined, filterFrom || undefined, filterTo || undefined);
  };

  const handleResetFilter = () => {
    setFilterStatus(""); setFilterFrom(""); setFilterTo(""); load();
  };

  const openCreate = () => {
    setForm(EMPTY_FORM); setCreateError(null); setCreateSuccess(false); setShowCreate(true);
  };

  const closeCreate = () => {
    setShowCreate(false); setCreateError(null); setCreateSuccess(false);
  };

  const handleCreate = async () => {
    if (!form.trichYeu.trim()) { setCreateError("Vui lòng nhập trích yếu nội dung"); return; }
    setCreating(true); setCreateError(null);
    try {
      await createOutgoingDocument({
        trichYeu: form.trichYeu.trim(),
        soKyHieu: form.soKyHieu.trim() || undefined,
        loaiVanBanId: form.loaiVanBanId ? parseInt(form.loaiVanBanId, 10) : undefined,
        nguoiKy: form.nguoiKy.trim() || undefined,
        ngayVanBan: form.ngayVanBan || undefined,
        doKhan: form.doKhan || undefined,
      });
      setCreateSuccess(true);
      setTimeout(() => { closeCreate(); load(); }, 900);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Tạo văn bản thất bại");
    } finally {
      setCreating(false);
    }
  };

  const exportCsv = () => {
    const headers = ["Mã", "Loại", "Nội dung", "Ngày văn bản", "Trạng thái"];
    const rows = documents.map((d) => [
      d.soKyHieu || "-", d.tenLoaiVanBan || "-",
      `"${(d.trichYeu || "").replace(/"/g, '""')}"`,
      d.ngayTiepNhan ? new Date(d.ngayTiepNhan).toLocaleDateString("vi-VN") : "-",
      getTrangThaiBadge(d.trangThai).label,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `van-ban-di_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Văn bản đi</h1>
          <p>Quản lý và theo dõi các văn bản ban hành.</p>
        </div>
        <div className="topbar__actions">
          <button className="button secondary" type="button" onClick={exportCsv}>Xuất CSV</button>
          <button className="button" type="button" onClick={openCreate}>+ Tạo văn bản đi</button>
        </div>
      </div>

      <div className="filter-bar">
        <select
          className="form-control"
          style={{ minWidth: 150 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(TRANG_THAI_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <input type="date" className="form-control" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} style={{ width: 150 }} />
        <input type="date" className="form-control" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} style={{ width: 150 }} />
        <button className="button" type="button" onClick={handleFilter}>Lọc</button>
        <button className="button secondary" type="button" onClick={handleResetFilter}>Xóa lọc</button>
      </div>

      {error && <div className="alert alert--error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Đang tải văn bản đi...</p>
          </div>
        )}
        {!loading && !error && documents.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">📤</div>
            <h3>Chưa có văn bản đi</h3>
            <p>Tạo văn bản đi đầu tiên bằng nút phía trên.</p>
          </div>
        )}
        {documents.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th><th>Loại</th><th>Nội dung</th><th>Ngày</th><th>Ưu tiên</th><th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const stt = getTrangThaiBadge(doc.trangThai);
                const khan = doc.doKhan ? (DO_KHAN_MAP[doc.doKhan] ?? null) : null;
                return (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{doc.soKyHieu || "-"}</td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>{doc.tenLoaiVanBan || "-"}</td>
                    <td>
                      <Link to={`/documents/${doc.id}`} style={{ color: "var(--accent-strong)", fontWeight: 500 }}>
                        {doc.trichYeu}
                      </Link>
                    </td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                      {doc.ngayTiepNhan ? new Date(doc.ngayTiepNhan).toLocaleDateString("vi-VN") : "-"}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {khan ? <span className={khan.className}>{khan.label}</span> : <span className="badge badge--ghost">—</span>}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}><span className={stt.className}>{stt.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={closeCreate}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📝 Tạo văn bản đi mới</h3>
              <button className="modal-close" onClick={closeCreate}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <div className="form-field">
                  <label className="form-label">Trích yếu nội dung <span>*</span></label>
                  <textarea className="form-control" rows={3} placeholder="Nhập trích yếu nội dung văn bản..."
                    value={form.trichYeu} onChange={(e) => setForm({ ...form, trichYeu: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Số ký hiệu</label>
                    <input type="text" className="form-control" placeholder="VD: 01/2026/QĐ-ABC"
                      value={form.soKyHieu} onChange={(e) => setForm({ ...form, soKyHieu: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Loại văn bản</label>
                    <select className="form-control" value={form.loaiVanBanId}
                      onChange={(e) => setForm({ ...form, loaiVanBanId: e.target.value })}>
                      <option value="">-- Chọn loại văn bản --</option>
                      {docTypes.map((t) => <option key={t.id} value={t.id}>{t.tenLoaiVanBan}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Người ký</label>
                    <input type="text" className="form-control" placeholder="Họ tên người ký..."
                      value={form.nguoiKy} onChange={(e) => setForm({ ...form, nguoiKy: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Ngày văn bản</label>
                    <input type="date" className="form-control"
                      value={form.ngayVanBan} onChange={(e) => setForm({ ...form, ngayVanBan: e.target.value })} />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Độ khẩn</label>
                  <select className="form-control" value={form.doKhan}
                    onChange={(e) => setForm({ ...form, doKhan: e.target.value })}>
                    <option value="BINH_THUONG">Bình thường</option>
                    <option value="KHAN">Khẩn</option>
                    <option value="THUONG_KHAN">Thượng khẩn</option>
                    <option value="HOA_TOC">Hỏa tốc</option>
                  </select>
                </div>
              </div>
              {createSuccess && <div className="alert alert--success">Tạo văn bản thành công!</div>}
              {createError && <div className="alert alert--error">{createError}</div>}
            </div>
            <div className="modal-footer">
              <button className="button secondary" type="button" onClick={closeCreate} disabled={creating}>Hủy</button>
              <button className="button" type="button" onClick={handleCreate} disabled={creating}>
                {creating ? "Đang tạo..." : "Tạo văn bản"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
