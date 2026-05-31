import { apiGet } from "../core/apiClient";

export type ServiceHealthItem = {
  service: string;
  status: "UP" | "DOWN" | "DEGRADED";
  responseTimeMs?: number;
  uptime?: string;
  details?: string;
};

export type SystemHealthResponse = {
  overall: "UP" | "DOWN" | "DEGRADED";
  checkedAt: string;
  services: ServiceHealthItem[];
};

export type SystemConfigItem = {
  key: string;
  value: string;
  description?: string;
  category?: string;
};

export const fetchSystemHealth = () =>
  apiGet<SystemHealthResponse>("/api/auth/system/health");

export const fetchSystemConfigs = () =>
  apiGet<SystemConfigItem[]>("/api/auth/system-configs");
