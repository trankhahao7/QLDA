import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { fetchRoles, type RoleItem } from "../../services/auth/rolesApi";
import {
  fetchRolePermissions,
  updateRolePermissions,
  type RolePermissionItem,
} from "../../services/auth/permissionsApi";

type RolePermissionsState = {
  roleId: number;
  roleName: string;
  permissions: RolePermissionItem[];
};

export default function PermissionManagement() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchRoles({ page: 0, size: 100 });
        const roleItems = response.content || [];
        setRoles(roleItems);
        if (roleItems.length > 0) {
          setSelectedRoleId(roleItems[0].id);
        }
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải danh sách quyền";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) return;

    const loadPermissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchRolePermissions(selectedRoleId);
        setRolePermissions({
          roleId: response.roleId,
          roleName: response.tenNhomQuyen,
          permissions: response.permissions,
        });
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải phân quyền";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [selectedRoleId]);

  const handlePermissionChange = (
    permissionIndex: number,
    field: keyof Omit<RolePermissionItem, "id" | "chucNangId" | "maChucNang" | "tenChucNang">
  ) => {
    if (!rolePermissions) return;
    const updated = [...rolePermissions.permissions];
    updated[permissionIndex] = {
      ...updated[permissionIndex],
      [field]: !updated[permissionIndex][field],
    };
    setRolePermissions({ ...rolePermissions, permissions: updated });
  };

  const handleSavePermissions = async () => {
    if (!rolePermissions) return;
    try {
      await updateRolePermissions(
        rolePermissions.roleId,
        rolePermissions.permissions.map((perm) => ({
          chucNangId: perm.chucNangId,
          isView: perm.isView,
          isCreate: perm.isCreate,
          isEdit: perm.isEdit,
          isDelete: perm.isDelete,
          isApprove: perm.isApprove,
        }))
      );
      alert("Lưu quyền hạn thành công!");
    } catch (error) {
      console.error("Error saving permissions:", error);
      alert("Lỗi khi lưu quyền hạn!");
    }
  };

  const currentPermissions = useMemo(() => rolePermissions?.permissions || [], [rolePermissions]);

  if (loading) {
    return <div className="admin-loading">Đang tải phân quyền...</div>;
  }

  if (error) {
    return <div className="admin-loading">{error}</div>;
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Quản lý phân quyền</h2>
        <button
          className="button primary"
          onClick={handleSavePermissions}
          disabled={!rolePermissions}
        >
          💾 Lưu thay đổi
        </button>
      </div>

      <div className="role-selector">
        <label>Chọn nhóm quyền:</label>
        <div className="role-tabs">
          {roles.map((role) => (
            <button
              key={role.id}
              className={`tab ${selectedRoleId === role.id ? "active" : ""}`}
              onClick={() => setSelectedRoleId(role.id)}
            >
              {role.tenNhomQuyen}
            </button>
          ))}
        </div>
      </div>

      {rolePermissions && (
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
              {currentPermissions.map((perm, index) => (
                <tr key={perm.id}>
                  <td className="feature-name">{perm.tenChucNang}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={perm.isView}
                      onChange={() => handlePermissionChange(index, "isView")}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={perm.isCreate}
                      onChange={() => handlePermissionChange(index, "isCreate")}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={perm.isEdit}
                      onChange={() => handlePermissionChange(index, "isEdit")}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={perm.isDelete}
                      onChange={() => handlePermissionChange(index, "isDelete")}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={perm.isApprove}
                      onChange={() => handlePermissionChange(index, "isApprove")}
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
