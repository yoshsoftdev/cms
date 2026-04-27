"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";

export default function MediaPage() {
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResultUrl(null);
    try {
      const res = await api.upload(file);
      setResultUrl(res.url);
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
      toast.success("Berhasil mengunggah");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload gagal");
    } finally {
      setLoading(false);
    }
  }

  async function copyUrl() {
    if (!resultUrl) return;
    try {
      await navigator.clipboard.writeText(resultUrl);
      toast.success("URL disalin");
    } catch {
      toast.error("Tidak bisa menyalin");
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Unggah berkas</CardTitle>
          <CardDescription>
            Mengirim ke endpoint <code className="rounded bg-neutral-100 px-1">POST /admin/upload</code>.
            URL dikembalikan untuk penyimpanan eksternal (mis. S3).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="file">Pilih berkas</Label>
            <input
              id="file"
              type="file"
              accept="image/*,.pdf"
              disabled={loading}
              onChange={(e) => void onFile(e)}
              className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-md file:border file:bg-neutral-50 file:px-4 file:py-2"
            />
          </div>
          {loading ? <p className="text-sm text-neutral-500">Mengunggah…</p> : null}
          {resultUrl ? (
            <div className="rounded-md border border-neutral-200 bg-white p-4">
              <p className="text-xs font-medium uppercase text-neutral-500">URL</p>
              <p className="mt-1 break-all text-sm">{resultUrl}</p>
              <Button type="button" variant="outline" size="sm" className="mt-3 gap-2" onClick={() => void copyUrl()}>
                <Copy className="h-4 w-4" />
                Salin URL
              </Button>
            </div>
          ) : null}
          {preview ? (
            <div>
              <p className="mb-2 text-sm font-medium">Pratinjau gambar</p>
              <img src={preview} alt="" className="max-h-48 max-w-full rounded-md border object-contain" />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
