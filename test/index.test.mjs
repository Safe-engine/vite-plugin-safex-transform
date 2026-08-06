import assert from 'node:assert/strict'
import test from 'node:test'
import { safexTransform } from '../dist/index.js'

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
