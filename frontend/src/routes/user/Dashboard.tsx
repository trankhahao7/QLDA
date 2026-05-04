import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../services/core/apiClient";
import { fetchIncomingDocuments } from "../../services/documents/documentsApi";
import { fetchDashboardStats } from "../../services/reports/reportsApi";


interface VanBanGanDay {
  id: number;
  soKyHieu: string;
  trichYeu: string;
  donViBanHanh: string;
  trangThai: string;
}

export default function Dashboard() {
  const [kpiItems, setKpiItems] = useState([
    { label: "Văn bản đến", value: 0 },
    { label: "Đang luân chuyển", value: 0 },
    { label: "Cần phê duyệt", value: 0 },
    { label: "Đã hoàn tất", value: 0 },
  ]);
  const [recentDocs, setRecentDocs] = useState<VanBanGanDay[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboard, incoming] = await Promise.all([
          fetchDashboardStats(),
          fetchIncomingDocuments({ page: 0, size: 5 }),
        ]);

        setKpiItems([
          { label: "Văn bản đến", value: dashboard.incomingDocuments || 0 },
          { label: "Đang luân chuyển", value: dashboard.processingDocuments || 0 },
          { label: "Cần phê duyệt", value: dashboard.overdueDocuments || 0 },
          { label: "Đã hoàn tất", value: dashboard.completedDocuments || 0 },
        ]);

        const statusLabels: Record<number, string> = {
          1: "Đang xử lý",
          2: "Hoàn thành",
        };
        setRecentDocs(
          (incoming.content || []).map((doc) => ({
            id: doc.id,
            soKyHieu: doc.soKyHieu || "-",
            trichYeu: doc.trichYeu,
            donViBanHanh: doc.donViBanHanh || "-",
            trangThai: doc.trangThai !== undefined ? statusLabels[doc.trangThai] || "-" : "-",
          }))
        );
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải dashboard";
        setError(message);
      }
    };

    loadDashboard();
  }, []);

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

      {error && (
        <div className="card" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}
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
