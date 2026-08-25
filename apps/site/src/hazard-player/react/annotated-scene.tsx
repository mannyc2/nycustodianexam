import { assessVisualMarkers } from "../assessment.ts"
import type { HazardMarker, PostcommitScene } from "../attempt.ts"

export const AnnotatedHazardScene = ({
  alt,
  imageUrl,
  markers,
  payload
}: {
  readonly alt: string
  readonly imageUrl: string
  readonly markers: ReadonlyArray<HazardMarker>
  readonly payload: PostcommitScene
}) => {
  const assessment = assessVisualMarkers(markers, payload)
  return <figure className="hazard-result-figure">
    <div className="hazard-result-overlay">
      <img alt={alt} src={imageUrl} />
      <svg
        aria-hidden="true"
        className="hazard-result-regions"
        preserveAspectRatio="none"
        viewBox="0 0 1 1"
      >
        {payload.targetRegions.flatMap((region) => region.polygons.map((polygon, index) => <polygon
          className="hazard-result-region hazard-result-region--target"
          data-inventory-id={region.inventoryId}
          key={`target:${region.inventoryId}:${index}`}
          points={polygon.map(([x, y]) => `${x},${y}`).join(" ")}
          vectorEffect="non-scaling-stroke"
        />))}
        {payload.decoyRegions.flatMap((region) => region.polygons.map((polygon, index) => <polygon
          className="hazard-result-region hazard-result-region--decoy"
          data-inventory-id={region.inventoryId}
          key={`decoy:${region.inventoryId}:${index}`}
          points={polygon.map(([x, y]) => `${x},${y}`).join(" ")}
          vectorEffect="non-scaling-stroke"
        />))}
      </svg>
      {assessment.markers.map((marker) => <span
        aria-hidden="true"
        className={`hazard-player__marker hazard-result-marker hazard-result-marker--${marker.kind.replaceAll("_", "-")}`}
        data-marker-kind={marker.kind}
        data-marker-x={marker.marker.x}
        data-marker-y={marker.marker.y}
        key={marker.marker.id}
        style={{
          left: `${marker.marker.x * 100}%`,
          position: "absolute",
          top: `${marker.marker.y * 100}%`,
          transform: "translate(-50%, -50%)"
        }}
      >{marker.markerNumber}</span>)}
    </div>
    <figcaption>
      Reviewed scene overlay. Numbered markers match the marker feedback list; solid regions
      identify authored correction targets and dashed regions identify authored decoys.
    </figcaption>
  </figure>
}
