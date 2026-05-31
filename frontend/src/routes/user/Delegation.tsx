import { useEffect, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { getCurrentUser } from "../../services/auth/authApi";
import { fetchUsers, type UserItem } from "../../services/auth/usersApi";
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
  const [users, setUsers] = useState<UserItem[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nguoiDuocUyQuyenId: "", tuNgay: "", denNgay: "", phamViUyQuyen: "", ghiChu: "",
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

    fetchUsers({ size: 200, trangThai: 1 })
      .then((r) => setUsers(r?.content ?? []))
      .catch(() => {});
  }, []);

  async function load(userId: number) {
    const res = await fetchDelegations({ nguoiUyQuyenId: userId, size: 50 });
    setItems(res.data?.content ?? []);
  }

  function openModal() {
    setForm({ nguoiDuocUyQuyenId: "", tuNgay: "", denNgay: "", phamViUyQuyen: "", ghiChu: "" });
    setFormError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) return;
    const nguoiDuocId = parseInt(form.nguoiDuocUyQuyenId, 10);
    if (!nguoiDuocId || !form.tuNgay || !form.denNgay) {
      setFormError("Vui lòng chọn người được ủy quyền và nhập đầy đủ ngày.");
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
      closeModal();
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

  const otherUsers = users.filter((u) => u.id !== currentUserId);

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Ủy quyền xử lý</h1>
          <p>Quản lý ủy quyền xử lý văn bản cho người khác.</p>
        </div>
        <div className="topbar__actions">
          <button className="button" type="button" onClick={openModal}>
            + Tạo ủy quyền
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Đang tải...</p>
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">🤝</div>
            <h3>Chưa có ủy quyền nào</h3>
            <p>Tạo ủy quyền mới để phân công xử lý văn bản.</p>
          </div>
        )}
        {items.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Người được ủy quyền</th>
                  <th>Từ ngày</th>
                  <th>Đến ngày</th>
                  <th>Phạm vi</th>
                  <th>Ghi chú</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const user = users.find((u) => u.id === item.nguoiDuocUyQuyenId);
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>
                        {user ? `${user.hoTen} (${user.tenDonVi ?? "—"})` : `#${item.nguoiDuocUyQuyenId}`}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(item.tuNgay)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(item.denNgay)}</td>
                      <td style={{ fontSize: 13 }}>{item.phamViUyQuyen ?? "—"}</td>
                      <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{item.ghiChu ?? "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span className={`badge ${item.active ? "badge--success" : "badge--ghost"}`}>
                          {item.active ? "Hiệu lực" : "Hết hạn / Đã hủy"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.active && (
                          <button className="btn-xs btn-xs--reject" type="button" onClick={() => handleCancel(item.id)}>
                            Hủy
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🤝 Tạo ủy quyền mới</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {formError && (
                <div className="alert alert--error" style={{ marginBottom: 14 }}>{formError}</div>
              )}
              <form id="delegation-form" onSubmit={handleCreate}>
                <div className="form-section">
                  <div className="form-field">
                    <label className="form-label">Người được ủy quyền <span>*</span></label>
                    <select
                      className="form-control"
                      value={form.nguoiDuocUyQuyenId}
                      onChange={(e) => setForm({ ...form, nguoiDuocUyQuyenId: e.target.value })}
                    >
                      <option value="">-- Chọn người được ủy quyền --</option>
                      {otherUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.hoTen} {u.tenDonVi ? `(${u.tenDonVi})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">Từ ngày <span>*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.tuNgay}
                        onChange={(e) => setForm({ ...form, tuNgay: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Đến ngày <span>*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.denNgay}
                        onChange={(e) => setForm({ ...form, denNgay: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Phạm vi ủy quyền</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: Ký duyệt văn bản đến"
                      value={form.phamViUyQuyen}
                      onChange={(e) => setForm({ ...form, phamViUyQuyen: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Ghi chú</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Ghi chú thêm (nếu có)..."
                      value={form.ghiChu}
                      onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="button secondary" onClick={closeModal} disabled={submitting}>
                Hủy
              </button>
              <button type="submit" form="delegation-form" className="button" disabled={submitting}>
                {submitting ? "Đang tạo..." : "Tạo ủy quyền"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
