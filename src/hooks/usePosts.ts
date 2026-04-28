"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ContentDetail, ContentRecord, Post } from "@/lib/types";

function contentToPost(item: ContentRecord, authorNameByID: Record<string, string> = {}): Post {
  return {
    id: item.id,
    title: item.title ?? "",
    slug: item.slug ?? "",
    content: item.content ?? "",
    content_json: item.content_json ?? "",
    excerpt: item.excerpt ?? "",
    cover_image: "",
    status: item.status === "archived" ? "draft" : item.status,
    meta_title: item.meta_title ?? "",
    meta_description: item.meta_description ?? "",
    og_image: "",
    canonical_url: "",
    keywords: item.keywords ?? "",
    category: "",
    publish_date: item.publish_at ? item.publish_at.slice(0, 10) : "",
    author: item.author_id ? authorNameByID[item.author_id] ?? "" : "",
    author_id: item.author_id,
    read_time: "",
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

function contentDetailToPost(item: ContentDetail): Post {
  const t = item.translation;
  const en = item.translations?.find((row) => row.locale === "en");
  const id = item.translations?.find((row) => row.locale === "id");
  return {
    id: item.id,
    title: t?.title ?? "",
    slug: item.slug ?? "",
    content: t?.content ?? "",
    content_json: t?.content_json ?? "",
    excerpt: t?.excerpt ?? "",
    cover_image: "",
    status: item.status === "archived" ? "draft" : item.status,
    meta_title: t?.meta_title ?? "",
    meta_description: t?.meta_description ?? "",
    og_image: "",
    canonical_url: "",
    keywords: t?.keywords ?? "",
    category: "",
    publish_date: item.publish_at ? item.publish_at.slice(0, 10) : "",
    author: item.author?.name ?? "",
    author_id: item.author_id,
    read_time: "",
    created_at: item.created_at,
    updated_at: item.updated_at,
    localized: {
      en: {
        title: en?.title ?? t?.title ?? "",
        content: en?.content ?? t?.content ?? "",
        content_json: en?.content_json ?? t?.content_json ?? "",
        meta_title: en?.meta_title ?? t?.meta_title ?? "",
        meta_description: en?.meta_description ?? t?.meta_description ?? "",
        keywords: en?.keywords ?? t?.keywords ?? "",
      },
      id: {
        title: id?.title ?? "",
        content: id?.content ?? "",
        content_json: id?.content_json ?? "",
        meta_title: id?.meta_title ?? "",
        meta_description: id?.meta_description ?? "",
        keywords: id?.keywords ?? "",
      },
    },
  };
}

function postToContentPayload(body: Partial<Post>) {
  const en = body.localized?.en;
  const id = body.localized?.id;
  return {
    slug: body.slug ?? "",
    type: "post",
    status: body.status ?? "draft",
    author_id: body.author_id,
    publish_at: body.publish_date ? new Date(body.publish_date).toISOString() : undefined,
    translations: [
      {
        locale: "en",
        title: en?.title ?? body.title ?? "",
        content: en?.content ?? body.content ?? "",
        content_json: en?.content_json ?? body.content_json ?? "",
        excerpt: body.excerpt ?? "",
        meta_title: en?.meta_title ?? body.meta_title ?? "",
        meta_description: en?.meta_description ?? body.meta_description ?? "",
        keywords: en?.keywords ?? body.keywords ?? "",
      },
      {
        locale: "id",
        title: id?.title ?? "",
        content: id?.content ?? "",
        content_json: id?.content_json ?? "",
        excerpt: body.excerpt ?? "",
        meta_title: id?.meta_title ?? "",
        meta_description: id?.meta_description ?? "",
        keywords: id?.keywords ?? "",
      },
    ],
  };
}

async function getLegacyPostByID(id: string): Promise<Post | null> {
  const fallback = await api.posts.list({ page: 1, limit: 1000 });
  return fallback.data.find((item) => item.id === id) ?? null;
}

export function usePostsList(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: async () => {
      try {
        const [res, authorsRes] = await Promise.all([
          api.contents.list({
            page: params.page,
            limit: params.limit,
            status: params.status,
            search: params.search,
            type: "post",
            locale: "en",
          }),
          api.authors.list(),
        ]);
        const authorNameByID = Object.fromEntries(authorsRes.data.map((item) => [item.id, item.name]));
        return { ...res, data: res.data.map((item) => contentToPost(item, authorNameByID)) };
      } catch {
        return api.posts.list(params);
      }
    },
  });
}

export function usePostByID(id: string, locale: "en" | "id" = "en") {
  return useQuery({
    queryKey: ["post", id, locale],
    enabled: !!id,
    queryFn: async () => {
      try {
        const [primary, other] = await Promise.all([
          api.contents.getById(id, locale),
          api.contents.getById(id, locale === "en" ? "id" : "en"),
        ]);
        const merged: ContentDetail = {
          ...primary,
          translations: [
            ...(primary.translations ?? (primary.translation ? [primary.translation] : [])),
            ...(other.translations ?? (other.translation ? [other.translation] : [])),
          ].filter((row, idx, arr) => arr.findIndex((x) => x.locale === row.locale) === idx),
        };
        const contentPost = contentDetailToPost(merged);
        const legacyPost = await getLegacyPostByID(id);
        if (!legacyPost) return contentPost;
        return {
          ...contentPost,
          excerpt: legacyPost.excerpt || contentPost.excerpt,
          cover_image: legacyPost.cover_image || contentPost.cover_image,
          og_image: legacyPost.og_image || contentPost.og_image,
          canonical_url: legacyPost.canonical_url || contentPost.canonical_url,
          category: legacyPost.category || contentPost.category,
          author: legacyPost.author || contentPost.author,
          author_id: legacyPost.author_id || contentPost.author_id,
          read_time: legacyPost.read_time || contentPost.read_time,
        };
      } catch {
        const post = await getLegacyPostByID(id);
        if (!post) throw new Error("Post not found");
        return post;
      }
    },
  });
}

export function usePostMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: async (body: Partial<Post>) => {
      try {
        const created = await api.contents.create(postToContentPayload(body));
        const createdID =
          created && typeof created === "object" && "id" in created && typeof created.id === "string"
            ? created.id
            : "";
        if (createdID) {
          return contentDetailToPost(await api.contents.getById(createdID, "en"));
        }
        const list = await api.contents.list({ page: 1, limit: 1, type: "post", locale: "en", search: body.slug });
        if (!list.data.length) throw new Error("Post creation succeeded but content could not be loaded");
        return contentToPost(list.data[0]);
      } catch {
        return api.posts.create(body);
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<Post> }) => {
      try {
        await api.contents.update(id, postToContentPayload(body));
        // Keep legacy SEO fields persisted during migration window.
        await api.posts.update(id, body).catch(() => undefined);
        return contentDetailToPost(await api.contents.getById(id, "en"));
      } catch {
        return api.posts.update(id, body);
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["posts"] });
      void qc.invalidateQueries({ queryKey: ["post"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.contents.delete(id);
      } catch {
        await api.posts.delete(id);
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["posts"] });
      void qc.invalidateQueries({ queryKey: ["post"] });
    },
  });

  return { create, update, remove };
}
