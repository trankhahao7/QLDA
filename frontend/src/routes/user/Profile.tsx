import { useEffect, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { getCurrentUser } from "../../services/auth/authApi";
import { updateMyProfile } from "../../services/auth/meApi";

export default function Profile() {
  const [profile, setProfile] = useState({ hoTen: "", email: "", donVi: "" });
  const [userId, setUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({ newDocs: true, deadline: false, office365: true });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await getCurrentUser();
        setUserId(user.id);
        setProfile({ hoTen: user.hoTen, email: user.email, donVi: user.donViId ? String(user.donViId) : "" });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Không thể tải hồ sơ");
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    try {
      await updateMyProfile(userId, { hoTen: profile.hoTen, email: profile.email });
      setError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lưu thất bại");
    }
  };

  const initials = profile.hoTen
    ? profile.hoTen.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Thông tin tài khoản</h1>
          <p>Cập nhật thông tin cá nhân và cài đặt thông báo.</p>
        </div>
        <div className="topbar__actions">
          <button className="button" type="button" onClick={handleSave}>
            Lưu thay đổi
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error" style={{ marginBottom: 16 }}>{error}</div>}
      {saved && <div className="alert alert--success" style={{ marginBottom: 16 }}>Thông tin đã được lưu thành công.</div>}

      <div className="grid-2">
        <div className="card">
          <div className="profile-header">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-header-info">
              <h2>{profile.hoTen || "Người dùng"}</h2>
              <p>{profile.email}</p>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__title">Thông tin cơ bản</div>
            <div className="form-field">
              <label className="form-label">Họ và tên</label>
              <input
                className="form-control"
                value={profile.hoTen}
                onChange={(e) => setProfile({ ...profile, hoTen: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Đơn vị</label>
              <input
                className="form-control"
                value={profile.donVi}
                onChange={(e) => setProfile({ ...profile, donVi: e.target.value })}
                disabled
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="form-section">
            <div className="form-section__title">Cài đặt thông báo</div>

            {([
              { key: "newDocs", label: "Nhận thông báo khi có văn bản mới", icon: "📥" },
              { key: "deadline", label: "Nhận nhắc việc sắp đến hạn", icon: "⏰" },
              { key: "office365", label: "Đồng bộ lịch Office 365", icon: "📅" },
            ] as const).map(({ key, label, icon }) => (
              <label
                key={key}
                style={{
                  display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                  padding: "10px 0", borderBottom: "1px solid var(--border)",
                }}
              >
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer" }}
                />
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 14, color: "var(--text)" }}>{label}</span>
              </label>
            ))}
          </div>

          <div className="form-section" style={{ marginTop: 8 }}>
            <div className="form-section__title">Bảo mật</div>
            <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>🔒</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>Azure Active Directory</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Xác thực qua Microsoft 365</div>
              </div>
              <span className="badge badge--success" style={{ marginLeft: "auto" }}>Đã kết nối</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
