import { useState, useEffect } from "react";

interface SystemStatus {
  service: string;
  status: "online" | "offline" | "warning";
  uptime: string;
  responseTime: number;
  lastCheck: string;
}

interface Performance {
  metric: string;
  value: string;
  threshold: string;
  status: "good" | "warning" | "critical";
}

export default function SystemMonitoring() {
  const [services, setServices] = useState<SystemStatus[]>([]);
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      // Replace with actual API
      setTimeout(() => {
        setServices([
          {
            service: "API Gateway",
            status: "online",
            uptime: "99.9%",
            responseTime: 45,
            lastCheck: new Date().toLocaleTimeString("vi-VN"),
          },
          {
            service: "Document Service",
            status: "online",
            uptime: "99.8%",
            responseTime: 62,
            lastCheck: new Date().toLocaleTimeString("vi-VN"),
          },
          {
            service: "Auth Service",
            status: "online",
            uptime: "100%",
            responseTime: 28,
            lastCheck: new Date().toLocaleTimeString("vi-VN"),
          },
          {
            service: "AI Service",
            status: "warning",
            uptime: "98.5%",
            responseTime: 520,
            lastCheck: new Date().toLocaleTimeString("vi-VN"),
          },
          {
            service: "Database",
            status: "online",
            uptime: "99.95%",
            responseTime: 15,
            lastCheck: new Date().toLocaleTimeString("vi-VN"),
          },
        ]);

        setPerformance([
          {
            metric: "CPU Usage",
            value: "45%",
            threshold: "80%",
            status: "good",
          },
          {
            metric: "Memory Usage",
            value: "62%",
            threshold: "85%",
            status: "good",
          },
          {
            metric: "Disk Usage",
            value: "78%",
            threshold: "90%",
            status: "warning",
          },
          {
            metric: "Network I/O",
            value: "245 Mbps",
            threshold: "1000 Mbps",
            status: "good",
          },
          {
            metric: "Active Connections",
            value: "342",
            threshold: "5000",
            status: "good",
          },
          {
            metric: "Database Connections",
            value: "87",
            threshold: "100",
            status: "good",
          },
        ]);

        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return "🟢";
      case "offline":
        return "🔴";
      case "warning":
        return "🟡";
      default:
        return "⚪";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Hoạt động";
      case "offline":
        return "Ngoại tuyến";
      case "warning":
        return "Cảnh báo";
      default:
        return "Không xác định";
    }
  };

  if (loading) {
    return (
      <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải dữ liệu giám sát...</span></div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Giám sát hệ thống</h2>
        <button
          className="button secondary"
          onClick={fetchMonitoringData}
        >
          🔄 Tải lại
        </button>
      </span></div>

      <div className="monitoring-section">
        <h3>Trạng thái dịch vụ</h3>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-header">
                <span className="status-icon">
                  {getStatusIcon(service.status)}
                </span>
                <h4>{service.service}</h4>
              </span></div>
              <div className="service-stats">
                <div className="stat-row">
                  <span className="label">Trạng thái:</span>
                  <span className="value">
                    {getStatusText(service.status)}
                  </span>
                </span></div>
                <div className="stat-row">
                  <span className="label">Uptime:</span>
                  <span className="value">{service.uptime}</span>
                </span></div>
                <div className="stat-row">
                  <span className="label">Thời gian response:</span>
                  <span className="value">{service.responseTime}ms</span>
                </span></div>
                <div className="stat-row">
                  <span className="label">Kiểm tra lúc:</span>
                  <span className="value">{service.lastCheck}</span>
                </span></div>
              </span></div>
              <div className="service-badge">
                <span
                  className={`badge badge-${
                    service.status === "online"
                      ? "success"
                      : service.status === "offline"
                        ? "danger"
                        : "warning"
                  }`}
                >
                  {getStatusText(service.status)}
                </span>
              </span></div>
            </span></div>
          ))}
        </span></div>
      </span></div>

      <div className="monitoring-section">
        <h3>Hiệu suất hệ thống</h3>
        <table className="performance-table">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
              <th>Ngưỡng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {performance.map((perf, index) => (
              <tr key={index}>
                <td>{perf.metric}</td>
                <td className="value-cell">{perf.value}</td>
                <td className="threshold-cell">{perf.threshold}</td>
                <td>
                  <span
                    className={`badge badge-${
                      perf.status === "good"
                        ? "success"
                        : perf.status === "warning"
                          ? "warning"
                          : "danger"
                    }`}
                  >
                    {perf.status === "good"
                      ? "Tốt"
                      : perf.status === "warning"
                        ? "Cảnh báo"
                        : "Nghiêm trọng"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </span></div>

      <div className="monitoring-section">
        <h3>Nhật ký sự kiện gần đây</h3>
        <table className="events-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Sự kiện</th>
              <th>Mức độ</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>14:30 - Hôm nay</td>
              <td>Backup database</td>
              <td>
                <span className="badge badge-info">Thông tin</span>
              </td>
              <td>Sao lưu dữ liệu hoàn thành</td>
            </tr>
            <tr>
              <td>12:15 - Hôm nay</td>
              <td>Cảnh báo CPU</td>
              <td>
                <span className="badge badge-warning">Cảnh báo</span>
              </td>
              <td>CPU usage vượt 75% trong 5 phút</td>
            </tr>
            <tr>
              <td>09:45 - Hôm nay</td>
              <td>Service restart</td>
              <td>
                <span className="badge badge-info">Thông tin</span>
              </td>
              <td>AI Service được khởi động lại</td>
            </tr>
            <tr>
              <td>08:20 - Hôm nay</td>
              <td>Maintenance</td>
              <td>
                <span className="badge badge-info">Thông tin</span>
              </td>
              <td>Bảo trì hệ thống định kỳ</td>
            </tr>
          </tbody>
        </table>
      </span></div>
    </span></div>
  );
}
