import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles/app.css";
import AppShell from "./shared/AppShell";
import AdminShell from "./shared/AdminShell";
import Dashboard from "./routes/user/Dashboard";
import DocumentDetail from "./routes/user/DocumentDetail";
import Inbox from "./routes/user/Inbox";
import Login from "./routes/user/Login";
import NotFound from "./routes/user/NotFound";
import Profile from "./routes/user/Profile";
import Search from "./routes/user/Search";
import Upload from "./routes/user/Upload";
import ChatBot from "./shared/ChatBot";
// Admin components
import AdminDashboard from "./routes/admin/AdminDashboard";
import UserManagement from "./routes/admin/UserManagement";
import PermissionManagement from "./routes/admin/PermissionManagement";
import UnitManagement from "./routes/admin/UnitManagement";
import DocumentTypeManagement from "./routes/admin/DocumentTypeManagement";
import WorkflowManagement from "./routes/admin/WorkflowManagement";
import TemplateManagement from "./routes/admin/TemplateManagement";
import SystemMonitoring from "./routes/admin/SystemMonitoring";
import AuditLogs from "./routes/admin/AuditLogs";

function App() {
  return (
    <BrowserRouter>
      <ChatBot />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminShell />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/permissions" element={<PermissionManagement />} />
          <Route path="/admin/units" element={<UnitManagement />} />
          <Route path="/admin/document-types" element={<DocumentTypeManagement />} />
          <Route path="/admin/workflows" element={<WorkflowManagement />} />
          <Route path="/admin/templates" element={<TemplateManagement />} />
          <Route path="/admin/monitoring" element={<SystemMonitoring />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
