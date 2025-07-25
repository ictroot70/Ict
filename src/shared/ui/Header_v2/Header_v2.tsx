import {
  ComponentPropsWithoutRef,
  ComponentRef,
  CSSProperties,
  forwardRef,
  ReactElement,
  ReactNode,
} from 'react'

import { clsx } from 'clsx'

import styles from './Header_v2.module.scss'

export interface HeaderProps extends ComponentPropsWithoutRef<'header'> {
  isAuthorized?: boolean
  logo?: ReactNode
  classNameForLogo?: string
  maxWidth?: CSSProperties['maxWidth']
  height?: CSSProperties['height']
  background?: CSSProperties['background']
}

export const Header_v2 = forwardRef<ComponentRef<'header'>, HeaderProps>(
  (props, ref): ReactElement => {
    const {
      isAuthorized = false,
      maxWidth,
      height = '60px',
      logo,
      background = 'var(--color-dark-700)',
      className,
      children,
      classNameForLogo,
      ...restProps
    } = props

    return (
      <header
        data-is-authorized={isAuthorized}
        className={clsx(styles.header, className)}
        style={{ height, background }}
        ref={ref}
        {...restProps}
      >
        <div className={styles.container} style={{ maxWidth }}>
          {logo && <div className={clsx(styles.logo, classNameForLogo)}>{logo}</div>}
          {children}
        </div>
      </header>
    )
  }
)

Header_v2.displayName = 'Header_v2'
