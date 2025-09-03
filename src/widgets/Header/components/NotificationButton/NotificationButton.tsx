import { useState, useRef, useEffect } from 'react'
import { BellOutline, Button, ScrollAreaRadix, Typography, TypographyVariant } from '@/shared/ui'
import s from './NotificationButton.module.scss'
import React from 'react'

/*
 * Интерфейс уведомления
 * @interface Notification
 * @property {number} id - Уникальный идентификатор уведомления
 * @property {string} title - Заголовок уведомления
 * @property {string} message - Текст уведомления
 * @property {string} time - Время уведомления (например, "2 часа назад")
 * @property {boolean} isRead - Статус прочтения уведомления
 */

export interface Notification {
  id: number
  title: string
  message: string
  time: string
  isRead: boolean
}

/*
 * Пропсы компонента NotificationButton
 * @interface NotificationButtonProps
 * @property {Notification[]} [notifications] - Массив уведомлений
 * @property {Function} [onNotificationClick] - Обработчик клика по уведомлению
 * @property {string} [className] - Дополнительные CSS классы
 */

interface NotificationButtonProps {
  notifications?: Notification[]
  onNotificationClick?: (notification: Notification) => void
  className?: string
}

/*
 * Компонент кнопки уведомлений с выпадающим меню
 * 
 * @component
 * @example
 * // Базовое использование с дефолтными уведомлениями
 * <NotificationButton />
 * 
 * @example
 * // С кастомными уведомлениями
 * <NotificationButton 
 *   notifications={customNotifications}
 *   onNotificationClick={handleNotificationClick}
 *   className="custom-class"
 * />
 * 
 * @param {NotificationButtonProps} props - Пропсы компонента
 * @returns {JSX.Element} Компонент кнопки уведомлений
 */

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
      title: 'Задача выполнена',
      message: 'Ваша задача "Отчет за месяц" была успешно выполнена',
      time: '1 день назад',
      isRead: true
    },
    {
      id: 5,
      title: 'Задача выполнена',
      message: 'Ваша задача "Отчет за месяц" была успешно выполнена',
      time: '1 день назад',
      isRead: true
    }
  ],
  onNotificationClick,
  className
}: NotificationButtonProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
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
    }
  }

  return (
    <div className={`${s.notificationWrapper} ${className}`}>
      <button
        ref={buttonRef}
        className={s.notificationBtn}
        onClick={handleButtonClick}
        title="Уведомления"
        aria-expanded={isMenuOpen}
        type="button"
      >
        <BellOutline size={24} />
      </button>

      {isMenuOpen && (
        <div className={s.notificationMenu} ref={menuRef}>
          <div className={s.beak} aria-hidden="true"></div>

          <div className={s.menuHeader}>
            <Typography variant="h3" className={s.menuTitle}>
              Уведомления
            </Typography>
          </div>

          <div className={s.menuDivider} aria-hidden="true"></div>

          <ScrollAreaRadix
            className={s.notificationsScrollArea}
            viewportClassName={s.notificationsViewport}
          >
            <div className={s.notificationsList}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <div
                    className={`${s.notificationItem} ${!notification.isRead ? s.unread : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={s.notificationContent}>
                      <div className={s.notificationTitle}>
                        <span className={s.titleText}>{notification.title}</span>
                        {!notification.isRead && (
                          <span className={s.newLabel}>Новое</span>
                        )}
                      </div>

                      <Typography
                        variant="regular_14"
                        className={s.notificationMessage}
                      >
                        {notification.message}
                      </Typography>

                      <Typography
                        variant="small_text"
                        className={s.notificationTime}
                      >
                        {notification.time}
                      </Typography>
                    </div>

                    {!notification.isRead && (
                      <div className={s.unreadDot} aria-hidden="true"></div>
                    )}
                  </div>

                  {index < notifications.length - 1 && (
                    <div className={s.menuDivider} aria-hidden="true"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </ScrollAreaRadix>

          {notifications.length === 0 && (
            <div className={s.emptyState}>
              <Typography variant="regular_14" className={s.emptyText}>
                Нет новых уведомлений
              </Typography>
            </div>
          )}
        </div>
      )}
    </div>
  )
}