"""Scene builders s-05 through s-08."""

from svg_core import *  # noqa: F403

def scene_05() -> tuple[Canvas, dict[str, Any]]:
    c = Canvas.create()
    room(c, floor_y=510, vanishing_x=610)
    extinguisher_cabinet(c, 405, 180, 220, 300)
    # Stable closed boxes directly in front, visibly occluding the cabinet lower edge.
    box(c, 350, 445, 190, 210)
    box(c, 525, 475, 185, 180)
    # Safe background bin far right.
    c.path("M 915 455 L 1045 455 L 1025 620 L 935 620 Z", "g1")
    c.rect(900, 430, 160, 35, "o", rx=8)
    c.circle(955, 635, 15, "o")
    c.circle(1010, 635, 15, "o")
    # Wall frame / neutral fixture.
    c.rect(145, 235, 150, 105, "o", rx=6)
    c.line(170, 270, 270, 270, "f")
    c.line(170, 307, 270, 307, "f")
    target_pts = [(330, 155), (650, 155), (715, 690), (325, 690)]
    decoy_pts = [(875, 410), (1080, 410), (1085, 665), (880, 665)]
    zones = [
        zone("z1", 1, "left wall fixture area", [(95, 95), (340, 95), (370, 770), (35, 770), (100, 510)], [
            "A blank wall frame hangs on the left wall.",
            "The floor below it is clear.",
        ]),
        zone("z2", 2, "center cabinet and floor-storage area", [(340, 95), (760, 95), (800, 770), (370, 770)], [
            "A wall-mounted cabinet contains a generic extinguisher silhouette.",
            "Two closed boxes sit directly in front of the cabinet and overlap its lower edge in the view.",
        ]),
        zone("z3", 3, "right bin area", [(760, 95), (1100, 95), (1165, 770), (800, 770)], [
            "A lidded rolling bin stands against the right wall.",
            "Clear floor space separates it from the cabinet.",
        ]),
    ]
    regions = [
        region("r1", "target", "z2", "o1", "extinguisher-access-obstructed-by-boxes", target_pts, (505, 520)),
        region("r2", "decoy", "z3", "o2", "stable-bin-clear-of-fire-equipment", decoy_pts, (980, 545)),
    ]
    manifest = base_manifest(
        scene_id="P5-EXTINGUISHER-BOXES-HALLWAY-BASE",
        public_asset_id="s-05",
        pilot_class="P5 inaccessible fire extinguisher",
        environment="hallway/common-area",
        claim_ref={
            "sourceId": "OSHA_FIRE",
            "locator": "29 CFR 1910.157 readily-accessible extinguisher basis; exact applicability and wording require content review",
            "status": "source-backed pilot basis, not scored-content approval",
        },
        semantic_inventory=[
            {"objectId": "o1", "role": "target", "conditionId": "extinguisher-access-obstructed-by-boxes", "correctionConcept": "remove the stored boxes and preserve ready access under the admitted source-backed rule"},
            {"objectId": "o2", "role": "decoy", "conditionId": "stable-bin-clear-of-fire-equipment", "safeAsDepicted": "The lidded bin is stable and spatially separated from the extinguisher cabinet and access area."},
        ],
        negative_inventory=[
            "The two boxes are closed, individually floor-supported, and not stacked; no falling-object condition is depicted.",
            "No exit or doorway is shown, so no separate egress target is implied.",
            "The rolling bin is clear of the cabinet and passage.",
            "No loose cord, wet floor, chemical spill, or broken glass appears.",
            "The correction is not already depicted.",
        ],
        zones=zones,
        regions=regions,
        neutral_description="A generic hallway with a wall-mounted extinguisher cabinet, two closed boxes on the floor directly in front of it, and a lidded rolling bin farther right.",
        neutral_zones=[
            {"zoneId": "z1", "text": "A blank frame hangs on the left wall with clear floor space below."},
            {"zoneId": "z2", "text": "A wall-mounted cabinet contains a generic extinguisher silhouette; two closed boxes sit directly in front of the cabinet and overlap its lower edge in the view."},
            {"zoneId": "z3", "text": "A lidded rolling bin stands farther right, separated from the cabinet."},
        ],
        full_description="The boxes directly in front of the extinguisher cabinet represent obstructed access. The rolling bin is an authored decoy and is safe as depicted because it is stable and separated from the cabinet. Exact source applicability and correction language require content-editor approval before scored use.",
    )
    return c, manifest


def scene_06() -> tuple[Canvas, dict[str, Any]]:
    c = Canvas.create()
    room(c, floor_y=500, vanishing_x=520)
    # Cabinet on right wall.
    extinguisher_cabinet(c, 820, 170, 205, 285)
    janitor_cart(c, 735, 690, 0.95)
    # Folded chairs on left wall as stable safe decoy.
    folded_chairs(c, 145, 610, 3)
    c.line(125, 620, 365, 620, "s")
    c.line(125, 620, 125, 650, "s")
    c.line(365, 620, 365, 650, "s")
    # Neutral wall cabinet center.
    c.rect(450, 230, 165, 125, "o", rx=8)
    c.line(532, 230, 532, 355, "f")
    target_pts = [(700, 135), (1065, 135), (1080, 745), (690, 745)]
    decoy_pts = [(105, 390), (405, 390), (420, 690), (90, 690)]
    zones = [
        zone("z1", 1, "left folded-chair area", [(85, 95), (420, 95), (450, 770), (35, 770), (85, 500)], [
            "Three folded chairs rest together inside a low wall rack.",
            "Their legs remain within the rack footprint.",
        ]),
        zone("z2", 2, "center wall-storage area", [(420, 95), (690, 95), (710, 770), (450, 770)], [
            "A closed two-door wall cabinet hangs in the center.",
            "The floor beneath it is clear.",
        ]),
        zone("z3", 3, "right fire-equipment and cart area", [(690, 95), (1100, 95), (1165, 770), (710, 770)], [
            "A wall-mounted cabinet contains a generic extinguisher silhouette.",
            "A loaded janitor cart is parked directly in front of the cabinet.",
        ]),
    ]
    regions = [
        region("r1", "target", "z3", "o1", "extinguisher-access-obstructed-by-cart", target_pts, (880, 500)),
        region("r2", "decoy", "z1", "o2", "folded-chairs-stable-in-rack", decoy_pts, (250, 535)),
    ]
    manifest = base_manifest(
        scene_id="P5-EXTINGUISHER-CART-GYM-TRANSFER",
        public_asset_id="s-06",
        pilot_class="P5 inaccessible fire extinguisher",
        environment="gym/common-area",
        transfer_of="P5-EXTINGUISHER-BOXES-HALLWAY-BASE",
        claim_ref={
            "sourceId": "OSHA_FIRE",
            "locator": "29 CFR 1910.157 readily-accessible extinguisher basis; exact applicability and wording require content review",
            "status": "source-backed pilot basis, not scored-content approval",
        },
        semantic_inventory=[
            {"objectId": "o1", "role": "target", "conditionId": "extinguisher-access-obstructed-by-cart", "correctionConcept": "move the cart and preserve ready access under the admitted source-backed rule"},
            {"objectId": "o2", "role": "decoy", "conditionId": "folded-chairs-stable-in-rack", "safeAsDepicted": "The folded chairs are retained inside a low rack and do not extend into the passage or fire-equipment area."},
        ],
        negative_inventory=[
            "The janitor cart is stable and has no loose mop, hose, cord, or leaking container.",
            "The folded chairs are retained by a rack and do not obstruct the walking path.",
            "No exit or doorway is shown, avoiding a second egress rule.",
            "No wet floor, chemical spill, broken glass, or unstable stack appears.",
            "The correction is not already depicted.",
        ],
        zones=zones,
        regions=regions,
        neutral_description="A generic gym-adjacent common area with folded chairs in a low rack, a closed wall cabinet, a wall-mounted extinguisher cabinet, and a janitor cart parked directly in front of it.",
        neutral_zones=[
            {"zoneId": "z1", "text": "Three folded chairs rest together inside a low wall rack on the left."},
            {"zoneId": "z2", "text": "A closed two-door wall cabinet hangs at center with clear floor space below."},
            {"zoneId": "z3", "text": "A janitor cart is parked directly in front of a wall-mounted cabinet containing a generic extinguisher silhouette."},
        ],
        full_description="The janitor cart directly in front of the extinguisher cabinet represents obstructed access. The folded chairs are an authored decoy and are safe as depicted because they are stable inside a rack and outside the passage. Exact source applicability and correction language require content-editor approval before scored use.",
    )
    return c, manifest


def scene_07() -> tuple[Canvas, dict[str, Any]]:
    c = Canvas.create()
    room(c, floor_y=505, vanishing_x=600)
    # Classroom table and cabinets.
    c.rect(145, 320, 270, 55, "o", rx=6)
    c.line(180, 375, 165, 555, "s")
    c.line(380, 375, 395, 555, "s")
    c.rect(850, 235, 215, 270, "o", rx=8)
    c.line(957, 235, 957, 505, "f")
    c.circle(938, 370, 6, "o")
    c.circle(976, 370, 6, "o")
    # Broken tumbler base and large shards.
    c.path("M 480 660 Q 535 620 590 658 Q 560 704 505 704 Q 482 690 480 660 Z", "g1")
    shard(c, [(430, 625), (485, 565), (520, 640)])
    shard(c, [(560, 610), (630, 558), (610, 660)])
    shard(c, [(650, 650), (710, 600), (730, 690)])
    shard(c, [(405, 705), (455, 655), (490, 730)])
    shard(c, [(590, 720), (640, 665), (680, 745)])
    # Safe paper decoy.
    paper_ball(c, 855, 680, 34)
    # Small waste bin in far right background, upright.
    c.path("M 980 520 L 1070 520 L 1055 635 L 995 635 Z", "g1")
    target_pts = [(375, 535), (745, 535), (755, 765), (365, 765)]
    decoy_pts = [(805, 635), (905, 635), (915, 730), (795, 730)]
    zones = [
        zone("z1", 1, "left table area", [(95, 95), (455, 95), (480, 770), (35, 770), (100, 505)], [
            "A low classroom table stands on the left.",
            "The floor beneath the table is clear.",
        ]),
        zone("z2", 2, "center foreground floor area", [(455, 95), (790, 95), (815, 770), (480, 770)], [
            "Several angular translucent-looking fragments and part of a broken curved rim lie on the floor.",
            "The fragments occupy multiple adjacent tiles.",
        ]),
        zone("z3", 3, "right cabinet and floor area", [(790, 95), (1100, 95), (1165, 770), (815, 770)], [
            "A closed storage cabinet stands against the wall.",
            "A crumpled paper ball lies on the floor near an upright waste bin.",
        ]),
    ]
    regions = [
        region("r1", "target", "z2", "o1", "exposed-broken-glass-on-walking-surface", target_pts, (570, 665)),
        region("r2", "decoy", "z3", "o2", "crumpled-paper-debris", decoy_pts, (855, 680)),
    ]
    manifest = base_manifest(
        scene_id="P7-BROKEN-GLASS-CLASSROOM-BASE",
        public_asset_id="s-07",
        pilot_class="P7 exposed broken glass",
        environment="classroom",
        claim_ref={
            "sourceId": "OSHA_FLOOR",
            "locator": "29 CFR 1910.22 walking-surface housekeeping/sharp-object basis; stronger handling/disposal claims require separate source review",
            "status": "source-backed pilot basis, not scored-content approval",
        },
        semantic_inventory=[
            {"objectId": "o1", "role": "target", "conditionId": "exposed-broken-glass-on-walking-surface", "correctionConcept": "isolate and remove the sharp debris using the admitted source-backed procedure/content profile"},
            {"objectId": "o2", "role": "decoy", "conditionId": "crumpled-paper-debris", "safeAsDepicted": "The object is depicted as soft crumpled paper rather than a sharp or protruding fragment; ordinary housekeeping relevance is separate from the authored sharp-object target."},
        ],
        negative_inventory=[
            "No liquid spill accompanies the broken material.",
            "No contaminated medical sharp, needle, or bodily-fluid cue appears.",
            "No person is shown handling the fragments.",
            "Furniture is stable and does not obstruct the room path.",
            "No loose cord, chemical container, or fire-equipment obstruction appears.",
        ],
        zones=zones,
        regions=regions,
        neutral_description="A generic classroom with a low table, a closed cabinet, several angular translucent-looking fragments on the center floor, a crumpled paper ball, and an upright waste bin.",
        neutral_zones=[
            {"zoneId": "z1", "text": "A low classroom table stands on the left with clear floor space beneath it."},
            {"zoneId": "z2", "text": "Several angular translucent-looking fragments and part of a broken curved rim lie across the center foreground tiles."},
            {"zoneId": "z3", "text": "A closed cabinet stands on the right; a crumpled paper ball lies near an upright waste bin."},
        ],
        full_description="The angular fragments and broken rim on the center floor represent exposed broken glass. The crumpled paper is an authored decoy and is not the sharp-object condition depicted by the scene. Handling/disposal procedure and exact correction language require separate content-editor approval before scored use.",
    )
    return c, manifest


def scene_08() -> tuple[Canvas, dict[str, Any]]:
    c = Canvas.create()
    room(c, floor_y=490, vanishing_x=515)
    # Cafeteria service counter.
    c.rect(150, 250, 650, 125, "o", rx=8)
    c.rect(180, 375, 590, 115, "g1")
    c.line(375, 375, 375, 490, "s")
    c.line(575, 375, 575, 490, "s")
    # Simple trays on counter, no food contamination meaning.
    c.rect(220, 220, 125, 28, "g1", rx=8)
    c.rect(420, 220, 125, 28, "g1", rx=8)
    # Broken jar and shards lower-left foreground.
    c.path("M 245 625 Q 305 584 360 628 Q 335 678 280 681 Q 250 662 245 625 Z", "g1")
    shard(c, [(175, 620), (225, 555), (258, 648)])
    shard(c, [(335, 600), (405, 548), (382, 658)])
    shard(c, [(410, 670), (470, 615), (495, 705)])
    shard(c, [(210, 710), (255, 665), (292, 742)])
    shard(c, [(330, 730), (380, 674), (425, 755)])
    # Safe plastic lid / napkin decoy far right.
    c.ellipse(910, 680, 56, 25, "g1")
    c.ellipse(910, 680, 34, 12, "f")
    c.rect(995, 565, 92, 70, "o", rx=8)
    c.line(1012, 590, 1070, 590, "f")
    target_pts = [(145, 525), (520, 525), (535, 775), (125, 775)]
    decoy_pts = [(835, 625), (985, 625), (1000, 735), (820, 735)]
    zones = [
        zone("z1", 1, "left foreground floor area", [(95, 95), (535, 95), (560, 770), (35, 770), (85, 490)], [
            "Several angular translucent-looking fragments and part of a broken curved rim lie on the floor.",
            "The fragments are separated across multiple floor tiles.",
        ]),
        zone("z2", 2, "service-counter area", [(535, 95), (820, 95), (845, 770), (560, 770)], [
            "A generic service counter has two shallow trays on top.",
            "The counter doors are closed.",
        ]),
        zone("z3", 3, "right floor and bin area", [(820, 95), (1100, 95), (1165, 770), (845, 770)], [
            "A round shallow lid-like object lies flat on the floor.",
            "A small closed bin stands against the wall.",
        ]),
    ]
    regions = [
        region("r1", "target", "z1", "o1", "exposed-broken-glass-on-walking-surface", target_pts, (330, 660)),
        region("r2", "decoy", "z3", "o2", "intact-flat-plastic-lid", decoy_pts, (910, 680)),
    ]
    manifest = base_manifest(
        scene_id="P7-BROKEN-GLASS-CAFETERIA-TRANSFER",
        public_asset_id="s-08",
        pilot_class="P7 exposed broken glass",
        environment="cafeteria",
        transfer_of="P7-BROKEN-GLASS-CLASSROOM-BASE",
        claim_ref={
            "sourceId": "OSHA_FLOOR",
            "locator": "29 CFR 1910.22 walking-surface housekeeping/sharp-object basis; stronger handling/disposal claims require separate source review",
            "status": "source-backed pilot basis, not scored-content approval",
        },
        semantic_inventory=[
            {"objectId": "o1", "role": "target", "conditionId": "exposed-broken-glass-on-walking-surface", "correctionConcept": "isolate and remove the sharp debris using the admitted source-backed procedure/content profile"},
            {"objectId": "o2", "role": "decoy", "conditionId": "intact-flat-plastic-lid", "safeAsDepicted": "The round object is intact, shallow, and flat on the floor with no sharp or broken edges depicted; ordinary housekeeping relevance is separate from the authored sharp-object target."},
        ],
        negative_inventory=[
            "No liquid spill accompanies the fragments.",
            "No food, chemical, or sanitation-contact relationship is depicted.",
            "No contaminated medical sharp or bodily-fluid cue appears.",
            "The service counter and trays are stable and closed.",
            "No loose cord, fire-equipment obstruction, or unstable load appears.",
        ],
        zones=zones,
        regions=regions,
        neutral_description="A generic cafeteria service area with a counter, several angular translucent-looking fragments on the left foreground floor, a round shallow lid-like object on the right floor, and a small closed bin.",
        neutral_zones=[
            {"zoneId": "z1", "text": "Several angular translucent-looking fragments and part of a broken curved rim lie across the left foreground tiles."},
            {"zoneId": "z2", "text": "A generic service counter has two shallow trays on top and closed doors below."},
            {"zoneId": "z3", "text": "A round shallow lid-like object lies flat near a small closed bin."},
        ],
        full_description="The angular fragments and broken rim on the left foreground floor represent exposed broken glass. The round shallow object is an authored decoy and is safe as depicted because it is intact and has no sharp edge. Handling/disposal procedure and exact correction language require separate content-editor approval before scored use.",
    )
    return c, manifest

