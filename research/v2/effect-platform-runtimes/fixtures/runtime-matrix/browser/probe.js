const resultElement = document.querySelector("#result");
const results = {};

const requestPromise = (request) => new Promise((resolve, reject) => {
  request.addEventListener("success", () => resolve(request.result), { once: true });
  request.addEventListener("error", () => reject(request.error), { once: true });
});

const transactionPromise = (transaction) => new Promise((resolve, reject) => {
  transaction.addEventListener("complete", () => resolve(), { once: true });
  transaction.addEventListener("abort", () => reject(transaction.error || new DOMException("aborted", "AbortError")), { once: true });
  transaction.addEventListener("error", () => reject(transaction.error || new Error("transaction error")), { once: true });
});

async function indexedDbProbe() {
  const dbName = `r23-${crypto.randomUUID()}`;
  const openRequest = indexedDB.open(dbName, 1);
  openRequest.addEventListener("upgradeneeded", () => {
    openRequest.result.createObjectStore("attempts");
  }, { once: true });
  const db = await requestPromise(openRequest);

  const writeTx = db.transaction("attempts", "readwrite", { durability: "strict" });
  writeTx.objectStore("attempts").put({ selected: "B", committed: true }, "attempt-1");
  await transactionPromise(writeTx);

  const readTx = db.transaction("attempts", "readonly");
  const committedValue = await requestPromise(readTx.objectStore("attempts").get("attempt-1"));
  await transactionPromise(readTx);

  const abortTx = db.transaction("attempts", "readwrite");
  abortTx.objectStore("attempts").put({ selected: "C", committed: false }, "attempt-abort");
  abortTx.abort();
  let abortObserved = false;
  try {
    await transactionPromise(abortTx);
  } catch (error) {
    abortObserved = error?.name === "AbortError" || abortTx.error === null;
  }

  const verifyTx = db.transaction("attempts", "readonly");
  const abortedValue = await requestPromise(verifyTx.objectStore("attempts").get("attempt-abort"));
  await transactionPromise(verifyTx);

  db.close();
  indexedDB.deleteDatabase(dbName);
  return {
    committedValue,
    abortObserved,
    abortedValueMissing: abortedValue === undefined
  };
}

async function cacheProbe() {
  const cache = await caches.open("r23-browser-cache");
  await cache.put("/cache-probe", new Response("cache-ok", { headers: { "content-type": "text/plain" } }));
  const response = await cache.match("/cache-probe");
  const body = response ? await response.text() : null;
  await caches.delete("r23-browser-cache");
  return { body };
}

async function broadcastProbe() {
  if (!("BroadcastChannel" in globalThis)) return { available: false };
  const name = `r23-${crypto.randomUUID()}`;
  const sender = new BroadcastChannel(name);
  const receiver = new BroadcastChannel(name);
  const received = new Promise((resolve) => {
    receiver.addEventListener("message", (event) => resolve(event.data), { once: true });
  });
  sender.postMessage({ ping: "pong" });
  const value = await received;
  sender.close();
  receiver.close();
  return { available: true, value };
}

async function locksProbe() {
  if (!navigator.locks) return { available: false };
  const sequence = [];
  await navigator.locks.request("r23-lock", async () => {
    sequence.push("acquired");
    await Promise.resolve();
    sequence.push("released");
  });
  return { available: true, sequence };
}

async function storageProbe() {
  if (!navigator.storage) return { available: false };
  const estimate = await navigator.storage.estimate();
  const persisted = navigator.storage.persisted ? await navigator.storage.persisted() : null;
  return {
    available: true,
    usageIsNumber: typeof estimate.usage === "number",
    quotaIsNumber: typeof estimate.quota === "number",
    persisted
  };
}

async function compressionProbe() {
  if (!("CompressionStream" in globalThis) || !("DecompressionStream" in globalThis)) {
    return { available: false };
  }
  const input = new TextEncoder().encode("deterministic-r23-compression");
  const compressed = new Response(new Blob([input]).stream().pipeThrough(new CompressionStream("gzip")));
  const compressedBytes = new Uint8Array(await compressed.arrayBuffer());
  const decompressed = new Response(new Blob([compressedBytes]).stream().pipeThrough(new DecompressionStream("gzip")));
  const output = await decompressed.text();
  return { available: true, roundTrip: output === "deterministic-r23-compression", compressedBytes: compressedBytes.byteLength };
}

async function streamProbe() {
  const chunks = [];
  const writable = new WritableStream({ write(chunk) { chunks.push(chunk); } });
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue("a");
      controller.enqueue("b");
      controller.close();
    }
  });
  await readable.pipeTo(writable);
  return { chunks };
}

async function cryptoProbe() {
  const random = new Uint8Array(16);
  crypto.getRandomValues(random);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("r23")));
  return {
    randomNonZero: random.some((value) => value !== 0),
    sha256Length: digest.byteLength
  };
}

async function blobFileProbe() {
  const blob = new Blob(["r23"], { type: "text/plain" });
  const file = new File([blob], "probe.txt", { type: blob.type });
  return { blobText: await blob.text(), fileName: file.name, fileSize: file.size };
}

async function workerProbe() {
  const worker = new Worker("./worker.js", { type: "classic" });
  const response = new Promise((resolve, reject) => {
    worker.addEventListener("message", (event) => resolve(event.data), { once: true });
    worker.addEventListener("error", reject, { once: true });
  });
  worker.postMessage({ value: 21 });
  const value = await response;
  worker.terminate();
  return value;
}

async function abortProbe() {
  const controller = new AbortController();
  const pending = fetch("/slow", { signal: controller.signal });
  setTimeout(() => controller.abort("r23-client-abort"), 75);
  try {
    await pending;
    return { aborted: false };
  } catch (error) {
    return {
      aborted: controller.signal.aborted,
      name: error?.name || null,
      reason: String(controller.signal.reason)
    };
  }
}

async function serviceWorkerProbe() {
  if (!("serviceWorker" in navigator)) return { available: false };
  const registration = await navigator.serviceWorker.register("./sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) {
    await new Promise((resolve) => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
  }
  const echoResponse = await fetch("/sw-echo");
  const echo = await echoResponse.json();
  const cache = await caches.open("r23-sw-v1");
  const installed = await cache.match("/sw-installed-marker");
  const activated = await cache.match("/sw-activated-marker");

  const channel = new MessageChannel();
  const message = new Promise((resolve) => {
    channel.port1.addEventListener("message", (event) => resolve(event.data), { once: true });
    channel.port1.start();
  });
  navigator.serviceWorker.controller.postMessage({ type: "lifetime-probe" }, [channel.port2]);
  const messageResult = await message;

  await registration.unregister();
  await caches.delete("r23-sw-v1");
  return {
    available: true,
    controlled: Boolean(navigator.serviceWorker.controller),
    echo,
    installWaitUntilMarker: installed ? await installed.text() : null,
    activateWaitUntilMarker: activated ? await activated.text() : null,
    messageResult
  };
}

async function domEventProbe() {
  let observed = false;
  const target = new EventTarget();
  target.addEventListener("r23", () => { observed = true; }, { once: true });
  target.dispatchEvent(new Event("r23"));
  return { observed };
}

async function run() {
  results.environment = {
    userAgent: navigator.userAgent,
    secureContext: isSecureContext,
    onlineHint: navigator.onLine,
    websocketAvailable: "WebSocket" in globalThis
  };
  results.indexedDb = await indexedDbProbe();
  results.cacheStorage = await cacheProbe();
  results.broadcastChannel = await broadcastProbe();
  results.webLocks = await locksProbe();
  results.storageManager = await storageProbe();
  results.compression = await compressionProbe();
  results.streams = await streamProbe();
  results.crypto = await cryptoProbe();
  results.blobFile = await blobFileProbe();
  results.worker = await workerProbe();
  results.domEvents = await domEventProbe();
  results.fetchAbort = await abortProbe();
  results.serviceWorker = await serviceWorkerProbe();

  resultElement.textContent = JSON.stringify(results, null, 2);
  window.__R23_RESULTS__ = results;
  document.documentElement.dataset.probeStatus = "complete";
}

run().catch((error) => {
  const failure = { name: error?.name, message: error?.message, stack: error?.stack };
  resultElement.textContent = JSON.stringify({ failure }, null, 2);
  window.__R23_FAILURE__ = failure;
  document.documentElement.dataset.probeStatus = "failed";
});
