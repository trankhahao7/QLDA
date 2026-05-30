import { useEffect, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { getCurrentUser } from "../../services/auth/authApi";
import {
  fetchDelegations,
  createDelegation,
  cancelDelegation,
  type DelegationItem,
} from "../../services/workflows/delegationApi";

function formatDate(iso: string) {
  return iso ? iso.split("T")[0] : "—";
}

export default function Delegation() {
  const [items, setItems] = useState<DelegationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nguoiDuocUyQuyenId: "",
    tuNgay: "",
    denNgay: "",
    phamViUyQuyen: "",
    ghiChu: "",
  });

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        setCurrentUserId(u.id);
        return load(u.id);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Không thể tải dữ liệu ủy quyền")
      )
      .finally(() => setLoading(false));
  }, []);

  async function load(userId: number) {
    const res = await fetchDelegations({ nguoiUyQuyenId: userId, size: 50 });
    setItems(res.data?.content ?? []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) return;
    const nguoiDuocId = parseInt(form.nguoiDuocUyQuyenId, 10);
    if (!nguoiDuocId || !form.tuNgay || !form.denNgay) {
      setFormError("Vui lòng điền đầy đủ ID người được ủy quyền, ngày bắt đầu và ngày kết thúc.");
      return;
    }
    if (form.denNgay < form.tuNgay) {
      setFormError("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createDelegation({
        nguoiUyQuyenId: currentUserId,
        nguoiDuocUyQuyenId: nguoiDuocId,
        tuNgay: form.tuNgay,
        denNgay: form.denNgay,
        phamViUyQuyen: form.phamViUyQuyen || undefined,
        ghiChu: form.ghiChu || undefined,
      });
      setShowForm(false);
      setForm({ nguoiDuocUyQuyenId: "", tuNgay: "", denNgay: "", phamViUyQuyen: "", ghiChu: "" });
      await load(currentUserId);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Tạo ủy quyền thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: number) {
    if (!currentUserId || !confirm("Hủy ủy quyền này?")) return;
    try {
      await cancelDelegation(id);
      await load(currentUserId);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Không thể hủy ủy quyền.");
    }
  }

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Ủy quyền xử lý</h1>
          <p>Quản lý ủy quyền xử lý văn bản cho người khác.</p>
        </div>
        <div className="topbar__actions">
          <button className="button secondary" type="button" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Hủy" : "+ Tạo ủy quyền"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card">
          <p style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>Đang tải...</p>
        </div>
      )}
      {error && (
        <div className="card">
          <p style={{ padding: 16, color: "#ef4444" }}>{error}</p>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Tạo ủy quyền mới</h3>
          {formError && (
            <div style={{ padding: 10, borderRadius: 6, background: "rgba(239,68,68,0.1)", color: "#ef4444", marginBottom: 12 }}>
              {formError}
            </div>
          )}

          <form className="form-grid" style={{ gap: 12 }} onSubmit={handleCreate}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <label style={{ flex: 1, minWidth: 160 }}>
                ID người được ủy quyền <span style={{ color: "#ef4444" }}>*</span>
                <input
                  type="number"
                  placeholder="Nhập ID người dùng"
                  value={form.nguoiDuocUyQuyenId}
                  onChange={(e) => setForm({ ...form, nguoiDuocUyQuyenId: e.target.value })}
                />
              </label>
              <label style={{ flex: 1, minWidth: 140 }}>
                Từ ngày <span style={{ color: "#ef4444" }}>*</span>
                <input
                  type="date"
                  value={form.tuNgay}
                  onChange={(e) => setForm({ ...form, tuNgay: e.target.value })}
                />
              </label>
              <label style={{ flex: 1, minWidth: 140 }}>
                Đến ngày <span style={{ color: "#ef4444" }}>*</span>
                <input
                  type="date"
                  value={form.denNgay}
                  onChange={(e) => setForm({ ...form, denNgay: e.target.value })}
                />
              </label>
            </div>

            <label>
              Phạm vi ủy quyền
              <input
                type="text"
                placeholder="VD: Ký duyệt văn bản đến"
                value={form.phamViUyQuyen}
                onChange={(e) => setForm({ ...form, phamViUyQuyen: e.target.value })}
              />
            </label>

            <label>
              Ghi chú
              <textarea
                rows={3}
                value={form.ghiChu}
                onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                style={{ width: "100%", resize: "vertical" }}
              />
            </label>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" className="button secondary" onClick={() => setShowForm(false)}>
                Hủy
              </button>
              <button type="submit" className="button" disabled={submitting}>
                {submitting ? "Đang tạo..." : "Tạo ủy quyền"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {!loading && items.length === 0 && (
          <p style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>
            Chưa có ủy quyền nào.
          </p>
        )}
        {items.length > 0 && (
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>ID</th>
                <th style={{ whiteSpace: "nowrap" }}>Người được ủy quyền (ID)</th>
                <th style={{ whiteSpace: "nowrap" }}>Từ ngày</th>
                <th style={{ whiteSpace: "nowrap" }}>Đến ngày</th>
                <th>Phạm vi</th>
                <th style={{ whiteSpace: "nowrap" }}>Trạng thái</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ verticalAlign: "middle" }}>
                  <td style={{ fontWeight: 600 }}>{item.id}</td>
                  <td>{item.nguoiDuocUyQuyenId}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(item.tuNgay)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(item.denNgay)}</td>
                  <td style={{ fontSize: 13 }}>{item.phamViUyQuyen ?? "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <span className={`badge ${item.active ? "badge--success" : "badge--ghost"}`}>
                      {item.active ? "Hiệu lực" : "Hết hạn / Đã hủy"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {item.active && (
                      <button
                        className="button secondary"
                        type="button"
                        onClick={() => handleCancel(item.id)}
                        style={{ fontSize: 12, padding: "2px 8px", color: "#ef4444" }}
                      >
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
