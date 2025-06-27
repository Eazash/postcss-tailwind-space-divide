/**
 * Returns the updated declaration value for the optimized selector for a prop and its 'value specifier'
 * @param {string} prop
 * @param {string} valueSpecifier
 * 
 * @returns {string | undefined}
*/
function getUpdatedDeclValue(prop, valueSpecifier) {
  switch (prop) {
    case 'border-left-width':
    case 'border-inline-start-width':
      return `calc(${valueSpecifier} * var(--tw-divide-x-reverse))`
    case 'border-right-width':
    case 'border-inline-end-width':
      return `calc(${valueSpecifier} * calc(1 - var(--tw-divide-x-reverse)))`
    case 'border-top-width':
    case 'border-block-start-width':
      return `calc(${valueSpecifier} * var(--tw-divide-y-reverse))`
    case 'border-bottom-width':
    case 'border-block-end-width':
      return `calc(${valueSpecifier} * calc(1 - var(--tw-divide-y-reverse)))`
    case 'margin-top':
    case 'margin-block-start':
      return `calc(${valueSpecifier} * var(--tw-space-y-reverse))`
    case 'margin-bottom':
    case 'margin-block-end':
      return `calc(${valueSpecifier} * calc(1 - var(--tw-space-y-reverse)))`
    case 'margin-left':
    case 'margin-inline-start':
      return `calc(${valueSpecifier} * var(--tw-space-x-reverse))`
    case 'margin-right':
    case 'margin-inline-end':
      return `calc(${valueSpecifier} * calc(1 - var(--tw-space-x-reverse)))`
    default:
      return undefined
  }
}

const v3CompatibleChildSelector = "* + *"
const v4ChildSelector = ":not(:last-child)"

/**
 * @typedef PluginOptions
 * @property {boolean} [useV3CompatibleSelector] - Switch to using the "* + *" child selector as the ":not(:last-child)" selector implemented in tailwindcss v4 requires modifying attributes 
 */

/**
 * @type {import('postcss').PluginCreator<PluginOptions>}
 */

module.exports = (opts = {}) => {
  // Work with options here

  return {
    postcssPlugin: 'postcss-tailwind-space-divide',
    Rule(rule) {
      rule.selectors = rule.selectors.map(selector => {
        return selector.replaceAll(/:not\(\[hidden\]\)\s?~\s?:not\(\[hidden\]\)/g, opts.useV3CompatibleSelector ? v3CompatibleChildSelector: v4ChildSelector)
      })
      if (!opts.useV3CompatibleSelector) {
        // If using the v4 child selector, we need to update the declarations for margin and border widths
        rule.walkDecls(/(?:margin-(?:top|bottom|right|left|(?:inline-|block-)(?:end|start))|border-(?:top|bottom|right|left|(?:inline-|block-)(?:end|start))-width)/, decl => {
          // Grab the value specifier from the declaration value (eg. '1rem' or possibly any arbitrary value)
          const valueSpecifierMatch = decl.value.trim().match(/^calc\((.*) \* (?:calc\(1 - )?var\(--tw/)
          if (!valueSpecifierMatch) { return }
          const valueSpecifier = valueSpecifierMatch[1]
          const optimizedValue = getUpdatedDeclValue(decl.prop, valueSpecifier)
          if (optimizedValue) {
            decl.value = optimizedValue
          }
        })
      }
    }
  }
}

module.exports.postcss = true
