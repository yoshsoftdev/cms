"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import type { MediaItem } from "@/lib/types";

export default function MediaPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [deleteID, setDeleteID] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", alt_text: "" });

  const list = useQuery({
    queryKey: ["media", search],
    queryFn: () => api.media.list({ search: search || undefined }),
  });
  const create = useMutation({
    mutationFn: (body: Pick<MediaItem, "name" | "url" | "alt_text">) => api.media.create(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["media"] }),
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Pick<MediaItem, "name" | "url" | "alt_text"> }) =>
      api.media.update(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["media"] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.media.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["media"] }),
  });

  const items = useMemo(() => list.data?.data ?? [], [list.data?.data]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.upload(file);
      setForm((prev) => ({ ...prev, url: res.url }));
      if (!form.name.trim()) {
        setForm((prev) => ({ ...prev, name: res.filename }));
      }
      toast.success("Berhasil mengunggah");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
      e.currentTarget.value = "";
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", url: "", alt_text: "" });
    setOpen(true);
  }

  function openEdit(item: MediaItem) {
    setEditing(item);
    setForm({ name: item.name, url: item.url, alt_text: item.alt_text || "" });
    setOpen(true);
  }

  async function onSave() {
    if (!form.name.trim() || !form.url.trim()) {
      toast.error("Nama dan URL media wajib diisi");
      return;
    }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, body: form });
        toast.success("Media diperbarui");
      } else {
        await create.mutateAsync(form);
        toast.success("Media ditambahkan");
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan media");
    }
  }

  async function onDelete() {
    if (!deleteID) return;
    try {
      await remove.mutateAsync(deleteID);
      toast.success("Media dihapus");
      setDeleteID(null);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus media");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>
              CRUD gambar dengan nama dan alt text. File tersimpan di <code className="rounded bg-neutral-100 px-1">cms-be/static/uploads</code>.
            </CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Media
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Cari media..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {list.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada media.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={item.url} alt={item.alt_text || item.name} className="h-14 w-14 rounded object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{item.name}</p>
                      <p className="truncate text-xs text-slate-500">{item.url}</p>
                      <p className="truncate text-xs text-slate-500">{item.alt_text || "No alt text"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                      <Pencil className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteID(item.id)}>
                      <Trash2 className="mr-1 h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Media" : "Tambah Media"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Upload Gambar</Label>
              <input
                id="file"
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => void onFile(e)}
                className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-md file:border file:bg-neutral-50 file:px-4 file:py-2"
              />
              {uploading ? <p className="text-xs text-neutral-500">Mengunggah...</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" value={form.url} onChange={(e) => setForm((v) => ({ ...v, url: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input id="alt" value={form.alt_text} onChange={(e) => setForm((v) => ({ ...v, alt_text: e.target.value }))} />
            </div>
            {form.url ? (
              <div className="rounded-md border border-slate-200 p-2">
                <img src={form.url} alt={form.alt_text || form.name || "preview"} className="max-h-48 w-full rounded object-contain" />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => void onSave()} disabled={create.isPending || update.isPending || uploading}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteID} onOpenChange={(o) => !o && setDeleteID(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus media?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteID(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={() => void onDelete()} disabled={remove.isPending}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
