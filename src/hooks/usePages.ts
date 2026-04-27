"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Page } from "@/lib/types";

export function usePagesList(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["pages", params],
    queryFn: () => api.pages.list(params),
  });
}

export function usePageMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: Partial<Page>) => api.pages.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Page> }) => api.pages.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.pages.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  return { create, update, remove };
}
