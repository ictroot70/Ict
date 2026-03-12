import clsx from 'clsx'

import s from './Table.module.scss'

import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from 'react'

export const Table = forwardRef<ComponentRef<'table'>, ComponentPropsWithoutRef<'table'>>(
  ({ className, ...rest }, ref) => {
    return <table className={clsx(s.table, className)} {...rest} ref={ref} />
  }
)

export const TableHead = forwardRef<ComponentRef<'thead'>, ComponentPropsWithoutRef<'thead'>>(
  ({ className, ...rest }, ref) => {
    return <thead className={className} {...rest} ref={ref} />
  }
)

export const TableBody = forwardRef<ComponentRef<'tbody'>, ComponentPropsWithoutRef<'tbody'>>(
  ({ className, ...rest }, ref) => {
    return <tbody className={className} {...rest} ref={ref} />
  }
)

export const TableRow = forwardRef<ComponentRef<'tr'>, ComponentPropsWithoutRef<'tr'>>(
  ({ className, ...rest }, ref) => {
    return <tr className={className} {...rest} ref={ref} />
  }
)

export const TableHeader = forwardRef<ComponentRef<'th'>, ComponentPropsWithoutRef<'th'>>(
  ({ className, ...rest }, ref) => {
    return <th className={clsx(s.tableHeader, className)} {...rest} ref={ref} />
  }
)

export const TableCell = forwardRef<ComponentRef<'td'>, ComponentPropsWithoutRef<'td'>>(
  ({ className, ...rest }, ref) => {
    return <td className={clsx(s.tableCell, className)} {...rest} ref={ref} />
  }
)

Table.displayName = 'Table'
TableHead.displayName = 'TableHead'
TableBody.displayName = 'TableBody'
TableRow.displayName = 'TableRow'
TableHeader.displayName = 'TableHeader'
TableCell.displayName = 'TableCell'
