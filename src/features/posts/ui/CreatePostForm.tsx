"use client";

import styles from "./CreatePostForm.module.scss";
import { useCreatePost } from "@/features/posts/model/useCreatePost";

export const CreatePostForm = () => {
  const {
    description,
    setDescription,
    previewUrls,
    errors,
    handleFileChange,
    handleSubmit,
  } = useCreatePost();

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <textarea
        placeholder="Введите описание поста..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={styles.textarea}
      />

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className={styles.fileInput}
      />

      <div className={styles.previewContainer}>
        {previewUrls.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`preview-${i}`}
            className={styles.previewImage}
          />
        ))}
      </div>

      {errors.length > 0 && (
        <div className={styles.errorContainer}>
          {errors.map((err, i) => (
            <p key={i} className={styles.error}>
              {err}
            </p>
          ))}
        </div>
      )}

      <button type="submit" className={styles.button}>
        Создать пост
      </button>
    </form>
  );
};