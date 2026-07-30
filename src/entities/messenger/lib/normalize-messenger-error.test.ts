import { describe, expect, it } from 'vitest'

import { normalizeMessengerError } from './normalize-messenger-error'

describe('normalizeMessengerError', () => {
  it('normalizes a native Error', () => {
    const result = normalizeMessengerError(new Error('Connection failed'), 'socket')

    expect(result).toEqual({
      source: 'socket',
      code: 'SOCKET_ERROR',
      message: 'Connection failed',
    })
  })

  it('normalizes an HTTP API error', () => {
    const result = normalizeMessengerError(
      {
        status: 404,
        data: { message: 'Dialogue not found' },
        error: 'Technical error',
      },
      'api'
    )

    expect(result).toEqual({
      source: 'api',
      code: '404',
      message: 'Dialogue not found',
    })
  })

  it('normalizes an RTK Query fetch error', () => {
    const result = normalizeMessengerError(
      {
        status: 'FETCH_ERROR',
        error: 'Failed to fetch',
      },
      'api'
    )

    expect(result).toEqual({
      source: 'api',
      code: 'FETCH_ERROR',
      message: 'Failed to fetch',
    })
  })

  it('normalizes a backend socket error DTO', () => {
    const result = normalizeMessengerError(
      {
        error: 'DELIVERY_FAILED',
        message: 'Cannot deliver message',
      },
      'socket'
    )

    expect(result).toEqual({
      source: 'socket',
      code: 'DELIVERY_FAILED',
      message: 'Cannot deliver message',
    })
  })

  it('prefers an explicit code over status', () => {
    const result = normalizeMessengerError(
      {
        code: 'MESSAGE_FORBIDDEN',
        status: 403,
        message: 'Message is forbidden',
      },
      'api'
    )

    expect(result).toEqual({
      source: 'api',
      code: 'MESSAGE_FORBIDDEN',
      message: 'Message is forbidden',
    })
  })

  it.each([
    ['api', null, 'API_ERROR'],
    ['socket', undefined, 'SOCKET_ERROR'],
    ['api', 42, 'API_ERROR'],
  ] as const)('uses fallback for an unknown %s error', (source, error, expectedCode) => {
    const result = normalizeMessengerError(error, source)

    expect(result).toEqual({
      source,
      code: expectedCode,
      message: 'Unknown messenger error',
    })
  })
})
