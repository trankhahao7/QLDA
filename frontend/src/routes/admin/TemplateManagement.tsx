import { useState, useEffect } from "react";

interface Template {
  id: number;
  maTemplate: string;
  tenTemplate: string;
  loaiVanBan: string;
  noiDungMau: string;
  tepMau: string;
  suDung: boolean;
}

export default function TemplateManagement() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    maTemplate: "",
    tenTemplate: "",
    loaiVanBan: "",
    noiDungMau: "",
    tepMau: "",
    suDung: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      // Replace with actual API
      setTimeout(() => {
        setTemplates([
          {
            id: 1,
            maTemplate: "TMP001",
            tenTemplate: "Template công văn hành chính",
            loaiVanBan: "Công văn",
            noiDungMau: "Văn phòng chủ tịch ...",
            tepMau: "template_cv.docx",
            suDung: true,
          },
          {
            id: 2,
            maTemplate: "TMP002",
            tenTemplate: "Template thông báo nội bộ",
            loaiVanBan: "Thông báo",
            noiDungMau: "Thông báo số ... năm ...",
            tepMau: "template_tb.docx",
            suDung: true,
          },
          {
            id: 3,
            maTemplate: "TMP003",
            tenTemplate: "Template quyết định",
            loaiVanBan: "Quyết định",
            noiDungMau: "Quyết định số ... năm ...",
            tepMau: "template_qd.docx",
            suDung: true,
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setLoading(false);
    }
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      maTemplate: "",
      tenTemplate: "",
      loaiVanBan: "",
      noiDungMau: "",
      tepMau: "",
      suDung: true,
    });
    setShowForm(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      maTemplate: template.maTemplate,
      tenTemplate: template.tenTemplate,
      loaiVanBan: template.loaiVanBan,
      noiDungMau: template.noiDungMau,
      tepMau: template.tepMau,
      suDung: template.suDung,
    });
    setShowForm(true);
  };

  const handleSaveTemplate = async () => {
    try {
      if (!formData.maTemplate || !formData.tenTemplate) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      // Replace with actual API
      console.log("Saving template:", formData);
      setShowForm(false);
      await fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa template này?")) {
      try {
        // Replace with actual API
        console.log("Deleting template:", id);
        await fetchTemplates();
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  const handleDownloadTemplate = (template: Template) => {
    // Simulate download
    alert(`Đang tải xuống template: ${template.tepMau}`);
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.tenTemplate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.maTemplate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-loading">Đang tải template...</div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Quản lý template văn bản</h2>
        <button
          className="button primary"
          onClick={handleAddTemplate}
        >
          + Thêm template
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
              {editingTemplate
                ? "Chỉnh sửa template"
                : "Thêm template mới"}
            </h3>
            <form>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã template *</label>
                  <input
                    type="text"
                    value={formData.maTemplate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maTemplate: e.target.value.toUpperCase(),
                      })
                    }
                    disabled={!!editingTemplate}
                    placeholder="VD: TMP001"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Tên template *</label>
                  <input
                    type="text"
                    value={formData.tenTemplate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tenTemplate: e.target.value,
                      })
                    }
                    placeholder="Tên template"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Loại văn bản</label>
                <select
                  value={formData.loaiVanBan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loaiVanBan: e.target.value,
                    })
                  }
                  className="form-input"
                >
                  <option value="">Chọn loại văn bản</option>
                  <option value="Công văn">Công văn</option>
                  <option value="Thông báo">Thông báo</option>
                  <option value="Quyết định">Quyết định</option>
                  <option value="Tờ trình">Tờ trình</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nội dung mẫu</label>
                <textarea
                  value={formData.noiDungMau}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      noiDungMau: e.target.value,
                    })
                  }
                  placeholder="Nội dung mẫu văn bản"
                  rows={6}
                  className="form-input"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Tệp mẫu (tên file)</label>
                <input
                  type="text"
                  value={formData.tepMau}
                  onChange={(e) =>
                    setFormData({ ...formData, tepMau: e.target.value })
                  }
                  placeholder="template.docx"
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
                  onClick={handleSaveTemplate}
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

      <div className="templates-grid">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <h4>{template.tenTemplate}</h4>
              <span
                className={`badge ${
                  template.suDung ? "badge-success" : "badge-danger"
                }`}
              >
                {template.suDung ? "Sử dụng" : "Không sử dụng"}
              </span>
            </div>
            <div className="template-body">
              <p className="template-code">
                Mã: <span className="code-badge">{template.maTemplate}</span>
              </p>
              <p className="template-type">Loại: {template.loaiVanBan}</p>
              <p className="template-file">File: {template.tepMau}</p>
              <div className="template-preview">
                <p className="preview-text">
                  {template.noiDungMau.substring(0, 100)}...
                </p>
              </div>
            </div>
            <div className="template-actions">
              <button
                className="button small"
                onClick={() => handleDownloadTemplate(template)}
              >
                📥 Tải xuống
              </button>
              <button
                className="button small"
                onClick={() => handleEditTemplate(template)}
              >
                Sửa
              </button>
              <button
                className="button small danger"
                onClick={() => handleDeleteTemplate(template.id)}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <p>Tổng: {filteredTemplates.length} template</p>
      </div>
    </div>
  );
}
