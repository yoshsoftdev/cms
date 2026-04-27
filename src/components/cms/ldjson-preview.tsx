"use client";

import { useMemo, useState } from "react";
import { Check, Code, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PostFormValues } from "@/components/forms/post-form";

function estimateTimeRequired(readTime: string) {
  const match = readTime.match(/\d+/);
  const mins = match ? Number(match[0]) : 5;
  return `PT${mins}M`;
}

export function LdJsonPreview({ values }: { values: PostFormValues }) {
  const [copied, setCopied] = useState(false);
  const baseURL = "https://example.com";
  const postURL = `${baseURL}/blog/${values.slug || "post-slug"}`;
  const imageURL = values.cover_image || values.og_image || `${baseURL}/default-og-image.jpg`;
  const wordCount = Math.round((values.content || "").replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length);
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postURL,
    },
    headline: values.title || "Post title",
    description: values.meta_description || values.excerpt || "",
    image: imageURL,
    author: { "@type": "Person", name: values.author || "Author" },
    publisher: {
      "@type": "Organization",
      name: "Your Site Name",
      logo: { "@type": "ImageObject", url: `${baseURL}/logo.png` },
    },
    datePublished: values.publish_date || new Date().toISOString(),
    dateModified: values.publish_date || new Date().toISOString(),
    inLanguage: "en-US",
    keywords: values.keywords,
    articleSection: values.category || "",
    wordCount,
    timeRequired: estimateTimeRequired(values.read_time || "5 min read"),
  };
  const scriptTag = useMemo(
    () => `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`,
    [schema],
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">LD+JSON Schema</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1.5 text-xs">
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-slate-100 p-3">
        <pre className="whitespace-pre-wrap break-all text-xs text-slate-800">
          <code>
            {`<script type="application/ld+json">`}
            {"\n"}
            {JSON.stringify(schema, null, 2)}
            {"\n"}
            {`</script>`}
          </code>
        </pre>
      </div>
      <p className="text-xs text-slate-500">Add this to your page's {"<head>"} for rich search results.</p>
    </div>
  );
}
