import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const reviewRoot = resolve(
  repoRoot,
  "content/authoring/visuals/reviews/visual-pilot-v2",
);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertUnique(values, label) {
  assert(new Set(values).size === values.length, `Duplicate ${label}`);
}

function bindingMatches(binding, lineageRecord, label) {
  assert(binding.path === lineageRecord.reviewCandidate.path, `${label}: path drift`);
  assert(
    binding.candidateSha256 === lineageRecord.reviewCandidate.native.sha256,
    `${label}: lineage hash drift`,
  );
  assert(
    binding.candidateSha256 === sha256File(resolve(repoRoot, binding.path)),
    `${label}: file hash drift`,
  );
  assert(
    binding.width === lineageRecord.reviewCandidate.native.width &&
      binding.height === lineageRecord.reviewCandidate.native.height,
    `${label}: dimensions drift`,
  );
}

const lineagePath = resolve(reviewRoot, "lineage.json");
const independentPath = resolve(reviewRoot, "independent-review.json");
const accessibilityPath = resolve(reviewRoot, "accessibility-draft.json");
const regionsPath = resolve(reviewRoot, "regions-draft.json");
const lineage = readJson(lineagePath);
const independent = readJson(independentPath);
const accessibility = readJson(accessibilityPath);
const regions = readJson(regionsPath);

const lineageIds = lineage.reviewCandidates.map((record) => record.candidateId);
const verdictIds = independent.verdicts.map((record) => record.candidateId);
assert(lineageIds.length === 13, "Expected 13 lineage candidates");
assertUnique(lineageIds, "lineage candidateId");
assertUnique(verdictIds, "verdict candidateId");
assert(
  [...lineageIds].sort().join("\n") === [...verdictIds].sort().join("\n"),
  "Lineage/verdict candidate set drift",
);

const lineageById = new Map(
  lineage.reviewCandidates.map((record) => [record.candidateId, record]),
);
const verdictById = new Map(
  independent.verdicts.map((record) => [record.candidateId, record]),
);
const computedCounts = {
  reviewCandidates: independent.verdicts.length,
  pass: independent.verdicts.filter((record) => record.verdict === "pass").length,
  provisional: independent.verdicts.filter(
    (record) => record.verdict === "provisional",
  ).length,
  reject: independent.verdicts.filter((record) => record.verdict === "reject").length,
};
assert(
  JSON.stringify(computedCounts) === JSON.stringify(independent.counts),
  `Verdict counts drift: ${JSON.stringify(computedCounts)}`,
);

for (const verdict of independent.verdicts) {
  const lineageRecord = lineageById.get(verdict.candidateId);
  assert(verdict.path === lineageRecord.reviewCandidate.path, `${verdict.candidateId}: review path drift`);
  assert(
    verdict.sha256 === lineageRecord.reviewCandidate.native.sha256,
    `${verdict.candidateId}: review hash drift`,
  );
  assert(
    verdict.sha256 === sha256File(resolve(repoRoot, verdict.path)),
    `${verdict.candidateId}: candidate file hash drift`,
  );
}

assert(
  accessibility.provenance.lineage.sha256 === sha256File(lineagePath),
  "Accessibility lineage provenance drift",
);
assert(
  accessibility.provenance.independentReview.sha256 === sha256File(independentPath),
  "Accessibility independent-review provenance drift",
);
assert(
  accessibility.tools.length === 6 && accessibility.scenes.length === 7,
  "Accessibility draft must contain six tools and seven scenes",
);

for (const record of [...accessibility.tools, ...accessibility.scenes]) {
  const lineageRecord = lineageById.get(record.candidateId);
  assert(lineageRecord, `${record.candidateId}: missing lineage record`);
  bindingMatches(record.imageBinding, lineageRecord, record.candidateId);
  assert(
    record.visualReview.verdict === verdictById.get(record.candidateId).verdict,
    `${record.candidateId}: accessibility verdict drift`,
  );
}

for (const tool of accessibility.tools) {
  assert(tool.usageScope === "undecided", `${tool.candidateId}: premature usage decision`);
  assert(
    !tool.neutralPreAnswer.description
      .toLowerCase()
      .includes(tool.fullPostAnswer.canonicalTerm.toLowerCase()),
    `${tool.candidateId}: canonical term leaked into neutral copy`,
  );
  assert(
    tool.nonvisualEquivalent.status === "draft-unlinked" &&
      tool.nonvisualEquivalent.itemId === null,
    `${tool.candidateId}: nonvisual route must remain unlinked draft`,
  );
  assert(
    tool.visualReview.verdict === "pass"
      ? tool.fullPostAnswer.status === "draft; visual gate passed"
      : tool.fullPostAnswer.status.startsWith("blocked"),
    `${tool.candidateId}: full-description status does not match visual verdict`,
  );
}

assert(regions.scenes.length === 7, "Expected seven scene region records");
const accessibilitySceneById = new Map(
  accessibility.scenes.map((record) => [record.candidateId, record]),
);
for (const region of regions.scenes) {
  const scene = accessibilitySceneById.get(region.candidateId);
  assert(scene, `${region.candidateId}: missing accessibility scene`);
  bindingMatches(region.imageBinding, lineageById.get(region.candidateId), region.candidateId);
  assert(
    region.imageBinding.candidateSha256 === scene.imageBinding.candidateSha256,
    `${region.candidateId}: accessibility/region hash drift`,
  );
  const targetIds = region.targetRegions.map((record) => record.inventoryId).sort();
  const expectedTargetIds = scene.fullPostAnswer.targets
    .map((record) => record.inventoryId)
    .sort();
  const decoyIds = region.decoyRegions.map((record) => record.inventoryId).sort();
  const expectedDecoyIds = scene.fullPostAnswer.decoys
    .map((record) => record.inventoryId)
    .sort();
  assert(
    targetIds.join("\n") === expectedTargetIds.join("\n"),
    `${region.candidateId}: target inventory drift`,
  );
  assert(
    decoyIds.join("\n") === expectedDecoyIds.join("\n"),
    `${region.candidateId}: decoy inventory drift`,
  );
  for (const record of [...region.targetRegions, ...region.decoyRegions]) {
    for (const polygon of record.polygons) {
      assert(
        polygon.length >= 3 &&
          polygon.every(
            ([x, y]) =>
              Number.isFinite(x) &&
              Number.isFinite(y) &&
              x >= 0 &&
              x <= 1 &&
              y >= 0 &&
              y <= 1,
          ),
        `${region.candidateId}/${record.inventoryId}: invalid normalized polygon`,
      );
    }
  }
  assert(
    region.reviewOverlaySha256 === sha256File(resolve(repoRoot, region.reviewOverlay)),
    `${region.candidateId}: overlay hash drift`,
  );
  assert(
    region.phoneReviewOverlay.sha256 ===
      sha256File(resolve(repoRoot, region.phoneReviewOverlay.path)),
    `${region.candidateId}: phone overlay hash drift`,
  );
  assert(
    Object.values(region.validation).every((value) => value === "pass"),
    `${region.candidateId}: stored region validation is not all pass`,
  );
}

assert(
  regions.provenance.lineage.sha256 === sha256File(lineagePath) &&
    regions.provenance.independentReview.sha256 === sha256File(independentPath),
  "Region provenance drift",
);
assert(
  regions.contactSheet.sha256 ===
    sha256File(resolve(repoRoot, regions.contactSheet.path)),
  "Region contact-sheet hash drift",
);

console.log(
  `Validated ${computedCounts.reviewCandidates} candidates (${computedCounts.pass} pass, ${computedCounts.provisional} provisional, ${computedCounts.reject} reject), 13 accessibility records, and 7 scene region records.`,
);
