import { strict as assert } from "node:assert"
import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const root = fileURLToPath(new URL("../", import.meta.url))
const prohibited = new Set(["forwardRef", "useContext"])
const workflowModeProps = new Set(["isPractice", "isReview", "isSimulation", "isVisual", "isNonvisual", "isHazard", "reviewsOnly"])
const nameOf = (node: ts.Node | undefined): string | undefined =>
  node !== undefined && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : undefined

const capabilityModule = (specifier: string): boolean =>
  /(?:^|\/)(?:[^/]*-)?(?:runtime|persistence|controller|manager)(?:\.ts)?$/.test(specifier) ||
  /(?:^|\/)(?:verified-content|app-database)(?:\.ts)?$/.test(specifier) ||
  /(?:^|\/)(?:study-storage|persistence)(?:\/|$)/.test(specifier)
const adapterFile = /(?:^|\/)(?:[^/]+-)?(?:bootstrap|provider)(?:-[^/]+)?\.tsx$/
const hasValueImport = (node: ts.ImportDeclaration): boolean => {
  const clause = node.importClause
  if (clause === undefined) return true
  if (clause.isTypeOnly) return false
  if (clause.name !== undefined) return true
  const bindings = clause.namedBindings
  return bindings === undefined || ts.isNamespaceImport(bindings) || bindings.elements.some(entry => !entry.isTypeOnly)
}

const inspect = (text: string, path: string): ReadonlyArray<string> => {
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const leaf = path.endsWith(".tsx") && !adapterFile.test(path)
  const namespaces = new Set<string>()
  const problems: string[] = []
  const report = (node: ts.Node, rule: string) => {
    const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
    problems.push(`${path}:${line}: ${rule}`)
  }
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || statement.moduleSpecifier.text !== "react") continue
    const clause = statement.importClause
    if (clause?.name !== undefined) namespaces.add(clause.name.text)
    const bindings = clause?.namedBindings
    if (bindings !== undefined && ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text)
    if (bindings !== undefined && ts.isNamedImports(bindings)) {
      for (const entry of bindings.elements) {
        const imported = (entry.propertyName ?? entry.name).text
        if (prohibited.has(imported)) report(entry, `React ${imported} is prohibited; use the React 19 provider/ref contract`)
      }
    }
  }
  const visit = (node: ts.Node): void => {
    if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier !== undefined) {
      const runtimeExport = node.exportClause === undefined || !ts.isNamedExports(node.exportClause) || node.exportClause.elements.some(entry => !entry.isTypeOnly)
      if (runtimeExport && (node.exportClause === undefined || ts.isNamespaceExport(node.exportClause))) {
        report(node, "Wildcard runtime barrels are prohibited; export an explicit family API")
      } else if (runtimeExport && /(?:^|\/)(?:ui|react)\/index\.tsx?$/.test(path)) {
        report(node, "UI index barrels are prohibited; import the exact family or primitive module")
      }
    }
    if (leaf && ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && hasValueImport(node)) {
      const specifier = node.moduleSpecifier.text
      if (capabilityModule(specifier)) report(node, "Leaf views must receive capabilities through their provider, not import workflow/runtime/persistence modules")
      if (specifier === "effect") {
        const bindings = node.importClause?.namedBindings
        if (node.importClause?.name !== undefined || bindings === undefined || ts.isNamespaceImport(bindings) || bindings.elements.some(entry => !entry.isTypeOnly && ["Effect", "ManagedRuntime", "Runtime", "Layer"].includes((entry.propertyName ?? entry.name).text))) {
          report(node, "Leaf views must not import Effect runtime or workflow construction")
        }
      }
    }
    if (leaf && ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] !== undefined && ts.isStringLiteral(node.arguments[0]) && (capabilityModule(node.arguments[0].text) || node.arguments[0].text === "effect")) {
      report(node, "Leaf views must not dynamically import capability modules")
    }
    if (leaf && ts.isExportDeclaration(node) && !node.isTypeOnly && !(node.exportClause !== undefined && ts.isNamedExports(node.exportClause) && node.exportClause.elements.every(entry => entry.isTypeOnly)) && node.moduleSpecifier !== undefined && ts.isStringLiteral(node.moduleSpecifier) && capabilityModule(node.moduleSpecifier.text)) {
      report(node, "Leaf views must not re-export capability modules")
    }
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && namespaces.has(node.expression.text) && prohibited.has(node.name.text)) {
      report(node, `React ${node.name.text} is prohibited`)
    }
    if (ts.isElementAccessExpression(node) && ts.isIdentifier(node.expression) && namespaces.has(node.expression.text)) {
      const property = nameOf(node.argumentExpression)
      if (property !== undefined && prohibited.has(property)) report(node, `React ${property} is prohibited`)
    }
    if (ts.isVariableDeclaration(node) && ts.isObjectBindingPattern(node.name) && node.initializer !== undefined && ts.isIdentifier(node.initializer) && namespaces.has(node.initializer.text)) {
      for (const binding of node.name.elements) {
        const property = nameOf(binding.propertyName ?? binding.name)
        if (property !== undefined && prohibited.has(property)) report(binding, `React ${property} is prohibited`)
      }
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === "react" && node.exportClause !== undefined && ts.isNamedExports(node.exportClause)) {
      for (const entry of node.exportClause.elements) {
        const property = (entry.propertyName ?? entry.name).text
        if (prohibited.has(property)) report(entry, `React ${property} re-export is prohibited`)
      }
    }
    if (ts.isJsxAttribute(node) && nameOf(node.name) === "key" && node.initializer !== undefined && ts.isJsxExpression(node.initializer) && node.initializer.expression !== undefined) {
      let usesIndex = false
      const inspectKey = (expression: ts.Node): void => {
        if (ts.isIdentifier(expression) && !(ts.isPropertyAccessExpression(expression.parent) && expression.parent.name === expression)) {
          let owner: ts.Node | undefined = expression.parent
          while (owner !== undefined) {
            if ((ts.isArrowFunction(owner) || ts.isFunctionExpression(owner)) && owner.parameters.some(parameter => nameOf(parameter.name) === expression.text)) {
              const call = owner.parent
              if (nameOf(owner.parameters[1]?.name) === expression.text && ts.isCallExpression(call) && ts.isPropertyAccessExpression(call.expression) && ["map", "flatMap"].includes(call.expression.name.text)) usesIndex = true
              break
            }
            owner = owner.parent
          }
        }
        ts.forEachChild(expression, inspectKey)
      }
      inspectKey(node.initializer.expression)
      if (usesIndex) report(node, "Array-position keys are prohibited; use stable content identity")
    }
    if (ts.isJsxAttribute(node) || ts.isPropertySignature(node) || ts.isPropertyAssignment(node)) {
      const property = nameOf(node.name)
      if (property !== undefined && workflowModeProps.has(property)) report(node, `Workflow mode prop ${property} is prohibited; select an explicit composition`)
      if (property !== undefined && /^render[A-Z]/.test(property)) report(node, `Product ${property} render prop is prohibited; compose children or explicit pieces`)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return problems
}

// Executed with the gate: aliases, namespace access and syntax lookalikes must
// remain distinguished when this detector is changed.
const fixtures: ReadonlyArray<readonly [string, number, string?]> = [
  ['const view = <Player isSimulation />', 1],
  ['interface Props { isNonvisual?: boolean }', 1],
  ['const props = { reviewsOnly: true }', 1],
  ['const view = <Button disabled={busy} aria-expanded={expanded} />', 0],
  ['interface Props { expanded: boolean; disabled: boolean }', 0],
  ['export * from "./player.tsx"', 1],
  ['export * as Player from "./player.tsx"', 1],
  ['export { Player } from "../question-player/react/player.tsx"', 1, 'apps/site/src/ui/index.ts'],
  ['export { Player } from "./player.tsx"', 1, 'apps/site/src/question-player/react/index.ts'],
  ['export type * from "./model.ts"', 0],
  ['export { type PlayerProps } from "./player.tsx"', 0, 'apps/site/src/ui/index.ts'],
  ['export const Player = { Frame, Body }', 0],
  ['export { reasonId } from "./reason-id.ts"', 0],
  ['import { load } from "../persistence.ts"', 1],
  ['import { appRuntime } from "../../app-runtime.ts"', 1],
  ['import "../../study-storage/app-database.ts"', 1],
  ['const load = () => import("../../verified-content.ts")', 1],
  ['export { load } from "../controller.ts"', 1],
  ['const runtime = import("effect")', 1],
  ['export { type Controller } from "../controller.ts"', 0],
  ['import { Effect as E } from "effect"', 1],
  ['import type { Controller } from "../controller.ts"', 0],
  ['import { type Controller } from "../controller.ts"', 0],
  ['import { createController } from "../controller.ts"', 0, 'feature/react/bootstrap-player.tsx'],
  ['import { project } from "../controller.ts"', 0, 'feature/react/player-provider.tsx'],
  ['import { usePlayer } from "./provider.tsx"', 0],
  ['import { reasonId } from "../reason-id.ts"', 0],
  ['import { useContext as read } from "react"; read(Context)', 1],
  ['import { forwardRef } from "react"', 1],
  ['import * as R from "react"; R.useContext(Context)', 1],
  ['import R from "react"; R["forwardRef"](body)', 1],
  ['import R from "react"; const { useContext: read } = R', 1],
  ['export { forwardRef as wrap } from "react"', 1],
  ['const view = <Player renderBody={() => <p />} />', 1],
  ['interface Props { renderBody: () => unknown }', 1],
  ['const props = { renderBody: () => null }', 1],
  ['const view = rows.map((row, position) => <p key={position} />)', 1],
  ['const view = rows.map(function(row, i) { return <p key={i} /> })', 1],
  ['const view = rows.map((row, i) => <p key={`${row.id}-${i}`} />)', 1],
  ['const view = rows.flatMap((row, position) => [<p key={String(position)} />])', 1],
  ['const view = rows.map((row, index) => <p key={row.index} />)', 0],
  ['const view = rows.map(row => <p key={row.id} />)', 0],
  ['const view = rows.map((key, position) => <p key={key} />)', 0],
  ['import { use } from "react"; const view = <Player><Body /></Player>', 0],
  ['// forwardRef useContext renderBody\nconst text = "renderBody"; const view = <p>useContext</p>', 0],
  ['const unrelated = { useContext: () => null }; unrelated.useContext()', 0]
]
for (const [source, expected, path = "fixture.tsx"] of fixtures) assert.equal(inspect(source, path).length, expected, source)

const files: string[] = []
const collect = (directory: string): void => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) collect(path)
    else if (entry.isFile() && /\.tsx?$/.test(entry.name)) files.push(path)
  }
}
collect(join(root, "apps/site/src"))
const problems = files.flatMap(path => inspect(readFileSync(path, "utf8"), relative(root, path)))
if (problems.length > 0) {
  console.error(problems.join("\n"))
  process.exit(1)
}
console.log(`React conventions and leaf capability imports passed for ${files.length} source files; ${fixtures.length} detector fixtures passed`)
