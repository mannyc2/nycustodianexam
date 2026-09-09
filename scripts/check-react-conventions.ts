import { strict as assert } from "node:assert"
import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const root = fileURLToPath(new URL("../", import.meta.url))
const prohibited = new Set(["forwardRef", "useContext"])
const nameOf = (node: ts.Node | undefined): string | undefined =>
  node !== undefined && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : undefined

const inspect = (text: string, path: string): ReadonlyArray<string> => {
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
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
      if (property !== undefined && /^render[A-Z]/.test(property)) report(node, `Product ${property} render prop is prohibited; compose children or explicit pieces`)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return problems
}

// Executed with the gate: aliases, namespace access and syntax lookalikes must
// remain distinguished when this detector is changed.
const fixtures: ReadonlyArray<readonly [string, number]> = [
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
for (const [source, expected] of fixtures) assert.equal(inspect(source, "fixture.tsx").length, expected, source)

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
console.log(`React API/render-prop/index-key conventions passed for ${files.length} source files; ${fixtures.length} detector fixtures passed`)
