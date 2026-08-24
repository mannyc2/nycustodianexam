import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const briefPath = resolve(
  repoRoot,
  "content/authoring/visuals/briefs/visual-pilot-v2.json",
);
const repairBriefRelativePaths = [
  "content/authoring/visuals/briefs/visual-pilot-v2-gate-repair.json",
  "content/authoring/visuals/briefs/visual-pilot-v2-gate-repair-2.json",
  "content/authoring/visuals/briefs/visual-pilot-v2-gate-repair-3.json",
  "content/authoring/visuals/briefs/visual-pilot-v2-gate-repair-4.json",
  "content/authoring/visuals/briefs/visual-pilot-v2-pipe-wrench-bakeoff.json",
  "content/authoring/visuals/briefs/visual-pilot-v2-pipe-wrench-bakeoff-2.json",
];
const repairBriefPaths = repairBriefRelativePaths.map((path) =>
  resolve(repoRoot, path),
);
const candidateRoot = resolve(
  repoRoot,
  "content/assets/candidates/visual-pilot-v2",
);
const reviewRoot = resolve(
  repoRoot,
  "content/authoring/visuals/reviews/visual-pilot-v2",
);
const brief = JSON.parse(readFileSync(briefPath, "utf8"));
const repairBriefs = repairBriefPaths.map((path) =>
  JSON.parse(readFileSync(path, "utf8")),
);
const repairPromptById = new Map(
  repairBriefs.flatMap((repairBrief) =>
    repairBrief.assets.map((asset) => [asset.parentCandidateId, asset.prompt]),
  ),
);
const repairPromptByCandidateId = new Map(
  repairBriefs.flatMap((repairBrief) =>
    repairBrief.assets.map((asset) => [asset.candidateId, asset.prompt]),
  ),
);

const corrections = {
  v2t001:
    "Targeted correction: retain the correct adjustable-wrench mechanism, but use a genuinely square canvas with a uniform pure white background and only crisp black technical contour lines plus very sparse light-gray functional hatching; absolutely no dark field, vignette, glow, gradient, solid gray fill, 3D shading, or photographic lighting.",
  v2t002:
    "Targeted correction: retain the offset hook jaw, opposing serrated heel jaw, exposed hook-jaw shank, and knurled adjustment nut, but use a genuinely square canvas with a uniform opaque pure white background and only crisp black technical contour lines plus very sparse light-gray functional hatching; absolutely no transparency, dark field, vignette, glow, gradient, solid gray fill, 3D shading, or photographic lighting.",
  v2t002Second:
    "Second targeted correction: repair the hook-jaw shank and adjustment mechanism. The toothed hook jaw must have one straight rectangular shank that passes through the wrench body and is engaged by the single knurled adjustment nut. That shank must terminate cleanly within the body mechanism; no threaded rod, toothed tail, loop, U-shaped piece, hook, fork, or projection may extend to the right of or beyond the adjustment nut. Keep one heavy straight handle only, and keep both serrated gripping faces mechanically opposed across one open throat.",
  v2t003:
    "Targeted correction: show a completely hollow, unobstructed cup interior with no interior disk, inner sleeve, secondary ring, folded flange, or central projection; only the small mechanically plausible handle attachment may meet the cup at its upper interior apex. Use a uniform opaque pure white background and crisp black technical contours with only sparse light-gray functional hatching; no transparency, dark field, vignette, gradient, solid gray modeling, or photographic lighting.",
  v2t004:
    "Targeted correction: retain the clearly projecting open cylindrical lower flange, the visible transition from the outer bell-shaped cup, and the complete diagonally tilted handle. Use a uniform opaque pure white background and crisp black technical contours with only sparse light-gray functional hatching; no transparency, dark field, vignette, gradient, dense tonal modeling, solid gray fill, 3D shading, or photographic lighting.",
  v2t005:
    "Targeted correction: depict exactly one physical pivot pin seated at one end of one short two-position slip slot; the second usable position must be visibly vacant and must not contain a second pin, bolt head, washer, circular disc, or duplicated fastener. Keep the linkage mechanically coherent and keep both short ordinary serrated jaws and both complete handles unchanged in role.",
  v2s001:
    "Targeted regeneration correction: Preserve every requirement above, but show no extra bottles or jugs beyond the single blank half-filled target spray bottle and the lower-shelf decoy jugs. Every non-target supply jug must have the requested large bordered uniformly diagonal-hatched identification panel. Do not place any blank non-target container on any shelf.",
  v2s003:
    "Targeted regeneration correction: Preserve every requirement above, but make the protected-cord detail unmistakable at phone size. Show the intact fan cord entering a broad, shallow, beveled floor cord protector that is visibly a separate object from the wall baseboard, then show that protector running only along the far-right wall edge to the receptacle. No loose or exposed cord loop may remain, and the protector must never enter the central aisle.",
  v2s004:
    "Targeted correction: keep the complete suction hose, including its free nozzle/end, fully visible inside the canvas with generous right-edge margin; preserve all other brief requirements exactly.",
  v2s006:
    "Targeted correction: place the damage exactly where the cord exits the fan housing, and depict it as one clean, large split in only the black outer jacket exposing exactly two smooth, separately insulated inner conductors; show no frayed strands and no bare copper; preserve all other brief requirements exactly.",
};

const v2s005EditPrompt =
  "Edit the supplied raster candidate as a tightly bounded scientific-educational correction. Preserve the exact wide cafeteria scene, camera, framing, line-art style, cups, spray bottle, tote, sink, counter, cabinet, floor, every object position, all safety meaning, and the pure monochrome palette. Change only the separate closed cleaning jug standing upright in the lower cabinet containment tray: add one large bordered rectangular identification panel on the jug's front face, filled only with uniform diagonal black line hatching. The panel must contain no letters, numbers, symbols, pseudo-text, logo, or readable mark. Keep the jug closed, upright, several feet away from the tote, and inside its existing containment tray. Do not add or remove any other object, hazard, spill, color, text, label, cue, or decoration. Output the complete edited scene as one native raster.";

const specs = [
  {
    id: "v2t001",
    kind: "tool",
    sourceCandidate: "v2t001.png",
    reviewCandidate: "v2t001-e1.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a02fe2-a370-7ab3-b860-7719262c0e6d/exec-b278c045-3f48-433a-976b-7da525723605.png",
    promptCorrections: [corrections.v2t001],
    edit: {
      kind: "bounded-raster-edit",
      reason: "Composite the native transparent background onto opaque white without changing subject pixels.",
      command:
        'ffmpeg -f lavfi -i "color=c=white:s=1254x1254,format=rgba" -i v2t001.png -filter_complex "[0:v][1:v]overlay=format=auto,format=rgb24" -frames:v 1 v2t001-e1.png',
    },
  },
  {
    id: "v2t002",
    kind: "tool",
    sourceCandidate: "v2t002-b5.png",
    reviewCandidate: "v2t002-b5.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a03052-0483-7eb2-8eef-c69e097dc401/exec-6f3cb312-bbca-40a4-a3d3-a55f67858394.png",
    promptCorrections: [],
    exactPromptOverride: repairPromptByCandidateId.get("v2t002-b5"),
    promptRecordOverride:
      "content/authoring/visuals/briefs/visual-pilot-v2-pipe-wrench-bakeoff-2.json#v2t002-b5",
    referenceInputs: [
      {
        path: "content/authoring/visuals/references/pipe-wrench/straight-pipe-wrench-assembled-packshot.jpg",
        sha256: "bd312c12650c81ee62667937cf90d03baf2cd2dbe4fb2560c04e8cc6a0302984",
        use: "sole assembled-anatomy reference; color, branding, lettering, contours, and trade dress excluded",
      },
    ],
    pixelTruthReconciliation:
      "The opaque head naturally hides the middle of the hook-jaw-to-shank connection. The visible hook stem overlaps the axis of the single threaded shank emerging through one knurled nut, and the short rounded threaded end beyond the nut is valid traditional geometry. Independent blinded review and a separate reference-based mechanism adjudication both passed this topology at native and 320-pixel sizes.",
    edit: null,
  },
  {
    id: "v2t003",
    kind: "tool",
    sourceCandidate: "v2t003.png",
    reviewCandidate: "v2t003.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a02fe2-a370-7ab3-b860-7719262c0e6d/exec-f91c565a-f807-40f5-b1c0-6ba4c5f7c22b.png",
    promptCorrections: [corrections.v2t003],
    edit: null,
  },
  {
    id: "v2t004",
    kind: "tool",
    sourceCandidate: "v2t004.png",
    reviewCandidate: "v2t004.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a02fe2-a370-7ab3-b860-7719262c0e6d/exec-1f568c62-9feb-4a17-afbd-5e26550c0dfa.png",
    promptCorrections: [corrections.v2t004],
    edit: null,
  },
  {
    id: "v2t005",
    kind: "tool",
    sourceCandidate: "v2t005-g2.png",
    reviewCandidate: "v2t005-g2.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a03019-d846-7c72-ad0d-0be4c38f7346/exec-2858cb99-da95-4b93-b84e-77deef00f89c.png",
    promptCorrections: [],
    exactPromptOverride: repairPromptById.get("v2t005"),
    pixelTruthReconciliation:
      "The complete tool remains visible, but its approximately 92-percent horizontal occupancy is closer than the requested framing and must not become a reusable composition target.",
    edit: null,
  },
  {
    id: "v2t006",
    kind: "tool",
    sourceCandidate: "v2t006.png",
    reviewCandidate: "v2t006.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a02fe2-a370-7ab3-b860-7719262c0e6d/exec-787aa301-ed99-466d-9efd-79f07e00a205.png",
    promptCorrections: [],
    edit: null,
  },
  {
    id: "v2s001",
    kind: "scene",
    sourceCandidate: "v2s001.png",
    reviewCandidate: "v2s001.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a02fe2-bd12-7ba2-8821-74e5cedef4dc/exec-17cda14c-633e-410b-8872-c72d5203007e.png",
    promptCorrections: [corrections.v2s001],
    edit: null,
  },
  {
    id: "v2s002",
    kind: "scene",
    sourceCandidate: "v2s002.png",
    reviewCandidate: "v2s002.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a02fe2-bd12-7ba2-8821-74e5cedef4dc/exec-70345ae8-14d2-4621-8175-92e165501dd9.png",
    promptCorrections: [],
    edit: null,
  },
  {
    id: "v2s003",
    kind: "scene",
    sourceCandidate: "v2s003.png",
    reviewCandidate: "v2s003.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a02fe2-bd12-7ba2-8821-74e5cedef4dc/exec-054240dc-433c-4d54-97d7-45889aca4c9b.png",
    promptCorrections: [corrections.v2s003],
    pixelTruthReconciliation:
      "Final accessibility language describes the short intact wall-side lead separately and claims protection only for the visible floor-level run; it does not repeat the brief's stronger fully-covered-cord wording.",
    edit: null,
  },
  {
    id: "v2s004",
    kind: "scene",
    sourceCandidate: "v2s004.png",
    reviewCandidate: "v2s004.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a02fe2-dc13-7212-a208-a3ea0db6fde3/exec-fed1b5f7-0456-41b0-9a64-40b58218210d.png",
    promptCorrections: [corrections.v2s004],
    pixelTruthReconciliation:
      "Final accessibility language does not claim that caster brakes are set because that state is not visibly provable.",
    edit: null,
  },
  {
    id: "v2s005",
    kind: "scene",
    sourceCandidate: "v2s005-e1.png",
    reviewCandidate: "v2s005-e1.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a02fc9-7789-74a1-9b74-dcd8ce448059/exec-cce3b793-e2f2-49f4-bcea-a9afc7992592.png",
    promptCorrections: [],
    exactPromptOverride: v2s005EditPrompt,
    edit: {
      kind: "imagegen-edit",
      reason: "Add a nonreadable hatched identification panel to the otherwise blank safe-background jug.",
      referencedImage:
        "content/assets/candidates/visual-pilot-v2/v2s005.png",
      referencedImageSha256:
        "ef486d4c5e2e29933c3329e52fdea926d2fae7fb74682ca221d3f0570f2ef0a0",
    },
  },
  {
    id: "v2s006",
    kind: "scene",
    sourceCandidate: "v2s006-g3.png",
    reviewCandidate: "v2s006-g3.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a03019-f9ca-7652-b61f-ad173bfc2c08/exec-dac50203-6167-492c-a9af-d3733f2c8874.png",
    promptCorrections: [],
    exactPromptOverride: repairPromptById.get("v2s006"),
    pixelTruthReconciliation:
      "The final pixels place the jacket split a short distance from the fan housing along the wall-edge cord run, not immediately outside the housing. Target, accessibility, and region language uses the pixel-true location; the safety claim and correction are unchanged.",
    edit: null,
  },
  {
    id: "v2s007",
    kind: "scene",
    sourceCandidate: "v2s007.png",
    reviewCandidate: "v2s007.png",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a02fe2-dc13-7212-a208-a3ea0db6fde3/exec-49f74485-9bd9-494e-9380-7f60236ba149.png",
    promptCorrections: [],
    pixelTruthReconciliation:
      "Final accessibility language describes broad open floor and omits the brief's marked-walking-lane wording because no distinct marked lane is visible.",
    edit: null,
  },
];

const unsuccessfulAttempts = [
  ["v2t001-r1.png", "Landscape/transparent presentation failed the square opaque-white brief."],
  ["v2t002-r1.png", "Landscape/transparent presentation failed the square opaque-white brief."],
  ["v2t002.png", "The curved hook jaw entered the body on a different axis while the loop-ended threaded element beyond the nut read as a separate shank."],
  ["v2t002-g2.png", "The adjustment nut surrounded a standalone threaded rod that was not visibly continuous with the curved hook jaw."],
  ["v2t002-e2.png", "A full-height body-wall line visibly separated the curved hook jaw from the otherwise corrected threaded rack and nut."],
  ["v2t002-e3.png", "A residual vertical separator and missing lower contour connection still prevented the rack from reading as the hook jaw's continuous shank at 320 pixels."],
  ["v2t002-b1.png", "The patent-led reference caused a proprietary-looking U-shaped rack to appear as a second mechanism disconnected from the hook jaw."],
  ["v2t002-b2.png", "The assembled object was recognizable, but it repeated the existing diagonal master composition and left the hook-jaw-to-shank connection occluded and inferential rather than producing the requested matched profile."],
  ["v2t002-b3.png", "The paired-profile strategy produced a loop-ended rack emerging from the nut while the hook jaw terminated behind the body block."],
  ["v2t002-b4.png", "The assembled-packshot strategy produced plausible overall topology, but the broad two-banded adjuster remained ambiguous as two collars or nuts at 320 pixels and lost the final adjudication."],
  ["v2t002-e4.png", "The whole-head edit retained a smooth upper hook tail while adding a separate lower threaded element through the nut."],
  ["v2t003-r1.png", "An interior disk made the cup-plunger opening ambiguous."],
  ["v2t004-r1.png", "Dense tonal modeling and transparency failed the presentation brief."],
  ["v2t005-r1.png", "Two fastener-like pivot discs made the two-position mechanism ambiguous."],
  ["v2t005.png", "Two similarly outlined circular forms left the seated-pin versus vacant-position anatomy ambiguous."],
  ["v2s001-r1.png", "Extra blank containers created additional unidentified-container hazards."],
  ["v2s003-r1.png", "The cord protector resembled the baseboard and routing was ambiguous."],
  ["v2s004-r1.png", "The hose target was cropped at the right canvas edge."],
  ["v2s005.png", "A blank lower safe-background jug created a second unidentified-container condition."],
  ["v2s006-r1.png", "Damage appeared near the receptacle and resembled frayed strands."],
  ["v2s006.png", "The jacket split read as an inline connector and included a stray blue-gray cue."],
  ["v2s006-e1.png", "Grayscale normalization removed color but the target still read as a connector at phone size."],
  ["v2s006-e2.png", "The requested damaged-jacket target was absent at native and phone sizes."],
];

const unsuccessfulAttemptMetadata = {
  "v2t002-g2.png": {
    promptRecord:
      "content/authoring/visuals/briefs/visual-pilot-v2-gate-repair-2.json#v2t002-g2",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a03024-d552-74a1-943c-fe0047c3014f/exec-7df2a2f7-6451-4172-bff2-a403278b5201.png",
  },
  "v2t002-e2.png": {
    promptRecord:
      "content/authoring/visuals/briefs/visual-pilot-v2-gate-repair-3.json#v2t002-e2",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a0302b-2ede-72e2-a543-113343418f7f/exec-dea53e59-6d76-45f4-bda0-3fd435f3fa66.png",
    editInputs: [
      {
        path: "content/assets/candidates/visual-pilot-v2/v2t002-g2.png",
        sha256: "4d2f9ceea8687de6e20537277026a22b00447b418f8e17918a4374655a59825f",
      },
      {
        path: "content/assets/masters/tools/t037.png",
        sha256: "0f2e1e00b8b16e4472f117e80b6e8819b798aaa3f6c7eae9d2aa1bbbfdbe9c89",
        use: "accepted same-library mechanical-anatomy reference only; source bytes unchanged",
      },
    ],
  },
  "v2t002-e3.png": {
    promptRecord:
      "content/authoring/visuals/briefs/visual-pilot-v2-gate-repair-4.json#v2t002-e3",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a0302b-2ede-72e2-a543-113343418f7f/exec-500b5cdd-7751-44c6-99a6-5a627e249da9.png",
    editInputs: [
      {
        path: "content/assets/candidates/visual-pilot-v2/v2t002-e2.png",
        sha256: "a7ddd04c238078a5e896acfa02f5fbb420e609d3b51e787a0608599d4a262b46",
      },
    ],
  },
  "v2t002-b1.png": {
    promptRecord:
      "content/authoring/visuals/briefs/visual-pilot-v2-pipe-wrench-bakeoff.json#v2t002-b1",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a03045-02f9-78e3-9f46-aa864c7759fd/exec-55e4ad3e-e045-445b-864b-9ca3103fdac9.png",
    referenceInputs: [
      {
        path: "content/authoring/visuals/references/pipe-wrench/us11247313-fig3.png",
        sha256: "a56646a2304cd51e676594ed5420a6a53f51eb166d81ed097cd69916713aeff5",
        use: "mechanism topology only",
      },
      {
        path: "content/assets/masters/tools/t037.png",
        sha256: "0f2e1e00b8b16e4472f117e80b6e8819b798aaa3f6c7eae9d2aa1bbbfdbe9c89",
        use: "library line style only",
      },
    ],
  },
  "v2t002-b2.png": {
    promptRecord:
      "content/authoring/visuals/briefs/visual-pilot-v2-pipe-wrench-bakeoff.json#v2t002-b2",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a03045-d13f-7133-b871-01d31ce441bc/exec-da78af61-e0ad-4f2f-a75d-5cc31a62b535.png",
    referenceInputs: [
      {
        path: "content/authoring/visuals/references/pipe-wrench/ridgid-straight-wrench-exploded.png",
        sha256: "b5aa2b5a4d8188888c19e80470fd7f8cd07f0be77636813fec9de6e3bd299153",
        use: "component anatomy and assembly only",
      },
      {
        path: "content/assets/masters/tools/t037.png",
        sha256: "0f2e1e00b8b16e4472f117e80b6e8819b798aaa3f6c7eae9d2aa1bbbfdbe9c89",
        use: "library style only",
      },
    ],
  },
  "v2t002-b3.png": {
    promptRecord:
      "content/authoring/visuals/briefs/visual-pilot-v2-pipe-wrench-bakeoff.json#v2t002-b3",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a03045-f472-7533-8d89-ebbdb53a7f3e/exec-7d3c91f0-0545-4fdd-bcca-8c7f62653b8a.png",
    referenceInputs: [
      {
        path: "content/assets/candidates/visual-pilot-v2/v2t001-e1.png",
        sha256: "7ac7c9016edfb191365e93a6e714c606edccc584934233b12c07693579052928",
        use: "matched profile framing only",
      },
      {
        path: "content/assets/masters/tools/t037.png",
        sha256: "0f2e1e00b8b16e4472f117e80b6e8819b798aaa3f6c7eae9d2aa1bbbfdbe9c89",
        use: "library style only",
      },
      {
        path: "content/authoring/visuals/references/pipe-wrench/us11247313-fig3.png",
        sha256: "a56646a2304cd51e676594ed5420a6a53f51eb166d81ed097cd69916713aeff5",
        use: "mechanism topology only",
      },
    ],
  },
  "v2t002-b4.png": {
    promptRecord:
      "content/authoring/visuals/briefs/visual-pilot-v2-pipe-wrench-bakeoff-2.json#v2t002-b4",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a03051-d95a-70b1-b57a-24f062d6f79c/exec-19a70d2d-e35c-4462-8e8a-27fca856a72c.png",
    referenceInputs: [
      {
        path: "content/authoring/visuals/references/pipe-wrench/straight-pipe-wrench-assembled-packshot.jpg",
        sha256: "bd312c12650c81ee62667937cf90d03baf2cd2dbe4fb2560c04e8cc6a0302984",
        use: "assembled anatomy only",
      },
      {
        path: "content/assets/candidates/visual-pilot-v2/v2t001-e1.png",
        sha256: "7ac7c9016edfb191365e93a6e714c606edccc584934233b12c07693579052928",
        use: "matched profile framing only",
      },
      {
        path: "content/assets/masters/tools/t038.png",
        sha256: "4bbd8effc5f6238222c885f25ba947f8088fd1fc2fab8463eb256c78775896b7",
        use: "unrelated library line style only",
      },
    ],
  },
  "v2t002-e4.png": {
    promptRecord:
      "content/authoring/visuals/briefs/visual-pilot-v2-pipe-wrench-bakeoff-2.json#v2t002-e4",
    generatedSource:
      "/home/cjpher/.codex/generated_images/01a03052-2fed-71e2-a08e-75580b9a2b61/exec-4f90e19e-3813-4c99-b50b-edf57a3cc8d3.png",
    editInputs: [
      {
        path: "content/assets/candidates/visual-pilot-v2/v2t002-e1.png",
        sha256: "5916afea0b3380cd3c54a8725763e86908f657f180c7d746d8a46b660c21feba",
      },
      {
        path: "content/authoring/visuals/references/pipe-wrench/straight-pipe-wrench-assembled-packshot.jpg",
        sha256: "bd312c12650c81ee62667937cf90d03baf2cd2dbe4fb2560c04e8cc6a0302984",
        use: "assembled mechanism reference only",
      },
    ],
  },
};

function sha256Buffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function sha256File(path) {
  return sha256Buffer(readFileSync(path));
}

function readPng(path) {
  const buffer = readFileSync(path);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`Not a PNG: ${path}`);
  }
  const chunks = [];
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    chunks.push(type);
    offset += 12 + length;
    if (type === "IEND") break;
  }
  const colorType = buffer[25];
  const mode = new Map([
    [0, "grayscale"],
    [2, "RGB"],
    [3, "indexed"],
    [4, "grayscale-alpha"],
    [6, "RGBA"],
  ]).get(colorType);
  return {
    format: "PNG",
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer[24],
    colorType,
    mode: mode ?? `unknown-${colorType}`,
    bytes: buffer.length,
    sha256: sha256Buffer(buffer),
    chunkTypes: [...new Set(chunks)],
    provenanceChunkPresent: chunks.includes("caBX"),
  };
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")}\n${result.stderr || result.stdout}`);
  }
}

function findBrief(id, kind) {
  const candidates = kind === "tool" ? brief.toolCandidates : brief.sceneCandidates;
  const record = candidates.find((candidate) => candidate.candidateId === id);
  if (!record) throw new Error(`Missing brief record: ${id}`);
  return record;
}

mkdirSync(reviewRoot, { recursive: true });
const reviewCandidates = specs.map((spec) => {
  const briefRecord = findBrief(spec.id, spec.kind);
  const sourcePath = resolve(candidateRoot, spec.sourceCandidate);
  const reviewPath = resolve(candidateRoot, spec.reviewCandidate);
  if (!existsSync(sourcePath) || !existsSync(reviewPath)) {
    throw new Error(`Missing candidate source/review file for ${spec.id}`);
  }
  const exactPrompt =
    spec.exactPromptOverride ??
    [
      brief.sharedPrompts[briefRecord.sharedPrompt],
      briefRecord.promptBody,
      ...spec.promptCorrections,
    ].join("\n");
  return {
    candidateId: spec.id,
    kind: spec.kind,
    conceptId: briefRecord.conceptId ?? briefRecord.sceneId,
    canonicalTerm: briefRecord.canonicalTerm ?? null,
    promptRecord:
      spec.promptRecordOverride ??
      `content/authoring/visuals/briefs/visual-pilot-v2.json#${spec.id}`,
    exactPrompt,
    promptSha256: sha256Buffer(Buffer.from(exactPrompt, "utf8")),
    generatedSource: spec.generatedSource,
    generatedCandidate: {
      path: `content/assets/candidates/visual-pilot-v2/${spec.sourceCandidate}`,
      native: readPng(sourcePath),
    },
    reviewCandidate: {
      path: `content/assets/candidates/visual-pilot-v2/${spec.reviewCandidate}`,
      native: readPng(reviewPath),
    },
    edit: spec.edit,
    pixelTruthReconciliation: spec.pixelTruthReconciliation ?? null,
    referenceInputs: spec.referenceInputs ?? null,
    status: "review-only; see independent-review.json",
  };
});

for (const profile of ["phone", "print"]) {
  for (const kind of ["tools", "scenes"]) {
    mkdirSync(resolve(reviewRoot, profile, kind), { recursive: true });
  }
}

for (const kind of ["tool", "scene"]) {
  const entries = reviewCandidates.filter((entry) => entry.kind === kind);
  entries.forEach((entry, index) => {
    const source = resolve(repoRoot, entry.reviewCandidate.path);
    const sequence = String(index + 1).padStart(2, "0");
    const phoneSize = kind === "tool" ? "320:320" : "480:320";
    const printSize = kind === "tool" ? "627:627" : "768:512";
    run("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      source,
      "-vf",
      `scale=${phoneSize}:flags=lanczos,format=rgb24`,
      "-frames:v",
      "1",
      "-threads",
      "1",
      resolve(reviewRoot, "phone", `${kind}s`, `${sequence}.png`),
    ]);
    run("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      source,
      "-vf",
      `scale=${printSize}:flags=lanczos,format=gray`,
      "-frames:v",
      "1",
      "-threads",
      "1",
      resolve(reviewRoot, "print", `${kind}s`, `${sequence}.png`),
    ]);
  });
}

const sheets = [
  ["phone/tools/%02d.png", "tile=3x2:padding=8:margin=8:color=white", "TOOLS-PHONE-CONTACT-SHEET.png"],
  ["print/tools/%02d.png", "tile=3x2:padding=8:margin=8:color=white", "TOOLS-PRINT-CONTACT-SHEET.png"],
  ["phone/scenes/%02d.png", "tile=2x4:padding=8:margin=8:color=white", "SCENES-PHONE-CONTACT-SHEET.png"],
  ["print/scenes/%02d.png", "tile=2x4:padding=8:margin=8:color=white", "SCENES-PRINT-CONTACT-SHEET.png"],
];
for (const [input, tile, output] of sheets) {
  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-framerate",
    "1",
    "-start_number",
    "1",
    "-i",
    resolve(reviewRoot, input),
    "-vf",
    tile,
    "-frames:v",
    "1",
    "-threads",
    "1",
    resolve(reviewRoot, output),
  ]);
}

const rejected = unsuccessfulAttempts.map(([fileName, reason]) => {
  const path = resolve(candidateRoot, fileName);
  if (!existsSync(path)) throw new Error(`Missing unsuccessful attempt: ${path}`);
  return {
    path: `content/assets/candidates/visual-pilot-v2/${fileName}`,
    sha256: sha256File(path),
    reason,
    ...(unsuccessfulAttemptMetadata[fileName] ?? {}),
  };
});

const lineage = {
  pilotId: brief.pilotId,
  date: brief.date,
  status: "candidate-review-package; not promoted",
  generator: "Codex built-in image_gen; one complete native raster per call",
  generatorModelIdentifier: "not exposed by the production surface",
  brief: {
    path: "content/authoring/visuals/briefs/visual-pilot-v2.json",
    sha256: sha256File(briefPath),
    taxonomyRevision: brief.taxonomyRevision,
    visualPolicyRevision: brief.visualPolicyRevision,
  },
  repairBriefs: repairBriefRelativePaths.map((path, index) => ({
    path,
    sha256: sha256File(repairBriefPaths[index]),
  })),
  reviewCandidates,
  unsuccessfulAttempts: rejected,
  reviewDerivatives: {
    toolsPhone: "content/authoring/visuals/reviews/visual-pilot-v2/TOOLS-PHONE-CONTACT-SHEET.png",
    toolsPrint: "content/authoring/visuals/reviews/visual-pilot-v2/TOOLS-PRINT-CONTACT-SHEET.png",
    scenesPhone: "content/authoring/visuals/reviews/visual-pilot-v2/SCENES-PHONE-CONTACT-SHEET.png",
    scenesPrint: "content/authoring/visuals/reviews/visual-pilot-v2/SCENES-PRINT-CONTACT-SHEET.png",
  },
};

writeFileSync(
  resolve(reviewRoot, "lineage.json"),
  `${JSON.stringify(lineage, null, 2)}\n`,
);
writeFileSync(
  resolve(reviewRoot, "CANDIDATES.sha256"),
  `${reviewCandidates
    .map((entry) => `${entry.reviewCandidate.native.sha256}  ${entry.reviewCandidate.path}`)
    .join("\n")}\n`,
);

console.log(
  `Wrote ${reviewCandidates.length} review candidates, ${rejected.length} unsuccessful attempts, and four contact sheets.`,
);
