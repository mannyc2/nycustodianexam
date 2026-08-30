import {
  ReleasedPostcommitScene as ReleasedPostcommitSceneSchema,
  PostcommitScene as PostcommitSceneSchema,
  PrecommitScene as PrecommitSceneSchema
} from "@nycustodian/content/model"

export type PrecommitScene = typeof PrecommitSceneSchema.Type
export type PostcommitScene = typeof PostcommitSceneSchema.Type
export type ReleasedPostcommitScene = typeof ReleasedPostcommitSceneSchema.Type

export type HazardInputMode = "visual" | "nonvisual"

export interface HazardMarker {
  readonly id: string
  readonly x: number
  readonly y: number
}

export interface HazardDraft {
  readonly markers: ReadonlyArray<HazardMarker>
  readonly selectedZoneOrders: ReadonlyArray<number>
  readonly nextMarkerNumber: number
}
