import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const inventoryRoot = "content/authoring/visuals/inventory";
const releaseRoot = "content/authoring/visuals/releases";
const taxonomyArtifact = `${inventoryRoot}/taxonomy-inventory.csv`;
const taxonomyProvenance = `${inventoryRoot}/taxonomy-inventory.provenance.json`;
const expectedTaxonomyArtifactSha256 = "d61197c0b7ed118fb0248cdd94d2be75a6e71120408577a532e85aa0659231cd";

const expectedTaxonomySource = {
  archivePathAtObservation: "research/v2/tool-geometry-audit/recovered-input/research-bundle.zip",
  archiveSha256: "a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06",
  internalMember: "taxonomy-inventory.csv",
  memberSha256: "8a0eb561003f8b7fd6fd164680fdcda2d891118a2ad591ccf0aa1a6fa22560e2",
  memberBytes: 7058,
  observationDate: "2026-08-20",
};

function fail(message) {
  throw new Error(`Visual release invariant failed: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
}

function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function sha256File(path) {
  return sha256Bytes(readFileSync(path));
}

function assertArray(value, count, label) {
  assert(Array.isArray(value), `${label} must be an array`);
  assert(value.length === count, `${label} must contain ${count} records, found ${value.length}`);
}

function assertUnique(values, label) {
  assert(new Set(values).size === values.length, `${label} must be unique`);
}

function assertSameArray(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} differ`);
}

function assertExactObject(actual, expected, label) {
  assertSameArray(Object.entries(actual), Object.entries(expected), label);
}

function validateTaxonomyProvenance(toolInventory) {
  const provenance = readJson(taxonomyProvenance);
  assert(provenance.schemaVersion === 1, "taxonomy provenance schemaVersion must be 1");
  assert(provenance.artifact === taxonomyArtifact, "taxonomy provenance must identify the canonical CSV");
  assert(provenance.artifactSha256 === expectedTaxonomyArtifactSha256, "taxonomy provenance artifact checksum drifted");
  assert(provenance.rowCount === 65, "taxonomy provenance rowCount must be 65");
  assertExactObject(provenance.source, expectedTaxonomySource, "taxonomy source coordinates");

  const artifactPath = resolve(repoRoot, taxonomyArtifact);
  const artifactBytes = readFileSync(artifactPath);
  assert(sha256Bytes(artifactBytes) === expectedTaxonomyArtifactSha256, "canonical taxonomy CSV checksum drifted");
  assert(!artifactBytes.includes(13), "canonical taxonomy CSV must use normalized LF line endings");

  const lines = artifactBytes.toString("utf8").trimEnd().split("\n");
  const expectedHeader = "taxonomyId,canonicalTerm,evidenceTier,visualFamily,confusableIds,currentSourceClass,productionStatus,priorityRank,plannedFirstTrancheClass,observationDate";
  assert(lines[0] === expectedHeader, "canonical taxonomy CSV header drifted");
  assert(lines.length - 1 === provenance.rowCount, `canonical taxonomy CSV must contain ${provenance.rowCount} data rows`);

  const taxonomyIds = lines.slice(1).map((line, index) => {
    const fields = line.split(",");
    assert(fields.length === 10, `canonical taxonomy CSV row ${index + 2} must contain 10 fields`);
    assert(fields.at(-1) === expectedTaxonomySource.observationDate, `canonical taxonomy CSV row ${index + 2} observation date drifted`);
    return fields[0];
  });
  assertUnique(taxonomyIds, "canonical taxonomy IDs");
  assertSameArray(taxonomyIds, toolInventory.map((tool) => tool.id), "canonical taxonomy and maintained tool inventory order");

  const archivePath = resolve(repoRoot, expectedTaxonomySource.archivePathAtObservation);
  if (existsSync(archivePath)) {
    assert(sha256File(archivePath) === expectedTaxonomySource.archiveSha256, "observed source ZIP checksum drifted");
  }
}

export function verifyToolInventory() {
  const tools = readJson(`${inventoryRoot}/tools.json`);
  const comparisons = readJson(`${inventoryRoot}/comparisons.json`);
  assertArray(tools, 65, "tool inventory");
  assertArray(comparisons, 14, "comparison inventory");
  assertUnique(tools.map((tool) => tool.id), "tool inventory IDs");
  assertUnique(comparisons.map((comparison) => comparison.id), "comparison inventory IDs");

  const toolIds = new Set(tools.map((tool) => tool.id));
  for (const tool of tools) {
    assert(!Object.hasOwn(tool, "briefStatus"), `${tool.id} inventory must not own briefStatus`);
    assert(!Object.hasOwn(tool, "productionStatus"), `${tool.id} inventory must not own productionStatus`);
    assert(Array.isArray(tool.requiredMasters) && tool.requiredMasters.length > 0, `${tool.id} must declare requiredMasters`);
    for (const master of tool.requiredMasters) {
      assert(!Object.hasOwn(master, "status"), `${master.id} inventory must not own release status`);
    }
    assert(tool.inventoryBasis?.artifact === taxonomyArtifact, `${tool.id} must reference the canonical taxonomy CSV`);
    assert(tool.inventoryBasis?.provenance === taxonomyProvenance, `${tool.id} must reference taxonomy provenance`);
    assert(tool.inventoryBasis?.observationDate === expectedTaxonomySource.observationDate, `${tool.id} inventory observation date drifted`);
  }

  for (const comparison of comparisons) {
    assert(!Object.hasOwn(comparison, "status"), `${comparison.id} inventory must not own release status`);
    assert(Array.isArray(comparison.memberIds) && comparison.memberIds.length >= 2, `${comparison.id} must declare at least two members`);
    assertUnique(comparison.memberIds, `${comparison.id} member IDs`);
    for (const memberId of comparison.memberIds) {
      assert(toolIds.has(memberId), `${comparison.id} references unknown member ${memberId}`);
    }
  }

  validateTaxonomyProvenance(tools);
  return { tools, comparisons };
}

function artifactsFromRelease(release) {
  assert(release.master && Array.isArray(release.derivatives), "each release must contain one master and a derivatives array");
  return [release.master, ...release.derivatives];
}

function verifyArtifact(artifact) {
  assert(typeof artifact.path === "string" && typeof artifact.sha256 === "string", "artifact path and sha256 are required");
  const absolutePath = resolve(repoRoot, artifact.path);
  assert(absolutePath.startsWith(`${repoRoot}/`), `artifact path escapes repository: ${artifact.path}`);
  assert(existsSync(absolutePath), `artifact is missing: ${artifact.path}`);
  assert(statSync(absolutePath).size === artifact.bytes, `artifact byte count drifted: ${artifact.path}`);
  assert(sha256File(absolutePath) === artifact.sha256, `artifact checksum drifted: ${artifact.path}`);
}

function verifyManifest(path, artifacts) {
  const artifactPaths = artifacts.map((artifact) => artifact.path);
  assertUnique(artifactPaths, `${path} artifact paths`);
  const expected = `${artifacts.map((artifact) => `${artifact.sha256}  ${artifact.path}`).join("\n")}\n`;
  const actual = readFileSync(resolve(repoRoot, path), "utf8");
  assert(actual === expected, `${path} does not exactly project its release records`);
  for (const artifact of artifacts) verifyArtifact(artifact);
  return artifacts.length;
}

function verifyToolRelease() {
  const { tools: inventoryTools, comparisons: inventoryComparisons } = verifyToolInventory();
  const tools = readJson(`${releaseRoot}/tools.json`);
  const comparisons = readJson(`${releaseRoot}/comparisons.json`);
  const history = readJson(`${releaseRoot}/tool-release-history.json`);

  assertArray(tools, 65, "tool releases");
  assertArray(comparisons, 14, "comparison releases");
  assert(history.schemaVersion === 1 && Array.isArray(history.records), "tool release history schema is unsupported");
  assertUnique(tools.map((tool) => tool.conceptId), "tool release concept IDs");
  assertUnique(tools.map((tool) => tool.opaqueAssetId), "tool release opaque IDs");
  assertUnique(comparisons.map((comparison) => comparison.id), "comparison release IDs");
  assertUnique(comparisons.map((comparison) => comparison.opaqueAssetId), "comparison release opaque IDs");
  assertSameArray(tools.map((tool) => tool.conceptId), inventoryTools.map((tool) => tool.id), "tool inventory and release order");
  assertSameArray(comparisons.map((comparison) => comparison.id), inventoryComparisons.map((comparison) => comparison.id), "comparison inventory and release order");

  const toolsById = new Map(tools.map((tool) => [tool.conceptId, tool]));
  tools.forEach((tool, index) => {
    const inventory = inventoryTools[index];
    assert(tool.productionStatus === "accepted", `${tool.conceptId} release must be accepted`);
    assert(tool.canonicalTerm === inventory.canonicalTerm, `${tool.conceptId} canonical term drifted`);
    assert(tool.opaqueAssetId === `t${String(index + 1).padStart(3, "0")}`, `${tool.conceptId} opaque ID drifted`);
  });

  comparisons.forEach((comparison, index) => {
    const inventory = inventoryComparisons[index];
    assert(comparison.status === "accepted", `${comparison.id} release must be accepted`);
    assert(comparison.opaqueAssetId === `p${String(index + 1).padStart(3, "0")}`, `${comparison.id} opaque ID drifted`);
    assertSameArray(comparison.memberIds, inventory.memberIds, `${comparison.id} member order`);
    assert(comparison.decisiveDistinction === inventory.decisiveDistinction, `${comparison.id} decisive distinction drifted`);
    const expectedHashes = comparison.memberIds.map((conceptId) => {
      const member = toolsById.get(conceptId);
      assert(member, `${comparison.id} references unreleased member ${conceptId}`);
      return { conceptId, sha256: member.master.sha256 };
    });
    assertSameArray(comparison.memberMasterHashes, expectedHashes, `${comparison.id} member master hashes`);
  });

  for (const record of history.records) {
    assert(record.status === "superseded-preserved", "historical release records must be superseded-preserved");
  }
  const artifacts = [
    ...tools.flatMap(artifactsFromRelease),
    ...comparisons.flatMap(artifactsFromRelease),
    ...history.records.flatMap((record) => artifactsFromRelease(record.release)),
  ];
  const artifactCount = verifyManifest("content/assets/TOOL-MANIFEST.sha256", artifacts);
  return { toolCount: tools.length, comparisonCount: comparisons.length, artifactCount };
}

function assertSceneCompanion(records, scenes, label) {
  assertArray(records, 18, label);
  assertUnique(records.map((record) => record.sceneId), `${label} scene IDs`);
  assertSameArray(records.map((record) => record.sceneId), scenes.map((scene) => scene.sceneId), `${label} scene order`);
}

function verifySceneRelease() {
  const scenes = readJson(`${releaseRoot}/scenes.json`);
  const regions = readJson(`${releaseRoot}/regions.json`);
  const accessibility = readJson(`${releaseRoot}/accessibility.json`);
  const lineage = readJson(`${releaseRoot}/scene-candidate-lineage.json`);
  const qa = readJson(`${releaseRoot}/scene-qa-ledger.json`);

  assertArray(scenes, 18, "scene releases");
  assertUnique(scenes.map((scene) => scene.sceneId), "scene release IDs");
  assertUnique(scenes.map((scene) => scene.opaqueAssetId), "scene release opaque IDs");
  assertSceneCompanion(regions, scenes, "scene regions");
  assertSceneCompanion(accessibility, scenes, "scene accessibility records");
  assertSceneCompanion(lineage, scenes, "scene lineage records");
  assertSceneCompanion(qa, scenes, "scene QA records");

  scenes.forEach((scene, index) => {
    assert(scene.productionStatus === "accepted", `${scene.sceneId} release must be accepted`);
    assert(scene.independentReviewStatus === "pass", `${scene.sceneId} independent review must pass`);
    assert(scene.opaqueAssetId === `s${String(index + 1).padStart(3, "0")}`, `${scene.sceneId} opaque ID drifted`);
    assert(regions[index].masterSha256 === scene.master.sha256, `${scene.sceneId} region master hash drifted`);
    assert(lineage[index].selectedCandidate.sha256 === scene.master.sha256, `${scene.sceneId} selected candidate hash drifted`);
    assert(qa[index].exactMasterSha256 === scene.master.sha256, `${scene.sceneId} QA master hash drifted`);
    assert(qa[index].overall === "accepted", `${scene.sceneId} QA status must be accepted`);
  });

  const artifacts = scenes.flatMap(artifactsFromRelease);
  const artifactCount = verifyManifest("content/assets/SCENE-MANIFEST.sha256", artifacts);
  return { sceneCount: scenes.length, artifactCount };
}

export function verifyVisualRelease({ scope = "all" } = {}) {
  assert(["all", "tools", "scenes"].includes(scope), `unknown verification scope ${scope}`);
  const result = { artifactCount: 0 };
  if (scope === "all" || scope === "tools") {
    const toolResult = verifyToolRelease();
    result.toolCount = toolResult.toolCount;
    result.comparisonCount = toolResult.comparisonCount;
    result.artifactCount += toolResult.artifactCount;
  }
  if (scope === "all" || scope === "scenes") {
    const sceneResult = verifySceneRelease();
    result.sceneCount = sceneResult.sceneCount;
    result.artifactCount += sceneResult.artifactCount;
  }
  return result;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const scope = process.argv[2] ?? "all";
  const result = verifyVisualRelease({ scope });
  const parts = [];
  if (result.toolCount !== undefined) parts.push(`${result.toolCount} tools`, `${result.comparisonCount} comparisons`);
  if (result.sceneCount !== undefined) parts.push(`${result.sceneCount} scenes`);
  parts.push(`${result.artifactCount} hash-verified artifacts`);
  console.log(`Visual release verified: ${parts.join(", ")}.`);
}
