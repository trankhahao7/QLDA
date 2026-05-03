import { useState, useEffect } from "react";

interface WorkflowStep {
  id: number;
  order: number;
  name: string;
  role: string;
  timeAllowed: number;
  required: boolean;
}

interface Workflow {
  id: number;
  maQuyTrinh: string;
  tenQuyTrinh: string;
  loaiVanBan: string;
  soBuoc: number;
  suDung: boolean;
  steps: WorkflowStep[];
}

export default function WorkflowManagement() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [expandedWorkflow, setExpandedWorkflow] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    maQuyTrinh: "",
    tenQuyTrinh: "",
    loaiVanBan: "",
    suDung: true,
    steps: [] as Omit<WorkflowStep, "id">[],
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      // Replace with actual API
      setTimeout(() => {
        setWorkflows([
          {
            id: 1,
            maQuyTrinh: "QT001",
            tenQuyTrinh: "Quy trình phê duyệt công văn",
            loaiVanBan: "Công văn",
            soBuoc: 3,
            suDung: true,
            steps: [
              {
                id: 1,
                order: 1,
                name: "Tiếp nhận",
                role: "Người dùng",
                timeAllowed: 1,
                required: false,
              },
              {
                id: 2,
                order: 2,
                name: "Phê duyệt sơ bộ",
                role: "Trưởng phòng",
                timeAllowed: 2,
                required: true,
              },
              {
                id: 3,
                order: 3,
                name: "Phê duyệt cuối cùng",
                role: "Giám đốc",
                timeAllowed: 1,
                required: true,
              },
            ],
          },
          {
            id: 2,
            maQuyTrinh: "QT002",
            tenQuyTrinh: "Quy trình xử lý thông báo",
            loaiVanBan: "Thông báo",
            soBuoc: 2,
            suDung: true,
            steps: [
              {
                id: 4,
                order: 1,
                name: "Soạn thảo",
                role: "Người dùng",
                timeAllowed: 1,
                required: false,
              },
              {
                id: 5,
                order: 2,
                name: "Phê duyệt",
                role: "Trưởng phòng",
                timeAllowed: 1,
                required: true,
              },
            ],
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      setLoading(false);
    }
  };

  const handleAddWorkflow = () => {
    setEditingWorkflow(null);
    setFormData({
      maQuyTrinh: "",
      tenQuyTrinh: "",
      loaiVanBan: "",
      suDung: true,
      steps: [
        { order: 1, name: "", role: "USER", timeAllowed: 1, required: false },
      ],
    });
    setShowForm(true);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setFormData({
      maQuyTrinh: workflow.maQuyTrinh,
      tenQuyTrinh: workflow.tenQuyTrinh,
      loaiVanBan: workflow.loaiVanBan,
      suDung: workflow.suDung,
      steps: workflow.steps.map(({ id, ...step }) => step),
    });
    setShowForm(true);
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

      // Replace with actual API
      console.log("Saving workflow:", formData);
      setShowForm(false);
      await fetchWorkflows();
    } catch (error) {
      console.error("Error saving workflow:", error);
    }
  };

  const handleDeleteWorkflow = async (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa quy trình này?")) {
      try {
        // Replace with actual API
        console.log("Deleting workflow:", id);
        await fetchWorkflows();
      } catch (error) {
        console.error("Error deleting workflow:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">Đang tải quy trình...</div>
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
                          newSteps[index].timeAllowed =
                            parseInt(e.target.value) || 1;
                          setFormData({
                            ...formData,
                            steps: newSteps,
                          });
                        }}
                        placeholder="Thời gian (ngày)"
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
                  Mã: <span className="code-badge">{workflow.maQuyTrinh}</span>
                  <span className="separator">•</span>
                  Loại: {workflow.loaiVanBan}
                  <span className="separator">•</span>
                  {workflow.soBuoc} bước
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

            {expandedWorkflow === workflow.id && (
              <div className="workflow-steps">
                {workflow.steps.map((step) => (
                  <div key={step.id} className="workflow-step">
                    <span className="step-badge">{step.order}</span>
                    <div className="step-details">
                      <p className="step-name">{step.name}</p>
                      <p className="step-info">
                        Vai trò: {step.role} • Thời gian: {step.timeAllowed}
                        {step.timeAllowed > 1 ? " ngày" : " ngày"}
                        {step.required && " • Bắt buộc"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="workflow-actions">
              <button
                className="button small"
                onClick={() =>
                  setExpandedWorkflow(
                    expandedWorkflow === workflow.id ? null : workflow.id
                  )
                }
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
