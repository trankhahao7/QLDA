import { useState, useEffect } from "react";

interface User {
  id: number;
  userName: string;
  hoTen: string;
  email: string;
  dienThoai: string;
  donVi: string;
  chucVu: string;
  nhomQuyen: string;
  trangThai: number;
  ngayTao: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUnit, setFilterUnit] = useState("");

  const [formData, setFormData] = useState({
    userName: "",
    hoTen: "",
    email: "",
    dienThoai: "",
    donVi: "",
    chucVu: "",
    nhomQuyen: "USER",
    trangThai: 1,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Replace with actual API
      // const response = await fetch('/api/users');
      // const data = await response.json();
      // setUsers(data);

      // Mock data
      setTimeout(() => {
        setUsers([
          {
            id: 1,
            userName: "nguyenvana",
            hoTen: "Nguyễn Văn A",
            email: "a@example.com",
            dienThoai: "0912345678",
            donVi: "Phòng IT",
            chucVu: "Trưởng phòng",
            nhomQuyen: "ADMIN",
            trangThai: 1,
            ngayTao: "2024-01-15",
          },
          {
            id: 2,
            userName: "tranthib",
            hoTen: "Trần Thị B",
            email: "b@example.com",
            dienThoai: "0912345679",
            donVi: "Phòng Nhân sự",
            chucVu: "Nhân viên",
            nhomQuyen: "USER",
            trangThai: 1,
            ngayTao: "2024-02-20",
          },
          {
            id: 3,
            userName: "levanc",
            hoTen: "Lê Văn C",
            email: "c@example.com",
            dienThoai: "0912345680",
            donVi: "Phòng Tài chính",
            chucVu: "Kế toán trưởng",
            nhomQuyen: "APPROVER",
            trangThai: 1,
            ngayTao: "2024-03-10",
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      userName: "",
      hoTen: "",
      email: "",
      dienThoai: "",
      donVi: "",
      chucVu: "",
      nhomQuyen: "USER",
      trangThai: 1,
    });
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      userName: user.userName,
      hoTen: user.hoTen,
      email: user.email,
      dienThoai: user.dienThoai,
      donVi: user.donVi,
      chucVu: user.chucVu,
      nhomQuyen: user.nhomQuyen,
      trangThai: user.trangThai,
    });
    setShowForm(true);
  };

  const handleSaveUser = async () => {
    try {
      // Replace with actual API
      if (editingUser) {
        // await fetch(`/api/users/${editingUser.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData),
        // });
        console.log("Updating user:", formData);
      } else {
        // await fetch('/api/users', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData),
        // });
        console.log("Creating user:", formData);
      }

      setShowForm(false);
      await fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa người dùng này?")) {
      try {
        // await fetch(`/api/users/${id}`, { method: 'DELETE' });
        console.log("Deleting user:", id);
        await fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (filterUnit === "" || user.donVi === filterUnit)
  );

  if (loading) {
    return <div className="admin-loading">Đang tải danh sách người dùng...</div>;
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Quản lý người dùng</h2>
        <button
          className="button primary"
          onClick={handleAddUser}
        >
          + Thêm người dùng
        </button>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả đơn vị</option>
          <option value="Phòng IT">Phòng IT</option>
          <option value="Phòng Nhân sự">Phòng Nhân sự</option>
          <option value="Phòng Tài chính">Phòng Tài chính</option>
        </select>
      </div>

      {showForm && (
        <div className="admin-form-modal">
          <div className="modal-content">
            <h3>{editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</h3>
            <form>
              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) =>
                    setFormData({ ...formData, userName: e.target.value })
                  }
                  disabled={!!editingUser}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Họ tên</label>
                <input
                  type="text"
                  value={formData.hoTen}
                  onChange={(e) =>
                    setFormData({ ...formData, hoTen: e.target.value })
                  }
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Điện thoại</label>
                  <input
                    type="tel"
                    value={formData.dienThoai}
                    onChange={(e) =>
                      setFormData({ ...formData, dienThoai: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Đơn vị</label>
                  <select
                    value={formData.donVi}
                    onChange={(e) =>
                      setFormData({ ...formData, donVi: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="">Chọn đơn vị</option>
                    <option value="Phòng IT">Phòng IT</option>
                    <option value="Phòng Nhân sự">Phòng Nhân sự</option>
                    <option value="Phòng Tài chính">Phòng Tài chính</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Chức vụ</label>
                  <input
                    type="text"
                    value={formData.chucVu}
                    onChange={(e) =>
                      setFormData({ ...formData, chucVu: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nhóm quyền</label>
                  <select
                    value={formData.nhomQuyen}
                    onChange={(e) =>
                      setFormData({ ...formData, nhomQuyen: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="USER">Người dùng</option>
                    <option value="APPROVER">Người phê duyệt</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={formData.trangThai}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trangThai: parseInt(e.target.value),
                      })
                    }
                    className="form-input"
                  >
                    <option value="1">Hoạt động</option>
                    <option value="0">Khóa</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="button primary"
                  onClick={handleSaveUser}
                >
                  Lưu
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Tên đăng nhập</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Đơn vị</th>
            <th>Nhóm quyền</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.userName}</td>
              <td>{user.hoTen}</td>
              <td>{user.email}</td>
              <td>{user.donVi}</td>
              <td>
                <span className="badge badge-info">{user.nhomQuyen}</span>
              </td>
              <td>
                <span
                  className={`badge ${
                    user.trangThai === 1
                      ? "badge-success"
                      : "badge-danger"
                  }`}
                >
                  {user.trangThai === 1 ? "Hoạt động" : "Khóa"}
                </span>
              </td>
              <td>
                <button
                  className="button small"
                  onClick={() => handleEditUser(user)}
                >
                  Sửa
                </button>
                <button
                  className="button small danger"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <p>Tổng: {filteredUsers.length} người dùng</p>
      </div>
    </div>
  );
}
