import { useEffect, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { getCurrentUser } from "../../services/auth/authApi";
import { updateMyProfile } from "../../services/auth/meApi";

export default function Profile() {
  const [profile, setProfile] = useState({
    hoTen: "Nguyễn Văn A",
    email: "vana@coquan.gov.vn",
    donVi: "Phòng Kế hoạch",
  });
  const [userId, setUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    newDocs: true,
    deadline: false,
    office365: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await getCurrentUser();
        setUserId(user.id);
        setProfile({
          hoTen: user.hoTen,
          email: user.email,
          donVi: user.donViId ? String(user.donViId) : "",
        });
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải hồ sơ";
        setError(message);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    try {
      await updateMyProfile(userId, {
        hoTen: profile.hoTen,
        email: profile.email,
      });
      setError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Lưu thất bại";
      setError(message);
    }
  };

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

      <div className="grid-2">
        {error && (
          <div className="card" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}
        <div className="card">
          <h3>Thông tin cơ bản</h3>
          <form className="form-grid">
            <label>
              Họ và tên
              <input
                value={profile.hoTen}
                onChange={(e) =>
                  setProfile({ ...profile, hoTen: e.target.value })
                }
              />
            </label>
            <label>
              Email
              <input
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />
            </label>
            <label>
              Đơn vị
              <input
                value={profile.donVi}
                onChange={(e) =>
                  setProfile({ ...profile, donVi: e.target.value })
                }
              />
            </label>
          </form>
        </div>
        <div className="card">
          <h3>Thông báo</h3>
          <div className="form-grid">
            <label>
              <input
                type="checkbox"
                checked={notifications.newDocs}
                onChange={(e) =>
                  setNotifications({ ...notifications, newDocs: e.target.checked })
                }
              />
              Nhận thông báo khi có văn bản mới
            </label>
            <label>
              <input
                type="checkbox"
                checked={notifications.deadline}
                onChange={(e) =>
                  setNotifications({ ...notifications, deadline: e.target.checked })
                }
              />
              Nhận nhắc việc sắp đến hạn
            </label>
            <label>
              <input
                type="checkbox"
                checked={notifications.office365}
                onChange={(e) =>
                  setNotifications({ ...notifications, office365: e.target.checked })
                }
              />
              Đồng bộ lịch Office 365
            </label>
            {saved && (
              <div
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  background: "rgba(34, 197, 94, 0.1)",
                  color: "#22c55e",
                }}
              >
                Cấu hình đã được lưu
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
