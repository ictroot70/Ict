import s from '../Profile.module.scss'
import { PostCard } from '@/entities/posts/ui/PostCard/PostCard'
import { PostViewModel } from '@/shared/types'
import { Typography } from '@/shared/ui'

interface ProfilePostsProps {
  posts?: PostViewModel[]
  isOwnProfile: boolean
  modalVariant: 'public' | 'myPost' | 'userPost'
  onEditPost?: (postId: string, description: string) => void
  onDeletePost?: (postId: string) => void
  isEditing: string | null
  profileId: number
}

export const ProfilePosts: React.FC<ProfilePostsProps> = ({
  posts,
  isOwnProfile,
  modalVariant,
  onEditPost,
  onDeletePost,
  isEditing,
  profileId
}) => {
  if (!posts?.length) {
    return (
      <Typography variant="h1" className={s.profilePostsMessage}>
        {isOwnProfile
          ? "You haven't published any posts yet"
          : "This user hasn't published any posts yet"}
      </Typography>
    )
  }

  return (
    <ul className={s.profilePosts}>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          modalVariant={modalVariant}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost}
          isEditing={isEditing === post.id.toString()}
          userId={profileId}
        />
      ))}
    </ul>
  )
}