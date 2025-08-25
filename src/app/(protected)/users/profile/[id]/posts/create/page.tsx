'use client'

import { useState } from 'react'
import { Modal } from '@ictroot/ui-kit'


export default function CreatePostPage() {
  const [isOpen, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>+ Add Photo</button>

      <Modal
        open={isOpen}
        modalTitle="Add Photo"
        onClose={() => setOpen(false)}
        width="500px"
        height="400px"
      >
        {/* Контент модалки */}
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div
            style={{
              border: '2px dashed #ccc',
              borderRadius: '8px',
              padding: '40px',
              marginBottom: '20px',
            }}
          >
            <span style={{ fontSize: '40px' }}>🖼️</span>
          </div>

          <button
            style={{
              display: 'block',
              margin: '10px auto',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              background: '#2d6cdf',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Select from Computer
          </button>

          <button
            style={{
              display: 'block',
              margin: '10px auto',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              background: '#333',
              color: '#bbb',
              cursor: 'pointer',
            }}
          >
            Open Draft
          </button>
        </div>
      </Modal>
    </>
  )
}