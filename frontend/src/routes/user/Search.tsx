import { useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { searchIncomingDocuments } from "../../services/documents/documentSearchApi";
import type { DocumentListItem } from "../../services/documents/documentsApi";
import { Link } from "react-router-dom";

const TRANG_THAI_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Nháp", className: "badge badge--ghost" },
  1: { label: "Đang xử lý", className: "badge badge--info" },
  2: { label: "Đã chuyển xử lý", className: "badge badge--warning" },
  3: { label: "Trình ký", className: "badge badge--primary" },
  4: { label: "Đã ký", className: "badge badge--success" },
  5: { label: "Đã phát hành", className: "badge badge--success" },
};

interface VanBanTimKiem {
  id: number;
  soKyHieu: string;
  trichYeu: string;
  tenLoaiVanBan?: string;
  donViBanHanh: string;
  ngayTiepNhan: string;
  trangThai: number;
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

        setResults(
          (response.content || []).map((item: DocumentListItem) => ({
            id: item.id,
            soKyHieu: item.soKyHieu || "-",
            trichYeu: item.trichYeu,
            tenLoaiVanBan: item.tenLoaiVanBan,
            donViBanHanh: item.donViBanHanh || "-",
            ngayTiepNhan: item.ngayTiepNhan || "",
            trangThai: item.trangThai ?? -1,
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
          <table className="table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>Mã</th>
                <th style={{ whiteSpace: "nowrap" }}>Loại</th>
                <th>Nội dung</th>
                <th style={{ whiteSpace: "nowrap" }}>Đơn vị</th>
                <th style={{ whiteSpace: "nowrap" }}>Ngày</th>
                <th style={{ whiteSpace: "nowrap" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => {
                const stt = TRANG_THAI_MAP[item.trangThai] ?? { label: "Không xác định", className: "badge badge--ghost" };
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{item.soKyHieu}</td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>{item.tenLoaiVanBan || "-"}</td>
                    <td>
                      <Link to={`/documents/${item.id}`}>{item.trichYeu}</Link>
                    </td>
                    <td style={{ fontSize: 13 }}>{item.donViBanHanh}</td>
                    <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                      {item.ngayTiepNhan ? new Date(item.ngayTiepNhan).toLocaleDateString("vi-VN") : "-"}
                    </td>
                    <td>
                      <span className={stt.className}>{stt.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
