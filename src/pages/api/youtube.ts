import type { APIRoute } from "astro";

export const prerender = false;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
  },
});

export const GET: APIRoute = async () => {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) return json({ configured: false, videos: [] });

  try {
    const channelParams = new URLSearchParams({
      part: "contentDetails,snippet",
      forHandle: "mochikotv",
      key: apiKey,
    });
    const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?${channelParams}`);
    if (!channelResponse.ok) throw new Error("Unable to find the YouTube channel");
    const channelData = await channelResponse.json();
    const uploadsPlaylist = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylist) return json({ configured: true, videos: [] });

    const uploadsParams = new URLSearchParams({
      part: "snippet,contentDetails",
      playlistId: uploadsPlaylist,
      maxResults: "4",
      key: apiKey,
    });
    const uploadsResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${uploadsParams}`);
    if (!uploadsResponse.ok) throw new Error("Unable to load YouTube uploads");
    const uploadsData = await uploadsResponse.json();

    return json({
      configured: true,
      videos: (uploadsData.items ?? []).map((item: any) => ({
        id: item.contentDetails?.videoId,
        title: item.snippet?.title,
        publishedAt: item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt,
        thumbnailUrl: item.snippet?.thumbnails?.maxres?.url
          ?? item.snippet?.thumbnails?.high?.url
          ?? item.snippet?.thumbnails?.medium?.url,
        url: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId}`,
      })),
    });
  } catch (error) {
    console.error("YouTube API error", error);
    return json({ configured: true, videos: [], error: "YouTube is taking a tiny nap." }, 502);
  }
};
