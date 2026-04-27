"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  FolderOpen,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelTop,
  Search,
  Settings,
} from "lucide-react";
import { clearToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/posts", label: "Postingan", icon: FileText },
  { href: "/pages", label: "Halaman", icon: FolderOpen },
  { href: "/navigation", label: "Navigasi", icon: PanelTop },
  { href: "/media", label: "Media", icon: ImageIcon },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

function breadcrumbLabel(pathname: string) {
  const map: Record<string, string> = {
    "/": "Beranda",
    "/posts": "Postingan",
    "/pages": "Halaman",
    "/navigation": "Navigasi",
    "/media": "Media",
    "/settings": "Pengaturan",
  };
  if (map[pathname]) return map[pathname];
  if (pathname.startsWith("/posts/new")) return "Postingan baru";
  if (pathname.startsWith("/posts/")) return "Edit postingan";
  if (pathname.startsWith("/pages/new")) return "Halaman baru";
  if (pathname.startsWith("/pages/")) return "Edit halaman";
  return "Admin";
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isEditorRoute = /^\/posts\/[^/]+$/.test(pathname) || pathname === "/posts/new";

  function logout() {
    clearToken();
    navigate("/login");
  }

  if (isEditorRoute) {
    return <div className="h-screen bg-white">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 border-r border-slate-200 bg-white lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-14 items-center border-b border-slate-200 px-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            CMS Admin
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              readOnly
              placeholder="Cari… (segera hadir)"
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Akun
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Pengguna</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {breadcrumbLabel(pathname)}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {breadcrumbLabel(pathname)}
            </h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
