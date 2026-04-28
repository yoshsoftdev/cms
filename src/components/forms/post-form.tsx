"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { SEOSettings } from "@/components/cms/seo-settings";
import { EditorSidebar, type TocHeading } from "@/components/cms/editor-sidebar";
import type { ContentStatus, Post } from "@/lib/types";

const schema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z.string(),
  content: z.string(),
  content_json: z.string(),
  excerpt: z.string(),
  cover_image: z.string(),
  status: z.enum(["draft", "published"]),
  meta_title: z.string(),
  meta_description: z.string(),
  og_image: z.string(),
  canonical_url: z.string(),
  keywords: z.string(),
  category: z.string(),
  publish_date: z.string(),
  author: z.string(),
  author_id: z.string(),
  read_time: z.string(),
});

export type PostFormValues = z.infer<typeof schema>;
type Lang = "en" | "id";
export type LocalizedDraftValues = Record<Lang, LocalizedDraft>;
export type PostSubmitValues = PostFormValues & { localized: LocalizedDraftValues };
export type CompletionItem = {
  key: string;
  label: string;
  done: boolean;
  group: "content" | "seo";
  lang?: Lang;
};

type LocalizedDraft = {
  title: string;
  content: string;
  content_json: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
};

function safeParseContent(json: string): JSONContent | null {
  try {
    if (!json) return null;
    return JSON.parse(json) as JSONContent;
  } catch {
    return null;
  }
}

function plainLength(html: string) {
  return (html || "").replace(/<[^>]+>/g, "").trim().length;
}

export function PostForm({
  defaultValues,
  onSubmit,
  onDelete,
  submitting,
}: {
  defaultValues?: Partial<Post>;
  onSubmit: (values: PostSubmitValues) => void | Promise<void>;
  onDelete?: () => void;
  submitting?: boolean;
}) {
  const [activeLang, setActiveLang] = useState<"en" | "id">("en");
  const [categoryQuery, setCategoryQuery] = useState(defaultValues?.category ?? "");
  const [keywordQuery, setKeywordQuery] = useState("");
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [headingsByLang, setHeadingsByLang] = useState<Record<Lang, TocHeading[]>>({ en: [], id: [] });
  const [localizedByLang, setLocalizedByLang] = useState<Record<Lang, LocalizedDraft>>({
    en: {
      title: defaultValues?.localized?.en?.title ?? defaultValues?.title ?? "",
      content: defaultValues?.localized?.en?.content ?? defaultValues?.content ?? "",
      content_json: defaultValues?.localized?.en?.content_json ?? defaultValues?.content_json ?? "",
      meta_title: defaultValues?.localized?.en?.meta_title ?? defaultValues?.meta_title ?? "",
      meta_description: defaultValues?.localized?.en?.meta_description ?? defaultValues?.meta_description ?? "",
      keywords: defaultValues?.localized?.en?.keywords ?? defaultValues?.keywords ?? "",
    },
    id: {
      title: defaultValues?.localized?.id?.title ?? "",
      content: defaultValues?.localized?.id?.content ?? "",
      content_json: defaultValues?.localized?.id?.content_json ?? "",
      meta_title: defaultValues?.localized?.id?.meta_title ?? "",
      meta_description: defaultValues?.localized?.id?.meta_description ?? "",
      keywords: defaultValues?.localized?.id?.keywords ?? "",
    },
  });

  const form = useForm<PostFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.localized?.en?.title ?? defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      content: defaultValues?.localized?.en?.content ?? defaultValues?.content ?? "",
      content_json: defaultValues?.localized?.en?.content_json ?? defaultValues?.content_json ?? "",
      excerpt: defaultValues?.excerpt ?? "",
      cover_image: defaultValues?.cover_image ?? "",
      status: (defaultValues?.status as ContentStatus) ?? "draft",
      meta_title: defaultValues?.localized?.en?.meta_title ?? defaultValues?.meta_title ?? "",
      meta_description: defaultValues?.localized?.en?.meta_description ?? defaultValues?.meta_description ?? "",
      og_image: defaultValues?.og_image ?? "",
      canonical_url: defaultValues?.canonical_url ?? "",
      keywords: defaultValues?.localized?.en?.keywords ?? defaultValues?.keywords ?? "",
      category: defaultValues?.category ?? "",
      publish_date: defaultValues?.publish_date ?? "",
      author: defaultValues?.author ?? "",
      author_id: defaultValues?.author_id ?? "",
      read_time: defaultValues?.read_time ?? "",
    },
  });

  const values = form.watch();
  const initialContent = useMemo(
    () => safeParseContent(localizedByLang[activeLang].content_json),
    [activeLang, localizedByLang],
  );

  const keywordOptions = useQuery({
    queryKey: ["taxonomy-keywords", keywordQuery],
    queryFn: () => api.taxonomies.list({ type: "keyword", search: keywordQuery, limit: 30 }),
  });
  const categoryOptions = useQuery({
    queryKey: ["taxonomy-categories", categoryQuery],
    queryFn: () => api.taxonomies.list({ type: "category", search: categoryQuery, limit: 30 }),
  });
  const authorOptions = useQuery({
    queryKey: ["authors"],
    queryFn: () => api.authors.list(),
  });

  const completion = useMemo<CompletionItem[]>(() => {
    const mergedLocalized = {
      ...localizedByLang,
      [activeLang]: {
        title: values.title,
        content: values.content,
        content_json: values.content_json,
        meta_title: values.meta_title,
        meta_description: values.meta_description,
        keywords: values.keywords,
      },
    };
    const en = mergedLocalized.en;
    const id = mergedLocalized.id;
    const activeLocalized = mergedLocalized[activeLang];
    return [
      { key: "content-en", label: "Content EN", done: plainLength(en.content) > 0, group: "content", lang: "en" },
      { key: "content-id", label: "Content ID", done: plainLength(id.content) > 0, group: "content", lang: "id" },
      { key: "title", label: `Title (${activeLang.toUpperCase()})`, done: !!activeLocalized.title.trim(), group: "seo", lang: activeLang },
      { key: "meta-title", label: `Meta Title (${activeLang.toUpperCase()})`, done: !!activeLocalized.meta_title.trim(), group: "seo", lang: activeLang },
      { key: "meta-description", label: `Meta Description (${activeLang.toUpperCase()})`, done: !!activeLocalized.meta_description.trim(), group: "seo", lang: activeLang },
      { key: "keywords", label: `Keywords (${activeLang.toUpperCase()})`, done: !!activeLocalized.keywords.trim(), group: "seo", lang: activeLang },
      { key: "slug", label: "Slug", done: !!values.slug.trim(), group: "seo" },
      { key: "category", label: "Category", done: !!values.category.trim(), group: "seo" },
      { key: "featured-image", label: "Featured Image", done: !!values.cover_image.trim(), group: "seo" },
      { key: "author", label: "Author", done: !!values.author_id.trim(), group: "seo" },
      { key: "read-time", label: "Read Time", done: !!values.read_time.trim(), group: "seo" },
    ];
  }, [activeLang, localizedByLang, values.author_id, values.category, values.content, values.content_json, values.cover_image, values.keywords, values.meta_description, values.meta_title, values.read_time, values.slug, values.title]);
  const completionPercent = useMemo(
    () => Math.round((completion.filter((item) => item.done).length / completion.length) * 100),
    [completion],
  );

  useEffect(() => {
    const local = localizedByLang[activeLang];
    form.setValue("title", local.title);
    form.setValue("content", local.content);
    form.setValue("content_json", local.content_json);
    form.setValue("meta_title", local.meta_title);
    form.setValue("meta_description", local.meta_description);
    form.setValue("keywords", local.keywords);
    setHeadings(headingsByLang[activeLang] ?? []);
  }, [activeLang, form, headingsByLang, localizedByLang]);

  function setLocalizedField<K extends keyof LocalizedDraft>(key: K, value: LocalizedDraft[K]) {
    setLocalizedByLang((prev) => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], [key]: value },
    }));
    form.setValue(key as keyof PostFormValues, value as unknown as never, { shouldDirty: true });
  }

  function handleLangChange(next: Lang) {
    const current = form.getValues();
    setLocalizedByLang((prev) => ({
      ...prev,
      [activeLang]: {
        title: current.title,
        content: current.content,
        content_json: current.content_json,
        meta_title: current.meta_title,
        meta_description: current.meta_description,
        keywords: current.keywords,
      },
    }));
    setActiveLang(next);
  }

  function handleMissingItemClick(item: CompletionItem) {
    if (item.lang && item.lang !== activeLang) {
      handleLangChange(item.lang);
    }
  }

  return (
    <form
      className="flex h-screen min-h-0 overflow-hidden bg-white"
      onSubmit={form.handleSubmit((v) => onSubmit({ ...v, localized: localizedByLang }))}
    >
      <EditorSidebar
        values={values}
        headings={headings}
        activeLang={activeLang}
        completion={completion}
        onMissingItemClick={handleMissingItemClick}
      />
      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" asChild>
            <Link to="/posts">
              <ArrowLeft className="h-4 w-4" />
              Posts
            </Link>
          </Button>
          <span className="text-muted-foreground/40">|</span>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", values.status === "published" ? "bg-green-500/10 text-green-700" : "bg-muted text-muted-foreground")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", values.status === "published" ? "bg-green-500" : "bg-muted-foreground/60")} />
            {values.status === "published" ? "Published" : "Draft"}
          </span>
        </div>
        <Tabs value={activeLang} onValueChange={(value) => handleLangChange(value as Lang)}>
          <TabsList className="h-8">
            <TabsTrigger value="en" className="h-6 px-3 text-xs">EN</TabsTrigger>
            <TabsTrigger value="id" className="h-6 px-3 text-xs">ID</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button type="submit" variant="outline" size="sm" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            size="sm"
            type="button"
            disabled={submitting || completionPercent < 100}
            title={completionPercent < 100 ? "Complete all checklist items before publishing" : undefined}
            onClick={() => {
              if (completionPercent < 100) return;
              void form.handleSubmit((v) => onSubmit({ ...v, status: "published", localized: localizedByLang }))();
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_1px_340px]">
        <div className="min-h-0 overflow-y-auto overscroll-contain p-6">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex h-6 items-center rounded-full bg-primary/10 px-2.5 text-xs font-medium text-primary">
                {activeLang === "en" ? "English" : "Indonesian"}
              </span>
            </div>
            <Input
              id="title"
              className="mb-6 border-0 bg-transparent px-0 text-3xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0"
              placeholder={activeLang === "en" ? "Post title..." : "Judul postingan..."}
              value={values.title}
              onChange={(e) => setLocalizedField("title", e.target.value)}
            />
            <TiptapEditor
              key={`editor-${activeLang}`}
              initialContent={initialContent}
              onChange={(json, html) => {
                setLocalizedByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    ...prev[activeLang],
                    content_json: JSON.stringify(json),
                    content: html,
                  },
                }));
                form.setValue("content_json", JSON.stringify(json), { shouldDirty: true });
                form.setValue("content", html, { shouldDirty: true });
              }}
              onHeadingsChange={(next) => {
                setHeadings(next);
                setHeadingsByLang((prev) => ({ ...prev, [activeLang]: next }));
              }}
            />
          </div>
        </div>
        <div className="hidden bg-slate-200 lg:block" />
        <div className="min-h-0 border-l border-border bg-background/50">
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex h-10 shrink-0 items-center border-b border-border px-4">
              <span className="text-xs font-medium text-muted-foreground">SEO & SETTINGS</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
              <SEOSettings
                values={values}
                activeLang={activeLang}
                keywordQuery={keywordQuery}
                setKeywordQuery={setKeywordQuery}
                categoryQuery={categoryQuery}
                setCategoryQuery={setCategoryQuery}
                keywordOptions={keywordOptions.data?.data ?? []}
                categoryOptions={categoryOptions.data?.data ?? []}
                authorOptions={authorOptions.data?.data ?? []}
                onChange={(key, value) => {
                  if (key === "title" || key === "content" || key === "content_json" || key === "meta_title" || key === "meta_description" || key === "keywords") {
                    setLocalizedField(key as keyof LocalizedDraft, value as never);
                    return;
                  }
                  form.setValue(key as any, value as any, { shouldDirty: true });
                }}
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </form>
  );
}
