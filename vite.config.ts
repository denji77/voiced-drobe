import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to Camb.ai API during development
      '/api/text-to-speech': {
        target: 'https://client.camb.ai',
        changeOrigin: true,
        rewrite: (path) => {
          // Rewrite path to use Camb.ai APIs
          if (path === '/api/text-to-speech' || path === '/api/text-to-speech/') {
            return '/apis/list-voices';
          } else if (path === '/api/text-to-speech/list-voices') {
            return '/apis/list-voices';
          } else if (path === '/api/text-to-speech/tts') {
            return '/apis/tts';
          } else if (path.startsWith('/api/text-to-speech/tts/')) {
            const taskId = path.replace('/api/text-to-speech/tts/', '');
            return `/apis/tts/${taskId}`;
          } else if (path.startsWith('/api/text-to-speech/tts-result/')) {
            const runId = path.replace('/api/text-to-speech/tts-result/', '');
            return `/apis/tts-result/${runId}`;
          }
          // If no match, forward to APIs path
          return path.replace('/api/text-to-speech', '/apis');
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Camb.ai:', req.method, req.url);
            // Log headers for debugging
            console.log('Request headers:', proxyReq.getHeaders());
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from Camb.ai:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
