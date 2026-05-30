import { useEffect, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import {
  fetchCaseFiles,
  createCaseFile,
  attachDocumentToCaseFile,
  deleteCaseFile,
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
  if (trangThai === undefined || trangThai === null) {
    return { label: "Đang mở", className: "badge badge--info" };
  }
  return TRANG_THAI_MAP[trangThai] ?? { label: "Không xác định", className: "badge badge--ghost" };
}

type CreateForm = {
  maHoSo: string;
  tenHoSo: string;
  donViId: string;
  ghiChu: string;
};

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
    if (!form.maHoSo.trim()) { setCreateError("Vui lòng nhập mã hồ sơ"); return; }
    if (!form.tenHoSo.trim()) { setCreateError("Vui lòng nhập tên hồ sơ"); return; }
    setCreating(true);
    setCreateError(null);
    try {
      await createCaseFile({
        maHoSo: form.maHoSo.trim(),
        tenHoSo: form.tenHoSo.trim(),
        donViId: form.donViId ? parseInt(form.donViId, 10) : undefined,
        nguoiPhuTrachId: currentUserId ?? undefined,
        ghiChu: form.ghiChu.trim() || undefined,
        trangThai: 0,
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
    setAttachTarget(item);
    setAttachDocId("");
    setAttachError(null);
    setAttachSuccess(false);
    setShowAttach(true);
  };

  const closeAttach = () => {
    setShowAttach(false);
    setAttachTarget(null);
    setAttachError(null);
    setAttachSuccess(false);
  };

  const handleAttach = async () => {
    if (!attachTarget) return;
    const docId = parseInt(attachDocId.trim(), 10);
    if (isNaN(docId)) { setAttachError("Vui lòng nhập ID văn bản hợp lệ"); return; }
    setAttaching(true);
    setAttachError(null);
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
          <button className="button" type="button" onClick={openCreate}>
            + Tạo hồ sơ mới
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên hồ sơ..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{ flex: 1 }}
          />
          <button className="button" type="button" onClick={handleSearch} style={{ fontSize: 13 }}>
            Tìm kiếm
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={() => { setKeyword(""); load(); }}
            style={{ fontSize: 13 }}
          >
            Xóa
          </button>
        </div>
      </div>

      <div className="card">
        {loading && (
          <p style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>Đang tải...</p>
        )}
        {error && <p style={{ padding: 16, color: "#ef4444" }}>{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>
            Chưa có hồ sơ nào.
          </p>
        )}

        {items.length > 0 && (
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>Mã hồ sơ</th>
                <th>Tên hồ sơ</th>
                <th style={{ whiteSpace: "nowrap" }}>Trạng thái</th>
                <th style={{ textAlign: "center", width: 200, whiteSpace: "nowrap" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const badge = getTrangThaiBadge(item.trangThai);
                return (
                  <tr key={item.id} style={{ verticalAlign: "middle" }}>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{item.maHoSo}</td>
                    <td>{item.tenHoSo}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span className={badge.className}>{badge.label}</span>
                    </td>
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      <button
                        className="button button--small secondary"
                        type="button"
                        onClick={() => openAttach(item)}
                        style={{ fontSize: 12, padding: "2px 8px", marginRight: 4 }}
                      >
                        Gắn văn bản
                      </button>
                      <button
                        className="button button--small"
                        type="button"
                        onClick={() => handleDelete(item)}
                        style={{ fontSize: 12, padding: "2px 8px", background: "#ef4444", color: "#fff", border: "none" }}
                      >
                        Xóa
                      </button>
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
              background: "#fff", borderRadius: 12, padding: 28, width: 480,
              maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Tạo hồ sơ công việc mới</h3>
            <div className="form-grid" style={{ gap: 12 }}>
              <label>
                Mã hồ sơ <span style={{ color: "#ef4444" }}>*</span>
                <input
                  type="text"
                  placeholder="VD: HS-2026-001"
                  value={form.maHoSo}
                  onChange={(e) => setForm({ ...form, maHoSo: e.target.value })}
                />
              </label>
              <label>
                Tên hồ sơ <span style={{ color: "#ef4444" }}>*</span>
                <input
                  type="text"
                  placeholder="Nhập tên hồ sơ..."
                  value={form.tenHoSo}
                  onChange={(e) => setForm({ ...form, tenHoSo: e.target.value })}
                />
              </label>
              <label>
                Đơn vị phụ trách
                <select value={form.donViId} onChange={(e) => setForm({ ...form, donViId: e.target.value })}>
                  <option value="">-- Chọn đơn vị --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.tenDonVi}</option>
                  ))}
                </select>
              </label>
              <label>
                Ghi chú
                <textarea
                  rows={3}
                  placeholder="Ghi chú thêm..."
                  value={form.ghiChu}
                  onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </label>

              {createSuccess && (
                <div style={{ padding: 10, borderRadius: 6, background: "rgba(34,197,94,0.1)", color: "#22c55e", textAlign: "center" }}>
                  Tạo hồ sơ thành công!
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
                  {creating ? "Đang tạo..." : "Tạo hồ sơ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAttach && attachTarget && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000, display: "flex",
            alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)",
          }}
          onClick={closeAttach}
        >
          <div
            style={{
              background: "#fff", borderRadius: 12, padding: 28, width: 420,
              maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Gắn văn bản vào hồ sơ</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-muted)" }}>
              Hồ sơ: <strong>{attachTarget.tenHoSo}</strong>
            </p>
            <div className="form-grid" style={{ gap: 12 }}>
              <label>
                ID văn bản <span style={{ color: "#ef4444" }}>*</span>
                <input
                  type="number"
                  placeholder="Nhập ID của văn bản cần gắn..."
                  value={attachDocId}
                  onChange={(e) => setAttachDocId(e.target.value)}
                />
              </label>

              {attachSuccess && (
                <div style={{ padding: 10, borderRadius: 6, background: "rgba(34,197,94,0.1)", color: "#22c55e", textAlign: "center" }}>
                  Gắn văn bản thành công!
                </div>
              )}
              {attachError && (
                <div style={{ padding: 10, borderRadius: 6, background: "rgba(239,68,68,0.1)", color: "#ef4444", textAlign: "center" }}>
                  {attachError}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button className="button secondary" type="button" onClick={closeAttach} disabled={attaching}>
                  Hủy
                </button>
                <button className="button" type="button" onClick={handleAttach} disabled={attaching}>
                  {attaching ? "Đang gắn..." : "Xác nhận gắn"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
