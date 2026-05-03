import { useState, useEffect } from "react";

interface DocumentType {
  id: number;
  maLoai: string;
  tenLoai: string;
  moTa: string;
  suDung: boolean;
}

export default function DocumentTypeManagement() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<DocumentType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    maLoai: "",
    tenLoai: "",
    moTa: "",
    suDung: true,
  });

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const fetchDocumentTypes = async () => {
    try {
      // Replace with actual API
      setTimeout(() => {
        setDocumentTypes([
          {
            id: 1,
            maLoai: "CT",
            tenLoai: "Công văn",
            moTa: "Văn bản công vụ thường dùng",
            suDung: true,
          },
          {
            id: 2,
            maLoai: "TB",
            tenLoai: "Thông báo",
            moTa: "Văn bản thông báo nội bộ",
            suDung: true,
          },
          {
            id: 3,
            maLoai: "TT",
            tenLoai: "Tờ trình",
            moTa: "Văn bản trình báo cáo",
            suDung: true,
          },
          {
            id: 4,
            maLoai: "QD",
            tenLoai: "Quyết định",
            moTa: "Văn bản quyết định chính thức",
            suDung: true,
          },
          {
            id: 5,
            maLoai: "BN",
            tenLoai: "Biên bản",
            moTa: "Văn bản ghi chép kết quả họp",
            suDung: true,
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching document types:", error);
      setLoading(false);
    }
  };

  const handleAddType = () => {
    setEditingType(null);
    setFormData({
      maLoai: "",
      tenLoai: "",
      moTa: "",
      suDung: true,
    });
    setShowForm(true);
  };

  const handleEditType = (type: DocumentType) => {
    setEditingType(type);
    setFormData({
      maLoai: type.maLoai,
      tenLoai: type.tenLoai,
      moTa: type.moTa,
      suDung: type.suDung,
    });
    setShowForm(true);
  };

  const handleSaveType = async () => {
    try {
      if (!formData.maLoai || !formData.tenLoai) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      // Replace with actual API
      console.log("Saving document type:", formData);
      setShowForm(false);
      await fetchDocumentTypes();
    } catch (error) {
      console.error("Error saving document type:", error);
    }
  };

  const handleDeleteType = async (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa loại văn bản này?")) {
      try {
        // Replace with actual API
        console.log("Deleting document type:", id);
        await fetchDocumentTypes();
      } catch (error) {
        console.error("Error deleting document type:", error);
      }
    }
  };

  const filteredTypes = documentTypes.filter(
    (type) =>
      type.tenLoai.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.maLoai.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-loading">Đang tải loại văn bản...</div>
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
                  value={formData.maLoai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maLoai: e.target.value.toUpperCase(),
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
                  value={formData.tenLoai}
                  onChange={(e) =>
                    setFormData({ ...formData, tenLoai: e.target.value })
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
                <span className="code-badge">{type.maLoai}</span>
              </td>
              <td>{type.tenLoai}</td>
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
