"use client";

import { useEffect, useState } from "react";
import { BlogStatus } from "@prisma/client";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: BlogStatus;
};

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
  status: BlogStatus;
};

const initialForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "<p>Start writing...</p>",
  featuredImage: "",
  metaTitle: "",
  metaDescription: "",
  status: BlogStatus.DRAFT,
};

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedId, setSelectedId] = useState<string>("new");
  const [form, setForm] = useState<BlogForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadPosts = async () => {
    const response = await fetch("/api/admin/blog");
    const data = (await response.json()) as { ok: boolean; posts: BlogPost[] };
    if (data.ok) {
      setPosts(data.posts);
    }
  };

  useEffect(() => {
    void loadPosts();
  }, []);

  useEffect(() => {
    if (selectedId === "new") {
      setForm(initialForm);
      return;
    }

    const post = posts.find((item) => item.id === selectedId);
    if (post) {
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content,
        featuredImage: post.featuredImage || "",
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        status: post.status,
      });
    }
  }, [selectedId, posts]);

  const onSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const endpoint = selectedId === "new" ? "/api/admin/blog" : `/api/admin/blog/${selectedId}`;
      const method = selectedId === "new" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "Unable to save blog post");
        return;
      }

      setMessage("Blog post saved");
      setSelectedId("new");
      await loadPosts();
    } catch {
      setMessage("Unable to save blog post");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (selectedId === "new") {
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/blog/${selectedId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "Unable to delete blog post");
        return;
      }

      setMessage("Blog post deleted");
      setSelectedId("new");
      await loadPosts();
    } catch {
      setMessage("Unable to delete blog post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Choose Blog Post</Label>
        <Select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
          <option value="new">+ New Post</option>
          {posts.map((post) => (
            <option key={post.id} value={post.id}>
              {post.title}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Excerpt</Label>
        <Textarea value={form.excerpt} onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))} />
      </div>

      <div className="space-y-2">
        <Label>Content (TipTap)</Label>
        <RichTextEditor value={form.content} onChange={(value) => setForm((prev) => ({ ...prev, content: value }))} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Featured Image URL</Label>
          <Input value={form.featuredImage} onChange={(event) => setForm((prev) => ({ ...prev, featuredImage: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as BlogStatus }))}>
            <option value={BlogStatus.DRAFT}>Draft</option>
            <option value={BlogStatus.PUBLISHED}>Published</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Meta Title</Label>
          <Input value={form.metaTitle} onChange={(event) => setForm((prev) => ({ ...prev, metaTitle: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Meta Description</Label>
          <Textarea value={form.metaDescription} onChange={(event) => setForm((prev) => ({ ...prev, metaDescription: event.target.value }))} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={onSave} disabled={loading}>
          {loading ? "Saving..." : selectedId === "new" ? "Create Post" : "Update Post"}
        </Button>
        {selectedId !== "new" ? (
          <Button type="button" variant="destructive" onClick={onDelete} disabled={loading}>
            Delete Post
          </Button>
        ) : null}
      </div>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}

