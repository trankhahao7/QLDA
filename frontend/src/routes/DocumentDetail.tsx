import { Link, useParams } from "react-router-dom";

export default function DocumentDetail() {
  const { id } = useParams();

  const document = {
    trichYeu: "Công văn bổ sung dự toán",
    donViBanHanh: "Phòng Kế hoạch",
    trangThai: "Chờ phê duyệt",
  };

  const processing = [
    { time: "09:00", text: "Nhận văn bản từ Phòng Kế hoạch" },
    { time: "10:15", text: "Chuyển Trưởng phòng thẩm định" },
    { time: "14:00", text: "Yêu cầu bổ sung tài liệu" },
  ];

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Chi tiết văn bản</h1>
          <p>{id}</p>
        </div>
        <div className="topbar__actions">
          <Link to="/inbox" className="button secondary">
            Quay lại
          </Link>
          <button className="button" type="button">
            Phê duyệt
          </button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Thông tin chính</h3>
          <div className="form-grid">
            <div>
              <strong>Tiêu đề</strong>
              <p>{document.trichYeu}</p>
            </div>
            <div>
              <strong>Đơn vị gửi</strong>
              <p>{document.donViBanHanh}</p>
            </div>
            <div>
              <strong>Trạng thái</strong>
              <span className="badge">{document.trangThai}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Lịch sử xử lý</h3>
          <div className="form-grid">
            {processing.map((item) => (
              <div className="card soft" key={item.time}>
                <strong>{item.time}</strong>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
