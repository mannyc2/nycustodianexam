export const trustedCurrentShellNavigationPaths = [
  "/",
  "/offline/",
  "/report/",
  "/settings/",
  "/status/",
  "/transparency/",
  "/transparency/corrections/",
  "/transparency/foil/",
  "/transparency/privacy/",
  "/transparency/security/",
  "/simulations/session/sim-shell0000/question/1/",
  "/simulations/session/sim-shell0000/results/",
  "/print/preview/print-shell0000/"
] as const

export const trustedCurrentShellNavigation: ReadonlySet<string> = new Set(
  trustedCurrentShellNavigationPaths
)
