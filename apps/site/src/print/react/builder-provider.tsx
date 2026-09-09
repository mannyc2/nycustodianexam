import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  createContext, use, type ReactNode
} from "react"
import type { PrintBuilderController } from "../controller.ts"
import {
  printProductAvailability,
  printProductCapacity,
  printProductFilterOptions
} from "../generation.ts"
import {
  PrintSettings,
  type PrintBuilderBootstrap,
  type PrintProduct,
  type SupportedPrintProduct
} from "../model.ts"
import { studyContentProfileId } from "../../study-content.ts"
import { deterministicSeedMaxLength } from "../../deterministic-seed.ts"

const products: ReadonlyArray<{ readonly id: PrintProduct; readonly label: string }> = [
  { id: "blank-answer-sheet", label: "Blank answer sheet" },
  { id: "multiple-choice-questions", label: "Original multiple-choice questions" },
  { id: "answer-key", label: "Separate answer key" },
  { id: "explanations-and-sources", label: "Separate explanations and source references" },
  { id: "tool-family-contrast-cards", label: "Tool-family contrast cards" },
  { id: "hazard-worksheet", label: "Blank hazard worksheet" },
  { id: "annotated-hazard-answer-packet", label: "Annotated hazard-answer packet" },
  { id: "text-equivalent-set", label: "Text-equivalent/nonvisual set" },
  { id: "announcement-profile-fact-sheet", label: "Announcement-profile fact sheet" },
  { id: "correction-change-log-excerpt", label: "Correction/change-log excerpt" }
]

const usePrintBuilderValue = ({
  bootstrap,
  controller
}: {
  readonly bootstrap: PrintBuilderBootstrap
  readonly controller: PrintBuilderController
}) => {
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getHydrationSnapshot
  )
  const factProfiles = bootstrap.profiles.filter((profile) => profile.announcementFactSheet !== null)
  const [factProfileId, setFactProfileId] = useState(factProfiles[0]?.id ?? "")
  const [product, setProduct] = useState<SupportedPrintProduct>("multiple-choice-questions")
  const profileId = product === "announcement-profile-fact-sheet" ? factProfileId : studyContentProfileId
  const selectedProfile = bootstrap.profiles.find((profile) => profile.id === profileId)
  const [count, setCount] = useState(Math.min(10, bootstrap.questions.length))
  const [seed, setSeed] = useState("practice-1")
  const [paper, setPaper] = useState<"us-letter" | "a4">("us-letter")
  const [margin, setMargin] = useState<"standard" | "wide">("standard")
  const [printSize, setPrintSize] = useState<"normal" | "large">("normal")
  const [grayscalePreview, setGrayscalePreview] = useState(true)
  const [includeImages, setIncludeImages] = useState(true)
  const [useNonvisualQuestions, setUseNonvisualQuestions] = useState(false)
  const [answerKeyPlacement, setAnswerKeyPlacement] = useState<"separate-job" | "new-section">("separate-job")
  const [includeExplanations, setIncludeExplanations] = useState(false)
  const [includeSources, setIncludeSources] = useState(true)
  const [filter, setFilter] = useState("")
  const errorRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (snapshot.focusRequest?.target === "error-summary") errorRef.current?.focus()
    if (snapshot.focusRequest !== null) {
      controller.acknowledgeViewRequest(snapshot.focusRequest.id)
    }
  }, [controller, snapshot.focusRequest])

  useEffect(() => {
    if (snapshot.announcementRequest !== null) {
      controller.acknowledgeViewRequest(snapshot.announcementRequest.id)
    }
  }, [controller, snapshot.announcementRequest])

  const availability = useMemo(
    () => new Map(products.map(({ id }) => [id, printProductAvailability(id, bootstrap, id === "announcement-profile-fact-sheet" ? factProfileId : studyContentProfileId)])),
    [bootstrap, factProfileId]
  )
  const filterOptions = useMemo(
    () => printProductFilterOptions(product, bootstrap, profileId),
    [bootstrap, product, profileId]
  )
  useEffect(() => {
    if (filter !== "" && !filterOptions.includes(filter)) setFilter("")
  }, [filter, filterOptions])
  const capacity = printProductCapacity(product, bootstrap, profileId, filter === "" ? [] : [filter])
  const countUnit = product === "tool-family-contrast-cards"
    ? "families"
    : product === "hazard-worksheet" || product === "annotated-hazard-answer-packet" || product === "text-equivalent-set"
      ? "scenes"
      : product === "announcement-profile-fact-sheet"
        ? "profiles"
        : product === "correction-change-log-excerpt"
          ? "records"
          : "questions"
  const imageProduct = product === "tool-family-contrast-cards" ||
    product === "hazard-worksheet" || product === "annotated-hazard-answer-packet"
  const appendedQuestionAnswers = product === "multiple-choice-questions" &&
    answerKeyPlacement === "new-section"
  const sourceProduct = product === "explanations-and-sources" ||
    product === "annotated-hazard-answer-packet" ||
    product === "text-equivalent-set" ||
    appendedQuestionAnswers && includeExplanations
  useEffect(() => {
    if (selectedProfile === undefined || capacity === 0) return
    setCount((current) => Math.max(1, Math.min(current, Math.max(1, capacity))))
  }, [capacity, selectedProfile])
  const disabled = selectedProfile === undefined || capacity === 0 ||
    snapshot.state.tag === "generating"

  const generate = (): void => {
    if (disabled || !Number.isSafeInteger(count) || count < 1 || count > capacity) return
    if (seed.trim().length === 0 || seed.trim().length > deterministicSeedMaxLength) return
    controller.generate(new PrintSettings({
      profileId,
      product,
      count,
      seed: seed.trim(),
      paper,
      margin,
      printSize,
      grayscalePreview,
      includeImages: imageProduct && includeImages,
      ...(product === "multiple-choice-questions" && useNonvisualQuestions ? { questionPresentation: "nonvisual" as const } : {}),
      answerKeyPlacement: product === "multiple-choice-questions"
        ? answerKeyPlacement
        : "separate-job",
      includeExplanations: product === "explanations-and-sources" ||
        appendedQuestionAnswers && includeExplanations,
      includeSources: sourceProduct && includeSources,
      filters: filter === "" ? [] : [filter]
    }))
  }

  return {
    state: { snapshot, products, factProfiles, factProfileId, product, selectedProfile, count, seed, paper, margin, printSize, grayscalePreview, includeImages, useNonvisualQuestions, answerKeyPlacement, includeExplanations, includeSources, filter, availability, filterOptions, capacity, countUnit, imageProduct, appendedQuestionAnswers, sourceProduct, disabled },
    actions: { setFactProfileId, setProduct, setCount, setSeed, setPaper, setMargin, setPrintSize, setGrayscalePreview, setIncludeImages, setUseNonvisualQuestions, setAnswerKeyPlacement, setIncludeExplanations, setIncludeSources, setFilter, generate },
    meta: { errorRef }
  }
}
const PrintBuilderContext = createContext<ReturnType<typeof usePrintBuilderValue> | null>(null)
export const usePrintBuilder = () => {
  const value = use(PrintBuilderContext)
  if (value === null) throw new Error("Print builder pieces require PrintBuilderProvider")
  return value
}
export interface PrintBuilderProviderProps {
  readonly bootstrap: PrintBuilderBootstrap
  readonly controller: PrintBuilderController
}
export const PrintBuilderProvider = ({ children, ...props }: PrintBuilderProviderProps & { readonly children: ReactNode }) =>
  <PrintBuilderContext value={usePrintBuilderValue(props)}>{children}</PrintBuilderContext>
