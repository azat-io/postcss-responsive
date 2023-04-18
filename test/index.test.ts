import type { PluginOptions } from '../plugin'
import type { Result } from 'postcss'

import { expect, it } from 'vitest'
import postcss from 'postcss'

import postcssResponsive from '../plugin'

let convertCss = async (
  input: string,
  opts?: PluginOptions,
): Promise<Result> => {
  let result = await postcss([postcssResponsive(opts)]).process(input)
  return result
}

let testPlugin = async (
  input: string,
  output: string,
  opts?: PluginOptions,
): Promise<void> => {
  let result = await convertCss(input, opts)
  expect(result.css).toBe(output)
  expect(result.warnings).toHaveLength(0)
}

it('converts responsive function to css clamp', () => {
  testPlugin(
    '.test { font-size: responsive(2.25rem, 3rem); }',
    '.test { font-size: clamp(2.25rem, 1.8rem + 1.5vi, 3rem); }',
    {
      minWidth: 480,
      maxWidth: 1280,
    },
  )

  testPlugin(
    '.test { font-size: responsive(2.25rem, 3rem, 480px, 1280px); }',
    '.test { font-size: clamp(2.25rem, 1.8rem + 1.5vi, 3rem); }',
  )

  testPlugin(
    '.test { font-size: responsive(2.25rem, 3rem, 480px, 1280px); }',
    '.test { font-size: clamp(2.25rem, 1.8rem + 1.5vi, 3rem); }',
    {
      minWidth: 400,
      maxWidth: 1200,
    },
  )

  testPlugin(
    '.test { display: grid; grid-template-columns: responsive(100px, 300px) 1fr; }',
    '.test { display: grid; grid-template-columns: clamp(6.25rem, -1.25rem + 25vi, 18.75rem) 1fr; }',
    {
      minWidth: 480,
      maxWidth: 1280,
    },
  )

  testPlugin(
    '.test { display: grid; grid-template-columns: responsive(100px, 300px) responsive(100px, 300px) 1fr; }',
    '.test { display: grid; grid-template-columns: clamp(6.25rem, -1.25rem + 25vi, 18.75rem) clamp(6.25rem, -1.25rem + 25vi, 18.75rem) 1fr; }',
    {
      minWidth: 480,
      maxWidth: 1280,
    },
  )

  testPlugin(
    '.test { font-size: responsive(1rem, 1.125rem, 400px, 800px); line-height: responsive(1.5rem, 1.75rem, 400px, 800px); }',
    '.test { font-size: clamp(1rem, 0.875rem + 0.5vi, 1.125rem); line-height: clamp(1.5rem, 1.25rem + 1vi, 1.75rem); }',
  )
})

it("don't supports unknown units", async () => {
  expect(async () => {
    await convertCss('.test { font-size: responsive(18unit, 24unit); }', {
      minWidth: 480,
      maxWidth: 1280,
    })
  }).rejects.toThrow('Invalid unit unit. Try to use px or rem.')
})

it('throws an error if there is not enough data', async () => {
  expect(async () => {
    await convertCss('.test { font-size: responsive(16px, 24px); }', {
      maxWidth: 1280,
    })
  }).rejects.toThrow('Missing min width in responsive function.')

  expect(async () => {
    await convertCss('.test { font-size: responsive(16px, 24px); }', {
      minWidth: 480,
    })
  }).rejects.toThrow('Missing max width in responsive function.')

  expect(async () => {
    await convertCss('.test { font-size: responsive(); }', {
      minWidth: 480,
      maxWidth: 1280,
    })
  }).rejects.toThrow('Missing min font size in responsive function.')

  expect(async () => {
    await convertCss('.test { font-size: responsive(16px); }', {
      minWidth: 480,
      maxWidth: 1280,
    })
  }).rejects.toThrow('Missing max font size in responsive function.')
})

it('max width should be greater than mix width', async () => {
  expect(async () => {
    await convertCss('.test { font-size: responsive(16px, 24px); }', {
      minWidth: 960,
      maxWidth: 800,
    })
  }).rejects.toThrow('Max width must be greater than the minimum.')
})

it('supports negative values', () => {
  testPlugin(
    '.test { letter-spacing: responsive(-1px, -2px); }',
    '.test { letter-spacing: clamp(-0.0625rem, -0.025rem + -0.125vi, -0.125rem); }',
    {
      minWidth: 480,
      maxWidth: 1280,
    },
  )
})

it('supports custom function name', () => {
  testPlugin(
    '.test { font-size: fluid(2.25rem, 3rem); }',
    '.test { font-size: clamp(2.25rem, 1.8rem + 1.5vi, 3rem); }',
    {
      minWidth: 480,
      maxWidth: 1280,
      funcName: 'fluid',
    },
  )
})

it('converts to simple value if min value and max values are equal', () => {
  testPlugin(
    '.test { font-size: responsive(2.5rem, 2.5rem); }',
    '.test { font-size: 2.5rem; }',
    {
      minWidth: 480,
      maxWidth: 1280,
    },
  )
})

it('supports legacy units', () => {
  testPlugin(
    '.test { font-size: responsive(2.25rem, 3rem, 480px, 1280px); }',
    '.test { font-size: clamp(2.25rem, 1.8rem + 1.5vw, 3rem); }',
    {
      legacy: true,
    },
  )
})
