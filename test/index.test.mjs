import assert from 'node:assert/strict'
import test from 'node:test'
import { safexTransform } from '../dist/index.js'

async function transformView(body) {
  return safexTransform().transform(
    `import { ComponentX, Scene, Sprite } from '@safe-engine/sdl'

class Example extends ComponentX {
  __view() {
    ${body}
  }
}`,
    '/project/src/Example.tsx',
  )
}

function assertValidView(result) {
  assert.match(result.code, /const sceneComp\d+ = this/)
  assert.doesNotMatch(result.code, /return\s*[<(]/)
  assert.doesNotThrow(() => new Function(result.code.replace(/^import .*\n/gm, '')))
}

test('transforms nullish-coalescing JSX props', async () => {
  const plugin = safexTransform()
  const result = await plugin.transform(
    `import { ComponentX, Scene, Sprite } from '@safe-engine/sdl'

class Example extends ComponentX {
  render() {
    return <Scene><Sprite scale={this.props.scale ?? 1.5} /></Scene>
  }
}`,
    '/project/src/Example.tsx',
  )

  assert.match(result.code, /scale: this\.props\.scale \?\? 1\.5/)
})

test('transforms a JSX block returned directly from __view', async () => {
  assertValidView(await transformView('return <Scene><Sprite /></Scene>'))
})

test('transforms a parenthesized JSX block returned from __view', async () => {
  assertValidView(await transformView('return (<Scene><Sprite /></Scene>)'))
})

test('transforms a bare JSX block in __view', async () => {
  assertValidView(await transformView('<Scene><Sprite /></Scene>'))
})
