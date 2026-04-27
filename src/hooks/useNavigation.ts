"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useNavigationTree(location?: string) {
  return useQuery({
    queryKey: ["navigation", location ?? "all"],
    queryFn: () => api.navigation.tree(location),
  });
}

export function useNavigationMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.navigation.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["navigation"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.navigation.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["navigation"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.navigation.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["navigation"] });
    },
  });

  const reorder = useMutation({
    mutationFn: ({ location, ids }: { location: string; ids: string[] }) =>
      api.navigation.reorder(location, ids),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["navigation"] });
    },
  });

  return { create, update, remove, reorder };
}
