import { useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState({
    hoTen: "Nguyễn Văn A",
    email: "vana@coquan.gov.vn",
    donVi: "Phòng Kế hoạch",
  });
  const [notifications, setNotifications] = useState({
    newDocs: true,
    deadline: false,
    office365: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
