"use client";
import React, { useState } from "react";
import Cropper from "react-easy-crop";
import styles from "./CropStep.module.scss";
import { UploadedFile } from "../../model/types";

interface Props {
  onNext: () => void;
  onPrev: () => void;
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}

const aspectRatios = [
  { label: "Original", value: 0 }, // 0 значит авто
  { label: "1:1", value: 1 / 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "16:9", value: 16 / 9 },
];

export const CropStep: React.FC<Props> = ({ onNext, onPrev, files }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined); // undefined = original

  const currentFile = files[currentIndex];

  return (
    <div className={styles.wrapper}>
      {/* Шапка */}
      <div className={styles.header}>
        <button onClick={onPrev} className={styles.navBtn}>←</button>
        <span className={styles.title}>Cropping</span>
        <button onClick={onNext} className={styles.navBtn}>Next</button>
      </div>

      {/* Область кропа */}
      <div className={styles.cropContainer}>
        <Cropper
          image={currentFile.preview}
          crop={{ x: 0, y: 0 }}
          zoom={zoom}
          aspect={aspect || undefined}
          onZoomChange={setZoom}
          onCropChange={() => {}} // можно позже сохранять кроп
          onCropComplete={() => {}}
        />
      </div>

      {/* Инструменты */}
      <div className={styles.tools}>
        <div className={styles.zoomControl}>
          <label>Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>

        <div className={styles.aspectRatios}>
          {aspectRatios.map((ar) => (
            <button
              key={ar.label}
              className={`${styles.aspectBtn} ${
                aspect === ar.value || (ar.value === 0 && aspect === undefined)
                  ? styles.active
                  : ""
              }`}
              onClick={() =>
                setAspect(ar.value === 0 ? undefined : ar.value)
              }
            >
              {ar.label}
            </button>
          ))}
        </div>
      </div>

      {/* Миниатюры снизу */}
      {files.length > 1 && (
        <div className={styles.thumbs}>
          {files.map((f, idx) => (
            <div
              key={idx}
              className={`${styles.thumb} ${
                idx === currentIndex ? styles.active : ""
              }`}
              onClick={() => setCurrentIndex(idx)}
            >
              <img src={f.preview} alt="thumb" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
