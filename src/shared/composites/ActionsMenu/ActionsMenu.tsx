import React, { useState, useRef, useEffect, ReactNode } from 'react'

import { Button, MoreHorizontal, Typography } from '@/shared/ui'

import s from './ActionsMenu.module.scss'

export interface ActionsMenuItem {
  label: string
  icon: ReactNode
  onClick: () => void
}

type Props = {
  items: ActionsMenuItem[]
}

export const ActionsMenu: React.FC<Props> = ({ items }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleItemClick = ({ onClick }: Pick<ActionsMenuItem, 'onClick'>) => {
    onClick()
    closeMenu()
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
        variant={'text'}
        className={s.toggle}
        onClick={handleMenuToggle}
        aria-label={'Open menu'}
        aria-expanded={isMenuOpen}
      >
        <MoreHorizontal />
      </Button>

      {isMenuOpen && (
        <div className={s.menu}>
          {items.map(({ icon, label, onClick }) => {
            return (
              <Button
                variant={'text'}
                className={s.item}
                onClick={() => handleItemClick({ onClick })}
                aria-label={'Edit Post'}
                key={label}
              >
                <span className={s.icon}>{icon}</span>
                <Typography asChild variant={'regular_14'} className={s.text}>
                  <span>{label}</span>
                </Typography>
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
