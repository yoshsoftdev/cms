"use client";

import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePagesList, usePageMutations } from "@/hooks/usePages";
import type { Page } from "@/lib/types";

export default function PagesListPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);

  const list = usePagesList({ page, limit, status: status || undefined, search: q || undefined });
  const { remove } = usePageMutations();

  const items = list.data?.data ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const empty = useMemo(() => !list.isLoading && items.length === 0, [list.isLoading, items.length]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget.id);
      toast.success("Halaman dihapus");
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              className="pl-9"
              placeholder="Cari judul…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setQ(search);
                  setPage(1);
                }
              }}
            />
          </div>
          <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              <SelectItem value="draft">Draf</SelectItem>
              <SelectItem value="published">Terbit</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="secondary" onClick={() => { setQ(search); setPage(1); }}>
            Terapkan
          </Button>
        </div>
        <Button asChild>
          <Link to="/pages/new">
            <Plus className="mr-2 h-4 w-4" />
            Halaman baru
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {list.isLoading ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : empty ? (
            <p className="p-8 text-center text-sm text-neutral-500">Belum ada halaman.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead className="hidden md:table-cell">Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Diperbarui</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell className="hidden max-w-[200px] truncate md:table-cell">{row.slug}</TableCell>
                    <TableCell>{row.status === "published" ? "Terbit" : "Draf"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-neutral-500">
                      {new Date(row.updated_at).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/pages/${row.id}`}>Edit</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteTarget(row)}>
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!empty && !list.isLoading ? (
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>
            Halaman {page} dari {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Sebelumnya
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus halaman?</DialogTitle>
            <DialogDescription>
              Halaman &quot;{deleteTarget?.title}&quot; akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
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
