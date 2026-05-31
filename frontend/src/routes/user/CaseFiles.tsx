import { useEffect, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import {
  fetchCaseFiles, createCaseFile, attachDocumentToCaseFile, deleteCaseFile,
  type CaseFileItem,
} from "../../services/documents/caseFilesApi";
import { fetchUnits, type UnitItem } from "../../services/units/unitsApi";
import { getCurrentUser } from "../../services/auth/authApi";

const TRANG_THAI_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Đang mở", className: "badge badge--info" },
  1: { label: "Đang xử lý", className: "badge badge--warning" },
  2: { label: "Hoàn thành", className: "badge badge--success" },
  3: { label: "Đã đóng", className: "badge badge--ghost" },
};

function getTrangThaiBadge(trangThai?: number) {
  if (trangThai === undefined || trangThai === null) return { label: "Đang mở", className: "badge badge--info" };
  return TRANG_THAI_MAP[trangThai] ?? { label: "Không xác định", className: "badge badge--ghost" };
}

type CreateForm = { maHoSo: string; tenHoSo: string; donViId: string; ghiChu: string };
const EMPTY_FORM: CreateForm = { maHoSo: "", tenHoSo: "", donViId: "", ghiChu: "" };

export default function CaseFiles() {
  const [items, setItems] = useState<CaseFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [showAttach, setShowAttach] = useState(false);
  const [attachTarget, setAttachTarget] = useState<CaseFileItem | null>(null);
  const [attachDocId, setAttachDocId] = useState("");
  const [attaching, setAttaching] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [attachSuccess, setAttachSuccess] = useState(false);

  const load = (kw?: string) => {
    setLoading(true);
    setError(null);
    fetchCaseFiles({ keyword: kw || undefined, page: 0, size: 50 })
      .then((res) => setItems(res.content || []))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không thể tải hồ sơ"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetchUnits({ size: 100 }).then((r) => setUnits(r?.content || [])).catch(() => {});
    getCurrentUser().then((u) => setCurrentUserId(u.id)).catch(() => {});
  }, []);

  const handleSearch = () => load(keyword.trim() || undefined);

  const openCreate = () => { setForm(EMPTY_FORM); setCreateError(null); setCreateSuccess(false); setShowCreate(true); };
  const closeCreate = () => { setShowCreate(false); setCreateError(null); setCreateSuccess(false); };

  const handleCreate = async () => {
    if (!form.maHoSo.trim()) { setCreateError("Vui lòng nhập mã hồ sơ"); return; }
    if (!form.tenHoSo.trim()) { setCreateError("Vui lòng nhập tên hồ sơ"); return; }
    setCreating(true); setCreateError(null);
    try {
      await createCaseFile({
        maHoSo: form.maHoSo.trim(), tenHoSo: form.tenHoSo.trim(),
        donViId: form.donViId ? parseInt(form.donViId, 10) : undefined,
        nguoiPhuTrachId: currentUserId ?? undefined,
        ghiChu: form.ghiChu.trim() || undefined, trangThai: 0,
      });
      setCreateSuccess(true);
      setTimeout(() => { closeCreate(); load(keyword.trim() || undefined); }, 900);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Tạo hồ sơ thất bại");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (item: CaseFileItem) => {
    if (!window.confirm(`Xóa hồ sơ "${item.tenHoSo}"?`)) return;
    try {
      await deleteCaseFile(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xóa thất bại");
    }
  };

  const openAttach = (item: CaseFileItem) => {
    setAttachTarget(item); setAttachDocId(""); setAttachError(null); setAttachSuccess(false); setShowAttach(true);
  };
  const closeAttach = () => { setShowAttach(false); setAttachTarget(null); setAttachError(null); setAttachSuccess(false); };

  const handleAttach = async () => {
    if (!attachTarget) return;
    const docId = parseInt(attachDocId.trim(), 10);
    if (isNaN(docId)) { setAttachError("Vui lòng nhập ID văn bản hợp lệ"); return; }
    setAttaching(true); setAttachError(null);
    try {
      await attachDocumentToCaseFile(attachTarget.id, docId);
      setAttachSuccess(true);
      setTimeout(closeAttach, 900);
    } catch (err) {
      setAttachError(err instanceof ApiError ? err.message : "Gắn văn bản thất bại");
    } finally {
      setAttaching(false);
    }
  };

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Hồ sơ công việc</h1>
          <p>Quản lý hồ sơ và văn bản liên quan theo từng công việc.</p>
        </div>
        <div className="topbar__actions">
          <button className="button" type="button" onClick={openCreate}>+ Tạo hồ sơ mới</button>
        </div>
      </div>

      {error && <div className="alert alert--error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="filter-bar">
        <input
          type="text"
          className="form-control"
          style={{ flex: 1, maxWidth: 360 }}
          placeholder="Tìm theo mã hoặc tên hồ sơ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="button" type="button" onClick={handleSearch}>Tìm kiếm</button>
        <button className="button secondary" type="button" onClick={() => { setKeyword(""); load(); }}>Xóa lọc</button>
      </div>

      <div className="card">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Đang tải hồ sơ...</p>
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">🗂️</div>
            <h3>Chưa có hồ sơ nào</h3>
            <p>Tạo hồ sơ công việc để tổ chức và theo dõi văn bản liên quan.</p>
          </div>
        )}
        {items.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Mã hồ sơ</th><th>Tên hồ sơ</th><th>Trạng thái</th><th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const badge = getTrangThaiBadge(item.trangThai);
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{item.maHoSo}</td>
                    <td>{item.tenHoSo}</td>
                    <td style={{ whiteSpace: "nowrap" }}><span className={badge.className}>{badge.label}</span></td>
                    <td style={{ textAlign: "center" }}>
                      <div className="action-group">
                        <button className="btn-xs btn-xs--ghost" type="button" onClick={() => openAttach(item)}>Gắn VB</button>
                        <button className="btn-xs btn-xs--reject" type="button" onClick={() => handleDelete(item)}>Xóa</button>
                      </div>
                    </td>
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
              <h3>🗂️ Tạo hồ sơ công việc mới</h3>
              <button className="modal-close" onClick={closeCreate}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Mã hồ sơ <span>*</span></label>
                    <input type="text" className="form-control" placeholder="VD: HS-2026-001"
                      value={form.maHoSo} onChange={(e) => setForm({ ...form, maHoSo: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Đơn vị phụ trách</label>
                    <select className="form-control" value={form.donViId} onChange={(e) => setForm({ ...form, donViId: e.target.value })}>
                      <option value="">-- Chọn đơn vị --</option>
                      {units.map((u) => <option key={u.id} value={u.id}>{u.tenDonVi}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Tên hồ sơ <span>*</span></label>
                  <input type="text" className="form-control" placeholder="Nhập tên hồ sơ..."
                    value={form.tenHoSo} onChange={(e) => setForm({ ...form, tenHoSo: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Ghi chú</label>
                  <textarea className="form-control" rows={3} placeholder="Ghi chú thêm..."
                    value={form.ghiChu} onChange={(e) => setForm({ ...form, ghiChu: e.target.value })} />
                </div>
              </div>
              {createSuccess && <div className="alert alert--success">Tạo hồ sơ thành công!</div>}
              {createError && <div className="alert alert--error">{createError}</div>}
            </div>
            <div className="modal-footer">
              <button className="button secondary" type="button" onClick={closeCreate} disabled={creating}>Hủy</button>
              <button className="button" type="button" onClick={handleCreate} disabled={creating}>
                {creating ? "Đang tạo..." : "Tạo hồ sơ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAttach && attachTarget && (
        <div className="modal-overlay" onClick={closeAttach}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📎 Gắn văn bản vào hồ sơ</h3>
              <button className="modal-close" onClick={closeAttach}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-doc-ref">
                Hồ sơ: <strong>{attachTarget.tenHoSo}</strong>
              </div>
              <div className="form-field">
                <label className="form-label">ID văn bản <span>*</span></label>
                <input type="number" className="form-control" placeholder="Nhập ID của văn bản cần gắn..."
                  value={attachDocId} onChange={(e) => setAttachDocId(e.target.value)} />
              </div>
              {attachSuccess && <div className="alert alert--success">Gắn văn bản thành công!</div>}
              {attachError && <div className="alert alert--error">{attachError}</div>}
            </div>
            <div className="modal-footer">
              <button className="button secondary" type="button" onClick={closeAttach} disabled={attaching}>Hủy</button>
              <button className="button" type="button" onClick={handleAttach} disabled={attaching}>
                {attaching ? "Đang gắn..." : "Xác nhận gắn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
