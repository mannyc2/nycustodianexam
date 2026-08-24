import { draftFromState, isEditableHazardState } from "../state.ts"
import { useHazardPlayer } from "./context.tsx"

export const HazardZoneNavigator = () => {
  const { actions, meta, scene, state } = useHazardPlayer()
  const editable = isEditableHazardState(state)
  const selected = new Set(draftFromState(state).selectedZoneOrders)

  return (
    <fieldset
      aria-describedby={`${meta.instanceId}-zone-help ${meta.statusId}`}
      className="hazard-player__zones"
      disabled={!editable}
    >
      <legend>Observable zones</legend>
      <p id={`${meta.instanceId}-zone-help`}>
        Select a zone when its neutral description gives you concern. Selecting does not submit.
      </p>
      <ol>
        {scene.neutralPreAnswer.zones.map((zone) => (
          <li key={zone.order}>
            <label>
              <input
                checked={selected.has(zone.order)}
                name="hazard-zone"
                onChange={() => actions.toggleZone(zone.order)}
                type="checkbox"
                value={zone.order}
              />
              <strong>Zone {zone.order}: {zone.label}</strong>
              <span>{zone.description}</span>
            </label>
          </li>
        ))}
      </ol>
    </fieldset>
  )
}
