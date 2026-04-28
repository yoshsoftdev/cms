"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { Author } from "@/lib/types";

type AuthorForm = {
  name: string;
  photo: string;
  alt_text: string;
};

const emptyForm: AuthorForm = { name: "", photo: "", alt_text: "" };

export default function AuthorsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [form, setForm] = useState<AuthorForm>(emptyForm);
  const [deleteID, setDeleteID] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["authors", search],
    queryFn: () => api.authors.list({ search: search || undefined }),
  });

  const create = useMutation({
    mutationFn: (body: AuthorForm) => api.authors.create(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["authors"] }),
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: AuthorForm }) => api.authors.update(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["authors"] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.authors.delete(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["authors"] }),
  });

  const authors = useMemo(() => list.data?.data ?? [], [list.data?.data]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: Author) {
    setEditing(item);
    setForm({ name: item.name, photo: item.photo || "", alt_text: item.alt_text || "" });
    setOpen(true);
  }

  async function onSave() {
    if (!form.name.trim()) {
      toast.error("Nama author wajib diisi");
      return;
    }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, body: form });
        toast.success("Author diperbarui");
      } else {
        await create.mutateAsync(form);
        toast.success("Author ditambahkan");
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan author");
    }
  }

  async function onDelete() {
    if (!deleteID) return;
    try {
      await remove.mutateAsync(deleteID);
      toast.success("Author dihapus");
      setDeleteID(null);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus author");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Authors</CardTitle>
            <CardDescription>Kelola nama author, foto, dan alt text untuk SEO.</CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Author
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Cari author..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {list.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : authors.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada author.</p>
          ) : (
            <div className="space-y-2">
              {authors.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{item.name}</p>
                    <p className="truncate text-xs text-slate-500">{item.photo || "No photo URL"}</p>
                    <p className="truncate text-xs text-slate-500">{item.alt_text || "No alt text"}</p>
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
            <DialogTitle>{editing ? "Edit Author" : "Tambah Author"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Photo URL</Label>
              <Input id="photo" value={form.photo} onChange={(e) => setForm((v) => ({ ...v, photo: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input id="alt" value={form.alt_text} onChange={(e) => setForm((v) => ({ ...v, alt_text: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => void onSave()} disabled={create.isPending || update.isPending}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteID} onOpenChange={(o) => !o && setDeleteID(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus author?</DialogTitle>
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
