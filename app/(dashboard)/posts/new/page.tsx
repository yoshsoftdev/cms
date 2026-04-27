"use client";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PostForm, type PostFormValues } from "@/components/forms/post-form";
import { usePostMutations } from "@/hooks/usePosts";
import { ApiError } from "@/lib/api";

export default function NewPostPage() {
  const navigate = useNavigate();
  const { create } = usePostMutations();

  async function onSubmit(values: PostFormValues) {
    try {
      const post = await create.mutateAsync(values);
      toast.success("Postingan dibuat");
      navigate(`/posts/${post.id}`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan");
    }
  }

  return (
    <div>
      <PostForm onSubmit={onSubmit} submitting={create.isPending} />
    </div>
  );
}
