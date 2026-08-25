import { defineConfig, devices } from "@playwright/test"
import { fileURLToPath } from "node:url"

const siteRoot = fileURLToPath(new URL("./", import.meta.url))
const cloudflarePreview = process.env.NYCUSTODIAN_PLAYWRIGHT_PREVIEW === "cloudflare"
const port = cloudflarePreview ? 8787 : 4173
const defaultBaseURL = `http://127.0.0.1:${port}`
const baseURL = process.env.NYCUSTODIAN_PLAYWRIGHT_BASE_URL ?? defaultBaseURL
const chromiumExecutable = process.env.NYCUSTODIAN_CHROMIUM_EXECUTABLE

const previewCommand = cloudflarePreview
  ? "bun run build && bun run wrangler dev --config scripts/wrangler-preview.jsonc --ip 127.0.0.1 --port 8787 --show-interactive-dev-session=false"
  : "bun run build && bun run vite preview --host 127.0.0.1 --port 4173 --strictPort"

const serverConfiguration = process.env.NYCUSTODIAN_PLAYWRIGHT_BASE_URL === undefined
  ? {
      webServer: {
        command: previewCommand,
        cwd: siteRoot,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: defaultBaseURL
      }
    }
  : {}

export default defineConfig({
  testDir: "./browser-tests",
  testMatch: "**/*.pw.ts",
  ...(cloudflarePreview ? {} : { grepInvert: /@cloudflare/ }),
  outputDir: "/tmp/nycustodian-playwright-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  ...(process.env.CI ? { workers: 2 } : {}),
  reporter: process.env.CI
    ? [
        ["github"],
        ["html", { open: "never", outputFolder: "/tmp/nycustodian-playwright-report" }]
      ]
    : [["list"]],
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL,
    locale: "en-US",
    serviceWorkers: "allow",
    screenshot: "only-on-failure",
    timezoneId: "UTC",
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          ignoreDefaultArgs: ["--disable-back-forward-cache"],
          ...(chromiumExecutable === undefined
            ? { channel: "chromium" }
            : { executablePath: chromiumExecutable })
        }
      }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    }
  ],
  ...serverConfiguration
})
