import { useLayoutEffect, useRef, useState } from "react"
import type { PrecommitQuestion } from "@nycustodian/content/model"

type Illustration = NonNullable<PrecommitQuestion["illustration"]>

const IllustrationImage = ({ illustration }: { readonly illustration: Illustration }) => {
  const figure = useRef<HTMLElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [zoom, setZoom] = useState(100)
  const previousZoom = useRef(100)
  useLayoutEffect(() => {
    const element = viewport.current
    if (element !== null) {
      const ratio = zoom / previousZoom.current
      element.scrollTo({
        left: zoom === 100 ? 0 : (element.scrollLeft + element.clientWidth / 2) * ratio - element.clientWidth / 2,
        top: zoom === 100 ? 0 : (element.scrollTop + element.clientHeight / 2) * ratio - element.clientHeight / 2
      })
    }
    previousZoom.current = zoom
  }, [zoom])
  const web = illustration.derivatives.find(asset => asset.kind === "web")
  const phone = illustration.derivatives.find(asset => asset.kind === "phone")
  const resetView = () => {
    setZoom(100)
    viewport.current?.scrollTo({ top: 0, left: 0 })
  }
  if (web === undefined) return <p role="alert">The question illustration is unavailable. Skip this question for now.</p>
  return <figure ref={figure} className="question-illustration question-illustration-interactive" tabIndex={-1} aria-label="Question illustration">
    {failed ? <div className="notice notice-warning" role="alert">
      <p>The question illustration could not load. Try again to reload the image.</p>
      <button className="button button-secondary" type="button" onClick={() => {
        figure.current?.focus()
        resetView()
        setAttempt(value => value + 1)
        setFailed(false)
      }}>Try image again</button>
    </div> : <>
      <div ref={viewport} className="question-image-viewport" role="region" aria-label="Scrollable question illustration" tabIndex={0}>
        <div className="question-image-stage" style={{ width: `${zoom}%`, height: `${zoom}%` }}>
          <picture key={attempt}>
            {phone === undefined ? null : <source media="(max-width: 30rem)" srcSet={`/${phone.path}`} />}
            <img src={`/${web.path}`} alt={illustration.neutralDescription} onError={() => setFailed(true)} />
          </picture>
        </div>
      </div>
      <div className="question-image-controls" role="group" aria-label="Illustration zoom">
        <button className="button button-secondary" type="button" aria-label="Zoom out" disabled={zoom === 100} onClick={() => setZoom(value => Math.max(100, value - 50))}>−</button>
        <button className="button button-secondary" type="button" aria-label="Zoom in" disabled={zoom === 400} onClick={() => setZoom(value => Math.min(400, value + 50))}>+</button>
        <button className="button button-secondary" type="button" onClick={resetView}>Reset view</button>
        <span role="status">{zoom === 100 ? "Whole image" : `${zoom}%`}</span>
      </div>
    </>}
    <figcaption>
      <details className="question-image-description"><summary>Read image description</summary><p>{illustration.neutralDescription}</p></details>
    </figcaption>
  </figure>
}

export const QuestionIllustration = ({ illustration }: { readonly illustration: Illustration | undefined }) =>
  illustration === undefined ? null : <IllustrationImage key={illustration.masterSha256} illustration={illustration} />
