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
        typography: {
          DEFAULT: {
            css: {
              p: {
                fontFamily: "Fira Sans",
              },
              h1: {
                fontFamily: "Fira Sans Condensed",
              },
              h2: {
                fontFamily: "Fira Sans Condensed",
              },
              h3: {
                fontFamily: "Fira Sans Condensed",
              },
              h4: {
                fontFamily: "Fira Sans Condensed",
              },
              code: {
                fontFamily: "Fira Mono",
              },
              textAlign: "justify",
            },
          },
        },
      },
      fontFamily: {
        text: ["Fira Sans"],
        mono: ["Fira Mono"],
        display: ["Fira Sans Condensed"],
      },
    },
  },
};
