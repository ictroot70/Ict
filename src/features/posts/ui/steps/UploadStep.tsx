"use client";
import React, { useState } from 'react'
import { useDropzone } from "react-dropzone";
import { fileTypeFromBuffer } from "file-type";
import { UploadedFile } from "../../model/types";
import styles from "./UploadStep.module.scss";

interface Props {
  onNext: () => void;
  onCancel: () => void;
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_FILES = 10;

export const UploadStep: React.FC<Props> = ({ onNext, onCancel, files, setFiles }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    setError(null);

    if (files.length + acceptedFiles.length > MAX_FILES) {
      setError(`You can upload a maximum of ${MAX_FILES} photos`);
      return;
    }

    for (const file of acceptedFiles) {
      if (file.size > MAX_SIZE) {
        setError("The photo must be less than 20 Mb");
        continue;
      }

      const buffer = await file.arrayBuffer();
      const type = await fileTypeFromBuffer(new Uint8Array(buffer));

      if (!type || !["image/jpeg", "image/png"].includes(type.mime)) {
        setError("The photo must be JPEG or PNG format");
        continue;
      }


      const reader = new FileReader();
      reader.onload = () => {
        const preview = reader.result as string; // base64 строка
        setFiles((prev) => [...prev, { file, preview }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    multiple: true,
  });

  return (
    <div className={styles.wrapper}>
      <div {...getRootProps()} className={styles.dropzone}>
        <input {...getInputProps()} />
        <p className={styles.text}>Drag & drop your photo here, or click to select</p>
        <p className={styles.helper}>
          {files.length}/{MAX_FILES} uploaded
        </p>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.previewGrid}>
        {files.map((f, i) => (
          <img key={i} src={f.preview} alt="preview" className={styles.preview} />
        ))}
      </div>

      <div className={styles.actions}>
        <button onClick={onCancel} className={styles.cancelBtn}>Cancel</button>
        {files.length > 0 && (
          <button onClick={onNext} className={styles.nextBtn}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};
