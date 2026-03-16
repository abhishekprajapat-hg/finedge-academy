import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type DbTestRow = {
  databaseName: string;
  userName: string;
  serverTime: Date;
};

export async function GET() {
  try {
    const [row] = await prisma.$queryRaw<DbTestRow[]>`
      SELECT
        current_database() AS "databaseName",
        current_user AS "userName",
        now() AS "serverTime"
    `;

    return NextResponse.json({
      ok: true,
      message: "PostgreSQL connected",
      connection: {
        database: row?.databaseName ?? null,
        user: row?.userName ?? null,
        serverTime: row?.serverTime ?? null,
      },
    });
  } catch (error) {
    console.error("DB test failed", error);

    return NextResponse.json(
      {
        ok: false,
        message: "PostgreSQL connection failed",
      },
      { status: 500 },
    );
  }
}
