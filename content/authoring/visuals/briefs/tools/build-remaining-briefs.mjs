import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../../../../..");
const inventoryPath = resolve(repoRoot, "content/authoring/visuals/inventory/tools.json");
const outputPath = resolve(import.meta.dirname, "remaining.json");
const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));

const specs = [
  [1, "tool.scrub-brush", "one rectangular flat handheld block scrub brush", "a low rectangular block; broad flat underside; dense rows of short stiff bristles; simple shallow finger ridges on top", "long handle; raised arched palm handle; soft feather-like fibers; toilet-brush shape", "three-quarter view from slightly above, exposing the bristle rows along two sides"],
  [2, "tool.staple-gun", "one manual hand-operated staple gun", "rectangular staple magazine along the base; hinged upper squeeze lever; rear pivot; short flat staple-driving nose; mechanically plausible lever gap", "electrical cord; heated loop tip; soldering-gun body; caulking plunger rod; loose staples", "clean three-quarter side view with the squeeze lever slightly open"],
  [3, "ppe.protective-gloves", "one matched pair of generic protective cleaning gloves", "two separate gloves arranged as a pair; long gauntlet cuffs; textured palms and fingertips; flexible chemical-cleaning glove form", "hands inside; brand marks; disposable food-service glove shape; medical claims; tears", "palms upward in a tidy overlapping pair, with both cuffs and all fingers complete"],
  [4, "tool.push-broom", "one long-handled push broom", "long straight handle; angled reinforced socket; very wide rectangular broom head; dense straight medium-length bristles; head much wider than it is deep", "small deck-brush head; diagonally cut fan head; mop yarn; detached handle", "three-quarter view showing the full handle and broad face of the head"],
  [5, "tool.angle-broom", "one long-handled angle broom", "long straight handle; narrow fan-shaped synthetic bristle head; bristle ends cut on a strong diagonal for corner access; small collar at the handle", "wide rectangular push-broom head; deck-brush block; round corn-broom binding; mop yarn", "three-quarter side view making the diagonal bristle edge unmistakable"],
  [6, "tool.dust-mop", "one dry dust mop", "long handle; swiveling connector; broad low rectangular frame; thick fluffy fringed dust-mop cover extending around all four edges", "loose wet-mop strings; smooth flat-mop pad; broom bristles; bucket", "slightly elevated three-quarter view showing the wide fringed head and swivel"],
  [7, "tool.wet-mop", "one traditional wet string mop", "long handle; metal or plastic mop clamp; dense bundle of long loose absorbent yarn strands hanging from the clamp", "flat rectangular pad; dust-mop fringe; broom bristles; bucket or wringer", "three-quarter view with the yarn bundle hanging freely and the clamp visible"],
  [8, "tool.flat-mop", "one articulated flat mop", "long handle; swiveling joint; very low rectangular plate; thin washable pad wrapped continuously around the underside and edges", "loose string yarn; fluffy dust fringe; rubber squeegee blade; spray bottle", "slightly elevated three-quarter view revealing the slim plate, pad edge, and swivel"],
  [9, "equipment.mop-bucket-wringer", "one commercial mop bucket with side-press wringer", "deep rectangular bucket; four small swivel casters; wringer mounted securely over one end; tall press lever; perforated wringer basket", "mop; janitor-cart shelves; detached wringer; round household pail", "three-quarter view from slightly above showing the bucket cavity and wringer mechanism"],
  [10, "tool.deck-brush", "one long-handled deck brush", "long straight handle; small deep rectangular scrub block; reinforced top socket; dense short very stiff bristles; head substantially narrower than a push broom", "wide push-broom head; handheld brush; diagonally cut broom head; soft mop fibers", "low three-quarter view showing the compact block, stiff bristles, socket, and full handle"],
  [11, "tool.hand-scrub-brush", "one compact handled hand scrub brush", "short iron-shaped body; raised arched palm grip integrated over the body; dense short stiff bristles under a flat base; pointed front for corners", "long handle; toilet-brush head; flat handleless block brush; soft duster fibers", "three-quarter view from slightly below so the arched grip and bristle bed are both clear"],
  [12, "tool.toilet-bowl-brush", "one toilet bowl brush", "long straight hand grip; narrow shaft; dense rounded radial bristle head that curves around the tip; small splash guard above the head", "flat scrub-brush block; floor-brush head; plunger cup; storage holder", "diagonal side view with the complete rounded bristle head separated visually from the shaft"],
  [13, "tool.duster", "one handheld synthetic or feather duster", "slender handle; one elongated soft fluffy dusting head; many flexible fine fibers tapering toward the tip", "stiff scrub bristles; broom head; cleaning cloth; multiple tools", "diagonal side view showing the complete handle and tapered soft head"],
  [17, "tool.window-strip-washer", "one professional window strip washer", "short hand grip; straight T-bar frame; thick cylindrical fabric sleeve spanning the full crossbar; plush washable texture", "rubber squeegee blade; long floor handle; sponge on a flat plate; water droplets", "three-quarter side view revealing the fabric sleeve thickness and T-bar connection"],
  [18, "equipment.janitor-cart", "one compact commercial janitor cart", "upright push handle; two large rear wheels and two front swivel casters; two molded supply shelves; rear bag frame with one generic waste bag; coherent single chassis", "hand-truck toe plate; flat dolly; loose bottles or tools; person; detached bag", "three-quarter view from the open-shelf side showing wheels, shelves, handle, and bag frame"],
  [19, "equipment.hand-truck", "one two-wheel hand truck", "tall rigid vertical frame; two handles at the top; two large wheels on one axle; broad toe plate projecting forward at the bottom; cross braces", "four-wheel platform; shelves; bag; wheelbarrow tub; carried load", "three-quarter view clearly showing the toe plate, axle, frame, and both handles"],
  [20, "equipment.dolly", "one low four-wheel equipment dolly", "flat rectangular platform; reinforced edge frame; four swivel casters under the corners; very low profile", "upright push handle; hand-truck toe plate; shelves; carried load", "slightly elevated three-quarter view showing all four caster positions and the flat platform"],
  [21, "equipment.vacuum.upright", "one representative corded dry upright vacuum cleaner", "integrated upright handle; tall dry dust bag or slim dry collection body; compact motor housing; wide floor nozzle directly beneath; two rear wheels; one complete power cord looped on hooks with plug visible", "separate canister and hose; wet/dry tank; transparent solution tanks; extractor recovery lid; open cord end", "three-quarter side view showing the direct upright body-to-floor-head relationship"],
  [22, "equipment.vacuum.canister", "one representative dry canister vacuum shown as a continuous assembled system", "small horizontal wheeled canister; one corrugated suction hose connected to its inlet; hose connected to a hand grip; two joined rigid wand tubes; flat dry floor nozzle attached at the far end; every joint visibly closed", "open hose or tube end; wet/dry bucket tank; steam gun; detached nozzles; duplicate accessories; upright bag", "shallow S-shaped three-quarter composition making canister to hose to wand to nozzle fully traceable"],
  [23, "equipment.vacuum.wet-dry", "one representative wet/dry shop vacuum shown as a continuous assembled system", "large cylindrical collection tank on a four-caster base; domed motor head with carry handle; drain cap low on the tank; one corrugated suction hose fully connected from lid inlet to a broad handheld utility nozzle; every end closed", "dry upright bag; carpet-extractor twin tanks; steam wand; detached accessories; open hose end", "three-quarter view from slightly above showing the cylindrical tank, motor head, casters, drain, and complete hose"],
  [24, "equipment.carpet-extractor", "one representative upright walk-behind carpet extractor", "two distinct integrated tanks in the upright body; transparent or outlined recovery-tank lid; wide rectangular extraction head at floor level; long operator handle; two large rear wheels; short visible solution-and-recovery path integrated into the machine", "dry vacuum bag; separate canister hose; circular floor-machine deck; steam gun; open tubing", "operator-side three-quarter view emphasizing the twin-tank body and rectangular extraction head"],
  [28, "equipment.vacuum.ride-on", "one representative compact ride-on industrial vacuum cleaner", "single operator seat; steering wheel; enclosed rear collection body; four wheels; broad rectangular vacuum pickup deck beneath the front; one large central suction duct visibly entering the collection body", "rotating side sweeper brushes; water tanks; trailing floor squeegee; circular burnisher deck; rider", "front three-quarter product view showing seat, steering, pickup deck, wheels, and suction duct"],
  [29, "equipment.snow-blower", "one representative walk-behind two-stage snow blower", "front open auger housing; two visible opposing spiral auger flights; central impeller opening; tall directional discharge chute; engine body; two treaded wheels; full handlebar with controls", "lawn-mower cutting deck; snow; operator; disconnected chute; crawler tracks", "front three-quarter view looking partly into the auger housing while retaining the full machine"],
  [30, "equipment.hedge-trimmer", "one handheld electric hedge trimmer", "rear pistol grip with trigger; forward wraparound support handle; long straight double-sided reciprocating blade; evenly spaced guard teeth and smaller cutter teeth; compact rear power housing", "chainsaw chain and bar; pruning-shear pivot; loose cord; branch; battery branding", "diagonal side view with the full toothed blade separated clearly from both handles"],
  [34, "tool.screwdriver.slotted", "one flat or slotted screwdriver", "single straight shaft; ergonomic handle; one clearly visible flat blade tip with a straight rectangular edge; mechanically plausible ferrule", "cross-shaped Phillips tip; chisel head; interchangeable bits; screw", "diagonal three-quarter view with the flat tip closest to the viewer and large enough to inspect"],
  [35, "tool.screwdriver.phillips", "one Phillips screwdriver", "single straight shaft; ergonomic handle; one clearly visible cross-shaped cruciform tip with four tapered flutes", "flat slotted blade; Torx or hex tip; interchangeable bits; screw", "diagonal three-quarter view with the cruciform tip closest to the viewer and large enough to inspect"],
  [38, "tool.wrench.fixed", "one fixed combination wrench", "one open-ended fixed jaw at one end; one closed box end at the other; straight forged handle; both ends aligned and complete", "movable jaw; worm gear; serrated pipe-wrench teeth; ratchet mechanism; size markings", "slightly elevated three-quarter side view showing both fixed ends clearly"],
  [41, "tool.pliers.needle-nose", "one pair of needle-nose pliers", "two very long narrow tapered jaws meeting at a fine point; shallow gripping serrations; central pivot; two curved insulated-style handles", "short diagonal cutter head; locking lever; tongue-and-groove channels; wire", "three-quarter side view with jaws slightly open and their full taper visible"],
  [42, "tool.pliers.diagonal-cutting", "one pair of diagonal cutting pliers", "short robust opposing jaws; clearly visible angled cutting edges meeting across the head; central pivot; two curved handles", "long pointed gripping jaws; flat gripping pads; locking screw; wire", "close three-quarter side view with jaws slightly open so both diagonal cutters are visible"],
  [43, "tool.pliers.locking", "one pair of locking pliers", "curved serrated gripping jaws; over-center compound linkage; release lever inside one handle; knurled adjustment screw at the end of the opposite handle", "ordinary simple plier pivot; clamp frame; pipe-wrench hook jaw; loose bolt", "three-quarter side view with the jaws slightly open and the full locking linkage visible"],
  [44, "tool.clamp.c", "one C-clamp", "heavy C-shaped frame; fixed anvil pad; threaded screw spindle; swivel pressure pad; sliding T-handle; open throat", "long bar rail; plier handles; vise base; workpiece", "three-quarter view with the spindle partially open and all contact pads visible"],
  [45, "tool.clamp.bar", "one bar clamp", "long straight metal bar; fixed jaw at one end; sliding movable jaw; two opposing flat pads; screw handle on the movable jaw", "C-shaped frame; plier linkage; workpiece; multiple clamps", "long three-quarter side view fitting the complete rail and both jaws inside the canvas"],
  [46, "tool.hand-plane", "one traditional metal bench hand plane", "flat sole; cast body; front round knob; rear curved tote handle; central frog and cap iron; blade mouth in the sole", "saw teeth; powered cord; sanding pad; loose wood shavings; brand name", "low three-quarter side view showing the sole line, knob, tote, and cutter assembly"],
  [47, "tool.saw.crosscut", "one traditional crosscut hand saw", "closed hand grip; broad tapering blade; a fully visible cutting edge with many fine alternating bevel teeth shaped like small knife points for cutting across grain; tooth tips and alternating bevel rhythm large enough to inspect", "coarse square chisel-like rip teeth; hacksaw frame; circular saw; tooth-detail inset or callout; wood", "strict side view, blade horizontal, with the entire toothed edge prominent and uncropped"],
  [48, "tool.saw.rip", "one traditional rip hand saw", "closed hand grip; broad tapering blade; a fully visible cutting edge with fewer larger coarse chisel-like teeth having near-square front faces for cutting with grain; tooth profile large enough to inspect", "fine alternating knife-like crosscut teeth; hacksaw frame; circular saw; tooth-detail inset or callout; wood", "strict side view, blade horizontal, with the entire toothed edge prominent and uncropped"],
  [49, "tool.saw.hacksaw", "one full-size hand hacksaw", "rigid C-shaped metal bow frame; thin straight replaceable blade tensioned between front and rear pins; many tiny uniform teeth along one edge; pistol-style rear handle; front tension mechanism", "solid wood-saw blade; open blade end; coping-saw depth; pipe or workpiece", "three-quarter side view showing both blade attachment points and the full frame"],
  [50, "tool.utility-knife", "one retractable utility knife", "sturdy elongated handle; thumb slider; short trapezoid utility blade protruding slightly from the front; visible blade guide; complete intact body", "broad putty-knife blade; paint scraper; snap-off segmented blade; loose spare blades; cutting material", "three-quarter side view with the short trapezoid blade and slider clearly visible"],
  [51, "tool.putty-knife", "one flexible putty knife", "long narrow handle; slim tang and ferrule; thin flexible broad leaf-shaped steel blade; gently rounded blade corners; straight application edge", "thick reinforced scraper blade; hooked pull scraper; utility-knife blade; putty or workpiece", "slightly elevated three-quarter side view showing the thin flexible blade profile and full edge"],
  [52, "tool.paint-scraper", "one rigid paint scraper", "short stout handle; reinforced ferrule; short thick rigid rectangular blade; clearly beveled scraping edge; blade noticeably stiffer and shorter than a flexible putty knife", "thin flexible leaf blade; utility-knife slider; hooked razor scraper; paint chips or workpiece", "low three-quarter side view emphasizing the reinforced blade spine, thickness, and beveled edge"],
  [53, "tool.tape-measure", "one retractable tape measure", "compact rounded rectangular case; belt clip; lock button; short section of steel tape extended from the front; hooked metal end tab; simple unlabeled tick marks only", "numbers or letters; loose coil; folding rule; fully retracted tape; hand", "three-quarter view showing the case controls, extended tape, and hooked end within the canvas"],
  [54, "tool.level", "one rectangular spirit level", "long rigid rectangular body; two end caps; three clearly visible vial windows for horizontal, vertical, and diagonal readings; centered bubbles represented without markings", "ruler numbers; carpenter-square L shape; laser; tripod", "slightly elevated three-quarter side view showing all three vial windows"],
  [55, "tool.square", "one traditional carpenter framing square", "single rigid L-shaped metal tool; long wide blade; shorter narrower tongue; exact 90-degree inside corner; both legs complete", "level vials; adjustable combination head; ruler numbers; separate straightedges", "slightly elevated strict face view with both unequal legs clearly visible"],
  [58, "tool.drain-snake", "one hand-crank drum drain auger shown as a complete continuous tool", "round enclosed cable drum; integrated carry grip; side crank handle; short guide tube; one flexible metal cable exiting the guide tube and ending in a small corkscrew auger tip; every cable connection continuous", "plunger cup; toilet auger elbow; power drill; open or cut cable end; detached tip; pipe", "three-quarter view with one compact cable curve so the drum, crank, guide, cable, and terminal auger are all traceable"],
  [60, "tool.soldering-gun", "one corded pistol-grip soldering gun", "bulky transformer housing; pistol grip with trigger; two short rigid front posts; one continuous U-shaped copper heating tip connected to both posts; one power cord neatly looped with its plug visible", "staple magazine; staple-driving nose; caulking plunger rod; open cord end; separate tip; solder spool", "three-quarter side view with the U-shaped tip, trigger, body, and complete cord visible"],
  [64, "ppe.ear-plugs", "one matched pair of reusable corded hearing-protection earplugs", "two small identical triple-flange earplugs; short stems; one flexible cord continuously connecting the two stems; soft rounded insertion tips", "earbuds; speaker grilles; microphone; audio jack; charging case; disconnected cord", "close three-quarter arrangement with both triple-flange profiles and the entire connecting cord visible"],
  [65, "safety.wet-floor-sign", "one folding A-frame wet-floor warning sign", "self-supporting hinged A-frame body; carry-handle cutout at the top; two splayed panels connected at the hinge; simple generic slipping-person warning pictogram on the front panel with no words", "letters or words; traffic cone; floor puddle; room; person outside the pictogram; extra sign", "front three-quarter view showing the hinge, both feet, and the pictogram panel"],
];

const commonStyle = [
  "Use case: scientific-educational.",
  "Asset type: one isolated exam-prep tool-recognition illustration.",
  "Scene/backdrop: visually pure white with no floor plane and no shadow.",
  "Style: original black monochrome technical line illustration; confident medium contour; sparse functional hatching; restrained interior detail; high whitespace; generic unbranded construction; plain civil-service test-booklet visual language. Use original geometry and composition; do not copy any particular official sample drawing.",
  "Composition: one complete mechanically plausible subject centered at roughly 70% of a square canvas with generous even padding. Nothing may touch or cross the canvas edge.",
];

const globalExclusions = "No text or pseudo-text; no labels, arrows, circles, letters, numbers, answer marks, logos, brands, watermarks, hands, people, room, floor plane, props, drop shadow, gray backdrop, decorative border, cropped subject, duplicated components, disconnected or floating parts, or impossible joints.";

const briefs = specs.map(([slot, conceptId, request, mustShow, mustNotShow, view]) => {
  const inventoryItem = inventory.find((item) => item.id === conceptId);
  if (!inventoryItem) throw new Error(`Missing inventory item: ${conceptId}`);
  const slotId = String(slot).padStart(3, "0");
  const permitPictogram = conceptId === "safety.wet-floor-sign";
  const exclusions = permitPictogram
    ? globalExclusions.replace("hands, people,", "hands, realistic people outside the requested pictogram,")
    : globalExclusions;
  const prompt = [
    ...commonStyle,
    `Primary request: Create ${request}.`,
    `Subject: ${inventoryItem.canonicalTerm}.`,
    `Desired view: ${view}.`,
    `Must show: ${mustShow}.`,
    `Must not show: ${mustNotShow}.`,
    `Absolute exclusions: ${exclusions}`,
    "Output intent: one native raster candidate; do not add explanatory text.",
  ].join("\n");

  return {
    briefId: `full-tool-${slotId}`,
    briefVersion: 1,
    slot,
    candidateId: `a${slotId}`,
    conceptId,
    canonicalTerm: inventoryItem.canonicalTerm,
    evidenceSources: [
      `docs/TAXONOMY.md#${conceptId}`,
      ...(slot <= 3 || conceptId === "tool.hand-plane" || conceptId === "tool.soldering-gun"
        ? ["https://www.cs.ny.gov/testing/test_guides/Custodians_Janitors_EntryLevel_TestGuide.pdf"]
        : []),
    ],
    desiredView: view,
    mustShow: mustShow.split("; "),
    mustNotShow: mustNotShow.split("; "),
    aspectRatio: "1:1",
    background: "visually pure white",
    requestedOutputCount: 1,
    requestedDimensions: "native built-in output; dimensions must be measured, not assumed",
    candidatePath: `content/assets/candidates/tools/a${slotId}.png`,
    prompt,
    status: "ready",
  };
});

if (briefs.length !== 46) throw new Error(`Expected 46 remaining briefs, received ${briefs.length}`);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(briefs, null, 2)}\n`);
console.log(`Wrote ${briefs.length} briefs to ${outputPath}`);
