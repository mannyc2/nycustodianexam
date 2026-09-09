interface SceneMarker {
  readonly id: string
  readonly x: number
  readonly y: number
}

/** Released neutral image plus user-authored positions; no assessment input. */
export const NeutralSceneImage = ({ alt, imageUrl, markers }: {
  readonly alt: string
  readonly imageUrl: string
  readonly markers: readonly SceneMarker[]
}) => <>
  <img alt={alt} draggable={false} src={imageUrl} style={{ display: "block", height: "auto", width: "100%" }} />
  {markers.map((marker, index) => <span
    aria-hidden="true"
    className="hazard-player__marker"
    key={marker.id}
    style={{ left: `${marker.x * 100}%`, position: "absolute", top: `${marker.y * 100}%`, transform: "translate(-50%, -50%)" }}
  >{index + 1}</span>)}
</>
