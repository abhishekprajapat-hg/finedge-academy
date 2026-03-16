import { redirect } from "next/navigation";
import { CourseManager } from "@/components/admin/course-manager";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminCoursesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Course Manager</h1>
      <CourseManager />
    </div>
  );
}

