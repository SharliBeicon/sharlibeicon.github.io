import typography from "npm:@tailwindcss/typography";

export default {
  options: {
    plugins: [typography],
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          custom: {
            dark: "#222831",
            mediumdark: "#393E46",
            accent: "#00ADB5",
            darkeraccent: "#007d84",
            mediumlight: "#A8A8A8",
            light: "#EEEEEE",
          },
        },
        typography: () => ({
          DEFAULT: {
            css: {
              "--tw-prose-body": "#393E46",
              "--tw-prose-headings": "#222831",
              "--tw-prose-links": "#007d84",
              a: {
                color: "#007d84",
                "&:hover": {
                  color: "#00ADB5",
                },
              },
              p: {
                fontSize: "1.125rem",
                lineHeight: "1.5rem",
                fontWeight: "300",
                fontFamily: ["Hind Vadodara", "Verdana", "sans-serif"].join(
                  ", ",
                ),
                color: "var(--tw-prose-body)",
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
              },
              ol: {
                fontSize: "1.125rem",
                lineHeight: "1.5rem",
                fontWeight: "300",
                fontFamily: ["Hind Vadodara", "Verdana", "sans-serif"].join(
                  ", ",
                ),
                color: "var(--tw-prose-body)",
              },
              "tbody td": {
                fontFamily: ["Hind Vadodara", "Verdana", "sans-serif"].join(
                  ", ",
                ),
                fontSize: "1.125rem",
                lineHeight: "1.5rem",
              },
              figcaption: {
                fontFamily: ["Hind Vadodara", "Verdana", "sans-serif"].join(
                  ", ",
                ),
                fontSize: "0.5rem",
                lineHeight: "0.75rem",
              },
              ul: {
                fontSize: "1.125rem",
                lineHeight: "1.5rem",
                fontWeight: "300",
                fontFamily: ["Hind Vadodara", "Verdana", "sans-serif"].join(
                  ", ",
                ),
                color: "var(--tw-prose-body)",
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
                li: {
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem",
                },
              },
              h1: {
                fontFamily: ["Open Sans", "Arial", "sans-serif"].join(", "),
                color: "var(--tw-prose-headings)",
                marginBottom: "0.5rem",
                marginTop: "1rem",
                fontWeight: "700",
              },
              h2: {
                marginTop: "1rem",
                fontFamily: ["Rosario", "Georgia", "serif"].join(", "),
                color: "var(--tw-prose-headings)",
                marginBottom: "0.5rem",
              },
              h3: {
                marginTop: "1rem",
                fontFamily: ["Rosario", "Georgia", "serif"].join(", "),
                color: "var(--tw-prose-headings)",
                marginBottom: "0.5rem",
              },
              h4: {
                marginTop: "1rem",
                fontFamily: ["Rosario", "Georgia", "serif"].join(", "),
                color: "var(--tw-prose-headings)",
                marginBottom: "0.5rem",
              },
              code: {
                fontFamily: [
                  "JetBrains Mono",
                  "Menlo",
                  "Monaco",
                  "Lucida Console",
                  "Courier New",
                  "Courier",
                  "monospace",
                ].join(", "),
              },
            },
          },
          lg: {
            css: {
              h1: { marginBottom: "0" },
              h2: { marginTop: "1rem", marginBottom: "0.5rem" },
              h3: { marginTop: "1rem", marginBottom: "0.5rem" },
              h4: { marginTop: "1rem", marginBottom: "0.5rem" },
              p: {
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
              },
              ul: {
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
                li: {
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem",
                },
              },
            },
          },
          xl: {
            css: {
              h1: { marginBottom: "0" },
              h2: { marginTop: "1rem", marginBottom: "0.5rem" },
              h3: { marginTop: "1rem", marginBottom: "0.5rem" },
              h4: { marginTop: "1rem", marginBottom: "0.5rem" },
              p: {
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
              },
              ul: {
                li: {
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem",
                },
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
              },
            },
          },
          invert: {
            css: {
              "--tw-prose-body": "#EEEEEE",
              "--tw-prose-headings": "#A8A8A8",
              "--tw-prose-links": "#00ADB5",
              a: {
                color: "#00ADB5",
                "&:hover": {
                  color: "#007d84",
                },
              },
            },
          },
        }),
      },
      fontFamily: {
        title: ["Open Sans", "Arial", "sans-serif"],
        display: ["Rosario", "Georgia", "serif"],
        text: ["Hind Vadodara", "Verdana", "sans-serif"],
        mono: [
          "JetBrains Mono",
          "Menlo",
          "Monaco",
          "Lucida Console",
          "Courier New",
          "Courier",
          "monospace",
        ],
      },
    },
  },
};
