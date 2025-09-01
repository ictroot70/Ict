import { useState, useRef, useEffect } from 'react'
import { showToastAlert } from '@/shared/lib'
import { BellOutline } from '@/shared/ui'
import s from './NotificationButton.module.scss'
import React from 'react'

export interface Notification {
  id: number
  title: string
  message: string
  time: string
  isRead: boolean
}

interface NotificationButtonProps {
  notifications?: Notification[]
  onNotificationClick?: (notification: Notification) => void
  className?: string
}

export const NotificationButton = ({
  notifications = [
    {
      id: 1,
      title: 'Новое сообщение',
      message: 'У вас новое сообщение от администратора системы',
      time: '2 часа назад',
      isRead: false
    },
    {
      id: 2,
      title: 'Обновление системы',
      message: 'Запланировано техническое обслуживание на завтра с 23:00 до 01:00',
      time: '5 часов назад',
      isRead: false
    },
    {
      id: 3,
      title: 'Задача выполнена',
      message: 'Ваша задача "Отчет за месяц" была успешно выполнена',
      time: '1 день назад',
      isRead: true
    },
    {
      id: 4,
      title: 'Новый пользователь',
      message: 'В системе зарегистрирован новый пользователь',
      time: '2 дня назад',
      isRead: true
    },
    {
      id: 5,
      title: 'Резервное копирование',
      message: 'Резервное копирование данных выполнено успешно',
      time: '3 дня назад',
      isRead: true
    }
  ],
  onNotificationClick,
  className
}: NotificationButtonProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleButtonClick = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification)
    } else {
      console.log('Notification clicked:', notification)
    }
  }

  return (
    <div className={s.notificationWrapper} ref={menuRef}>
      <button
        title={'Notification'}
        type={'button'}
        className={s.notificationBtn}
        onClick={handleButtonClick}
      >
        <BellOutline size={24} />
        {/* {notifications.some(n => !n.isRead) && (
          <span className={s.notificationBadge}></span>
        )} */}
      </button>

      {isMenuOpen && (
        <div className={s.notificationMenu}>
          <div className={s.beak}></div>
          <div className={s.menuHeader}>
            <h3 className={s.menuTitle}>Уведомления</h3>
          </div>

          <div className={s.menuDivider}></div>

          <div className={s.notificationsList}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <div
                  className={`${s.notificationItem} ${!notification.isRead ? s.unread : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={s.notificationContent}>
                    <h4 className={s.notificationTitle}>
                      {notification.title}
                      {!notification.isRead && (
                        <span className={s.newLabel}>Новое</span>
                      )}
                    </h4>
                    <p className={s.notificationMessage}>{notification.message}</p>
                    <span className={s.notificationTime}>{notification.time}</span>
                  </div>
                  {!notification.isRead && <div className={s.unreadDot}></div>}
                </div>

                {index < notifications.length - 1 && (
                  <div className={s.menuDivider}></div>
                )}
              </React.Fragment>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className={s.emptyState}>
              <p className={s.emptyText}>Нет новых уведомлений</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}