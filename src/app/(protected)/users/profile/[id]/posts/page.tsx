"use client";
import React, { useEffect, useState } from "react";
import styles from "./PostsPage.module.scss";
import { Draft, Post } from "@/features/posts/model/types";
import DraftsList from "@/features/posts/ui/steps/DraftsList";
import CreatePost from "@/features/posts/ui/CreatePostForm";
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel'




const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [currentIndexes, setCurrentIndexes] = useState<{ [key: string]: number }>({});
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Загружаем посты и черновики при старте
  useEffect(() => {
    setPosts(JSON.parse(localStorage.getItem("posts") || "[]"));
    setDrafts(JSON.parse(localStorage.getItem("drafts") || "[]"));
  }, []);

  const handleSaveDraft = (newDraft: Draft) => {
    const updated = [newDraft, ...drafts.filter((d) => d.id !== newDraft.id)];
    setDrafts(updated);
    localStorage.setItem("drafts", JSON.stringify(updated));
  };

  const handlePublishPost = (newPost: Post) => {
    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem("posts", JSON.stringify(updated));
  };

  const handleDeleteDraft = (id: string) => {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem("drafts", JSON.stringify(updated));
  };

  const handleDeletePost = (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    localStorage.setItem("posts", JSON.stringify(updated));
  };

  const handlePrev = (postId: string, total: number) => {
    setCurrentIndexes((prev) => {
      const curr = prev[postId] ?? 0;
      return { ...prev, [postId]: (curr - 1 + total) % total };
    });
  };

  const handleNext = (postId: string, total: number) => {
    setCurrentIndexes((prev) => {
      const curr = prev[postId] ?? 0;
      return { ...prev, [postId]: (curr + 1) % total };
    });
  };

  return (
    <div className={styles.feed}>
      {/* Левая колонка */}
      <div className={styles.sidebar}>
        <button onClick={() => setIsOpen(true)}>Создать пост</button>
        <DraftsList
          drafts={drafts}
          onSelectDraft={(draft) => setEditingDraft(draft)}
          onDeleteDraft={(id) => {
            const updated = drafts.filter((d) => d.id !== id)
            setDrafts(updated)
            localStorage.setItem("drafts", JSON.stringify(updated))
          }}
        />
      </div>

      {/* Правая колонка — посты */}
      <div className={styles.postsGrid}>
        {posts.map((post) => (
          <div key={post.id} className={styles.postCard}>
            <EmblaCarousel photos={post.photos} />

            <div className={styles.postInfo}>
              <div className={styles.userRow}>
                <div className={styles.avatar}></div>
                <span className={styles.username}>UserName</span>
                <span className={styles.time}>
            {new Date(post.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
              </div>
              {post.description && (
                <p className={styles.description}>
                  {post.description.slice(0, 40)}...
                  <span className={styles.more}>Show more</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <CreatePost
          open={isOpen}
          onClose={() => setIsOpen(false)}
          onSaveDraft={(newDraft) => {
            const updated = [newDraft, ...drafts.filter((d) => d.id !== newDraft.id)]
            setDrafts(updated)
            localStorage.setItem("drafts", JSON.stringify(updated))
          }}
          onPublishPost={(newPost) => {
            const updated = [newPost, ...posts]
            setPosts(updated)
            localStorage.setItem("posts", JSON.stringify(updated))
          }}
        />
      )}

      {editingDraft && (
        <CreatePost
          draft={editingDraft}
          open={true}
          onClose={() => setEditingDraft(null)}
          onSaveDraft={(newDraft) => {
            const updated = [newDraft, ...drafts.filter((d) => d.id !== newDraft.id)]
            setDrafts(updated)
            localStorage.setItem("drafts", JSON.stringify(updated))
          }}
          onPublishPost={(newPost) => {
            const updated = [newPost, ...posts]
            setPosts(updated)
            localStorage.setItem("posts", JSON.stringify(updated))
          }}
          onDeleteDraft={(id) => {
            const updated = drafts.filter((d) => d.id !== id)
            setDrafts(updated)
            localStorage.setItem("drafts", JSON.stringify(updated))
          }}
        />
      )}
    </div>
  );
};

export default HomePage;


