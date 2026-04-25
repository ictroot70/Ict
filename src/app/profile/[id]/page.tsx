import type { PaginatedPosts } from '@/entities/posts/api'
import type { PostOpenSource } from '@/shared/constant'

import { fetchPostByIdForSSR, fetchUserPosts } from '@/entities/posts/lib'
import { fetchProfileData } from '@/entities/profile/lib'
import { Profile } from '@/entities/profile/ui'
import { logger } from '@/shared/lib/logger'
import { getSsrFetchErrorStatus } from '@/shared/lib/ssr/safeSsrFetch'

import s from './page.module.scss'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    from?: string | string[]
    postId?: string | string[]
  }>
}

type SsrErrorDetails = {
  bodyPreview: string
  kind: string
  message: string
  status: null | number
  url: string
}

const PAGE_SIZE = 8

const POST_SOURCES: ReadonlySet<PostOpenSource> = new Set(['home', 'profile', 'direct'])

const getSingleSearchParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value

const isPostSource = (value: string): value is PostOpenSource =>
  POST_SOURCES.has(value as PostOpenSource)

const parsePostId = (raw?: string) => {
  const parsed = raw ? Number(raw) : Number.NaN

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

const parsePostSource = (raw?: string): PostOpenSource =>
  raw && isPostSource(raw) ? raw : 'direct'

const getEmptyPosts = (pageSize: number): PaginatedPosts => ({
  items: [],
  totalCount: 0,
  pageSize,
})

const readErrorField = (error: unknown, field: string): unknown => {
  if (typeof error === 'object' && error !== null && field in error) {
    return (error as Record<string, unknown>)[field]
  }

  return undefined
}

const safeStringify = (value: unknown, fallback = ''): string => {
  if (value === undefined || value === null) {
    return fallback
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

const extractSsrErrorDetails = (error: unknown): SsrErrorDetails => ({
  status: getSsrFetchErrorStatus(error),
  kind: safeStringify(readErrorField(error, 'kind'), 'unknown'),
  url: safeStringify(readErrorField(error, 'url')),
  bodyPreview: safeStringify(readErrorField(error, 'bodyPreview')),
  message: error instanceof Error ? error.message : 'Unknown error',
})

const formatDebugLine = (details: SsrErrorDetails) =>
  `status: ${details.status ?? 'n/a'} | kind: ${details.kind}\nurl: ${details.url}\nmessage: ${details.message}${
    details.bodyPreview ? `\nbodyPreview: ${details.bodyPreview}` : ''
  }`

const NotFoundView = ({ details }: { details?: SsrErrorDetails }) => (
  <div>
    <h1>Profile not found</h1>
    {details ? (
      <pre className={s.debugBlock} data-ssr-debug={'profile-not-found'}>
        {formatDebugLine(details)}
      </pre>
    ) : null}
  </div>
)

const ServerUnavailableView = ({ details }: { details: SsrErrorDetails }) => (
  <div>
    <h1>Server unavailable</h1>
    <p>Please try again later.</p>
    <pre className={s.ssrDebugBlock} data-ssr-debug={'ssr-catch'}>
      {`[SSR debug] ${formatDebugLine(details)}`}
    </pre>
  </div>
)

const renderProfileError = (error: unknown, userId: number) => {
  const details = extractSsrErrorDetails(error)

  logger.error('[ProfilePage] fetchProfileData failed', {
    userId,
    status: details.status,
    kind: details.kind,
    url: details.url,
    errorMessage: details.message,
    bodyPreview: details.bodyPreview,
  })

  if (details.status === 404) {
    return <NotFoundView details={details} />
  }

  return <ServerUnavailableView details={details} />
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params, searchParams }: Readonly<Props>) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const userId = Number(id)

  if (!Number.isInteger(userId) || userId <= 0) {
    return <NotFoundView />
  }

  const initialPostId = parsePostId(getSingleSearchParam(query.postId))
  const initialPostSource = parsePostSource(getSingleSearchParam(query.from))

  let profileDataServer

  try {
    profileDataServer = await fetchProfileData(userId)
  } catch (error) {
    return renderProfileError(error, userId)
  }

  const [postsResult, initialPostResult] = await Promise.allSettled([
    fetchUserPosts(userId, PAGE_SIZE, profileDataServer.userName),
    initialPostId ? fetchPostByIdForSSR(initialPostId) : Promise.resolve(null),
  ])

  const postsData =
    postsResult.status === 'fulfilled' ? postsResult.value : getEmptyPosts(PAGE_SIZE)
  const initialPostDataServer =
    initialPostResult.status === 'fulfilled' ? initialPostResult.value : null

  return (
    <Profile
      profileDataServer={profileDataServer}
      postsDataServer={postsData}
      initialPostIdServer={initialPostId}
      initialPostDataServer={initialPostDataServer}
      initialPostSourceServer={initialPostSource}
    />
  )
}
