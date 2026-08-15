import test from 'node:test'
import assert from 'node:assert/strict'
import { editableProfile, resolveProfileId } from '../src/lib/profileIdentity.js'

test('replacing the sample dog starts a fresh identity and history namespace', () => {
  const id = resolveProfileId('sample-bruno-story', 'sample-bruno-story', () => 'dog-milo-new')
  assert.equal(id, 'dog-milo-new')
})

test('editing a real dog preserves its identity and history namespace', () => {
  const id = resolveProfileId('dog-luna-existing', 'sample-bruno-story', () => 'unused')
  assert.equal(id, 'dog-luna-existing')
})

test('replacing the sample clears demo-only profile details', () => {
  const draft = editableProfile({
    id: 'sample-bruno-story',
    name: 'Bruno',
    photo: '/bruno.jpg',
    microchip: 'demo-4821',
  }, 'sample-bruno-story')

  assert.equal(draft, null)
})

test('editing a real dog keeps its existing profile details', () => {
  const luna = { id: 'dog-luna-existing', name: 'Luna', microchip: 'real-2048' }
  assert.equal(editableProfile(luna, 'sample-bruno-story'), luna)
})
