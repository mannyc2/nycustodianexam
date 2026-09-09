import type { Page } from "@playwright/test"

export const holdWritesToStore = async (page: Page, storeName: string): Promise<void> => {
  await page.evaluate((targetStore) => {
    const owner = window as typeof window & {
      __nycustodianHeldWrite?: {
        readonly originalPut: typeof IDBObjectStore.prototype.put
        released: boolean
      }
    }
    if (owner.__nycustodianHeldWrite !== undefined) {
      throw new Error("A browser-test IndexedDB write is already held")
    }
    const state = {
      originalPut: IDBObjectStore.prototype.put,
      released: false
    }
    owner.__nycustodianHeldWrite = state
    IDBObjectStore.prototype.put = function(value, key) {
      const request = state.originalPut.call(this, value, key)
      if (this.name !== targetStore) return request
      const store = this
      const keepAlive = (): void => {
        if (state.released) return
        const next = store.get("__nycustodian-browser-test-keepalive__")
        next.onsuccess = keepAlive
        next.onerror = keepAlive
      }
      keepAlive()
      return request
    }
  }, storeName)
}

export const releaseHeldStoreWrites = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianHeldWrite?: {
        readonly originalPut: typeof IDBObjectStore.prototype.put
        released: boolean
      }
    }
    const state = owner.__nycustodianHeldWrite
    if (state === undefined) throw new Error("No browser-test IndexedDB write is held")
    state.released = true
    IDBObjectStore.prototype.put = state.originalPut
    delete owner.__nycustodianHeldWrite
  })
}

