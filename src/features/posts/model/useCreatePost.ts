"use client";

import { useState } from "react";
import { validateDescription, validateFiles } from "@/features/posts/lib/validators";
import { ImagePreview } from "@/entities/posts/model/types";

export const useCreatePost = () => {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<ImagePreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const fileErrors = validateFiles(files, images.length);

    if (fileErrors.length > 0) {
      setErrors(fileErrors);
      return;
    }

    setErrors([]);
    setImages((prev) => [...prev, ...files]);

    const urls: ImagePreview[] = files.map((file, i) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
    }));

    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  const removePreview = (id: string) => {
    setPreviewUrls((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allErrors: string[] = [];

    const descError = validateDescription(description);
    if (descError) allErrors.push(descError);

    if (previewUrls.length === 0) {
      allErrors.push("Добавьте хотя бы одно изображение");
    }

    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }

    setErrors([]);

    setTimeout(() => {
      console.log("Пост создан:", { description, images });
      alert("Пост успешно создан (mock)!");
    }, 1000);
  };

  return {
    description,
    setDescription,
    images,
    previewUrls,
    errors,
    handleFileChange,
    handleSubmit,
    removePreview,
  };
};
