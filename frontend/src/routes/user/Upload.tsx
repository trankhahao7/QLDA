import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { fetchDocumentTypes } from "../../services/documents/documentTypesApi";
import { fetchUnits } from "../../services/units/unitsApi";
import { fetchUsers } from "../../services/auth/usersApi";
import { fetchWorkflows, fetchWorkflowDetail } from "../../services/workflows/workflowsApi";
import { getCurrentUser } from "../../services/auth/authApi";
import type { AuthUser } from "../../services/auth/authApi";
import type { UnitItem } from "../../services/units/unitsApi";
import type { UserItem } from "../../services/auth/usersApi";
import { createIncomingDocument, uploadAttachment } from "../../services/documents/documentsApi";

const DO_MAT_OPTIONS = [
  { value: "CONG_KHAI", label: "Công khai" },
  { value: "NOI_BO", label: "Nội bộ" },
  { value: "MAT", label: "Mật" },
  { value: "TOI_MAT", label: "Tối mật" },
  { value: "TUYET_MAT", label: "Tuyệt mật" },
];

const DO_KHAN_OPTIONS = [
  { value: "BINH_THUONG", label: "Bình thường" },
  { value: "KHAN", label: "Khẩn" },
  { value: "THUONG_KHAN", label: "Thượng khẩn" },
  { value: "HOA_TOC", label: "Hỏa tốc" },
];

interface UploadForm {
  soKyHieu: string;
  trichYeu: string;
  loaiVanBanId: string;
  ngayVanBan: string;
  ngayTiepNhan: string;
  donViBanHanhId: string;
  donViChuTriId: string;
  nguoiKy: string;
  doMat: string;
  doKhan: string;
  hanXuLy: string;
}

export default function Upload() {
  const [documentTypes, setDocumentTypes] = useState<Array<{ id: number; maLoaiVanBan: string; tenLoaiVanBan: string }>>([]);
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [workflowSuggestion, setWorkflowSuggestion] = useState<{ tenQuyTrinh: string; steps: string[] } | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [form, setForm] = useState<UploadForm>({
    soKyHieu: "",
    trichYeu: "",
    loaiVanBanId: "",
    ngayVanBan: new Date().toISOString().split("T")[0],
    ngayTiepNhan: new Date().toISOString().split("T")[0],
    donViBanHanhId: "",
    donViChuTriId: "",
    nguoiKy: "",
    doMat: "CONG_KHAI",
    doKhan: "BINH_THUONG",
    hanXuLy: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  console.log("[Upload] Form state:", JSON.stringify(form));
  console.log("[Upload] File selected:", file?.name ?? "none");

  useEffect(() => {
    const load = async () => {
      console.log("[Upload] ===== LOAD INITIAL DATA =====");
      try {
        const types = await fetchDocumentTypes({});
        console.log("[Upload] Document types:", types?.length);
        setDocumentTypes(types || []);
      } catch (e) { console.error("[Upload] Failed to load document types:", e); }

      try {
        const u = await fetchUnits({ size: 100 });
        console.log("[Upload] Units:", u?.content?.length);
        setUnits(u?.content || []);
      } catch (e) { console.error("[Upload] Failed to load units:", e); }

      try {
        const u = await fetchUsers({ size: 100 });
        console.log("[Upload] Users:", u?.content?.length);
        setUsers(u?.content || []);
      } catch (e) { console.error("[Upload] Failed to load users:", e); }

      try {
        const me = await getCurrentUser();
        console.log("[Upload] Current user:", me?.hoTen, `(id=${me?.id})`);
        setCurrentUser(me);
      } catch (e) { console.error("[Upload] Failed to load current user:", e); }

      console.log("[Upload] ===== INIT DATA LOADED =====");
    };
    load();
  }, []);

  const selectedLoaiVanBan = useMemo(
    () => documentTypes.find((t) => String(t.id) === form.loaiVanBanId),
    [documentTypes, form.loaiVanBanId]
  );

  useEffect(() => {
    const load = async () => {
      const loaiVanBanId = parseInt(form.loaiVanBanId, 10);
      if (isNaN(loaiVanBanId)) {
        setWorkflowSuggestion(null);
        console.log("[Upload] No loaiVanBanId selected, clear workflow");
        return;
      }
      console.log("[Upload] Fetch workflow for loaiVanBanId:", loaiVanBanId);
      try {
        const list = await fetchWorkflows({ loaiVanBanId, suDung: true });
        if (list?.content?.length) {
          const wf = list.content[0];
          const detail = await fetchWorkflowDetail(wf.id);
          const sorted = [...(detail.steps || [])].sort((a, b) => a.thuTuBuoc - b.thuTuBuoc);
          setWorkflowSuggestion({
            tenQuyTrinh: detail.tenQuyTrinh,
            steps: sorted.map((s) => s.tenBuoc),
          });
          console.log("[Upload] Workflow found:", detail.tenQuyTrinh, "steps:", sorted.length);
        } else {
          setWorkflowSuggestion(null);
          console.log("[Upload] No workflow for this document type");
        }
      } catch (e) { console.error("[Upload] Failed to load workflow:", e); }
    };
    load();
  }, [form.loaiVanBanId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    console.log("[Upload] ===== SUBMIT START =====");
    console.log("[Upload] Form:", JSON.stringify(form));
    console.log("[Upload] File:", file?.name, `(${(file?.size ?? 0) / 1024} KB)`);

    try {
      const loaiVanBanId = parseInt(form.loaiVanBanId, 10);
      if (isNaN(loaiVanBanId)) throw new ApiError("Chưa chọn loại văn bản", 400);

      const donViBH = units.find((u) => String(u.id) === form.donViBanHanhId);
      const donViCT = form.donViChuTriId ? parseInt(form.donViChuTriId, 10) : undefined;

      const payload = {
        soKyHieu: form.soKyHieu || undefined,
        trichYeu: form.trichYeu,
        loaiVanBanId,
        donViBanHanh: donViBH?.tenDonVi ?? undefined,
        nguoiKy: form.nguoiKy || undefined,
        ngayVanBan: form.ngayVanBan || undefined,
        ngayTiepNhan: form.ngayTiepNhan || undefined,
        doMat: form.doMat,
        doKhan: form.doKhan,
        donViChuTriId: donViCT,
        hanXuLy: form.hanXuLy ? `${form.hanXuLy}T00:00:00` : undefined,
      };

      console.log("[Upload] Step 1 — POST /api/documents/incoming", JSON.stringify(payload));

      const created = await createIncomingDocument(payload);
      console.log("[Upload] Step 1 OK — documentId:", created.id);

      if (file) {
        console.log("[Upload] Step 2 — POST /api/documents/" + created.id + "/attachments (file:", file.name, ")");
        const attachment = await uploadAttachment(created.id, file);
        console.log("[Upload] Step 2 OK — attachmentId:", attachment.id, "path:", attachment.duongDanTep);
      } else {
        console.log("[Upload] Step 2 — skip (no file)");
      }

      console.log("[Upload] ===== SUBMIT SUCCESS =====");
      setMessage({ type: "success", text: "Tải lên thành công!" });
      setForm({
        soKyHieu: "",
        trichYeu: "",
        loaiVanBanId: "",
        ngayVanBan: new Date().toISOString().split("T")[0],
        ngayTiepNhan: new Date().toISOString().split("T")[0],
        donViBanHanhId: "",
        donViChuTriId: "",
        nguoiKy: "",
        doMat: "CONG_KHAI",
        doKhan: "BINH_THUONG",
        hanXuLy: "",
      });
      setFile(null);
    } catch (err) {
      console.error("[Upload] ===== SUBMIT FAILED =====");
      if (err instanceof ApiError) {
        console.error("[Upload] ApiError:", err.status, err.message, err.errorCode);
      } else {
        console.error("[Upload] Error:", err);
      }
      const msg = err instanceof ApiError ? err.message : "Tải lên thất bại";
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
      console.log("[Upload] Loading false");
    }
  };

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Tải lên văn bản</h1>
          <p>Đăng ký văn bản đến mới và gán luồng xử lý.</p>
        </div>
        <div className="topbar__actions">
          <button className="button" type="submit" form="upload-form" disabled={loading}>
            {loading ? "Đang xử lý..." : "Gửi vào luồng"}
          </button>
          <button className="button secondary" type="button" disabled={loading}>
            Lưu nháp
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* LEFT — Thông tin văn bản */}
        <div className="card">
          <h3>Thông tin văn bản</h3>
          <form id="upload-form" className="form-grid" onSubmit={handleSubmit}>
            <label>
              Số ký hiệu
              <input
                placeholder="VD: 123/UBND-VP"
                value={form.soKyHieu}
                onChange={(e) => setForm({ ...form, soKyHieu: e.target.value })}
              />
            </label>

            <label>
              Trích yếu nội dung
              <input
                placeholder="Nhập trích yếu văn bản"
                value={form.trichYeu}
                onChange={(e) => setForm({ ...form, trichYeu: e.target.value })}
                required
              />
            </label>

            <label>
              Loại văn bản
              <select
                value={form.loaiVanBanId}
                onChange={(e) => setForm({ ...form, loaiVanBanId: e.target.value })}
                required
              >
                <option value="">-- Chọn loại văn bản --</option>
                {documentTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.tenLoaiVanBan}</option>
                ))}
              </select>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <label>
                Ngày văn bản
                <input type="date" value={form.ngayVanBan}
                  onChange={(e) => setForm({ ...form, ngayVanBan: e.target.value })} />
              </label>
              <label>
                Ngày tiếp nhận
                <input type="date" value={form.ngayTiepNhan}
                  onChange={(e) => setForm({ ...form, ngayTiepNhan: e.target.value })} />
              </label>
            </div>

            <label>
              Đơn vị ban hành
              <select value={form.donViBanHanhId}
                onChange={(e) => setForm({ ...form, donViBanHanhId: e.target.value })}>
                <option value="">-- Chọn đơn vị --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.tenDonVi}</option>
                ))}
              </select>
            </label>

            <label>
              Đơn vị chủ trì
              <select value={form.donViChuTriId}
                onChange={(e) => setForm({ ...form, donViChuTriId: e.target.value })}>
                <option value="">-- Chọn đơn vị --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.tenDonVi}</option>
                ))}
              </select>
            </label>

            <label>
              Người ký
              <select value={form.nguoiKy}
                onChange={(e) => setForm({ ...form, nguoiKy: e.target.value })}>
                <option value="">-- Chọn người ký --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.hoTen}>{u.hoTen}</option>
                ))}
              </select>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <label>
                Độ mật
                <select value={form.doMat}
                  onChange={(e) => setForm({ ...form, doMat: e.target.value })}>
                  {DO_MAT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Độ khẩn
                <select value={form.doKhan}
                  onChange={(e) => setForm({ ...form, doKhan: e.target.value })}>
                  {DO_KHAN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Hạn xử lý
              <input type="date" value={form.hanXuLy}
                onChange={(e) => setForm({ ...form, hanXuLy: e.target.value })} />
            </label>

            {message && (
              <div style={{
                padding: 10, borderRadius: 6,
                background: message.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                color: message.type === "success" ? "#22c55e" : "#ef4444",
              }}>
                {message.text}
              </div>
            )}
          </form>
        </div>

        {/* RIGHT — Tập tin đính kèm + Luồng xử lý */}
        <div className="card">
          <h3>Tập tin đính kèm</h3>
          <div className="form-grid">
            <label>
              File văn bản
              <input type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  console.log("[Upload] File selected:", f?.name, `(${(f?.size ?? 0) / 1024} KB)`);
                  setFile(f);
                }} />
            </label>
            {file && (
              <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                <strong>Đã chọn:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />

            <div className="card soft">
              <strong>Luồng xử lý đề xuất</strong>
              {workflowSuggestion ? (
                <>
                  <p style={{ marginTop: 8, fontWeight: 600 }}>{workflowSuggestion.tenQuyTrinh}</p>
                  <ol style={{ marginTop: 8, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                    {workflowSuggestion.steps.map((step, i) => (
                      <li key={i} style={{ fontSize: 13 }}>{step}</li>
                    ))}
                  </ol>
                </>
              ) : (
                <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 13 }}>
                  {selectedLoaiVanBan ? "Không có luồng xử lý phù hợp" : "Chọn loại văn bản để xem luồng xử lý đề xuất"}
                </p>
              )}
            </div>

            {currentUser && (
              <div className="card soft">
                <strong>Người tạo</strong>
                <p style={{ marginTop: 4, fontSize: 13 }}>
                  {currentUser.hoTen} — {currentUser.email}
                  {currentUser.donViId && <> (Đơn vị ID: {currentUser.donViId})</>}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
