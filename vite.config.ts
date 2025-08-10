import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// We no longer need 'path' since we are removing the alias
// import path from "path"; 
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/geo-tagger-web/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  // The 'resolve' and 'alias' sections have been removed.
}));