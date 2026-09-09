interface NeutralZone {
  readonly order: number
  readonly label: string
  readonly description: string
}

/** Neutral authored observations only; callers own save and feedback behavior. */
export const NeutralZoneInputs = ({ zones, selected, name, onToggle }: {
  readonly zones: readonly NeutralZone[]
  readonly selected: ReadonlySet<number>
  readonly name: string
  readonly onToggle: (order: number) => void
}) => <ol>{zones.map((zone) => <li key={zone.order}>
  <label>
    <input checked={selected.has(zone.order)} name={name} onChange={() => onToggle(zone.order)} type="checkbox" value={zone.order} />
    <strong>Zone {zone.order}: {zone.label}</strong>
    <span>{zone.description}</span>
  </label>
</li>)}</ol>
