"use client";
import React, { useState } from "react";
import styles from "./FilterStep.module.scss";
import { UploadedFile } from "../../model/types";

const filters = [
  { name: "Normal", className: "" },
  { name: "Clarendon", className: "clarendon" },
  { name: "Lark", className: "lark" },
  { name: "Gingham", className: "gingham" },
  { name: "Moon", className: "moon" },
];

interface Props {
  onNext: () => void
  onPrev: () => void
  files: UploadedFile[]
  selectedFilter: string
  setSelectedFilter: (filter: string) => void
}

export const FilterStep: React.FC<Props> = ({ onNext, onPrev, files, setSelectedFilter, selectedFilter }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentFile = files[currentIndex];
  const currentFilter = selectedFilter || "Normal";

  const applyFilter = (filterName: string) => {
    setSelectedFilter(filterName)
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onPrev}>←</button>
        <span>Filters</span>
        <button onClick={onNext}>Next</button>
      </div>

      {/* Preview */}
      <div className={styles.preview}>
        <img
          src={currentFile.preview}
          alt="preview"
          className={selectedFilter !== "Normal" ? styles[selectedFilter.toLowerCase()] : ""}
        />
      </div>

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
              src={currentFile.preview}
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
