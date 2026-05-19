import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { fetchDocumentTypes } from "../../services/documents/documentTypesApi";
import {
  createWorkflow,
  createWorkflowStep,
  deleteWorkflow,
  fetchWorkflowDetail,
  fetchWorkflows,
  updateWorkflow,
  type WorkflowDetail,
} from "../../services/workflows/workflowsApi";

type Workflow = WorkflowDetail;

type WorkflowStepForm = {
  order: number;
  name: string;
  role: string;
  timeAllowed: number;
  required: boolean;
};

type DocumentTypeOption = {
  id: number;
  tenLoaiVanBan: string;
};

export default function WorkflowManagement() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [expandedWorkflow, setExpandedWorkflow] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    maQuyTrinh: "",
    tenQuyTrinh: "",
    loaiVanBanId: undefined as number | undefined,
    suDung: true,
    steps: [] as WorkflowStepForm[],
  });

  useEffect(() => {
    const loadWorkflows = async () => {
      setLoading(true);
      setError(null);
      try {
        const [workflowResponse, typesResponse] = await Promise.all([
          fetchWorkflows({ page: 0, size: 50 }),
          fetchDocumentTypes({}),
        ]);

        setWorkflows(workflowResponse.content || []);
        setDocumentTypes(
          (typesResponse || []).map((item) => ({
            id: item.id,
            tenLoaiVanBan: item.tenLoaiVanBan,
          }))
        );
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải quy trình";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflows();
  }, []);

  const handleAddWorkflow = () => {
    setEditingWorkflow(null);
    setFormData({
      maQuyTrinh: "",
      tenQuyTrinh: "",
      loaiVanBanId: undefined,
      suDung: true,
      steps: [
        { order: 1, name: "", role: "USER", timeAllowed: 1, required: false },
      ],
    });
    setShowForm(true);
  };

  const handleEditWorkflow = async (workflow: Workflow) => {
    try {
      const detail = await fetchWorkflowDetail(workflow.id);
      setEditingWorkflow(detail);
      setFormData({
        maQuyTrinh: detail.maQuyTrinh,
        tenQuyTrinh: detail.tenQuyTrinh,
        loaiVanBanId: detail.loaiVanBanId,
        suDung: detail.suDung,
        steps: (detail.steps || []).map((step) => ({
          order: step.thuTuBuoc,
          name: step.tenBuoc,
          role: step.vaiTroXuLy || "",
          timeAllowed: step.thoiGianXuLy || 1,
          required: Boolean(step.batBuocPheDuyet),
        })),
      });
      setShowForm(true);
    } catch (error) {
      console.error("Error loading workflow detail:", error);
    }
  };

  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          order: formData.steps.length + 1,
          name: "",
          role: "USER",
          timeAllowed: 1,
          required: false,
        },
      ],
    });
  };

  const handleRemoveStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    });
  };

  const handleSaveWorkflow = async () => {
    try {
      if (!formData.maQuyTrinh || !formData.tenQuyTrinh) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      if (editingWorkflow) {
        await updateWorkflow(editingWorkflow.id, {
          tenQuyTrinh: formData.tenQuyTrinh,
          loaiVanBanId: formData.loaiVanBanId,
          suDung: formData.suDung,
        });
        // TODO: cập nhật từng bước khi backend hỗ trợ batch update.
      } else {
        const created = await createWorkflow({
          maQuyTrinh: formData.maQuyTrinh,
          tenQuyTrinh: formData.tenQuyTrinh,
          loaiVanBanId: formData.loaiVanBanId,
          suDung: formData.suDung,
        });

        for (const step of formData.steps) {
          await createWorkflowStep(created.id, {
            tenBuoc: step.name,
            thuTuBuoc: step.order,
            vaiTroXuLy: step.role,
            thoiGianXuLy: step.timeAllowed,
            batBuocPheDuyet: step.required,
          });
        }
      }

      setShowForm(false);
      const response = await fetchWorkflows({ page: 0, size: 50 });
      setWorkflows(response.content || []);
    } catch (error) {
      console.error("Error saving workflow:", error);
    }
  };

  const handleDeleteWorkflow = async (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa quy trình này?")) {
      try {
        await deleteWorkflow(id);
        const response = await fetchWorkflows({ page: 0, size: 50 });
        setWorkflows(response.content || []);
      } catch (error) {
        console.error("Error deleting workflow:", error);
      }
    }
  };

  const handleToggleWorkflow = async (workflow: Workflow) => {
    if (expandedWorkflow === workflow.id) {
      setExpandedWorkflow(null);
      return;
    }

    setExpandedWorkflow(workflow.id);
    if (!workflow.steps || workflow.steps.length === 0) {
      try {
        const detail = await fetchWorkflowDetail(workflow.id);
        setWorkflows((prev) =>
          prev.map((item) => (item.id === workflow.id ? detail : item))
        );
      } catch (error) {
        console.error("Error loading workflow steps:", error);
      }
    }
  };

  const typeNameById = useMemo(() => {
    return new Map(documentTypes.map((type) => [type.id, type.tenLoaiVanBan]));
  }, [documentTypes]);

  if (loading) {
    return (
      <div className="admin-loading">Đang tải quy trình...</div>
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
        <h2>Quản lý quy trình xử lý</h2>
        <button
          className="button primary"
          onClick={handleAddWorkflow}
        >
          + Thêm quy trình
        </button>
      </div>

      {showForm && (
        <div className="admin-form-modal">
          <div className="modal-content large">
            <h3>
              {editingWorkflow
                ? "Chỉnh sửa quy trình"
                : "Thêm quy trình mới"}
            </h3>
            <form>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã quy trình *</label>
                  <input
                    type="text"
                    value={formData.maQuyTrinh}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maQuyTrinh: e.target.value.toUpperCase(),
                      })
                    }
                    disabled={!!editingWorkflow}
                    placeholder="VD: QT001"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Tên quy trình *</label>
                  <input
                    type="text"
                    value={formData.tenQuyTrinh}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tenQuyTrinh: e.target.value,
                      })
                    }
                    placeholder="Tên quy trình"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-row">
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
              </div>

              <div className="form-group">
                <label>Các bước quy trình</label>
                <div className="steps-list">
                  {formData.steps.map((step, index) => (
                    <div key={index} className="step-item">
                      <span className="step-number">{index + 1}</span>
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => {
                          const newSteps = [...formData.steps];
                          newSteps[index].name = e.target.value;
                          setFormData({
                            ...formData,
                            steps: newSteps,
                          });
                        }}
                        placeholder="Tên bước"
                        className="form-input"
                      />
                      <select
                        value={step.role}
                        onChange={(e) => {
                          const newSteps = [...formData.steps];
                          newSteps[index].role = e.target.value;
                          setFormData({
                            ...formData,
                            steps: newSteps,
                          });
                        }}
                        className="form-input"
                      >
                        <option value="USER">Người dùng</option>
                        <option value="APPROVER">Người phê duyệt</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                      <input
                        type="number"
                        value={step.timeAllowed}
                        onChange={(e) => {
                          const newSteps = [...formData.steps];
                          newSteps[index].timeAllowed = parseInt(e.target.value) || 1;
                          setFormData({
                            ...formData,
                            steps: newSteps,
                          });
                        }}
                        placeholder="Thời gian (giờ)"
                        className="form-input small"
                      />
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={step.required}
                          onChange={(e) => {
                            const newSteps = [...formData.steps];
                            newSteps[index].required = e.target.checked;
                            setFormData({
                              ...formData,
                              steps: newSteps,
                            });
                          }}
                        />
                        Bắt buộc
                      </label>
                      <button
                        type="button"
                        className="button small danger"
                        onClick={() => handleRemoveStep(index)}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="button secondary"
                  onClick={handleAddStep}
                >
                  + Thêm bước
                </button>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="button primary"
                  onClick={handleSaveWorkflow}
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

      <div className="workflows-list">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="workflow-card">
            <div className="workflow-header">
              <div className="workflow-info">
                <h3>{workflow.tenQuyTrinh}</h3>
                <p className="workflow-meta">
                  Mã: {workflow.maQuyTrinh} | Loại: {workflow.loaiVanBanId ? typeNameById.get(workflow.loaiVanBanId) : "-"}
                </p>
              </div>
              <div className="workflow-status">
                <span
                  className={`badge ${
                    workflow.suDung ? "badge-success" : "badge-danger"
                  }`}
                >
                  {workflow.suDung ? "Sử dụng" : "Không sử dụng"}
                </span>
              </div>
            </div>

            {expandedWorkflow === workflow.id && workflow.steps && (
              <div className="workflow-steps">
                {workflow.steps.map((step) => (
                  <div key={step.id} className="workflow-step">
                    <span className="step-badge">{step.thuTuBuoc}</span>
                    <div className="step-details">
                      <p className="step-name">{step.tenBuoc}</p>
                      <p className="step-info">
                        Vai trò: {step.vaiTroXuLy || "-"} • Thời gian: {step.thoiGianXuLy || 0} giờ
                        {step.batBuocPheDuyet && " • Bắt buộc"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="workflow-actions">
              <button
                className="button small"
                onClick={() => handleToggleWorkflow(workflow)}
              >
                {expandedWorkflow === workflow.id ? "Ẩn" : "Xem"} chi tiết
              </button>
              <button
                className="button small"
                onClick={() => handleEditWorkflow(workflow)}
              >
                Sửa
              </button>
              <button
                className="button small danger"
                onClick={() => handleDeleteWorkflow(workflow.id)}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
