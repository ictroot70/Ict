interface Props {
  isAuthenticated: boolean
  isOwnProfile: boolean
  onEdit?: () => void
  onFollow?: () => void
  onMessage?: () => void
  isFollowing?: boolean
  onUnfollow?: () => void
  isLoading?: boolean
}

export const ProfileActions: React.FC<Props> = ({
  isAuthenticated,
  isOwnProfile,
  onEdit,
  onFollow,
  onMessage,
  isFollowing = false,
  onUnfollow,
  isLoading = false,
}) => {
  if (!isAuthenticated) return null

  if (isOwnProfile) {
    return (
      <button onClick={onEdit} className="edit-button" disabled={isLoading}>
        Profile Settings
      </button>
    )
  }

  return (
    <div className="action-buttons">
      {isFollowing ? (
        <button onClick={onUnfollow} className="unfollow-button" disabled={isLoading}>
          Unfollow
        </button>
      ) : (
        <button onClick={onFollow} className="follow-button" disabled={isLoading}>
          Follow
        </button>
      )}
      <button onClick={onMessage} className="message-button" disabled={isLoading}>
        Send Message
      </button>
    </div>
  )
}
