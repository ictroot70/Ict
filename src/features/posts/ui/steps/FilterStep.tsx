"use client";
import React, { useState } from "react";
import styles from "./FilterStep.module.scss";
import { UploadedFile } from "../../model/types";
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel'


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
}

export const FilterStep: React.FC<Props> = ({ onNext, onPrev, files }) => {
  const [filtersState, setFiltersState] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentFilter = filtersState[currentIndex] || "Normal";

  const applyFilter = (filterName: string) => {
    setFiltersState((prev) => ({ ...prev, [currentIndex]: filterName }));
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onPrev}>←</button>
        <span>Filters</span>
        <button onClick={onNext}>Next</button>
      </div>

      {/* Используем EmblaCarousel */}
      <EmblaCarousel
        photos={files.map((f) => f.preview)}
        filter={currentFilter}
      />

      {/* Filters row */}
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
              className={`${styles.filterThumb} ${
                f.className ? styles[f.className] : ""
              }`}
            />
            <span>{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
