export const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Content", href: "/content" },
  { label: "Schedule", href: "/schedule" },
];

export const socials = [
  {
    label: "Twitch",
    handle: "mochikolive",
    href: "https://www.twitch.tv/mochikolive",
    icon: "ph-twitch-logo",
  },
  {
    label: "YouTube",
    handle: "@mochikotv",
    href: "https://www.youtube.com/@mochikotv",
    icon: "ph-youtube-logo",
  },
  {
    label: "Ko-fi",
    handle: "support me ♡",
    href: "https://ko-fi.com/mochikotv",
    icon: "ph-coffee",
  },
  {
    label: "Discord",
    handle: "come say hi!",
    href: "https://discord.gg/xZHrPBvFty",
    icon: "ph-discord-logo",
  },
];

export const contentCards = [
  {
    title: "Games",
    copy: "whatever looks fun. i’m not promising i’ll be good at it.",
    image: "/assets/content-gaming.webp",
    alt: "Mochiko in a gaming outfit with a controller",
    icon: "ph-game-controller",
  },
  {
    title: "Chatting",
    copy: "random stories, little updates, and reading what everyone says.",
    image: "/assets/blue-phone.webp",
    alt: "Mochiko holding a blue phone",
    icon: "ph-chat-circle-dots",
  },
  {
    title: "Little things",
    copy: "outfits, drawings, screenshots, and stuff i wanted to keep.",
    image: "/assets/content-cute.webp",
    alt: "Mochiko sitting with a bunny plush",
    icon: "ph-heart",
  },
];

export const favoriteGames = [
  {
    rank: "1",
    title: "Minecraft",
    image: "/assets/favorites/minecraft.jpg",
    href: "https://www.igdb.com/games/minecraft",
  },
  {
    rank: "2",
    title: "Genshin Impact",
    image: "/assets/favorites/genshin-impact.jpg",
    href: "https://www.igdb.com/games/genshin-impact",
  },
  {
    rank: "2",
    title: "Hogwarts Legacy",
    image: "/assets/favorites/hogwarts-legacy.jpg",
    href: "https://www.igdb.com/games/hogwarts-legacy",
  },
  {
    rank: "3",
    title: "Roblox",
    image: "/assets/favorites/roblox.jpg",
    href: "https://www.igdb.com/games/roblox",
  },
  {
    rank: "4",
    title: "Among Us",
    image: "/assets/favorites/among-us.jpg",
    href: "https://www.igdb.com/games/among-us",
  },
  {
    rank: "5",
    title: "GTA V",
    image: "/assets/favorites/gta-v.jpg",
    href: "https://www.igdb.com/games/grand-theft-auto-v",
    note: "single player or FiveM",
  },
];

export const favoriteMusic = {
  artist: "Crankdat",
  artistImage: "/assets/favorites/crankdat.jpg",
  artistHref: "https://crankdat.com/",
  song: "Bass Cannon",
  songDetail: "Flux’s Version — Crankdat Remix",
  songImage: "/assets/favorites/bass-cannon.jpg",
  songHref: "https://www.c-r.link/BassCannon-CrankdatRMX",
};

// The playlist lives on Spotify. The `?si=` share parameter is intentionally
// dropped: it is a per-share tracking token and adds nothing for visitors.
export const playlist = {
  label: "my playlist",
  provider: "Spotify",
  href: "https://open.spotify.com/playlist/1UrOF3ADsifzUjULkN0KWD",
  title: "the loop i live in",
  note: "the songs i keep dragging back to the top of the list.",
  cover: "/assets/favorites/bass-cannon.jpg",
  // Shown as the pinned first row of the fake player. Kept in sync with the
  // favorite song so the card never claims a track that is not documented here.
  topTrack: "Bass Cannon — Crankdat Remix",
};
