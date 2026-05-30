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

  if (loading) return <div className="page-loading">Đang tải...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Ủy quyền xử lý</h1>
        <button className="button primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Hủy" : "+ Tạo ủy quyền"}
        </button>
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={handleCreate} style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Tạo ủy quyền mới</h3>
          {formError && <div className="alert alert--error">{formError}</div>}

          <div className="form-row">
            <label>
              ID người được ủy quyền <span style={{ color: "red" }}>*</span>
              <input
                type="number"
                className="input"
                placeholder="Nhập ID người dùng"
                value={form.nguoiDuocUyQuyenId}
                onChange={(e) => setForm({ ...form, nguoiDuocUyQuyenId: e.target.value })}
                required
              />
            </label>

            <label>
              Từ ngày <span style={{ color: "red" }}>*</span>
              <input
                type="date"
                className="input"
                value={form.tuNgay}
                onChange={(e) => setForm({ ...form, tuNgay: e.target.value })}
                required
              />
            </label>

            <label>
              Đến ngày <span style={{ color: "red" }}>*</span>
              <input
                type="date"
                className="input"
                value={form.denNgay}
                onChange={(e) => setForm({ ...form, denNgay: e.target.value })}
                required
              />
            </label>
          </div>

          <label>
            Phạm vi ủy quyền
            <input
              type="text"
              className="input"
              placeholder="VD: Ký duyệt văn bản đến"
              value={form.phamViUyQuyen}
              onChange={(e) => setForm({ ...form, phamViUyQuyen: e.target.value })}
            />
          </label>

          <label>
            Ghi chú
            <textarea
              className="input"
              rows={3}
              value={form.ghiChu}
              onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
            />
          </label>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
            <button type="button" className="button secondary" onClick={() => setShowForm(false)}>
              Hủy
            </button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? "Đang tạo..." : "Tạo ủy quyền"}
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="empty-state">Chưa có ủy quyền nào.</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người được ủy quyền (ID)</th>
                <th>Từ ngày</th>
                <th>Đến ngày</th>
                <th>Phạm vi</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nguoiDuocUyQuyenId}</td>
                  <td>{formatDate(item.tuNgay)}</td>
                  <td>{formatDate(item.denNgay)}</td>
                  <td>{item.phamViUyQuyen ?? "—"}</td>
                  <td>
                    <span className={`badge ${item.active ? "badge--success" : "badge--ghost"}`}>
                      {item.active ? "Hiệu lực" : "Hết hạn / Đã hủy"}
                    </span>
                  </td>
                  <td>
                    {item.active && (
                      <button
                        className="button danger small"
                        onClick={() => handleCancel(item.id)}
                      >
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
