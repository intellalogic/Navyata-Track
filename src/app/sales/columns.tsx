"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Sale } from "@/lib/types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: "items",
    header: "Items Sold",
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
     cell: ({ row }) => {
      const date = row.getValue("date") as Date
      const formatted = new Intl.DateTimeFormat('en-US').format(date)
      return <div className="pl-4">{formatted}</div>
    },
    enableGlobalFilter: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Sale["status"];
      
      // For older records that might not have a status
      if (!status) {
        return <Badge variant="secondary">Done</Badge>;
      }
      
      const variant = status === "Payment Pending" ? "default" : "secondary";

      return <Badge variant={variant}>{status}</Badge>;
    },
    enableGlobalFilter: false,
  },
  {
    accessorKey: "paymentMode",
    header: "Payment Mode",
    enableGlobalFilter: false,
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
    enableGlobalFilter: false,
  },
]
