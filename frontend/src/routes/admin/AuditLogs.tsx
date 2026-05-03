import { useState, useEffect } from "react";

interface AuditLog {
  id: number;
  time: string;
  user: string;
  action: string;
  object: string;
  details: string;
  status: "success" | "failed" | "pending";
  ipAddress: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Replace with actual API
      setTimeout(() => {
        setLogs([
          {
            id: 1,
            time: "14:30:45",
            user: "Nguyễn Văn A",
            action: "Tạo",
            object: "Người dùng",
            details: "Tạo người dùng: tranthib",
            status: "success",
            ipAddress: "192.168.1.100",
          },
          {
            id: 2,
            time: "14:25:30",
            user: "Trần Thị B",
            action: "Sửa",
            object: "Quy trình",
            details: "Cập nhật quy trình QT001",
            status: "success",
            ipAddress: "192.168.1.101",
          },
          {
            id: 3,
            time: "14:20:15",
            user: "Lê Văn C",
            action: "Xóa",
            object: "Template",
            details: "Xóa template: TMP005",
            status: "failed",
            ipAddress: "192.168.1.102",
          },
          {
            id: 4,
            time: "14:15:00",
            user: "Phạm Văn D",
            action: "Xem",
            object: "Báo cáo",
            details: "Xem báo cáo thống kê tháng 5",
            status: "success",
            ipAddress: "192.168.1.103",
          },
          {
            id: 5,
            time: "14:10:22",
            user: "Nguyễn Văn A",
            action: "Phê duyệt",
            object: "Văn bản",
            details: "Phê duyệt văn bản: VB20240503001",
            status: "success",
            ipAddress: "192.168.1.100",
          },
          {
            id: 6,
            time: "14:05:10",
            user: "Trần Thị B",
            action: "Sửa",
            object: "Người dùng",
            details: "Cập nhật quyền cho nguyenvana",
            status: "success",
            ipAddress: "192.168.1.101",
          },
          {
            id: 7,
            time: "13:55:45",
            user: "Admin",
            action: "Đăng nhập",
            object: "Hệ thống",
            details: "Đăng nhập thành công",
            status: "success",
            ipAddress: "192.168.1.50",
          },
          {
            id: 8,
            time: "13:50:20",
            user: "Lê Văn C",
            action: "Xuất",
            object: "Báo cáo",
            details: "Xuất báo cáo tháng 4",
            status: "success",
            ipAddress: "192.168.1.102",
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return "badge-success";
      case "failed":
        return "badge-danger";
      case "pending":
        return "badge-warning";
      default:
        return "badge-info";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Thành công";
      case "failed":
        return "Thất bại";
      case "pending":
        return "Chờ xử lý";
      default:
        return "Không xác định";
    }
  };

  const filteredLogs = logs.filter((log) => {
    return (
      (filterUser === "" || log.user.includes(filterUser)) &&
      (filterAction === "" || log.action === filterAction) &&
      (filterStatus === "" || log.status === filterStatus)
    );
  });

  if (loading) {
    return (
      <div className="admin-loading">Đang tải nhật ký hệ thống...</div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Nhật ký hệ thống</h2>
        <button
          className="button secondary"
          onClick={() => {
            const csv = "time,user,action,object,status,ipAddress\n" +
              filteredLogs.map(log => 
                `"${log.time}","${log.user}","${log.action}","${log.object}","${log.status}","${log.ipAddress}"`
              ).join("\n");
            const element = document.createElement("a");
            element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
            element.setAttribute("download", "audit_logs.csv");
            element.click();
          }}
        >
          📥 Xuất CSV
        </button>
      </div>

      <div className="audit-filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo người dùng..."
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="filter-input"
        />
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả hành động</option>
          <option value="Tạo">Tạo</option>
          <option value="Sửa">Sửa</option>
          <option value="Xóa">Xóa</option>
          <option value="Xem">Xem</option>
          <option value="Phê duyệt">Phê duyệt</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="success">Thành công</option>
          <option value="failed">Thất bại</option>
          <option value="pending">Chờ xử lý</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="filter-input"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="filter-input"
        />
      </div>

      <table className="audit-table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Người dùng</th>
            <th>Hành động</th>
            <th>Đối tượng</th>
            <th>Chi tiết</th>
            <th>Trạng thái</th>
            <th>Địa chỉ IP</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td className="time-cell">{log.time}</td>
              <td>{log.user}</td>
              <td className="action-cell">{log.action}</td>
              <td>
                <span className="object-badge">{log.object}</span>
              </td>
              <td className="details-cell">{log.details}</td>
              <td>
                <span className={`badge ${getStatusBadge(log.status)}`}>
                  {getStatusText(log.status)}
                </span>
              </td>
              <td className="ip-cell">{log.ipAddress}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <p>Tổng: {filteredLogs.length} bản ghi</p>
      </div>
    </div>
  );
}
