import { useState } from "react";

interface UploadForm {
  title: string;
  type: string;
  date: string;
  department: string;
  description: string;
}

export default function Upload() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setMessage({ type: "success", text: "Tải lên thành công!" });
      setForm({
        title: "",
        type: "CONG_VAN",
        date: new Date().toISOString().split("T")[0],
        department: "",
        description: "",
      });
      setFile(null);
      setLoading(false);
    }, 300);
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
                <option value="CONG_VAN">Công văn</option>
                <option value="BIEN_BAN">Biên bản</option>
                <option value="DE_XUAT">Đề xuất</option>
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
