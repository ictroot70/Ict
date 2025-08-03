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

export interface Header_v2Props extends ComponentPropsWithoutRef<'header'> {
  isAuthorized?: boolean
  logo?: ReactNode
  classNameForLogo?: string
  maxWidth?: CSSProperties['maxWidth']
  height?: CSSProperties['height']
  background?: CSSProperties['background']
}
//TODO: This is a temporary header(in the future we will use it from our library)
export const Header_v2 = forwardRef<ComponentRef<'header'>, Header_v2Props>(
  (props, ref): ReactElement => {
    const {
      isAuthorized = false,
      maxWidth = '1280px',
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
