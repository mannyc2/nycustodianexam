type NavigationGesture = Pick<
  MouseEvent,
  "altKey" | "button" | "ctrlKey" | "defaultPrevented" | "metaKey" | "shiftKey"
>

type SessionAnchor = Pick<HTMLAnchorElement, "download" | "href" | "target">

export const shouldReplaceSessionNavigation = (
  event: NavigationGesture,
  anchor: SessionAnchor,
  currentOrigin: string
): boolean => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    anchor.download.length > 0 ||
    (anchor.target.length > 0 && anchor.target !== "_self")
  ) {
    return false
  }

  try {
    return new URL(anchor.href, currentOrigin).origin === currentOrigin
  } catch {
    return false
  }
}

export const installSessionNavigation = (): (() => void) => {
  const onClick = (event: MouseEvent): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const anchor = target.closest<HTMLAnchorElement>('a[data-session-history="replace"]')
    if (
      anchor === null ||
      !shouldReplaceSessionNavigation(event, anchor, window.location.origin)
    ) {
      return
    }

    event.preventDefault()
    window.location.replace(anchor.href)
  }

  document.addEventListener("click", onClick)
  return () => document.removeEventListener("click", onClick)
}
