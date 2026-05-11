import { useEffect, useState, useCallback, useRef } from "react";
import { setAccessToken } from "../../services/core/apiClient";
import { loginAzureWithToken } from "../../services/auth/authApi";
import { PublicClientApplication, EventType, BrowserCacheLocation, InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "../../config/msal.config";
import "../../styles/login.css";

let msalInstance: PublicClientApplication | null = null;

function getMsalInstance(): PublicClientApplication {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication({
      ...msalConfig,
      cache: {
        cacheLocation: BrowserCacheLocation.SessionStorage,
      },
    });
  }
  return msalInstance;
}

const implicitLoginRequest = {
  ...loginRequest,
  responseType: "token id_token" as const,
};

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const instance = getMsalInstance();

    instance.initialize()
      .then(() => {
        console.log("[MSAL] Initialized, checking redirect...");
        return instance.handleRedirectPromise();
      })
      .then((response) => {
        if (response && response.accessToken) {
          console.log("[MSAL] Got token from redirect");
          loginAzureWithToken(response.accessToken)
            .then((data) => {
              setAccessToken(data.accessToken);
              window.location.href = "/dashboard";
            })
            .catch((err) => {
              console.error("Backend login failed:", err);
              setErrorMessage("Đăng nhập thất bại.");
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[MSAL] Error:", err);
        setLoading(false);
      });

    instance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as { accessToken: string };
        if (payload.accessToken) {
          loginAzureWithToken(payload.accessToken)
            .then((response) => {
              setAccessToken(response.accessToken);
              window.location.href = "/dashboard";
            })
            .catch(() => {
              setErrorMessage("Đăng nhập thất bại.");
              setLoading(false);
            });
        }
      }
    });
  }, []);

  const handleAzureLogin = useCallback(async () => {
    console.log("[MSAL] loginPopup clicked");
    setLoading(true);
    setErrorMessage(null);

    Object.keys(sessionStorage)
      .filter((k) => k.includes("msal"))
      .forEach((k) => sessionStorage.removeItem(k));

    const instance = getMsalInstance();

    try {
      const result = await instance.loginPopup(implicitLoginRequest);
      console.log("[MSAL] Popup success, has token:", !!result?.accessToken);
      if (result && result.accessToken) {
        const data = await loginAzureWithToken(result.accessToken);
        setAccessToken(data.accessToken);
        window.location.href = "/dashboard";
      }
    } catch (error: unknown) {
      setLoading(false);
      if (error instanceof Error) {
        if (error.message.includes("timed_out")) {
          setErrorMessage("Popup timeout. Vui lòng thử lại.");
        } else if (error instanceof InteractionRequiredAuthError) {
          console.log("[MSAL] Interaction required, falling back to redirect");
          await instance.loginRedirect(loginRequest);
        } else {
          console.error("[MSAL] Popup error:", error.message);
          setErrorMessage("Đăng nhập thất bại: " + error.message);
        }
      }
    }
  }, []);

  return (
    <div className="login-container">
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
                <p>Luân chuyển &amp; phê duyệt</p>
              </div>
              <div className="feature-card">
                <span className="icon">🔍</span>
                <p>Tìm kiếm thông minh</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <div className="logo-placeholder">
             <img src="https://img.icons8.com/fluency/96/group-task.png" alt="logo" />
          </div>
          <h2>Chào mừng quay trở lại</h2>
          <p>Sử dụng tài khoản doanh nghiệp để truy cập hệ thống</p>
          {errorMessage && (
            <div style={{ color: "#ef4444", background: "#fef2f2", padding: "8px 12px", borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
              {errorMessage}
            </div>
          )}
          <button className="office-btn azure-btn" onClick={handleAzureLogin} disabled={loading}>
            <img src="https://img.icons8.com/color/48/azure-1.png" alt="Azure AD Icon" />
            <span>{loading ? "Đang xử lý..." : "Đăng nhập với Azure AD"}</span>
          </button>
          <div className="login-footer">
            <p>© 2026 Bản quyền thuộc về eOffice Intelligence System (eOIS)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
