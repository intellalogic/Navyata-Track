"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { InHouseDesign } from "@/lib/types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
}).format(amount)

export const columns: ColumnDef<InHouseDesign>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string;
      return (
        <div className="w-16 h-16 relative rounded-md overflow-hidden">
            <Image 
                src={imageUrl || 'https://placehold.co/100x100.png'} 
                alt={row.original.name} 
                data-ai-hint="dress design"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
      )
    },
    enableGlobalFilter: false,
  },
  {
    accessorKey: "name",
    header: "Design Name",
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
     cell: ({ row }) => {
      const date = row.getValue("startDate") as Date
      const formatted = new Intl.DateTimeFormat('en-US').format(date)
      return <div className="pl-4">{formatted}</div>
    },
    enableGlobalFilter: false,
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
     cell: ({ row }) => {
      const date = row.getValue("endDate") as Date | undefined;
      if (!date) return <div className="pl-4 text-center text-muted-foreground">-</div>;
      const formatted = new Intl.DateTimeFormat('en-US').format(date)
      return <div className="pl-4">{formatted}</div>
    },
    enableGlobalFilter: false,
  },
  {
    accessorKey: "totalCost",
    header: () => <div className="text-right">Total Cost</div>,
    cell: ({ row }) => {
      return <div className="text-right font-medium">{formatCurrency(row.getValue("totalCost"))}</div>
    },
    enableGlobalFilter: false,
  },
  {
    accessorKey: "sellingPrice",
    header: () => <div className="text-right">Selling Price</div>,
    cell: ({ row }) => {
      return <div className="text-right font-medium">{formatCurrency(row.getValue("sellingPrice"))}</div>
    },
    enableGlobalFilter: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as InHouseDesign["status"];
      
      let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

      switch(status) {
        case "Stitching":
          variant = "default";
          break;
        case "Designing":
          variant = "outline";
          break;
        case "Finished":
        case "Sold":
          variant = "secondary";
          break;
      }

      return <Badge variant={variant}>{status}</Badge>;
    },
    enableGlobalFilter: false,
  },
]
