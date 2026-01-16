import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  vite: {
    server: {
      host: true,
      hmr: {
        port: 24678,
        clientPort: 24678, // Força o cliente a usar esta porta externa
      },
    },
  },
});
