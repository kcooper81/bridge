import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TeamPrompt",
    short_name: "TeamPrompt",
    description:
      "AI prompt management for teams — shared libraries, quality guidelines, and data protection.",
    start_url: "/home",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563EB",
    icons: [
      {
        src: "/brand/logo-icon-blue.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
