/* @vitest-environment jsdom */

import { describe, expect, it } from 'vitest'

import { validateImageMessageFile } from './validateImageMessageFile'

describe('validateImageMessageFile', () => {
  it.each(['image/jpeg', 'image/png'])('accepts %s files up to 1 MB', type => {
    const file = new File([new Uint8Array(1024)], 'message-image', { type })

    expect(validateImageMessageFile(file)).toBeNull()
  })

  it('rejects unsupported image formats', () => {
    const file = new File(['image'], 'message.webp', { type: 'image/webp' })

    expect(validateImageMessageFile(file)).toBe('invalidType')
  })

  it('rejects files larger than 1 MB', () => {
    const file = new File([new Uint8Array(1024 * 1024 + 1)], 'message.png', {
      type: 'image/png',
    })

    expect(validateImageMessageFile(file)).toBe('tooLarge')
  })
})
