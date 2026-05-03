import { useParams } from "react-router-dom";

export default function DocumentDetail() {
  const { id } = useParams();

  // Mock data for demonstration
  const doc = {
    id,
    soKyHieu: `VB-${id}`,
    trichYeu: "Biên bản nghiệm thu giai đoạn 1",
    nguoiGui: "Tư vấn giám sát",
    noiDung: "Nội dung tóm tắt văn bản...",
    lichSu: [
      { date: "2026-04-20", action: "Gửi" },
      { date: "2026-04-21", action: "Phân công" },
      { date: "2026-04-24", action: "Phê duyệt" },
    ],
  };

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Chi tiết văn bản</h1>
          <p>Thông tin đầy đủ, luồng xử lý và lịch sử hành động.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>{doc.soKyHieu} - {doc.trichYeu}</h3>
          <p><strong>Nơi gửi:</strong> {doc.nguoiGui}</p>
          <p>{doc.noiDung}</p>
        </div>
        <div className="card">
          <h3>Lịch sử xử lý</h3>
          <ul>
            {doc.lichSu.map((h, idx) => (
              <li key={idx}>{h.date} - {h.action}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
