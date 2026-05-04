import { useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { searchIncomingDocuments } from "../../services/documents/documentSearchApi";
import type { DocumentListItem } from "../../services/documents/documentsApi";
import { Link } from "react-router-dom";

interface VanBanTimKiem {
  id: number;
  soKyHieu: string;
  trichYeu: string;
  donViBanHanh: string;
  ngayTiepNhan: string;
  trangThai: string;
}

export default function Search() {
  const [keyword, setKeyword] = useState("");
  const [donVi, setDonVi] = useState("");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<VanBanTimKiem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setError(null);

    try {
      // TODO: map donVi filter to donViChuTriId once UI uses unit IDs.
      const response = await searchIncomingDocuments({
        page: 0,
        size: 20,
        keyword: keyword || undefined,
        trangThai: status ? Number(status) : undefined,
      });

        const statusLabels: Record<number, string> = {
          1: "Đang xử lý",
          2: "Hoàn thành",
        };
        setResults(
          (response.content || []).map((item: DocumentListItem) => ({
            id: item.id,
            soKyHieu: item.soKyHieu || "-",
            trichYeu: item.trichYeu,
            donViBanHanh: item.donViBanHanh || "-",
            ngayTiepNhan: item.ngayTiepNhan || "",
            trangThai:
              item.trangThai !== undefined
                ? statusLabels[item.trangThai] || "-"
                : "-",
          }))
        );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể tìm kiếm";
      setError(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
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
              <option value="1">Đang xử lý</option>
              <option value="2">Hoàn thành</option>
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
        ) : error ? (
          <p style={{ textAlign: "center" }}>{error}</p>
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
