import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../services/core/apiClient";
import { fetchIncomingDocuments, type DocumentListItem } from "../../services/documents/documentsApi";

interface VanBanDen {
  id: number;
  soKyHieu: string;
  trichYeu: string;
  donViBanHanh: string;
  ngayTiepNhan: string;
  doKhan: string;
}

export default function Inbox() {
  const [documents, setDocuments] = useState<VanBanDen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInbox = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchIncomingDocuments({ page: 0, size: 20 });
        setDocuments(
          (response.content || []).map((doc: DocumentListItem) => ({
            id: doc.id,
            soKyHieu: doc.soKyHieu || "-",
            trichYeu: doc.trichYeu,
            donViBanHanh: doc.donViBanHanh || "-",
            ngayTiepNhan: doc.ngayTiepNhan || "",
            doKhan: doc.doKhan || "-",
          }))
        );
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải văn bản đến";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadInbox();
  }, []);

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
        {loading && <p>Đang tải...</p>}
        {error && <p>{error}</p>}
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
