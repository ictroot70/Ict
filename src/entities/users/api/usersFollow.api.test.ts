/* @vitest-environment node */

import { profileApi } from '@/entities/profile/api/profileApi'
import { baseApi } from '@/shared/api/base-api'
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { publicUsersApi } from './publicUsers.api'
import { usersFollowApi } from './usersFollow.api'

const targetProfile = {
  id: 7,
  userName: 'john',
  aboutMe: null,
  avatars: [],
  isFollowing: false,
  isFollowedBy: false,
  userMetadata: {
    followers: 2,
    following: 3,
    publications: 1,
  },
}

const currentProfile = {
  id: 8,
  userName: 'me',
  aboutMe: null,
  avatars: [],
  isFollowing: false,
  isFollowedBy: false,
  userMetadata: {
    followers: 1,
    following: 5,
    publications: 2,
  },
}

const targetByUserName = {
  id: 7,
  userName: 'john',
  firstName: null,
  lastName: null,
  aboutMe: null,
  avatars: [],
  isFollowing: false,
  isFollowedBy: false,
  followersCount: 2,
  followingCount: 3,
  publicationsCount: 1,
}

const createTestStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(baseApi.middleware),
  })

const asJsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const asRequest = (call: unknown[]) => {
  const [input, init] = call as [Request | URL | string, Record<string, unknown> | undefined]

  if (input instanceof Request) {
    return input
  }

  return new Request(String(input), init as ConstructorParameters<typeof Request>[1])
}

const createDeferred = <T>() => {
  let reject!: (reason?: unknown) => void
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, reject, resolve }
}

const primeFollowCaches = async (store: ReturnType<typeof createTestStore>) => {
  await store.dispatch(profileApi.endpoints.getPublicProfile.initiate({ profileId: 7 })).unwrap()
  await store.dispatch(profileApi.endpoints.getPublicProfile.initiate({ profileId: 8 })).unwrap()
  await store.dispatch(publicUsersApi.endpoints.getUserByUserName.initiate('john')).unwrap()
}

const getTargetProfile = (store: ReturnType<typeof createTestStore>) =>
  profileApi.endpoints.getPublicProfile.select({ profileId: 7 })(store.getState()).data

const getCurrentProfile = (store: ReturnType<typeof createTestStore>) =>
  profileApi.endpoints.getPublicProfile.select({ profileId: 8 })(store.getState()).data

const getTargetByUserName = (store: ReturnType<typeof createTestStore>) =>
  publicUsersApi.endpoints.getUserByUserName.select('john')(store.getState()).data

const getFetchPathNames = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.map(call => new URL(asRequest(call).url).pathname)

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usersFollowApi cache contract', () => {
  it('optimistically patches target and current-user follow counters', async () => {
    const followRequest = createDeferred<Response>()
    const fetchMock = vi.fn().mockImplementation((...call: unknown[]) => {
      const request = asRequest(call)
      const { pathname } = new URL(request.url)

      if (request.method === 'POST') {
        return followRequest.promise
      }

      if (pathname.endsWith('/v1/public-user/profile/7')) {
        return Promise.resolve(asJsonResponse(targetProfile))
      }

      if (pathname.endsWith('/v1/public-user/profile/8')) {
        return Promise.resolve(asJsonResponse(currentProfile))
      }

      if (pathname.endsWith('/v1/users/john')) {
        return Promise.resolve(asJsonResponse(targetByUserName))
      }

      return Promise.resolve(asJsonResponse({}))
    })
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)
    await primeFollowCaches(store)

    const mutation = store.dispatch(
      usersFollowApi.endpoints.followUser.initiate({
        currentUserId: 8,
        selectedUserId: 7,
        targetUserName: 'john',
      })
    )

    expect(getTargetProfile(store)?.isFollowing).toBe(true)
    expect(getTargetProfile(store)?.userMetadata.followers).toBe(3)
    expect(getCurrentProfile(store)?.userMetadata.following).toBe(6)
    expect(getTargetByUserName(store)?.isFollowing).toBe(true)
    expect(getTargetByUserName(store)?.followersCount).toBe(3)

    followRequest.resolve(asJsonResponse({}))
    await mutation

    expect(getFetchPathNames(fetchMock)).toEqual([
      '/api/v1/public-user/profile/7',
      '/api/v1/public-user/profile/8',
      '/api/v1/users/john',
      '/api/v1/users/following',
    ])
  })

  it('rolls back exactly the patched caches when follow fails', async () => {
    const fetchMock = vi.fn().mockImplementation((...call: unknown[]) => {
      const request = asRequest(call)
      const { pathname } = new URL(request.url)

      if (request.method === 'POST') {
        return Promise.resolve(asJsonResponse({ message: 'failed' }, 500))
      }

      if (pathname.endsWith('/v1/public-user/profile/7')) {
        return Promise.resolve(asJsonResponse(targetProfile))
      }

      if (pathname.endsWith('/v1/public-user/profile/8')) {
        return Promise.resolve(asJsonResponse(currentProfile))
      }

      if (pathname.endsWith('/v1/users/john')) {
        return Promise.resolve(asJsonResponse(targetByUserName))
      }

      return Promise.resolve(asJsonResponse({}))
    })
    const store = createTestStore()

    vi.stubGlobal('fetch', fetchMock as typeof fetch)
    await primeFollowCaches(store)

    await store.dispatch(
      usersFollowApi.endpoints.followUser.initiate({
        currentUserId: 8,
        selectedUserId: 7,
        targetUserName: 'john',
      })
    )

    expect(getTargetProfile(store)?.isFollowing).toBe(false)
    expect(getTargetProfile(store)?.userMetadata.followers).toBe(2)
    expect(getCurrentProfile(store)?.userMetadata.following).toBe(5)
    expect(getTargetByUserName(store)?.isFollowing).toBe(false)
    expect(getTargetByUserName(store)?.followersCount).toBe(2)
  })
})
