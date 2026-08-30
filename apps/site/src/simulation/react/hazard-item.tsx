import { useCallback, useRef, useState, type MouseEvent as ReactMouseEvent } from "react"
import type { SimulationPlayerController } from "../controller.ts"
import type {
  SimulationHazardSessionItem,
  SimulationResponse
} from "../model.ts"

const markerStep = 0.025

export const SimulationHazardItem = ({
  answerEditBlocked,
  controller,
  item,
  position,
  response,
  saving,
  total,
  visualAssetUrl
}: {
  readonly answerEditBlocked: boolean
  readonly controller: SimulationPlayerController
  readonly item: SimulationHazardSessionItem
  readonly position: number
  readonly response: SimulationResponse | undefined
  readonly saving: boolean
  readonly total: number
  readonly visualAssetUrl: string | null
}) => {
  const [zoom, setZoom] = useState(1)
  const viewportRef = useRef<HTMLDivElement>(null)
  const markers = response?.markers ?? []
  const selectedZoneOrders = new Set(response?.selectedZoneOrders ?? [])
  const selectedCount = item.mode === "visual" ? markers.length : selectedZoneOrders.size
  const panViewport = useCallback((horizontal: -1 | 0 | 1, vertical: -1 | 0 | 1) => {
    const viewport = viewportRef.current
    if (viewport === null) return
    viewport.scrollBy({
      behavior: "auto",
      left: horizontal * Math.max(44, viewport.clientWidth * 0.4),
      top: vertical * Math.max(44, viewport.clientHeight * 0.4)
    })
  }, [])
  const resetView = useCallback(() => {
    setZoom(1)
    viewportRef.current?.scrollTo({ behavior: "auto", left: 0, top: 0 })
  }, [])
  const addPointerMarker = (event: ReactMouseEvent<HTMLDivElement>): void => {
    if (answerEditBlocked || event.button !== 0) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (bounds.width <= 0 || bounds.height <= 0) return
    controller.dispatch({
      tag: "add-hazard-marker",
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height
    })
  }

  return <article className="hazard-player" aria-labelledby="simulation-question-heading">
    <header className="hazard-player__prompt">
      <p className="eyebrow">Practice simulation · Hazard item {position} of {total} · {item.mode === "visual" ? "visual" : "keyboard, no image"}</p>
      <h1 id="simulation-question-heading">Inspect the {item.scene.environment}</h1>
      <p>{item.scene.neutralPreAnswer.overview}</p>
      <p>{item.mode === "visual"
        ? "Mark every location that concerns you. Expected counts and feedback stay unavailable until the entire simulation is submitted."
        : "Select every zone that concerns you. This text version covers the same knowledge, but it is not the same task as marking the image."}</p>
    </header>

    {item.mode === "visual" ? <section aria-labelledby="simulation-visual-scene-heading" className="hazard-player__visual">
      <h2 id="simulation-visual-scene-heading">Scene image</h2>
      {visualAssetUrl === null ? <div className="feedback feedback-error" role="alert">
        <h3>Exact scene image unavailable</h3>
        <p>This item cannot accept markers without the scene image saved on this device.</p>
      </div> : <>
        <div aria-label="Scene view controls" className="hazard-player__viewport-controls">
          <button className="button button-secondary" disabled={zoom <= 1} onClick={() => setZoom((current) => Math.max(1, current - 0.25))} type="button">Zoom out</button>
          <button className="button button-secondary" disabled={zoom >= 2.5} onClick={() => setZoom((current) => Math.min(2.5, current + 0.25))} type="button">Zoom in</button>
          <button aria-controls="simulation-scene-viewport" className="button button-secondary" disabled={zoom <= 1} onClick={() => panViewport(-1, 0)} type="button">Pan left</button>
          <button aria-controls="simulation-scene-viewport" className="button button-secondary" disabled={zoom <= 1} onClick={() => panViewport(1, 0)} type="button">Pan right</button>
          <button aria-controls="simulation-scene-viewport" className="button button-secondary" disabled={zoom <= 1} onClick={() => panViewport(0, -1)} type="button">Pan up</button>
          <button aria-controls="simulation-scene-viewport" className="button button-secondary" disabled={zoom <= 1} onClick={() => panViewport(0, 1)} type="button">Pan down</button>
          <button className="button button-secondary" disabled={zoom === 1} onClick={resetView} type="button">Reset view</button>
          <span aria-live="polite">{Math.round(zoom * 100)}% view</span>
        </div>
        <p id="simulation-scene-pointer-help">Pointer users may place markers on the image. Keyboard and touch users can add a centered marker and move it below. Use the directional pan controls to inspect a zoomed scene without dragging.</p>
        <div
          aria-label="Pannable simulation hazard scene"
          className="hazard-player__viewport"
          id="simulation-scene-viewport"
          ref={viewportRef}
          role="region"
          style={{
            aspectRatio: "3 / 2",
            maxWidth: "100%",
            overflow: "auto",
            overscrollBehavior: "contain"
          }}
          tabIndex={0}
        >
          <div
            aria-describedby="simulation-scene-pointer-help"
            className="hazard-player__image-layer"
            onClick={addPointerMarker}
            style={{
              cursor: answerEditBlocked ? "default" : "crosshair",
              position: "relative",
              width: `${zoom * 100}%`
            }}
          >
            <img alt={item.scene.neutralPreAnswer.overview} draggable={false} src={visualAssetUrl} style={{ display: "block", height: "auto", width: "100%" }} />
            {markers.map((marker, index) => <span
              aria-hidden="true"
              className="hazard-player__marker"
              key={marker.id}
              style={{
                left: `${marker.x * 100}%`,
                position: "absolute",
                top: `${marker.y * 100}%`,
                transform: "translate(-50%, -50%)"
              }}
            >{index + 1}</span>)}
          </div>
        </div>
        <button className="button button-secondary" disabled={answerEditBlocked || markers.length >= 64} onClick={() => controller.dispatch({ tag: "add-hazard-marker", x: 0.5, y: 0.5 })} type="button">Add marker at center</button>
      </>}
      <section aria-labelledby="simulation-marker-list-heading" className="hazard-player__markers">
        <h3 id="simulation-marker-list-heading">Your markers</h3>
        <p aria-live="polite">{markers.length === 0 ? "No markers placed." : `${markers.length} ${markers.length === 1 ? "marker" : "markers"} placed.`}</p>
        {markers.length === 0 ? null : <ol className="hazard-player__marker-list">
          {markers.map((marker, index) => <li key={marker.id}>
            <p><strong>Marker {index + 1}</strong>: {Math.round(marker.x * 100)}% from the left, {Math.round(marker.y * 100)}% from the top</p>
            <div aria-label={`Move marker ${index + 1}`} className="hazard-player__marker-moves">
              {([
                ["left", -markerStep, 0],
                ["right", markerStep, 0],
                ["up", 0, -markerStep],
                ["down", 0, markerStep]
              ] as const).map(([direction, deltaX, deltaY]) => <button
                aria-label={`Move marker ${index + 1} ${direction}`}
                disabled={answerEditBlocked}
                key={direction}
                onClick={() => controller.dispatch({
                  tag: "move-hazard-marker",
                  markerId: marker.id,
                  deltaX,
                  deltaY
                })}
                type="button"
              >{direction[0]?.toUpperCase()}{direction.slice(1)}</button>)}
              <button aria-label={`Remove marker ${index + 1}`} disabled={answerEditBlocked} onClick={() => controller.dispatch({ tag: "remove-hazard-marker", markerId: marker.id })} type="button">Remove</button>
            </div>
          </li>)}
        </ol>}
      </section>
    </section> : <fieldset className="hazard-player__zones" disabled={answerEditBlocked}>
      <legend>Observable zones</legend>
      <p>Select a zone when its neutral description gives you concern. Selecting does not reveal whether the zone is safe or unsafe.</p>
      <ol>{item.scene.neutralPreAnswer.zones.map((zone) => <li key={zone.order}>
        <label>
          <input checked={selectedZoneOrders.has(zone.order)} name="simulation-hazard-zone" onChange={() => controller.dispatch({ tag: "toggle-hazard-zone", zoneOrder: zone.order })} type="checkbox" value={zone.order} />
          <strong>Zone {zone.order}: {zone.label}</strong>
          <span>{zone.description}</span>
        </label>
      </li>)}</ol>
    </fieldset>}

    <div className="question-controls">
      <label>
        <input
          checked={response?.zeroHazardsConfirmed === true}
          disabled={answerEditBlocked || selectedCount > 0}
          onChange={() => controller.dispatch({ tag: "toggle-zero-hazards" })}
          type="checkbox"
        /> I found no concerning locations or zones in this scene
      </label>
      <button
        aria-pressed={response?.reviewIntent === "flagged"}
        className="button button-secondary"
        disabled={answerEditBlocked}
        onClick={() => controller.dispatch({ tag: "toggle-flag" })}
        type="button"
      >{response?.reviewIntent === "flagged" ? "Flagged for review" : "Flag this item"}</button>
      <span aria-live="polite" className="source-note">{saving ? "Saving locally…" : "Saved on this device"}</span>
    </div>
  </article>
}
