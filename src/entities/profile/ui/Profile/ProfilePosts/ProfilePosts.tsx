import s from '../Profile.module.scss'
import { PostCard } from '@/entities/posts/ui/PostCard/PostCard'
import { PostViewModel } from '@/entities/posts/api'
import { Typography } from '@/shared/ui'

interface ProfilePostsProps {
  posts?: PostViewModel[]
  isOwnProfile: boolean
  modalVariant: 'public' | 'myPost' | 'userPost'
  onEditPost?: (postId: string, newDescription: string) => void
  onDeletePost?: (postId: string) => void
  isEditing: string | null
  profileId: number | string | undefined
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
  if (!posts || posts.length === 0) {
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
          id={post.id}
          images={post.images}
          avatarOwner={post.avatarOwner}
          userName={post.userName}
          createdAt={post.createdAt}
          description={post.description}
          modalVariant={modalVariant}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost}
          isEditing={isEditing === post.id.toString()}
          userId={Number(profileId)}
          image={post.images[0]?.url || ''}
        />
      ))}
    </ul>
  )
}