/**
 * @fileoverview feature slised relation path checker
 * @author dimonstr223
 */
"use strict";

const path = require('path')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature slised relation path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {
    return {
      ImportDeclaration(node) {

        // Путь, указанный в импорте, например './features/AddComment'
        const importTo = node.source.value
        // Путь от корня к файлу, например D:\yoink\projects\react-blog-prod\src\features\AddComment
        const fromFileName = context.getFilename()

        if (shouldBeRelative(fromFileName, importTo)) {
          context.report(node, 'В рамках слайса импорты должны быть относительными')
        }
      }
    };
  },
};

const layers = {
  'pages': 'pages',
  'widgets': 'widgets',
  'features': 'features',
  'entities': 'entities',
  'shared': 'shared',
}

const isPathRelative = path => path === '.' || path.startsWith('./')  || path.startsWith('../')

const shouldBeRelative = (from, to) => {
  if (isPathRelative(to)) return false

  const toArray = to.split('/') // ['features', 'AddComment']
  const toLayer = toArray[0]    // 'features'
  const toSlice = toArray[1]    // 'AddComment'

  if (!toLayer || !toSlice || !layers[toLayer]) return false

  const normalizedPath = path.toNamespacedPath(from)
  const projectFrom = normalizedPath.toString().split('src')[1]
  const fromArray = projectFrom.split('\\')
  const fromLayer = fromArray[1]  // 'features'
  const fromSlice = fromArray[2]  // 'AddComment'

  if (!fromLayer || !fromSlice || !layers[fromLayer]) return false

  return toLayer === fromLayer && toSlice === fromSlice
}
