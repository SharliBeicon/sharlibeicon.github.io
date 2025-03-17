import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import tailwindConfig from "./tailwind.config.ts";
import prism from "lume/plugins/prism.ts";
import inline from "lume/plugins/inline.ts";
import favicon from "lume/plugins/favicon.ts";
import minifyHTML from "lume/plugins/minify_html.ts";
import date from "lume/plugins/date.ts";

import "npm:prismjs@1.29.0/components/prism-rust.js";

const site = lume({
  src: "./src",
  location: new URL("https://charliebacon.dev"),
});

site.copy("assets");

site.use(date());
site.use(
  favicon({
    input: "/public/favicon.svg",
  }),
);

site.use(
  googleFonts({
    subsets: ["latin"],
    cssFile: "/assets/css/styles.css",
    fonts:
      "https://fonts.googleapis.com/css2?family=Hind+Vadodara:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Rosario:ital,wght@0,300..700;1,300..700&display=swap",
  }),
);

site.use(
  prism({
    theme: [
      {
        name: "default",
        cssFile: "/assets/css/vendor/prism-default.css",
      },
      {
        name: "tomorrow",
        cssFile: "/assets/css/vendor/prism-tomorrow.css",
      },
    ],
  }),
);

site.remoteFile(
  "assets/css/vendor/horizon.min.css",
  "https://cdn.jsdelivr.net/npm/theme-toggles@4.10.1/css/horizon.min.css",
);

const commitCmd = new Deno.Command("git", { args: ["rev-parse", "HEAD"] });
const { stdout } = await commitCmd.output();
const commitHash = new TextDecoder().decode(stdout);

site.data("commit", commitHash);

site.data("currentYear", new Date().getFullYear());

site.use(inline());
site.use(tailwindcss(tailwindConfig));
site.use(postcss());

site.use(
  minifyHTML({
    extensions: [".html", ".js"],
  }),
);

export default site;
