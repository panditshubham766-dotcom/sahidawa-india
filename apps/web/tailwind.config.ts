import type { Config } from "tailwindcss";

// Registered per issue #634. tailwindcss-rtl targets Tailwind v1 APIs and is not
// loaded at build time on Tailwind v4; RTL is handled via html[dir], logical
// utilities (ms/me/ps/pe), and the native rtl: variant.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwindcssRtl = require("tailwindcss-rtl");

export default {
    plugins: [tailwindcssRtl],
} satisfies Config;
