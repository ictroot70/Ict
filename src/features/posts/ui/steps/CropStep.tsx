"use client";
import React, { useRef, useState } from "react";
import { Cropper, CropperRef } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import styles from "./CropStep.module.scss";
import { UploadedFile } from "../../model/types";

interface Props {
  onNext: () => void;
  onPrev: () => void;
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}

const aspectRatios = [
  { label: "Original", value: 0 },
  { label: "1:1", value: 1 / 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "16:9", value: 16 / 9 },
];

export const CropStep: React.FC<Props> = ({ onNext, onPrev, files, setFiles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  const cropperRef = useRef<CropperRef>(null);

  const currentFile = files[currentIndex];

  const saveCrop = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCanvas();
      if (canvas) {
        const croppedImage = canvas.toDataURL("image/jpeg");
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === currentIndex ? { ...f, preview: croppedImage } : f
          )
        );
      }
    }
  };


  const handleThumbClick = (idx: number) => {
    saveCrop();
    setCurrentIndex(idx);
  };

  const handleNext = () => {
    saveCrop();
    onNext();
  };

  const handleAspectChange = (value: number) => {
    setAspect(value === 0 ? undefined : value);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button onClick={onPrev} className={styles.navBtn}>←</button>
        <span className={styles.title}>Cropping</span>
        <button onClick={handleNext} className={styles.navBtn}>Next</button>
      </div>

      <div className={styles.cropContainer}>
        <Cropper
          src={currentFile.preview}
          className={styles.cropper}
          stencilProps={{
            aspectRatio: aspect,
          }}
          ref={cropperRef}
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
            onClick={() => handleAspectChange(ar.value)}
          >
            {ar.label}
          </button>
        ))}
      </div>

      {files.length > 1 && (
        <div className={styles.thumbs}>
          {files.map((f, idx) => (
            <div
              key={idx}
              className={`${styles.thumb} ${idx === currentIndex ? styles.active : ""}`}
              onClick={() => handleThumbClick(idx)}
            >
              <img src={f.preview} alt="thumb" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
