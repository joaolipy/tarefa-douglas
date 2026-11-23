import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import { AppLayout } from "./componentes/AppLayout";
import { ProtectedRoute } from "./componentes/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { CadastroPage } from "./pages/CadastroPage";
import { InicioPage } from "./pages/InicioPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFound";
import { PerfilPage } from "./pages/PerfilPage";
import { ResourceFormPage } from "./pages/ResourceFormPage";
import { ResourceListPage } from "./pages/ResourceListPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/inicio" element={<InicioPage />} />
              <Route path="/perfil" element={<PerfilPage />} />
              <Route path="/:recurso" element={<ResourceListPage />} />
              <Route path="/:recurso/novo" element={<ResourceFormPage />} />
              <Route path="/:recurso/:id/editar" element={<ResourceFormPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
