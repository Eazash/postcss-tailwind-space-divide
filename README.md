# Optimize Tailwindcss V3 selectors for `space-*` and `divide-*` classes

> PostCSS plugin that optimizes the selectors & corresponding attributes for Tailwind CSS v3's `.space-*` and `.divide-*` utility classes

For Use TailwindCSS V3

> [!IMPORTANT]
> This plugin is intended for use with Tailwind CSS v3 as the problem this plugin solves is [already solved in v4](https://github.com/tailwindlabs/tailwindcss/pull/13459)

## Why?

In tailwindcss v3, the selector used for [`space-*`](https://v3.tailwindcss.com/docs/space) and [`divide-*`](https://v3.tailwindcss.com/docs/divide-width) utility classes was a relatively complex and slow selector used to accommodate hidden elements.

```css
/* before.css */
.space-x-1 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 0;
  margin-right: calc(0.25rem * var(--tw-space-x-reverse));
  margin-left: calc(0.25rem * calc(1 - var(--tw-space-x-reverse)));
}
```

This slow selector can result in slow element render delays which then degrade page performance and FCP metrics for a page. TailwindCss v4 introduced a significantly faster selector that doesn't accommodate for hidden elements.

```css
/* after.css */
.space-x-1 > :not(:last-child) {
  --tw-space-x-reverse: 0;
  margin-right: calc(0.25rem * calc(1 - var(--tw-space-x-reverse)));
  margin-left: calc(0.25rem * var(--tw-space-x-reverse));
}
```

This Plugin ports these changes to v3. It also allows for using a v3 compatible selector that doesn't change the attributes

```css
/* when using `useV3CompatibleSelector: true` */
/* after.css */
.space-x-1 > * + * {
  --tw-space-x-reverse: 0;
  margin-right: calc(0.25rem * var(--tw-space-x-reverse));
  margin-left: calc(0.25rem * calc(1 - var(--tw-space-x-reverse)));
}
```

## Installation

```bash
npm install postcss-tailwind-space-divide --save-dev
```

## Usage

### With Postcss Config

Add the plugin to your PostCSS configuration **after** TailwindCSS:

```js
// postcss.config.js
module.exports = {
  plugins: {
    "tailwindcss",
    "postcss-tailwind-space-divide": {
      // Optional: useV3CompatibleSelector: true
    },
    "autoprefixer": {},
  }
};
```

> [!WARNING]
> NextJS disables its default plugin config when a custom config is used
> Read more at https://nextjs.org/docs/pages/guides/post-css#customizing-plugins

### Nuxt

Add the plugin to your nuxt config's [postcss plugins](https://nuxt.com/docs/api/nuxt-config#plugins-2) list:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  postcss: {
    plugins: {
      "postcss-tailwind-space-divide": {
        // Optional: useV3CompatibleSelector: true
      },
    },
  },
});
```

### Options

- `useV3CompatibleSelector` (default: `false`):  
  If set to `true`, uses a v3-compatible selector (`* + *`) instead of the v4 selector (`:not(:last-child)`) as the v4 selector requires changing some margin and border attributes

Important References

- https://github.com/tailwindlabs/tailwindcss/discussions/13445#discussioncomment-9015050
- https://github.com/tailwindlabs/tailwindcss/pull/13459
- https://github.com/tailwindlabs/tailwindcss/issues/15162
