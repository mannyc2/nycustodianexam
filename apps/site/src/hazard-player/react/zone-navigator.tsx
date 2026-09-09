import { NeutralZoneInputs } from "./neutral-zone-inputs.tsx"
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
        The order carries no meaning and the number of zones is not a hint.
      </p>
      <NeutralZoneInputs zones={scene.neutralPreAnswer.zones} selected={selected} name="hazard-zone" onToggle={actions.toggleZone} />
    </fieldset>
  )
}
