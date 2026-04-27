"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Post } from "@/lib/types";

export function usePostsList(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => api.posts.list(params),
  });
}

export function usePostMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: Partial<Post>) => api.posts.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Post> }) => api.posts.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.posts.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { create, update, remove };
}
