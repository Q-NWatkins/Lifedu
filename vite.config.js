import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Split heavy third-party SDKs into their own long-cacheable chunks so
        // the app's primary bundle stays lean. Each vendor changes on its own
        // release cadence, so isolating them also improves browser caching.
        // Function form assigns by module path — reliable and no empty chunks.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@clerk')) return 'vendor-clerk';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('@sentry') || id.includes('posthog-js')) return 'vendor-instrument';
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'vendor-react';
          }
          return 'vendor'; // remaining third-party deps
        },
      },
    },
    // Vendor chunks (Clerk especially) can legitimately exceed the 500 kB
    // default; raise the advisory ceiling so a clean build stays quiet.
    chunkSizeWarningLimit: 900,
  },
});