// Cấu hình Admin Panel - config.ts

export const ADMIN_CONFIG = {
  // API Base URL
  API_BASE_URL: (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8081',

  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  REFRESH_INTERVAL: 30000, // 30 seconds

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Admin Routes
  ADMIN_ROUTES: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PERMISSIONS: '/admin/permissions',
    UNITS: '/admin/units',
    DOCUMENT_TYPES: '/admin/document-types',
    WORKFLOWS: '/admin/workflows',
    TEMPLATES: '/admin/templates',
    MONITORING: '/admin/monitoring',
    AUDIT_LOGS: '/admin/audit-logs',
  },

  // User Roles & Permissions
  ROLES: {
    ADMIN: 'ADMIN',
    APPROVER: 'APPROVER',
    USER: 'USER',
  },

  PERMISSIONS: {
    VIEW: 'view',
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    APPROVE: 'approve',
  },

  // Document Types
  DOCUMENT_TYPES: {
    CV: { code: 'CT', name: 'Công văn' },
    TB: { code: 'TB', name: 'Thông báo' },
    QD: { code: 'QD', name: 'Quyết định' },
    TT: { code: 'TT', name: 'Tờ trình' },
    BN: { code: 'BN', name: 'Biên bản' },
  },

  // Workflow Status
  WORKFLOW_STATUS: {
    PENDING: 0,
    PROCESSING: 1,
    COMPLETED: 2,
    REJECTED: 3,
  },

  WORKFLOW_STATUS_LABELS: {
    0: 'Chờ xử lý',
    1: 'Đang xử lý',
    2: 'Hoàn thành',
    3: 'Từ chối',
  },

  // User Status
  USER_STATUS: {
    ACTIVE: 1,
    LOCKED: 0,
  },

  USER_STATUS_LABELS: {
    1: 'Hoạt động',
    0: 'Khóa',
  },

  // Monitoring
  MONITORING_THRESHOLDS: {
    CPU_WARNING: 80,
    CPU_CRITICAL: 90,
    MEMORY_WARNING: 85,
    MEMORY_CRITICAL: 95,
    DISK_WARNING: 90,
    DISK_CRITICAL: 95,
  },

  // Colors
  COLORS: {
    PRIMARY: '#667eea',
    SECONDARY: '#764ba2',
    SUCCESS: '#28a745',
    WARNING: '#ffc107',
    DANGER: '#dc3545',
    INFO: '#17a2b8',
  },

  // Notification
  NOTIFICATION_DURATION: 3000, // 3 seconds

  // Features
  FEATURES: {
    DOCUMENT_MANAGEMENT: 'Quản lý văn bản',
    DOCUMENT_APPROVAL: 'Duyệt văn bản',
    WORKFLOW_MANAGEMENT: 'Quản lý quy trình',
    USER_MANAGEMENT: 'Quản lý người dùng',
    REPORT_MANAGEMENT: 'Quản lý báo cáo',
    OFFICE365_INTEGRATION: 'Tích hợp Office 365',
    AI_PROCESSING: 'AI Xử lý',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Users
  USERS_LIST: '/admin/users',
  USER_CREATE: '/admin/users',
  USER_UPDATE: (id: number) => `/admin/users/${id}`,
  USER_DELETE: (id: number) => `/admin/users/${id}`,

  // Permissions
  PERMISSIONS_LIST: '/admin/permissions',
  PERMISSIONS_UPDATE: '/admin/permissions',

  // Document Types
  DOCUMENT_TYPES_LIST: '/admin/document-types',
  DOCUMENT_TYPE_CREATE: '/admin/document-types',
  DOCUMENT_TYPE_UPDATE: (id: number) => `/admin/document-types/${id}`,
  DOCUMENT_TYPE_DELETE: (id: number) => `/admin/document-types/${id}`,

  // Workflows
  WORKFLOWS_LIST: '/admin/workflows',
  WORKFLOW_CREATE: '/admin/workflows',
  WORKFLOW_UPDATE: (id: number) => `/admin/workflows/${id}`,
  WORKFLOW_DELETE: (id: number) => `/admin/workflows/${id}`,

  // Units
  UNITS_LIST: '/admin/units',
  UNIT_CREATE: '/admin/units',
  UNIT_UPDATE: (id: number) => `/admin/units/${id}`,
  UNIT_DELETE: (id: number) => `/admin/units/${id}`,

  // Templates
  TEMPLATES_LIST: '/admin/templates',
  TEMPLATE_CREATE: '/admin/templates',
  TEMPLATE_UPDATE: (id: number) => `/admin/templates/${id}`,
  TEMPLATE_DELETE: (id: number) => `/admin/templates/${id}`,

  // Monitoring
  MONITORING_STATS: '/admin/stats',
  MONITORING_SERVICES: '/admin/monitoring/services',
  MONITORING_PERFORMANCE: '/admin/monitoring/performance',

  // Audit Logs
  AUDIT_LOGS_LIST: '/admin/audit-logs',
  AUDIT_LOGS_EXPORT: '/admin/audit-logs/export/csv',
};

// Default Admin User (First Setup)
export const DEFAULT_ADMIN = {
  userName: 'admin',
  password: 'admin@123456',
  hoTen: 'Quản Trị Viên',
  email: 'admin@example.com',
  nhomQuyen: 'ADMIN',
};

export default ADMIN_CONFIG;
