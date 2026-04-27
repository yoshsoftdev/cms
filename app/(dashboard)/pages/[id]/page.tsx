"use client";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageForm, type PageFormValues } from "@/components/forms/page-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagesList, usePageMutations } from "@/hooks/usePages";
import { ApiError } from "@/lib/api";

export default function EditPagePage() {
  const params = useParams();
  const id = params.id as string;
  const navigate = useNavigate();
  const list = usePagesList({ page: 1, limit: 1000 });
  const { update, remove } = usePageMutations();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const page = useMemo(() => list.data?.data.find((p) => p.id === id), [list.data, id]);

  async function onSubmit(values: PageFormValues) {
    try {
      await update.mutateAsync({ id, body: values });
      toast.success("Halaman disimpan");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan");
    }
  }

  async function onDelete() {
    try {
      await remove.mutateAsync(id);
      toast.success("Halaman dihapus");
      navigate("/pages");
    } catch {
      toast.error("Gagal menghapus");
    }
  }

  if (list.isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-neutral-600">Halaman tidak ditemukan.</p>
        <Button asChild variant="outline">
          <Link to="/pages">Kembali ke daftar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageForm
        defaultValues={page}
        onSubmit={onSubmit}
        submitting={update.isPending}
        onDelete={() => setConfirmDelete(true)}
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus halaman?</DialogTitle>
            <DialogDescription>Data akan dihapus permanen dari CMS.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>
              Batal
            </Button>
            <Button type="button" variant="destructive" onClick={() => void onDelete()} disabled={remove.isPending}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
