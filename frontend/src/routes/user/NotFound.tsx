import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__code">404</div>
      <h2>Không tìm thấy trang</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
        Đường dẫn không tồn tại hoặc đã được thay đổi.
      </p>
      <Link to="/dashboard" className="button">
        Quay về tổng quan
      </Link>
    </div>
  );
}
