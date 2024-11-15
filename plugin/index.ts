import type { PluginCreator, Declaration } from 'postcss'
import type { Node } from 'postcss-value-parser'

import valueParser from 'postcss-value-parser'

export interface PluginOptions {
  funcName?: string
  maxWidth?: number
  minWidth?: number
  legacy?: boolean
  root?: number
}

const postcssResponsive: PluginCreator<PluginOptions> = (options = {}) => ({
  Declaration: (decl: Declaration): void => {
    let declValue = decl.value
    let functionName = options.funcName ?? 'responsive'
    let pattern = `(^|[^\\w-])(${functionName})\\(`

    if (!new RegExp(pattern, 'i').test(declValue.toLowerCase())) {
      return
    }

    let parsedValue = valueParser(declValue)

    let convertToRem = (
      value?: string | number,
      root?: number,
    ): number | null => {
      if (!value || !root) {
        return null
      }

      let unit: string
      let currentValue = value.toString()

      if (typeof value === 'number') {
        unit = 'px'
        currentValue = `${value}${unit}`
      } else {
        unit = currentValue.replaceAll(/-?\d+(?:\.\d+)?/gu, '')
      }

      if (!['rem', 'em', 'px'].includes(unit)) {
        throw decl.error(`Invalid unit ${unit}. Try to use px or rem.`, {
          word: unit,
        })
      }

      let number = Number.parseFloat(currentValue)

      return unit === 'px' ? number / root : number
    }

    let toFixed = (value: number): number => Number.parseFloat(value.toFixed(4))
    let hasNoValue = (value?: number | null): boolean => !Number.isFinite(value)

    parsedValue.walk(node => {
      if (node.type !== 'function' || node.value !== functionName) {
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
        throw decl.error(`Missing min width in ${functionName} function.`)
      } else if (hasNoValue(maxWidth)) {
        throw decl.error(`Missing max width in ${functionName} function.`)
      } else if (hasNoValue(minFontSize)) {
        throw decl.error(`Missing min font size in ${functionName} function.`)
      } else if (hasNoValue(maxFontSize)) {
        throw decl.error(`Missing max font size in ${functionName} function.`)
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
  postcssPlugin: 'postcss-responsive',
})

postcssResponsive.postcss = true

export default postcssResponsive
