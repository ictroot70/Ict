"use client";

import { useState } from "react";
import { validateDescription, validateFiles } from "@/features/posts/lib/validators";

export const useCreatePost = () => {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const fileErrors = validateFiles(files);
    if (fileErrors.length > 0) {
      setErrors(fileErrors);
      return;
    }

    setErrors([]);
    setImages(files);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const descError = validateDescription(description);
    if (descError) {
      setErrors([descError]);
      return;
    }

    if (images.length === 0) {
      setErrors(["Добавьте хотя бы одно изображение"]);
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
  };
};
