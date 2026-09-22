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
    handle: "support the channel",
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
    copy: "whatever I feel like playing, from Minecraft to city builders.",
    image: "/assets/content-gaming.webp",
    alt: "Mochiko in a gaming outfit with a controller",
    icon: "ph-game-controller",
  },
  {
    title: "Chatting",
    copy: "stories that go nowhere, tech rambling, and reading everything in chat.",
    image: "/assets/blue-phone.webp",
    alt: "Mochiko holding a blue phone",
    icon: "ph-chat-circle-dots",
  },
  {
    title: "Collections",
    copy: "plushies, screenshots, and things i got way too invested in.",
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

export const playlist = {
  label: "my playlist",
  provider: "Spotify",
  href: "https://open.spotify.com/playlist/1UrOF3ADsifzUjULkN0KWD",
  title: "the loop i live in",
  note: "fast, catchy and bassy. genre is not really a factor, energy is.",
  cover: "/assets/favorites/bass-cannon.jpg",
  topTrack: "Bass Cannon — Crankdat Remix",
};
