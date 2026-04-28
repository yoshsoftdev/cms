"use client";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { PostForm, type PostSubmitValues } from "@/components/forms/post-form";
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
import { usePostByID, usePostMutations } from "@/hooks/usePosts";
import { ApiError } from "@/lib/api";

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  const navigate = useNavigate();
  const detail = usePostByID(id, "en");
  const { update, remove } = usePostMutations();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const post = detail.data;

  async function onSubmit(values: PostSubmitValues) {
    try {
      await update.mutateAsync({ id, body: values });
      toast.success("Postingan disimpan");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan");
    }
  }

  async function onDelete() {
    try {
      await remove.mutateAsync(id);
      toast.success("Postingan dihapus");
      navigate("/posts");
    } catch {
      toast.error("Gagal menghapus");
    }
  }

  if (detail.isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-neutral-600">Postingan tidak ditemukan.</p>
        <Button asChild variant="outline">
          <Link to="/posts">Kembali ke daftar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PostForm
        defaultValues={post}
        onSubmit={onSubmit}
        submitting={update.isPending}
        onDelete={() => setConfirmDelete(true)}
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus postingan?</DialogTitle>
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
