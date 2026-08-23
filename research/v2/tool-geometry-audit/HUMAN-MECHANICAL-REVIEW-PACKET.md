# Human mechanical review packet

## Current disposition

The four recovered CAD/SVG POCs are retired as production-art candidates. They
will not be repaired into shipping illustrations, so qualified production
mechanical signoff is not required and is not an open R2.10 blocker.

This packet is retained only as a guardrail if a maintainer explicitly reopens
one of the POCs for production. Reopening would require review of the exact
source, parameter, STEP, mesh, render, and rights hashes; the successful rebuild
alone would not establish mechanical correctness.

## Questions required after any future reopening

For every reopened model, a qualified reviewer would need to assess:

1. units, axes, component counts, contacts, intersections, and clearances;
2. STEP re-import topology, identity, and bounds;
3. mesh fidelity and watertightness;
4. which dimensions are sourced versus editorial;
5. generic recognizability without SKU or trade-dress copying;
6. whether the chosen view reveals the intended feature without false geometry
   or answer leakage; and
7. phone and print legibility.

The adjustable-wrench review would additionally cover parallel smooth jaws,
movable-jaw guidance, worm engagement, and absence of pipe-wrench geometry. The
pipe-wrench review would cover hook/fixed jaw separation, serration geometry,
open throat, and adjustment mechanics. The two plungers would require cup,
rim/flange, attachment, and flexible-material review.

Any reopened review must return a verdict tied to exact hashes, annotated views,
parameter corrections, reviewer role and competence, and the required re-review
conditions. A general visual impression is not approval.
