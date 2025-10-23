"use client";
import React, { useState } from "react";
import styles from "./FilterStep.module.scss";
import { UploadedFile } from "../../model/types";
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel/EmblaCarousel'
import { PostImageViewModel } from '@/entities/posts/api/posts.types'
import { toast } from 'react-toastify/unstyled'
import { ToastAlert } from '@/shared/composites'


const filters = [
  { name: "Normal", className: "" },
  { name: "Clarendon", className: "clarendon" },
  { name: "Lark", className: "lark" },
  { name: "Gingham", className: "gingham" },
  { name: "Moon", className: "moon" },
];

interface Props {
  onNext: () => void;
  onPrev: () => void;
  files: UploadedFile[];
  filtersState: Record<number, string>;
  setFiltersState: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  handleUpload: (file: File | Blob) => Promise<any>;
  setUploadedImage: React.Dispatch<React.SetStateAction<PostImageViewModel[]>>
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FilterStep: React.FC<Props> = ({ onNext, onPrev, files, setFiltersState, filtersState, handleUpload, setUploadedImage, setIsUploading }) => {

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentFilter = filtersState[currentIndex] || "Normal";

  const applyFilter = (filterName: string) => {
    setFiltersState((prev) => ({
      ...prev,
      [currentIndex]: filterName,
    }));
  };

  const handleNext = () => {
    onNext();

    (async () => {
      try {
        setIsUploading(true);
        const uploadPromises = files.map(async (file, idx) => {
          const filter = filtersState[idx] || "Normal";

          const img = new Image();
          img.src = file.preview;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;

          switch (filter) {
            case "Clarendon": ctx.filter = "contrast(1.2) saturate(1.35)"; break;
            case "Gingham": ctx.filter = "contrast(0.9) brightness(1.1)"; break;
            case "Moon": ctx.filter = "grayscale(1) contrast(1.1) brightness(1.1)"; break;
            case "Lark": ctx.filter = "brightness(1.1) saturate(1.2)"; break;
            default: ctx.filter = "none";
          }

          ctx.drawImage(img, 0, 0);

          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/jpeg")
          );
          if (!blob) return null;

          return handleUpload(blob);
        });

        const results = await Promise.all(uploadPromises);
        const uploadedAll = results.flatMap(r => r?.images ?? []);
        if (uploadedAll.length > 0) {
          setUploadedImage(uploadedAll as PostImageViewModel[]);
        }
      } catch (e: unknown) {
        let msg = 'Error loading files';

        if (typeof e === 'string') msg = e;
        else if (e instanceof Error) msg = e.message;
        else if (typeof e === 'object' && e && 'data' in e) {
          const data = (e as any).data;
          msg = typeof data === 'string'
            ? data
            : data?.message ?? msg;
        }

        toast(<ToastAlert type="error" message={`❌ ${msg}`} />);
      } finally {
        setIsUploading(false);
      }
    })();
  };


  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button onClick={onPrev} className={styles.navBtn}>←</button>
        <span>Filters</span>
        <button onClick={handleNext} className={styles.navBtn}>Next</button>
      </div>

      <div className={styles.carouselWrapper}>
      <EmblaCarousel
        photos={files.map((f) => f.preview)}
        filtersState={filtersState}
        onSlideChange={setCurrentIndex}
      />
      </div>

      <div className={styles.filtersRow}>
        {filters.map((f) => (
          <div
            key={f.name}
            className={`${styles.filterItem} ${
              currentFilter === f.name ? styles.active : ""
            }`}
            onClick={() => applyFilter(f.name)}
          >
            <img
              src={files[currentIndex].preview}
              alt={f.name}
              className={`${styles.filterThumb} ${f.className ? styles[f.className] : ""}`}
            />
            <span className={styles.name}>{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
