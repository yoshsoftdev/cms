"use client";

import { useState } from "react";
import { AlignLeft, PenSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { CompletionItem, PostFormValues } from "@/components/forms/post-form";

export interface TocHeading {
  id: string;
  level: number;
  text: string;
}

interface EditorSidebarProps {
  values: PostFormValues;
  headings: TocHeading[];
  activeLang: "en" | "id";
  completion: CompletionItem[];
  onMissingItemClick?: (item: CompletionItem) => void;
}


export function EditorSidebar({ values, headings, activeLang, completion, onMissingItemClick }: EditorSidebarProps) {
  const checks = completion;
  const [showMissing, setShowMissing] = useState(false);

  const done = checks.filter((item) => item.done).length;
  const percent = Math.round((done / checks.length) * 100);
  const contentChecks = checks.filter((item) => item.group === "content");
  const seoChecks = checks.slice(2);
  const contentDone = contentChecks.filter((item) => item.done).length;
  const seoDone = seoChecks.filter((item) => item.done).length;
  const missingItems = checks.filter((item) => !item.done);

  return (
    <aside className="hidden h-full w-64 shrink-0 overflow-y-auto overscroll-contain border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4">
        <PenSquare className="h-5 w-5 text-slate-800" />
        <span className="text-3xl font-semibold leading-none tracking-tight text-slate-900">CMS</span>
      </div>
      <div className="space-y-3 border-b border-slate-200 p-3">
        <button
          type="button"
          onClick={() => setShowMissing((prev) => !prev)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="text-lg font-medium leading-none text-slate-900">Completion</span>
          <span className="text-xs font-semibold text-emerald-600">{percent}%</span>
        </button>
        <div className="h-1.5 rounded-full bg-slate-200">
          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
        </div>

        <div className="space-y-2 pt-1">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-slate-500">Content</span>
              <span className="text-xs text-slate-500">{contentDone}/{contentChecks.length}</span>
            </div>
            <div className="flex gap-1">
              {contentChecks.map((item) => (
                <span key={item.label} className={cn("h-1 w-full rounded-full", item.done ? "bg-emerald-500" : "bg-slate-300")} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-slate-500">SEO</span>
              <span className="text-xs text-slate-500">{seoDone}/{seoChecks.length}</span>
            </div>
            <div className="flex gap-1">
              {seoChecks.map((item) => (
                <span key={item.label} className={cn("h-1 w-full rounded-full", item.done ? "bg-blue-500" : "bg-slate-300")} />
              ))}
            </div>
          </div>
        </div>
        {showMissing && missingItems.length > 0 ? (
          <div className="space-y-1 pt-1">
            {missingItems.slice(0, 4).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onMissingItemClick?.(item)}
                className="flex w-full items-center gap-1.5 text-left text-[11px] text-slate-500 hover:text-slate-900"
              >
                <span className="h-1 w-1 rounded-full bg-slate-400" />
                {item.label} missing
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="px-4 py-5">
        <div className="mb-3 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
          {activeLang === "en" ? "EN" : "ID"} content checks
        </div>
        <div className="mb-3 flex items-center gap-2 border-t border-slate-200 pt-4">
          <AlignLeft className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">Table of Contents</span>
        </div>
        {headings.length === 0 ? (
          <p className="text-sm italic leading-snug text-slate-400">Add headings to your content to generate table of contents.</p>
        ) : (
          <ul className="space-y-1.5">
            {headings.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={cn("block rounded px-1 py-0.5 text-sm text-slate-600 hover:text-slate-900", item.level === 2 && "pl-3", item.level === 3 && "pl-6")}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-slate-200 p-4">
        <Link to="/posts" className="text-xs text-slate-500 hover:text-slate-900">Back to posts</Link>
      </div>
    </aside>
  );
}
