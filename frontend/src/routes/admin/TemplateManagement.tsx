import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { fetchDocumentTypes } from "../../services/documents/documentTypesApi";
import {
  createTemplate,
  deleteTemplate,
  fetchTemplates,
  updateTemplate,
  type TemplateItem,
} from "../../services/documents/templatesApi";

type DocumentTypeOption = {
  id: number;
  tenLoaiVanBan: string;
};

export default function TemplateManagement() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    maTemplate: "",
    tenTemplate: "",
    loaiVanBanId: undefined as number | undefined,
    noiDungMau: "",
    tepMau: "",
    suDung: true,
  });

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const [templatesResponse, typesResponse] = await Promise.all([
          fetchTemplates({ page: 0, size: 100, keyword: searchTerm || undefined }),
          fetchDocumentTypes({}),
        ]);

        setTemplates(templatesResponse.content || []);
        setDocumentTypes(
          (typesResponse || []).map((item) => ({
            id: item.id,
            tenLoaiVanBan: item.tenLoaiVanBan,
          }))
        );
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải template";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      maTemplate: "",
      tenTemplate: "",
      loaiVanBanId: undefined,
      noiDungMau: "",
      tepMau: "",
      suDung: true,
    });
    setShowForm(true);
  };

  const handleEditTemplate = (template: TemplateItem) => {
    setEditingTemplate(template);
    setFormData({
      maTemplate: template.maTemplate,
      tenTemplate: template.tenTemplate,
      loaiVanBanId: template.loaiVanBanId,
      noiDungMau: template.noiDungMau || "",
      tepMau: template.tepMau || "",
      suDung: template.suDung,
    });
    setShowForm(true);
  };

  const handleSaveTemplate = async () => {
    try {
      if (!formData.maTemplate || !formData.tenTemplate || !formData.loaiVanBanId) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, {
          tenTemplate: formData.tenTemplate,
          loaiVanBanId: formData.loaiVanBanId,
          noiDungMau: formData.noiDungMau,
          tepMau: formData.tepMau,
          suDung: formData.suDung,
        });
      } else {
        await createTemplate({
          maTemplate: formData.maTemplate,
          tenTemplate: formData.tenTemplate,
          loaiVanBanId: formData.loaiVanBanId,
          noiDungMau: formData.noiDungMau,
          tepMau: formData.tepMau,
          suDung: formData.suDung,
        });
      }

      setShowForm(false);
      const templatesResponse = await fetchTemplates({ page: 0, size: 100, keyword: searchTerm || undefined });
      setTemplates(templatesResponse.content || []);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa template này?")) {
      try {
        await deleteTemplate(id);
        const templatesResponse = await fetchTemplates({ page: 0, size: 100, keyword: searchTerm || undefined });
        setTemplates(templatesResponse.content || []);
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  const handleDownloadTemplate = (template: TemplateItem) => {
    if (!template.tepMau) {
      alert("Template chưa có tệp mẫu để tải.");
      return;
    }
    window.open(template.tepMau, "_blank");
  };

  const filteredTemplates = useMemo(() => {
    if (!searchTerm) return templates;
    return templates.filter(
      (template) =>
        template.tenTemplate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.maTemplate.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  const typeNameById = useMemo(() => {
    return new Map(documentTypes.map((type) => [type.id, type.tenLoaiVanBan]));
  }, [documentTypes]);

  if (loading) {
    return (
      <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải template...</span></div>
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
        <h2>Quản lý template văn bản</h2>
        <button
          className="button primary"
          onClick={handleAddTemplate}
        >
          + Thêm template
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
                </span></div>
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
                </span></div>
              </span></div>
              <div className="form-group">
                <label>Loại văn bản</label>
                <select
                  value={formData.loaiVanBanId ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loaiVanBanId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="form-input"
                >
                  <option value="">Chọn loại văn bản</option>
                  {documentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.tenLoaiVanBan}
                    </option>
                  ))}
                </select>
              </span></div>
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
              </span></div>
              <div className="form-group">
                <label>Tệp mẫu (URL hoặc tên file)</label>
                <input
                  type="text"
                  value={formData.tepMau}
                  onChange={(e) =>
                    setFormData({ ...formData, tepMau: e.target.value })
                  }
                  placeholder="/templates/template.docx"
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
              </span></div>
            </form>
          </span></div>
        </span></div>
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
            </span></div>
            <div className="template-body">
              <p className="template-code">
                Mã: <span className="code-badge">{template.maTemplate}</span>
              </p>
              <p className="template-type">
                Loại: {template.tenLoaiVanBan || (template.loaiVanBanId ? typeNameById.get(template.loaiVanBanId) : "-") || "-"}
              </p>
              <p className="template-file">File: {template.tepMau || "-"}</p>
              <div className="template-preview">
                <p className="preview-text">
                  {(template.noiDungMau || "").substring(0, 100)}...
                </p>
              </span></div>
            </span></div>
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
            </span></div>
          </span></div>
        ))}
      </span></div>

      <div className="pagination">
        <p>Tổng: {filteredTemplates.length} template</p>
      </span></div>
    </span></div>
  );
}
