"use client";

import { Camera, Globe, Share2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PostFormValues } from "@/components/forms/post-form";

export function SocialPreview({ values }: { values: PostFormValues }) {
  const image = values.cover_image || values.og_image;
  const title = values.meta_title || values.title || "Post title";
  const desc = values.meta_description || values.excerpt || "Post description preview";
  const author = values.author || "Author";
  const authorInitial = author.charAt(0).toUpperCase();

  return (
    <Tabs defaultValue="linkedin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="linkedin" className="gap-2 text-xs">
          <Share2 className="h-3.5 w-3.5" />
          LinkedIn
        </TabsTrigger>
        <TabsTrigger value="instagram" className="gap-2 text-xs">
          <Camera className="h-3.5 w-3.5" />
          Instagram
        </TabsTrigger>
      </TabsList>

      <TabsContent value="linkedin" className="mt-3">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="space-y-2 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <span className="text-xs font-semibold text-slate-500">{authorInitial}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{author}</p>
                <p className="text-xs text-slate-500">Posted just now</p>
              </div>
            </div>
            <p className="line-clamp-3 text-sm text-slate-900">{desc}</p>
          </div>
          <div className="border-t border-slate-200">
            {image ? (
              <div className="relative aspect-[1.91/1] bg-slate-100">
                <img src={image} alt="LinkedIn preview" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex aspect-[1.91/1] items-center justify-center bg-slate-100">
                <Globe className="h-12 w-12 text-slate-400" />
              </div>
            )}
            <div className="space-y-1 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">example.com</p>
              <p className="line-clamp-2 text-sm font-semibold text-slate-900">{title}</p>
              <p className="line-clamp-1 text-xs text-slate-500">{desc}</p>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="instagram" className="mt-3">
        <div className="mx-auto max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 p-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                <span className="text-xs font-semibold text-slate-900">{authorInitial}</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-900">{author.toLowerCase().replace(/\s+/g, "")}</p>
          </div>
          {image ? (
            <div className="relative aspect-square bg-slate-100">
              <img src={image} alt="Instagram preview" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center bg-slate-100">
              <Camera className="h-16 w-16 text-slate-400" />
            </div>
          )}
          <div className="space-y-2 p-3">
            <p className="text-sm">
              <span className="font-semibold text-slate-900">{author.toLowerCase().replace(/\s+/g, "")}</span>{" "}
              <span className="line-clamp-2 text-slate-900">{title}</span>
            </p>
            <p className="text-xs text-slate-500">View all comments</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
