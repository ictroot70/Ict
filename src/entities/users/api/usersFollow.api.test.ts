/* @vitest-environment node */

import { profileApi } from '@/entities/profile/api/profileApi'
import { API_ROUTES } from '@/shared/api'
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { usersFollowApi } from './usersFollow.api'

const createTestStore = () =>
  configureStore({
    reducer: {
      [usersFollowApi.reducerPath]: usersFollowApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(usersFollowApi.middleware),
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

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usersFollowApi profile invalidation', () => {
  it('refetches current and selected user profiles after follow and unfollow', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(asJsonResponse({})))
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)

    await store.dispatch(profileApi.endpoints.getPublicProfile.initiate({ profileId: 7 }))
    await store.dispatch(profileApi.endpoints.getPublicProfile.initiate({ profileId: 8 }))
    await store.dispatch(
      usersFollowApi.endpoints.followUser.initiate({ currentUserId: 8, selectedUserId: 7 })
    )

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(5))

    await store.dispatch(
      usersFollowApi.endpoints.unfollowUser.initiate({ currentUserId: 8, selectedUserId: 7 })
    )

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(8))

    const requestedPaths = fetchMock.mock.calls.map(call => new URL(asRequest(call).url).pathname)
    const publicProfileRequests = (profileId: number) =>
      requestedPaths.filter(path => path.endsWith(API_ROUTES.PUBLIC_USER.PROFILE(profileId)))

    expect(publicProfileRequests(7)).toHaveLength(3)
    expect(publicProfileRequests(8)).toHaveLength(3)
  })
})
