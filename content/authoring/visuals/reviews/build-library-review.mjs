import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const inventoryPath = resolve(repoRoot, "content/authoring/visuals/inventory/tools.json");
const remainingBriefsPath = resolve(repoRoot, "content/authoring/visuals/briefs/tools/remaining.json");
const selectionsPath = resolve(repoRoot, "content/authoring/visuals/inventory/tool-candidate-selections.json");
const reviewRoot = resolve(repoRoot, "content/authoring/visuals/reviews/library");
const reviewPath = resolve(reviewRoot, "review.json");
const manifestPath = resolve(repoRoot, "content/assets/TOOL-CANDIDATES.sha256");

const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
const remainingBriefs = JSON.parse(readFileSync(remainingBriefsPath, "utf8"));

const pilotBySlot = new Map([
  [14, ["c001", "content/assets/candidates/pilot/c001.png"]],
  [15, ["c016", "content/assets/candidates/pilot/c016.png"]],
  [16, ["c017", "content/assets/candidates/pilot/c017.png"]],
  [25, ["c019-r2", "content/assets/candidates/pilot/c019-r2.png"]],
  [26, ["c012-r3", "content/assets/candidates/pilot/c012-r3.png"]],
  [27, ["c013-r3", "content/assets/candidates/pilot/c013-r3.png"]],
  [31, ["c008", "content/assets/candidates/pilot/c008.png"]],
  [32, ["c009", "content/assets/candidates/pilot/c009.png"]],
  [33, ["c002", "content/assets/candidates/pilot/c002.png"]],
  [36, ["c004", "content/assets/candidates/pilot/c004.png"]],
  [37, ["v2t002-b5", "content/assets/candidates/visual-pilot-v2/v2t002-b5.png"]],
  [39, ["c014", "content/assets/candidates/pilot/c014.png"]],
  [40, ["c015", "content/assets/candidates/pilot/c015.png"]],
  [56, ["c006", "content/assets/candidates/pilot/c006.png"]],
  [57, ["c007", "content/assets/candidates/pilot/c007.png"]],
  [59, ["c018", "content/assets/candidates/pilot/c018.png"]],
  [61, ["c010", "content/assets/candidates/pilot/c010.png"]],
  [62, ["c011", "content/assets/candidates/pilot/c011.png"]],
  [63, ["c003", "content/assets/candidates/pilot/c003.png"]],
]);

const remainingBySlot = new Map(
  remainingBriefs.map((brief) => [brief.slot, [brief.candidateId, brief.candidatePath]]),
);

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function readPngHeader(path) {
  const buffer = readFileSync(path);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") throw new Error(`Not a PNG: ${path}`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const bitDepth = buffer[24];
  const colorType = buffer[25];
  const chunks = [];
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    chunks.push(type);
    offset += 12 + length;
    if (type === "IEND") break;
  }
  return {
    format: "PNG",
    width,
    height,
    bitDepth,
    colorType,
    mode: colorType === 2 ? "RGB" : `PNG color type ${colorType}`,
    chunkTypes: [...new Set(chunks)],
    ancillaryChunks: [...new Set(chunks.filter((type) => !["IHDR", "IDAT", "IEND"].includes(type)))],
  };
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")}\n${result.stderr || result.stdout}`);
  }
}

const pairAndScopeGates = new Map([
  [21, "Before scored upright-vacuum versus carpet-extractor comparison use, obtain specialist comparative signoff; the selected drawings represent specific generic configurations, not universal silhouettes."],
  [24, "Before scored upright-vacuum versus carpet-extractor comparison use, obtain specialist comparative signoff; the selected drawings represent specific generic configurations, not universal silhouettes."],
  [26, "Before scored floor-machine versus burnisher comparison use, obtain specialist comparative signoff; accessory and chassis geometry are representative, not universal."],
  [27, "Before scored floor-machine versus burnisher comparison use, obtain specialist comparative signoff; accessory and chassis geometry are representative, not universal."],
  [28, "Entry recognition only pending scope and specialist review; do not infer a universal ride-on vacuum silhouette or teach operation from the image."],
  [29, "Entry recognition/basic-safety use only pending scope review; do not teach operation from the image."],
  [30, "Entry recognition/basic-safety use only pending scope review; do not teach operation from the image."],
  [47, "Crosscut/rip scored comparison remains gated on specialist tooth-geometry review at native and 320 px sizes."],
  [48, "Crosscut/rip scored comparison remains gated on specialist tooth-geometry review at native and 320 px sizes."],
  [60, "Identification contrast only; the image does not establish skilled electrical work as entry-level operational scope."],
]);

const selectionOverrides = new Map([
  [37, {
    candidateDisposition: "PASS — selected by blinded native/320 review and separate reference-based mechanism adjudication",
    masterPromotion: "PROMOTED — accepted as byte-identical t037 asset revision 2 on 2026-08-23",
    releaseBinding: {
      opaqueAssetId: "t037",
      assetRevision: 2,
      masterPath: "content/assets/masters/tools/t037.png",
      masterSha256: "334044fb3c25f5e14be4c47e0df0512961ce8dce08e568e0d91b021faa8f1e99",
      releaseRecord: "content/authoring/visuals/releases/tools.json#t037",
      productionReview: "content/authoring/visuals/reviews/releases/pipe-wrench-r2/REVIEW.json",
    },
    reviewReceipt: {
      path: "content/authoring/visuals/reviews/visual-pilot-v2/pipe-wrench-bakeoff/REVIEW.json",
      sha256: "84cbfe3d771d700382457b96d860483f75181d87a4f4d8228919b9e8c02d04e6",
      verdict: "pass-selected",
    },
    lineageRecord: {
      path: "content/authoring/visuals/reviews/visual-pilot-v2/lineage.json",
      sha256: "4c5b6177aac0f07c478ffa617ffe05604fd8112098078a3d8d60fd8aab876796",
      candidateId: "v2t002",
    },
    accessibility: {
      usageScope: "atlas and post-answer learning; not approved for pre-answer visual scoring",
      neutralPreAnswer: "A heavy straight handle extends right from an open C-shaped head. Both opposing inner faces carry coarse teeth. A short threaded shank emerges behind the upper head, passes through one crosshatched rotating cylinder, and ends in a rounded tip.",
      fullPostAnswer: "A pipe wrench in strict side profile. Its curved serrated hook jaw enters the opaque body on the same plausible axis as its threaded shank, which emerges through one knurled adjustment nut and ends in a short rounded threaded tip. The opaque body naturally hides the middle of that connection. The curved hook jaw and serrated heel jaw distinguish it from an adjustable wrench's smooth parallel jaws.",
      nonvisualEquivalent: {
        itemId: "tool-selection-001",
        releasePath: "content/releases/vertical-slice/question.precommit.json",
        relationship: "The nonvisual question tests the same pipe-wrench recognition distinction without exposing this answer-bearing image before commitment.",
      },
      source: "content/authoring/visuals/reviews/visual-pilot-v2/accessibility-draft.json#tools[candidateId=v2t002]",
    },
  }],
]);

const selections = inventory.map((item, index) => {
  const slot = index + 1;
  const selection = pilotBySlot.get(slot) ?? remainingBySlot.get(slot);
  if (!selection) throw new Error(`No candidate selection for slot ${slot}: ${item.id}`);
  const [candidateId, candidatePath] = selection;
  const absolutePath = resolve(repoRoot, candidatePath);
  if (!existsSync(absolutePath)) throw new Error(`Missing candidate: ${candidatePath}`);
  const native = readPngHeader(absolutePath);
  if (native.width !== 1254 || native.height !== 1254 || native.bitDepth !== 8 || native.colorType !== 2) {
    throw new Error(`Unexpected native profile for ${candidatePath}: ${JSON.stringify(native)}`);
  }
  if (JSON.stringify(native.chunkTypes) !== JSON.stringify(["IHDR", "caBX", "IDAT", "IEND"])) {
    throw new Error(`Unexpected PNG chunks for ${candidatePath}: ${JSON.stringify(native.chunkTypes)}`);
  }
  const override = selectionOverrides.get(slot) ?? {};
  return {
    slot,
    conceptId: item.id,
    canonicalTerm: item.canonicalTerm,
    candidateId,
    candidatePath,
    native: {
      ...native,
      bytes: statSync(absolutePath).size,
      sha256: sha256(absolutePath),
    },
    candidateDisposition: override.candidateDisposition ?? "PASS — selected candidate",
    masterPromotion: override.masterPromotion ?? "PENDING — exact-white normalization decision and independent review",
    publicationGate: pairAndScopeGates.get(slot) ?? null,
    ...(override.reviewReceipt ? { reviewReceipt: override.reviewReceipt } : {}),
    ...(override.lineageRecord ? { lineageRecord: override.lineageRecord } : {}),
    ...(override.accessibility ? { accessibility: override.accessibility } : {}),
    ...(override.releaseBinding ? { releaseBinding: override.releaseBinding } : {}),
  };
});

if (selections.length !== 65) throw new Error(`Expected 65 selections, received ${selections.length}`);
if (new Set(selections.map((entry) => entry.conceptId)).size !== 65) throw new Error("Duplicate concept IDs in selections");

mkdirSync(dirname(selectionsPath), { recursive: true });
writeFileSync(selectionsPath, `${JSON.stringify(selections, null, 2)}\n`);
writeFileSync(
  manifestPath,
  `${selections.map((entry) => `${entry.native.sha256}  ${entry.candidatePath}`).join("\n")}\n`,
);

const phoneDir = resolve(reviewRoot, "phone");
const printDir = resolve(reviewRoot, "print");
mkdirSync(phoneDir, { recursive: true });
mkdirSync(printDir, { recursive: true });

for (const entry of selections) {
  const source = resolve(repoRoot, entry.candidatePath);
  const fileName = `${String(entry.slot).padStart(3, "0")}.png`;
  run("ffmpeg", ["-loglevel", "error", "-y", "-i", source, "-vf", "scale=320:320:flags=lanczos", "-frames:v", "1", "-threads", "1", resolve(phoneDir, fileName)]);
  run("ffmpeg", ["-loglevel", "error", "-y", "-i", source, "-vf", "scale=320:320:flags=lanczos,format=gray", "-frames:v", "1", "-threads", "1", resolve(printDir, fileName)]);
}

run("ffmpeg", ["-loglevel", "error", "-y", "-framerate", "1", "-start_number", "1", "-i", resolve(phoneDir, "%03d.png"), "-vf", "tile=5x13:padding=8:margin=8:color=white", "-frames:v", "1", "-threads", "1", resolve(reviewRoot, "PHONE-CONTACT-SHEET.png")]);
run("ffmpeg", ["-loglevel", "error", "-y", "-framerate", "1", "-start_number", "1", "-i", resolve(printDir, "%03d.png"), "-vf", "tile=5x13:padding=8:margin=8:color=white", "-frames:v", "1", "-threads", "1", resolve(reviewRoot, "PRINT-CONTACT-SHEET.png")]);

const review = {
  runId: "plan-001-tool-library-2026-08-23",
  status: "candidate-library-complete",
  counts: {
    inventoryConcepts: inventory.length,
    selectedCandidates: selections.length,
    remainingConceptsGeneratedThisRun: remainingBriefs.length,
    newFirstPassRejections: 3,
  },
  generationMode: "one image per native canvas",
  candidateProfile: {
    format: "PNG",
    width: 1254,
    height: 1254,
    bitDepth: 8,
    mode: "RGB",
    expectedChunkTypes: ["IHDR", "caBX", "IDAT", "IEND"],
    provenanceChunk: "caBX ancillary private chunk containing JUMBF/C2PA content credentials; preserved in native candidates",
    exposedTextMetadata: "none observed",
  },
  selfReviewResult: "PASS at candidate level for all 65 selected concepts",
  selectedCandidates: selections,
  rejectionsThisRun: [
    {
      candidate: "content/assets/candidates/tools/rejected/a013-r1.png",
      conceptId: "tool.duster",
      reason: "Single giant feather did not read reliably as a feather-duster cluster.",
      correction: "Regenerated as a multi-feather head; no raster edit used.",
    },
    {
      candidate: "content/assets/candidates/tools/rejected/a021-r1.png",
      conceptId: "equipment.vacuum.upright",
      reason: "A small grille read as pseudo-text or a label-like mark.",
      correction: "Regenerated with blank housing and bag; no raster edit used.",
    },
    {
      candidate: "content/assets/candidates/tools/rejected/a029-r1.png",
      conceptId: "equipment.snow-blower",
      reason: "The auger appeared as separate circular plates instead of opposing helical ribbons.",
      correction: "Regenerated with a continuous opposed helical auger; no raster edit used.",
    },
  ],
  reviewSheets: {
    phone: "content/authoring/visuals/reviews/library/PHONE-CONTACT-SHEET.png",
    grayscalePrint: "content/authoring/visuals/reviews/library/PRINT-CONTACT-SHEET.png",
    index: selections.map(({ slot, conceptId, canonicalTerm, candidateId }) => ({ slot, conceptId, canonicalTerm, candidateId })),
  },
  unresolved: [
    "Independent technical/style/rights review has not been performed.",
    "Native backgrounds are visually white but the pilot established that some corner channels are near-white rather than pixel-exact 255; master normalization remains a separate gated step.",
    "Floor-machine/burnisher, upright-vacuum/carpet-extractor, and crosscut/rip pair use remains gated on specialist comparative signoff.",
    "Ride-on vacuum, snow blower, hedge trimmer, and soldering gun remain recognition-level or identification-only scope as specified in the taxonomy.",
  ],
};

writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`);
console.log(`Verified ${selections.length} selected candidates and wrote library review artifacts.`);
