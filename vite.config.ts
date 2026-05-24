import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves the site under /<repo>/, so prod builds need a matching base.
// Locally (`npm run dev`) we still want to serve from /.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/mystery-meadow/" : "/",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
}));
