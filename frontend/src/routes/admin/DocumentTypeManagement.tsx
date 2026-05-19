import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import {
  createDocumentType,
  deleteDocumentType,
  fetchDocumentTypes,
  updateDocumentType,
  type DocumentTypeItem,
} from "../../services/documents/documentTypesApi";

export default function DocumentTypeManagement() {
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<DocumentTypeItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    maLoaiVanBan: "",
    tenLoaiVanBan: "",
    moTa: "",
    suDung: true,
  });

  useEffect(() => {
    const loadTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDocumentTypes({ keyword: searchTerm || undefined });
        setDocumentTypes(data || []);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải loại văn bản";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadTypes();
  }, []);

  const handleAddType = () => {
    setEditingType(null);
    setFormData({
      maLoaiVanBan: "",
      tenLoaiVanBan: "",
      moTa: "",
      suDung: true,
    });
    setShowForm(true);
  };

  const handleEditType = (type: DocumentTypeItem) => {
    setEditingType(type);
    setFormData({
      maLoaiVanBan: type.maLoaiVanBan,
      tenLoaiVanBan: type.tenLoaiVanBan,
      moTa: type.moTa || "",
      suDung: type.suDung,
    });
    setShowForm(true);
  };

  const handleSaveType = async () => {
    try {
      if (!formData.maLoaiVanBan || !formData.tenLoaiVanBan) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      if (editingType) {
        await updateDocumentType(editingType.id, {
          tenLoaiVanBan: formData.tenLoaiVanBan,
          moTa: formData.moTa,
          suDung: formData.suDung,
        });
      } else {
        await createDocumentType({
          maLoaiVanBan: formData.maLoaiVanBan,
          tenLoaiVanBan: formData.tenLoaiVanBan,
          moTa: formData.moTa,
          suDung: formData.suDung,
        });
      }

      setShowForm(false);
      const data = await fetchDocumentTypes({ keyword: searchTerm || undefined });
      setDocumentTypes(data || []);
    } catch (error) {
      console.error("Error saving document type:", error);
    }
  };

  const handleDeleteType = async (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa loại văn bản này?")) {
      try {
        await deleteDocumentType(id);
        const data = await fetchDocumentTypes({ keyword: searchTerm || undefined });
        setDocumentTypes(data || []);
      } catch (error) {
        console.error("Error deleting document type:", error);
      }
    }
  };

  const filteredTypes = useMemo(() => {
    if (!searchTerm) return documentTypes;
    return documentTypes.filter(
      (type) =>
        type.tenLoaiVanBan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.maLoaiVanBan.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documentTypes, searchTerm]);

  if (loading) {
    return (
      <div className="admin-loading">Đang tải loại văn bản...</div>
    );
  }

  if (error) {
    return (
      <div className="admin-loading">{error}</div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Quản lý loại văn bản</h2>
        <button
          className="button primary"
          onClick={handleAddType}
        >
          + Thêm loại văn bản
        </button>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã hoặc tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {showForm && (
        <div className="admin-form-modal">
          <div className="modal-content">
            <h3>
              {editingType
                ? "Chỉnh sửa loại văn bản"
                : "Thêm loại văn bản mới"}
            </h3>
            <form>
              <div className="form-group">
                <label>Mã loại văn bản *</label>
                <input
                  type="text"
                  value={formData.maLoaiVanBan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maLoaiVanBan: e.target.value.toUpperCase(),
                    })
                  }
                  disabled={!!editingType}
                  placeholder="VD: CT, TB, QD..."
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Tên loại văn bản *</label>
                <input
                  type="text"
                  value={formData.tenLoaiVanBan}
                  onChange={(e) =>
                    setFormData({ ...formData, tenLoaiVanBan: e.target.value })
                  }
                  placeholder="VD: Công văn, Thông báo..."
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) =>
                    setFormData({ ...formData, moTa: e.target.value })
                  }
                  placeholder="Mô tả chi tiết loại văn bản này"
                  rows={4}
                  className="form-input"
                ></textarea>
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
                  onClick={handleSaveType}
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
            <th>Mã loại</th>
            <th>Tên loại</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredTypes.map((type) => (
            <tr key={type.id}>
              <td>
                <span className="code-badge">{type.maLoaiVanBan}</span>
              </td>
              <td>{type.tenLoaiVanBan}</td>
              <td className="text-truncate">{type.moTa}</td>
              <td>
                <span
                  className={`badge ${
                    type.suDung ? "badge-success" : "badge-danger"
                  }`}
                >
                  {type.suDung ? "Sử dụng" : "Không sử dụng"}
                </span>
              </td>
              <td>
                <button
                  className="button small"
                  onClick={() => handleEditType(type)}
                >
                  Sửa
                </button>
                <button
                  className="button small danger"
                  onClick={() => handleDeleteType(type.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <p>Tổng: {filteredTypes.length} loại văn bản</p>
      </div>
    </div>
  );
}
