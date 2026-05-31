import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { fetchRoles } from "../../services/auth/rolesApi";
import { fetchUnits } from "../../services/units/unitsApi";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
  type UserItem,
} from "../../services/auth/usersApi";

type UnitOption = {
  id: number;
  tenDonVi: string;
};

type RoleOption = {
  id: number;
  tenNhomQuyen: string;
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUnit, setFilterUnit] = useState<number | "">("");
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);

  const [formData, setFormData] = useState({
    username: "",
    hoTen: "",
    email: "",
    dienThoai: "",
    donViId: undefined as number | undefined,
    chucVu: "",
    nhomQuyenId: undefined as number | undefined,
    trangThai: 1,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersResponse, unitsResponse, rolesResponse] = await Promise.all([
          fetchUsers({ page: 0, size: 50 }),
          fetchUnits({ page: 0, size: 200 }),
          fetchRoles({ page: 0, size: 200 }),
        ]);

        setUsers(usersResponse.content || []);
        setUnits(
          (unitsResponse.content || []).map((unit) => ({
            id: unit.id,
            tenDonVi: unit.tenDonVi,
          }))
        );
        setRoles(
          (rolesResponse.content || []).map((role) => ({
            id: role.id,
            tenNhomQuyen: role.tenNhomQuyen,
          }))
        );
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải dữ liệu";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      hoTen: "",
      email: "",
      dienThoai: "",
      donViId: undefined,
      chucVu: "",
      nhomQuyenId: undefined,
      trangThai: 1,
    });
    setShowForm(true);
  };

  const handleEditUser = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      hoTen: user.hoTen,
      email: user.email,
      dienThoai: user.dienThoai || "",
      donViId: user.donViId,
      chucVu: user.chucVu || "",
      nhomQuyenId: user.nhomQuyenId,
      trangThai: user.trangThai,
    });
    setShowForm(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          hoTen: formData.hoTen,
          email: formData.email,
          dienThoai: formData.dienThoai,
          donViId: formData.donViId,
          chucVu: formData.chucVu,
          nhomQuyenId: formData.nhomQuyenId,
          trangThai: formData.trangThai,
        });
      } else {
        await createUser({
          username: formData.username,
          hoTen: formData.hoTen,
          email: formData.email,
          dienThoai: formData.dienThoai,
          donViId: formData.donViId,
          chucVu: formData.chucVu,
          nhomQuyenId: formData.nhomQuyenId,
        });
      }

      setShowForm(false);
      const response = await fetchUsers({ page: 0, size: 50 });
      setUsers(response.content || []);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa người dùng này?")) {
      try {
        await deleteUser(id);
        const response = await fetchUsers({ page: 0, size: 50 });
        setUsers(response.content || []);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm && filterUnit === "") return users;
    return users.filter((user) => {
      const matchesKeyword =
        user.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUnit = filterUnit === "" || user.donViId === filterUnit;
      return matchesKeyword && matchesUnit;
    });
  }, [users, searchTerm, filterUnit]);

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải danh sách người dùng...</span></div>;
  }

  if (error) {
    return <div className="admin-loading">{error}</div>;
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
          onChange={(e) => setFilterUnit(e.target.value ? Number(e.target.value) : "")}
          className="filter-select"
        >
          <option value="">Tất cả đơn vị</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.tenDonVi}
            </option>
          ))}
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
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
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
                    value={formData.donViId ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        donViId: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="form-input"
                  >
                    <option value="">Chọn đơn vị</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.tenDonVi}
                      </option>
                    ))}
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
                    value={formData.nhomQuyenId ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nhomQuyenId: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="form-input"
                  >
                    <option value="">Chọn nhóm quyền</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.tenNhomQuyen}
                      </option>
                    ))}
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
              <td>{user.username}</td>
              <td>{user.hoTen}</td>
              <td>{user.email}</td>
              <td>{user.tenDonVi || "-"}</td>
              <td>
                <span className="badge badge-info">{user.tenNhomQuyen || "-"}</span>
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
