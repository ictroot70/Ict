"use client";
import React, { useEffect, useState } from "react";
import styles from "./CreatePostPage.module.scss";
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
      <button onClick={() => setIsOpen(true)}>Создать пост</button>

      {/* Черновики */}
      <DraftsList
        drafts={drafts}
        onSelectDraft={(draft) => setEditingDraft(draft)}
        onDeleteDraft={handleDeleteDraft}
      />

      {/* Создание нового поста */}
      {isOpen && (
        <CreatePost
          onClose={() => setIsOpen(false)}
          onSaveDraft={handleSaveDraft}
          onPublishPost={handlePublishPost}
        />
      )}

      {/* Редактирование черновика */}
      {editingDraft && (
        <CreatePost
          draft={editingDraft}
          onClose={() => setEditingDraft(null)}
          onSaveDraft={handleSaveDraft}
          onPublishPost={handlePublishPost}
          onDeleteDraft={handleDeleteDraft}
        />
      )}

      {/* Лента постов */}
      {posts.map((post) => {
        const currIndex = currentIndexes[post.id] ?? 0;
        return (
          <div key={post.id} className={styles.post}>
            <div className={styles.postHeader}>
              <span className={styles.postTitle}>post</span>
              <button className={styles.deleteBtn} onClick={() => handleDeletePost(post.id)}>✖</button>
            </div>

            {/* Слайдер */}
            <EmblaCarousel photos={post.photos} />

            {post.description && <p className={styles.description}>{post.description}</p>}
            <span className={styles.date}>{new Date(post.createdAt).toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
};

export default HomePage;


