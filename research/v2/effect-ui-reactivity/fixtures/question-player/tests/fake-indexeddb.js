// Test-only IndexedDB API shim used when the managed Chromium policy blocks all navigations.
// This is not native IndexedDB proof. It preserves async request and transaction-complete
// ordering closely enough to exercise the fixture's persistence adapter and reveal gate.
(() => {
  const databases = new Map()

  class FakeRequest {
    constructor() {
      this.result = undefined
      this.error = null
      this.onsuccess = null
      this.onerror = null
      this.onupgradeneeded = null
      this.onblocked = null
    }
  }

  class FakeObjectStoreNames {
    constructor(dbState) {
      this.dbState = dbState
    }
    contains(name) {
      return this.dbState.stores.has(name)
    }
  }

  const cloneValue = (value) => value === undefined ? undefined : structuredClone(value)
  const cloneStore = (store) => ({
    keyPath: store.keyPath,
    records: new Map(Array.from(store.records, ([key, value]) => [key, cloneValue(value)]))
  })

  class FakeTransaction {
    constructor(dbState, names, mode) {
      this.dbState = dbState
      this.names = Array.isArray(names) ? names : [names]
      this.mode = mode
      this.error = null
      this.oncomplete = null
      this.onerror = null
      this.onabort = null
      this.aborted = false
      this.completed = false
      this.pending = 0
      this.finalizeTimer = null
      this.working = new Map()
      for (const name of this.names) {
        const source = dbState.stores.get(name)
        if (!source) throw new Error(`Unknown object store: ${name}`)
        this.working.set(name, mode === "readwrite" ? cloneStore(source) : source)
      }
      this.scheduleFinalize()
    }

    objectStore(name) {
      if (!this.working.has(name)) throw new Error(`Store not in transaction: ${name}`)
      return new FakeObjectStore(this, name)
    }

    begin() {
      if (this.aborted || this.completed) throw new Error("TransactionInactiveError")
      this.pending += 1
      if (this.finalizeTimer !== null) {
        clearTimeout(this.finalizeTimer)
        this.finalizeTimer = null
      }
    }

    end() {
      this.pending -= 1
      this.scheduleFinalize()
    }

    scheduleFinalize() {
      if (this.pending !== 0 || this.aborted || this.completed || this.finalizeTimer !== null) return
      this.finalizeTimer = setTimeout(() => {
        this.finalizeTimer = null
        if (this.pending !== 0 || this.aborted || this.completed) return
        if (this.mode === "readwrite") {
          for (const [name, store] of this.working) this.dbState.stores.set(name, store)
        }
        this.completed = true
        this.oncomplete?.({ target: this })
      }, 0)
    }

    abort() {
      if (this.aborted || this.completed) return
      this.aborted = true
      if (this.finalizeTimer !== null) clearTimeout(this.finalizeTimer)
      this.finalizeTimer = null
      setTimeout(() => this.onabort?.({ target: this }), 0)
    }
  }

  class FakeObjectStore {
    constructor(tx, name) {
      this.tx = tx
      this.name = name
    }

    get store() {
      return this.tx.working.get(this.name)
    }

    request(operation) {
      const req = new FakeRequest()
      this.tx.begin()
      queueMicrotask(() => {
        if (this.tx.aborted) {
          req.error = new Error("AbortError")
          req.onerror?.({ target: req })
          this.tx.end()
          return
        }
        try {
          req.result = operation()
          req.onsuccess?.({ target: req })
        } catch (error) {
          req.error = error
          this.tx.error = error
          req.onerror?.({ target: req })
          this.tx.onerror?.({ target: this.tx })
        } finally {
          this.tx.end()
        }
      })
      return req
    }

    keyFor(value, suppliedKey) {
      const key = suppliedKey ?? (this.store.keyPath ? value?.[this.store.keyPath] : undefined)
      if (key === undefined) throw new Error("DataError: key required")
      return key
    }

    get(key) {
      return this.request(() => cloneValue(this.store.records.get(key)))
    }

    put(value, key) {
      return this.request(() => {
        const resolved = this.keyFor(value, key)
        this.store.records.set(resolved, cloneValue(value))
        return resolved
      })
    }

    add(value, key) {
      return this.request(() => {
        const resolved = this.keyFor(value, key)
        if (this.store.records.has(resolved)) throw new Error("ConstraintError")
        this.store.records.set(resolved, cloneValue(value))
        return resolved
      })
    }

    delete(key) {
      return this.request(() => {
        this.store.records.delete(key)
        return undefined
      })
    }
  }

  class FakeDatabase {
    constructor(state) {
      this.state = state
      this.objectStoreNames = new FakeObjectStoreNames(state)
    }

    createObjectStore(name, options = {}) {
      if (this.state.stores.has(name)) throw new Error("ConstraintError")
      this.state.stores.set(name, { keyPath: options.keyPath, records: new Map() })
      return { name }
    }

    transaction(names, mode = "readonly") {
      return new FakeTransaction(this.state, names, mode)
    }

    close() {}
  }

  const fakeIndexedDB = {
    open(name, version = 1) {
      const req = new FakeRequest()
      queueMicrotask(() => {
        let state = databases.get(name)
        const oldVersion = state?.version ?? 0
        if (!state) {
          state = { version, stores: new Map() }
          databases.set(name, state)
        } else if (version > state.version) {
          state.version = version
        }
        req.result = new FakeDatabase(state)
        if (version > oldVersion) req.onupgradeneeded?.({ oldVersion, newVersion: version, target: req })
        queueMicrotask(() => req.onsuccess?.({ target: req }))
      })
      return req
    },

    deleteDatabase(name) {
      const req = new FakeRequest()
      queueMicrotask(() => {
        databases.delete(name)
        req.onsuccess?.({ target: req })
      })
      return req
    },

    _snapshot() {
      return Array.from(databases, ([name, state]) => ({
        name,
        version: state.version,
        stores: Object.fromEntries(Array.from(state.stores, ([storeName, store]) => [
          storeName,
          Array.from(store.records, ([key, value]) => [key, cloneValue(value)])
        ]))
      }))
    }
  }

  Object.defineProperty(globalThis, "indexedDB", {
    value: fakeIndexedDB,
    configurable: true,
    enumerable: true,
    writable: false
  })
  globalThis.__fakeIndexedDB = fakeIndexedDB
})()
