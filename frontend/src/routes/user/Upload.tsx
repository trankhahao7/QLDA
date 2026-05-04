import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { fetchDocumentTypes } from "../../services/documents/documentTypesApi";
import { createIncomingDocument, uploadAttachment } from "../../services/documents/documentsApi";

interface UploadForm {
  title: string;
  type: string;
  date: string;
  department: string;
  description: string;
}

export default function Upload() {
  const [documentTypes, setDocumentTypes] = useState<Array<{ id: number; maLoaiVanBan: string; tenLoaiVanBan: string }>>([]);
  const [form, setForm] = useState<UploadForm>({
    title: "",
    type: "CONG_VAN",
    date: new Date().toISOString().split("T")[0],
    department: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        const data = await fetchDocumentTypes({});
        setDocumentTypes(data || []);
      } catch (error) {
        console.error("Error loading document types:", error);
      }
    };

    loadDocumentTypes();
  }, []);

  const selectedLoaiVanBanId = useMemo(() => {
    const type = documentTypes.find((item) => item.maLoaiVanBan === form.type);
    return type?.id;
  }, [documentTypes, form.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!selectedLoaiVanBanId) {
        throw new ApiError("Chưa chọn loại văn bản hợp lệ", 400);
      }
      const created = await createIncomingDocument({
        trichYeu: form.title,
        loaiVanBanId: selectedLoaiVanBanId,
        donViBanHanh: form.department,
        ngayVanBan: form.date,
        ngayTiepNhan: form.date,
      });

      if (file) {
        await uploadAttachment(created.id, file);
      }

      setMessage({ type: "success", text: "Tải lên thành công!" });
      setForm({
        title: "",
        type: "CONG_VAN",
        date: new Date().toISOString().split("T")[0],
        department: "",
        description: "",
      });
      setFile(null);
    } catch (err) {
      const messageText = err instanceof ApiError ? err.message : "Tải lên thất bại";
      setMessage({ type: "error", text: messageText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Tải lên văn bản</h1>
          <p>Đăng ký văn bản mới và gán luồng xử lý.</p>
        </div>
        <div className="topbar__actions">
          <button className="button" type="button" disabled={loading}>
            Gửi vào luồng
          </button>
          <button className="button secondary" type="button" disabled={loading}>
            Lưu nháp
          </button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Thông tin văn bản</h3>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Tiêu đề văn bản
              <input
                placeholder="Biên bản làm việc"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                required
              />
            </label>
            <label>
              Loại văn bản
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {documentTypes.length === 0 && (
                  <option value="CONG_VAN">Công văn</option>
                )}
                {documentTypes.map((type) => (
                  <option key={type.id} value={type.maLoaiVanBan}>
                    {type.tenLoaiVanBan}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ngày ban hành
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <label>
              Đơn vị gửi
              <input
                placeholder="Phòng Kế hoạch"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              />
            </label>
            <label>
              Mô tả nhanh
              <textarea
                rows={4}
                placeholder="Mô tả mục đích văn bản"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Đang tải..." : "Gửi yêu cầu"}
            </button>
            {message && (
              <div
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  background:
                    message.type === "success"
                      ? "rgba(34, 197, 94, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                  color:
                    message.type === "success" ? "#22c55e" : "#ef4444",
                }}
              >
                {message.text}
              </div>
            )}
          </form>
        </div>
        <div className="card">
          <h3>Tập tin đính kèm</h3>
          <div className="form-grid">
            <label>
              File văn bản
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            {file && (
              <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                Đã chọn: {file.name}
              </div>
            )}
            <div className="card soft">
              <strong>Gợi ý luồng xử lý</strong>
              <p>Thư ký → Trưởng phòng → Ban QLDA</p>
            </div>
            <div className="card soft">
              <strong>Thời hạn mong muốn</strong>
              <p>Hoàn tất trước 05/05/2026</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
