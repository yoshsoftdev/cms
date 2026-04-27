"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ContentStatus, Page } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  content: z.string(),
  excerpt: z.string(),
  cover_image: z.string(),
  status: z.enum(["draft", "published"]),
  meta_title: z.string(),
  meta_description: z.string(),
});

export type PageFormValues = z.infer<typeof schema>;

export function PageForm({
  defaultValues,
  onSubmit,
  onDelete,
  submitting,
}: {
  defaultValues?: Partial<Page>;
  onSubmit: (values: PageFormValues) => void | Promise<void>;
  onDelete?: () => void;
  submitting?: boolean;
}) {
  const form = useForm<PageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
      excerpt: defaultValues?.excerpt ?? "",
      cover_image: defaultValues?.cover_image ?? "",
      status: (defaultValues?.status as ContentStatus) ?? "draft",
      meta_title: defaultValues?.meta_title ?? "",
      meta_description: defaultValues?.meta_description ?? "",
    },
  });

  return (
    <form className="max-w-3xl space-y-6" onSubmit={form.handleSubmit((v) => onSubmit(v))}>
      <div className="grid gap-2">
        <Label htmlFor="title">Judul</Label>
        <Input id="title" {...form.register("title")} />
        {form.formState.errors.title ? (
          <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="content">Konten (HTML; nanti bisa diganti editor kaya)</Label>
        <Textarea id="content" rows={12} className="font-mono text-sm" {...form.register("content")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="excerpt">Ringkasan</Label>
          <Textarea id="excerpt" rows={3} {...form.register("excerpt")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cover_image">URL gambar sampul</Label>
          <Input id="cover_image" type="url" {...form.register("cover_image")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(v) => form.setValue("status", v as ContentStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draf</SelectItem>
              <SelectItem value="published">Terbit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="meta_title">Meta title (SEO)</Label>
          <Input id="meta_title" {...form.register("meta_title")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="meta_description">Meta description (SEO)</Label>
          <Textarea id="meta_description" rows={2} {...form.register("meta_description")} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting}>
          Simpan
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={submitting}
          onClick={() => void form.handleSubmit((v) => onSubmit({ ...v, status: "draft" }))()}
        >
          Simpan sebagai draf
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={submitting}
          onClick={() => void form.handleSubmit((v) => onSubmit({ ...v, status: "published" }))()}
        >
          Terbitkan
        </Button>
        {onDelete ? (
          <Button type="button" variant="destructive" disabled={submitting} onClick={onDelete}>
            Hapus
          </Button>
        ) : null}
      </div>
    </form>
  );
}
