import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DatabaseUnavailable({
  context = "data",
}: {
  context?: string;
}) {
  return (
    <Card className="border-[#f3d9a9] bg-[#fff7e8]">
      <CardHeader>
        <CardTitle className="text-[#7a4a08]">Database unavailable</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-[#7a4a08]">
        <p>
          We could not load {context} because PostgreSQL is not reachable at
          <span className="font-semibold"> localhost:5432</span>.
        </p>
        <p>
          Start your DB server, then run <code>npm run prisma:migrate</code> and <code>npm run prisma:seed</code>.
        </p>
        <p>
          <Link href="/" className="font-semibold underline">
            Go back to Home
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
