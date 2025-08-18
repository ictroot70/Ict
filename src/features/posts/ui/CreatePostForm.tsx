"use client";

import { useState } from "react";
import styles from "./CreatePostForm.module.scss";

export const CreatePostForm = () => {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setImages(files);

    // создаём ссылки для предпросмотра
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // заглушка для API
    setTimeout(() => {
      console.log("Пост создан:", { description, images });
      alert("Пост успешно создан (mock)!");
    }, 1000);
  };

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

      <button type="submit" className={styles.button}>
        Создать пост
      </button>
    </form>
  );
};