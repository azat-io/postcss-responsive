import type { PluginCreator, Declaration } from 'postcss'
import type { Node } from 'postcss-value-parser'

import valueParser from 'postcss-value-parser'

export interface PluginOptions {
  root?: number
  minWidth?: number
  maxWidth?: number
  funcName?: string
  legacy?: boolean
}

const postcssResponsive: PluginCreator<PluginOptions> = (options = {}) => ({
  postcssPlugin: 'postcss-responsive',
  Declaration: (decl: Declaration): void => {
    let declValue = decl.value
    let funcName = options.funcName ?? 'responsive'
    let pattern = `(^|[^\\w-])(${funcName})\\(`

    if (!new RegExp(pattern, 'i').test(declValue.toLowerCase())) {
      return
    }

    let parsedValue = valueParser(declValue)

    let convertToRem = (
      value?: string | number,
      root?: number,
    ): number | undefined => {
      if (value === undefined || root === undefined) {
        return undefined
      }
      let unit: string
      if (typeof value === 'number') {
        unit = 'px'
        value = `${value}${unit}`
      } else {
        unit = value.replaceAll(/(-)?\d+(\.\d+)?/g, '')
      }
      if (!['px', 'em', 'rem'].includes(unit)) {
        throw decl.error(`Invalid unit ${unit}. Try to use px or rem.`, {
          word: unit,
        })
      }
      let num = parseFloat(value)
      return unit === 'px' ? num / root : num
    }

    let toFixed = (value: number): number => parseFloat(value.toFixed(4))
    let hasNoValue = (value?: number): boolean => !Number.isFinite(value)

    parsedValue.walk(node => {
      if (node.type !== 'function' || node.value !== funcName) {
        return
      }
      let values = node.nodes
        .filter(nodeElement => nodeElement.type === 'word')
        .map(nodeElement => nodeElement.value)

      let rootFontSize = options.root ?? 16
      let minFontSize = convertToRem(values[0], rootFontSize)
      let maxFontSize = convertToRem(values[1], rootFontSize)
      let minWidth = convertToRem(values[2] ?? options.minWidth, rootFontSize)
      let maxWidth = convertToRem(values[3] ?? options.maxWidth, rootFontSize)

      if (hasNoValue(minWidth)) {
        throw decl.error(`Missing min width in ${funcName} function.`)
      } else if (hasNoValue(maxWidth)) {
        throw decl.error(`Missing max width in ${funcName} function.`)
      } else if (hasNoValue(minFontSize)) {
        throw decl.error(`Missing min font size in ${funcName} function.`)
      } else if (hasNoValue(maxFontSize)) {
        throw decl.error(`Missing max font size in ${funcName} function.`)
      } else if (maxWidth! < minWidth!) {
        throw decl.error('Max width must be greater than the minimum.')
      }

      let newNode = node as Node
      if (minFontSize === maxFontSize) {
        newNode.type = 'word'
        newNode.value = `${minFontSize}rem`
      } else {
        let slope = (maxFontSize! - minFontSize!) / (maxWidth! - minWidth!)
        let intersection = toFixed(-minWidth! * slope + minFontSize!)
        let unit = options.legacy ? 'vw' : 'vi'
        let preferred = `${intersection}rem + ${toFixed(slope * 100)}${unit}`

        let value = `clamp(${minFontSize}rem, ${preferred}, ${maxFontSize}rem)`
        newNode.type = 'word'
        newNode.value = value
      }
    })

    decl.cloneBefore({ value: parsedValue.toString() })
    decl.remove()
  },
})

postcssResponsive.postcss = true

export default postcssResponsive
