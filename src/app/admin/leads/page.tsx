import { redirect } from "next/navigation";
import { LeadsInbox } from "@/components/admin/leads-inbox";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLeadsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Lead Inbox</h1>
      <LeadsInbox />
    </div>
  );
}

