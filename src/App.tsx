import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Providers } from "@/components/providers";
import { hasToken } from "@/lib/auth";
import DashboardHomePage from "../app/(dashboard)/page";
import LoginPage from "../app/(auth)/login/page";
import PostsListPage from "../app/(dashboard)/posts/page";
import NewPostPage from "../app/(dashboard)/posts/new/page";
import EditPostPage from "../app/(dashboard)/posts/[id]/page";
import PagesListPage from "../app/(dashboard)/pages/page";
import NewPagePage from "../app/(dashboard)/pages/new/page";
import EditPagePage from "../app/(dashboard)/pages/[id]/page";
import NavigationPage from "../app/(dashboard)/navigation/page";
import MediaPage from "../app/(dashboard)/media/page";
import SettingsPage from "../app/(dashboard)/settings/page";

function RequireAuth() {
  if (!hasToken()) return <Navigate to="/login" replace />;
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}

function LoginRoute() {
  if (hasToken()) return <Navigate to="/" replace />;
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <LoginPage />
    </div>
  );
}

export function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />

        <Route element={<RequireAuth />}>
          <Route path="/" element={<DashboardHomePage />} />
          <Route path="/posts" element={<PostsListPage />} />
          <Route path="/posts/new" element={<NewPostPage />} />
          <Route path="/posts/:id" element={<EditPostPage />} />
          <Route path="/pages" element={<PagesListPage />} />
          <Route path="/pages/new" element={<NewPagePage />} />
          <Route path="/pages/:id" element={<EditPagePage />} />
          <Route path="/navigation" element={<NavigationPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Providers>
  );
}
