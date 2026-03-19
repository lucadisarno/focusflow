import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Layout } from "@/components/Layout";
import { useSession } from "@/lib/auth-client";

// ─── Lazy imports (code splitting per route) ──────────────
const LoginPage      = lazy(() => import("@/pages/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage   = lazy(() => import("@/pages/auth/RegisterPage").then(m => ({ default: m.RegisterPage })));
const DashboardPage  = lazy(() => import("@/pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const TaskPage       = lazy(() => import("@/pages/TaskPage").then(m => ({ default: m.TaskPage })));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));
const TagsPage       = lazy(() => import("@/pages/TagsPage"));
const CalendarPage   = lazy(() => import("@/pages/CalendarPage").then(m => ({ default: m.CalendarPage })));

// ─── Fallback loading ─────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Caricamento...</p>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) return <PageLoader />;

  if (!session) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute><TaskPage /></ProtectedRoute>
          } />
          <Route path="/categories" element={
            <ProtectedRoute><CategoriesPage /></ProtectedRoute>
          } />
          <Route path="/tags" element={
            <ProtectedRoute><TagsPage /></ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute><CalendarPage /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}