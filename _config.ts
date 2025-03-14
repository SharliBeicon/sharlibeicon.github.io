import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import tailwindConfig from "./tailwind.config.ts";
import prism from "lume/plugins/prism.ts";
import inline from "lume/plugins/inline.ts";
import favicon from "lume/plugins/favicon.ts";
import minifyHTML from "lume/plugins/minify_html.ts";

import "npm:prismjs@1.29.0/components/prism-rust.js";

const site = lume({
  src: "./src",
  location: new URL("https://charliebacon.dev"),
});

site.copy("assets");

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
      "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
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
