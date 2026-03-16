import { getSignedBunnyPlayUrl, parseBunnyEmbedUrl } from "@/lib/bunny";

export function toEmbeddableVideoUrl(input: string) {
  const raw = input.trim();
  if (!raw) {
    return raw;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }

  const host = url.hostname.toLowerCase();

  if (host === "iframe.mediadelivery.net" || host === "player.mediadelivery.net") {
    const parsed = parseBunnyEmbedUrl(raw);
    if (!parsed) {
      return raw;
    }
    return `https://iframe.mediadelivery.net/embed/${parsed.libraryId}/${parsed.videoId}`;
  }

  const parseYouTubeTimestamp = (value: string | null) => {
    if (!value) {
      return null;
    }

    if (/^\d+$/.test(value)) {
      return Number(value);
    }

    const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
    if (!match) {
      return null;
    }

    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    const seconds = Number(match[3] || 0);
    const total = hours * 3600 + minutes * 60 + seconds;
    return total > 0 ? total : null;
  };

  const withStartParam = (base: string) => {
    const startValue = parseYouTubeTimestamp(url.searchParams.get("start") || url.searchParams.get("t"));
    if (!startValue) {
      return base;
    }
    return `${base}?start=${startValue}`;
  };

  const cleanYouTubeId = (value: string | null | undefined) => {
    if (!value) {
      return null;
    }
    const id = value.trim();
    if (!id) {
      return null;
    }
    return id;
  };

  if (host === "youtu.be") {
    const id = cleanYouTubeId(url.pathname.split("/").filter(Boolean)[0]);
    if (!id) {
      return raw;
    }
    return withStartParam(`https://www.youtube.com/embed/${id}`);
  }

  if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts[0] === "embed") {
      const id = cleanYouTubeId(parts[1]);
      return id ? withStartParam(`https://www.youtube.com/embed/${id}`) : raw;
    }

    if (parts[0] === "shorts" || parts[0] === "live") {
      const id = cleanYouTubeId(parts[1]);
      return id ? withStartParam(`https://www.youtube.com/embed/${id}`) : raw;
    }

    if (url.pathname === "/watch") {
      const id = cleanYouTubeId(url.searchParams.get("v"));
      return id ? withStartParam(`https://www.youtube.com/embed/${id}`) : raw;
    }
  }

  if (host === "vimeo.com" || host === "www.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = [...parts].reverse().find((segment) => /^\d+$/.test(segment));
    return id ? `https://player.vimeo.com/video/${id}` : raw;
  }

  if (host === "player.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "video" && /^\d+$/.test(parts[1] || "")) {
      return `https://player.vimeo.com/video/${parts[1]}`;
    }
  }

  return raw;
}

export function toPlayableVideoUrl(input: string) {
  const embeddable = toEmbeddableVideoUrl(input);
  return getSignedBunnyPlayUrl(embeddable);
}
