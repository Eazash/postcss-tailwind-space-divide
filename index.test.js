import postcss from 'postcss'
import plugin from '.'
import { it, expect } from 'vitest'
import { describe } from 'vitest'

async function run(input, output, opts = {}) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined })
  expect(result.css).toEqual(output)
  expect(result.warnings().length).toEqual(0)
}

it('does not change unrelated CSS', async () => {
  await run('.foo { margin-top: 1px; }', '.foo { margin-top: 1px; }', {})
})

it('handles space-x-* selector', async () => {
  const input = `
    .space-x-4 > :not(:last-child) {
      --tw-space-x-reverse: 0;
      margin-right: calc(1rem * var(--tw-space-x-reverse));
      margin-left: calc(1rem * calc(1 - var(--tw-space-x-reverse)));
    }
  `
  const output = `
    .space-x-4 > :not(:last-child) {
      --tw-space-x-reverse: 0;
      margin-right: calc(1rem * calc(1 - var(--tw-space-x-reverse)));
      margin-left: calc(1rem * var(--tw-space-x-reverse));
    }
  `
  await run(input, output, {})
})

it('handles space-y-* selector', async () => {
  const input = `
    .space-y-2 > :not([hidden]) ~ :not([hidden]) {
      --tw-space-y-reverse: 0;
      margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
      margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
    }
  `
  const output = `
    .space-y-2 > :not(:last-child) {
      --tw-space-y-reverse: 0;
      margin-top: calc(0.5rem * var(--tw-space-y-reverse));
      margin-bottom: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
    }
  `
  await run(input, output, {})
})

it('handles divide-x-* classes', async () => {
  const input = `
    .divide-x-2 > :not([hidden]) ~ :not([hidden]) {
      --tw-divide-x-reverse: 0;
      border-right-width: calc(2px * var(--tw-divide-x-reverse));
      border-left-width: calc(2px * calc(1 - var(--tw-divide-x-reverse)));
    }
  `
  const output = `
    .divide-x-2 > :not(:last-child) {
      --tw-divide-x-reverse: 0;
      border-right-width: calc(2px * calc(1 - var(--tw-divide-x-reverse)));
      border-left-width: calc(2px * var(--tw-divide-x-reverse));
    }
  `
  await run(input, output, {})
})

it('handles divide-y-* classes', async () => {
  const input = `
    .divide-y-4 > :not([hidden]) ~ :not([hidden]) {
      --tw-divide-y-reverse: 0;
      border-top-width: calc(4px * calc(1 - var(--tw-divide-y-reverse)));
      border-bottom-width: calc(4px * var(--tw-divide-y-reverse));
    }
  `
  const output = `
    .divide-y-4 > :not(:last-child) {
      --tw-divide-y-reverse: 0;
      border-top-width: calc(4px * var(--tw-divide-y-reverse));
      border-bottom-width: calc(4px * calc(1 - var(--tw-divide-y-reverse)));
    }
  `
  await run(input, output, {})
})

it('handles divide-* color classes', async () => {
  const input = `
    .divide-black > :not([hidden]) ~ :not([hidden]) {
      --tw-divide-opacity: 1;
      border-color: rgb(0 0 0 / var(--tw-divide-opacity, 1));
    }
  `
  const output = `
    .divide-black > :not(:last-child) {
      --tw-divide-opacity: 1;
      border-color: rgb(0 0 0 / var(--tw-divide-opacity, 1));
    }
  `
  await run(input, output, {})
})

it('handles arbitrary values', async () => {
  const input = `
    .space-y-\[4px\] > :not([hidden]) ~ :not([hidden]) {
      --tw-space-y-reverse: 0;
      margin-top: calc(4px * calc(1 - var(--tw-space-y-reverse)));
      margin-bottom: calc(4px * var(--tw-space-y-reverse));
    }
  `
  const output = `
    .space-y-\[4px\] > :not(:last-child) {
      --tw-space-y-reverse: 0;
      margin-top: calc(4px * var(--tw-space-y-reverse));
      margin-bottom: calc(4px * calc(1 - var(--tw-space-y-reverse)));
    }
  `
  await run(input, output, {})
})

it('handles prefixed space classes', async () => {
  const input = `
    @media (min-width: 768px) {
      .md\:space-y-6 > :not([hidden]) ~ :not([hidden]) {
          --tw-space-y-reverse: 0;
          margin-top: calc(1.5rem * calc(1 - var(--tw-space-y-reverse)));
          margin-bottom: calc(1.5rem * var(--tw-space-y-reverse));
      }
    }
  `
  const output = `
    @media (min-width: 768px) {
      .md\:space-y-6 > :not(:last-child) {
          --tw-space-y-reverse: 0;
          margin-top: calc(1.5rem * var(--tw-space-y-reverse));
          margin-bottom: calc(1.5rem * calc(1 - var(--tw-space-y-reverse)));
      }
    }
  `
  await run(input, output, {})
})


it('ignores non-tailwind selectors', async () => {
  const input = `
    .custom-class > div {
      --custom-margin: 10px;
      margin-top: calc(var(--custom-margin) * 2);
    }
  `
  const output = input
  await run(input, output, {})
})