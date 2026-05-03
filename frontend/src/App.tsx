import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles/app.css";
import AppShell from "./shared/AppShell";
import Dashboard from "./routes/Dashboard";
import DocumentDetail from "./routes/DocumentDetail";
import Inbox from "./routes/Inbox";
import Login from "./routes/Login";
import NotFound from "./routes/NotFound";
import Profile from "./routes/Profile";
import Projects from "./routes/Projects";
import Search from "./routes/Search";
import Upload from "./routes/Upload";
import ChatBot from "./shared/ChatBot";

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
          <Route path="/projects" element={<Projects />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
