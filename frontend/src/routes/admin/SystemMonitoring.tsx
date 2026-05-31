import { useState, useEffect, useCallback } from "react";
import { fetchSystemHealth, fetchSystemConfigs, type ServiceHealthItem, type SystemConfigItem } from "../../services/auth/systemApi";

const STATUS_ICON: Record<string, string> = { UP: "🟢", DOWN: "🔴", DEGRADED: "🟡" };
const STATUS_TEXT: Record<string, string> = { UP: "Hoạt động", DOWN: "Ngoại tuyến", DEGRADED: "Cảnh báo" };
const STATUS_BADGE: Record<string, string> = { UP: "badge-success", DOWN: "badge-danger", DEGRADED: "badge-warning" };

export default function SystemMonitoring() {
  const [services, setServices] = useState<ServiceHealthItem[]>([]);
  const [configs, setConfigs] = useState<SystemConfigItem[]>([]);
  const [overallStatus, setOverallStatus] = useState<string>("UP");
  const [checkedAt, setCheckedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"services" | "configs">("services");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, configsRes] = await Promise.allSettled([
        fetchSystemHealth(),
        fetchSystemConfigs(),
      ]);

      if (healthRes.status === "fulfilled") {
        setServices(healthRes.value.services || []);
        setOverallStatus(healthRes.value.overall);
        setCheckedAt(healthRes.value.checkedAt);
      } else {
        // Fallback if health endpoint not available
        setError("Không thể kết nối tới health endpoint.");
      }

      if (configsRes.status === "fulfilled") {
        setConfigs(configsRes.value || []);
      }
    } catch {
      setError("Không thể tải dữ liệu giám sát.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải dữ liệu giám sát...</span></div>;
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Giám sát hệ thống</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {checkedAt && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Cập nhật: {new Date(checkedAt).toLocaleTimeString("vi-VN")}
            </span>
          )}
          <button className="button secondary" onClick={loadData}>🔄 Tải lại</button>
        </div>
      </div>

      {error && (
        <div className="alert alert--error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {/* Overall status banner */}
      <div style={{
        padding: "12px 16px", borderRadius: 8, marginBottom: 20,
        background: overallStatus === "UP" ? "#f0fdf4" : overallStatus === "DOWN" ? "#fef2f2" : "#fffbeb",
        border: `1px solid ${overallStatus === "UP" ? "#86efac" : overallStatus === "DOWN" ? "#fca5a5" : "#fcd34d"}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>{STATUS_ICON[overallStatus] ?? "⚪"}</span>
        <div>
          <strong>Trạng thái tổng thể: {STATUS_TEXT[overallStatus] ?? overallStatus}</strong>
          {services.length > 0 && (
            <p style={{ fontSize: 13, margin: "2px 0 0", color: "var(--text-muted)" }}>
              {services.filter((s) => s.status === "UP").length}/{services.length} dịch vụ hoạt động bình thường
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <div className="filter-tabs">
          <button
            type="button"
            className={`filter-tab${activeTab === "services" ? " active" : ""}`}
            onClick={() => setActiveTab("services")}
          >
            Dịch vụ ({services.length})
          </button>
          <button
            type="button"
            className={`filter-tab${activeTab === "configs" ? " active" : ""}`}
            onClick={() => setActiveTab("configs")}
          >
            Cấu hình hệ thống ({configs.length})
          </button>
        </div>
      </div>

      {activeTab === "services" && (
        <>
          {services.length === 0 ? (
            <div className="card">
              <p style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                Không có dữ liệu dịch vụ từ server.
              </p>
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service, index) => (
                <div key={index} className="service-card">
                  <div className="service-header">
                    <span className="status-icon">{STATUS_ICON[service.status] ?? "⚪"}</span>
                    <h4>{service.service}</h4>
                  </div>
                  <div className="service-stats">
                    <div className="stat-row">
                      <span className="label">Trạng thái:</span>
                      <span className="value">{STATUS_TEXT[service.status] ?? service.status}</span>
                    </div>
                    {service.uptime && (
                      <div className="stat-row">
                        <span className="label">Uptime:</span>
                        <span className="value">{service.uptime}</span>
                      </div>
                    )}
                    {service.responseTimeMs != null && (
                      <div className="stat-row">
                        <span className="label">Response time:</span>
                        <span className="value">{service.responseTimeMs}ms</span>
                      </div>
                    )}
                    {service.details && (
                      <div className="stat-row">
                        <span className="label">Chi tiết:</span>
                        <span className="value" style={{ fontSize: 12 }}>{service.details}</span>
                      </div>
                    )}
                  </div>
                  <div className="service-badge">
                    <span className={`badge ${STATUS_BADGE[service.status] ?? "badge-info"}`}>
                      {STATUS_TEXT[service.status] ?? service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "configs" && (
        <>
          {configs.length === 0 ? (
            <div className="card">
              <p style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                Không có dữ liệu cấu hình từ server.
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Khóa</th>
                    <th>Giá trị</th>
                    <th>Danh mục</th>
                    <th>Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((cfg) => (
                    <tr key={cfg.key}>
                      <td style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 13 }}>{cfg.key}</td>
                      <td style={{ fontFamily: "monospace", fontSize: 13 }}>{cfg.value}</td>
                      <td>
                        {cfg.category && (
                          <span className="badge badge--ghost" style={{ fontSize: 11 }}>{cfg.category}</span>
                        )}
                      </td>
                      <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{cfg.description || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
