import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="card" style={{ textAlign: "center" }}>
      <h2>Không tìm thấy trang</h2>
      <p>Đường dẫn không tồn tại hoặc đã được thay đổi.</p>
      <div style={{ marginTop: 16 }}>
        <Link to="/dashboard" className="button">
          Quay về tổng quan
        </Link>
      </div>
    </section>
  );
}
