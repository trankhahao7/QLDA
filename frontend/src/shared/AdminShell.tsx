import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../styles/admin.css";

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  "/admin/dashboard": { title: "Bảng điều khiển", sub: "Tổng quan hệ thống quản lý văn bản" },
  "/admin/users": { title: "Quản lý người dùng", sub: "Thêm, sửa, vô hiệu hóa tài khoản trong hệ thống" },
  "/admin/permissions": { title: "Phân quyền", sub: "Cấu hình quyền truy cập theo nhóm người dùng" },
  "/admin/units": { title: "Quản lý đơn vị", sub: "Cơ cấu tổ chức và các phòng ban trực thuộc" },
  "/admin/document-types": { title: "Loại văn bản", sub: "Danh mục phân loại văn bản trong hệ thống" },
  "/admin/workflows": { title: "Quy trình xử lý", sub: "Thiết lập luồng phê duyệt và xử lý văn bản" },
  "/admin/templates": { title: "Mẫu văn bản", sub: "Quản lý các mẫu soạn thảo văn bản" },
  "/admin/monitoring": { title: "Giám sát hệ thống", sub: "Theo dõi trạng thái hoạt động của các dịch vụ" },
  "/admin/audit-logs": { title: "Nhật ký hoạt động", sub: "Lịch sử các thao tác của người dùng trên hệ thống" },
  "/admin/reports": { title: "Thống kê & Báo cáo", sub: "Tổng hợp tình hình xử lý văn bản theo thời gian" },
  "/admin/sla": { title: "Quản lý SLA", sub: "Thiết lập thời hạn xử lý theo loại văn bản" },
};

export default function AdminShell() {
  const { pathname } = useLocation();
  const page = PAGE_TITLES[pathname] ?? { title: "Quản trị hệ thống", sub: "" };

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main-content">
        <div className="admin-header">
          <div>
            <h1>{page.title}</h1>
            {page.sub && <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted, #6b7280)" }}>{page.sub}</p>}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
