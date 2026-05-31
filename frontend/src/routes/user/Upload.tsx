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
  soKyHieu: string; trichYeu: string; loaiVanBanId: string;
  ngayVanBan: string; ngayTiepNhan: string; donViBanHanhId: string;
  donViChuTriId: string; nguoiKy: string; doMat: string; doKhan: string; hanXuLy: string;
}

const INITIAL_FORM: UploadForm = {
  soKyHieu: "", trichYeu: "", loaiVanBanId: "",
  ngayVanBan: new Date().toISOString().split("T")[0],
  ngayTiepNhan: new Date().toISOString().split("T")[0],
  donViBanHanhId: "", donViChuTriId: "", nguoiKy: "",
  doMat: "CONG_KHAI", doKhan: "BINH_THUONG", hanXuLy: "",
};

export default function Upload() {
  const [documentTypes, setDocumentTypes] = useState<Array<{ id: number; maLoaiVanBan: string; tenLoaiVanBan: string }>>([]);
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [workflowSuggestion, setWorkflowSuggestion] = useState<{ tenQuyTrinh: string; steps: string[] } | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [form, setForm] = useState<UploadForm>(INITIAL_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [types, u, usr, me] = await Promise.all([
          fetchDocumentTypes({}),
          fetchUnits({ size: 100 }),
          fetchUsers({ size: 100 }),
          getCurrentUser(),
        ]);
        setDocumentTypes(types || []);
        setUnits(u?.content || []);
        setUsers(usr?.content || []);
        setCurrentUser(me);
      } catch (e) {
        // silently ignore init failures
      }
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
      if (isNaN(loaiVanBanId)) { setWorkflowSuggestion(null); return; }
      try {
        const list = await fetchWorkflows({ loaiVanBanId, suDung: true });
        if (list?.content?.length) {
          const wf = list.content[0];
          const detail = await fetchWorkflowDetail(wf.id);
          const sorted = [...(detail.steps || [])].sort((a, b) => a.thuTuBuoc - b.thuTuBuoc);
          setWorkflowSuggestion({ tenQuyTrinh: detail.tenQuyTrinh, steps: sorted.map((s) => s.tenBuoc) });
        } else {
          setWorkflowSuggestion(null);
        }
      } catch (e) { /* silently ignore */ }
    };
    load();
  }, [form.loaiVanBanId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const loaiVanBanId = parseInt(form.loaiVanBanId, 10);
      if (isNaN(loaiVanBanId)) throw new ApiError("Chưa chọn loại văn bản", 400);

      const donViBH = units.find((u) => String(u.id) === form.donViBanHanhId);
      const donViCT = form.donViChuTriId ? parseInt(form.donViChuTriId, 10) : undefined;

      const created = await createIncomingDocument({
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
      });

      if (file) await uploadAttachment(created.id, file);

      setMessage({ type: "success", text: "Tải lên thành công! Văn bản đã được đưa vào luồng xử lý." });
      setForm(INITIAL_FORM);
      setFile(null);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Tải lên thất bại" });
    } finally {
      setLoading(false);
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
          <button className="button secondary" type="button" disabled={loading}>Lưu nháp</button>
          <button className="button" type="submit" form="upload-form" disabled={loading}>
            {loading ? "Đang xử lý..." : "Gửi vào luồng"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert alert--${message.type === "success" ? "success" : "error"}`} style={{ marginBottom: 16 }}>
          {message.text}
        </div>
      )}

      <div className="grid-2">
        {/* LEFT — Thông tin văn bản */}
        <div className="card">
          <form id="upload-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-section__title">Thông tin cơ bản</div>

              <div className="form-field">
                <label className="form-label">Trích yếu nội dung <span>*</span></label>
                <input className="form-control" placeholder="Nhập trích yếu văn bản" required
                  value={form.trichYeu} onChange={(e) => setForm({ ...form, trichYeu: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Số ký hiệu</label>
                  <input className="form-control" placeholder="VD: 123/UBND-VP"
                    value={form.soKyHieu} onChange={(e) => setForm({ ...form, soKyHieu: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Loại văn bản <span>*</span></label>
                  <select className="form-control" required value={form.loaiVanBanId}
                    onChange={(e) => setForm({ ...form, loaiVanBanId: e.target.value })}>
                    <option value="">-- Chọn loại văn bản --</option>
                    {documentTypes.map((t) => <option key={t.id} value={t.id}>{t.tenLoaiVanBan}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Ngày văn bản</label>
                  <input type="date" className="form-control" value={form.ngayVanBan}
                    onChange={(e) => setForm({ ...form, ngayVanBan: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Ngày tiếp nhận</label>
                  <input type="date" className="form-control" value={form.ngayTiepNhan}
                    onChange={(e) => setForm({ ...form, ngayTiepNhan: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section__title">Đơn vị & Người ký</div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Đơn vị ban hành</label>
                  <select className="form-control" value={form.donViBanHanhId}
                    onChange={(e) => setForm({ ...form, donViBanHanhId: e.target.value })}>
                    <option value="">-- Chọn đơn vị --</option>
                    {units.map((u) => <option key={u.id} value={u.id}>{u.tenDonVi}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Đơn vị chủ trì</label>
                  <select className="form-control" value={form.donViChuTriId}
                    onChange={(e) => setForm({ ...form, donViChuTriId: e.target.value })}>
                    <option value="">-- Chọn đơn vị --</option>
                    {units.map((u) => <option key={u.id} value={u.id}>{u.tenDonVi}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Người ký</label>
                <select className="form-control" value={form.nguoiKy}
                  onChange={(e) => setForm({ ...form, nguoiKy: e.target.value })}>
                  <option value="">-- Chọn người ký --</option>
                  {users.map((u) => <option key={u.id} value={u.hoTen}>{u.hoTen}</option>)}
                </select>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section__title">Phân loại & Hạn xử lý</div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Độ mật</label>
                  <select className="form-control" value={form.doMat}
                    onChange={(e) => setForm({ ...form, doMat: e.target.value })}>
                    {DO_MAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Độ khẩn</label>
                  <select className="form-control" value={form.doKhan}
                    onChange={(e) => setForm({ ...form, doKhan: e.target.value })}>
                    {DO_KHAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Hạn xử lý</label>
                <input type="date" className="form-control" value={form.hanXuLy}
                  onChange={(e) => setForm({ ...form, hanXuLy: e.target.value })} />
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT — Tập tin + Luồng xử lý */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="form-section">
              <div className="form-section__title">📎 Tập tin đính kèm</div>
              <div className="form-field">
                <label className="form-label">File văn bản</label>
                <input type="file" className="form-control"
                  onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              {file && (
                <div className="alert alert--info">
                  <div>📄 <strong>{file.name}</strong></div>
                  <div style={{ fontSize: 12 }}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              )}
            </div>
          </div>

          <div className="card soft">
            <div className="form-section__title" style={{ marginBottom: 10 }}>⚙️ Luồng xử lý đề xuất</div>
            {workflowSuggestion ? (
              <>
                <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-strong)", marginBottom: 10 }}>
                  {workflowSuggestion.tenQuyTrinh}
                </p>
                <div className="timeline">
                  {workflowSuggestion.steps.map((step, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-dot" style={{ fontSize: 12, fontWeight: 700 }}>{i + 1}</div>
                      <div className="timeline-content">
                        <h4>{step}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                {selectedLoaiVanBan
                  ? "Không có luồng xử lý phù hợp cho loại văn bản này."
                  : "Chọn loại văn bản để xem luồng xử lý đề xuất."}
              </p>
            )}
          </div>

          {currentUser && (
            <div className="card soft">
              <div className="form-section__title" style={{ marginBottom: 8 }}>👤 Người tạo</div>
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-strong)" }}>{currentUser.hoTen}</p>
              <p style={{ fontSize: 13 }}>{currentUser.email}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
