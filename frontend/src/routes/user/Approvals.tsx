import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../services/core/apiClient";
import { getCurrentUser } from "../../services/auth/authApi";
import {
  fetchPendingApprovals,
  type PendingApprovalItem,
} from "../../services/workflows/approvalsApi";
import {
  approveProcessing,
  rejectProcessing,
  commentProcessing,
} from "../../services/workflows/workflowApprovalsApi";

type ActionType = "approve" | "reject" | "comment";

const TRANG_THAI_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Chờ xử lý", className: "badge badge--info" },
  1: { label: "Đang xử lý", className: "badge badge--warning" },
  2: { label: "Đã duyệt", className: "badge badge--success" },
  3: { label: "Từ chối", className: "badge badge--danger" },
};

function getTrangThaiBadge(trangThai?: number) {
  if (trangThai === undefined || trangThai === null) {
    return { label: "Chờ xử lý", className: "badge badge--info" };
  }
  return TRANG_THAI_MAP[trangThai] ?? { label: "Không xác định", className: "badge badge--ghost" };
}

const ACTION_META = {
  approve: { icon: "✅", title: "Phê duyệt văn bản", btnLabel: "Xác nhận phê duyệt", btnClass: "button" },
  reject:  { icon: "🚫", title: "Từ chối văn bản",   btnLabel: "Xác nhận từ chối",    btnClass: "button danger" },
  comment: { icon: "💬", title: "Ghi chú / Bổ sung",  btnLabel: "Gửi ghi chú",         btnClass: "button secondary" },
};

export default function Approvals() {
  const [items, setItems] = useState<PendingApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [activeItem, setActiveItem] = useState<PendingApprovalItem | null>(null);
  const [actionType, setActionType] = useState<ActionType>("approve");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        setCurrentUserId(u.id);
        return fetchPendingApprovals({ nguoiDuyetId: u.id, page: 0, size: 50 });
      })
      .then((res) => setItems(res.content || []))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Không thể tải danh sách phê duyệt")
      )
      .finally(() => setLoading(false));
  }, []);

  const reload = () => {
    if (!currentUserId) return;
    fetchPendingApprovals({ nguoiDuyetId: currentUserId, page: 0, size: 50 })
      .then((res) => setItems(res.content || []))
      .catch(() => {});
  };

  const openModal = (item: PendingApprovalItem, type: ActionType) => {
    setActiveItem(item);
    setActionType(type);
    setComment("");
    setSubmitResult(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveItem(null);
    setSubmitResult(null);
  };

  const handleSubmit = async () => {
    if (!activeItem) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      if (actionType === "approve") {
        await approveProcessing(activeItem.processingId, {
          yKienXuLy: comment.trim() || undefined,
          chuyenBuocTiepTheo: true,
        });
      } else if (actionType === "reject") {
        if (!comment.trim()) { setSubmitResult("Vui lòng nhập lý do từ chối"); setSubmitting(false); return; }
        await rejectProcessing(activeItem.processingId, { lyDoTuChoi: comment.trim() });
      } else {
        if (!comment.trim()) { setSubmitResult("Vui lòng nhập nội dung ghi chú"); setSubmitting(false); return; }
        await commentProcessing(activeItem.processingId, { noiDungGopY: comment.trim() });
      }
      setSubmitResult("success");
      if (actionType !== "comment") {
        setItems((prev) => prev.filter((i) => i.processingId !== activeItem.processingId));
      }
      setTimeout(closeModal, 900);
    } catch (err) {
      setSubmitResult(err instanceof ApiError ? err.message : "Thao tác thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const meta = ACTION_META[actionType];

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Phê duyệt văn bản</h1>
          <p>Danh sách văn bản chờ phê duyệt của bạn.</p>
        </div>
        <div className="topbar__actions">
          <button className="button secondary" type="button" onClick={reload}>🔄 Làm mới</button>
        </div>
      </div>

      {error && <div className="alert alert--error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Đang tải danh sách phê duyệt...</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">✅</div>
            <h3>Không có văn bản chờ phê duyệt</h3>
            <p>Tất cả văn bản đã được xử lý.</p>
          </div>
        )}

        {items.length > 0 && (
          <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Nội dung</th>
                <th>Người gửi</th>
                <th>Ngày nhận</th>
                <th>Hạn xử lý</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isOverdue = item.hanXuLy && new Date(item.hanXuLy) < new Date();
                const badge = getTrangThaiBadge(item.trangThaiXuLy);
                return (
                  <tr key={item.processingId}>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{item.soKyHieu || "-"}</td>
                    <td style={{ maxWidth: 260 }}>
                      <Link
                        to={`/documents/${item.documentId}`}
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
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>{item.nguoiGuiTen || "-"}</td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                      {item.ngayNhan ? new Date(item.ngayNhan).toLocaleDateString("vi-VN") : "-"}
                    </td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                      {item.hanXuLy ? (
                        <span style={{ color: isOverdue ? "var(--danger)" : undefined }}>
                          {new Date(item.hanXuLy).toLocaleDateString("vi-VN")}
                          {isOverdue && " ⚠"}
                        </span>
                      ) : "-"}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span className={badge.className}>{badge.label}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="action-group">
                        <button className="btn-xs btn-xs--approve" type="button" onClick={() => openModal(item, "approve")}>Duyệt</button>
                        <button className="btn-xs btn-xs--reject" type="button" onClick={() => openModal(item, "reject")}>Từ chối</button>
                        <button className="btn-xs btn-xs--ghost" type="button" onClick={() => openModal(item, "comment")}>Ghi chú</button>
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

      {showModal && activeItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{meta.icon} {meta.title}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-doc-ref">
                <strong>{activeItem.soKyHieu || `#${activeItem.documentId}`}</strong> — {activeItem.trichYeu}
              </div>

              <div className="form-field">
                <label className="form-label">
                  {actionType === "approve" ? "Ý kiến (tùy chọn)" : actionType === "reject" ? "Lý do từ chối *" : "Nội dung ghi chú *"}
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder={
                    actionType === "approve" ? "Nhập ý kiến nếu có..."
                    : actionType === "reject" ? "Nhập lý do từ chối..."
                    : "Nhập nội dung yêu cầu bổ sung..."
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {submitResult === "success" && <div className="alert alert--success">Thao tác thành công!</div>}
              {submitResult && submitResult !== "success" && <div className="alert alert--error">{submitResult}</div>}
            </div>
            <div className="modal-footer">
              <button className="button secondary" type="button" onClick={closeModal} disabled={submitting}>Hủy</button>
              <button
                className={meta.btnClass}
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Đang xử lý..." : meta.btnLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
