"use client";
import React, { useState } from "react";
import styles from "./FilterStep.module.scss";
import { UploadedFile } from "../../model/types";

interface Props {
  onNext: () => void;
  onPrev: () => void;
  files: UploadedFile[];
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}

const filterPresets: { name: string; style: string }[] = [
  { name: "Normal", style: "none" },
  { name: "Clarendon", style: "contrast(1.2) brightness(1.1)" },
  { name: "Lark", style: "brightness(1.2) saturate(1.1)" },
  { name: "Gingham", style: "sepia(0.2) brightness(1.1)" },
  { name: "Moon", style: "grayscale(1) contrast(1.1)" },
];

export const FilterStep: React.FC<Props> = ({ onNext, onPrev, files }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");

  const currentFile = files[currentIndex];

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onPrev} className={styles.navBtn}>←</button>
        <span className={styles.title}>Filters</span>
        <button onClick={onNext} className={styles.navBtn}>Next</button>
      </div>

      {/* Preview */}
      <div className={styles.preview}>
        <img
          src={currentFile.preview}
          alt="preview"
          style={{ filter: selectedFilter }}
        />
      </div>

      {/* Filters Grid */}
      <div className={styles.filtersGrid}>
        {filterPresets.map((preset) => (
          <div
            key={preset.name}
            className={`${styles.filterCard} ${
              selectedFilter === preset.style ? styles.active : ""
            }`}
            onClick={() => setSelectedFilter(preset.style)}
          >
            <div className={styles.thumb}>
              <img
                src={currentFile.preview}
                alt={preset.name}
                style={{ filter: preset.style }}
              />
            </div>
            <span>{preset.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};