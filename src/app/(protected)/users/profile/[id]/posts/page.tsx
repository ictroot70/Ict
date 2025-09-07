'use client'
import React, { useEffect, useState } from 'react'
import styles from './PostsPage.module.scss'
import { Draft, Post } from '@/features/posts/model/types'
import DraftsList from '@/features/posts/ui/steps/DraftsList'
import CreatePost from '@/features/posts/ui/CreatePostForm'
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel'
import { useGetPostsByUserQuery } from '@/entities/posts/api/postApi'
import { useParams, useSearchParams } from 'next/navigation'
import { timeAgo } from '@/features/posts/lib/timeAgo'

const HomePage: React.FC = () => {
  const params = useParams()
  const userId = Number(params.id)

  const { data, isLoading } = useGetPostsByUserQuery(
    { userId, endCursorPostId: 0 },
    { skip: !userId }
  )
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setDrafts(JSON.parse(localStorage.getItem('drafts') || '[]'))
  }, [])

  if (isLoading) return <div>Loading...</div>

  return (
    <div className={styles.feed}>
      <div className={styles.sidebar}>
        <button onClick={() => setIsOpen(true)}>Создать пост</button>
        <DraftsList
          drafts={drafts}
          onSelectDraft={draft => setEditingDraft(draft)}
          onDeleteDraft={id => {
            const updated = drafts.filter(d => d.id !== id)
            setDrafts(updated)
            localStorage.setItem('drafts', JSON.stringify(updated))
          }}
        />
      </div>

      <div className={styles.postsGrid}>
        {data?.items.map(post => (
          <div key={post.id} className={styles.postCard}>
            <EmblaCarousel photos={post.images.map(i => i.url)} />
            <div className={styles.postInfo}>
              <div className={styles.userRow}>
                <img
                  src={post.avatarOwner || '/favicon.ico'}
                  alt={post.userName}
                  className={styles.avatar}
                />
                <span className={styles.username}>{post.userName}</span>
              </div>
              <span className={styles.time}>{timeAgo(post.createdAt)}</span>
              {post.description && <p className={styles.description}>{post.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <CreatePost
          open={isOpen}
          onClose={() => setIsOpen(false)}
          onSaveDraft={newDraft => {
            const updated = [newDraft, ...drafts.filter(d => d.id !== newDraft.id)]
            setDrafts(updated)
            localStorage.setItem('drafts', JSON.stringify(updated))
          }}
          onPublishPost={() => {}} // теперь не нужно пушить руками
        />
      )}
    </div>
  )
}

export default HomePage
