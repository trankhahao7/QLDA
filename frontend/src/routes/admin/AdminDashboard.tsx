import { useState, useEffect } from "react";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalDocuments: number;
  processingDocuments: number;
  completedToday: number;
  pendingApprovals: number;
  units: number;
  documentTypes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDocuments: 0,
    processingDocuments: 0,
    completedToday: 0,
    pendingApprovals: 0,
    units: 0,
    documentTypes: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - replace with actual API
    const fetchStats = async () => {
      try {
        // const response = await fetch('/api/admin/stats');
        // const data = await response.json();
        // setStats(data);

        // Mock data for demo
        setTimeout(() => {
          setStats({
            totalUsers: 145,
            activeUsers: 89,
            totalDocuments: 3421,
            processingDocuments: 23,
            completedToday: 12,
            pendingApprovals: 8,
            units: 15,
            documentTypes: 12,
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Tổng người dùng</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <span className="stat-sublabel">Hoạt động: {stats.activeUsers}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>Tổng văn bản</h3>
            <p className="stat-value">{stats.totalDocuments}</p>
            <span className="stat-sublabel">Đang xử lý: {stats.processingDocuments}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>Hoàn thành hôm nay</h3>
            <p className="stat-value">{stats.completedToday}</p>
            <span className="stat-sublabel">Chờ phê duyệt: {stats.pendingApprovals}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>Đơn vị</h3>
            <p className="stat-value">{stats.units}</p>
            <span className="stat-sublabel">Loại: {stats.documentTypes}</span>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h2>Hoạt động gần đây</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người dùng</th>
              <th>Hành động</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>10:30 - Hôm nay</td>
              <td>Nguyễn Văn A</td>
              <td>Tạo văn bản mới</td>
              <td><span className="badge badge-success">Thành công</span></td>
            </tr>
            <tr>
              <td>09:15 - Hôm nay</td>
              <td>Trần Thị B</td>
              <td>Phê duyệt văn bản</td>
              <td><span className="badge badge-success">Thành công</span></td>
            </tr>
            <tr>
              <td>08:45 - Hôm nay</td>
              <td>Lê Văn C</td>
              <td>Đổi mật khẩu</td>
              <td><span className="badge badge-success">Thành công</span></td>
            </tr>
            <tr>
              <td>08:20 - Hôm nay</td>
              <td>Phạm Văn D</td>
              <td>Cập nhật hồ sơ</td>
              <td><span className="badge badge-warning">Cảnh báo</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="admin-section">
        <h2>Thống kê xử lý văn bản theo trạng thái</h2>
        <div className="status-stats">
          <div className="status-item">
            <span className="status-label">Chờ xử lý:</span>
            <span className="status-count">45</span>
          </div>
          <div className="status-item">
            <span className="status-label">Đang xử lý:</span>
            <span className="status-count">23</span>
          </div>
          <div className="status-item">
            <span className="status-label">Hoàn thành:</span>
            <span className="status-count">3421</span>
          </div>
          <div className="status-item">
            <span className="status-label">Từ chối:</span>
            <span className="status-count">12</span>
          </div>
        </div>
      </div>
    </div>
  );
}
