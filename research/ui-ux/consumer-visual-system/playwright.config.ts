import { defineConfig, devices } from "../../../apps/site/node_modules/@playwright/test/index.mjs"
import { fileURLToPath } from "node:url"

const prototypeRoot = fileURLToPath(new URL("./", import.meta.url))
const rawPort = process.env.NYCUSTODIAN_VISUAL_PROTOTYPE_PORT ?? "4196"
if (!/^\d+$/.test(rawPort)) {
  throw new Error("NYCUSTODIAN_VISUAL_PROTOTYPE_PORT must be an integer from 1024 through 65535")
}
const port = Number.parseInt(rawPort, 10)

if (!Number.isSafeInteger(port) || port < 1024 || port > 65_535) {
  throw new Error("NYCUSTODIAN_VISUAL_PROTOTYPE_PORT must be an integer from 1024 through 65535")
}

const baseURL = `http://127.0.0.1:${port}`
const chromiumExecutable = process.env.NYCUSTODIAN_CHROMIUM_EXECUTABLE
const evidenceCoordinates = {
  protocolId: "CODEX-ONLY-UIUX-V1",
  reviewMode: "codex-only",
  humanEvidence: "none",
  humanParticipantCount: 0,
  humanReviewRequired: false,
  notHumanUsabilityTested: true
} as const

export default defineConfig({
  metadata: evidenceCoordinates,
  testDir: prototypeRoot,
  testMatch: "visual-system-research.pw.ts",
  outputDir: "/tmp/nycustodian-visual-system-playwright-results",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    [
      "html",
      {
        open: "never",
        outputFolder: "/tmp/nycustodian-visual-system-playwright-report"
      }
    ]
  ],
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL,
    locale: "en-US",
    serviceWorkers: "block",
    screenshot: "only-on-failure",
    timezoneId: "UTC",
    trace: "retain-on-failure",
    video: "off"
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: chromiumExecutable === undefined
          ? { channel: "chromium" }
          : { executablePath: chromiumExecutable }
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
  webServer: {
    command: "node ./serve-prototype.mjs",
    cwd: prototypeRoot,
    reuseExistingServer: false,
    timeout: 30_000,
    url: baseURL
  }
})
