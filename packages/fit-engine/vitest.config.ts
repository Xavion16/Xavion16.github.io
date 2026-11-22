import { defineConfig } from "vitest/config"

// Rapor Faz 5 kabulü: fit-engine ≥ %90 test kapsamı — altına düşerse test başarısız olur.
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/index.ts"],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
})
