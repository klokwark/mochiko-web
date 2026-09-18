import type { APIRoute } from "astro";

export const prerender = false;

const CHANNEL_ID = "UC5LMkE7TdqWo2gO2I8vKxyg";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
  },
});

const decodeXml = (value = "") => value
  .replaceAll("&amp;", "&")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&quot;", "\"")
  .replaceAll("&#39;", "'");

const readTag = (entry: string, tag: string) => {
  const match = entry.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
  return decodeXml(match?.[1]?.trim() ?? "");
};

export const GET: APIRoute = async () => {
  try {
    const response = await fetch(FEED_URL, {
      headers: { "User-Agent": "MochikoWebsite/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`YouTube feed returned ${response.status}`);

    const xml = await response.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
    const videos = entries.slice(0, 4).map((entry) => {
      const id = readTag(entry, "yt:videoId");
      const thumbnail = entry.match(/<media:thumbnail\s+url="([^"]+)"/)?.[1];
      return {
        id,
        title: readTag(entry, "title"),
        publishedAt: readTag(entry, "published"),
        thumbnailUrl: decodeXml(thumbnail) || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${id}`,
      };
    }).filter((video) => video.id);

    return json({ configured: true, source: "youtube-rss", videos });
  } catch (error) {
    console.error("YouTube RSS error", error);
    return json({ configured: true, source: "youtube-rss", videos: [], error: "YouTube is taking a tiny nap." }, 502);
  }
};
