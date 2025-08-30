"use client"
import React, { useEffect, useState } from "react"
import { useCreatePost } from "../model/useCreatePost"
import { UploadStep } from "./steps/UploadStep"
import { CropStep } from "./steps/CropStep"
import { FilterStep } from "./steps/FilterStep"
import { PublishStep } from "./steps/PublishStep"
import styles from "./CreatePostForm.module.scss"
import { Draft, Post } from "@/features/posts/model/types"

interface Props {
  draft?: Draft
  onClose: () => void
  onSaveDraft: (newDraft: Draft) => void
  onPublishPost: (post: Post) => void
  onDeleteDraft?: (id: string) => void
}

const CreatePost: React.FC<Props> = ({ draft, onClose, onSaveDraft, onPublishPost, onDeleteDraft }) => {
  const { step, setStep, files, setFiles } = useCreatePost()
  const [selectedFilter, setSelectedFilter] = useState(draft?.filter || "none")
  const [description, setDescription] = useState(draft?.description || "")

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

  const resetForm = () => {
    setStep("upload")
    setFiles([])
    setSelectedFilter("none")
    setDescription("")
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose}>✖</button>

        {step === "upload" && (
          <UploadStep
            onNext={() => setStep("crop")}
            onCancel={handleClose}
            files={files}
            setFiles={setFiles}
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
            onPublish={(post) => {
              // сохраняем пост
              const posts = JSON.parse(localStorage.getItem("posts") || "[]")
              posts.unshift(post)
              localStorage.setItem("posts", JSON.stringify(posts))

              // обновляем state у родителя
              onPublishPost(post)

              // если это был черновик → удаляем
              if (draft) {
                const allDrafts: Draft[] = JSON.parse(localStorage.getItem("drafts") || "[]")
                const updated = allDrafts.filter((d) => d.id !== draft.id)
                localStorage.setItem("drafts", JSON.stringify(updated))

                // обновляем state через родителя
                onDeleteDraft?.(draft.id)
              }

              alert("Post published!")

              // сброс
              setStep("upload")
              setFiles([])
              setSelectedFilter("none")
              setDescription("")
              onClose?.()
            }}
            files={files}
            selectedFilter={selectedFilter}
            description={description}
            setDescription={setDescription}
          />
        )}
      </div>
    </div>
  )
}

export default CreatePost



