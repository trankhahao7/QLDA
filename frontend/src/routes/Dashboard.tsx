import { Link } from "react-router-dom";

interface VanBanGanDay {
  id: number;
  soKyHieu: string;
  trichYeu: string;
  donViBanHanh: string;
  trangThai: string;
}

export default function Dashboard() {
  const kpiItems = [
    { label: "Văn bản đến", value: 12 },
    { label: "Đang luân chuyển", value: 5 },
    { label: "Cần phê duyệt", value: 3 },
    { label: "Đã hoàn tất", value: 28 },
  ];

  const recentDocs: VanBanGanDay[] = [
    {
      id: 24,
      soKyHieu: "VB-024",
      trichYeu: "Hồ sơ thẩm định dự án số 2",
      donViBanHanh: "Ban QLDA",
      trangThai: "Đang xử lý",
    },
    {
      id: 21,
      soKyHieu: "VB-021",
      trichYeu: "Công văn bổ sung dự toán",
      donViBanHanh: "Phòng Kế hoạch",
      trangThai: "Chờ phê duyệt",
    },
    {
      id: 18,
      soKyHieu: "VB-018",
      trichYeu: "Biên bản nghiệm thu giai đoạn 1",
      donViBanHanh: "Tư vấn giám sát",
      trangThai: "Đã hoàn tất",
    },
  ];

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Tổng quan</h1>
          <p>Trạng thái xử lý văn bản và tiến độ dự án.</p>
        </div>
        <div className="topbar__actions">
          <Link to="/upload" className="button">
            Tạo văn bản
          </Link>
          <Link to="/search" className="button secondary">
            Tìm nhanh
          </Link>
        </div>
      </div>

      <div className="grid-3">
        {kpiItems.map((item) => (
          <div className="card" key={item.label}>
            <p>{item.label}</p>
            <h2>{item.value}</h2>
            <span className="badge">Cập nhật hôm nay</span>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h3>Văn bản gần đây</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.soKyHieu}</td>
                  <td>
                    <Link to={`/documents/${doc.id}`}>{doc.trichYeu}</Link>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {doc.donViBanHanh}
                    </div>
                  </td>
                  <td>
                    <span className="badge">{doc.trangThai}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Lịch xử lý hôm nay</h3>
          <div className="form-grid">
            <div className="card soft">
              <strong>09:30 - Họp giao ban dự án</strong>
              <p>Phòng Kế hoạch - Phòng họp A</p>
            </div>
            <div className="card soft">
              <strong>13:30 - Phê duyệt hồ sơ thầu</strong>
              <p>Ban QLDA - Phòng họp B</p>
            </div>
            <div className="card soft">
              <strong>15:00 - Gửi biên bản nghiệm thu</strong>
              <p>Thư ký văn phòng</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
