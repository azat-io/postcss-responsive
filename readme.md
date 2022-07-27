# PostCSS Responsive

[PostCSS](https://postcss.org) plugin that simplifies the creation of adaptive design with custom `responsive()` function.

## Usage

**Step 1:** Install plugin:

```sh
npm install --save-dev postcss postcss-responsive
```

**Step 2:** Check your project for existing PostCSS config: `.postcssrc` in the project root, `"postcss"` section in `package.json` or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs](https://github.com/postcss/postcss#usage)
and set this plugin in settings.

**Step 3:** Add the plugin to your PostCSS config:

```diff
{
  "plugins": {
+    "postcss-responsive": {
+      "minWidth": 480,
+      "maxWidth": 1280,
+    },
    "autoprefixer": {}
  }
}
```

**Step 4:** Just add `responsive()` function into your CSS code. This function can take 2 or 4 arguments: minimum and maximum value and minimum and maximum viewport width (You can set it in plugin settings).

## Example

### Input

```css
.container {
  display: grid;
  grid-template-columns: responsive(180px, 240px) 1fr;
  grid-gap: responsive(8px, 16px);
  padding: responsive(16px, 32px) responsive(16px, 24px);
  font-size: responsive(1rem, 1.125rem, 400px, 800px);
  line-height: responsive(1.5rem, 1.75rem, 400px, 800px);
}
```

### Output

```css
.container {
  display: grid;
  grid-template-columns: clamp(11.25rem, 9rem + 7.5vw, 15rem) 1fr;
  grid-gap: clamp(0.5rem, 0.2rem + 1vw, 1rem);
  padding: clamp(1rem, 0.4rem + 2vw, 2rem) clamp(1rem, 0.7rem + 1vw, 1.5rem);
  font-size: clamp(1rem, 0.875rem + 0.5vw, 1.125rem);
  line-height: clamp(1.5rem, 1.25rem + 1vw, 1.75rem);
}
```

### Browser Support

`postcss-responsive` plugin uses `clamp()` function and `vw` units. So it works on all modern browsers. You can check browser support [here](https://caniuse.com/?search=clamp)

## Contributing

Pull requests are welcome.

## License

MIT &copy; [Azat S.](https://twitter.com/azat_io)
