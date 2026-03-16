import { NextResponse } from "next/server";
import { badRequest, serverError } from "@/lib/http";
import { createBunnyVideo, getBunnyEmbedUrl, hasBunnyStreamConfigured, uploadBunnyVideoBinary } from "@/lib/bunny";
import { requireAdmin } from "@/lib/route-guards";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error || !auth.session) {
    return auth.error;
  }

  if (!hasBunnyStreamConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Bunny Stream is not configured. Add library id and API key in .env.",
      },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const titleEntry = formData.get("title");

    if (!(fileEntry instanceof File)) {
      return badRequest("Missing video file");
    }

    const file = fileEntry;
    const title = typeof titleEntry === "string" && titleEntry.trim() ? titleEntry.trim() : file.name;

    if (!file.type.startsWith("video/")) {
      return badRequest("Only video files are supported");
    }

    const created = await createBunnyVideo({ title });
    await uploadBunnyVideoBinary(created.videoId, await file.arrayBuffer());

    return NextResponse.json({
      ok: true,
      videoId: created.videoId,
      videoUrl: getBunnyEmbedUrl(created.videoId, created.libraryId),
    });
  } catch (error) {
    console.error(error);
    return serverError("Unable to upload video to Bunny Stream");
  }
}
