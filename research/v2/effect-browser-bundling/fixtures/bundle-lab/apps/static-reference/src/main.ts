const button = document.querySelector<HTMLButtonElement>("#toggle")
const note = document.querySelector<HTMLElement>("#note")

if (button && note) {
  button.addEventListener("click", () => {
    const nextExpanded = button.getAttribute("aria-expanded") !== "true"
    button.setAttribute("aria-expanded", String(nextExpanded))
    note.hidden = !nextExpanded
  })
}
