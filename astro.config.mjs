// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "url";
import rehypeExternalLinks from "rehype-external-links";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://charliebacon.dev",
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { target: "_blank", rel: ["noopener", "noreferrer"] },
      ],
    ],
    shikiConfig: {
      themes: {
        dark: "one-dark-pro",
        light: "one-light",
      },
    },
  },
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    plugins: [tailwindcss()],
  },
});
