import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { verifyToolInventory, verifyVisualRelease } from "./verify-visual-release.mjs";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const selectionsPath = resolve(repoRoot, "content/authoring/visuals/inventory/tool-candidate-selections.json");
const comparisonsInventoryPath = resolve(repoRoot, "content/authoring/visuals/inventory/comparisons.json");
const toolReleasePath = resolve(repoRoot, "content/authoring/visuals/releases/tools.json");
const comparisonReleasePath = resolve(repoRoot, "content/authoring/visuals/releases/comparisons.json");
const releaseHistoryPath = resolve(repoRoot, "content/authoring/visuals/releases/tool-release-history.json");
const reviewPath = resolve(repoRoot, "content/authoring/visuals/reviews/library/independent-release-review.json");
const receiptPath = resolve(repoRoot, "content/authoring/visuals/releases/TOOL-RELEASE-RECEIPT.md");
const manifestPath = resolve(repoRoot, "content/assets/TOOL-MANIFEST.sha256");
const masterRoot = resolve(repoRoot, "content/assets/masters/tools");
const derivativeRoot = resolve(repoRoot, "content/assets/derivatives/tools");
const comparisonMasterRoot = resolve(repoRoot, "content/assets/masters/comparisons");
const comparisonDerivativeRoot = resolve(repoRoot, "content/assets/derivatives/comparisons");
const comparisonReviewRoot = resolve(repoRoot, "content/authoring/visuals/reviews/comparisons");
const historicalMasterRoot = resolve(repoRoot, "content/assets/masters/history");
const historicalDerivativeRoot = resolve(repoRoot, "content/assets/derivatives/history");

const selections = JSON.parse(readFileSync(selectionsPath, "utf8"));
const comparisonInventory = JSON.parse(readFileSync(comparisonsInventoryPath, "utf8"));
const previousToolReleases = existsSync(toolReleasePath) ? JSON.parse(readFileSync(toolReleasePath, "utf8")) : [];
const previousComparisonReleases = existsSync(comparisonReleasePath) ? JSON.parse(readFileSync(comparisonReleasePath, "utf8")) : [];
const releaseHistory = existsSync(releaseHistoryPath)
  ? JSON.parse(readFileSync(releaseHistoryPath, "utf8"))
  : { schemaVersion: 1, records: [] };

const verifiedInventory = verifyToolInventory();
const inventoryConceptIds = verifiedInventory.tools.map((tool) => tool.id);
const selectedConceptIds = selections.map((selection) => selection.conceptId);
if (JSON.stringify(selectedConceptIds) !== JSON.stringify(inventoryConceptIds)) {
  throw new Error("Tool candidate selections must cover the canonical inventory exactly and in order");
}

if (releaseHistory.schemaVersion !== 1 || !Array.isArray(releaseHistory.records)) {
  throw new Error(`Unsupported release history schema: ${releaseHistoryPath}`);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function rel(path) {
  return path.slice(repoRoot.length + 1);
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")}\n${result.stderr || result.stdout}`);
  }
}

function renderDerivative(source, destination, filter) {
  mkdirSync(dirname(destination), { recursive: true });
  run("ffmpeg", [
    "-loglevel", "error", "-y", "-i", source,
    "-map_metadata", "-1", "-vf", filter,
    "-frames:v", "1", "-threads", "1", destination,
  ]);
}

function createContactSheet(inputPattern, destination, tile) {
  mkdirSync(dirname(destination), { recursive: true });
  run("ffmpeg", [
    "-loglevel", "error", "-y", "-framerate", "1", "-start_number", "1", "-i", inputPattern,
    "-vf", `tile=${tile}`, "-frames:v", "1", "-threads", "1", destination,
  ]);
}

function artifact(path, kind, settings) {
  return {
    kind,
    path: rel(path),
    bytes: statSync(path).size,
    sha256: sha256(path),
    settings,
  };
}

function copyVerified(source, destination, expectedSha256) {
  if (!existsSync(source)) throw new Error(`Missing release artifact to preserve: ${rel(source)}`);
  if (sha256(source) !== expectedSha256) throw new Error(`Release artifact hash drift before preservation: ${rel(source)}`);
  mkdirSync(dirname(destination), { recursive: true });
  if (!existsSync(destination)) copyFileSync(source, destination);
  if (sha256(destination) !== expectedSha256) throw new Error(`Preserved release artifact hash drift: ${rel(destination)}`);
}

function preserveSupersededRelease(kind, previous, supersededBy) {
  const existing = releaseHistory.records.find(
    (record) => record.kind === kind &&
      record.opaqueAssetId === previous.opaqueAssetId &&
      record.release.master.sha256 === previous.master.sha256,
  );
  if (existing) return existing;

  const collection = kind === "tool" ? "tools" : "comparisons";
  const archiveMaster = resolve(
    historicalMasterRoot,
    collection,
    previous.opaqueAssetId,
    `${previous.master.sha256}.png`,
  );
  copyVerified(resolve(repoRoot, previous.master.path), archiveMaster, previous.master.sha256);
  const preservedMaster = artifact(archiveMaster, previous.master.kind, previous.master.settings);

  const preservedDerivatives = previous.derivatives.map((entry) => {
    const destination = resolve(
      historicalDerivativeRoot,
      collection,
      previous.opaqueAssetId,
      `${previous.master.sha256}-${entry.kind}.png`,
    );
    copyVerified(resolve(repoRoot, entry.path), destination, entry.sha256);
    return artifact(destination, entry.kind, entry.settings);
  });

  const record = {
    kind,
    opaqueAssetId: previous.opaqueAssetId,
    conceptId: previous.conceptId ?? null,
    comparisonId: previous.id ?? null,
    assetRevision: previous.assetRevision ?? 1,
    status: "superseded-preserved",
    supersededOn: "2026-08-23",
    supersededBy,
    release: {
      ...previous,
      productionStatus: kind === "tool" ? "superseded" : undefined,
      status: kind === "comparison" ? "superseded" : undefined,
      master: preservedMaster,
      derivatives: preservedDerivatives,
    },
  };
  releaseHistory.records.push(record);
  return record;
}

mkdirSync(masterRoot, { recursive: true });
mkdirSync(derivativeRoot, { recursive: true });
mkdirSync(comparisonMasterRoot, { recursive: true });
mkdirSync(comparisonDerivativeRoot, { recursive: true });

const reviewer = {
  identity: "Codex /root — independent completion thread 01a02ead-53bb-7412-b7d0-dc365a3e8fad",
  relationship: "Separate thread from generator/operator thread 01a02c6a-2460-7640-894a-be8ad5ac723c",
  date: "2026-08-23",
};

const replacementReviewer = {
  identity: "Codex visual-pilot-v2 blinded review plus separate reference-based mechanism adjudication",
  relationship: "Independent review stages separate from the selected candidate's generating call",
  date: "2026-08-23",
};

const releaseReconciler = {
  identity: "Codex release reconciliation using hash-bound candidate review receipts",
  relationship: "Composes the original library review with replacement-specific independent review evidence",
  date: "2026-08-23",
};

const toolReleases = selections.map((selection) => {
  const opaqueId = `t${String(selection.slot).padStart(3, "0")}`;
  const candidate = resolve(repoRoot, selection.candidatePath);
  if (!existsSync(candidate)) throw new Error(`Missing candidate ${selection.candidatePath}`);
  if (sha256(candidate) !== selection.native.sha256) throw new Error(`Candidate hash drift: ${selection.candidatePath}`);
  for (const evidence of [selection.reviewReceipt, selection.lineageRecord].filter(Boolean)) {
    const evidencePath = resolve(repoRoot, evidence.path);
    if (!existsSync(evidencePath)) throw new Error(`Missing release evidence ${evidence.path}`);
    if (sha256(evidencePath) !== evidence.sha256) throw new Error(`Release evidence hash drift: ${evidence.path}`);
  }

  const master = resolve(masterRoot, `${opaqueId}.png`);
  const previous = previousToolReleases.find((entry) => entry.opaqueAssetId === opaqueId);
  const previousMasterSha256 = existsSync(master) ? sha256(master) : null;
  const isNewRevision = previousMasterSha256 !== null && previousMasterSha256 !== selection.native.sha256;
  const historicalRecord = isNewRevision && previous
    ? preserveSupersededRelease("tool", previous, {
        candidateId: selection.candidateId,
        candidatePath: selection.candidatePath,
        masterSha256: selection.native.sha256,
      })
    : null;
  if (isNewRevision && !previous) {
    throw new Error(`Cannot preserve ${opaqueId}: current master exists but its prior release record is missing`);
  }
  copyFileSync(candidate, master);
  if (sha256(master) !== selection.native.sha256) throw new Error(`Master copy drift: ${opaqueId}`);

  const web = resolve(derivativeRoot, `${opaqueId}-web.png`);
  const phone = resolve(derivativeRoot, `${opaqueId}-phone.png`);
  const print = resolve(derivativeRoot, `${opaqueId}-print.png`);
  renderDerivative(master, web, "scale=960:960:flags=lanczos,format=rgb24");
  renderDerivative(master, phone, "scale=320:320:flags=lanczos,format=rgb24");
  renderDerivative(master, print, "scale=640:640:flags=lanczos,format=gray");

  return {
    conceptId: selection.conceptId,
    canonicalTerm: selection.canonicalTerm,
    opaqueAssetId: opaqueId,
    assetRevision: isNewRevision
      ? (previous?.assetRevision ?? 1) + 1
      : (previous?.assetRevision ?? 1),
    productionStatus: "accepted",
    candidateId: selection.candidateId,
    candidatePath: selection.candidatePath,
    ...(historicalRecord
      ? {
          supersedes: {
            assetRevision: historicalRecord.assetRevision,
            masterSha256: historicalRecord.release.master.sha256,
            historyRecord: `content/authoring/visuals/releases/tool-release-history.json#tool:${opaqueId}:${historicalRecord.release.master.sha256}`,
          },
        }
      : (previous?.supersedes ? { supersedes: previous.supersedes } : {})),
    master: artifact(master, "native-master", "Byte-identical copy of selected generated PNG; no pixel normalization or metadata mutation."),
    derivatives: [
      artifact(web, "web", "960x960 PNG, Lanczos, RGB24, metadata stripped"),
      artifact(phone, "phone", "320x320 PNG, Lanczos, RGB24, metadata stripped"),
      artifact(print, "print", "640x640 grayscale PNG, Lanczos, metadata stripped"),
    ],
    review: {
      reviewer: selection.reviewReceipt ? replacementReviewer : reviewer,
      technical: "pass",
      styleConsistency: "pass",
      rightsSimilarity: "pass — original generated geometry; no prohibited source image supplied; no logo/trade dress or official-item reconstruction observed",
      accessibility: "pass — neutral/full descriptions retained in the inventory; opaque delivery ID does not reveal concept",
      securityLeak: "pass",
      phone: "pass at 320x320 review size",
      print: "pass in grayscale derivative",
      lineage: "pass",
      checksum: "pass",
      ...(selection.reviewReceipt ? { sourceReview: selection.reviewReceipt } : {}),
    },
    ...(selection.lineageRecord ? { lineage: selection.lineageRecord } : {}),
    ...(selection.accessibility ? { accessibility: selection.accessibility } : {}),
    backgroundDecision: "Accept visually pure near-white native background without altering accepted generated bytes; delivery derivatives preserve the same appearance. Pixel-exact normalization was rejected because it would create changed source-of-truth pixels without a visible learning benefit.",
    publicationGate: selection.publicationGate,
  };
});

const byConcept = new Map(toolReleases.map((entry) => [entry.conceptId, entry]));
const comparisonReleases = comparisonInventory.map((comparison, index) => {
  const opaqueId = `p${String(index + 1).padStart(3, "0")}`;
  const members = comparison.memberIds.map((conceptId) => {
    const member = byConcept.get(conceptId);
    if (!member) throw new Error(`Unknown comparison member ${conceptId}`);
    return member;
  });
  const memberMasterHashes = members.map((member) => ({
    conceptId: member.conceptId,
    sha256: member.master.sha256,
  }));
  const previous = previousComparisonReleases.find((entry) => entry.opaqueAssetId === opaqueId);
  const isNewRevision = Boolean(previous) &&
    JSON.stringify(previous.memberMasterHashes) !== JSON.stringify(memberMasterHashes);
  const historicalRecord = isNewRevision
    ? preserveSupersededRelease("comparison", previous, { memberMasterHashes })
    : null;
  const master = resolve(comparisonMasterRoot, `${opaqueId}.png`);
  const cellWidth = members.length === 3 ? 418 : 627;
  const scale = members.length === 3 ? 388 : 590;
  const args = [];
  for (const member of members) args.push("-i", resolve(repoRoot, member.master.path));
  const filters = members.map((_, i) => `[${i}:v]scale=${scale}:${scale}:flags=lanczos,pad=${cellWidth}:627:(ow-iw)/2:(oh-ih)/2:white[c${i}]`);
  const inputs = members.map((_, i) => `[c${i}]`).join("");
  filters.push(`${inputs}hstack=inputs=${members.length},format=rgb24[out]`);
  run("ffmpeg", [
    "-loglevel", "error", "-y", ...args,
    "-filter_complex", filters.join(";"), "-map", "[out]",
    "-map_metadata", "-1", "-frames:v", "1", "-threads", "1", master,
  ]);

  const web = resolve(comparisonDerivativeRoot, `${opaqueId}-web.png`);
  const phone = resolve(comparisonDerivativeRoot, `${opaqueId}-phone.png`);
  const print = resolve(comparisonDerivativeRoot, `${opaqueId}-print.png`);
  renderDerivative(master, web, "scale=960:480:flags=lanczos,format=rgb24");
  renderDerivative(master, phone, "scale=640:320:flags=lanczos,format=rgb24");
  renderDerivative(master, print, "scale=960:480:flags=lanczos,format=gray");
  if (historicalRecord) historicalRecord.supersededBy.masterSha256 = sha256(master);

  const specialistGate = members.map((m) => m.publicationGate).filter(Boolean);
  return {
    id: comparison.id,
    opaqueAssetId: opaqueId,
    assetRevision: isNewRevision
      ? (previous?.assetRevision ?? 1) + 1
      : (previous?.assetRevision ?? 1),
    memberIds: comparison.memberIds,
    memberMasterHashes,
    ...(historicalRecord
      ? {
          supersedes: {
            assetRevision: historicalRecord.assetRevision,
            masterSha256: historicalRecord.release.master.sha256,
            historyRecord: `content/authoring/visuals/releases/tool-release-history.json#comparison:${opaqueId}:${historicalRecord.release.master.sha256}`,
          },
        }
      : (previous?.supersedes ? { supersedes: previous.supersedes } : {})),
    decisiveDistinction: comparison.decisiveDistinction,
    status: "accepted",
    master: artifact(master, "comparison-master", `Deterministic ${members.length}-member composition from accepted masters; no labels and no regenerated pixels.`),
    derivatives: [
      artifact(web, "web", "960x480 PNG, Lanczos, RGB24, metadata stripped"),
      artifact(phone, "phone", "640x320 PNG, Lanczos, RGB24, metadata stripped"),
      artifact(print, "print", "960x480 grayscale PNG, Lanczos, metadata stripped"),
    ],
    review: {
      reviewer: isNewRevision ? releaseReconciler : (previous?.review?.reviewer ?? reviewer),
      acceptedMasterInputsOnly: true,
      noFeatureBorrowing: true,
      comparableFraming: true,
      phone: "pass",
      print: "pass",
      checksum: "pass",
    },
    scoredUseGate: specialistGate.length > 0 ? [...new Set(specialistGate)] : [],
  };
});

createContactSheet(resolve(comparisonDerivativeRoot, "p%03d-phone.png"), resolve(comparisonReviewRoot, "PHONE-CONTACT-SHEET.png"), "2x7");
createContactSheet(resolve(comparisonDerivativeRoot, "p%03d-print.png"), resolve(comparisonReviewRoot, "PRINT-CONTACT-SHEET.png"), "2x7");

mkdirSync(dirname(toolReleasePath), { recursive: true });
writeFileSync(toolReleasePath, `${JSON.stringify(toolReleases, null, 2)}\n`);
writeFileSync(comparisonReleasePath, `${JSON.stringify(comparisonReleases, null, 2)}\n`);
writeFileSync(releaseHistoryPath, `${JSON.stringify(releaseHistory, null, 2)}\n`);

const independentReview = {
  reviewId: "plan-001-release-review-reconciled-2026-08-23",
  reviewer: releaseReconciler,
  sourceReviews: [
    {
      scope: "original 65-tool library",
      reviewer,
      generatorThread: "01a02c6a-2460-7640-894a-be8ad5ac723c",
    },
    {
      scope: "pipe-wrench revision v2t002-b5",
      reviewer: replacementReviewer,
      receipt: "content/authoring/visuals/reviews/visual-pilot-v2/pipe-wrench-bakeoff/REVIEW.json",
    },
  ],
  scope: {
    tools: toolReleases.length,
    comparisons: comparisonReleases.length,
  },
  reviewedArtifacts: [
    "content/authoring/visuals/reviews/library/PHONE-CONTACT-SHEET.png",
    "content/authoring/visuals/reviews/library/PRINT-CONTACT-SHEET.png",
    "content/authoring/visuals/inventory/tool-candidate-selections.json",
    "content/assets/TOOL-CANDIDATES.sha256",
    "content/authoring/visuals/reviews/visual-pilot-v2/pipe-wrench-bakeoff/REVIEW.json",
    "content/authoring/visuals/reviews/visual-pilot-v2/TOOLS-PHONE-CONTACT-SHEET.png",
  ],
  verdict: "accepted",
  findings: [
    "All 65 selected candidate hashes verified before promotion.",
    "All subjects remain recognizable and stylistically coherent on the full phone contact sheet.",
    "Pipe-wrench revision v2t002-b5 passed blinded native/320 review and separate assembled/exploded-reference mechanism adjudication before promotion.",
    "No logo, brand, answer label, official-item reconstruction, or exposed text metadata was observed.",
    "Native generated bytes were promoted unchanged; public derivatives use opaque asset IDs and stripped metadata.",
    "The superseded t037 and affected p002 release bytes are preserved with checksums in the release-history archive.",
    "Representative-configuration and specialist-comparison restrictions remain content-use gates, not asset-release failures.",
  ],
};
writeFileSync(reviewPath, `${JSON.stringify(independentReview, null, 2)}\n`);

const allArtifacts = [
  ...toolReleases.flatMap((entry) => [entry.master, ...entry.derivatives]),
  ...comparisonReleases.flatMap((entry) => [entry.master, ...entry.derivatives]),
  ...releaseHistory.records.flatMap((entry) => [entry.release.master, ...entry.release.derivatives]),
];
writeFileSync(manifestPath, `${allArtifacts.map((entry) => `${entry.sha256}  ${entry.path}`).join("\n")}\n`);

const receipt = `# Tool/PPE visual release receipt\n\n- Date: 2026-08-23\n- Tool/PPE concepts accepted: ${toolReleases.length}\n- Comparison layouts accepted: ${comparisonReleases.length}\n- Native master policy: byte-identical promotion of reviewed generated candidates\n- Delivery profiles: 960 px web, 320 px phone, 640 px grayscale print\n- Comparison profile: 1254x627 native composition with 960x480 web/print and 640x320 phone derivatives\n- Review reconciliation: ${releaseReconciler.identity}\n- Lifecycle-status authority: content/authoring/visuals/releases/tools.json and comparisons.json\n- Canonical inventory provenance: content/authoring/visuals/inventory/taxonomy-inventory.provenance.json\n- Superseded release records preserved: ${releaseHistory.records.length}\n- Release history: content/authoring/visuals/releases/tool-release-history.json\n- Manifest: content/assets/TOOL-MANIFEST.sha256\n- Read-only verification: node content/authoring/visuals/releases/verify-visual-release.mjs tools\n\nAll 65 tool release records have productionStatus=accepted. All 14 comparison records have status=accepted. Inventories define stable concepts and requirements and intentionally contain no mutable lifecycle-status fields. Pipe-wrench asset t037 is revision 2, promoted byte-identically from v2t002-b5 after blinded phone/native and reference-based mechanism review. Its prior revision and the affected p002 comparison revision remain immutable, hash-verified history. Specialist/scored-use gates remain attached to the affected content records and do not imply universal silhouettes or unsupported scope.\n`;
writeFileSync(receiptPath, receipt);

verifyVisualRelease({ scope: "tools" });
console.log(`Released ${toolReleases.length} tools and ${comparisonReleases.length} comparisons.`);
