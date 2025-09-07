"use client";
import React from "react";
import styles from "./PublishStep.module.scss";
import { UploadedFile, Post } from "../../model/types";
import { ToastAlert } from "@/shared/composites";
import { toast } from "react-toastify/unstyled";
import EmblaCarousel from "@/entities/posts/ui/EmblaCarousel";

interface Props {
  onPrev: () => void;
  files: UploadedFile[];
  filtersState: Record<number, string>; // ✅ фильтры для каждой картинки
  description: string;
  setDescription: (v: string) => void;
  handleUpload: (file: File | Blob) => Promise<any>;
  createPost: (args: any) => Promise<any>;
  userId: number;
  onClose: () => void;
  uploadedImage: { uploadId: string; url: string }[];
  onPublishPost: (post: any) => void;
}

export const PublishStep: React.FC<Props> = ({
                                               onPrev,
                                               files,
                                               filtersState,
                                               description,
                                               setDescription,
                                               handleUpload,
                                               createPost,
                                               userId,
                                               onClose,
                                               uploadedImage,
                                               onPublishPost,
                                             }) => {
  const handlePublish = async () => {
    if (files.length === 0) return;

    const uploadedAll: any[] = [];

    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      const filter = filtersState[idx] || "Normal"; // ✅ фильтр для конкретной картинки

      const img = new Image();
      img.src = file.preview;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d")!;

      // применяем фильтр
      switch (filter) {
        case "Clarendon":
          ctx.filter = "contrast(1.2) saturate(1.35)";
          break;
        case "Gingham":
          ctx.filter = "contrast(0.9) brightness(1.1)";
          break;
        case "Moon":
          ctx.filter = "grayscale(1) contrast(1.1) brightness(1.1)";
          break;
        case "Lark":
          ctx.filter = "brightness(1.1) saturate(1.2)";
          break;
        default:
          ctx.filter = "none";
      }

      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );

      if (!blob) continue;

      const uploaded = await handleUpload(blob);
      if (uploaded?.images) {
        uploadedAll.push(...uploaded.images);
      }
    }

    if (uploadedAll.length === 0) return;

    const newPost = await createPost({
      userId,
      body: {
        description,
        childrenMetadata: uploadedAll.map((img: any) => ({
          uploadId: img.uploadId,
        })),
      },
    });

    onPublishPost(newPost);
    toast(<ToastAlert type="success" message="✅ Post created!" />);
    onClose();
  };

  return (
    <div className={styles.wrapper}>
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

      {/* ✅ Слайдер вместо одной картинки */}
      <div className={styles.photoPreview}>
        <EmblaCarousel
          photos={files.map((f) => f.preview)}
          filtersState={filtersState} // пробрасываем фильтры
        />
      </div>

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
