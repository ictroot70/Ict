"use client";
import React from "react";
import styles from "./PublishStep.module.scss";
import { UploadedFile, Post } from "../../model/types";

interface Props {
  onPrev: () => void;
  onPublish: (post: Post) => void;
  files: UploadedFile[];
  selectedFilter: string;
  description: string;
  setDescription: (v: string) => void;
}

export const PublishStep: React.FC<Props> = ({
                                               onPrev,
                                               onPublish,
                                               files,
                                               selectedFilter,
                                               description,
                                               setDescription,
                                             }) => {
  const handlePublish = async () => {
    const photos = files.map((f) => f.preview);

    const newPost: Post = {
      id: Date.now().toString(),
      photos,
      description,
      createdAt: new Date().toISOString(),
      filter: selectedFilter,
    };

    onPublish(newPost);
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onPrev} className={styles.navBtn}>
          ←
        </button>
        <span className={styles.title}>New Post</span>
        <button
          onClick={handlePublish}
          className={styles.publishBtn}
          disabled={description.length > 500}
        >
          Publish
        </button>
      </div>

      {/* Image preview with selected filter */}
      <div className={styles.photoPreview}>
        {files[0] && (
          <img
            src={files[0].preview}
            className={
              selectedFilter !== "Normal"
                ? styles[selectedFilter.toLowerCase()]
                : ""
            }
            alt="preview"
          />
        )}
      </div>

      {/* Description form */}
      <div className={styles.form}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          placeholder="Write a description..."
        />
        <div className={styles.counter}>{description.length}/500</div>
      </div>
    </div>
  );
};
