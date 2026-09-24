/** Extracts a YouTube video ID from watch, youtu.be, shorts, live and embed URLs. */
export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function instagramEmbed(url: string): string | null {
  const m = url.match(/instagram\.com\/(p|reel|tv)\/([\w-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : null;
}
