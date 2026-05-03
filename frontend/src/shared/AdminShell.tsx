import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../styles/admin.css";

export default function AdminShell() {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main-content">
        <div className="admin-header">
          <h1>Bảng điều khiển quản trị viên</h1>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
