import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/admin");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      financialProfiles: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Latest Risk Profile</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((entry) => {
                const profile = entry.financialProfiles[0];
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-800">{entry.fullName || "Unnamed"}</p>
                        <p className="text-xs text-slate-500">{entry.email || entry.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">{entry.role}</Badge>
                    </TableCell>
                    <TableCell>{profile ? `${profile.category} (${profile.weightedScore})` : "N/A"}</TableCell>
                    <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

