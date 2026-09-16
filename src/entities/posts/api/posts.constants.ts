import type { FollowersFeedParams } from './posts.types'

export const FOLLOWERS_FEED_QUERY_ARGS = {
  pageSize: 10,
} as const satisfies FollowersFeedParams
