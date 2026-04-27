import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan</CardTitle>
          <CardDescription>
            Konfigurasi dasar panel admin. Sesuaikan variabel lingkungan untuk URL API CMS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <p>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">VITE_CMS_BASE_URL</span> — alamat
            base API (mis. <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-900">/api/cms</code> dengan
            proxy Next, atau langsung ke backend).
          </p>
          <p>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">VITE_CMS_BACKEND_URL</span> — untuk{" "}
            <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-900">vite.config.ts</code> saat menggunakan
            rewrite proxy.
          </p>
          <p>Autentikasi: JWT disimpan di localStorage dan disinkronkan ke cookie agar middleware berjalan.</p>
        </CardContent>
      </Card>
    </div>
  );
}
