// Original illustrated items. Exact editorial decisions live in launch-v1.reviews.mjs.
export const illustratedQuestions = [
  {
    "prompt": "Which tool is shown in the illustration?",
    "options": [
      {
        "label": "Pipe wrench",
        "conceptId": "tool.pipe-wrench"
      },
      {
        "label": "Slip-joint pliers",
        "conceptId": "tool.pliers.slip-joint"
      },
      {
        "label": "Adjustable wrench",
        "conceptId": "tool.adjustable-wrench"
      },
      {
        "label": "Tongue-and-groove pliers",
        "conceptId": "tool.pliers.tongue-groove"
      }
    ],
    "correctConceptId": "tool.adjustable-wrench",
    "rationales": [
      {
        "conceptId": "tool.pipe-wrench",
        "message": "A pipe wrench has serrated hook and heel jaws for gripping round work. The illustration instead shows smooth opposing jaw faces and a worm adjustment gear.",
        "claimIds": [
          "claim.feature.t037",
          "claim.feature.t036"
        ]
      },
      {
        "conceptId": "tool.pliers.slip-joint",
        "message": "Slip-joint pliers have two handles and a two-position sliding pivot. The illustrated tool has one handle and an adjustment wheel beneath its jaws.",
        "claimIds": [
          "claim.feature.t039",
          "claim.feature.t036"
        ]
      },
      {
        "conceptId": "tool.adjustable-wrench",
        "message": "This is an adjustable wrench. Its smooth parallel jaws and visible worm adjustment gear match the accepted recognition features. The wheel moves one jaw to change the opening.",
        "claimIds": [
          "claim.feature.t036"
        ]
      },
      {
        "conceptId": "tool.pliers.tongue-groove",
        "message": "Tongue-and-groove pliers have a multi-position adjustment channel and offset serrated jaws. That channel and the pliers linkage are absent from this single-handled wrench.",
        "claimIds": [
          "claim.feature.t040",
          "claim.feature.t036"
        ]
      }
    ],
    "claimIds": [
      "claim.feature.t036",
      "claim.feature.t037",
      "claim.feature.t039",
      "claim.feature.t040"
    ],
    "tags": {
      "domain": "minor-maintenance-and-repair",
      "family": "articulated hand tools",
      "confusionSetIds": [],
      "seriesScope": "entry-level-custodians-janitors",
      "editorialDifficulty": "contrast"
    },
    "objectiveId": "claim.feature.t036",
    "factKind": "recognition-feature",
    "illustration": {
      "conceptId": "tool.adjustable-wrench",
      "masterSha256": "edb1f4e907926fd83ed55aaa11668d285bf85a181f98e0aeeb8b845dbc0b192d",
      "neutralDescription": "A hand tool with a single handle and two opposing flat jaw faces. A small ridged adjustment wheel sits below the jaws. The handle has a round hole at its end.",
      "nonvisualEquivalent": {
        "prompt": "Which tool matches these observable features?",
        "observations": [
          "A single handle extends from a broad head with two opposing, flat jaw faces.",
          "The jaw faces are parallel, with no projecting gripping teeth.",
          "A small ridged adjustment wheel sits in an opening immediately below the jaws.",
          "The far end of the handle has a round hole."
        ]
      }
    },
    "version": 2
  }
]
