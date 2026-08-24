import { Schema } from "effect"

export const Sha256 = Schema.String.check(
  Schema.isPattern(/^[a-f0-9]{64}$/, { expected: "a lowercase SHA-256 digest" })
)

export const ArtifactPathSegment = Schema.String.check(
  Schema.isPattern(/^[a-z0-9][a-z0-9._-]*$/, {
    expected: "a lowercase artifact path segment"
  })
)

export const RepositoryContentPath = Schema.String.check(
  Schema.isPattern(/^content(?:\/[a-zA-Z0-9][a-zA-Z0-9._-]*)+$/, {
    expected: "a traversal-free content-relative path"
  })
)

/** @deprecated Use RepositoryContentPath; serialized values are repository-relative. */
export const RelativeContentPath = RepositoryContentPath

export const ReleaseArtifactPath = Schema.String.check(
  Schema.isPattern(/^(?:[a-z0-9][a-z0-9._-]*\/)*[a-z0-9][a-z0-9._-]*$/, {
    expected: "a traversal-free release artifact path"
  })
)

export const ContentLocale = Schema.Literals(["en", "es"])
