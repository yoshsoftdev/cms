"use client";

import { Link } from "react-router-dom";
import { CheckCircle2, FilePenLine, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/cms/stats-card";
import { PostCard } from "@/components/cms/post-card";
import { usePostsList } from "@/hooks/usePosts";

export default function DashboardHomePage() {
  const all = usePostsList({ page: 1, limit: 5 });
  const drafts = usePostsList({ page: 1, limit: 1, status: "draft" });
  const published = usePostsList({ page: 1, limit: 1, status: "published" });

  const recentPosts = all.data?.data ?? [];

  return (
    <div className="-m-6 min-h-full bg-slate-50">
      <div className="p-6">
        <div className="mb-6 flex justify-end">
          <Link to="/posts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Total Posts"
            value={all.data?.total ?? 0}
            icon={FileText}
            description="All posts in the system"
          />
          <StatsCard
            title="Drafts"
            value={drafts.data?.total ?? 0}
            icon={FilePenLine}
            description="Posts waiting to be published"
          />
          <StatsCard
            title="Published"
            value={published.data?.total ?? 0}
            icon={CheckCircle2}
            description="Live posts visible to readers"
          />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Posts</h2>
            <Link to="/posts" className="text-sm text-neutral-500 hover:text-neutral-900">
              View all
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
