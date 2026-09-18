import type { APIRoute } from "astro";

export const prerender = false;

const CHANNEL = "mochikolive";
const DECAPI = "https://decapi.me/twitch";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  },
});

const getText = async (path: string) => {
  const response = await fetch(`${DECAPI}/${path}`, {
    headers: { "User-Agent": "MochikoWebsite/1.0" },
    signal: AbortSignal.timeout(6500),
  });
  if (!response.ok) throw new Error(`DecAPI returned ${response.status}`);
  return (await response.text()).trim();
};

export const GET: APIRoute = async () => {
  try {
    const [uptimeResult, titleResult, gameResult, viewersResult, videoResult] = await Promise.allSettled([
      getText(`uptime/${CHANNEL}?offline_msg=offline`),
      getText(`title/${CHANNEL}`),
      getText(`game/${CHANNEL}`),
      getText(`viewercount/${CHANNEL}`),
      getText(`videos/${CHANNEL}?limit=1&video_format=%24%7Btitle%7D%7C%7C%7C%24%7Burl%7D`),
    ]);

    const value = (result: PromiseSettledResult<string>) => result.status === "fulfilled" ? result.value : "";
    const uptime = value(uptimeResult);
    const isLive = Boolean(uptime && uptime.toLowerCase() !== "offline" && !uptime.toLowerCase().includes("is offline"));
    const title = value(titleResult);
    const gameName = value(gameResult);
    const viewerCount = Number.parseInt(value(viewersResult), 10);

    const videoRaw = value(videoResult);
    const separator = videoRaw.lastIndexOf("|||");
    const videoTitle = separator > -1 ? videoRaw.slice(0, separator).trim() : "";
    const videoUrl = separator > -1 ? videoRaw.slice(separator + 3).trim() : "";

    return json({
      configured: true,
      source: "decapi",
      live: isLive ? {
        isLive: true,
        title: title || "i’m live right now!!",
        gameName: gameName || null,
        viewerCount: Number.isFinite(viewerCount) ? viewerCount : null,
        uptime,
        url: `https://www.twitch.tv/${CHANNEL}`,
      } : { isLive: false },
      video: videoUrl.startsWith("http") ? {
        id: videoUrl.split("/").filter(Boolean).at(-1),
        title: videoTitle || "latest stream",
        publishedAt: null,
        thumbnailUrl: null,
        url: videoUrl,
      } : null,
      schedule: [],
    });
  } catch (error) {
    console.error("DecAPI Twitch error", error);
    return json({ configured: true, source: "decapi", live: null, video: null, schedule: [], error: "Twitch is taking a tiny nap." }, 502);
  }
};
