"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { NavLocationReorder } from "@/components/navigation/nav-location-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigationMutations, useNavigationTree } from "@/hooks/useNavigation";
import type { NavigationTreeNode } from "@/lib/types";
import { flattenNavigationTree } from "@/lib/api";

export default function NavigationPage() {
  const headerQuery = useNavigationTree("header");
  const footerQuery = useNavigationTree("footer");
  const { create, update, remove, reorder } = useNavigationMutations();

  const headerTree = useMemo(() => headerQuery.data?.data ?? [], [headerQuery.data?.data]);
  const footerTree = useMemo(() => footerQuery.data?.data ?? [], [footerQuery.data?.data]);

  const flatHeader = useMemo(() => flattenNavigationTree(headerTree), [headerTree]);
  const flatFooter = useMemo(() => flattenNavigationTree(footerTree), [footerTree]);

  const loading = headerQuery.isLoading || footerQuery.isLoading;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    label: "",
    url: "",
    location: "header" as "header" | "footer",
    parent_id: "" as string,
    order: 0,
    type: "internal",
    target: "_self",
    is_active: true,
  });

  function openCreate() {
    setEditingId(null);
    setForm({
      label: "",
      url: "",
      location: "header",
      parent_id: "",
      order: 0,
      type: "internal",
      target: "_self",
      is_active: true,
    });
    setDialogOpen(true);
  }

  function openEdit(node: NavigationTreeNode, location: "header" | "footer") {
    setEditingId(node.id);
    const flat = location === "header" ? flatHeader : flatFooter;
    const row = flat.find((r) => r.id === node.id);
    setForm({
      label: node.label,
      url: node.url,
      location,
      parent_id: row?.parent_id ?? "",
      order: node.order,
      type: node.type,
      target: node.target,
      is_active: node.is_active,
    });
    setDialogOpen(true);
  }

  async function saveNav() {
    const body: Record<string, unknown> = {
      label: form.label,
      url: form.url,
      order: form.order,
      type: form.type,
      target: form.target,
      is_active: form.is_active,
      location: form.location,
    };
    if (form.parent_id) body.parent_id = form.parent_id;
    else body.parent_id = null;

    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, body });
        toast.success("Item navigasi diperbarui");
      } else {
        await create.mutateAsync(body);
        toast.success("Item navigasi ditambahkan");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Gagal menyimpan navigasi");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      toast.success("Item dihapus");
      setDeleteId(null);
    } catch {
      toast.error("Gagal menghapus");
    }
  }

  async function handleReorder(location: "header" | "footer", orderedRootIds: string[]) {
    try {
      await reorder.mutateAsync({ location, ids: orderedRootIds });
      toast.success("Urutan diperbarui");
    } catch {
      toast.error("Gagal mengubah urutan");
    }
  }

  function parentOptions(loc: "header" | "footer") {
    const flat = loc === "header" ? flatHeader : flatFooter;
    return flat.filter((f) => f.id !== editingId);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Seret ikon grip untuk mengurutkan item tingkat atas per lokasi. Anak ditampilkan di bawah induk.
        </p>
        <Button type="button" onClick={openCreate}>
          Tambah item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Header</CardTitle>
          <CardDescription>Menu bagian atas situs.</CardDescription>
        </CardHeader>
        <CardContent>
          {headerTree.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada item header.</p>
          ) : (
            <NavLocationReorder
              roots={headerTree}
              locationLabel="Header"
              onReorder={(ids) => void handleReorder("header", ids)}
              renderActions={(node) => (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(node, "header")}>
                    Edit
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteId(node.id)}>
                    Hapus
                  </Button>
                </>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer</CardTitle>
          <CardDescription>Menu bagian bawah situs.</CardDescription>
        </CardHeader>
        <CardContent>
          {footerTree.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada item footer.</p>
          ) : (
            <NavLocationReorder
              roots={footerTree}
              locationLabel="Footer"
              onReorder={(ids) => void handleReorder("footer", ids)}
              renderActions={(node) => (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(node, "footer")}>
                    Edit
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteId(node.id)}>
                    Hapus
                  </Button>
                </>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit item navigasi" : "Item navigasi baru"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Lokasi</Label>
              <Select value={form.location} onValueChange={(v) => setForm((f) => ({ ...f, location: v as "header" | "footer" }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Induk (opsional)</Label>
              <Select
                value={form.parent_id || "__none__"}
                onValueChange={(v) => setForm((f) => ({ ...f, parent_id: v === "__none__" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tanpa induk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Tanpa induk</SelectItem>
                  {parentOptions(form.location).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order">Urutan (angka)</Label>
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipe</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">Eksternal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Target</Label>
              <Select value={form.target} onValueChange={(v) => setForm((f) => ({ ...f, target: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">_self</SelectItem>
                  <SelectItem value="_blank">_blank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="active"
                checked={form.is_active}
                onCheckedChange={(c) => setForm((f) => ({ ...f, is_active: !!c }))}
              />
              <Label htmlFor="active">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button type="button" onClick={() => void saveNav()} disabled={create.isPending || update.isPending}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus item navigasi?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button type="button" variant="destructive" onClick={() => void confirmDelete()} disabled={remove.isPending}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
