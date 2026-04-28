"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Clock, Globe, Image, Plus, Search, Share2, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { LdJsonPreview } from "@/components/cms/ldjson-preview";
import { SocialPreview } from "@/components/cms/social-preview";
import type { Author, ContentStatus, TaxonomyTerm } from "@/lib/types";
import type { PostFormValues } from "@/components/forms/post-form";

function CharCounter({ value, min, max }: { value: string; min: number; max: number }) {
  const len = value.length;
  const tone = len > max ? "text-red-600" : len >= min ? "text-emerald-600" : "text-slate-500";
  return <span className={`text-xs tabular-nums ${tone}`}>{len}/{max}</span>;
}

function parseKeywords(csv: string): string[] {
  return csv.split(",").map((v) => v.trim()).filter(Boolean);
}

function toKeywordCSV(list: string[]): string {
  return Array.from(new Set(list.map((v) => v.trim().toLowerCase()).filter(Boolean))).join(", ");
}

interface SEOSettingsProps {
  values: PostFormValues;
  activeLang: "en" | "id";
  keywordQuery: string;
  setKeywordQuery: (value: string) => void;
  categoryQuery: string;
  setCategoryQuery: (value: string) => void;
  keywordOptions: TaxonomyTerm[];
  categoryOptions: TaxonomyTerm[];
  authorOptions: Author[];
  onChange: <K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) => void;
}

const defaultCategories = ["Development", "Design", "Technology", "AI", "Performance", "Accessibility", "Tutorial", "News", "Safety", "Business"];

function parseCategories(csv: string): string[] {
  return csv.split(",").map((v) => v.trim()).filter(Boolean);
}

function toCategoryCSV(list: string[]): string {
  return Array.from(new Set(list.map((v) => v.trim()).filter(Boolean))).join(", ");
}

function sanitizeSlug(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-slate-500" />
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</span>
    </div>
  );
}

export function SEOSettings({
  values,
  activeLang,
  keywordQuery,
  setKeywordQuery,
  categoryQuery,
  setCategoryQuery,
  keywordOptions,
  categoryOptions,
  authorOptions,
  onChange,
}: SEOSettingsProps) {
  const selectedKeywords = useMemo(() => parseKeywords(values.keywords || ""), [values.keywords]);
  const selectedCategories = useMemo(() => parseCategories(values.category || ""), [values.category]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const filteredKeywordOptions = keywordOptions.filter((k) => !selectedKeywords.some((v) => v.toLowerCase() === k.name.toLowerCase()));
  const mergedCategories = useMemo(
    () => Array.from(new Set([...defaultCategories, ...categoryOptions.map((c) => c.name)])),
    [categoryOptions],
  );
  const filteredCategories = mergedCategories.filter((c) => c.toLowerCase().includes(categoryQuery.toLowerCase()));
  const canCreate = categoryQuery.trim().length > 0 && !mergedCategories.some((c) => c.toLowerCase() === categoryQuery.trim().toLowerCase());

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryOpen(false);
        setCategoryQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setCategoryQuery]);

  const addKeyword = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    onChange("keywords", toKeywordCSV([...selectedKeywords, clean]));
    setKeywordQuery("");
  };
  const addKeywordFromInput = useCallback(() => addKeyword(keywordQuery), [addKeyword, keywordQuery]);

  const removeKeyword = (value: string) => {
    onChange(
      "keywords",
      toKeywordCSV(selectedKeywords.filter((v) => v.toLowerCase() !== value.toLowerCase())),
    );
  };

  const addCategory = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    onChange("category", toCategoryCSV([...selectedCategories, clean]));
    setCategoryQuery("");
    setCategoryOpen(false);
  };

  const removeCategory = (value: string) => {
    onChange(
      "category",
      toCategoryCSV(selectedCategories.filter((item) => item.toLowerCase() !== value.toLowerCase())),
    );
  };

  return (
    <div className="space-y-6 pb-6">
      <section className="space-y-3">
        <SectionHeader icon={Globe} title="URL" />
        <FieldGroup>
          <Field>
            <FieldLabel>Slug</FieldLabel>
            <Input
              value={values.slug}
              onChange={(e) => onChange("slug", sanitizeSlug(e.target.value))}
              placeholder="post-url-slug"
              className="font-mono text-sm"
            />
            <FieldDescription>The URL-friendly identifier for this post</FieldDescription>
          </Field>
        </FieldGroup>
      </section>

      <Separator />

      <section className="space-y-4">
        <SectionHeader icon={Tag} title={`Meta Tags (${activeLang.toUpperCase()})`} />
        <FieldGroup>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>Meta Title</FieldLabel>
              <CharCounter value={values.meta_title || ""} min={50} max={60} />
            </div>
            <Input
              value={values.meta_title}
              onChange={(e) => onChange("meta_title", e.target.value)}
              placeholder="Keyword-rich title | Brand Name"
            />
            <FieldDescription>Recommended: 50-60 characters</FieldDescription>
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>Meta Description</FieldLabel>
              <CharCounter value={values.meta_description || ""} min={120} max={160} />
            </div>
            <Textarea
              value={values.meta_description}
              onChange={(e) => onChange("meta_description", e.target.value)}
              placeholder="Compelling summary for search results..."
              rows={3}
            />
            <FieldDescription>Recommended: 120-160 characters</FieldDescription>
          </Field>
        </FieldGroup>
      </section>

      <Separator />

      <section className="space-y-3">
        <SectionHeader icon={Tag} title={`Keywords (${activeLang.toUpperCase()})`} />
        <div className="flex gap-2">
          <Input
            value={keywordQuery}
            onChange={(e) => setKeywordQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addKeywordFromInput();
              }
            }}
            placeholder="Add keyword..."
            className="text-sm"
          />
          <Button variant="outline" size="icon" onClick={addKeywordFromInput} disabled={!keywordQuery.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {(selectedKeywords.length > 0 || filteredKeywordOptions.length > 0) && (
          <div className="space-y-2">
            {selectedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1 pr-1 text-xs">
                    {keyword}
                    <button type="button" onClick={() => removeKeyword(keyword)} className="ml-0.5 rounded-full hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : null}
            {filteredKeywordOptions.length > 0 ? (
              <div className="max-h-24 overflow-y-auto rounded-md border border-slate-200 bg-white p-1">
                {filteredKeywordOptions.slice(0, 8).map((opt) => (
                  <button key={opt.id} type="button" className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-slate-100" onMouseDown={(e) => { e.preventDefault(); addKeyword(opt.name); }}>
                    {opt.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
        <FieldDescription>Press Enter or comma to add. These guide your content focus.</FieldDescription>
      </section>

      <Separator />

      <section className="space-y-4">
        <SectionHeader icon={Clock} title="Publish Info" />
        <FieldGroup>
          <Field>
            <FieldLabel>Author</FieldLabel>
            <Select
              value={values.author_id || ""}
              onValueChange={(v) => {
                const selected = authorOptions.find((item) => item.id === v);
                onChange("author_id", v);
                onChange("author", selected?.name ?? "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select author" />
              </SelectTrigger>
              <SelectContent>
                {authorOptions.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field>
            <FieldLabel>Read Time</FieldLabel>
            <Input value={values.read_time || ""} onChange={(e) => onChange("read_time", e.target.value)} placeholder="e.g. 9 min read" />
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field>
            <FieldLabel>Publish Date</FieldLabel>
            <Input type="date" value={values.publish_date} onChange={(e) => onChange("publish_date", e.target.value)} />
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select value={values.status} onValueChange={(v) => onChange("status", v as ContentStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </section>

      <Separator />

      <section className="space-y-3">
        <SectionHeader icon={Tag} title="Category" />
        {selectedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedCategories.map((cat) => (
              <Badge key={cat} variant="secondary" className="gap-1 pr-1 text-xs">
                {cat}
                <button type="button" onClick={() => removeCategory(cat)} className="ml-0.5 rounded-full hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : null}
        <div ref={categoryRef} className="relative">
          <div
            className="flex cursor-text items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-slate-300"
            onClick={() => setCategoryOpen(true)}
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <input
              value={categoryQuery}
              onChange={(e) => {
                setCategoryQuery(e.target.value);
                setCategoryOpen(true);
              }}
              onFocus={() => setCategoryOpen(true)}
              placeholder="Search or create category..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          {categoryOpen ? (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-md">
              <div className="max-h-52 overflow-y-auto py-1">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => {
                    const selected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (selected) {
                            removeCategory(cat);
                          } else {
                            addCategory(cat);
                          }
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100"
                        type="button"
                      >
                        <span className={`flex h-4 w-4 items-center justify-center rounded-sm border ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"}`}>
                          {selected ? <Check className="h-3 w-3" /> : null}
                        </span>
                        {cat}
                      </button>
                    );
                  })
                ) : !canCreate ? (
                  <p className="px-3 py-2 text-sm text-slate-500">No categories found</p>
                ) : null}
                {canCreate ? (
                  <>
                    {filteredCategories.length > 0 ? <div className="mx-2 my-1 border-t border-slate-200" /> : null}
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addCategory(categoryQuery.trim());
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-slate-100"
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                      Create "{categoryQuery.trim()}"
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <FieldDescription>Select one or more categories, or create a new one.</FieldDescription>
      </section>

      <Separator />

      <section className="space-y-3">
        <SectionHeader icon={Image} title="Featured Image" />
        <FieldGroup>
          <Field>
            <FieldLabel>Image Path</FieldLabel>
            <Input
              value={values.cover_image || ""}
              onChange={(e) => onChange("cover_image", e.target.value)}
              placeholder="/assets/images/blog/post-image.webp"
              className="font-mono text-sm"
            />
            <FieldDescription>Recommended: .webp format, 1200x630px</FieldDescription>
          </Field>
        </FieldGroup>
        {values.cover_image ? (
          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-100">
            <img src={values.cover_image} alt="Featured" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          </div>
        ) : null}
      </section>

      <Separator />

      <section className="space-y-2">
        <SectionHeader icon={Globe} title="Google Preview" />
        <div className="space-y-1 rounded-md border border-slate-200 bg-white p-4">
          <p className="truncate text-xs text-slate-500">{"https://example.com/blog/" + (values.slug || "post-slug")}</p>
          <p className="line-clamp-1 text-sm font-medium leading-snug text-blue-600">{values.meta_title || values.title || "Post Title | Brand"}</p>
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {values.meta_description || "Your meta description will appear here in search results..."}
          </p>
        </div>
      </section>

      <Separator />

      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between py-2 text-left" type="button">
            <SectionHeader icon={Share2} title="Social Preview" />
            <span className="text-xs text-slate-500">Click to expand</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <SocialPreview values={values} />
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between py-2 text-left" type="button">
            <SectionHeader icon={Globe} title="Schema (LD+JSON)" />
            <span className="text-xs text-slate-500">Click to expand</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <LdJsonPreview values={values} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
