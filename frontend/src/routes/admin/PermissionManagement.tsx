import { useState, useEffect } from "react";

interface Permission {
  id: number;
  nhomQuyen: string;
  chucNang: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

interface RolePermissions {
  nhomQuyen: string;
  permissions: Permission[];
}

export default function PermissionManagement() {
  const [roles, setRoles] = useState<RolePermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const features = [
    "Quản lý văn bản",
    "Duyệt văn bản",
    "Quản lý quy trình",
    "Quản lý người dùng",
    "Quản lý báo cáo",
    "Tích hợp Office 365",
    "AI Xử lý",
  ];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      // Replace with actual API
      setTimeout(() => {
        setRoles([
          {
            nhomQuyen: "ADMIN",
            permissions: features.map((feature, index) => ({
              id: index,
              nhomQuyen: "ADMIN",
              chucNang: feature,
              view: true,
              create: true,
              edit: true,
              delete: true,
              approve: true,
            })),
          },
          {
            nhomQuyen: "APPROVER",
            permissions: features.map((feature, index) => ({
              id: index,
              nhomQuyen: "APPROVER",
              chucNang: feature,
              view: true,
              create: feature !== "Quản lý người dùng",
              edit: feature !== "Quản lý người dùng",
              delete: false,
              approve: true,
            })),
          },
          {
            nhomQuyen: "USER",
            permissions: features.map((feature, index) => ({
              id: index,
              nhomQuyen: "USER",
              chucNang: feature,
              view: true,
              create: feature === "Quản lý văn bản",
              edit: feature === "Quản lý văn bản",
              delete: false,
              approve: false,
            })),
          },
        ]);
        setLoading(false);
        setSelectedRole("ADMIN");
      }, 500);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setLoading(false);
    }
  };

  const handlePermissionChange = (
    roleIndex: number,
    permissionIndex: number,
    field: keyof Omit<Permission, "id" | "nhomQuyen" | "chucNang">
  ) => {
    const newRoles = [...roles];
    (newRoles[roleIndex].permissions[permissionIndex][field] as boolean) = !newRoles[roleIndex].permissions[permissionIndex][field];
    setRoles(newRoles);
  };

  const handleSavePermissions = async () => {
    try {
      // Replace with actual API
      console.log("Saving permissions:", roles);
      alert("Lưu quyền hạn thành công!");
    } catch (error) {
      console.error("Error saving permissions:", error);
      alert("Lỗi khi lưu quyền hạn!");
    }
  };

  if (loading) {
    return <div className="admin-loading">Đang tải phân quyền...</div>;
  }

  const currentRoleData = roles.find((r) => r.nhomQuyen === selectedRole);

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Quản lý phân quyền</h2>
        <button
          className="button primary"
          onClick={handleSavePermissions}
        >
          💾 Lưu thay đổi
        </button>
      </div>

      <div className="role-selector">
        <label>Chọn nhóm quyền:</label>
        <div className="role-tabs">
          {roles.map((role) => (
            <button
              key={role.nhomQuyen}
              className={`tab ${selectedRole === role.nhomQuyen ? "active" : ""}`}
              onClick={() => setSelectedRole(role.nhomQuyen)}
            >
              {role.nhomQuyen}
            </button>
          ))}
        </div>
      </div>

      {currentRoleData && (
        <div className="permissions-table-wrapper">
          <table className="permissions-table">
            <thead>
              <tr>
                <th>Chức năng</th>
                <th>Xem</th>
                <th>Tạo</th>
                <th>Sửa</th>
                <th>Xóa</th>
                <th>Phê duyệt</th>
              </tr>
            </thead>
            <tbody>
              {currentRoleData.permissions.map((perm, index) => (
                <tr key={perm.id}>
                  <td className="feature-name">{perm.chucNang}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={perm.view}
                      onChange={() =>
                        handlePermissionChange(
                          roles.findIndex((r) => r.nhomQuyen === selectedRole),
                          index,
                          "view"
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={perm.create}
                      onChange={() =>
                        handlePermissionChange(
                          roles.findIndex((r) => r.nhomQuyen === selectedRole),
                          index,
                          "create"
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={perm.edit}
                      onChange={() =>
                        handlePermissionChange(
                          roles.findIndex((r) => r.nhomQuyen === selectedRole),
                          index,
                          "edit"
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={perm.delete}
                      onChange={() =>
                        handlePermissionChange(
                          roles.findIndex((r) => r.nhomQuyen === selectedRole),
                          index,
                          "delete"
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={perm.approve}
                      onChange={() =>
                        handlePermissionChange(
                          roles.findIndex((r) => r.nhomQuyen === selectedRole),
                          index,
                          "approve"
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
