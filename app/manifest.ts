import type { MetadataRoute } from "next";

/** Web app manifest: name, colors and icons for "Add to Home screen" on Android/Chrome. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shokher Tech Academy",
    short_name: "Shokher Tech Academy",
    description: "এসএসসি ও এইচএসসি অনলাইন পরীক্ষা: অনুশীলন, মডেল টেস্ট ও লাইভ পরীক্ষা",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F7F9",
    theme_color: "#FFFFFF",
    lang: "bn",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
