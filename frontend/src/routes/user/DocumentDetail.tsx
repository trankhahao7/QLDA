import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ApiError } from "../../services/core/apiClient";
import { fetchIncomingDetail } from "../../services/documents/documentsApi";
import { fetchWorkflowTimeline } from "../../services/workflows/workflowTrackingApi";
import { getCurrentUser, type AuthUser } from "../../services/auth/authApi";
import { fetchPendingApprovals, type PendingApprovalItem } from "../../services/workflows/approvalsApi";
import { approveProcessing, rejectProcessing } from "../../services/workflows/workflowApprovalsApi";
import { fetchAttachments, triggerDownload } from "../../services/documents/documentAttachmentsApi";
import {
  signDocument,
  getOneDriveEditUrl,
  getSignatureInfo,
  type SignatureInfo,
} from "../../services/documents/documentsPublishApi";
import type { DocumentDetail as DocDetail } from "../../services/documents/documentsApi";
import type { AttachmentItem } from "../../services/documents/documentAttachmentsApi";
import type { WorkflowTimelineItem } from "../../services/workflows/workflowTrackingApi";

const TRANG_THAI_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Nháp", className: "badge badge--ghost" },
  1: { label: "Đang xử lý", className: "badge badge--info" },
  2: { label: "Đã chuyển xử lý", className: "badge badge--warning" },
  3: { label: "Trình ký", className: "badge badge--primary" },
  4: { label: "Đã ký", className: "badge badge--success" },
  5: { label: "Đã phát hành", className: "badge badge--success" },
};

const formatSize = (bytes?: number) => {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("vi-VN");
};

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState<DocDetail | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [timeline, setTimeline] = useState<WorkflowTimelineItem[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [pendingApproval, setPendingApproval] = useState<PendingApprovalItem | null>(null);
  const [oneDriveUrl, setOneDriveUrl] = useState<string | null>(null);
  const [signatureInfo, setSignatureInfo] = useState<SignatureInfo | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showSigInfoModal, setShowSigInfoModal] = useState(false);
  const [signNote, setSignNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detail, user, attList, tl] = await Promise.all([
          fetchIncomingDetail(Number(id)),
          getCurrentUser(),
          fetchAttachments(Number(id)),
          fetchWorkflowTimeline(Number(id)),
        ]);

        setDoc(detail);
        setAttachments(attList || []);
        setTimeline(tl || []);
        setCurrentUser(user);

        const [pendingResp, editUrlResp, sigResp] = await Promise.all([
          fetchPendingApprovals({ page: 0, size: 100, nguoiDuyetId: user.id }),
          getOneDriveEditUrl(Number(id)).catch(() => ({ data: null })),
          getSignatureInfo(Number(id)).catch(() => ({ data: null })),
        ]);

        const match = (pendingResp.content || []).find(
          (p) => p.documentId === Number(id)
        );
        setPendingApproval(match || null);
        setOneDriveUrl((editUrlResp as { data: string | null }).data ?? null);
        setSignatureInfo((sigResp as { data: SignatureInfo | null }).data ?? null);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải chi tiết văn bản";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!pendingApproval) return;
    if (!window.confirm("Xác nhận phê duyệt văn bản này?")) return;

    setSubmitting(true);
    setActionMsg(null);
    setActionError(null);
    try {
      await approveProcessing(pendingApproval.processingId, { chuyenBuocTiepTheo: true });
      setActionMsg("Phê duyệt thành công!");
      setPendingApproval(null);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Phê duyệt thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!pendingApproval) return;
    if (!rejectReason.trim()) {
      setActionError("Vui lòng nhập lý do từ chối");
      return;
    }
    if (!window.confirm("Xác nhận từ chối văn bản này?")) return;

    setSubmitting(true);
    setActionMsg(null);
    setActionError(null);
    try {
      await rejectProcessing(pendingApproval.processingId, { lyDoTuChoi: rejectReason });
      setActionMsg("Đã từ chối văn bản!");
      setPendingApproval(null);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Từ chối thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSign = async () => {
    if (!currentUser || !id) return;
    setSubmitting(true);
    setActionMsg(null);
    setActionError(null);
    try {
      await signDocument(Number(id), {
        nguoiKyId: currentUser.id,
        signatureType: "LOCAL_HASH_SHA256",
        ghiChu: signNote.trim() || undefined,
      });
      setActionMsg("Ký số thành công!");
      setShowSignModal(false);
      setSignNote("");
      setDoc((prev) => prev ? { ...prev, daKySo: true, trangThai: 4 } : prev);
      // Reload signature info
      getSignatureInfo(Number(id))
        .then((r) => setSignatureInfo((r as { data: SignatureInfo | null }).data ?? null))
        .catch(() => null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Ký số thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const canSign =
    currentUser &&
    (currentUser.roles?.includes("ADMIN") || currentUser.roles?.includes("LANH_DAO")) &&
    !doc?.daKySo;

  const stt = doc ? TRANG_THAI_MAP[doc.trangThai ?? -1] : null;

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Chi tiết văn bản</h1>
          <p>Thông tin đầy đủ, luồng xử lý và tệp đính kèm.</p>
        </div>
      </div>

      {loading && <div className="card">Đang tải...</div>}
      {error && <div className="card" style={{ color: "#ef4444" }}>{error}</div>}
      {actionMsg && <div className="card" style={{ background: "#dcfce7", color: "#16a34a", marginBottom: 12 }}>{actionMsg}</div>}
      {actionError && <div className="card" style={{ background: "#fef2f2", color: "#ef4444", marginBottom: 12 }}>{actionError}</div>}

      {!loading && !error && doc && (
        <div className="grid-2">
          {/* LEFT COLUMN */}
          <div>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h3 style={{ margin: 0 }}>{doc.soKyHieu || `VB-${doc.id}`}</h3>
                  <p style={{ fontWeight: 500, margin: "4px 0 0" }}>{doc.trichYeu}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {doc.daKySo && (
                    <button
                      className="badge badge--success"
                      style={{ cursor: "pointer", border: "none", background: "#dcfce7" }}
                      onClick={() => setShowSigInfoModal(true)}
                      title="Xem thông tin chữ ký số"
                    >
                      Đã ký số
                    </button>
                  )}
                  {oneDriveUrl && (
                    <a
                      href={oneDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button secondary"
                      style={{ fontSize: 13, padding: "4px 12px", textDecoration: "none" }}
                    >
                      Mở trong Word Online
                    </a>
                  )}
                  {canSign && (
                    <button
                      className="button"
                      style={{ fontSize: 13, padding: "4px 12px" }}
                      onClick={() => { setShowSignModal(true); setActionError(null); }}
                    >
                      Ký số
                    </button>
                  )}
                </div>
              </div>
              <hr />
              <table style={{ width: "100%", fontSize: 14 }}>
                <tbody>
                  <tr><td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Loại văn bản</td><td>{doc.tenLoaiVanBan || "-"}</td></tr>
                  <tr><td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Nơi gửi</td><td>{doc.donViBanHanh || "-"}</td></tr>
                  <tr><td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Người ký</td><td>{doc.nguoiKy || "-"}</td></tr>
                  <tr><td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Ngày tiếp nhận</td><td>{formatDate(doc.ngayTiepNhan)}</td></tr>
                  <tr><td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Ngày văn bản</td><td>{formatDate(doc.ngayVanBan)}</td></tr>
                  <tr><td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Độ khẩn</td><td>{doc.doKhan || "-"}</td></tr>
                  <tr><td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Độ mật</td><td>{doc.doMat || "-"}</td></tr>
                  <tr><td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Hạn xử lý</td><td>{formatDate(doc.hanXuLy)}</td></tr>
                  <tr><td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Trạng thái</td><td>{stt ? <span className={stt.className}>{stt.label}</span> : "-"}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Nội dung */}
            <div className="card">
              <h3>Nội dung</h3>
              <p>{doc.trichYeu}</p>
            </div>

            {/* Approve / Reject */}
            {pendingApproval && (
              <div className="card">
                <h3>Phê duyệt</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                  Bạn có văn bản cần phê duyệt
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="button"
                    onClick={handleApprove}
                    disabled={submitting}
                  >
                    {submitting ? "Đang xử lý..." : "Phê duyệt"}
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => { setShowRejectInput(true); setActionError(null); }}
                    disabled={submitting}
                  >
                    Từ chối
                  </button>
                </div>
                {showRejectInput && (
                  <div style={{ marginTop: 12 }}>
                    <textarea
                      className="input"
                      placeholder="Nhập lý do từ chối..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      style={{ width: "100%", marginBottom: 8 }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="button" onClick={handleReject} disabled={submitting}>Xác nhận từ chối</button>
                      <button className="button secondary" onClick={() => { setShowRejectInput(false); setRejectReason(""); setActionError(null); }}>Hủy</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* File attachments */}
            <div className="card">
              <h3>Tệp đính kèm</h3>
              {attachments.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Không có tệp đính kèm.</p>
              ) : (
                <table className="table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Tên tệp</th>
                      <th style={{ whiteSpace: "nowrap" }}>Kích thước</th>
                      <th style={{ whiteSpace: "nowrap" }}>Tải xuống</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachments.map((f) => (
                      <tr key={f.id}>
                        <td style={{ fontSize: 13 }}>{f.tenTep}</td>
                        <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>{formatSize(f.kichThuoc)}</td>
                        <td>
                          <button
                            className="button secondary"
                            style={{ fontSize: 12, padding: "4px 10px" }}
                            onClick={() => triggerDownload(f.id, f.tenTep)}
                          >
                            Tải xuống
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Workflow timeline */}
            <div className="card">
              <h3>Lịch sử xử lý</h3>
              {timeline.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Chưa có dữ liệu xử lý.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {timeline.map((item, idx) => (
                    <li
                      key={item.processingId || idx}
                      style={{
                        padding: "8px 0",
                        borderBottom: idx < timeline.length - 1 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <span style={{ fontWeight: 500 }}>{item.tenBuoc}</span>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {item.hanhDongXuLy || "-"}
                          </div>
                          {item.yKienXuLy && (
                            <div style={{ fontSize: 12, fontStyle: "italic", marginTop: 2 }}>
                              "{item.yKienXuLy}"
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: "right", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                          <div>{item.ngayNhan ? formatDate(item.ngayNhan) : "-"}</div>
                          {item.nguoiXuLy && <div>{item.nguoiXuLy}</div>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Digital sign confirmation modal */}
      {showSignModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: 420, width: "100%", margin: 16 }}>
            <h3 style={{ marginTop: 0 }}>Xác nhận ký số</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Chữ ký số sẽ được ghi nhận kèm theo hash SHA-256 của tệp đính kèm đầu tiên.
            </p>
            <label style={{ fontSize: 13, fontWeight: 500 }}>Ghi chú (tùy chọn)</label>
            <textarea
              className="input"
              placeholder="Nhập ghi chú..."
              value={signNote}
              onChange={(e) => setSignNote(e.target.value)}
              rows={3}
              style={{ width: "100%", margin: "6px 0 12px" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="button" onClick={handleSign} disabled={submitting}>
                {submitting ? "Đang ký..." : "Xác nhận ký số"}
              </button>
              <button
                className="button secondary"
                onClick={() => { setShowSignModal(false); setSignNote(""); setActionError(null); }}
                disabled={submitting}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature info modal */}
      {showSigInfoModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: 480, width: "100%", margin: 16 }}>
            <h3 style={{ marginTop: 0 }}>Thông tin chữ ký số</h3>
            {signatureInfo ? (
              <table style={{ width: "100%", fontSize: 14 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Người ký</td>
                    <td>{signatureInfo.nguoiKyId ?? "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Thời gian ký</td>
                    <td>{formatDateTime(signatureInfo.ngayKy)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Loại ký</td>
                    <td>{signatureInfo.loaiKy || "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Ghi chú</td>
                    <td>{signatureInfo.ghiChu || "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Hash file</td>
                    <td style={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: 12 }}>
                      {signatureInfo.hashFile || "Không có tệp đính kèm"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 8px 4px 0", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Chứng chỉ</td>
                    <td>{signatureInfo.certInfo || "-"}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>Không có thông tin chữ ký.</p>
            )}
            <div style={{ marginTop: 16 }}>
              <button className="button secondary" onClick={() => setShowSigInfoModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
