export const followSyncChannel =
  typeof window !== 'undefined' ? new BroadcastChannel('profile_follow_sync') : (null as any)
