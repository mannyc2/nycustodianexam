import { expect, type Page } from "@playwright/test"

export const waitForActiveServiceWorker = async (page: Page): Promise<void> => {
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration()
        return registration?.active?.state ?? null
      })
    )
    .toBe("activated")
}
