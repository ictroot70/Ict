import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/composites/Table'

export function Payments() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Date of Payment</TableHeader>
          <TableHeader>End date of subscription</TableHeader>
          <TableHeader>Price</TableHeader>
          <TableHeader>Subscription Type</TableHeader>
          <TableHeader>My payments</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>12.03.2026</TableCell>
          <TableCell>12.03.2026</TableCell>
          <TableCell>$10</TableCell>
          <TableCell>1 day</TableCell>
          <TableCell>Stripe</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>12.03.2026</TableCell>
          <TableCell>20.03.2026</TableCell>
          <TableCell>$50</TableCell>
          <TableCell>7 days</TableCell>
          <TableCell>PayPal</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
