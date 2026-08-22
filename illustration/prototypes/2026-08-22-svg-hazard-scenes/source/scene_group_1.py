"""Scene builders s-01 through s-04."""

from svg_core import *  # noqa: F403

def scene_01() -> tuple[Canvas, dict[str, Any]]:
    c = Canvas.create()
    room(c, floor_y=500, vanishing_x=555)
    door(c, 145, 185, 190, 315)
    c.rect(835, 405, 245, 78, "o", rx=8)
    c.line(865, 483, 850, 542, "s")
    c.line(1047, 483, 1062, 542, "s")
    c.rect(875, 255, 155, 90, "o", rx=6)
    c.line(952, 255, 952, 345, "f")
    mat_pts = [(920, 585), (1110, 585), (1155, 650), (875, 650)]
    flat_mat(c, mat_pts)
    puddle_d = (
        "M 335 629 Q 378 588 435 604 Q 486 570 548 601 "
        "Q 615 578 675 616 Q 739 603 789 655 "
        "Q 747 706 681 698 Q 626 733 566 705 "
        "Q 498 735 446 701 Q 385 716 335 669 Q 317 651 335 629 Z"
    )
    puddle(c, puddle_d, [
        "M 397 648 Q 454 623 508 646",
        "M 553 660 Q 616 632 682 658",
        "M 475 687 Q 530 674 579 690",
    ])
    target_pts = [(320, 620), (410, 585), (515, 575), (655, 590), (800, 635), (790, 705), (640, 735), (490, 730), (340, 690)]
    decoy_pts = [(865, 570), (1120, 570), (1165, 665), (855, 665)]
    zones = [
        zone("z1", 1, "left doorway area", [(95, 95), (390, 95), (390, 535), (70, 770), (35, 770), (100, 500)], [
            "A closed door is set into the left wall.",
            "The adjacent floor tiles are unobstructed.",
        ]),
        zone("z2", 2, "center floor area", [(390, 95), (760, 95), (820, 770), (350, 770)], [
            "An irregular shallow-looking patch with a reflective gray surface spans several floor tiles.",
            "No floor-control object is drawn beside the patch.",
        ]),
        zone("z3", 3, "right bench and mat area", [(760, 95), (1100, 95), (1165, 770), (820, 770)], [
            "A bench stands against the right wall.",
            "A flat rectangular mat lies flush with the floor in front of the bench.",
        ]),
    ]
    regions = [
        region("r1", "target", "z2", "o1", "wet-surface-without-visible-control", target_pts, (560, 660)),
        region("r2", "decoy", "z3", "o2", "flat-intact-floor-mat", decoy_pts, (950, 620)),
    ]
    manifest = base_manifest(
        scene_id="P1-WET-FLOOR-HALLWAY-BASE",
        public_asset_id="s-01",
        pilot_class="P1 wet floor",
        environment="hallway/common-area",
        claim_ref={
            "sourceId": "OSHA_FLOOR",
            "locator": "29 CFR 1910.22 wet-surface/spill housekeeping basis; exact content admission remains required",
            "status": "source-backed pilot basis, not scored-content approval",
        },
        semantic_inventory=[
            {"objectId": "o1", "role": "target", "conditionId": "wet-surface-without-visible-control", "correctionConcept": "remove or control the wet condition and pedestrian exposure under the admitted source-backed rule"},
            {"objectId": "o2", "role": "decoy", "conditionId": "flat-intact-floor-mat", "safeAsDepicted": "The mat is flat, intact, and outside the authored wet patch; no curled edge or obstruction is shown."},
        ],
        negative_inventory=[
            "No loose cord or hose crosses the walking path.",
            "No exit, doorway, or fire equipment is obstructed.",
            "The mat has no raised or curled edge.",
            "No warning sign or other correction is already depicted.",
            "No unstable furniture, broken glass, or chemical container appears.",
        ],
        zones=zones,
        regions=regions,
        neutral_description="A generic school hallway with a closed door, a bench, a flat floor mat, and an irregular reflective patch across several floor tiles.",
        neutral_zones=[
            {"zoneId": "z1", "text": "A closed door is set into the left wall, with clear floor space nearby."},
            {"zoneId": "z2", "text": "An irregular shallow-looking gray patch spans several center floor tiles."},
            {"zoneId": "z3", "text": "A bench stands on the right, and a rectangular mat lies flat on the floor in front of it."},
        ],
        full_description="The center-floor patch represents an uncorrected wet walking surface. The flat mat at the right is an authored decoy and is safe as depicted because it is intact, flat, and separate from the wet area. Source and correction wording require content-editor approval before scored use.",
    )
    return c, manifest


def scene_02() -> tuple[Canvas, dict[str, Any]]:
    c = Canvas.create()
    room(c, floor_y=480, vanishing_x=720, back_left=85, back_right=1115)
    # Double entrance doors centered-right.
    c.rect(560, 145, 385, 335, "o")
    c.line(752, 145, 752, 480, "s")
    c.circle(725, 320, 8, "o")
    c.circle(779, 320, 8, "o")
    c.rect(105, 280, 165, 200, "o", rx=8)
    # Umbrella stand with closed umbrellas on the left.
    c.path("M 150 455 L 225 455 L 214 530 L 161 530 Z", "g1")
    for dx in (0, 27, 52):
        c.line(168 + dx, 455, 154 + dx, 315, "s")
        c.path(f"M {140+dx} 330 Q {154+dx} 302 {168+dx} 330", "f")
    mat_pts = [(500, 515), (730, 515), (785, 610), (445, 610)]
    flat_mat(c, mat_pts)
    puddle_d = (
        "M 875 625 Q 910 590 950 610 Q 995 586 1040 620 "
        "Q 1090 610 1125 650 Q 1140 690 1110 720 "
        "Q 1060 748 1015 728 Q 970 752 930 728 "
        "Q 890 742 855 705 Q 840 670 875 625 Z"
    )
    puddle(c, puddle_d, [
        "M 895 652 Q 940 632 985 650",
        "M 1010 680 Q 1050 662 1090 680",
        "M 920 708 Q 960 694 1000 708",
    ])
    # Wall directory panel without text.
    c.rect(970, 220, 105, 145, "o", rx=6)
    c.line(990, 252, 1055, 252, "f")
    c.line(990, 288, 1055, 288, "f")
    c.line(990, 324, 1055, 324, "f")
    target_pts = [(850, 610), (900, 580), (1010, 580), (1095, 610), (1145, 650), (1150, 720), (1105, 755), (1010, 760), (900, 740), (850, 700)]
    decoy_pts = [(430, 500), (735, 500), (790, 625), (415, 625)]
    zones = [
        zone("z1", 1, "left lobby furnishing area", [(85, 95), (420, 95), (470, 770), (35, 770), (85, 480)], [
            "A low stand holds three closed umbrellas.",
            "The floor around the stand is clear.",
        ]),
        zone("z2", 2, "entrance and mat area", [(420, 95), (970, 95), (960, 640), (470, 640)], [
            "Two closed entrance doors stand behind a broad rectangular mat.",
            "The mat lies flat across the floor.",
        ]),
        zone("z3", 3, "right foreground floor area", [(970, 95), (1115, 95), (1165, 770), (920, 770)], [
            "An irregular reflective gray patch lies on the right foreground tiles.",
            "A wall directory panel has blank horizontal divisions without readable text.",
        ]),
    ]
    regions = [
        region("r1", "target", "z3", "o1", "wet-surface-without-visible-control", target_pts, (930, 680)),
        region("r2", "decoy", "z2", "o2", "flat-intact-entrance-mat", decoy_pts, (740, 560)),
    ]
    manifest = base_manifest(
        scene_id="P1-WET-FLOOR-LOBBY-TRANSFER",
        public_asset_id="s-02",
        pilot_class="P1 wet floor",
        environment="entrance/lobby",
        transfer_of="P1-WET-FLOOR-HALLWAY-BASE",
        claim_ref={
            "sourceId": "OSHA_FLOOR",
            "locator": "29 CFR 1910.22 wet-surface/spill housekeeping basis; exact content admission remains required",
            "status": "source-backed pilot basis, not scored-content approval",
        },
        semantic_inventory=[
            {"objectId": "o1", "role": "target", "conditionId": "wet-surface-without-visible-control", "correctionConcept": "remove or control the wet condition and pedestrian exposure under the admitted source-backed rule"},
            {"objectId": "o2", "role": "decoy", "conditionId": "flat-intact-entrance-mat", "safeAsDepicted": "The broad mat is flat, intact, and spatially separate from the wet patch."},
        ],
        negative_inventory=[
            "Entrance doors remain visually unobstructed.",
            "Umbrellas are closed and retained inside the stand.",
            "The entrance mat has no curled edge.",
            "No loose cord, broken glass, chemical container, or unstable load appears.",
            "No warning sign or correction is already depicted.",
        ],
        zones=zones,
        regions=regions,
        neutral_description="A generic entrance lobby with double doors, a broad flat mat, an umbrella stand, and an irregular reflective patch on the right foreground floor.",
        neutral_zones=[
            {"zoneId": "z1", "text": "A stand on the left contains three closed umbrellas, with clear floor space around it."},
            {"zoneId": "z2", "text": "Double entrance doors are behind a broad rectangular mat that lies flat."},
            {"zoneId": "z3", "text": "An irregular shallow-looking gray patch lies on the right foreground tiles."},
        ],
        full_description="The right foreground patch represents an uncorrected wet walking surface. The entrance mat is an authored decoy and is safe as depicted because it is flat, intact, and separate from the patch. Source and correction wording require content-editor approval before scored use.",
    )
    return c, manifest


def scene_03() -> tuple[Canvas, dict[str, Any]]:
    c = Canvas.create()
    room(c, floor_y=520, vanishing_x=605)
    floor_machine(c, 315, 680, 1.0)
    # Outlet and cord path kept along wall/baseboard, not across the travel path.
    c.rect(1010, 410, 70, 95, "o", rx=8)
    c.circle(1032, 445, 5, "k")
    c.circle(1058, 445, 5, "k")
    c.line(1045, 463, 1045, 478, "f")
    c.path("M 376 625 C 470 590 560 588 650 598", "c")
    c.path("M 650 598 C 686 600 708 601 730 603", "c")
    # Deliberate outer-jacket split: jagged sheath ends and two visible inner conductors.
    c.polyline([(728, 594), (743, 586), (753, 601)], "s")
    c.polyline([(728, 612), (742, 621), (754, 607)], "s")
    c.path("M 748 599 C 770 587 792 590 812 603", "f")
    c.path("M 748 610 C 770 622 792 620 812 608", "f")
    c.polyline([(810, 603), (823, 589), (835, 598)], "s")
    c.polyline([(810, 608), (824, 621), (836, 611)], "s")
    c.path("M 833 605 C 890 611 950 606 1010 470", "c")
    # Intact wall-stored spare cord as decoy.
    wall_cord_coil(c, 860, 300, 58)
    c.rect(145, 210, 190, 115, "o", rx=8)
    c.line(170, 250, 310, 250, "f")
    c.line(170, 286, 310, 286, "f")
    target_pts = [(708, 570), (837, 570), (850, 638), (702, 640)]
    decoy_pts = [(778, 190), (948, 190), (956, 390), (770, 390)]
    zones = [
        zone("z1", 1, "left equipment area", [(95, 95), (520, 95), (555, 770), (35, 770), (100, 520)], [
            "A corded floor-cleaning machine is parked on the left.",
            "Its cord leaves the machine toward the rear wall.",
        ]),
        zone("z2", 2, "center baseboard and cord area", [(520, 95), (900, 95), (930, 770), (555, 770)], [
            "The power cord follows the back edge of the floor.",
            "A short section of the outer covering is split, with two inner lines visible.",
        ]),
        zone("z3", 3, "right wall storage and outlet area", [(900, 95), (1100, 95), (1165, 770), (930, 770)], [
            "An intact spare cord is coiled on a wall hook.",
            "The equipment cord continues to a wall outlet.",
        ]),
    ]
    regions = [
        region("r1", "target", "z2", "o1", "split-outer-cord-insulation", target_pts, (770, 605)),
        region("r2", "decoy", "z3", "o2", "intact-wall-stored-cord", decoy_pts, (860, 300)),
    ]
    manifest = base_manifest(
        scene_id="P3-DAMAGED-CORD-UTILITY-BASE",
        public_asset_id="s-03",
        pilot_class="P3 damaged cord",
        environment="mechanical/utility-area",
        claim_ref={
            "sourceId": "OSHA_ELEC",
            "locator": "29 CFR 1910.334 damaged cord/equipment visual-inspection basis; exact subparagraph and wording require content review",
            "status": "source-backed pilot basis, not scored-content approval",
        },
        semantic_inventory=[
            {"objectId": "o1", "role": "target", "conditionId": "split-outer-cord-insulation", "correctionConcept": "remove the damaged cord-connected equipment from use until repaired or replaced under the admitted rule"},
            {"objectId": "o2", "role": "decoy", "conditionId": "intact-wall-stored-cord", "safeAsDepicted": "The spare cord is intact, fully coiled, and stored on a wall hook rather than crossing a walking path."},
        ],
        negative_inventory=[
            "The equipment cord follows the baseboard and does not cross the walking path.",
            "No missing or deformed grounding pin is depicted.",
            "No wet surface or energized-water contact is depicted.",
            "The floor machine is upright and parked without unstable parts.",
            "No exit or fire equipment is obstructed.",
        ],
        zones=zones,
        regions=regions,
        neutral_description="A generic utility-area scene with a parked floor-cleaning machine, a cord following the wall edge to an outlet, and a separate cord coiled on a wall hook.",
        neutral_zones=[
            {"zoneId": "z1", "text": "A corded floor-cleaning machine is parked on the left."},
            {"zoneId": "z2", "text": "Its cord follows the back edge of the floor; a short section of the outer covering is split and two inner lines are visible."},
            {"zoneId": "z3", "text": "A separate intact cord is coiled on a wall hook near the outlet."},
        ],
        full_description="The split outer covering on the equipment cord is the authored unsafe condition. The wall-stored spare cord is an authored decoy and is safe as depicted because it is intact, coiled, and off the walking surface. Exact source wording and correction language require content-editor approval before scored use.",
    )
    return c, manifest


def scene_04() -> tuple[Canvas, dict[str, Any]]:
    c = Canvas.create()
    room(c, floor_y=500, vanishing_x=480)
    upright_vacuum(c, 930, 690, 0.95)
    c.rect(135, 225, 220, 130, "o", rx=8)
    c.line(165, 265, 325, 265, "f")
    c.line(165, 310, 325, 310, "f")
    c.rect(165, 390, 90, 110, "o", rx=8)
    # Outlet left and cord following the back edge.
    c.rect(115, 405, 65, 88, "o", rx=8)
    c.circle(136, 438, 5, "k")
    c.circle(159, 438, 5, "k")
    c.line(147, 454, 147, 468, "f")
    c.path("M 180 455 C 255 570 330 598 410 601", "c")
    c.path("M 410 601 C 431 600 449 599 469 601", "c")
    # Split section: jagged sheath ends and two visible inner conductors.
    c.polyline([(467, 592), (480, 584), (491, 599)], "s")
    c.polyline([(467, 610), (480, 620), (491, 607)], "s")
    c.path("M 486 598 C 507 584 531 586 552 601", "f")
    c.path("M 486 609 C 507 623 531 620 552 607", "f")
    c.polyline([(550, 601), (563, 587), (576, 598)], "s")
    c.polyline([(550, 607), (563, 621), (578, 610)], "s")
    c.path("M 575 604 C 675 607 795 620 850 646", "c")
    wall_cord_coil(c, 520, 285, 52)
    # Low classroom table in background, clear of cord.
    c.rect(690, 355, 180, 48, "o", rx=6)
    c.line(715, 403, 705, 500, "s")
    c.line(845, 403, 855, 500, "s")
    target_pts = [(446, 566), (594, 566), (609, 638), (435, 640)]
    decoy_pts = [(448, 190), (594, 190), (612, 375), (430, 375)]
    zones = [
        zone("z1", 1, "left wall and outlet area", [(85, 95), (395, 95), (430, 770), (35, 770), (85, 500)], [
            "A wall outlet is near the lower left wall.",
            "The equipment cord follows the wall edge from the outlet.",
        ]),
        zone("z2", 2, "center cord and wall-storage area", [(395, 95), (670, 95), (710, 770), (430, 770)], [
            "A short section of the cord covering is split, with two inner lines visible.",
            "A separate intact cord is coiled on a wall hook.",
        ]),
        zone("z3", 3, "right equipment area", [(670, 95), (1100, 95), (1165, 770), (710, 770)], [
            "An upright vacuum stands on the right.",
            "A low table stands behind it with clear floor space beneath.",
        ]),
    ]
    regions = [
        region("r1", "target", "z2", "o1", "split-outer-cord-insulation", target_pts, (520, 604)),
        region("r2", "decoy", "z2", "o2", "intact-wall-stored-cord", decoy_pts, (520, 285)),
    ]
    manifest = base_manifest(
        scene_id="P3-DAMAGED-CORD-CLASSROOM-TRANSFER",
        public_asset_id="s-04",
        pilot_class="P3 damaged cord",
        environment="classroom",
        transfer_of="P3-DAMAGED-CORD-UTILITY-BASE",
        claim_ref={
            "sourceId": "OSHA_ELEC",
            "locator": "29 CFR 1910.334 damaged cord/equipment visual-inspection basis; exact subparagraph and wording require content review",
            "status": "source-backed pilot basis, not scored-content approval",
        },
        semantic_inventory=[
            {"objectId": "o1", "role": "target", "conditionId": "split-outer-cord-insulation", "correctionConcept": "remove the damaged cord-connected equipment from use until repaired or replaced under the admitted rule"},
            {"objectId": "o2", "role": "decoy", "conditionId": "intact-wall-stored-cord", "safeAsDepicted": "The separate cord is intact, coiled, and stored above the walking surface."},
        ],
        negative_inventory=[
            "The active cord follows the wall edge and does not cross a walking route.",
            "No missing grounding pin or wet electrical contact is depicted.",
            "The vacuum is upright and stable.",
            "The table does not obstruct the room path.",
            "No broken glass, spill, or fire-equipment obstruction appears.",
        ],
        zones=zones,
        regions=regions,
        neutral_description="A generic classroom-like room with an upright vacuum, a cord following the wall edge to an outlet, a separate wall-stored cord, and a low table.",
        neutral_zones=[
            {"zoneId": "z1", "text": "A cord runs from a wall outlet along the back edge of the floor."},
            {"zoneId": "z2", "text": "A short section of the cord covering is split and two inner lines are visible; a separate cord is coiled on a wall hook."},
            {"zoneId": "z3", "text": "An upright vacuum stands on the right near a low table."},
        ],
        full_description="The split section of the vacuum cord is the authored unsafe condition. The wall-stored cord is an authored decoy and is safe as depicted because it is intact, coiled, and off the floor. Exact source wording and correction language require content-editor approval before scored use.",
    )
    return c, manifest

