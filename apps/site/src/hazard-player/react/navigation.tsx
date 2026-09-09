export interface HazardNavigationLinks {
  readonly previousPath: string | undefined
  readonly nextPath: string | undefined
  readonly endLabel: string
}

/** Contents of the generated navigation landmark, also used by custom drills. */
export const HazardNavigation = ({ previousPath, nextPath, endLabel }: HazardNavigationLinks) => <>
  {previousPath === undefined ? <span /> : <a data-session-history="replace" href={previousPath}>← Previous scene</a>}
  {nextPath === undefined ? <span>{endLabel}</span> : <a data-session-history="replace" href={nextPath}>Next scene →</a>}
</>
