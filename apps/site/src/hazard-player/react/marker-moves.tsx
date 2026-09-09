const markerStep = 0.025
const directions = [
  ["Left", -markerStep, 0],
  ["Right", markerStep, 0],
  ["Up", 0, -markerStep],
  ["Down", 0, markerStep]
] as const

export const MarkerMoves = ({ markerId, number, disabled, onMove, onRemove }: {
  readonly markerId: string
  readonly number: number
  readonly disabled: boolean
  readonly onMove: (id: string, deltaX: number, deltaY: number) => void
  readonly onRemove: (id: string) => void
}) => <div aria-label={`Move marker ${number}`} className="hazard-player__marker-moves">
  {directions.map(([direction, deltaX, deltaY]) => <button
    aria-label={`Move marker ${number} ${direction.toLowerCase()}`}
    disabled={disabled}
    key={direction}
    onClick={() => onMove(markerId, deltaX, deltaY)}
    type="button"
  >{direction}</button>)}
  <button aria-label={`Remove marker ${number}`} disabled={disabled} onClick={() => onRemove(markerId)} type="button">Remove</button>
</div>
