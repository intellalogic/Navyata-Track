"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { TailoringOrder } from "@/lib/types"
import { ArrowUpDown } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US').format(date);

export const columns: ColumnDef<TailoringOrder>[] = [
  {
    accessorKey: "billNo",
    header: "Bill No",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    enableGlobalFilter: false,
  },
  {
    accessorKey: "type",
    header: "Work Type",
    enableGlobalFilter: false,
  },
  {
    accessorKey: "deliveryDate",
    header: ({ column }: { column: any }) => {
      return (
        <button
          className={cn(buttonVariants({ variant: "ghost" }))}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Delivery Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }: { row: any }) => {
      const date = row.getValue("deliveryDate") as Date | undefined;
      if (!date) {
        return <div className="pl-4 text-center">-</div>;
      }
      return <div className="pl-4">{formatDate(date)}</div>
    },
    enableGlobalFilter: false,
  },
  {
    accessorKey: "totalCost",
    header: () => <div className="text-right">Total Cost</div>,
    cell: ({ row }: { row: any }) => <div className="text-right font-medium">{formatCurrency(row.getValue("totalCost"))}</div>,
    enableGlobalFilter: false,
  },
  {
    accessorKey: "balance",
    header: () => <div className="text-right">Balance</div>,
    cell: ({ row }: { row: any }) => {
        const balance = row.getValue("balance") as number;
        return (
            <div className="text-right font-medium">
                <div className={cn(badgeVariants({ variant: balance > 0 ? "destructive" : "secondary" }))}>
                    {formatCurrency(balance)}
                </div>
            </div>
        )
    },
    enableGlobalFilter: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: any }) => {
      const status = row.getValue("status") as TailoringOrder["status"];
      
      let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

      switch(status) {
        case "In Progress":
        case "Done – Payment Pending":
          variant = "default";
          break;
        case "Blocked":
          variant = "destructive";
          break;
        case "Completed":
        case "Canceled":
          variant = "secondary";
          break;
        case "To Do":
        default:
          variant = "outline";
      }

      return <div className={cn(badgeVariants({ variant: variant as any }))}>{status}</div>;
    },
    enableGlobalFilter: false,
  },
  {
    accessorKey: "paymentMode",
    header: "Payment Mode",
    enableGlobalFilter: false,
  },
]
