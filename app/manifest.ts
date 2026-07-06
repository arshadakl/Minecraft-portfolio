import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arshad A — Developer & Security Researcher",
    short_name: "Arshad A",
    description:
      "3D Minecraft-style portfolio of Arshad A — full-stack developer and security researcher from Kerala, India.",
    start_url: "/",
    display: "standalone",
    background_color: "#181310",
    theme_color: "#181310",
    icons: [
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
