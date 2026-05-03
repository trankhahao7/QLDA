import { Link } from "react-router-dom";

interface VanBanDen {
  id: number;
  soKyHieu: string;
  trichYeu: string;
  donViBanHanh: string;
  ngayTiepNhan: string;
  doKhan: string;
}

export default function Inbox() {
  const documents: VanBanDen[] = [
    {
      id: 31,
      soKyHieu: "VB-031",
      trichYeu: "Công văn tham gia hội thảo",
      donViBanHanh: "Sở Xây dựng",
      ngayTiepNhan: "2026-05-02",
      doKhan: "Cao",
    },
    {
      id: 30,
      soKyHieu: "VB-030",
      trichYeu: "Báo cáo tình hình giải ngân",
      donViBanHanh: "Kho bạc",
      ngayTiepNhan: "2026-05-02",
      doKhan: "Trung bình",
    },
    {
      id: 29,
      soKyHieu: "VB-029",
      trichYeu: "Kế hoạch giám sát dự án",
      donViBanHanh: "Phòng Giám sát",
      ngayTiepNhan: "2026-05-01",
      doKhan: "Cao",
    },
  ];

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Văn bản đến</h1>
          <p>Danh sách văn bản cần xử lý và luân chuyển.</p>
        </div>
        <div className="topbar__actions">
          <button className="button" type="button">
            Phân công xử lý
          </button>
          <button className="button secondary" type="button">
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Nội dung</th>
              <th>Nơi gửi</th>
              <th>Ngày</th>
              <th>Ưu tiên</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((item) => (
              <tr key={item.id}>
                <td>{item.soKyHieu}</td>
                <td>
                  <Link to={`/documents/${item.id}`}>{item.trichYeu}</Link>
                </td>
                <td>{item.donViBanHanh}</td>
                <td>{new Date(item.ngayTiepNhan).toLocaleDateString("vi-VN")}</td>
                <td>
                  <span className="badge">{item.doKhan}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
