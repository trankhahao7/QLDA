import { useEffect, useRef, useState } from "react";
import { setAccessToken } from "../../services/core/apiClient";
import { loginAzure } from "../../services/auth/authApi";
import { msalConfig } from "../../config/msal.config";
import "../../styles/login.css";

const AZURE_TENANT_ID = "42350984-d0f6-4a38-978a-aa84e495e429";
const AZURE_CLIENT_ID = msalConfig.auth.clientId;
const REDIRECT_URI = msalConfig.auth.redirectUri || "http://localhost:5173";

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generatePkceChallenge(): Promise<{ verifier: string; challenge: string }> {
  const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = base64UrlEncode(new Uint8Array(hash));
  return { verifier, challenge };
}

function generateState(): string {
  const state = crypto.randomUUID();
  sessionStorage.setItem("azure_oauth_state", state);
  return state;
}

function validateState(state: string | null): boolean {
  const saved = sessionStorage.getItem("azure_oauth_state");
  sessionStorage.removeItem("azure_oauth_state");
  return !!(state && saved && state === saved);
}

async function buildAzureAuthorizeUrl(): Promise<string> {
  const pkce = await generatePkceChallenge();
  sessionStorage.setItem("azure_code_verifier", pkce.verifier);

  const params = new URLSearchParams({
    client_id: AZURE_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: "openid profile email User.Read",
    response_mode: "query",
    state: generateState(),
    code_challenge: pkce.challenge,
    code_challenge_method: "S256",
  });
  return `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/authorize?${params.toString()}`;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const azureError = params.get("error");
    const azureErrorDesc = params.get("error_description");
    const returnedState = params.get("state");

    window.history.replaceState({}, document.title, window.location.pathname);

    if (azureError) {
      setErrorMessage(`Azure AD lỗi: ${azureErrorDesc || azureError}`);
      return;
    }

    if (!code) return;
    processedRef.current = true;

    if (!validateState(returnedState)) {
      setErrorMessage("Lỗi bảo mật: state không khớp. Vui lòng thử lại.");
      return;
    }

    const codeVerifier = sessionStorage.getItem("azure_code_verifier") || "";
    sessionStorage.removeItem("azure_code_verifier");

    setLoading(true);
    loginAzure(code, REDIRECT_URI, codeVerifier)
      .then((data) => {
        setAccessToken(data.accessToken);
        const roles = data.user?.roles ?? [];
        window.location.href = roles.includes("ADMIN") ? "/admin/dashboard" : "/dashboard";
      })
      .catch((err) => {
        const errMsg = err.errorCode
          ? `Lỗi ${err.errorCode}: ${err.message}`
          : `Đăng nhập thất bại: ${err.message}`;
        setErrorMessage(errMsg);
        setLoading(false);
      });
  }, []);

  const handleAzureLogin = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const url = await buildAzureAuthorizeUrl();
      window.location.href = url;
    } catch (err) {
      setErrorMessage("Lỗi tạo request: " + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

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
          <p>Sử dụng tài khoản doanh nghiệp để đăng nhập vào hệ thống xử lý văn bản điện tử</p>
          {errorMessage && (
            <div style={{ color: "#b91c1c", background: "#fef2f2", padding: "12px 14px", borderRadius: 10, marginBottom: 20, fontSize: 13, textAlign: "left", border: "1px solid #fca5a5" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Đăng nhập thất bại</div>
              <div>{errorMessage}</div>
            </div>
          )}
          <button className="office-btn" onClick={handleAzureLogin} disabled={loading}>
            <img src="https://img.icons8.com/color/48/azure-1.png" alt="Azure AD Icon" />
            <span>{loading ? "Đang xử lý..." : "Đăng nhập với Microsoft Azure AD"}</span>
          </button>
          <div className="login-footer">
            <p>Bảo mật bởi Microsoft Azure Active Directory</p>
            <p style={{ marginTop: 6 }}>© 2026 eOffice Intelligence System (eOIS)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
