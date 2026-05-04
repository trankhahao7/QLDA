import { useNavigate } from "react-router-dom";
import { setAccessToken } from "../../services/core/apiClient";
import "../../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const handleAzureLogin = async () => {
    /**
     * TODO: Tích hợp Microsoft Entra ID (Azure AD) tại đây
     * 1. Khởi tạo MSAL PublicClientApplication
     * 2. Gọi loginPopup() hoặc loginRedirect()
     * 3. Lấy access token và gửi về Backend kiểm tra
     */
    console.log("Đang kết nối tới Azure AD...");

    // TODO: tích hợp MSAL để lấy access token thật.
    const manualToken = window.prompt("Nhập access token để tiếp tục (dev):");
    if (manualToken) {
      setAccessToken(manualToken);
      navigate("/dashboard");
    }
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
             <img src="https://img.icons8.com/fluency/96/group-task.png" alt="logo" />
          </div>
          <h2>Chào mừng quay trở lại</h2>
          <p>Sử dụng tài khoản doanh nghiệp để truy cập hệ thống</p>

          {/* Cập nhật nút đăng nhập Azure AD */}
          <button className="office-btn azure-btn" onClick={handleAzureLogin}>
            <img
              src="https://img.icons8.com/color/48/azure-1.png" 
              alt="Azure AD Icon"
            />
            <span>Đăng nhập với Azure AD</span>
          </button>
          
          <div className="login-footer">
            <p>© 2026 Bản quyền thuộc về eOffice Intelligence System (eOIS)</p>
          </div>
        </div>
      </div>
    </div>
  );
}