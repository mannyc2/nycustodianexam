// Native disclosure links work without this keyboard and dismissal enhancement.
export const enhanceSiteNavigation = (): void => {
  const libraryMenu = document.querySelector<HTMLDetailsElement>("[data-library-menu]")
  if (libraryMenu !== null) {
    libraryMenu.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return
      libraryMenu.open = false
      libraryMenu.querySelector("summary")?.focus()
    })
    const closeOutside = (event: Event): void => {
      if (!event.composedPath().includes(libraryMenu)) {
        libraryMenu.open = false
      }
    }
    document.addEventListener("pointerdown", closeOutside)
    document.addEventListener("focusin", closeOutside)
  }
}
