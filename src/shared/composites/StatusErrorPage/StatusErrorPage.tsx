import { ReactNode } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import s from './StatusErrorPage.module.scss'

import { ErrorDisplayVariant } from './statusErrorPresets'

type StatusErrorPageProps = {
  actions?: ReactNode
  description: string
  imageAlt?: string
  imageSrc?: string
  statusCode: number | string
  title: string
  variant?: ErrorDisplayVariant
}

type StatusErrorPageActionLinkProps = {
  href: string
  label: string
  variant?: 'primary' | 'secondary'
}

export function StatusErrorPageActionLink({
  href,
  label,
  variant = 'primary',
}: StatusErrorPageActionLinkProps) {
  const className =
    variant === 'secondary'
      ? `${s.actionLink} ${s.actionLinkSecondary}`
      : `${s.actionLink} ${s.actionLinkPrimary}`

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  )
}

export function StatusErrorPage({
  actions,
  description,
  imageAlt = 'No internet connection',
  imageSrc = '/nointernet.png',
  statusCode,
  title,
  variant = 'neon',
}: StatusErrorPageProps) {
  if (variant === 'offline') {
    return (
      <section className={s.root}>
        <div className={s.offlineCard}>
          <div className={s.offlineContent}>
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={1100}
              height={760}
              className={s.offlineImage}
              priority
            />
            <div className={s.offlineTextBlock}>
              <span className={s.offlineStatus}>{statusCode}</span>
              <h1 className={s.offlineTitle}>{title}</h1>
              <p className={s.offlineDescription}>{description}</p>
              {actions ? <div className={s.offlineActions}>{actions}</div> : null}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={s.root}>
      <div className={s.neonCard}>
        <div className={s.neonContent}>
          <p className={s.code}>{statusCode}</p>
          <h1 className={s.title}>{title}</h1>
          <p className={s.description}>{description}</p>
        </div>
        {actions ? <div className={s.actions}>{actions}</div> : null}
      </div>
    </section>
  )
}
