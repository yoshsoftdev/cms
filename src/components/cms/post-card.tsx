"use client";

import { Link } from "react-router-dom";
import type { Post } from "@/lib/types";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link to={`/posts/${post.id}`} className="block rounded-lg border border-neutral-200 bg-white p-4 hover:bg-neutral-50">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-neutral-900">{post.title || "Untitled"}</p>
          <p className="mt-1 text-sm text-neutral-500">{post.author || "Unknown author"}</p>
        </div>
        <span
          className={
            post.status === "published"
              ? "inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
              : "inline-flex rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700"
          }
        >
          {post.status === "published" ? "Published" : "Draft"}
        </span>
      </div>
    </Link>
  );
}
