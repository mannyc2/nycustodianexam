# Probe status

The connected GitHub execution path did not provide a repository-local Bun runtime capable of producing a trustworthy committed `bun.lock` and full install/runtime probe set for this lane.

Therefore the lane does not claim OBSERVED results for:

- `bun ci` against the final four-workspace fixture;
- filtered script execution order;
- undeclared-dependency rejection under the exact final fixture;
- lifecycle-script trust execution;
- duplicate Effect cohort resolution from a generated lockfile.

The research recommendation remains source-backed and sibling-lane-informed, but these runtime gates stay BLOCKED until the scaffold or a dedicated rerun executes them and commits raw stdout/stderr.
