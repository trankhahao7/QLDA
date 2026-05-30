import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../services/core/apiClient";
import {
  fetchOutgoingDocuments,
} from "../../services/documents/documentsOutgoingApi";
import {
  createOutgoingDocument,
} from "../../services/documents/documentsOutgoingCreateApi";
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
  trichYeu: string;
  soKyHieu: string;
  loaiVanBanId: string;
  nguoiKy: string;
  ngayVanBan: string;
  doKhan: string;
};

const EMPTY_FORM: CreateForm = {
  trichYeu: "",
  soKyHieu: "",
  loaiVanBanId: "",
  nguoiKy: "",
  ngayVanBan: "",
  doKhan: "BINH_THUONG",
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
    fetchOutgoingDocuments({
      page: 0,
      size: 50,
      trangThai: status,
      fromDate: from || undefined,
      toDate: to || undefined,
    })
      .then((res) => setDocuments(res.content || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không thể tải văn bản đi"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetchDocumentTypes({ suDung: true })
      .then(setDocTypes)
      .catch(() => {});
  }, []);

  const handleFilter = () => {
    load(
      filterStatus ? parseInt(filterStatus, 10) : undefined,
      filterFrom || undefined,
      filterTo || undefined
    );
  };

  const handleResetFilter = () => {
    setFilterStatus("");
    setFilterFrom("");
    setFilterTo("");
    load();
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setCreateError(null);
    setCreateSuccess(false);
    setShowCreate(true);
  };

  const closeCreate = () => {
    setShowCreate(false);
    setCreateError(null);
    setCreateSuccess(false);
  };

  const handleCreate = async () => {
    if (!form.trichYeu.trim()) {
      setCreateError("Vui lòng nhập trích yếu nội dung");
      return;
    }
    setCreating(true);
    setCreateError(null);
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
      setTimeout(() => {
        closeCreate();
        load();
      }, 900);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Tạo văn bản thất bại");
    } finally {
      setCreating(false);
    }
  };

  const exportCsv = () => {
    const headers = ["Mã", "Loại", "Nội dung", "Ngày văn bản", "Trạng thái"];
    const rows = documents.map((d) => [
      d.soKyHieu || "-",
      d.tenLoaiVanBan || "-",
      `"${(d.trichYeu || "").replace(/"/g, '""')}"`,
      d.ngayTiepNhan ? new Date(d.ngayTiepNhan).toLocaleDateString("vi-VN") : "-",
      getTrangThaiBadge(d.trangThai).label,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `van-ban-di_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
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
          <button className="button secondary" type="button" onClick={exportCsv}>
            Xuất CSV
          </button>
          <button className="button" type="button" onClick={openCreate}>
            + Tạo văn bản đi
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            Trạng thái
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ minWidth: 140 }}
            >
              <option value="">Tất cả</option>
              {Object.entries(TRANG_THAI_MAP).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            Từ ngày
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
            Đến ngày
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="button" type="button" onClick={handleFilter} style={{ fontSize: 13 }}>
              Lọc
            </button>
            <button className="button secondary" type="button" onClick={handleResetFilter} style={{ fontSize: 13 }}>
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        {loading && (
          <p style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>Đang tải...</p>
        )}
        {error && <p style={{ padding: 16, color: "#ef4444" }}>{error}</p>}
        {!loading && !error && documents.length === 0 && (
          <p style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>
            Chưa có văn bản đi nào.
          </p>
        )}

        {documents.length > 0 && (
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>Mã</th>
                <th style={{ whiteSpace: "nowrap" }}>Loại</th>
                <th>Nội dung</th>
                <th style={{ whiteSpace: "nowrap" }}>Ngày</th>
                <th style={{ whiteSpace: "nowrap" }}>Ưu tiên</th>
                <th style={{ whiteSpace: "nowrap" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const stt = getTrangThaiBadge(doc.trangThai);
                const khan = doc.doKhan ? (DO_KHAN_MAP[doc.doKhan] ?? null) : null;
                return (
                  <tr key={doc.id} style={{ verticalAlign: "middle" }}>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{doc.soKyHieu || "-"}</td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>{doc.tenLoaiVanBan || "-"}</td>
                    <td>
                      <Link to={`/documents/${doc.id}`}>{doc.trichYeu}</Link>
                    </td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                      {doc.ngayTiepNhan
                        ? new Date(doc.ngayTiepNhan).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {khan ? (
                        <span className={khan.className}>{khan.label}</span>
                      ) : (
                        <span className="badge badge--ghost">-</span>
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span className={stt.className}>{stt.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000, display: "flex",
            alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)",
          }}
          onClick={closeCreate}
        >
          <div
            style={{
              background: "#fff", borderRadius: 12, padding: 28, width: 520,
              maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Tạo văn bản đi mới</h3>

            <div className="form-grid" style={{ gap: 12 }}>
              <label>
                Trích yếu nội dung <span style={{ color: "#ef4444" }}>*</span>
                <textarea
                  rows={3}
                  placeholder="Nhập trích yếu nội dung văn bản..."
                  value={form.trichYeu}
                  onChange={(e) => setForm({ ...form, trichYeu: e.target.value })}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </label>

              <label>
                Số ký hiệu
                <input
                  type="text"
                  placeholder="VD: 01/2026/QĐ-ABC"
                  value={form.soKyHieu}
                  onChange={(e) => setForm({ ...form, soKyHieu: e.target.value })}
                />
              </label>

              <label>
                Loại văn bản
                <select
                  value={form.loaiVanBanId}
                  onChange={(e) => setForm({ ...form, loaiVanBanId: e.target.value })}
                >
                  <option value="">-- Chọn loại văn bản --</option>
                  {docTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.tenLoaiVanBan}</option>
                  ))}
                </select>
              </label>

              <label>
                Người ký
                <input
                  type="text"
                  placeholder="Họ tên người ký..."
                  value={form.nguoiKy}
                  onChange={(e) => setForm({ ...form, nguoiKy: e.target.value })}
                />
              </label>

              <label>
                Ngày văn bản
                <input
                  type="date"
                  value={form.ngayVanBan}
                  onChange={(e) => setForm({ ...form, ngayVanBan: e.target.value })}
                />
              </label>

              <label>
                Độ khẩn
                <select
                  value={form.doKhan}
                  onChange={(e) => setForm({ ...form, doKhan: e.target.value })}
                >
                  <option value="BINH_THUONG">Bình thường</option>
                  <option value="KHAN">Khẩn</option>
                  <option value="THUONG_KHAN">Thượng khẩn</option>
                  <option value="HOA_TOC">Hỏa tốc</option>
                </select>
              </label>

              {createSuccess && (
                <div style={{ padding: 10, borderRadius: 6, background: "rgba(34,197,94,0.1)", color: "#22c55e", textAlign: "center" }}>
                  Tạo văn bản thành công!
                </div>
              )}
              {createError && (
                <div style={{ padding: 10, borderRadius: 6, background: "rgba(239,68,68,0.1)", color: "#ef4444", textAlign: "center" }}>
                  {createError}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button className="button secondary" type="button" onClick={closeCreate} disabled={creating}>
                  Hủy
                </button>
                <button className="button" type="button" onClick={handleCreate} disabled={creating}>
                  {creating ? "Đang tạo..." : "Tạo văn bản"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
