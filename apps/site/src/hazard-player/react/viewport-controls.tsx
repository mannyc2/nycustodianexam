import { useCallback, useRef, useState } from "react"

export const useSceneViewport = () => {
  const [zoom, setZoom] = useState(1)
  const viewportRef = useRef<HTMLDivElement>(null)
  const panViewport = useCallback((horizontal: -1 | 0 | 1, vertical: -1 | 0 | 1) => {
    const viewport = viewportRef.current
    if (viewport === null) return
    viewport.scrollBy({ behavior: "auto", left: horizontal * Math.max(44, viewport.clientWidth * 0.4), top: vertical * Math.max(44, viewport.clientHeight * 0.4) })
  }, [])
  const resetView = useCallback(() => {
    setZoom(1)
    viewportRef.current?.scrollTo({ behavior: "auto", left: 0, top: 0 })
  }, [])
  return { zoom, setZoom, viewportRef, panViewport, resetView }
}

const directions = [["left", -1, 0], ["right", 1, 0], ["up", 0, -1], ["down", 0, 1]] as const

export const SceneViewportControls = ({ viewportId, view }: {
  readonly viewportId: string
  readonly view: ReturnType<typeof useSceneViewport>
}) => <div aria-label="Scene view controls" className="hazard-player__viewport-controls">
  <button className="button button-secondary" disabled={view.zoom <= 1} onClick={() => view.setZoom((current) => Math.max(1, current - 0.25))} type="button">Zoom out</button>
  <button className="button button-secondary" disabled={view.zoom >= 2.5} onClick={() => view.setZoom((current) => Math.min(2.5, current + 0.25))} type="button">Zoom in</button>
  {directions.map(([direction, horizontal, vertical]) => <button aria-controls={viewportId} className="button button-secondary" disabled={view.zoom <= 1} onClick={() => view.panViewport(horizontal, vertical)} type="button" key={direction}>Pan {direction}</button>)}
  <button className="button button-secondary" disabled={view.zoom === 1} onClick={view.resetView} type="button">Reset view</button>
  <span aria-live="polite">{Math.round(view.zoom * 100)}% view</span>
</div>
