"use client";

import { ImagePreview } from "@/entities/posts/model/types";
import styles from "./PostImagePreview.module.scss";

type Props = {
  image: ImagePreview;
  onRemove: (id: string) => void;
};

export const PostImagePreview = ({ image, onRemove }: Props) => {
  return (
    <div className={styles.imageWrapper}>
      <img src={image.url} alt="preview" className={styles.previewImage} />
      <button
        type="button"
        onClick={() => onRemove(image.id)}
        className={styles.removeButton}
      >
        ✕
      </button>
    </div>
  );
};
