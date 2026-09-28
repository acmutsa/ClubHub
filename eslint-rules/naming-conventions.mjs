import { basename } from "node:path"

const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/
const LOWER_CAMEL_CASE = /^[a-z][A-Za-z0-9]*$/
const CONSTANT_CASE = /^[A-Z][A-Z0-9_]*$/
const ACTION_NAME = /^[a-z][A-Za-z0-9]*Action$/
const QUERY_NAME = /^(?:get|find|list)[A-Z][A-Za-z0-9]*$/
const SCHEMA_NAME = /^[a-z][A-Za-z0-9]*Schema$/
const KEBAB_CASE_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:ts|tsx)$/

function reportName(context, node, name, expected) {
  context.report({
    node,
    messageId: "invalidName",
    data: { name, expected },
  })
}

function isTypeScriptFile(filename) {
  return filename.endsWith(".ts") || filename.endsWith(".tsx")
}

function isActionsFile(filename) {
  return basename(filename) === "actions.ts" || basename(filename) === "actions.tsx"
}

function isQueriesFile(filename) {
  return basename(filename) === "queries.ts" || basename(filename) === "queries.tsx"
}

function isValidatorFile(filename) {
  return filename.includes("/validators/") || basename(filename).startsWith("validators.")
}

function isJsx(node) {
  return node?.type === "JSXElement" || node?.type === "JSXFragment"
}

function statementReturnsJsx(statement) {
  if (!statement) return false

  if (statement.type === "ReturnStatement") {
    return isJsx(statement.argument)
  }

  if (statement.type === "BlockStatement") {
    return statement.body.some(statementReturnsJsx)
  }

  if (statement.type === "IfStatement") {
    return (
      statementReturnsJsx(statement.consequent) ||
      statementReturnsJsx(statement.alternate)
    )
  }

  if (statement.type === "SwitchStatement") {
    return statement.cases.some((item) =>
      item.consequent.some(statementReturnsJsx),
    )
  }

  if (statement.type === "TryStatement") {
    return (
      statementReturnsJsx(statement.block) ||
      statementReturnsJsx(statement.handler?.body) ||
      statementReturnsJsx(statement.finalizer)
    )
  }

  return false
}

function returnsJsx(valueNode) {
  if (!valueNode) return false
  if (isJsx(valueNode)) return true

  if (
    valueNode.type === "ArrowFunctionExpression" ||
    valueNode.type === "FunctionExpression"
  ) {
    return isJsx(valueNode.body) || statementReturnsJsx(valueNode.body)
  }

  if (valueNode.type === "BlockStatement") {
    return statementReturnsJsx(valueNode)
  }

  return false
}

function validateExportedValue(context, filename, node, name, valueNode) {
  if (isActionsFile(filename)) {
    if (!ACTION_NAME.test(name)) {
      reportName(context, node, name, "a lowerCamelCase name ending in Action")
    }
    return
  }

  if (isQueriesFile(filename)) {
    if (!QUERY_NAME.test(name)) {
      reportName(context, node, name, "a name starting with get, find, or list")
    }
    return
  }

  if (isValidatorFile(filename)) {
    if (!SCHEMA_NAME.test(name)) {
      reportName(context, node, name, "a lowerCamelCase name ending in Schema")
    }
    return
  }

  if (filename.endsWith(".tsx") && returnsJsx(valueNode)) {
    if (!PASCAL_CASE.test(name)) {
      reportName(context, node, name, "PascalCase for a React component")
    }
    return
  }

  if (!LOWER_CAMEL_CASE.test(name) && !CONSTANT_CASE.test(name)) {
    reportName(context, node, name, "lowerCamelCase or CONSTANT_CASE")
  }
}

const filenameCaseRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require kebab-case TypeScript filenames",
    },
    schema: [],
    messages: {
      invalidFilename: "Rename '{{filename}}' to a kebab-case TypeScript filename.",
    },
  },
  create(context) {
    const filename = context.filename.replaceAll("\\", "/")

    return {
      Program(node) {
        if (!isTypeScriptFile(filename) || filename.endsWith(".d.ts")) return

        const file = basename(filename)

        if (!KEBAB_CASE_FILE.test(file)) {
          context.report({
            node,
            messageId: "invalidFilename",
            data: { filename: file },
          })
        }
      },
    }
  },
}

const exportedNamesRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce ClubHub naming conventions for exported declarations",
    },
    schema: [],
    messages: {
      invalidName: "Rename '{{name}}' to use {{expected}}.",
      invalidEnumMember: "Rename enum member '{{name}}' to CONSTANT_CASE.",
    },
  },
  create(context) {
    const filename = context.filename.replaceAll("\\", "/")

    function validateDeclaration(declaration) {
      if (!declaration) return

      if (
        declaration.type === "TSTypeAliasDeclaration" ||
        declaration.type === "TSInterfaceDeclaration" ||
        declaration.type === "ClassDeclaration" ||
        declaration.type === "TSEnumDeclaration"
      ) {
        const name = declaration.id?.name

        if (name && !PASCAL_CASE.test(name)) {
          reportName(context, declaration.id, name, "PascalCase")
        }
        return
      }

      if (declaration.type === "FunctionDeclaration") {
        const name = declaration.id?.name
        if (!name) return

        validateExportedValue(context, filename, declaration.id, name, declaration.body)
        return
      }

      if (declaration.type === "VariableDeclaration") {
        for (const item of declaration.declarations) {
          if (item.id.type !== "Identifier") continue

          validateExportedValue(
            context,
            filename,
            item.id,
            item.id.name,
            item.init,
          )
        }
      }
    }

    return {
      ExportNamedDeclaration(node) {
        validateDeclaration(node.declaration)
      },
      TSEnumMember(node) {
        const name = node.id.type === "Identifier" ? node.id.name : node.id.value

        if (typeof name === "string" && !CONSTANT_CASE.test(name)) {
          context.report({
            node: node.id,
            messageId: "invalidEnumMember",
            data: { name },
          })
        }
      },
    }
  },
}

export const namingConventionsPlugin = {
  rules: {
    "filename-case": filenameCaseRule,
    "exported-names": exportedNamesRule,
  },
}
