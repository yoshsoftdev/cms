"use client";

import { useMemo, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import type { TocHeading } from "@/components/cms/editor-sidebar";

type SlashCommand = {
  id: string;
  label: string;
  run: () => void;
};

function extractHeadingsFromHTML(html: string): TocHeading[] {
  const parser = document.createElement("div");
  parser.innerHTML = html;
  const extracted: TocHeading[] = [];
  parser.querySelectorAll("h1, h2, h3").forEach((el, i) => {
    const text = el.textContent?.trim() ?? "";
    const level = Number(el.tagName.replace("H", ""));
    const id = `heading-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
    if (!text) return;
    extracted.push({ id, level, text });
  });
  return extracted;
}

export function TiptapEditor({
  initialContent,
  onChange,
  onHeadingsChange,
}: {
  initialContent?: JSONContent | null;
  onChange: (json: JSONContent, html: string) => void;
  onHeadingsChange?: (headings: TocHeading[]) => void;
}) {
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: "Start writing your post... type '/' for commands" }),
    ],
    content: initialContent ?? { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "prose prose-sm sm:prose-base max-w-none min-h-[360px] px-4 py-3 focus:outline-none" },
      handleKeyDown: (_, event) => {
        if (event.key === "/") {
          setSlashOpen(true);
          setSlashQuery("");
        }
        if (slashOpen && event.key === "Escape") {
          setSlashOpen(false);
          return true;
        }
        return false;
      },
    },
    onCreate: ({ editor: e }) => {
      if (!onHeadingsChange) return;
      onHeadingsChange(extractHeadingsFromHTML(e.getHTML()));
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      onChange(e.getJSON(), html);
      if (onHeadingsChange) {
        onHeadingsChange(extractHeadingsFromHTML(html));
      }
    },
  });

  const slashCommands: SlashCommand[] = useMemo(
    () =>
      !editor
        ? []
        : [
            { id: "h1", label: "Heading 1", run: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
            { id: "h2", label: "Heading 2", run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
            { id: "h3", label: "Heading 3", run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
            { id: "bullet", label: "Bullet List", run: () => editor.chain().focus().toggleBulletList().run() },
            { id: "ordered", label: "Ordered List", run: () => editor.chain().focus().toggleOrderedList().run() },
            { id: "quote", label: "Blockquote", run: () => editor.chain().focus().toggleBlockquote().run() },
          ],
    [editor],
  );

  const filteredSlash = slashCommands.filter((c) => c.label.toLowerCase().includes(slashQuery.toLowerCase()));

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-3">
      <EditorToolbar editor={editor} />

      <div className="relative rounded-lg border border-slate-200 bg-white">
        <EditorContent editor={editor} />
        {slashOpen ? (
          <div className="absolute left-3 top-3 z-20 w-56 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
            <input
              className="mb-2 w-full rounded border border-slate-200 px-2 py-1 text-sm"
              placeholder="Type command..."
              value={slashQuery}
              onChange={(e) => setSlashQuery(e.target.value)}
            />
            <div className="max-h-40 overflow-auto">
              {filteredSlash.map((cmd) => (
                <button
                  key={cmd.id}
                  type="button"
                  className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-slate-100"
                  onClick={() => {
                    cmd.run();
                    setSlashOpen(false);
                    setSlashQuery("");
                  }}
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
