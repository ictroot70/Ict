"use client"
import React from "react"
import styles from "./DraftsList.module.scss"

interface Draft {
  id: string
  files: { preview: string }[]
  description: string
  filter: string
  createdAt: string
}

interface Props {
  drafts: Draft[]
  onSelectDraft: (draft: Draft) => void
  onDeleteDraft: (id: string) => void
}

const DraftsList: React.FC<Props> = ({ drafts, onSelectDraft, onDeleteDraft }) => {
  if (drafts.length === 0) {
    return <p className={styles.empty}>Нет черновиков</p>
  }

  return (
    <div className={styles.list}>
      {drafts.map((draft) => (
        <div key={draft.id} className={styles.card}>
          <img
            src={draft.files[0]?.preview}
            alt="draft"
            className={styles.thumb}
            onClick={() => onSelectDraft(draft)}
          />
          <div className={styles.info} onClick={() => onSelectDraft(draft)}>
            <p className={styles.desc}>
              {draft.description || "Без описания"}
            </p>
            <span className={styles.date}>
              {new Date(draft.createdAt).toLocaleString()}
            </span>
          </div>
          <button
            className={styles.deleteBtn}
            onClick={() => onDeleteDraft(draft.id)}
          >
            ✖
          </button>
        </div>
      ))}
    </div>
  )
}

export default DraftsList
