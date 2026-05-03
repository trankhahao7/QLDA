import { useState } from "react";
import { Link } from "react-router-dom";

interface VanBanTimKiem {
  id: number;
  soKyHieu: string;
  trichYeu: string;
  donViBanHanh: string;
  trangThai: string;
}

const danhSachMau: VanBanTimKiem[] = [
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
  {
    id: 31,
    soKyHieu: "VB-031",
    trichYeu: "Công văn tham gia hội thảo",
    donViBanHanh: "Sở Xây dựng",
    trangThai: "Đang xử lý",
  },
];

export default function Search() {
  const [keyword, setKeyword] = useState("");
  const [donVi, setDonVi] = useState("");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<VanBanTimKiem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    const keywordLower = keyword.trim().toLowerCase();
    const ketQuaLoc = danhSachMau.filter((item) => {
      const dungTuKhoa =
        !keywordLower ||
        item.trichYeu.toLowerCase().includes(keywordLower) ||
        item.soKyHieu.toLowerCase().includes(keywordLower);

      const dungDonVi = !donVi || item.donViBanHanh === donVi;
      const dungTrangThai = !status || item.trangThai === status;

      return dungTuKhoa && dungDonVi && dungTrangThai;
    });

    setTimeout(() => {
      setResults(ketQuaLoc);
      setLoading(false);
    }, 250);
  };

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Tìm kiếm văn bản</h1>
          <p>Tìm theo từ khóa, phòng ban hoặc trạng thái xử lý.</p>
        </div>
        <div className="topbar__actions">
          <button className="button secondary" type="button">
            Lọc nâng cao
          </button>
        </div>
      </div>

      <div className="card">
        <form className="form-grid" onSubmit={handleSearch}>
          <label>
            Từ khóa
            <input
              placeholder="Nhập từ khóa văn bản"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </label>
          <label>
            Phòng ban
            <select value={donVi} onChange={(e) => setDonVi(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="Phòng Kế hoạch">Phòng Kế hoạch</option>
              <option value="Sở Xây dựng">Sở Xây dựng</option>
              <option value="Tư vấn giám sát">Tư vấn giám sát</option>
            </select>
          </label>
          <label>
            Trạng thái
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Chờ phê duyệt">Chờ phê duyệt</option>
              <option value="Đã hoàn tất">Đã hoàn tất</option>
            </select>
          </label>
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        {!searched ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
            Nhập tiêu chí tìm kiếm để bắt đầu
          </p>
        ) : loading ? (
          <p style={{ textAlign: "center" }}>Đang tải...</p>
        ) : results.length === 0 ? (
          <p style={{ textAlign: "center" }}>Không tìm thấy kết quả</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Nội dung</th>
                <th>Đơn vị</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => (
                <tr key={item.id}>
                  <td>{item.soKyHieu}</td>
                  <td>
                    <Link to={`/documents/${item.id}`}>{item.trichYeu}</Link>
                  </td>
                  <td>{item.donViBanHanh}</td>
                  <td>
                    <span className="badge">{item.trangThai}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
