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
            mediumlight: "#BFBFBF",
            light: "#EEEEEE",
          },
        },
        typography: ({ theme }) => ({
          DEFAULT: {
            css: {
              "--tw-prose-body": theme("colors.custom.mediumdark"),
              "--tw-prose-headings": theme("colors.custom.accent"),
              p: {
                fontSize: "1.125rem",
                lineHeight: "1.75rem",
                fontWeight: "300",
                fontFamily: "Fira Sans",
                color: "var(--tw-prose-body)",
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
              },
              ol: {
                fontSize: "1.125rem",
                lineHeight: "1.75rem",
                fontWeight: "300",
                fontFamily: "Fira Sans",
                color: "var(--tw-prose-body)",
              },
              ul: {
                fontSize: "1.125rem",
                lineHeight: "1.75rem",
                fontWeight: "300",
                fontFamily: "Fira Sans",
                color: "var(--tw-prose-body)",
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
                li: {
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem",
                },
              },
              h1: {
                fontFamily: "Fira Sans Condensed",
                color: "var(--tw-prose-headings)",
                marginBottom: "0.5rem",
                marginTop: "1rem",
              },
              h2: {
                marginTop: "1rem",
                fontFamily: "Fira Sans Condensed",
                color: "var(--tw-prose-headings)",
                marginBottom: "0.5rem",
              },
              h3: {
                marginTop: "1rem",
                fontFamily: "Fira Sans Condensed",
                color: "var(--tw-prose-headings)",
                marginBottom: "0.5rem",
              },
              h4: {
                marginTop: "1rem",
                fontFamily: "Fira Sans Condensed",
                color: "var(--tw-prose-headings)",
                marginBottom: "0.5rem",
              },
              code: {
                fontFamily: "Fira Mono",
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
              "--tw-prose-body": theme("colors.custom.light"),
              "--tw-prose-headings": theme("colors.custom.darkeraccent"),
            },
          },
        }),
      },
      fontFamily: {
        text: ["Fira Sans"],
        mono: ["Fira Mono"],
        display: ["Fira Sans Condensed"],
      },
    },
  },
};
