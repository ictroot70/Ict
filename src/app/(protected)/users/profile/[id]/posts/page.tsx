"use client";
import { useEffect, useState } from "react";
import CreatePost from "@/features/posts/ui/CreatePostForm";
import { Post } from "@/features/posts/model/types";
import styles from "./PostsPage.module.scss";

interface Draft {
  id: string;
  files: { preview: string }[];
  description: string;
  filter: string;
  createdAt: string;
}

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // Загружаем посты и черновики
  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    const savedDrafts = JSON.parse(localStorage.getItem("drafts") || "[]");
    setPosts(savedPosts);
    setDrafts(savedDrafts);
  }, []);

  // Удалить пост
  const handleDeletePost = (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    localStorage.setItem("posts", JSON.stringify(updated));
    setPosts(updated);
  };

  // Удалить черновик
  const handleDeleteDraft = (id: string) => {
    const updated = drafts.filter((d) => d.id !== id);
    localStorage.setItem("drafts", JSON.stringify(updated));
    setDrafts(updated);
  };

  return (
    <main className={styles.wrapper}>
      {/* Кнопка создания нового поста */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: "#22c55e",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "6px",
          marginBottom: "20px",
        }}
      >
        Создать пост
      </button>

      {/* Черновики */}
      {drafts.length > 0 && (
        <section className={styles.section}>
          <h2>Черновики</h2>
          <div className={styles.draftList}>
            {drafts.map((draft) => (
              <div key={draft.id} className={styles.draftCard}>
                <div
                  className={styles.draftContent}
                  onClick={() => setEditingDraft(draft)}
                >
                  <img
                    src={draft.files[0]?.preview}
                    alt="draft"
                    className={styles.draftThumb}
                  />
                  <div className={styles.draftInfo}>
                    <p className={styles.draftDesc}>
                      {draft.description || "Без описания"}
                    </p>
                    <span className={styles.draftDate}>
                  {new Date(draft.createdAt).toLocaleString()}
                </span>
                  </div>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteDraft(draft.id)}
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Лента постов */}
      {posts.length > 0 && (
        <section className={styles.section}>
          <h2>Мои посты</h2>
          <div className={styles.posts}>
            {posts.map((post) => (
              <div key={post.id} className={styles.post}>
                <img src={post.photos[0]} alt="post" />
                {post.description && <p>{post.description}</p>}
                <small>{new Date(post.createdAt).toLocaleString()}</small>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeletePost(post.id)}
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Модалка создания/редактирования */}
      {isOpen && <CreatePost draft={undefined} />}
      {editingDraft && <CreatePost draft={editingDraft} />}
    </main>
  );
}
