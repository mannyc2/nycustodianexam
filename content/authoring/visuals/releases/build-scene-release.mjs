import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { verifyVisualRelease } from "./verify-visual-release.mjs";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const briefPath = resolve(repoRoot, "content/authoring/visuals/briefs/scenes/launch.json");
const releaseRoot = resolve(repoRoot, "content/authoring/visuals/releases");
const reviewRoot = resolve(repoRoot, "content/authoring/visuals/reviews/scenes");
const candidateRoot = resolve(repoRoot, "content/assets/candidates/scenes");
const masterRoot = resolve(repoRoot, "content/assets/masters/scenes");
const derivativeRoot = resolve(repoRoot, "content/assets/derivatives/scenes");
const manifestPath = resolve(repoRoot, "content/assets/SCENE-MANIFEST.sha256");
const independentReviewPath = resolve(reviewRoot, "independent-review.json");
const brief = JSON.parse(readFileSync(briefPath, "utf8"));

const originalGeneratorOperator = "Codex /root — completion thread 01a02ead-53bb-7412-b7d0-dc365a3e8fad";
const independentReviewRemediationOperator = "Codex /root — independent-review remediation thread 01a02f88-7d50-7930-9648-9373a1f3ae1b";
const replacementGeneratorOperators = new Map([
  [10, independentReviewRemediationOperator],
  [16, independentReviewRemediationOperator],
]);
const pendingAccidentalHazardReviewer = "PENDING — independent reviewer required";
const releaseDate = "2026-08-23";
const regionBoxes = {
  1: { target: [[0.17, 0.55, 0.80, 0.92]], decoy: [[[0.72, 0.48, 0.99, 0.55], [0.81, 0.55, 0.99, 0.76]]] },
  2: { target: [[0.47, 0.61, 0.69, 0.80]], decoy: [[0.83, 0.16, 0.96, 0.61]] },
  3: { target: [[0.25, 0.31, 0.68, 0.58]], decoy: [[0.07, 0.22, 0.25, 0.62]] },
  4: { target: [[0.38, 0.30, 0.71, 0.55]], decoy: [[0.80, 0.39, 0.96, 0.66]] },
  5: { target: [[0.20, 0.25, 0.31, 0.45]], decoy: [[[0.15, 0.05, 0.46, 0.25], [0.15, 0.47, 0.46, 0.91]]] },
  6: { target: [[0.03, 0.10, 0.64, 0.64]], decoy: [[0.68, 0.08, 0.98, 0.79]] },
  7: { target: [[0.73, 0.39, 0.86, 0.72]], decoy: [[0.27, 0.10, 0.41, 0.49]] },
  8: { target: [[0.76, 0.67, 0.98, 0.95]], decoy: [[0.64, 0.29, 0.76, 0.34]] },
  9: { target: [[0.24, 0.73, 0.69, 0.96]], decoy: [[0.10, 0.02, 0.28, 0.31]] },
  10: { target: [[0.04, 0.63, 0.48, 0.96]], decoy: [[0.72, 0.16, 0.93, 0.61]] },
  11: { target: [[0.18, 0.07, 0.46, 0.88]], decoy: [[0.50, 0.54, 0.81, 0.89]] },
  12: { target: [[0.50, 0.12, 0.72, 0.65]], decoy: [[0.76, 0.40, 0.95, 0.70]] },
  13: { target: [[0.58, 0.47, 0.79, 0.73]], decoy: [[0.79, 0.50, 0.85, 0.72]] },
  14: { target: [[0.27, 0.42, 0.58, 0.68]], decoy: [[0.80, 0.61, 0.91, 0.74]] },
  15: { target: [[0.08, 0.39, 0.37, 0.80]], decoy: [[0.44, 0.46, 0.55, 0.66]] },
  16: { target: [[0.42, 0.18, 0.83, 0.59]], decoy: [[0.05, 0.05, 0.24, 0.41]] },
  17: { target: [], decoy: [[0.77, 0.12, 0.94, 0.59], [0.33, 0.48, 0.67, 0.55], [0.65, 0.31, 0.77, 0.49]] },
  18: { target: [], decoy: [[0.23, 0.41, 0.46, 0.63], [0.47, 0.05, 0.66, 0.78], [0.64, 0.11, 0.73, 0.40]] },
};

const rejectedAttempts = {
  5: [
    ["s005-r1.png", "Rejected because every depicted container appeared blank, making the intended unidentified secondary bottle ambiguous."],
  ],
  6: [
    ["s006-r1.png", "Rejected because the chemical bottles lacked visible identifiers, adding a second chemical condition beyond the authored storage relationship."],
  ],
  10: [
    ["s010-r1.png", "Rejected by independent review because the bin carried a prominent recycling emblem made from forbidden arrows, creating consequential disposal signage."],
  ],
  16: [
    ["s016-r1.png", "Rejected by independent review because the exposed blade projected through the solid workbench while the saw rested flat, creating impossible meaning-bearing geometry."],
    ["s016-r2.png", "Rejected during remediation because the lowest exposed blade teeth still appeared to touch the tabletop rather than remaining visibly clear of it."],
  ],
  17: [
    ["s017-r1.png", "Rejected because the stepladder sat too close to the classroom door and could be mistaken for an egress obstruction in a zero-hazard control."],
  ],
};

const semanticRevisions = {
  1: "Pre-release decoy reconciliation: generated pixels show fixed wall conduit rather than a secured cord; safety meaning remains outside the walking route and the brief now matches the exact pixels.",
  6: "Independent-review reconciliation: safe-background and zone wording now names the stable open racks, tiled wall, and dry floor actually present in the selected pixels; target and decoy meaning are unchanged.",
  10: "Independent-review replacement: removed consequential recycling-arrow signage while preserving the broken-glass target, blank closed-bin decoy, dry level walkway, and outside-route grounds cart.",
  16: "Independent-review replacement: the unplugged saw now rests stably on its motor-housing side with the exposed blade clear of the solid bench; the drill remains securely cradled.",
};

const accessibilityZones = {
  1: {
    neutral: ["rear hallway", "left wall and alcove", "central floor", "right wall"],
    targets: ["central floor"],
    decoys: ["right wall"],
    safeBackground: ["rear hallway", "right wall", "left wall and alcove"],
  },
  2: {
    neutral: ["entrance doors", "left wall and bench", "central mat and floor", "right-side stand"],
    targets: ["central mat and floor"],
    decoys: ["right-side stand"],
    safeBackground: ["entrance doors", "central mat and floor", "left wall and bench"],
  },
  3: {
    neutral: ["upper flight", "central landing", "lower flight", "wall fixtures", "lower level", "ceiling"],
    targets: ["central landing"],
    decoys: ["wall fixtures"],
    safeBackground: ["upper flight", "lower flight", "lower level", "ceiling"],
  },
  4: {
    neutral: ["left court storage", "rear doors and equipment", "central court", "right wall storage", "rear wall"],
    targets: ["rear doors and equipment"],
    decoys: ["right wall storage"],
    safeBackground: ["central court", "left court storage", "rear wall"],
  },
  5: {
    neutral: ["upper wall and shelving", "middle shelving", "service sink", "lower floor"],
    targets: ["middle shelving"],
    decoys: ["upper wall and shelving"],
    safeBackground: ["upper wall and shelving", "service sink", "lower floor"],
  },
  6: {
    neutral: ["upper and center shelves", "lower bowl shelf", "separate pan rack", "rear tiled wall", "lower floor"],
    targets: ["upper and center shelves"],
    decoys: ["separate pan rack"],
    safeBackground: ["upper and center shelves", "lower bowl shelf", "rear tiled wall", "lower floor"],
  },
  7: {
    neutral: ["left wall storage", "center work light", "right wall connection", "lower floor"],
    targets: ["right wall connection"],
    decoys: ["left wall storage"],
    safeBackground: ["left wall storage", "lower floor", "center work light"],
  },
  8: {
    neutral: ["teacher desk", "student desks", "right wall equipment", "central aisle", "left wall window"],
    targets: ["right wall equipment"],
    decoys: ["teacher desk"],
    safeBackground: ["student desks", "central aisle", "left wall window"],
  },
  9: {
    neutral: ["sink and mirror", "stall", "central floor", "waste-bin side"],
    targets: ["central floor"],
    decoys: ["sink and mirror"],
    safeBackground: ["stall", "waste-bin side", "central floor"],
  },
  10: {
    neutral: ["building and planting edge", "central walkway", "lower-left objects", "right-side collection pad", "right-side grass"],
    targets: ["lower-left objects"],
    decoys: ["right-side collection pad"],
    safeBackground: ["central walkway", "building and planting edge", "right-side grass"],
  },
  11: {
    neutral: ["loading door", "left dolly and boxes", "center pallet and boxes", "right wall storage", "lower floor"],
    targets: ["left dolly and boxes"],
    decoys: ["center pallet and boxes"],
    safeBackground: ["loading door", "right wall storage", "lower floor"],
  },
  12: {
    neutral: ["serving counter", "left dining tables", "center person and boxes", "right wall cart", "central aisle"],
    targets: ["center person and boxes"],
    decoys: ["right wall cart"],
    safeBackground: ["left dining tables", "central aisle", "serving counter"],
  },
  13: {
    neutral: ["sink", "right cleaning cart", "center person and fixture", "right tool holder and floor"],
    targets: ["center person and fixture"],
    decoys: ["right tool holder and floor"],
    safeBackground: ["right tool holder and floor", "right cleaning cart", "sink"],
  },
  14: {
    neutral: ["left dining area", "central table and mop", "right janitor cart", "lower floor"],
    targets: ["central table and mop"],
    decoys: ["right janitor cart"],
    safeBackground: ["left dining area", "right janitor cart", "lower floor"],
  },
  15: {
    neutral: ["left wall fan", "central court", "rear wall fan", "rear bleachers", "wall padding"],
    targets: ["left wall fan"],
    decoys: ["rear wall fan"],
    safeBackground: ["central court", "rear bleachers", "wall padding"],
  },
  16: {
    neutral: ["left wall tool storage", "left workbench", "center-right saw and plug", "lower area"],
    targets: ["center-right saw and plug"],
    decoys: ["left wall tool storage"],
    safeBackground: ["left workbench", "center-right saw and plug", "center-right saw and plug", "lower area"],
  },
  17: {
    neutral: ["teacher wall", "student desks", "right-side ladder", "wall-side cord and fan", "central aisle"],
    targets: [],
    decoys: ["right-side ladder", "wall-side cord and fan", "wall-side cord and fan"],
    safeBackground: ["student desks", "central aisle", "teacher wall"],
  },
  18: {
    neutral: ["left sink and cabinet", "center bottle shelf", "center-right tool rack", "right doorway and wall hook", "lower floor"],
    targets: [],
    decoys: ["center bottle shelf", "center-right tool rack", "right doorway and wall hook"],
    safeBackground: ["left sink and cabinet", "lower floor", "right doorway and wall hook", "left sink and cabinet"],
  },
};

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function rel(path) {
  return path.slice(repoRoot.length + 1);
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")}\n${result.stderr || result.stdout}`);
  return result.stdout;
}

function dimensions(path) {
  const output = run("ffprobe", [
    "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,pix_fmt",
    "-of", "json", path,
  ]);
  const stream = JSON.parse(output).streams[0];
  return { width: stream.width, height: stream.height, pixelFormat: stream.pix_fmt };
}

function render(source, destination, filter) {
  mkdirSync(dirname(destination), { recursive: true });
  run("ffmpeg", [
    "-loglevel", "error", "-y", "-i", source, "-map_metadata", "-1", "-vf", filter,
    "-frames:v", "1", "-threads", "1", destination,
  ]);
}

function artifact(path, kind, settings) {
  return {
    kind,
    path: rel(path),
    bytes: statSync(path).size,
    sha256: sha256(path),
    dimensions: dimensions(path),
    settings,
  };
}

function boxToPolygon([x1, y1, x2, y2]) {
  return [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
}

function regionPolygons(region) {
  return typeof region[0] === "number" ? [region] : region;
}

function overlap(a, b) {
  return Math.max(a[0], b[0]) < Math.min(a[2], b[2]) && Math.max(a[1], b[1]) < Math.min(a[3], b[3]);
}

function createContactSheet(inputPattern, destination) {
  run("ffmpeg", [
    "-loglevel", "error", "-y", "-framerate", "1", "-start_number", "1", "-i", inputPattern,
    "-vf", "tile=3x6", "-frames:v", "1", "-threads", "1", destination,
  ]);
}

function createScaledContactSheet(inputPattern, destination) {
  run("ffmpeg", [
    "-loglevel", "error", "-y", "-framerate", "1", "-start_number", "1", "-i", inputPattern,
    "-vf", "scale=480:320:flags=lanczos,tile=3x6", "-frames:v", "1", "-threads", "1", destination,
  ]);
}

function createOverlay(source, destination, boxes) {
  const filters = [];
  for (const region of boxes.target) {
    for (const box of regionPolygons(region)) {
      filters.push(`drawbox=x=iw*${box[0]}:y=ih*${box[1]}:w=iw*${box[2] - box[0]}:h=ih*${box[3] - box[1]}:color=red@0.8:t=8`);
    }
  }
  for (const region of boxes.decoy) {
    for (const box of regionPolygons(region)) {
      filters.push(`drawbox=x=iw*${box[0]}:y=ih*${box[1]}:w=iw*${box[2] - box[0]}:h=ih*${box[3] - box[1]}:color=blue@0.8:t=6`);
    }
  }
  render(source, destination, filters.length ? filters.join(",") : "null");
}

for (const path of [releaseRoot, reviewRoot, masterRoot, derivativeRoot]) mkdirSync(path, { recursive: true });
for (const path of ["phone", "print", "overlays"].map((name) => resolve(reviewRoot, name))) mkdirSync(path, { recursive: true });

const sourcesById = new Map(brief.sources.map((source) => [source.id, source]));
const sourceLinesById = new Map(brief.sourceLines.map((line) => [line.id, line]));
const supportedClaimIdsBySourceLine = new Map(
  brief.sourceLines.map((line) => [line.id, []]),
);

if (brief.schemaVersion !== 2) throw new Error("Hazard-scene brief schemaVersion must be 2");
if (sourcesById.size !== brief.sources.length) throw new Error("Hazard-scene source ids must be unique");
if (sourceLinesById.size !== brief.sourceLines.length) throw new Error("Hazard-scene source-line ids must be unique");

function sceneClaimId(opaqueId, inventoryId, field) {
  return `claim.scene.${opaqueId}.${inventoryId}.${field}`;
}

function addSupportedClaim(sourceLineId, claimId) {
  const sourceLine = sourceLinesById.get(sourceLineId);
  if (!sourceLine) throw new Error(`${claimId} references unknown source line ${sourceLineId}`);
  if (!sourcesById.has(sourceLine.sourceId)) {
    throw new Error(`${sourceLineId} references unknown source ${sourceLine.sourceId}`);
  }
  const supportedClaimIds = supportedClaimIdsBySourceLine.get(sourceLineId);
  if (!supportedClaimIds.includes(claimId)) supportedClaimIds.push(claimId);
}

function claimsForScene(scene, opaqueId) {
  const claims = [];
  for (const target of scene.targetInventory) {
    const targetClaims = [
      ["why-unsafe", target.whyUnsafe, target.sourceLineIds.whyUnsafe],
      ["likely-consequence", target.likelyConsequence, target.sourceLineIds.likelyConsequence],
      ["immediate-correction", target.immediateCorrection, target.sourceLineIds.immediateCorrection],
    ];
    for (const [field, text, sourceLineIds] of targetClaims) {
      const id = sceneClaimId(opaqueId, target.id, field);
      for (const sourceLineId of sourceLineIds) addSupportedClaim(sourceLineId, id);
      claims.push({
        id,
        text,
        sourceLineIds,
        evidenceTier: "official-primary-synthesis",
        caveat: target.evidenceCaveat,
      });
    }
  }
  for (const decoy of scene.decoyInventory) {
    const decoyClaims = [
      ["safe-as-depicted", decoy.safeAsDepicted],
      ["unsafe-if", decoy.unsafeIf],
    ];
    for (const [field, text] of decoyClaims) {
      const id = sceneClaimId(opaqueId, decoy.id, field);
      for (const sourceLineId of decoy.sourceLineIds) addSupportedClaim(sourceLineId, id);
      claims.push({
        id,
        text,
        sourceLineIds: decoy.sourceLineIds,
        evidenceTier: "official-primary-synthesis",
        caveat: decoy.evidenceCaveat,
      });
    }
  }
  return claims;
}

const claimsBySceneId = new Map(
  brief.scenes.map((scene) => {
    const opaqueId = `s${String(scene.slot).padStart(3, "0")}`;
    return [scene.id, claimsForScene(scene, opaqueId)];
  }),
);

function sourceReceiptsForClaims(claims) {
  const sourceLineIds = [...new Set(claims.flatMap((claim) => claim.sourceLineIds))];
  return sourceLineIds.map((sourceLineId) => {
    const line = sourceLinesById.get(sourceLineId);
    const source = sourcesById.get(line.sourceId);
    return {
      id: line.id,
      sourceId: line.sourceId,
      title: source.title,
      publisher: source.publisher,
      evidenceTier: source.evidenceTier,
      version: source.version,
      rightsNotes: source.rightsNotes,
      locator: line.locator,
      excerpt: line.excerpt,
      language: "en",
      verifiedOn: line.verifiedOn,
      supportedClaimIds: supportedClaimIdsBySourceLine.get(line.id),
      scope: source.scope,
      sourceLocator: source.locator,
      ...(source.url === undefined ? {} : { url: source.url }),
    };
  });
}

function asSentence(text) {
  const trimmed = text.trim();
  const capitalized = `${trimmed[0].toUpperCase()}${trimmed.slice(1)}`;
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function neutralPreAnswerForScene(scene, accessZones) {
  const observationsByZone = new Map(accessZones.neutral.map((label) => [label, []]));
  scene.targetInventory.forEach((target, index) => {
    observationsByZone.get(accessZones.targets[index]).push(target.observableCondition);
  });
  scene.decoyInventory.forEach((decoy, index) => {
    observationsByZone.get(accessZones.decoys[index]).push(decoy.observableCondition);
  });
  scene.safeBackground.forEach((observableCondition, index) => {
    observationsByZone.get(accessZones.safeBackground[index]).push(asSentence(observableCondition));
  });
  return {
    overview: scene.neutralOverview,
    zones: accessZones.neutral.map((label, index) => {
      const observations = observationsByZone.get(label);
      return {
        order: index + 1,
        label,
        description: observations.length > 0
          ? observations.join(" ")
          : `The ${label} is visible within the ${scene.environment} setting.`,
      };
    }),
    policy: "Describes visible conditions zone by zone without stating target or decoy roles, counts, or answers.",
  };
}

const existingIndependentReview = existsSync(independentReviewPath) ? JSON.parse(readFileSync(independentReviewPath, "utf8")) : { entries: [] };
const independentReviewByScene = new Map((existingIndependentReview.entries || []).map((entry) => [entry.sceneId, entry]));
const releases = [];
const regions = [];
const accessibility = [];
const lineage = [];
const qaLedger = [];
const checksumArtifacts = [];

for (const scene of brief.scenes) {
  const opaqueId = `s${String(scene.slot).padStart(3, "0")}`;
  const generatorOperator = replacementGeneratorOperators.get(scene.slot) || originalGeneratorOperator;
  const candidate = resolve(candidateRoot, `${opaqueId}.png`);
  if (!existsSync(candidate)) throw new Error(`Missing candidate ${rel(candidate)}`);
  const nativeDimensions = dimensions(candidate);
  if (nativeDimensions.width !== 1536 || nativeDimensions.height !== 1024) throw new Error(`${opaqueId} is not 1536x1024`);
  const candidateBytes = readFileSync(candidate);
  if (!candidateBytes.includes(Buffer.from("caBX"))) throw new Error(`${opaqueId} lacks the expected C2PA caBX chunk`);

  const master = resolve(masterRoot, `${opaqueId}.png`);
  copyFileSync(candidate, master);
  if (sha256(master) !== sha256(candidate)) throw new Error(`Native-byte drift while freezing ${opaqueId}`);

  const web = resolve(derivativeRoot, `${opaqueId}-web.png`);
  const phone = resolve(derivativeRoot, `${opaqueId}-phone.png`);
  const print = resolve(derivativeRoot, `${opaqueId}-print.png`);
  render(master, web, "scale=1200:800:flags=lanczos,format=rgb24");
  render(master, phone, "scale=720:480:flags=lanczos,format=rgb24");
  render(master, print, "scale=1200:800:flags=lanczos,format=gray");
  for (const path of [web, phone, print]) {
    if (readFileSync(path).includes(Buffer.from("caBX"))) throw new Error(`Nonessential provenance metadata leaked into ${rel(path)}`);
  }

  const reviewPhone = resolve(reviewRoot, "phone", `${String(scene.slot).padStart(2, "0")}.png`);
  const reviewPrint = resolve(reviewRoot, "print", `${String(scene.slot).padStart(2, "0")}.png`);
  const overlay = resolve(reviewRoot, "overlays", `${opaqueId}.png`);
  render(master, reviewPhone, "scale=480:320:flags=lanczos,format=rgb24");
  render(master, reviewPrint, "scale=480:320:flags=lanczos,format=gray");
  createOverlay(master, overlay, regionBoxes[scene.slot]);

  const masterArtifact = artifact(master, "provisional-native-master", "Byte-identical copy of the selected generated PNG; C2PA provenance retained.");
  const derivativeArtifacts = [
    artifact(web, "web", "1200x800 PNG, Lanczos, RGB24, metadata stripped"),
    artifact(phone, "phone", "720x480 PNG, Lanczos, RGB24, metadata stripped"),
    artifact(print, "print", "1200x800 grayscale PNG, Lanczos, metadata stripped"),
  ];
  checksumArtifacts.push(masterArtifact, ...derivativeArtifacts);

  const independentReview = independentReviewByScene.get(scene.id);
  const independentStatus = independentReview?.status || "pending";
  if (!new Set(["pending", "pass", "reject"]).has(independentStatus)) throw new Error(`${opaqueId} has invalid independent-review status`);
  const independentClosed = independentStatus !== "pending";
  if (independentClosed) {
    if (!independentReview.reviewer || independentReview.reviewer === generatorOperator) throw new Error(`${opaqueId} independent reviewer is missing or not independent`);
    if (independentReview.reviewedMasterSha256 !== masterArtifact.sha256) throw new Error(`${opaqueId} independent review does not match the current master hash`);
    if (!independentReview.date) throw new Error(`${opaqueId} independent review date is missing`);
  }
  masterArtifact.kind = independentStatus === "pass" ? "accepted-native-master" : "provisional-native-master";
  const resolvedAccidentalHazardReviewer = independentClosed ? independentReview.reviewer : pendingAccidentalHazardReviewer;

  const boxes = regionBoxes[scene.slot];
  if (boxes.target.length !== scene.targetInventory.length) throw new Error(`${opaqueId} target-region count mismatch`);
  if (boxes.decoy.length !== scene.decoyInventory.length) throw new Error(`${opaqueId} decoy-region count mismatch`);
  const targetPolygonBoxes = boxes.target.flatMap(regionPolygons);
  const decoyPolygonBoxes = boxes.decoy.flatMap(regionPolygons);
  if (targetPolygonBoxes.some((a, index) => targetPolygonBoxes.some((b, other) => index !== other && overlap(a, b)))) {
    throw new Error(`${opaqueId} target regions overlap`);
  }
  if (targetPolygonBoxes.some((target) => decoyPolygonBoxes.some((decoy) => overlap(target, decoy)))) {
    throw new Error(`${opaqueId} target and decoy regions overlap`);
  }
  for (const box of [...targetPolygonBoxes, ...decoyPolygonBoxes]) {
    if (box.some((coordinate) => coordinate < 0 || coordinate > 1) || box[0] >= box[2] || box[1] >= box[3]) {
      throw new Error(`${opaqueId} has an invalid normalized region`);
    }
  }

  const regionRecord = {
    sceneId: scene.id,
    opaqueAssetId: opaqueId,
    logicalPlane: { width: 1, height: 1, origin: "top-left", coordinates: "normalized" },
    masterSha256: masterArtifact.sha256,
    zoneOrder: scene.zoneOrder.map((label, index) => ({ order: index + 1, label })),
    targetRegions: scene.targetInventory.map((item, index) => ({ inventoryId: item.id, polygons: regionPolygons(boxes.target[index]).map(boxToPolygon) })),
    decoyRegions: scene.decoyInventory.map((item, index) => ({ inventoryId: item.id, polygons: regionPolygons(boxes.decoy[index]).map(boxToPolygon) })),
    validation: { coordinateBounds: "pass", targetCount: "pass", decoyCount: "pass", targetTargetNonOverlap: "pass", targetDecoyNonOverlap: "pass" },
    reviewOverlay: rel(overlay),
    publication: "authoring-only; never ship before answer reveal",
  };
  regions.push(regionRecord);

  const accessZones = accessibilityZones[scene.slot];
  if (!accessZones) throw new Error(`${opaqueId} is missing explicit accessibility zones`);
  if (accessZones.neutral.length !== scene.zoneOrder.length) throw new Error(`${opaqueId} neutral-zone count mismatch`);
  if (accessZones.targets.length !== scene.targetInventory.length) throw new Error(`${opaqueId} accessibility target-zone count mismatch`);
  if (accessZones.decoys.length !== scene.decoyInventory.length) throw new Error(`${opaqueId} accessibility decoy-zone count mismatch`);
  if (accessZones.safeBackground.length !== scene.safeBackground.length) throw new Error(`${opaqueId} accessibility safe-background-zone count mismatch`);
  const claims = claimsBySceneId.get(scene.id);
  const sourceReceipts = sourceReceiptsForClaims(claims);
  const targets = scene.targetInventory.map((item, index) => ({
    id: item.id,
    zone: accessZones.targets[index],
    polygons: regionPolygons(boxes.target[index]).map(boxToPolygon),
    observableCondition: item.observableCondition,
    conceptIds: item.conceptIds,
    correctionCategory: item.correctionCategory,
    whyUnsafeClaimId: sceneClaimId(opaqueId, item.id, "why-unsafe"),
    likelyConsequenceClaimId: sceneClaimId(opaqueId, item.id, "likely-consequence"),
    immediateCorrectionClaimId: sceneClaimId(opaqueId, item.id, "immediate-correction"),
  }));
  const decoys = scene.decoyInventory.map((item, index) => ({
    id: item.id,
    zone: accessZones.decoys[index],
    polygons: regionPolygons(boxes.decoy[index]).map(boxToPolygon),
    observableCondition: item.observableCondition,
    conceptIds: item.conceptIds,
    suspiciousBecause: item.suspiciousBecause,
    safeAsDepictedClaimId: sceneClaimId(opaqueId, item.id, "safe-as-depicted"),
    unsafeIfClaimId: sceneClaimId(opaqueId, item.id, "unsafe-if"),
  }));
  const safeBackground = scene.safeBackground.map((observableCondition, index) => ({
    zone: accessZones.safeBackground[index],
    observableCondition: asSentence(observableCondition),
  }));
  const neutralPreAnswer = neutralPreAnswerForScene(scene, accessZones);
  const claimById = new Map(claims.map((claim) => [claim.id, claim]));
  const accessRecord = {
    schemaVersion: 2,
    sceneId: scene.id,
    opaqueAssetId: opaqueId,
    derivedFrom: "content/authoring/visuals/releases/scenes.json",
    neutralPreAnswer,
    fullPostAnswer: {
      targets: targets.map((target) => ({
        id: target.id,
        zone: target.zone,
        observableCondition: target.observableCondition,
        whyUnsafe: claimById.get(target.whyUnsafeClaimId).text,
        likelyConsequence: claimById.get(target.likelyConsequenceClaimId).text,
        immediateCorrection: claimById.get(target.immediateCorrectionClaimId).text,
        conceptIds: target.conceptIds,
        correctionCategory: target.correctionCategory,
        claimIds: [
          target.whyUnsafeClaimId,
          target.likelyConsequenceClaimId,
          target.immediateCorrectionClaimId,
        ],
      })),
      decoys: decoys.map((decoy) => ({
        id: decoy.id,
        zone: decoy.zone,
        observableCondition: decoy.observableCondition,
        suspiciousBecause: decoy.suspiciousBecause,
        safeAsDepicted: claimById.get(decoy.safeAsDepictedClaimId).text,
        unsafeIf: claimById.get(decoy.unsafeIfClaimId).text,
        conceptIds: decoy.conceptIds,
        claimIds: [decoy.safeAsDepictedClaimId, decoy.unsafeIfClaimId],
      })),
      safeBackground,
      claims,
      sources: sourceReceipts,
    },
    nonvisualZonedEquivalent: [
      ...targets.map((target) => ({
        zone: target.zone,
        role: "target",
        statement: `${target.observableCondition} ${claimById.get(target.whyUnsafeClaimId).text} ${claimById.get(target.likelyConsequenceClaimId).text} ${claimById.get(target.immediateCorrectionClaimId).text}`,
      })),
      ...decoys.map((decoy) => ({
        zone: decoy.zone,
        role: "decoy",
        statement: `${decoy.observableCondition} ${decoy.suspiciousBecause} ${claimById.get(decoy.safeAsDepictedClaimId).text} ${claimById.get(decoy.unsafeIfClaimId).text}`,
      })),
      ...safeBackground.map((item) => ({ zone: item.zone, role: "safe-background", statement: item.observableCondition })),
    ],
  };
  accessibility.push(accessRecord);

  lineage.push({
    sceneId: scene.id,
    opaqueAssetId: opaqueId,
    generator: scene.slot === 16
      ? "OpenAI built-in imagegen; full-canvas regeneration followed by one targeted full-canvas geometry refinement"
      : "OpenAI built-in imagegen, one complete full-canvas raster per call",
    generatorOperator,
    promptRecord: `${rel(briefPath)}#scene-slot-${scene.slot}`,
    selectedCandidate: { path: rel(candidate), sha256: sha256(candidate), dimensions: nativeDimensions, c2paChunkPresent: true },
    rejectedAttempts: (rejectedAttempts[scene.slot] || []).map(([filename, reason]) => {
      const rejected = resolve(candidateRoot, "rejected", filename);
      if (!existsSync(rejected)) throw new Error(`Missing rejected lineage artifact ${rel(rejected)}`);
      return { path: rel(rejected), sha256: sha256(rejected), reason };
    }),
    semanticRevision: semanticRevisions[scene.slot] || null,
  });

  const reviews = {
    sourceAndScope: "pass",
    semanticContent: "pass — selected pixels match the authored target/decoy inventory after documented replacements and one decoy reconciliation",
    exactPixel: "pass — selected candidate and exact native master hashes match",
    operatorAccidentalHazardScreen: "pass",
    independentAccidentalHazardReview: independentStatus,
    styleAndSimilarity: "pass",
    rightsAndProvenance: scene.slot === 16
      ? "pass — project-owned generated remediation candidate used only for targeted geometry refinement; no external source image or prohibited reconstruction supplied; native C2PA retained"
      : "pass — text-only original generation; no source image or prohibited reconstruction supplied; native C2PA retained",
    securityAndAnswerLeak: "pass — opaque delivery IDs and stripped derivative metadata; answer-bearing overlays remain authoring-only",
    phone: "pass at 480x320 review size",
    grayscalePrint: "pass at 480x320 review size",
    accessibility: "pass — neutral, full, and nonvisual zoned records authored",
    regions: "pass — normalized one-to-one inventory regions authored and validated",
    checksum: "pass",
  };
  qaLedger.push({
    sceneId: scene.id,
    opaqueAssetId: opaqueId,
    exactMasterSha256: masterArtifact.sha256,
    generatorOperator,
    accidentalHazardReviewer: resolvedAccidentalHazardReviewer,
    overall: independentStatus === "pass" ? "accepted" : independentStatus === "reject" ? "rejected-by-independent-review" : "pending-independent-review",
    reviews,
    independentFindings: independentReview?.findings || [],
  });

  releases.push({
    schemaVersion: 2,
    version: 2,
    sceneId: scene.id,
    opaqueAssetId: opaqueId,
    slot: scene.slot,
    kind: scene.kind,
    hazardFamily: scene.hazardFamily,
    environment: scene.environment,
    productionStatus: independentStatus === "pass" ? "accepted" : independentStatus === "reject" ? "rejected-by-independent-review" : "review-ready-awaiting-independent-accidental-hazard-review",
    independentReviewStatus: independentStatus,
    master: masterArtifact,
    derivatives: derivativeArtifacts,
    publicationGate: independentStatus === "pass" ? null : independentStatus === "reject" ? "Replace the rejected exact-pixel candidate and rerun all affected review and release stages." : "Independent reviewer must close accidental-hazard/decoy review against this exact master hash before production acceptance.",
    tags: {
      domain: "health-and-safety",
      family: "hazard-scene",
      environment: scene.environment,
      hazardCategory: scene.hazardFamily,
      seriesScope: "entry-level-custodians-janitors",
      editorialDifficulty: "application",
    },
    neutralPreAnswer,
    targets,
    decoys,
    safeBackground,
    claims,
    sources: sourceReceipts,
  });
}

createContactSheet(resolve(reviewRoot, "phone/%02d.png"), resolve(reviewRoot, "PHONE-CONTACT-SHEET.png"));
createContactSheet(resolve(reviewRoot, "print/%02d.png"), resolve(reviewRoot, "PRINT-CONTACT-SHEET.png"));
createScaledContactSheet(resolve(reviewRoot, "overlays/s%03d.png"), resolve(reviewRoot, "OVERLAY-CONTACT-SHEET.png"));

writeFileSync(resolve(releaseRoot, "scenes.json"), `${JSON.stringify(releases, null, 2)}\n`);
writeFileSync(resolve(releaseRoot, "regions.json"), `${JSON.stringify(regions, null, 2)}\n`);
writeFileSync(resolve(releaseRoot, "accessibility.json"), `${JSON.stringify(accessibility, null, 2)}\n`);
writeFileSync(resolve(releaseRoot, "scene-candidate-lineage.json"), `${JSON.stringify(lineage, null, 2)}\n`);
writeFileSync(resolve(releaseRoot, "scene-qa-ledger.json"), `${JSON.stringify(qaLedger, null, 2)}\n`);
writeFileSync(manifestPath, `${checksumArtifacts.map((entry) => `${entry.sha256}  ${entry.path}`).join("\n")}\n`);

if (!existsSync(independentReviewPath)) {
  const independentReviewTemplate = {
    reviewId: "plan-002-independent-accidental-hazard-review",
    instructions: "A reviewer other than generatorOperator must inspect the exact phone, grayscale, native, and authoring-overlay views for every scene. Set each entry to pass or reject, retain its exact reviewedMasterSha256, add findings, reviewer identity, and date, then rerun build-scene-release.mjs.",
    entries: releases.map((scene) => ({
      sceneId: scene.sceneId,
      opaqueAssetId: scene.opaqueAssetId,
      reviewedMasterSha256: scene.master.sha256,
      reviewer: null,
      date: null,
      status: "pending",
      findings: [],
    })),
  };
  writeFileSync(independentReviewPath, `${JSON.stringify(independentReviewTemplate, null, 2)}\n`);
}

const acceptedCount = releases.filter((scene) => scene.productionStatus === "accepted").length;
const rejectedCount = releases.filter((scene) => scene.productionStatus === "rejected-by-independent-review").length;
const pendingCount = releases.length - acceptedCount - rejectedCount;
const generatorOperators = [...new Set(qaLedger.map((scene) => scene.generatorOperator))];
const gateSummary = pendingCount === 0 && rejectedCount === 0
  ? "Independent accidental-hazard review is closed against every exact master hash; all 18 scenes are accepted."
  : "Production acceptance remains blocked for any pending or rejected scene; no record claims that an unresolved gate is closed.";
const receipt = `# Hazard-scene visual package receipt\n\n- Date: ${releaseDate}\n- Exact review-ready scenes: ${releases.length}\n- Positive scenes: ${releases.filter((scene) => scene.kind === "positive").length}\n- Zero-hazard controls: ${releases.filter((scene) => scene.kind === "zero-hazard").length}\n- Independent status: ${acceptedCount} accepted, ${rejectedCount} rejected, ${pendingCount} pending\n- Native profile: 1536x1024 PNG, exact generated bytes preserved with C2PA provenance\n- Delivery profiles: 1200x800 web, 720x480 phone, 1200x800 grayscale print\n- Generator/operators: ${generatorOperators.join("; ")}\n- Independent review input: content/authoring/visuals/reviews/scenes/independent-review.json\n- Manifest: content/assets/SCENE-MANIFEST.sha256\n- Read-only verification: node content/authoring/visuals/releases/verify-visual-release.mjs scenes\n\nAll 18 exact-pixel candidates, opaque derivatives, semantic records, regions, accessibility records, lineage, review overlays, and checksums are complete. Rejected attempts are preserved in candidate lineage. ${gateSummary}\n`;
writeFileSync(resolve(releaseRoot, "SCENE-RELEASE-RECEIPT.md"), receipt);

if (pendingCount === 0 && rejectedCount === 0) {
  verifyVisualRelease({ scope: "scenes" });
}
console.log(`Built scene package: ${acceptedCount} accepted, ${rejectedCount} rejected, ${pendingCount} pending independent review.`);
