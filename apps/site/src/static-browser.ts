// Progressive enhancements for generated reference documents. The complete
// references and ordinary links remain available if this module cannot load.
// This entry deliberately has no study runtime, storage, or renderer imports.

const replaceQuery = (key: string, value: string | null): void => {
  const url = new URL(window.location.href)
  if (value === null) url.searchParams.delete(key)
  else url.searchParams.set(key, value)
  window.history.replaceState(window.history.state, "", url)
}

const keyboardTabs = (buttons: readonly HTMLButtonElement[]): void => {
  for (const [index, button] of buttons.entries()) {
    button.addEventListener("keydown", (event) => {
      const next = event.key === "ArrowRight" ? (index + 1) % buttons.length
        : event.key === "ArrowLeft" ? (index + buttons.length - 1) % buttons.length
          : event.key === "Home" ? 0
            : event.key === "End" ? buttons.length - 1
              : null
      if (next === null) return
      event.preventDefault()
      buttons[next]?.focus()
      buttons[next]?.click()
    })
  }
}

const enhanceAtlas = (root: HTMLElement): void => {
  const filters = root.querySelector<HTMLElement>("[data-atlas-filters]")
  const count = root.querySelector<HTMLElement>("[data-atlas-count]")
  const panel = root.querySelector<HTMLElement>("#atlas-tools")
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-atlas-family]")]
  const cards = [...root.querySelectorAll<HTMLElement>("[data-tool-family]")]
  const compactSelect = root.querySelector<HTMLSelectElement>("[data-atlas-select]")
  const compactField = root.querySelector<HTMLElement>("[data-atlas-select-field]")
  const compact = window.matchMedia("(max-width: 47.99rem)")
  if (filters === null || count === null || panel === null || buttons.length === 0) return

  const imageRecovery = root.querySelector<HTMLElement>("[data-atlas-image-recovery]")
  const updateImageRecovery = (): void => {
    if (imageRecovery !== null) imageRecovery.hidden = !cards.some(card => !card.hidden && card.hasAttribute("data-image-unavailable"))
  }
  for (const card of cards) {
    const illustration = card.querySelector<HTMLImageElement>("img")
    const notice = card.querySelector<HTMLElement>("[data-atlas-image-notice]")
    if (illustration === null || notice === null) continue
    const unavailable = (): void => {
      illustration.hidden = true
      notice.hidden = false
      card.setAttribute("data-image-unavailable", "")
      updateImageRecovery()
    }
    illustration.addEventListener("error", unavailable)
    if (illustration.complete && illustration.naturalWidth === 0) unavailable()
  }

  const select = (button: HTMLButtonElement, updateUrl: boolean): void => {
    const family = button.dataset.atlasFamily ?? "all"
    for (const candidate of buttons) {
      candidate.setAttribute("aria-selected", String(candidate === button))
      candidate.tabIndex = candidate === button ? 0 : -1
    }
    let visible = 0
    for (const card of cards) {
      card.hidden = family !== "all" && card.dataset.toolFamily !== family
      if (!card.hidden) visible += 1
    }
    updateImageRecovery()
    if (compactSelect !== null) compactSelect.value = family
    panel.setAttribute("aria-labelledby", compact.matches ? "atlas-family-select" : button.id)
    count.textContent = family === "all"
      ? `Showing all ${visible} illustrated tools.`
      : `Showing ${visible} illustrated ${visible === 1 ? "tool" : "tools"} in ${family}.`
    if (updateUrl) replaceQuery("family", family === "all" ? null : family)
  }

  for (const button of buttons) button.addEventListener("click", () => select(button, true))
  keyboardTabs(buttons)
  const adaptControls = (): void => {
    if (compact.matches) panel.removeAttribute("role")
    else panel.setAttribute("role", "tabpanel")
    const selected = buttons.find((button) => button.getAttribute("aria-selected") === "true")
    if (selected !== undefined) panel.setAttribute("aria-labelledby", compact.matches ? "atlas-family-select" : selected.id)
  }
  compactSelect?.addEventListener("change", () => {
    const selected = buttons.find((button) => button.dataset.atlasFamily === compactSelect.value)
    if (selected !== undefined) select(selected, true)
  })
  compact.addEventListener("change", adaptControls)
  adaptControls()
  const family = new URL(window.location.href).searchParams.get("family")
  const initial = buttons.find((button) => button.dataset.atlasFamily === family) ?? buttons[0]
  if (initial !== undefined) select(initial, false)
  filters.hidden = false
  if (compactField !== null) compactField.hidden = false
}

const enhanceExams = (root: HTMLElement): void => {
  const choices = [...root.querySelectorAll<HTMLAnchorElement>("[data-exam-choice]")]
  const panels = [...root.querySelectorAll<HTMLElement>("[data-exam-panel]")]
  const rows = [...root.querySelectorAll<HTMLElement>("[data-exam-row]")]
  const prompt = root.querySelector<HTMLElement>("[data-exam-prompt]")
  const search = root.querySelector<HTMLInputElement>("[data-exam-search]")
  const searchField = root.querySelector<HTMLElement>("[data-exam-search-field]")
  const filterDisclosure = root.querySelector<HTMLDetailsElement>("[data-exam-filter-disclosure]")
  const count = root.querySelector<HTMLElement>("[data-exam-count]")
  const empty = root.querySelector<HTMLElement>("[data-exam-empty]")
  if (prompt === null || search === null || searchField === null || count === null || empty === null) return

  const show = (id: string | null, focus: boolean): void => {
    const selected = panels.find((panel) => panel.id === id)
    for (const panel of panels) panel.hidden = panel !== selected
    for (const choice of choices) {
      if (choice.dataset.examChoice === selected?.id) choice.setAttribute("aria-current", "true")
      else choice.removeAttribute("aria-current")
    }
    prompt.hidden = selected !== undefined
    if (focus) selected?.focus()
  }

  for (const choice of choices) {
    choice.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      const id = choice.dataset.examChoice ?? null
      show(id, true)
      replaceQuery("record", id)
    })
  }

  for (const panel of panels) {
    const tabs = panel.querySelector<HTMLElement>("[data-exam-tabs]")
    const buttons = [...panel.querySelectorAll<HTMLButtonElement>("[data-record-tab]")]
    const sections = [...panel.querySelectorAll<HTMLElement>("[data-record-tab-panel]")]
    if (tabs === null || buttons.length === 0) continue
    const selectTab = (button: HTMLButtonElement): void => {
      for (const candidate of buttons) {
        candidate.setAttribute("aria-selected", String(candidate === button))
        candidate.tabIndex = candidate === button ? 0 : -1
      }
      for (const section of sections) {
        section.hidden = section.dataset.recordTabPanel !== button.dataset.recordTab
      }
    }
    for (const button of buttons) {
      button.addEventListener("click", () => selectTab(button))
      const section = sections.find((candidate) => candidate.id === button.getAttribute("aria-controls"))
      section?.setAttribute("role", "tabpanel")
      section?.setAttribute("aria-labelledby", button.id)
    }
    keyboardTabs(buttons)
    const first = buttons[0]
    if (first !== undefined) selectTab(first)
    tabs.hidden = false
  }

  const statusGroup = root.querySelector<HTMLElement>("[data-exam-status-filters]")
  const statusButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-exam-status-filter]")]
  let status = "all"
  const filter = (): void => {
    const query = search.value.trim().toLocaleLowerCase()
    let visible = 0
    for (const row of rows) {
      row.hidden = !(row.dataset.examSearchText ?? "").includes(query) || (status !== "all" && row.dataset.examStatus !== status)
      if (!row.hidden) visible += 1
    }
    const selected = choices.find((choice) => choice.hasAttribute("aria-current"))
    if (selected?.closest<HTMLElement>("[data-exam-row]")?.hidden === true) {
      show(null, false)
      replaceQuery("record", null)
    }
    count.textContent = `${visible} ${visible === 1 ? "entry" : "entries"} in the published registry${query.length > 0 || status !== "all" ? " match these filters" : ""}.`
    for (const button of statusButtons) button.setAttribute("aria-pressed", String(button.dataset.examStatusFilter === status))
    empty.hidden = visible !== 0
    prompt.hidden = visible === 0 || choices.some((choice) => choice.hasAttribute("aria-current"))
  }
  for (const button of statusButtons) button.addEventListener("click", () => {
    status = button.dataset.examStatusFilter ?? "all"
    replaceQuery("filing", status === "all" ? null : status)
    filter()
  })
  search.addEventListener("input", filter)
  root.querySelector<HTMLButtonElement>("[data-exam-clear]")?.addEventListener("click", () => {
    search.value = ""
    status = "all"
    replaceQuery("filing", null)
    filter()
    if (filterDisclosure !== null) filterDisclosure.open = true
    search.focus()
  })
  const url = new URL(window.location.href)
  const requestedStatus = url.searchParams.get("filing")
  status = statusButtons.some((button) => button.dataset.examStatusFilter === requestedStatus) ? requestedStatus! : "all"
  show(url.searchParams.get("record") ?? url.hash.slice(1), false)
  filter()
  if (statusGroup !== null) statusGroup.hidden = false
  searchField.hidden = false
  if (filterDisclosure !== null) {
    const desktop = window.matchMedia("(min-width: 48rem)")
    filterDisclosure.open = desktop.matches || status !== "all"
    filterDisclosure.hidden = false
    desktop.addEventListener("change", () => {
      if (!desktop.matches) return
      const summaryFocused = document.activeElement === filterDisclosure.querySelector("summary")
      filterDisclosure.open = true
      if (summaryFocused) search.focus()
    })
  }
}

const atlas = document.querySelector<HTMLElement>("[data-atlas-browser]")
if (atlas !== null) enhanceAtlas(atlas)
const exams = document.querySelector<HTMLElement>("[data-exam-browser]")
if (exams !== null) enhanceExams(exams)
