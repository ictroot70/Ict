import { ComponentProps, ReactNode } from 'react'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface DropdownProps extends ComponentProps<typeof DropdownMenu.Root> {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  className?: string
}

export const Dropdown = ({
  trigger,
  children,
  align = 'start',
  sideOffset = 5,
  className,
  open,
  onOpenChange,
}: DropdownProps) => {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={className} align={align} sideOffset={sideOffset}>
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
