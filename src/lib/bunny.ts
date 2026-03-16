import { createHash } from "node:crypto";
import { env } from "@/lib/env";

type BunnyCreateVideoInput = {
  title: string;
};

const BUNNY_API_BASE = "https://video.bunnycdn.com";

function ensureBunnyConfig() {
  if (!env.BUNNY_STREAM_LIBRARY_ID || !env.BUNNY_STREAM_API_KEY) {
    throw new Error("Bunny Stream is not configured. Set BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY.");
  }

  return {
    libraryId: String(env.BUNNY_STREAM_LIBRARY_ID),
    apiKey: env.BUNNY_STREAM_API_KEY,
  };
}

function isGuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function hasBunnyStreamConfigured() {
  return Boolean(env.BUNNY_STREAM_LIBRARY_ID && env.BUNNY_STREAM_API_KEY);
}

export function getBunnyEmbedUrl(videoId: string, libraryId?: string) {
  const resolvedLibrary = libraryId || String(env.BUNNY_STREAM_LIBRARY_ID || "");
  if (!resolvedLibrary) {
    throw new Error("Missing Bunny Stream library id");
  }

  return `https://iframe.mediadelivery.net/embed/${resolvedLibrary}/${videoId}`;
}

export function parseBunnyEmbedUrl(input: string) {
  const raw = input.trim();
  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (host !== "iframe.mediadelivery.net" && host !== "player.mediadelivery.net") {
      return null;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 3 || (parts[0] !== "embed" && parts[0] !== "play")) {
      return null;
    }

    const [, libraryId, videoId] = parts;
    if (!libraryId || !videoId || !isGuid(videoId)) {
      return null;
    }

    return { libraryId, videoId };
  } catch {
    return null;
  }
}

export function signBunnyEmbedUrl(url: string, expiresAt: number) {
  if (!env.BUNNY_STREAM_EMBED_TOKEN_KEY) {
    return url;
  }

  const parsed = parseBunnyEmbedUrl(url);
  if (!parsed) {
    return url;
  }

  const token = createBunnyToken(parsed.videoId, expiresAt);

  const signed = new URL(getBunnyEmbedUrl(parsed.videoId, parsed.libraryId));
  signed.searchParams.set("token", token);
  signed.searchParams.set("expires", String(expiresAt));

  return signed.toString();
}

export function getSignedBunnyEmbedUrl(url: string) {
  const ttl = env.BUNNY_STREAM_TOKEN_TTL_SECONDS;
  const expiresAt = Math.floor(Date.now() / 1000) + ttl;
  return signBunnyEmbedUrl(url, expiresAt);
}

function createBunnyToken(videoId: string, expiresAt: number) {
  return createHash("sha256")
    .update(`${env.BUNNY_STREAM_EMBED_TOKEN_KEY}${videoId}${expiresAt}`)
    .digest("hex");
}

export function signBunnyPlayUrl(url: string, expiresAt: number) {
  const parsed = parseBunnyEmbedUrl(url);
  if (!parsed) {
    return url;
  }

  const playUrl = new URL(`https://player.mediadelivery.net/play/${parsed.libraryId}/${parsed.videoId}`);
  if (!env.BUNNY_STREAM_EMBED_TOKEN_KEY) {
    return playUrl.toString();
  }

  const token = createBunnyToken(parsed.videoId, expiresAt);
  playUrl.searchParams.set("token", token);
  playUrl.searchParams.set("expires", String(expiresAt));
  return playUrl.toString();
}

export function getSignedBunnyPlayUrl(url: string) {
  const ttl = env.BUNNY_STREAM_TOKEN_TTL_SECONDS;
  const expiresAt = Math.floor(Date.now() / 1000) + ttl;
  return signBunnyPlayUrl(url, expiresAt);
}

export async function createBunnyVideo(input: BunnyCreateVideoInput) {
  const config = ensureBunnyConfig();

  const response = await fetch(`${BUNNY_API_BASE}/library/${config.libraryId}/videos`, {
    method: "POST",
    headers: {
      AccessKey: config.apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      title: input.title,
    }),
  });

  const text = await response.text();
  let payload: { guid?: string } = {};
  if (text) {
    try {
      payload = JSON.parse(text) as { guid?: string };
    } catch {
      payload = {};
    }
  }

  if (!response.ok || !payload.guid) {
    throw new Error(`Unable to create Bunny video (${response.status})`);
  }

  return {
    libraryId: config.libraryId,
    videoId: payload.guid,
  };
}

export async function uploadBunnyVideoBinary(videoId: string, data: ArrayBuffer) {
  const config = ensureBunnyConfig();

  const response = await fetch(`${BUNNY_API_BASE}/library/${config.libraryId}/videos/${videoId}`, {
    method: "PUT",
    headers: {
      AccessKey: config.apiKey,
      "Content-Type": "application/octet-stream",
    },
    body: Buffer.from(data),
  });

  if (!response.ok) {
    throw new Error(`Unable to upload Bunny video binary (${response.status})`);
  }
}
