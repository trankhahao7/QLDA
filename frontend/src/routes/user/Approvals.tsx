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
        if (!comment.trim()) {
          setSubmitResult("Vui lòng nhập lý do từ chối");
          setSubmitting(false);
          return;
        }
        await rejectProcessing(activeItem.processingId, { lyDoTuChoi: comment.trim() });
      } else {
        if (!comment.trim()) {
          setSubmitResult("Vui lòng nhập nội dung ghi chú");
          setSubmitting(false);
          return;
        }
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

  const modalTitle: Record<ActionType, string> = {
    approve: "Phê duyệt văn bản",
    reject: "Từ chối văn bản",
    comment: "Ghi chú / Yêu cầu bổ sung",
  };

  const modalButtonLabel: Record<ActionType, string> = {
    approve: "Xác nhận phê duyệt",
    reject: "Xác nhận từ chối",
    comment: "Gửi ghi chú",
  };

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Phê duyệt văn bản</h1>
          <p>Danh sách văn bản chờ phê duyệt của bạn.</p>
        </div>
        <div className="topbar__actions">
          <button className="button secondary" type="button" onClick={reload}>
            Làm mới
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
            Không có văn bản nào chờ phê duyệt.
          </p>
        )}

        {items.length > 0 && (
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>Mã</th>
                <th>Nội dung</th>
                <th style={{ whiteSpace: "nowrap" }}>Người gửi</th>
                <th style={{ whiteSpace: "nowrap" }}>Ngày nhận</th>
                <th style={{ whiteSpace: "nowrap" }}>Hạn xử lý</th>
                <th style={{ whiteSpace: "nowrap" }}>Trạng thái</th>
                <th style={{ textAlign: "center", width: 220, whiteSpace: "nowrap" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isOverdue = item.hanXuLy && new Date(item.hanXuLy) < new Date();
                const badge = getTrangThaiBadge(item.trangThaiXuLy);
                return (
                  <tr key={item.processingId} style={{ verticalAlign: "middle" }}>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                      {item.soKyHieu || "-"}
                    </td>
                    <td>
                      <Link to={`/documents/${item.documentId}`}>{item.trichYeu}</Link>
                    </td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                      {item.nguoiGuiTen || "-"}
                    </td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                      {item.ngayNhan
                        ? new Date(item.ngayNhan).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                      {item.hanXuLy ? (
                        <span style={{ color: isOverdue ? "#ef4444" : undefined }}>
                          {new Date(item.hanXuLy).toLocaleDateString("vi-VN")}
                          {isOverdue && " ⚠"}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span className={badge.className}>{badge.label}</span>
                    </td>
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      <button
                        className="button button--small"
                        type="button"
                        onClick={() => openModal(item, "approve")}
                        style={{ fontSize: 12, padding: "2px 8px", marginRight: 4, background: "#22c55e", color: "#fff", border: "none" }}
                      >
                        Duyệt
                      </button>
                      <button
                        className="button button--small"
                        type="button"
                        onClick={() => openModal(item, "reject")}
                        style={{ fontSize: 12, padding: "2px 8px", marginRight: 4, background: "#ef4444", color: "#fff", border: "none" }}
                      >
                        Từ chối
                      </button>
                      <button
                        className="button button--small secondary"
                        type="button"
                        onClick={() => openModal(item, "comment")}
                        style={{ fontSize: 12, padding: "2px 8px" }}
                      >
                        Ghi chú
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && activeItem && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000, display: "flex",
            alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "#fff", borderRadius: 12, padding: 28, width: 480,
              maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>{modalTitle[actionType]}</h3>

            <div style={{ marginBottom: 16, padding: 12, background: "#f8f9fa", borderRadius: 8, fontSize: 13 }}>
              <strong>Văn bản:</strong> {activeItem.soKyHieu || `#${activeItem.documentId}`} — {activeItem.trichYeu}
            </div>

            <div className="form-grid" style={{ gap: 12 }}>
              <label>
                {actionType === "approve" ? "Ý kiến (tùy chọn)" : actionType === "reject" ? "Lý do từ chối *" : "Nội dung ghi chú *"}
                <textarea
                  rows={4}
                  placeholder={
                    actionType === "approve"
                      ? "Nhập ý kiến nếu có..."
                      : actionType === "reject"
                      ? "Nhập lý do từ chối..."
                      : "Nhập nội dung yêu cầu bổ sung..."
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </label>

              {submitResult === "success" && (
                <div style={{ padding: 10, borderRadius: 6, background: "rgba(34,197,94,0.1)", color: "#22c55e", textAlign: "center" }}>
                  Thành công!
                </div>
              )}
              {submitResult && submitResult !== "success" && (
                <div style={{ padding: 10, borderRadius: 6, background: "rgba(239,68,68,0.1)", color: "#ef4444", textAlign: "center" }}>
                  {submitResult}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button className="button secondary" type="button" onClick={closeModal} disabled={submitting}>
                  Hủy
                </button>
                <button
                  className="button"
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={actionType === "reject" ? { background: "#ef4444" } : undefined}
                >
                  {submitting ? "Đang xử lý..." : modalButtonLabel[actionType]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
