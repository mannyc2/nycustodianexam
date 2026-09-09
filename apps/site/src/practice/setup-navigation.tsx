import { setupDestinations, type SetupDestination } from "./setup-navigation.ts"

export const SetupNavigation = ({ current }: { readonly current: SetupDestination }) =>
  <nav className="setup-navigation" aria-label="Practice setup">
    {setupDestinations.map(({ id, label, href }) => <a key={id} href={href}
      className={`button ${current === id ? "button-primary" : "button-secondary"}`}
      aria-current={current === id ? "page" : undefined}>{label}</a>)}
  </nav>
