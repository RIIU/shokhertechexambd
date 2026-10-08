import type { MetadataRoute } from "next";

/** Web app manifest: name, colors and icons for "Add to Home screen" on Android/Chrome. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shokher Tech Academy",
    short_name: "Shokher Tech Academy",
    description: "এসএসসি ও এইচএসসি অনলাইন পরীক্ষা: অনুশীলন, মডেল টেস্ট ও লাইভ পরীক্ষা",
    start_url: "/",
    display: "standalone",
    background_color: "#002417",
    theme_color: "#002417",
    lang: "bn",
    icons: [
      // ?v= busts the immutable cache on the PNG rule in next.config.js.
      { src: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
