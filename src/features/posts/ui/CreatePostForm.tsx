"use client"
import React, { useEffect, useState } from "react"
import { useCreatePost } from "../model/useCreatePost"
import { UploadStep } from "./steps/UploadStep"
import { CropStep } from "./steps/CropStep"
import { FilterStep } from "./steps/FilterStep"
import { PublishStep } from "./steps/PublishStep"
import styles from "./CreatePostForm.module.scss"
import { Draft, Post } from "@/features/posts/model/types"
import { Modal } from '@/shared/ui/Modal'


import {
  useCreatePostMutation,
  useDeleteImageMutation,
  useUploadImageMutation,
} from '@/entities/posts/api/postApi'
import { PostImageViewModel } from '@/entities/posts/api/posts.types'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'next/navigation'

interface Props {
  draft?: Draft
  open: boolean
  onClose: () => void
  onSaveDraft: (newDraft: Draft) => void
  onPublishPost: (post: Post) => void
  onDeleteDraft?: (id: string) => void
}

const CreatePost: React.FC<Props> = ({ draft, open, onClose, onSaveDraft, onPublishPost, onDeleteDraft }) => {
  const { step, setStep, files, setFiles } = useCreatePost()

  const [uploadImage] = useUploadImageMutation()
  const [deleteImage] = useDeleteImageMutation()
  const [createPost] = useCreatePostMutation()

  const [uploadedImage, setUploadedImage] = useState<PostImageViewModel[]>([])
  const [selectedFilter, setSelectedFilter] = useState(draft?.filter || "none")
  const [description, setDescription] = useState(draft?.description || "")

  const searchParams = useSearchParams()
  const userId = Number(searchParams.get("userId"))

  // подставляем файлы из черновика
  useEffect(() => {
    if (draft) {
      setFiles(
        draft.files.map((f) => ({
          file: new File([], "draft.jpg"), // mock
          preview: f.preview,
        }))
      )
    }
  }, [draft, setFiles])

  // сохранить черновик
  const saveDraft = () => {
    const newDraft: Draft = {
      id: draft?.id || Date.now().toString(),
      files: files.map((f) => ({ preview: f.preview })),
      description,
      filter: selectedFilter,
      createdAt: draft?.createdAt || new Date().toISOString(),
    }
    onSaveDraft(newDraft) // обновляем state родителя
  }
  // загрузка фото
  const handleUpload = async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png"]
    const maxSize = 1024 * 1024
    const maxCount = 10
    if (!file) return

    if (uploadedImage.length >= maxCount) {
      alert("You can upload no more than 10 photos.")
      return
    }

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG or PNG images are allowed")
      return
    }

    if (file.size > maxSize) {
      alert(`The file is too large. Max size is ${Math.round(maxSize / 1024)} KB`)
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      const uploaded = await uploadImage(formData).unwrap()
      setUploadedImage(prev => [...prev, ...uploaded.images])
    } catch (error) {
      console.error("Failed to upload image:", error)
    }
  }

  // удаление фото
  const handleDeleteImage = async (uploadId: string) => {
    try {
      await deleteImage(uploadId).unwrap()
      setUploadedImage(prev => prev.filter(img => img.uploadId !== uploadId))
    } catch (error) {
      console.error("Failed to delete image:", error)
    }
  }


  const handleClose = () => {
    const confirmClose = window.confirm("Do you really want to close? All progress will be lost.")
    if (confirmClose) {
      const save = window.confirm("Do you want to save this as a draft?")
      if (save) {
        saveDraft()
      }
      resetForm()
      onClose()
    }
  }

  // публикация поста на сервер
  const handlePublish = async () => {
    try {
      await createPost({
        userId,
        body: {
          description,
          childrenMetadata: uploadedImage.map(img => ({ uploadId: img.uploadId })),
        },
      }).unwrap()

      alert("Post created!")
      resetForm()
      onClose()
    } catch (error) {
      console.error("Failed to create post:", error)
    }
  }

  const resetForm = () => {
    setStep("upload")
    setFiles([])
    setUploadedImage([])
    setSelectedFilter("none")
    setDescription("")
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      modalTitle="Add Photo"
      width="492px"
      height="564px"
      style={{ zIndex: 100 }}
    >
      {step === "upload" && (
        <UploadStep
          onNext={() => setStep("crop")}
          files={files}
          setFiles={setFiles}
          handleUpload={handleUpload}
        />
      )}

      {step === "crop" && (
        <CropStep
          onPrev={() => setStep("upload")}
          onNext={() => setStep("filter")}
          files={files}
          setFiles={setFiles}
        />
      )}

      {step === "filter" && (
        <FilterStep
          onPrev={() => setStep("crop")}
          onNext={() => setStep("publish")}
          files={files}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
      )}

      {step === "publish" && (
        <PublishStep
          onPrev={() => setStep("filter")}
          onPublish={handlePublish}
          files={files}
          selectedFilter={selectedFilter}
          description={description}
          setDescription={setDescription}
          uploadedImage={uploadedImage}
        />
      )}
    </Modal>
  )
}

export default CreatePost



