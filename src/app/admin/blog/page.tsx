import { redirect } from "next/navigation";
import { BlogManager } from "@/components/admin/blog-manager";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminBlogPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Blog Content Manager</h1>
      <BlogManager />
    </div>
  );
}

