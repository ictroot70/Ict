'use client'
import { PropsWithChildren, ReactElement } from 'react'

export default function UsersLayout(props: PropsWithChildren): ReactElement {
  const { children } = props

  return <div>{children}</div>
}
