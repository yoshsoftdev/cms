export type ContentStatus = "draft" | "published";

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  content_json: string;
  excerpt: string;
  cover_image: string;
  status: ContentStatus;
  meta_title: string;
  meta_description: string;
  og_image: string;
  canonical_url: string;
  keywords: string;
  category: string;
  publish_date: string;
  author: string;
  read_time: string;
  created_at: string;
  updated_at: string;
}

export type Page = Post;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface NavigationTreeNode {
  id: string;
  label: string;
  url: string;
  order: number;
  type: string;
  target: string;
  is_active: boolean;
  location: string;
  children: NavigationTreeNode[];
}

export interface NavigationPublicResponse {
  data: NavigationTreeNode[];
}

export interface NavigationFlat extends Omit<NavigationTreeNode, "children"> {
  parent_id: string | null;
}

export interface LoginResponse {
  token: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
}

export interface TaxonomyTerm {
  id: string;
  type: "keyword" | "category";
  name: string;
}
