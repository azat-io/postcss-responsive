import type { PluginOptions } from '../plugin'

import * as assert from 'uvu/assert'
import postcss from 'postcss'
import { test } from 'uvu'

import postcssResponsive from '../plugin'

let testPlugin = async (
  input: string,
  output: string,
  opts?: PluginOptions,
): Promise<void> => {
  let result = await postcss([postcssResponsive(opts)]).process(input)
  assert.is(result.css, output)
  assert.is(result.warnings().length, 0)
}

test('Test postcss-responsive plugin', () => {
  testPlugin(
    '.test { font-size: responsive(2.25rem, 3rem); }',
    '.test { font-size: clamp(2.25rem, 1.8rem + 1.5vw, 3rem); }',
    {
      minWidth: 480,
      maxWidth: 1280,
    },
  )

  testPlugin(
    '.test { font-size: responsive(2.25rem, 3rem, 480px, 1280px); }',
    '.test { font-size: clamp(2.25rem, 1.8rem + 1.5vw, 3rem); }',
  )

  testPlugin(
    '.test { font-size: responsive(2.25rem, 3rem, 480px, 1280px); }',
    '.test { font-size: clamp(2.25rem, 1.8rem + 1.5vw, 3rem); }',
    {
      minWidth: 400,
      maxWidth: 1200,
    },
  )

  testPlugin(
    '.test { display: grid; grid-template-columns: responsive(100px, 300px) 1fr; }',
    '.test { display: grid; grid-template-columns: clamp(6.25rem, -1.25rem + 25vw, 18.75rem) 1fr; }',
    {
      minWidth: 480,
      maxWidth: 1280,
    },
  )

  testPlugin(
    '.test { display: grid; grid-template-columns: responsive(100px, 300px) responsive(100px, 300px) 1fr; }',
    '.test { display: grid; grid-template-columns: clamp(6.25rem, -1.25rem + 25vw, 18.75rem) clamp(6.25rem, -1.25rem + 25vw, 18.75rem) 1fr; }',
    {
      minWidth: 480,
      maxWidth: 1280,
    },
  )

  testPlugin(
    '.test { font-size: responsive(1rem, 1.125rem, 400px, 800px); line-height: responsive(1.5rem, 1.75rem, 400px, 800px); }',
    '.test { font-size: clamp(1rem, 0.875rem + 0.5vw, 1.125rem); line-height: clamp(1.5rem, 1.25rem + 1vw, 1.75rem); }',
  )
})

test.run()
