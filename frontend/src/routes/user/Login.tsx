import { useNavigate } from "react-router-dom";
import "../../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // sau này gọi OAuth Office 365
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      {/* LEFT - HERO SECTION */}
      <div className="login-left">
        <div className="overlay">
          <div className="content-wrapper">
            <span className="badge">eOffice Intelligence System (eOIS)</span>
            <h1>
              Hệ thống xử lý văn bản điện tử <br />
              <span>tích hợp Office 365</span>
            </h1>
            <p>
              Hỗ trợ quản lý quy trình xử lý văn bản,
              phân công công việc, theo dõi tiến độ và phê duyệt trong cơ quan.
            </p>

            <div className="features">
              <div className="feature-card">
                <span className="icon">📊</span>
                <p>Quản lý tiến độ dự án</p>
              </div>
              <div className="feature-card">
                <span className="icon">🔄</span>
                <p>Luân chuyển & phê duyệt</p>
              </div>
              <div className="feature-card">
                <span className="icon">🔍</span>
                <p>Tìm kiếm thông minh</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT - LOGIN SECTION */}
      <div className="login-right">
        <div className="login-card">
          <div className="logo-placeholder">
             {/* Bạn có thể đặt logo công ty ở đây */}
             <img src="https://img.icons8.com/fluency/96/group-task.png" alt="logo" />
          </div>
          <h2>Chào mừng quay trở lại</h2>
          <p>Vui lòng đăng nhập bằng tài khoản Microsoft để tiếp tục</p>

          <button className="office-btn" onClick={handleLogin}>
            <img
              src="https://img.icons8.com/color/48/microsoft.png"
              alt="ms"
            />
            <span>Đăng nhập với Office 365</span>
          </button>
          
          <div className="login-footer">
            <p>© 2026 Bản quyền thuộc về eOffice Intelligence System (eOIS)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
