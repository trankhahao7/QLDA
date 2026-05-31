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
  signDocument, getOneDriveEditUrl, getSignatureInfo, type SignatureInfo,
} from "../../services/documents/documentsPublishApi";
import type { DocumentDetail as DocDetail } from "../../services/documents/documentsApi";
import type { AttachmentItem } from "../../services/documents/documentAttachmentsApi";
import type { WorkflowTimelineItem } from "../../services/workflows/workflowTrackingApi";
import { summarizeDocument } from "../../services/ai/userSummaryApi";
import { generateHandlingSuggestion } from "../../services/ai/suggestionsApi";
import { fetchAiResultsByDocument, deleteAiResult, type AiResultItem } from "../../services/ai/aiResultsApi";
import { uploadOcrFile, processOcr, saveOcrResult } from "../../services/ai/ocrApi";

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

const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "-";
const formatDateTime = (dateStr?: string | null) => dateStr ? new Date(dateStr).toLocaleString("vi-VN") : "-";

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

  // AI panel state
  const [aiResults, setAiResults] = useState<AiResultItem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMsg, setAiMsg] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  // OCR state
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadDetail = async () => {
      setLoading(true); setError(null);
      try {
        const [detail, user, attList, tl] = await Promise.all([
          fetchIncomingDetail(Number(id)), getCurrentUser(),
          fetchAttachments(Number(id)), fetchWorkflowTimeline(Number(id)),
        ]);
        setDoc(detail); setAttachments(attList || []); setTimeline(tl || []); setCurrentUser(user);

        const [pendingResp, editUrlResp, sigResp] = await Promise.all([
          fetchPendingApprovals({ page: 0, size: 100, nguoiDuyetId: user.id }),
          getOneDriveEditUrl(Number(id)).catch(() => ({ data: null })),
          getSignatureInfo(Number(id)).catch(() => ({ data: null })),
        ]);
        const match = (pendingResp.content || []).find((p) => p.documentId === Number(id));
        setPendingApproval(match || null);
        setOneDriveUrl((editUrlResp as { data: string | null }).data ?? null);
        setSignatureInfo((sigResp as { data: SignatureInfo | null }).data ?? null);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Không thể tải chi tiết văn bản");
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!pendingApproval) return;
    if (!window.confirm("Xác nhận phê duyệt văn bản này?")) return;
    setSubmitting(true); setActionMsg(null); setActionError(null);
    try {
      await approveProcessing(pendingApproval.processingId, { chuyenBuocTiepTheo: true });
      setActionMsg("Phê duyệt thành công!");
      setPendingApproval(null);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Phê duyệt thất bại");
    } finally { setSubmitting(false); }
  };

  const handleReject = async () => {
    if (!pendingApproval) return;
    if (!rejectReason.trim()) { setActionError("Vui lòng nhập lý do từ chối"); return; }
    if (!window.confirm("Xác nhận từ chối văn bản này?")) return;
    setSubmitting(true); setActionMsg(null); setActionError(null);
    try {
      await rejectProcessing(pendingApproval.processingId, { lyDoTuChoi: rejectReason });
      setActionMsg("Đã từ chối văn bản!");
      setPendingApproval(null);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Từ chối thất bại");
    } finally { setSubmitting(false); }
  };

  const handleSign = async () => {
    if (!currentUser || !id) return;
    setSubmitting(true); setActionMsg(null); setActionError(null);
    try {
      await signDocument(Number(id), {
        nguoiKyId: currentUser.id,
        signatureType: "LOCAL_HASH_SHA256",
        ghiChu: signNote.trim() || undefined,
      });
      setActionMsg("Ký số thành công!");
      setShowSignModal(false); setSignNote("");
      setDoc((prev) => prev ? { ...prev, daKySo: true, trangThai: 4 } : prev);
      getSignatureInfo(Number(id))
        .then((r) => setSignatureInfo((r as { data: SignatureInfo | null }).data ?? null))
        .catch(() => null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Ký số thất bại");
    } finally { setSubmitting(false); }
  };

  const canSign =
    currentUser &&
    (currentUser.roles?.includes("ADMIN") || currentUser.roles?.includes("LANH_DAO")) &&
    !doc?.daKySo;

  const stt = doc ? TRANG_THAI_MAP[doc.trangThai ?? -1] : null;

  const loadAiResults = async (docId: number) => {
    try {
      const items = await fetchAiResultsByDocument(docId);
      setAiResults(items || []);
    } catch { /* ignore */ }
  };

  const handleAiSummarize = async () => {
    if (!doc || !id) return;
    setAiLoading(true); setAiMsg(null);
    try {
      const res = await summarizeDocument({ documentId: doc.id, text: doc.trichYeu, summaryType: "SHORT", language: "vi" });
      setAiMsg(`Tóm tắt: ${res.summary}`);
      loadAiResults(doc.id);
    } catch (err) {
      setAiMsg(err instanceof ApiError ? err.message : "Tóm tắt thất bại");
    } finally { setAiLoading(false); }
  };

  const handleAiSuggest = async () => {
    if (!doc) return;
    setAiLoading(true); setAiMsg(null);
    try {
      const res = await generateHandlingSuggestion({
        documentId: doc.id, text: doc.trichYeu,
        context: { doKhan: doc.doKhan },
      });
      const list = res.suggestions?.map((s) => `• ${s.action}: ${s.description}`).join("\n") ?? "Không có gợi ý.";
      setAiMsg(list);
      loadAiResults(doc.id);
    } catch (err) {
      setAiMsg(err instanceof ApiError ? err.message : "Gợi ý thất bại");
    } finally { setAiLoading(false); }
  };

  const handleDeleteAiResult = async (resultId: number) => {
    if (!doc) return;
    try {
      await deleteAiResult(resultId);
      setAiResults((prev) => prev.filter((r) => r.id !== resultId));
    } catch { /* ignore */ }
  };

  const handleOcrProcess = async () => {
    if (!ocrFile || !doc) return;
    setOcrProcessing(true); setOcrText(null);
    try {
      const uploadRes = await uploadOcrFile(doc.id, ocrFile);
      const processRes = await processOcr(doc.id, { fileUrl: uploadRes.fileUrl, language: "vi" });
      setOcrText(processRes.ocrText);
      await saveOcrResult(doc.id, { ocrText: processRes.ocrText, confidence: processRes.confidence });
    } catch (err) {
      setOcrText(err instanceof ApiError ? `Lỗi: ${err.message}` : "OCR thất bại");
    } finally { setOcrProcessing(false); }
  };

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Chi tiết văn bản</h1>
          <p>Thông tin đầy đủ, luồng xử lý và tệp đính kèm.</p>
        </div>
      </div>

      {actionMsg && <div className="alert alert--success" style={{ marginBottom: 16 }}>{actionMsg}</div>}
      {actionError && <div className="alert alert--error" style={{ marginBottom: 16 }}>{actionError}</div>}

      {loading && (
        <div className="card">
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Đang tải chi tiết văn bản...</p>
          </div>
        </div>
      )}
      {error && <div className="alert alert--error">{error}</div>}

      {!loading && !error && doc && (
        <div className="grid-2">
          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 18, marginBottom: 6 }}>{doc.soKyHieu || `VB-${doc.id}`}</h2>
                  <p style={{ fontWeight: 500, color: "var(--text)", fontSize: 14 }}>{doc.trichYeu}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
                  {doc.daKySo && (
                    <button
                      className="badge badge--success"
                      style={{ cursor: "pointer", border: "none" }}
                      onClick={() => setShowSigInfoModal(true)}
                    >
                      ✍️ Đã ký số
                    </button>
                  )}
                  {doc.aiPhanLoai && (
                    <span
                      className="badge badge--info"
                      title={doc.aiConfidence != null ? `Độ tin cậy: ${Math.round(doc.aiConfidence * 100)}%` : "AI gợi ý phân loại"}
                    >
                      🤖 AI: {doc.aiPhanLoai}
                      {doc.aiConfidence != null && (
                        <span style={{ opacity: 0.75, fontSize: 11, marginLeft: 3 }}>
                          ({Math.round(doc.aiConfidence * 100)}%)
                        </span>
                      )}
                    </span>
                  )}
                  {oneDriveUrl && (
                    <a href={oneDriveUrl} target="_blank" rel="noopener noreferrer" className="btn-xs btn-xs--ghost">
                      📝 Word Online
                    </a>
                  )}
                  {canSign && (
                    <button className="button" style={{ fontSize: 13, padding: "6px 14px" }}
                      onClick={() => { setShowSignModal(true); setActionError(null); }}>
                      ✍️ Ký số
                    </button>
                  )}
                </div>
              </div>

              <table className="doc-meta-table">
                <tbody>
                  {[
                    { label: "Loại văn bản", value: doc.tenLoaiVanBan || "-" },
                    { label: "Nơi gửi", value: doc.donViBanHanh || "-" },
                    { label: "Người ký", value: doc.nguoiKy || "-" },
                    { label: "Ngày tiếp nhận", value: formatDate(doc.ngayTiepNhan) },
                    { label: "Ngày văn bản", value: formatDate(doc.ngayVanBan) },
                    { label: "Độ khẩn", value: doc.doKhan || "-" },
                    { label: "Độ mật", value: doc.doMat || "-" },
                    { label: "Hạn xử lý", value: formatDate(doc.hanXuLy) },
                    { label: "Trạng thái", value: stt ? <span className={stt.className}>{stt.label}</span> : "-" },
                  ].map(({ label, value }) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pendingApproval && (
              <div className="card">
                <h3>Phê duyệt</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                  Văn bản này đang chờ phê duyệt của bạn.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="button" onClick={handleApprove} disabled={submitting}>
                    {submitting ? "Đang xử lý..." : "✅ Phê duyệt"}
                  </button>
                  <button className="button secondary" onClick={() => { setShowRejectInput(true); setActionError(null); }} disabled={submitting}>
                    🚫 Từ chối
                  </button>
                </div>
                {showRejectInput && (
                  <div style={{ marginTop: 14 }}>
                    <textarea
                      className="form-control"
                      placeholder="Nhập lý do từ chối..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      style={{ marginBottom: 10 }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="button danger" onClick={handleReject} disabled={submitting}>Xác nhận từ chối</button>
                      <button className="button secondary" onClick={() => { setShowRejectInput(false); setRejectReason(""); setActionError(null); }}>Hủy</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* AI PANEL */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>🤖 Phân tích AI</h3>
                <button
                  className="btn-xs btn-xs--ghost"
                  onClick={() => {
                    setShowAiPanel((p) => !p);
                    if (!showAiPanel && doc) loadAiResults(doc.id);
                  }}
                >
                  {showAiPanel ? "Thu gọn" : "Mở rộng"}
                </button>
              </div>
              {showAiPanel && (
                <>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    <button className="btn-xs btn-xs--primary" onClick={handleAiSummarize} disabled={aiLoading}>
                      {aiLoading ? "..." : "📝 Tóm tắt"}
                    </button>
                    <button className="btn-xs btn-xs--primary" onClick={handleAiSuggest} disabled={aiLoading}>
                      {aiLoading ? "..." : "💡 Gợi ý xử lý"}
                    </button>
                  </div>
                  {aiMsg && (
                    <div className="alert alert--info" style={{ marginBottom: 12, whiteSpace: "pre-line", fontSize: 13 }}>
                      {aiMsg}
                    </div>
                  )}
                  {aiResults.length > 0 && (
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                        Lịch sử AI ({aiResults.length})
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {aiResults.map((r) => (
                          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "6px 8px", background: "var(--surface-subtle, #f9fafb)", borderRadius: 6, fontSize: 12 }}>
                            <div>
                              <span className="badge badge--ghost" style={{ marginRight: 6 }}>{r.loaiXuLyAI}</span>
                              <span style={{ color: "var(--text-muted)" }}>
                                {r.doTinCay != null && `${Math.round(r.doTinCay * 100)}%`}
                              </span>
                            </div>
                            <button className="btn-xs" onClick={() => handleDeleteAiResult(r.id)} style={{ color: "#ef4444", fontSize: 11 }}>
                              Xóa
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* OCR Section */}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📷 OCR văn bản</p>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.tiff"
                      onChange={(e) => setOcrFile(e.target.files?.[0] || null)}
                      style={{ fontSize: 12, marginBottom: 8, display: "block" }}
                    />
                    {ocrFile && (
                      <button
                        className="btn-xs btn-xs--primary"
                        onClick={handleOcrProcess}
                        disabled={ocrProcessing}
                        style={{ marginBottom: 8 }}
                      >
                        {ocrProcessing ? "Đang xử lý..." : "Nhận dạng văn bản"}
                      </button>
                    )}
                    {ocrText && (
                      <textarea
                        readOnly
                        value={ocrText}
                        rows={4}
                        style={{ width: "100%", fontSize: 12, resize: "vertical", padding: 6 }}
                      />
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="card">
              <h3>Tệp đính kèm</h3>
              {attachments.length === 0 ? (
                <div className="empty-state" style={{ padding: "24px 0" }}>
                  <div className="empty-state__icon">📂</div>
                  <p>Không có tệp đính kèm.</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên tệp</th><th>Kích thước</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachments.map((f) => (
                      <tr key={f.id}>
                        <td style={{ fontSize: 13 }}>📄 {f.tenTep}</td>
                        <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>{formatSize(f.kichThuoc)}</td>
                        <td>
                          <button className="btn-xs btn-xs--primary" onClick={() => triggerDownload(f.id, f.tenTep)}>
                            Tải xuống
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card">
              <h3>Lịch sử xử lý</h3>
              {timeline.length === 0 ? (
                <div className="empty-state" style={{ padding: "24px 0" }}>
                  <div className="empty-state__icon">📋</div>
                  <p>Chưa có dữ liệu xử lý.</p>
                </div>
              ) : (
                <div className="timeline">
                  {timeline.map((item, idx) => (
                    <div key={item.processingId || idx} className="timeline-item">
                      <div className={`timeline-dot ${item.hanhDongXuLy ? "timeline-dot--done" : "timeline-dot--active"}`}>
                        {item.hanhDongXuLy ? "✓" : "●"}
                      </div>
                      <div className="timeline-content">
                        <h4>{item.tenBuoc}</h4>
                        <p>{item.hanhDongXuLy || "Đang xử lý"}</p>
                        {item.yKienXuLy && (
                          <p style={{ fontStyle: "italic", marginTop: 2, fontSize: 12 }}>"{item.yKienXuLy}"</p>
                        )}
                        <p style={{ marginTop: 4 }}>
                          {item.ngayNhan ? formatDate(item.ngayNhan) : ""}
                          {item.nguoiXuLy && ` · ${item.nguoiXuLy}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSignModal && (
        <div className="modal-overlay" onClick={() => { setShowSignModal(false); setSignNote(""); setActionError(null); }}>
          <div className="modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✍️ Xác nhận ký số</h3>
              <button className="modal-close" onClick={() => { setShowSignModal(false); setSignNote(""); }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert--info">
                Chữ ký số sẽ được ghi nhận kèm theo hash SHA-256 của tệp đính kèm đầu tiên.
              </div>
              <div className="form-field">
                <label className="form-label">Ghi chú (tùy chọn)</label>
                <textarea className="form-control" placeholder="Nhập ghi chú..." rows={3}
                  value={signNote} onChange={(e) => setSignNote(e.target.value)} />
              </div>
              {actionError && <div className="alert alert--error">{actionError}</div>}
            </div>
            <div className="modal-footer">
              <button className="button secondary" onClick={() => { setShowSignModal(false); setSignNote(""); setActionError(null); }} disabled={submitting}>
                Hủy
              </button>
              <button className="button" onClick={handleSign} disabled={submitting}>
                {submitting ? "Đang ký..." : "Xác nhận ký số"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSigInfoModal && (
        <div className="modal-overlay" onClick={() => setShowSigInfoModal(false)}>
          <div className="modal-card" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✍️ Thông tin chữ ký số</h3>
              <button className="modal-close" onClick={() => setShowSigInfoModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {signatureInfo ? (
                <table className="doc-meta-table">
                  <tbody>
                    <tr><td>Người ký</td><td>{signatureInfo.nguoiKyId ?? "-"}</td></tr>
                    <tr><td>Thời gian ký</td><td>{formatDateTime(signatureInfo.ngayKy)}</td></tr>
                    <tr><td>Loại ký</td><td>{signatureInfo.loaiKy || "-"}</td></tr>
                    <tr><td>Ghi chú</td><td>{signatureInfo.ghiChu || "-"}</td></tr>
                    <tr>
                      <td>Hash file</td>
                      <td style={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: 12 }}>
                        {signatureInfo.hashFile || "Không có tệp đính kèm"}
                      </td>
                    </tr>
                    <tr><td>Chứng chỉ</td><td>{signatureInfo.certInfo || "-"}</td></tr>
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "var(--text-muted)" }}>Không có thông tin chữ ký.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="button secondary" onClick={() => setShowSigInfoModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
