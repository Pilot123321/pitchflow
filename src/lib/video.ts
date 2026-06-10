// Client-safe parsing of founder video URLs into playable sources.
// Supports YouTube Shorts / watch / youtu.be, Instagram Reels, and
// direct video files.

export type VideoSource =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "instagram"; embedUrl: string }
  | { kind: "file"; url: string };

export function videoSourceFor(url?: string): VideoSource | null {
  if (!url) return null;

  const yt = url.match(
    /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,20})/i
  );
  if (yt) {
    const id = yt[1];
    return {
      kind: "youtube",
      embedUrl:
        `https://www.youtube.com/embed/${id}` +
        `?autoplay=1&mute=1&loop=1&playlist=${id}` +
        `&controls=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`,
    };
  }

  const ig = url.match(/instagram\.com\/(?:reels?|p)\/([\w-]+)/i);
  if (ig) {
    return { kind: "instagram", embedUrl: `https://www.instagram.com/reel/${ig[1]}/embed/` };
  }

  if (/\.(mp4|webm|mov)(\?|#|$)/i.test(url)) {
    return { kind: "file", url };
  }
  return null;
}
