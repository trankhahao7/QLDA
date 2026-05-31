import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { createUnit, deleteUnit, fetchUnits, updateUnit } from "../../services/units/unitsApi";

interface Unit {
  id: number;
  maDonVi: string;
  tenDonVi: string;
  donViChaId?: number | null;
  tenDonViCha?: string | null;
  dienThoai?: string;
  email?: string;
  diaChi?: string;
  suDung: boolean;
}

export default function UnitManagement() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    maDonVi: "",
    tenDonVi: "",
    donViChaId: undefined as number | undefined,
    dienThoai: "",
    email: "",
    diaChi: "",
    suDung: true,
  });

  useEffect(() => {
    const loadUnits = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchUnits({ page: 0, size: 200, keyword: searchTerm || undefined });
        setUnits(response.content || []);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải đơn vị";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, []);

  const handleAddUnit = () => {
    setEditingUnit(null);
    setFormData({
      maDonVi: "",
      tenDonVi: "",
      donViChaId: undefined,
      dienThoai: "",
      email: "",
      diaChi: "",
      suDung: true,
    });
    setShowForm(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      maDonVi: unit.maDonVi,
      tenDonVi: unit.tenDonVi,
      donViChaId: unit.donViChaId || undefined,
      dienThoai: unit.dienThoai || "",
      email: unit.email || "",
      diaChi: unit.diaChi || "",
      suDung: unit.suDung,
    });
    setShowForm(true);
  };

  const handleSaveUnit = async () => {
    try {
      if (!formData.maDonVi || !formData.tenDonVi) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      if (editingUnit) {
        await updateUnit(editingUnit.id, {
          maDonVi: formData.maDonVi,
          tenDonVi: formData.tenDonVi,
          donViChaId: formData.donViChaId || null,
          dienThoai: formData.dienThoai,
          email: formData.email,
          diaChi: formData.diaChi,
          suDung: formData.suDung,
        });
      } else {
        await createUnit({
          maDonVi: formData.maDonVi,
          tenDonVi: formData.tenDonVi,
          donViChaId: formData.donViChaId || null,
          dienThoai: formData.dienThoai,
          email: formData.email,
          diaChi: formData.diaChi,
        });
      }

      setShowForm(false);
      const response = await fetchUnits({ page: 0, size: 200 });
      setUnits(response.content || []);
    } catch (error) {
      console.error("Error saving unit:", error);
    }
  };

  const handleDeleteUnit = async (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa đơn vị này?")) {
      try {
        await deleteUnit(id);
        const response = await fetchUnits({ page: 0, size: 200 });
        setUnits(response.content || []);
      } catch (error) {
        console.error("Error deleting unit:", error);
      }
    }
  };

  const filteredUnits = useMemo(() => {
    if (!searchTerm) return units;
    return units.filter(
      (unit) =>
        unit.tenDonVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.maDonVi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [units, searchTerm]);

  const unitNameById = useMemo(() => {
    return new Map(units.map((unit) => [unit.id, unit.tenDonVi]));
  }, [units]);

  if (loading) {
    return (
      <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải đơn vị...</span></div>
    );
  }

  if (error) {
    return (
      <div className="admin-loading">{error}</span></div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Quản lý đơn vị</h2>
        <button
          className="button primary"
          onClick={handleAddUnit}
        >
          + Thêm đơn vị
        </button>
      </span></div>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc mã..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </span></div>

      {showForm && (
        <div className="admin-form-modal">
          <div className="modal-content">
            <h3>
              {editingUnit ? "Chỉnh sửa đơn vị" : "Thêm đơn vị mới"}
            </h3>
            <form>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã đơn vị *</label>
                  <input
                    type="text"
                    value={formData.maDonVi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maDonVi: e.target.value.toUpperCase(),
                      })
                    }
                    disabled={!!editingUnit}
                    placeholder="VD: PHIT"
                    className="form-input"
                  />
                </span></div>
                <div className="form-group">
                  <label>Tên đơn vị *</label>
                  <input
                    type="text"
                    value={formData.tenDonVi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tenDonVi: e.target.value,
                      })
                    }
                    placeholder="Tên đơn vị"
                    className="form-input"
                  />
                </span></div>
              </span></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Đơn vị cha</label>
                  <select
                    value={formData.donViChaId ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        donViChaId: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="form-input"
                  >
                    <option value="">Không có</option>
                    {units
                      .filter((unit) => !editingUnit || unit.id !== editingUnit.id)
                      .map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.tenDonVi}
                        </option>
                      ))}
                  </select>
                </span></div>
                <div className="form-group">
                  <label>Điện thoại</label>
                  <input
                    type="tel"
                    value={formData.dienThoai}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dienThoai: e.target.value,
                      })
                    }
                    placeholder="0234567890"
                    className="form-input"
                  />
                </span></div>
              </span></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="unit@example.com"
                    className="form-input"
                  />
                </span></div>
              </span></div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  value={formData.diaChi}
                  onChange={(e) =>
                    setFormData({ ...formData, diaChi: e.target.value })
                  }
                  placeholder="Địa chỉ đơn vị"
                  className="form-input"
                />
              </span></div>
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="suDung"
                  checked={formData.suDung}
                  onChange={(e) =>
                    setFormData({ ...formData, suDung: e.target.checked })
                  }
                />
                <label htmlFor="suDung">Sử dụng</label>
              </span></div>
              <div className="form-actions">
                <button
                  type="button"
                  className="button primary"
                  onClick={handleSaveUnit}
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
              </span></div>
            </form>
          </span></div>
        </span></div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã đơn vị</th>
            <th>Tên đơn vị</th>
            <th>Đơn vị cha</th>
            <th>Điện thoại</th>
            <th>Email</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredUnits.map((unit) => (
            <tr key={unit.id}>
              <td>
                <span className="code-badge">{unit.maDonVi}</span>
              </td>
              <td>{unit.tenDonVi}</td>
              <td>{unit.tenDonViCha || (unit.donViChaId ? unitNameById.get(unit.donViChaId) : "-") || "-"}</td>
              <td>{unit.dienThoai}</td>
              <td>{unit.email}</td>
              <td>
                <span
                  className={`badge ${
                    unit.suDung ? "badge-success" : "badge-danger"
                  }`}
                >
                  {unit.suDung ? "Sử dụng" : "Không sử dụng"}
                </span>
              </td>
              <td>
                <button
                  className="button small"
                  onClick={() => handleEditUnit(unit)}
                >
                  Sửa
                </button>
                <button
                  className="button small danger"
                  onClick={() => handleDeleteUnit(unit.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <p>Tổng: {filteredUnits.length} đơn vị</p>
      </span></div>
    </span></div>
  );
}
