import { getToken } from "@/lib/auth";
import type {
  LoginResponse,
  ContentRecord,
  ContentDetail,
  NavigationFlat,
  NavigationPublicResponse,
  NavigationTreeNode,
  Page,
  PaginatedResponse,
  Post,
  UploadResponse,
  TaxonomyTerm,
  Author,
} from "@/lib/types";

function getBaseUrl(): string {
  const raw = import.meta.env.VITE_CMS_BASE_URL?.trim();
  if (!raw) throw new Error("VITE_CMS_BASE_URL tidak di-set");
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/$/, "");
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers: hdr, ...rest } = options;
  const headers = new Headers(hdr);
  headers.set("Accept", "application/json");
  if (!(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, { ...rest, headers });

  if (!res.ok) {
    const body = await parseJson<unknown>(res);
    const msg =
      typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: unknown }).error)
        : res.statusText;
    throw new ApiError(msg || `HTTP ${res.status}`, res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return parseJson<T>(res);
}

export const api = {
  login: (username: string, password: string) =>
    apiFetch<LoginResponse>("/admin/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ username, password }),
    }),

  posts: {
    list: (params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    }) => {
      const q = new URLSearchParams();
      if (params.page) q.set("page", String(params.page));
      if (params.limit) q.set("limit", String(params.limit));
      if (params.status) q.set("status", params.status);
      if (params.search) q.set("search", params.search);
      const qs = q.toString();
      return apiFetch<PaginatedResponse<Post>>(`/admin/posts${qs ? `?${qs}` : ""}`);
    },
    create: (body: Partial<Post>) =>
      apiFetch<Post>("/admin/posts", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Post>) =>
      apiFetch<Post>(`/admin/posts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => apiFetch<void>(`/admin/posts/${id}`, { method: "DELETE" }),
  },

  contents: {
    list: (params: {
      page?: number;
      limit?: number;
      status?: string;
      type?: "post" | "page";
      locale?: "en" | "id";
      search?: string;
    }) => {
      const q = new URLSearchParams();
      if (params.page) q.set("page", String(params.page));
      if (params.limit) q.set("limit", String(params.limit));
      if (params.status) q.set("status", params.status);
      if (params.type) q.set("type", params.type);
      if (params.locale) q.set("locale", params.locale);
      if (params.search) q.set("search", params.search);
      const qs = q.toString();
      return apiFetch<PaginatedResponse<ContentRecord>>(`/contents${qs ? `?${qs}` : ""}`, { auth: false });
    },
    getById: (id: string, locale: "en" | "id" = "en") =>
      apiFetch<ContentDetail>(`/contents/${id}?locale=${locale}`, { auth: false }),
    getBySlug: (slug: string, locale: "en" | "id" = "en") =>
      apiFetch<ContentDetail>(`/contents/slug/${slug}?locale=${locale}`, { auth: false }),
    create: (body: Record<string, unknown>) =>
      apiFetch("/admin/contents", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Record<string, unknown>) =>
      apiFetch(`/admin/contents/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => apiFetch<void>(`/admin/contents/${id}`, { method: "DELETE" }),
  },

  pages: {
    list: (params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    }) => {
      const q = new URLSearchParams();
      if (params.page) q.set("page", String(params.page));
      if (params.limit) q.set("limit", String(params.limit));
      if (params.status) q.set("status", params.status);
      if (params.search) q.set("search", params.search);
      const qs = q.toString();
      return apiFetch<PaginatedResponse<Page>>(`/admin/pages${qs ? `?${qs}` : ""}`);
    },
    create: (body: Partial<Page>) =>
      apiFetch<Page>("/admin/pages", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Page>) =>
      apiFetch<Page>(`/admin/pages/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => apiFetch<void>(`/admin/pages/${id}`, { method: "DELETE" }),
  },

  navigation: {
    tree: (location?: string) => {
      const qs = location ? `?location=${encodeURIComponent(location)}` : "";
      return apiFetch<NavigationPublicResponse>(`/navigation${qs}`, { auth: false });
    },
    create: (body: Record<string, unknown>) =>
      apiFetch("/admin/navigation", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Record<string, unknown>) =>
      apiFetch(`/admin/navigation/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => apiFetch<void>(`/admin/navigation/${id}`, { method: "DELETE" }),
    reorder: (location: string, ids: string[]) =>
      apiFetch<void>("/admin/navigation/reorder", {
        method: "POST",
        body: JSON.stringify({ location, ids }),
      }),
  },

  upload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch<UploadResponse>("/admin/upload", {
      method: "POST",
      body: fd,
    });
  },

  taxonomies: {
    list: (params: {
      type: "keyword" | "category";
      search?: string;
      limit?: number;
    }) => {
      const q = new URLSearchParams();
      q.set("type", params.type);
      if (params.search) q.set("search", params.search);
      if (params.limit) q.set("limit", String(params.limit));
      return apiFetch<{ data: TaxonomyTerm[] }>(`/admin/taxonomies?${q.toString()}`);
    },
  },

  authors: {
    list: (params?: { search?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set("search", params.search);
      return apiFetch<{ data: Author[] }>(`/admin/authors${q.toString() ? `?${q.toString()}` : ""}`);
    },
    create: (body: Pick<Author, "name" | "photo" | "alt_text">) =>
      apiFetch<Author>("/admin/authors", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Pick<Author, "name" | "photo" | "alt_text">) =>
      apiFetch<Author>(`/admin/authors/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => apiFetch<void>(`/admin/authors/${id}`, { method: "DELETE" }),
  },
};

/** Flatten tree untuk UI admin + inferensi parent_id */
export function flattenNavigationTree(
  nodes: NavigationTreeNode[],
  parentId: string | null = null,
): NavigationFlat[] {
  const out: NavigationFlat[] = [];
  for (const n of nodes) {
    const { children, ...rest } = n;
    out.push({
      ...rest,
      parent_id: parentId,
    });
    if (children?.length) {
      out.push(...flattenNavigationTree(children, n.id));
    }
  }
  return out;
}
