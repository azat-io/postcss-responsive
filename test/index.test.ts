import type { Result } from 'postcss'

import { describe, expect, it } from 'vitest'
import postcss from 'postcss'

import type { PluginOptions } from '../plugin'

import postcssResponsive from '../plugin'

describe('postcss-response', () => {
  it('converts responsive function to css clamp', async () => {
    let convertCss = async (
      input: string,
      opts?: PluginOptions,
    ): Promise<Result> =>
      await postcss([postcssResponsive(opts)]).process(input)

    let testPlugin = async (
      input: string,
      output: string,
      opts?: PluginOptions,
    ): Promise<void> => {
      let result = await convertCss(input, opts)
      expect(result.css).toBe(output)
      expect(result.warnings).toHaveLength(0)
    }

    await testPlugin(
      '.test { font-size: responsive(2.25rem, 3rem, 480px, 1280px); }',
      '.test { font-size: clamp(2.25rem, 1.8rem + 1.5vi, 3rem); }',
    )

    await testPlugin(
      '.test { font-size: responsive(2.25rem, 3rem, 480px, 1280px); }',
      '.test { font-size: clamp(2.25rem, 1.8rem + 1.5vi, 3rem); }',
      {
        maxWidth: 1200,
        minWidth: 400,
      },
    )

    await testPlugin(
      '.test { display: grid; grid-template-columns: responsive(100px, 300px) 1fr; }',
      '.test { display: grid; grid-template-columns: clamp(6.25rem, -1.25rem + 25vi, 18.75rem) 1fr; }',
      {
        maxWidth: 1280,
        minWidth: 480,
      },
    )

    await testPlugin(
      '.test { display: grid; grid-template-columns: responsive(100px, 300px) responsive(100px, 300px) 1fr; }',
      '.test { display: grid; grid-template-columns: clamp(6.25rem, -1.25rem + 25vi, 18.75rem) clamp(6.25rem, -1.25rem + 25vi, 18.75rem) 1fr; }',
      {
        maxWidth: 1280,
        minWidth: 480,
      },
    )

    await testPlugin(
      '.test { font-size: responsive(1rem, 1.125rem, 400px, 800px); line-height: responsive(1.5rem, 1.75rem, 400px, 800px); }',
      '.test { font-size: clamp(1rem, 0.875rem + 0.5vi, 1.125rem); line-height: clamp(1.5rem, 1.25rem + 1vi, 1.75rem); }',
    )
  })

  it("don't supports unknown units", async () => {
    await expect(async () => {
      await postcss([
        postcssResponsive({
          maxWidth: 1280,
        }),
      ]).process('.test { font-size: responsive(18unit, 24unit); }')
    }).rejects.toThrow('Invalid unit unit. Try to use px or rem.')
  })

  it('throws an error if there is not enough data', async () => {
    await expect(async () => {
      await postcss([
        postcssResponsive({
          maxWidth: 1280,
        }),
      ]).process('.test { font-size: responsive(16px, 24px); }')
    }).rejects.toThrow('Missing min width in responsive function.')

    await expect(async () => {
      await postcss([
        postcssResponsive({
          minWidth: 480,
        }),
      ]).process('.test { font-size: responsive(16px, 24px); }')
    }).rejects.toThrow('Missing max width in responsive function.')

    await expect(async () => {
      await postcss([
        postcssResponsive({
          maxWidth: 1280,
          minWidth: 480,
        }),
      ]).process('.test { font-size: responsive(); }')
    }).rejects.toThrow('Missing min font size in responsive function.')

    await expect(async () => {
      await postcss([
        postcssResponsive({
          maxWidth: 1280,
          minWidth: 480,
        }),
      ]).process('.test { font-size: responsive(16px); }')
    }).rejects.toThrow('Missing max font size in responsive function.')
  })

  it('max width should be greater than mix width', async () => {
    await expect(async () => {
      await postcss([
        postcssResponsive({
          minWidth: 960,
          maxWidth: 800,
        }),
      ]).process('.test { font-size: responsive(16px, 24px); }')
    }).rejects.toThrow('Max width must be greater than the minimum.')
  })

  it('supports negative values', async () => {
    let result = await postcss([
      postcssResponsive({
        maxWidth: 1280,
        minWidth: 480,
      }),
    ]).process('.test { letter-spacing: responsive(-1px, -2px); }')

    expect(result.css).toBe(
      '.test { letter-spacing: clamp(-0.0625rem, -0.025rem + -0.125vi, -0.125rem); }',
    )

    expect(result.warnings).toHaveLength(0)
  })

  it('supports custom function name', async () => {
    let result = await postcss([
      postcssResponsive({
        funcName: 'fluid',
        maxWidth: 1280,
        minWidth: 480,
      }),
    ]).process('.test { font-size: fluid(2.25rem, 3rem); }')

    expect(result.css).toBe(
      '.test { font-size: clamp(2.25rem, 1.8rem + 1.5vi, 3rem); }',
    )

    expect(result.warnings).toHaveLength(0)
  })

  it('converts to simple value if min value and max values are equal', async () => {
    let result = await postcss([
      postcssResponsive({
        maxWidth: 1280,
        minWidth: 480,
      }),
    ]).process('.test { font-size: responsive(2.5rem, 2.5rem); }')

    expect(result.css).toBe('.test { font-size: 2.5rem; }')

    expect(result.warnings).toHaveLength(0)
  })

  it('supports legacy units', async () => {
    let result = await postcss([
      postcssResponsive({
        legacy: true,
      }),
    ]).process('.test { font-size: responsive(2.25rem, 3rem, 480px, 1280px); }')

    expect(result.css).toBe(
      '.test { font-size: clamp(2.25rem, 1.8rem + 1.5vw, 3rem); }',
    )

    expect(result.warnings).toHaveLength(0)
  })
})
