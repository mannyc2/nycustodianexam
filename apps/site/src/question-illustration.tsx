import { useState } from "react"
import type { PrecommitQuestion } from "@nycustodian/content/model"

type Illustration = NonNullable<PrecommitQuestion["illustration"]>

const IllustrationImage = ({ illustration }: { readonly illustration: Illustration }) => {
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const web = illustration.derivatives.find(asset => asset.kind === "web")
  const phone = illustration.derivatives.find(asset => asset.kind === "phone")
  if (web === undefined) return <p role="alert">The question illustration is unavailable. Skip this question for now.</p>
  return <figure className="question-illustration">
    {failed ? <div className="notice notice-warning" role="alert">
      <p>The question illustration could not load. Try again, or skip this question for now.</p>
      <button className="button button-secondary" type="button" onClick={() => {
        setAttempt(value => value + 1)
        setFailed(false)
      }}>Try image again</button>
    </div> : <picture key={attempt}>
      {phone === undefined ? null : <source media="(max-width: 30rem)" srcSet={`/${phone.path}`} />}
      <img src={`/${web.path}`} alt={illustration.neutralDescription} onError={() => setFailed(true)} />
    </picture>}
  </figure>
}

export const QuestionIllustration = ({ illustration }: { readonly illustration: Illustration | undefined }) =>
  illustration === undefined ? null : <IllustrationImage key={illustration.masterSha256} illustration={illustration} />
