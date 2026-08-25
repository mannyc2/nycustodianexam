import { HazardCommitControls } from "./commit-controls.tsx"
import { HazardMarkerControls } from "./marker-controls.tsx"
import { HazardPlayerProvider } from "./provider.tsx"
import { HazardResults, HazardStatus } from "./results.tsx"
import {
  HazardFrame,
  HazardPrompt,
  HazardSceneViewport
} from "./scene-viewport.tsx"
import { HazardZoneNavigator } from "./zone-navigator.tsx"

export const HazardPlayerPieces = {
  Frame: HazardFrame,
  Prompt: HazardPrompt,
  VisualScene: HazardSceneViewport,
  MarkerList: HazardMarkerControls,
  ZoneNavigator: HazardZoneNavigator,
  Commit: HazardCommitControls,
  Results: HazardResults,
  Status: HazardStatus
} as const

export const HazardPlayer = {
  Provider: HazardPlayerProvider,
  Frame: HazardPlayerPieces.Frame,
  Prompt: HazardPlayerPieces.Prompt,
  SceneViewport: HazardPlayerPieces.VisualScene,
  MarkerList: HazardPlayerPieces.MarkerList,
  ZoneNavigator: HazardPlayerPieces.ZoneNavigator,
  CommitAction: HazardPlayerPieces.Commit,
  Results: HazardPlayerPieces.Results,
  CommitStatus: HazardPlayerPieces.Status
} as const

export const VisualHazardPractice = () => (
  <HazardPlayerPieces.Frame>
    <HazardPlayerPieces.Prompt />
    <HazardPlayerPieces.VisualScene />
    <HazardPlayerPieces.MarkerList />
    <HazardPlayerPieces.Commit />
    <HazardPlayerPieces.Results />
    <HazardPlayerPieces.Status />
  </HazardPlayerPieces.Frame>
)

export const NonvisualHazardPractice = () => (
  <HazardPlayerPieces.Frame>
    <HazardPlayerPieces.Prompt />
    <HazardPlayerPieces.ZoneNavigator />
    <HazardPlayerPieces.Commit />
    <HazardPlayerPieces.Results />
    <HazardPlayerPieces.Status />
  </HazardPlayerPieces.Frame>
)
