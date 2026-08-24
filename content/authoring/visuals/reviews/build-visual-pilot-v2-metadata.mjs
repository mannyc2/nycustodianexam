import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const briefPath = resolve(
  repoRoot,
  "content/authoring/visuals/briefs/visual-pilot-v2.json",
);
const lineagePath = resolve(
  repoRoot,
  "content/authoring/visuals/reviews/visual-pilot-v2/lineage.json",
);
const reviewPath = resolve(
  repoRoot,
  "content/authoring/visuals/reviews/visual-pilot-v2/independent-review.json",
);
const reviewRoot = resolve(
  repoRoot,
  "content/authoring/visuals/reviews/visual-pilot-v2",
);
const overlayRoot = resolve(reviewRoot, "regions", "overlays");
const phoneOverlayRoot = resolve(reviewRoot, "regions", "phone");

const brief = JSON.parse(readFileSync(briefPath, "utf8"));
const lineage = JSON.parse(readFileSync(lineagePath, "utf8"));
const independentReview = JSON.parse(readFileSync(reviewPath, "utf8"));
const lineageById = new Map(
  lineage.reviewCandidates.map((record) => [record.candidateId, record]),
);
const verdictById = new Map(
  independentReview.verdicts.map((record) => [record.candidateId, record]),
);
const sourceById = new Map(brief.sourceCatalog.map((source) => [source.id, source]));

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")}\n${result.stderr || result.stdout}`);
  }
}

function candidateBinding(candidateId) {
  const record = lineageById.get(candidateId);
  if (!record) throw new Error(`Missing lineage record: ${candidateId}`);
  const { path, native } = record.reviewCandidate;
  const absolutePath = resolve(repoRoot, path);
  if (!existsSync(absolutePath)) throw new Error(`Missing candidate: ${path}`);
  const actualSha256 = sha256File(absolutePath);
  if (actualSha256 !== native.sha256) {
    throw new Error(
      `Hash drift for ${candidateId}: lineage=${native.sha256} actual=${actualSha256}`,
    );
  }
  return {
    path,
    candidateSha256: actualSha256,
    width: native.width,
    height: native.height,
    mode: native.mode,
  };
}

function visualReview(candidateId) {
  const verdict = verdictById.get(candidateId);
  if (!verdict) throw new Error(`Missing independent verdict: ${candidateId}`);
  return {
    verdict: verdict.verdict,
    reason: verdict.reason,
    gate:
      verdict.verdict === "pass"
        ? "visual gate passed; metadata and usage decisions remain draft"
        : verdict.promotionGate ?? "blocked from promotion",
  };
}

const toolCopy = {
  v2t001: {
    neutral:
      "A single metal object in strict side view. A long straight handle extends right from an open head at left. The head has two smooth flat opposing faces, and a ridged rotating cylinder sits directly beneath the lower movable member.",
    full:
      "An adjustable wrench in side profile. Its fixed and movable jaws have smooth parallel faces, and the worm gear beneath the movable jaw changes the opening. Unlike a pipe wrench, it has no curved hook jaw or serrated gripping teeth.",
    decisiveFeatures: [
      "fixed and movable smooth parallel gripping faces",
      "worm gear beneath the movable jaw",
      "complete straight handle",
    ],
    contrast: [
      "A pipe wrench uses serrated hook-and-heel jaws rather than smooth parallel jaws.",
    ],
    stem:
      "Which tool has one fixed jaw and one movable smooth jaw adjusted by a worm screw, rather than serrated hook-and-heel jaws?",
  },
  v2t002: {
    neutral:
      "A heavy straight handle extends right from an open C-shaped head. Both opposing inner faces carry coarse teeth. A short threaded shank emerges behind the upper head, passes through one crosshatched rotating cylinder, and ends in a rounded tip.",
    full:
      "A pipe wrench in strict side profile. Its curved serrated hook jaw enters the opaque body on the same plausible axis as its threaded shank, which emerges through one knurled adjustment nut and ends in a short rounded threaded tip. The opaque body naturally hides the middle of that connection. The curved hook jaw and serrated heel jaw distinguish it from an adjustable wrench's smooth parallel jaws.",
    decisiveFeatures: [
      "curved offset serrated hook jaw",
      "opposing serrated heel jaw",
      "one threaded hook-jaw shank passes through one knurled adjustment nut, with a valid short rounded end beyond the nut",
    ],
    contrast: [
      "An adjustable wrench uses smooth parallel jaws and a worm gear beneath its movable jaw.",
    ],
    stem:
      "Which tool uses a curved serrated hook jaw opposite a serrated heel jaw and a knurled adjustment nut?",
  },
  v2t003: {
    neutral:
      "A long plain handle joins a bell-shaped flexible cup viewed from below. The broad circular rim is continuous, and the cup center is open with no narrower projection.",
    full:
      "A cup plunger viewed from beneath. Its simple rubber cup has one uninterrupted rim and no projecting lower flange, distinguishing it from a flange toilet plunger.",
    decisiveFeatures: [
      "single uninterrupted open cup rim",
      "empty cup center",
      "no projecting lower flange",
    ],
    contrast: [
      "A flange toilet plunger has a narrower flexible sleeve projecting below the outer cup.",
    ],
    stem:
      "Which plunger has a simple open cup with no narrower sleeve projecting beneath its outer rim?",
  },
  v2t004: {
    neutral:
      "A long plain handle joins a broad bell-shaped flexible cup viewed from below. A second narrower hollow sleeve projects from the center below the outer rim.",
    full:
      "A flange toilet plunger viewed from beneath. The narrower flange extending below the outer cup helps distinguish it from a plain cup plunger.",
    decisiveFeatures: [
      "broad outer cup",
      "narrower hollow flexible flange projecting below the cup",
      "complete handle",
    ],
    contrast: [
      "A plain cup plunger has one open cup rim without a projecting lower sleeve.",
    ],
    stem:
      "Which plunger has a narrower flexible flange projecting beneath the center of its outer cup?",
  },
  v2t005: {
    neutral:
      "Two curved handles open to the right while short serrated opposing jaws open to the left. The crossing joint contains one short oblong slot, with one round fastener at its left end and visibly empty slot length to the right.",
    full:
      "Slip-joint pliers shown face-on. One pivot pin can occupy positions along a short oblong slot to change the jaw opening. Unlike tongue-and-groove pliers, this joint does not use a long row of adjustment grooves.",
    decisiveFeatures: [
      "short ordinary serrated opposing jaws",
      "one pivot pin seated in one continuous short oblong slot",
      "empty alternate slot length beside the seated pin",
    ],
    contrast: [
      "Tongue-and-groove pliers use offset curved jaws and a row of several adjustment grooves.",
    ],
    stem:
      "Which pliers use one pivot moving in a short oblong slot rather than a row of several grooves?",
  },
  v2t006: {
    neutral:
      "Two long handles open to the right while offset curved serrated jaws open to the left. A round pin sits beside a row of more than five scalloped adjustment recesses.",
    full:
      "Tongue-and-groove pliers shown face-on. Their pivot can seat in a row of grooves, moving the offset curved jaws through a broad range. Slip-joint pliers instead have a short oblong adjustment slot.",
    decisiveFeatures: [
      "offset curved serrated jaws",
      "row of more than five adjustment grooves",
      "one pivot seated in the grooved channel",
    ],
    contrast: [
      "Slip-joint pliers use a short oblong slot instead of a row of several grooves.",
    ],
    stem:
      "Which pliers have offset curved jaws and a pivot that can move through a row of several adjustment grooves?",
  },
};

const tools = brief.toolCandidates.map((briefRecord) => {
  const copy = toolCopy[briefRecord.candidateId];
  if (!copy) throw new Error(`Missing tool accessibility copy: ${briefRecord.candidateId}`);
  const review = visualReview(briefRecord.candidateId);
  return {
    candidateId: briefRecord.candidateId,
    conceptId: briefRecord.conceptId,
    viewId: briefRecord.viewId,
    imageBinding: candidateBinding(briefRecord.candidateId),
    visualReview: review,
    usageScope: "undecided",
    neutralPreAnswer: {
      description: copy.neutral,
      policy:
        "Describes only visible geometry and orientation; does not state the canonical term or answer option.",
    },
    fullPostAnswer: {
      status:
        review.verdict === "pass"
          ? "draft; visual gate passed"
          : "blocked with candidate; concept copy retained only for repair review",
      canonicalTerm: briefRecord.canonicalTerm,
      description: copy.full,
      decisiveFeatures: copy.decisiveFeatures,
      confusableContrast: copy.contrast,
    },
    nonvisualEquivalent: {
      status: "draft-unlinked",
      itemId: null,
      preAnswerStem: copy.stem,
      constructNotice:
        "This text item tests the same feature distinction but is not the same visual-recognition task.",
    },
    publication:
      "Authoring draft. If used for scoring, keep canonical terms and decisive-feature explanations out of the active accessibility tree until commitment.",
  };
});

const sceneDrafts = [
  {
    candidateId: "v2s001",
    claim:
      "An authored transferred workplace chemical in a working container must be identified under the hazard-communication program; the exact chemical is not inferred from appearance.",
    overview:
      "A custodial closet with open shelving, stored containers and cloths, a wall-held mop, a service sink, an open door, and tiled floor.",
    zones: [
      ["left shelving", "A lidded bin and folded cloths sit above a trigger bottle; capped jugs in shallow trays and other containers sit below."],
      ["center wall and sink", "A long-handled mop is clipped vertically beside an empty wall-mounted sink."],
      ["right doorway", "An open door leads to an empty adjoining area."],
      ["floor", "The tiled walking surface has no visible liquid or stored object."],
    ],
    targets: [
      {
        inventoryId: "target-1",
        zone: "left shelving",
        zoneOrder: 1,
        condition:
          "blank trigger-spray bottle visibly containing liquid, authored as a transferred workplace chemical container",
        correction:
          "identify the working container according to the hazard-communication program",
        sourceIds: ["OSHA_HAZCOM"],
      },
    ],
    decoys: [
      {
        inventoryId: "decoy-1",
        zone: "left shelving",
        zoneOrder: 1,
        condition:
          "capped jugs with hatched front identification panels, upright in individual containment trays",
        safeBecause:
          "they are closed, upright, contained, and visually distinguished from the blank working container; exact contents are not inferred",
        sourceIds: ["OSHA_HAZCOM"],
      },
    ],
    safeBackground: [
      ["safe-1", "left shelving", 1, "folded cloths and a lidded bin"],
      ["safe-2", "center wall and sink", 2, "mop clipped in a wall rack and an empty service sink"],
      ["safe-3", "floor", 4, "dry clear floor and doorway"],
    ],
  },
  {
    candidateId: "v2s002",
    claim:
      "Poisonous or toxic materials must be stored so they cannot contaminate food-contact articles, including not directly above them.",
    overview:
      "A tiled kitchen storeroom with two open metal racks, closed handled bottles, uncovered bowls and utensils, inverted pans, and a closed door.",
    zones: [
      ["left upper shelf", "Closed handled bottles with diagonally hatched front panels sit on the upper shelf."],
      ["left middle shelf", "Uncovered mixing bowls and utensils sit directly below the bottles."],
      ["center", "A closed door and open tiled floor occupy the center."],
      ["right rack", "Inverted pans sit on three shelves."],
    ],
    targets: [
      {
        inventoryId: "target-1",
        zone: "left upper and middle shelves",
        zoneOrder: [1, 2],
        condition:
          "cleaning-supply bottles stored directly above uncovered bowls and preparation utensils",
        correction:
          "store the chemicals separately from and below or otherwise protected away from food-contact articles",
        sourceIds: ["FDA_FOOD"],
      },
    ],
    decoys: [
      {
        inventoryId: "decoy-1",
        zone: "right rack",
        zoneOrder: 4,
        condition: "pans stored inverted on a separate rack",
        safeBecause: "they are protected and away from the bottle storage",
        sourceIds: ["FDA_FOOD"],
      },
    ],
    safeBackground: [
      ["safe-1", "left shelving", 1, "stable open metal shelving"],
      ["safe-2", "center", 3, "clean tiled wall and closed door"],
      ["safe-3", "center", 3, "floor without visible spill"],
    ],
  },
  {
    candidateId: "v2s003",
    claim:
      "Zero-hazard control: the ladder, wall-side electrical lead, guarded fan, aisle, cabinets, and doorway are safe as visibly depicted.",
    overview:
      "A classroom with desks and chairs, an open doorway, a writing board, cabinets, a portable fan, an open stepladder, and a wall-edge electrical lead.",
    zones: [
      ["left teacher wall", "An open doorway and a writing board occupy the left wall."],
      ["desks and aisle", "Orderly desk rows border a broad central floor area."],
      ["cabinet and fan", "Closed cabinets and a fan with a concentric grille sit along the rear wall."],
      ["right wall", "An open ladder, wall receptacle, short cord lead, and floor-level protector run along the baseboard."],
    ],
    targets: [],
    decoys: [
      {
        inventoryId: "decoy-1",
        zone: "right wall",
        zoneOrder: 4,
        condition:
          "stepladder fully open with all feet on level floor, visible braces extended, unused, and well away from the doorway",
        safeBecause: "it is stable, correctly opened, unused, and outside the doorway route",
        sourceIds: ["OSHA_LADDER", "OSHA_FLOOR"],
      },
      {
        inventoryId: "decoy-2",
        zone: "right wall",
        zoneOrder: 4,
        condition:
          "intact lead descending beside the wall, with its floor-level run beneath a low-profile protector outside the aisle",
        safeBecause:
          "the visible floor-level portion is protected and stays at the wall edge; the pixels do not claim the short wall-side lead is covered",
        sourceIds: ["OSHA_ELEC", "OSHA_FLOOR"],
      },
      {
        inventoryId: "decoy-3",
        zone: "cabinet and fan",
        zoneOrder: 3,
        condition: "fan blades enclosed by a complete close-spaced guard",
        safeBecause: "the blades are visibly guarded",
        sourceIds: [],
      },
    ],
    safeBackground: [
      ["safe-1", "desks and aisle", 2, "orderly chairs and desks with a clear aisle shown without liquid"],
      ["safe-2", "cabinet and fan", 3, "closed cabinet"],
      ["safe-3", "left teacher wall", 1, "unobstructed doorway"],
    ],
  },
  {
    candidateId: "v2s004",
    claim:
      "A raised hose spanning a walking lane is a visible obstruction that should be removed, rerouted, or secured.",
    overview:
      "A gym-side floor area with a wheeled canister machine by the left wall, stacked mats above it, a closed door, and an attached ribbed hose ending in a floor nozzle.",
    zones: [
      ["left wall equipment", "A canister machine stands below stacked mats."],
      ["central floor", "The attached hose bends outward across the floor."],
      ["rear wall", "A closed door and open wall-side route occupy the rear."],
      ["right court", "The hose continues to its nozzle near a court line."],
    ],
    targets: [
      {
        inventoryId: "target-1",
        zone: "central floor and right court",
        zoneOrder: [2, 4],
        condition:
          "thick ribbed hose spanning the walking lane with a raised section and visible floor beneath it",
        correction: "remove, reroute, or secure the hose so the walking route is clear",
        sourceIds: ["OSHA_FLOOR"],
      },
    ],
    decoys: [
      {
        inventoryId: "decoy-1",
        zone: "left wall equipment",
        zoneOrder: 1,
        condition: "canister machine upright and parked against the wall outside the route",
        safeBecause:
          "the body is outside the walking route; no visually unprovable caster-brake state is claimed",
        sourceIds: ["OSHA_FLOOR"],
      },
    ],
    safeBackground: [
      ["safe-1", "left wall equipment", 1, "mats stacked flat"],
      ["safe-2", "rear wall", 3, "closed door"],
      ["safe-3", "central floor", 2, "floor without visible liquid"],
    ],
  },
  {
    candidateId: "v2s005",
    claim:
      "Poisonous or toxic materials must be stored so they cannot contaminate single-use articles.",
    overview:
      "A cafeteria back counter with an empty sink, cabinets, an open counter-top tote holding stacked cups and a trigger bottle, and a capped handled jug in a lower compartment.",
    zones: [
      ["left sink", "An empty basin and clear counter occupy the left side."],
      ["center tote", "Uncovered cups and a closed trigger bottle stand side by side in one tote."],
      ["lower storage", "A capped handled jug stands upright in a shallow tray inside the open compartment."],
      ["right counter", "Empty serving wells, closed cabinet doors, and tiled floor occupy the right side."],
    ],
    targets: [
      {
        inventoryId: "target-1",
        zone: "center tote",
        zoneOrder: 2,
        condition:
          "identified cleaning spray bottle stored in the same open tote as uncovered disposable cups",
        correction: "physically separate chemical storage from single-use articles",
        sourceIds: ["FDA_FOOD"],
      },
    ],
    decoys: [
      {
        inventoryId: "decoy-1",
        zone: "lower storage",
        zoneOrder: 3,
        condition:
          "separate jug capped, identified by a hatched panel, upright, and contained in a shallow tray",
        safeBecause: "it is physically separated from the cups",
        sourceIds: ["FDA_FOOD"],
      },
    ],
    safeBackground: [
      ["safe-1", "left sink", 1, "empty sink and clear counter"],
      ["safe-2", "right counter", 4, "floor without visible liquid"],
      ["safe-3", "right counter", 4, "remaining cabinet doors closed"],
    ],
  },
  {
    candidateId: "v2s006",
    claim:
      "Cord-and-plug equipment with damage that may expose a worker to injury must be removed from service until repaired and tested.",
    overview:
      "A low wall-side view shows a portable floor fan at left, one power cord running along the wall edge to a connected plug and receptacle at right, and broad tiled floor in front.",
    zones: [
      ["left fan", "A portable fan stands on two feet with a complete concentric front grille."],
      ["center cord run", "One thick cord follows the wall edge from the fan toward the receptacle."],
      ["right plug and receptacle", "The plug is connected to the lower socket of a wall receptacle."],
      ["foreground floor", "A broad tiled walking surface fills the foreground."],
    ],
    targets: [
      {
        inventoryId: "target-1",
        zone: "center cord run",
        zoneOrder: 2,
        condition:
          "one outer-jacket split a short distance from the fan housing along the wall-edge cord run, exposing exactly two separate fully insulated inner conductors while the cord remains plugged in",
        correction:
          "disconnect and remove the damaged fan from service for proper repair and testing",
        sourceIds: ["OSHA_ELEC"],
      },
    ],
    decoys: [
      {
        inventoryId: "decoy-1",
        zone: "left fan",
        zoneOrder: 1,
        condition: "fan blades enclosed by a complete close-spaced guard",
        safeBecause: "the guard is intact; the authored hazard is the damaged cord",
        sourceIds: [],
      },
    ],
    safeBackground: [
      ["safe-1", "foreground floor", 4, "dry floor without stored objects"],
      ["safe-2", "center cord run", 2, "cord route kept at the wall edge outside the walking path"],
      ["safe-3", "right plug and receptacle", 3, "plug seated in an intact-looking receptacle"],
    ],
  },
  {
    candidateId: "v2s007",
    claim:
      "Zero-hazard control: the palletized cartons, bracketed hand truck, doorway approach, cabinet, and floor are safe as visibly depicted.",
    overview:
      "A service/loading room contains sealed cartons on a pallet, a closed door, a low cabinet, an upright hand truck at the right wall, and broad open floor.",
    zones: [
      ["left pallet load", "Aligned sealed cartons form three low rows on a pallet."],
      ["center door", "A closed service door has open floor in front."],
      ["right cabinet and foreground", "A closed low cabinet borders broad open floor."],
      ["right wall", "An empty hand truck is held upright against the wall."],
    ],
    targets: [],
    decoys: [
      {
        inventoryId: "decoy-1",
        zone: "left pallet load",
        zoneOrder: 1,
        condition:
          "cartons squarely aligned without visible lean or overhang and supported by an intact pallet",
        safeBecause: "the load is low, stable-looking, and fully supported",
        sourceIds: ["NIOSH_MMH"],
      },
      {
        inventoryId: "decoy-2",
        zone: "right wall",
        zoneOrder: 4,
        condition: "empty hand truck held upright by a visible wall bracket outside the route",
        safeBecause: "it is secured upright and outside the walking route",
        sourceIds: ["NIOSH_MMH", "OSHA_FLOOR"],
      },
      {
        inventoryId: "decoy-3",
        zone: "center door",
        zoneOrder: 2,
        condition: "closed service door with a broad unobstructed approach",
        safeBecause: "the approach and doorway are clear",
        sourceIds: ["OSHA_EGRESS"],
      },
    ],
    safeBackground: [
      ["safe-1", "right cabinet and foreground", 3, "level floor without visible liquid, debris, or cord"],
      ["safe-2", "right cabinet and foreground", 3, "closed low cabinet"],
    ],
  },
];

function sceneBrief(candidateId) {
  const record = brief.sceneCandidates.find(
    (candidate) => candidate.candidateId === candidateId,
  );
  if (!record) throw new Error(`Missing scene brief: ${candidateId}`);
  return record;
}

function safeRecord([inventoryId, zone, zoneOrder, condition]) {
  return { inventoryId, zone, zoneOrder, condition, sourceIds: [] };
}

function nonvisualStatements(scene) {
  return [
    ...scene.targets.map((target) => ({
      inventoryId: target.inventoryId,
      zone: target.zone,
      zoneOrder: target.zoneOrder,
      role: "target",
      statement: `${target.condition}; correction: ${target.correction}.`,
    })),
    ...scene.decoys.map((decoy) => ({
      inventoryId: decoy.inventoryId,
      zone: decoy.zone,
      zoneOrder: decoy.zoneOrder,
      role: "decoy",
      statement: `${decoy.condition}; safe because ${decoy.safeBecause}.`,
    })),
    ...scene.safeBackground.map((safe) => ({
      inventoryId: safe.inventoryId,
      zone: safe.zone,
      zoneOrder: safe.zoneOrder,
      role: "safe-background",
      statement: safe.condition,
    })),
  ];
}

const scenes = sceneDrafts.map((draft) => {
  const briefRecord = sceneBrief(draft.candidateId);
  const safeBackground = draft.safeBackground.map(safeRecord);
  const sourceIds = [
    ...new Set([
      ...draft.targets.flatMap((record) => record.sourceIds),
      ...draft.decoys.flatMap((record) => record.sourceIds),
    ]),
  ];
  const normalized = { ...draft, safeBackground };
  return {
    candidateId: draft.candidateId,
    sceneId: briefRecord.sceneId,
    imageBinding: candidateBinding(draft.candidateId),
    visualReview: visualReview(draft.candidateId),
    neutralPreAnswer: {
      overview: draft.overview,
      zones: draft.zones.map(([label, description], index) => ({
        order: index + 1,
        label,
        description,
      })),
      policy:
        "Does not state target or decoy counts, identify the answer, or use hazard-emphasizing language.",
    },
    fullPostAnswer: {
      claim: draft.claim,
      targets: draft.targets,
      decoys: draft.decoys,
      safeBackground,
      sources: sourceIds.map((id) => {
        const source = sourceById.get(id);
        if (!source) throw new Error(`Missing source ${id}`);
        return source;
      }),
    },
    nonvisualZonedEquivalent: {
      constructNotice:
        "This is an equivalent knowledge task, not the same visual-recognition task.",
      statements: nonvisualStatements(normalized),
    },
    publication:
      "Authoring draft. Keep full descriptions, source explanations, target/decoy roles, and regions out of the active accessibility tree until commitment.",
  };
});

const accessibility = {
  packageId: "visual-pilot-v2-accessibility-draft",
  date: brief.date,
  status:
    "hash-bound authoring draft; visual pass does not authorize scored use or promotion",
  provenance: {
    lineage: {
      path: "content/authoring/visuals/reviews/visual-pilot-v2/lineage.json",
      sha256: sha256File(lineagePath),
    },
    independentReview: {
      path: "content/authoring/visuals/reviews/visual-pilot-v2/independent-review.json",
      sha256: sha256File(reviewPath),
    },
    visualPolicy: brief.visualPolicyRevision,
    taxonomy: brief.taxonomyRevision,
  },
  toolPolicy: {
    completeImageInteraction:
      "Tool identification uses the complete image and ordinary answer controls; no feature hotspots are authored.",
    usageDecision:
      "Choose scored, atlas-only, or post-answer-only per angle. Scored use requires a reviewed neutral description and linked nonvisual item.",
  },
  scenePolicy: {
    regionRelationship:
      "Every target and decoy inventoryId maps to regions-draft.json against the same candidate hash.",
    zeroTarget:
      "Zero-target scenes remain valid through scoring and submission; do not require a click merely because an image is present.",
  },
  tools,
  scenes,
};

const regionDefinitions = {
  v2s001: {
    targetRegions: {
      "target-1": [[0.185, 0.235, 0.26, 0.445]],
    },
    decoyRegions: {
      "decoy-1": [
        [0.04, 0.455, 0.17, 0.73],
        [0.14, 0.455, 0.278, 0.725],
        [0.25, 0.445, 0.39, 0.715],
      ],
    },
  },
  v2s002: {
    targetRegions: {
      "target-1": [
        [0.04, 0.105, 0.435, 0.385],
        [0.035, 0.465, 0.435, 0.69],
      ],
    },
    decoyRegions: {
      "decoy-1": [
        [0.72, 0.195, 0.965, 0.32],
        [0.72, 0.37, 0.975, 0.5],
        [0.72, 0.545, 0.985, 0.715],
      ],
    },
  },
  v2s003: {
    targetRegions: {},
    decoyRegions: {
      "decoy-1": [[0.65, 0.22, 0.925, 0.845]],
      "decoy-2": [
        [0.805, 0.625, 0.975, 0.76],
        [0.805, 0.71, 0.998, 0.8],
      ],
      "decoy-3": [[0.565, 0.25, 0.7, 0.455]],
    },
  },
  v2s004: {
    targetRegions: {
      "target-1": [
        [0.195, 0.49, 0.355, 0.73],
        [0.325, 0.49, 0.72, 0.735],
        [0.69, 0.58, 0.985, 0.825],
      ],
    },
    decoyRegions: {
      "decoy-1": [[0.025, 0.35, 0.19, 0.785]],
    },
  },
  v2s005: {
    targetRegions: {
      "target-1": [[0.28, 0.12, 0.495, 0.455]],
    },
    decoyRegions: {
      "decoy-1": [[0.315, 0.54, 0.455, 0.845]],
    },
  },
  v2s006: {
    targetRegions: {
      "target-1": [[0.495, 0.52, 0.69, 0.67]],
    },
    decoyRegions: {
      "decoy-1": [[0.015, 0.12, 0.325, 0.69]],
    },
  },
  v2s007: {
    targetRegions: {},
    decoyRegions: {
      "decoy-1": [[0.025, 0.345, 0.34, 0.76]],
      "decoy-2": [[0.835, 0.105, 0.995, 0.77]],
      "decoy-3": [
        [0.375, 0.08, 0.6, 0.595],
        [0.35, 0.59, 0.65, 0.97],
      ],
    },
  },
};

function rectanglePolygon([x0, y0, x1, y1]) {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

function regionRecords(definition) {
  return Object.entries(definition).map(([inventoryId, rectangles]) => ({
    inventoryId,
    polygons: rectangles.map(rectanglePolygon),
  }));
}

function polygonBounds(polygon) {
  const xs = polygon.map(([x]) => x);
  const ys = polygon.map(([, y]) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function overlaps(a, b) {
  const [ax0, ay0, ax1, ay1] = polygonBounds(a);
  const [bx0, by0, bx1, by1] = polygonBounds(b);
  return ax0 < bx1 && ax1 > bx0 && ay0 < by1 && ay1 > by0;
}

function validateRegions(scene, targetRegions, decoyRegions) {
  const polygons = [...targetRegions, ...decoyRegions].flatMap((record) =>
    record.polygons.map((polygon) => ({ inventoryId: record.inventoryId, polygon })),
  );
  const coordinateBounds = polygons.every(({ polygon }) =>
    polygon.every(([x, y]) => x >= 0 && x <= 1 && y >= 0 && y <= 1),
  );
  const expectedTargets = scene.fullPostAnswer.targets.map((record) => record.inventoryId);
  const expectedDecoys = scene.fullPostAnswer.decoys.map((record) => record.inventoryId);
  const targetIds = targetRegions.map((record) => record.inventoryId);
  const decoyIds = decoyRegions.map((record) => record.inventoryId);
  const targetCount =
    expectedTargets.length === targetIds.length &&
    expectedTargets.every((id) => targetIds.includes(id));
  const decoyCount =
    expectedDecoys.length === decoyIds.length &&
    expectedDecoys.every((id) => decoyIds.includes(id));
  const targetTargetNonOverlap = targetRegions.every((left, index) =>
    targetRegions.slice(index + 1).every((right) =>
      left.polygons.every((leftPolygon) =>
        right.polygons.every((rightPolygon) => !overlaps(leftPolygon, rightPolygon)),
      ),
    ),
  );
  const targetDecoyNonOverlap = targetRegions.every((target) =>
    decoyRegions.every((decoy) =>
      target.polygons.every((targetPolygon) =>
        decoy.polygons.every((decoyPolygon) => !overlaps(targetPolygon, decoyPolygon)),
      ),
    ),
  );
  const validation = {
    coordinateBounds: coordinateBounds ? "pass" : "fail",
    targetCount: targetCount ? "pass" : "fail",
    decoyCount: decoyCount ? "pass" : "fail",
    targetTargetNonOverlap: targetTargetNonOverlap ? "pass" : "fail",
    targetDecoyNonOverlap: targetDecoyNonOverlap ? "pass" : "fail",
  };
  if (Object.values(validation).includes("fail")) {
    throw new Error(`${scene.candidateId} region validation failed: ${JSON.stringify(validation)}`);
  }
  return validation;
}

const regions = scenes.map((scene) => {
  const definition = regionDefinitions[scene.candidateId];
  if (!definition) throw new Error(`Missing region definition: ${scene.candidateId}`);
  const targetRegions = regionRecords(definition.targetRegions);
  const decoyRegions = regionRecords(definition.decoyRegions);
  return {
    candidateId: scene.candidateId,
    sceneId: scene.sceneId,
    imageBinding: scene.imageBinding,
    logicalPlane: {
      width: 1,
      height: 1,
      origin: "top-left",
      coordinates: "normalized",
    },
    zoneOrder: scene.neutralPreAnswer.zones.map(({ order, label }) => ({
      order,
      label,
    })),
    targetRegions,
    decoyRegions,
    validation: validateRegions(scene, targetRegions, decoyRegions),
    reviewOverlay: `content/authoring/visuals/reviews/visual-pilot-v2/regions/overlays/${scene.candidateId}.png`,
    reviewStatus: "draft; exact-pixel human overlay inspection required",
    publication: "authoring-only; never ship before answer reveal",
  };
});

const regionPackage = {
  packageId: "visual-pilot-v2-regions-draft",
  date: brief.date,
  status:
    "hash-bound authoring draft; normalized rectangles require human overlay review before promotion",
  provenance: accessibility.provenance,
  legend: {
    target: "red overlay",
    decoy: "blue overlay",
    note: "Overlays are review artifacts and are never learner-facing.",
  },
  scenes: regions,
};

mkdirSync(reviewRoot, { recursive: true });
mkdirSync(overlayRoot, { recursive: true });
mkdirSync(phoneOverlayRoot, { recursive: true });

writeFileSync(
  resolve(reviewRoot, "accessibility-draft.json"),
  `${JSON.stringify(accessibility, null, 2)}\n`,
);

regions.forEach((scene, index) => {
  const source = resolve(repoRoot, scene.imageBinding.path);
  const overlay = resolve(overlayRoot, `${scene.candidateId}.png`);
  const filters = [];
  for (const record of scene.targetRegions) {
    for (const polygon of record.polygons) {
      const [x0, y0, x1, y1] = polygonBounds(polygon);
      const x = Math.round(x0 * scene.imageBinding.width);
      const y = Math.round(y0 * scene.imageBinding.height);
      const width = Math.max(1, Math.round((x1 - x0) * scene.imageBinding.width));
      const height = Math.max(1, Math.round((y1 - y0) * scene.imageBinding.height));
      filters.push(`drawbox=x=${x}:y=${y}:w=${width}:h=${height}:color=red@0.18:t=fill`);
      filters.push(`drawbox=x=${x}:y=${y}:w=${width}:h=${height}:color=red@0.95:t=5`);
    }
  }
  for (const record of scene.decoyRegions) {
    for (const polygon of record.polygons) {
      const [x0, y0, x1, y1] = polygonBounds(polygon);
      const x = Math.round(x0 * scene.imageBinding.width);
      const y = Math.round(y0 * scene.imageBinding.height);
      const width = Math.max(1, Math.round((x1 - x0) * scene.imageBinding.width));
      const height = Math.max(1, Math.round((y1 - y0) * scene.imageBinding.height));
      filters.push(`drawbox=x=${x}:y=${y}:w=${width}:h=${height}:color=blue@0.16:t=fill`);
      filters.push(`drawbox=x=${x}:y=${y}:w=${width}:h=${height}:color=blue@0.95:t=5`);
    }
  }
  filters.push("format=rgb24");
  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    source,
    "-vf",
    filters.join(","),
    "-frames:v",
    "1",
    "-threads",
    "1",
    overlay,
  ]);
  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    overlay,
    "-vf",
    "scale=480:320:flags=lanczos,format=rgb24",
    "-frames:v",
    "1",
    "-threads",
    "1",
    resolve(phoneOverlayRoot, `${String(index + 1).padStart(2, "0")}.png`),
  ]);
  scene.reviewOverlaySha256 = sha256File(overlay);
  scene.phoneReviewOverlay = {
    path: `content/authoring/visuals/reviews/visual-pilot-v2/regions/phone/${String(index + 1).padStart(2, "0")}.png`,
    sha256: sha256File(
      resolve(phoneOverlayRoot, `${String(index + 1).padStart(2, "0")}.png`),
    ),
    width: 480,
    height: 320,
  };
});

const contactSheetPath = resolve(reviewRoot, "REGION-OVERLAYS-CONTACT-SHEET.png");
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
  resolve(phoneOverlayRoot, "%02d.png"),
  "-vf",
  "tile=2x4:padding=8:margin=8:color=white",
  "-frames:v",
  "1",
  "-threads",
  "1",
  contactSheetPath,
]);

regionPackage.contactSheet = {
  path: "content/authoring/visuals/reviews/visual-pilot-v2/REGION-OVERLAYS-CONTACT-SHEET.png",
  sha256: sha256File(contactSheetPath),
  order: regions.map((scene) => scene.candidateId),
  review:
    "Exact-pixel authoring inspection completed; maintainer approval remains required.",
};

writeFileSync(
  resolve(reviewRoot, "regions-draft.json"),
  `${JSON.stringify(regionPackage, null, 2)}\n`,
);

console.log(
  `Wrote ${tools.length} tool accessibility drafts, ${scenes.length} scene accessibility drafts, ${regions.length} region drafts, and review overlays.`,
);
