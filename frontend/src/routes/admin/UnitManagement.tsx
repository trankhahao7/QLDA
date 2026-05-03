import { useState, useEffect } from "react";

interface Unit {
  id: number;
  maDonVi: string;
  tenDonVi: string;
  donViCha: string | null;
  dienThoai: string;
  email: string;
  diaChi: string;
  suDung: boolean;
}

export default function UnitManagement() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    maDonVi: "",
    tenDonVi: "",
    donViCha: "",
    dienThoai: "",
    email: "",
    diaChi: "",
    suDung: true,
  });

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      // Replace with actual API
      setTimeout(() => {
        setUnits([
          {
            id: 1,
            maDonVi: "VP",
            tenDonVi: "Văn phòng Chủ tịch",
            donViCha: null,
            dienThoai: "0234567890",
            email: "vpct@example.com",
            diaChi: "123 Đường A, Hà Nội",
            suDung: true,
          },
          {
            id: 2,
            maDonVi: "PHIT",
            tenDonVi: "Phòng IT",
            donViCha: "VP",
            dienThoai: "0234567891",
            email: "phit@example.com",
            diaChi: "123 Đường A, Tầng 2, Hà Nội",
            suDung: true,
          },
          {
            id: 3,
            maDonVi: "PHNS",
            tenDonVi: "Phòng Nhân sự",
            donViCha: "VP",
            dienThoai: "0234567892",
            email: "phns@example.com",
            diaChi: "123 Đường A, Tầng 1, Hà Nội",
            suDung: true,
          },
          {
            id: 4,
            maDonVi: "PHTC",
            tenDonVi: "Phòng Tài chính",
            donViCha: "VP",
            dienThoai: "0234567893",
            email: "phtc@example.com",
            diaChi: "123 Đường A, Tầng 3, Hà Nội",
            suDung: true,
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching units:", error);
      setLoading(false);
    }
  };

  const handleAddUnit = () => {
    setEditingUnit(null);
    setFormData({
      maDonVi: "",
      tenDonVi: "",
      donViCha: "",
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
      donViCha: unit.donViCha || "",
      dienThoai: unit.dienThoai,
      email: unit.email,
      diaChi: unit.diaChi,
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

      // Replace with actual API
      console.log("Saving unit:", formData);
      setShowForm(false);
      await fetchUnits();
    } catch (error) {
      console.error("Error saving unit:", error);
    }
  };

  const handleDeleteUnit = async (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa đơn vị này?")) {
      try {
        // Replace with actual API
        console.log("Deleting unit:", id);
        await fetchUnits();
      } catch (error) {
        console.error("Error deleting unit:", error);
      }
    }
  };

  const filteredUnits = units.filter(
    (unit) =>
      unit.tenDonVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.maDonVi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-loading">Đang tải đơn vị...</div>
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
      </div>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc mã..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

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
                </div>
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
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Đơn vị cha</label>
                  <select
                    value={formData.donViCha}
                    onChange={(e) =>
                      setFormData({ ...formData, donViCha: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="">Không có</option>
                    <option value="VP">Văn phòng Chủ tịch</option>
                    {filteredUnits.map((unit) => (
                      <option key={unit.id} value={unit.tenDonVi}>
                        {unit.tenDonVi}
                      </option>
                    ))}
                  </select>
                </div>
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
                </div>
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
                    placeholder="unit@example.com"
                    className="form-input"
                  />
                </div>
              </div>
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
              </div>
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
              </div>
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
              </div>
            </form>
          </div>
        </div>
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
              <td>{unit.donViCha || "-"}</td>
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
      </div>
    </div>
  );
}
