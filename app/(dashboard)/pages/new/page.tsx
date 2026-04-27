"use client";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageForm, type PageFormValues } from "@/components/forms/page-form";
import { usePageMutations } from "@/hooks/usePages";
import { ApiError } from "@/lib/api";

export default function NewPagePage() {
  const navigate = useNavigate();
  const { create } = usePageMutations();

  async function onSubmit(values: PageFormValues) {
    try {
      const page = await create.mutateAsync(values);
      toast.success("Halaman dibuat");
      navigate(`/pages/${page.id}`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan");
    }
  }

  return (
    <div>
      <PageForm onSubmit={onSubmit} submitting={create.isPending} />
    </div>
  );
}
