/* @vitest-environment node */

import { API_ROUTES } from '@/shared/api'
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { postApi } from './postApi'

const createTestStore = () =>
  configureStore({
    reducer: {
      [postApi.reducerPath]: postApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(postApi.middleware),
  })

const asJsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

const asRequest = (call: unknown[]) => {
  const [input, init] = call as [Request | URL | string, Record<string, unknown> | undefined]

  if (input instanceof Request) {
    return input
  }

  return new Request(String(input), init as ConstructorParameters<typeof Request>[1])
}

const createPage = ({ nextCursor, page }: { nextCursor: null | number; page: number }) => ({
  totalCount: 2,
  pagesCount: 2,
  page,
  pageSize: 1,
  prevCursor: 0,
  nextCursor,
  items: [],
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('postApi followers feed', () => {
  it('uses the server cursor when fetching the next page', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(asJsonResponse(createPage({ nextCursor: 77, page: 1 })))
      .mockResolvedValueOnce(asJsonResponse(createPage({ nextCursor: null, page: 2 })))
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(postApi.endpoints.getFollowersFeed.initiate({ pageSize: 1 }))
    await store.dispatch(
      postApi.endpoints.getFollowersFeed.initiate(
        { pageSize: 1 },
        { direction: 'forward', subscribe: false }
      )
    )

    expect(fetchMock).toHaveBeenCalledTimes(2)

    const firstUrl = new URL(asRequest(fetchMock.mock.calls[0]).url)
    const secondUrl = new URL(asRequest(fetchMock.mock.calls[1]).url)

    expect(firstUrl.pathname).toContain(API_ROUTES.HOME.PUBLICATIONS_FOLLOWERS)
    expect(firstUrl.searchParams.get('pageSize')).toBe('1')
    expect(firstUrl.searchParams.get('pageNumber')).toBe('1')
    expect(firstUrl.searchParams.get('endCursorPostId')).toBe('0')

    expect(secondUrl.searchParams.get('pageNumber')).toBe('2')
    expect(secondUrl.searchParams.get('endCursorPostId')).toBe('77')
  })
})
