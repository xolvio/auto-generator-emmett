import { defineConfig } from "vitest/config.js";

export default defineConfig({
  test: {
    include: ["**/__tests__/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@src": "/src",
    },
  },
});
