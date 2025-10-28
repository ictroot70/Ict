import s from './ActionsMenu.module.scss'
import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { Button, MoreHorizontal } from '@/shared/ui'

type Props = {
  children: ReactNode
}

export const ActionsMenu: React.FC<Props> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className={s.wrapper} ref={menuRef}>
      <Button
        variant="text"
        className={s.toggle}
        onClick={handleMenuToggle}
        aria-label="Open menu"
        aria-expanded={isMenuOpen}
      >
        <MoreHorizontal />
      </Button>

      {isMenuOpen && <div className={s.container}>{children}</div>}
    </div>
  )
}
