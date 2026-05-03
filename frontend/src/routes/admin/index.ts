/**
 * Admin Routes Index
 * Central export point for all admin components
 */

export { default as AdminShell } from '../../shared/AdminShell';
export { default as AdminSidebar } from '../../shared/AdminSidebar';

// Admin Pages
export { default as AdminDashboard } from './AdminDashboard';
export { default as UserManagement } from './UserManagement';
export { default as PermissionManagement } from './PermissionManagement';
export { default as DocumentTypeManagement } from './DocumentTypeManagement';
export { default as WorkflowManagement } from './WorkflowManagement';
export { default as TemplateManagement } from './TemplateManagement';
export { default as UnitManagement } from './UnitManagement';
export { default as SystemMonitoring } from './SystemMonitoring';
export { default as AuditLogs } from './AuditLogs';
