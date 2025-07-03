
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { useData } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { columns as baseColumns } from "./columns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TailoringOrder } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";

const formSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  billNo: z.string().min(1, "Bill number is required."),
  customer: z.string().min(2, "Customer name is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  type: z.string().min(2, "Order type is required."),
  totalCost: z.coerce.number().min(0, "Total cost must be a positive number."),
  advance: z.coerce.number().min(0, "Advance must be a positive number."),
  paymentReceived: z.coerce.number().optional(),
  balance: z.coerce.number(),
  deliveryDate: z.date({ required_error: "A delivery date is required." }),
  paymentMode: z.enum(['Cash', 'Card', 'UPI', 'Other']),
  status: z.enum(['To Do', 'In Progress', 'Blocked', 'Completed', 'Canceled', 'Done – Payment Pending']),
}).superRefine((data, ctx) => {
    const totalPaid = (data.advance || 0) + (data.paymentReceived || 0);
    if (data.totalCost > 0 && totalPaid > data.totalCost) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Total paid amount cannot exceed total cost.",
            path: ["paymentReceived"],
        });
    }
});

export default function TailoringPage() {
  const { tailoringOrders, addTailoringOrder, updateTailoringOrder, loading } = useData();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOrder, setEditingOrder] = useState<TailoringOrder | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      billNo: "",
      customer: "",
      phone: "",
      type: "",
      totalCost: 0,
      advance: 0,
      paymentReceived: undefined,
      balance: 0,
      deliveryDate: new Date(),
      paymentMode: 'Cash',
      status: 'To Do',
    },
  });

  const totalCost = form.watch("totalCost");
  const advance = form.watch("advance");
  const paymentReceived = form.watch("paymentReceived");

  useEffect(() => {
    const totalPaid = (advance || 0) + (paymentReceived || 0);
    const newBalance = (totalCost || 0) - totalPaid;
    form.setValue("balance", newBalance >= 0 ? newBalance : 0);
  }, [totalCost, advance, paymentReceived, form]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingOrder(null);
      form.reset();
    }
  };

  const handleAddNew = () => {
    setEditingOrder(null);
    form.reset({
      date: new Date(),
      billNo: "",
      customer: "",
      phone: "",
      type: "",
      totalCost: 0,
      advance: 0,
      paymentReceived: undefined,
      balance: 0,
      deliveryDate: new Date(),
      paymentMode: 'Cash',
      status: 'To Do',
    });
    setOpen(true);
  };

  const handleEdit = useCallback((order: TailoringOrder) => {
    setEditingOrder(order);
    form.reset({...order, paymentReceived: undefined });
    setOpen(true);
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      if (editingOrder) {
        const newAdvance = (values.advance || 0) + (values.paymentReceived || 0);
        const updatedOrderData = {
          ...values,
          advance: newAdvance,
          balance: values.totalCost - newAdvance,
        };
        delete (updatedOrderData as any).paymentReceived;

        await updateTailoringOrder(editingOrder.id, updatedOrderData);
        toast({
          title: "Success!",
          description: "Order has been updated.",
        });
      } else {
        const newOrderData = {...values};
        delete (newOrderData as any).paymentReceived;
        await addTailoringOrder(newOrderData);
        toast({
          title: "Success!",
          description: "New tailoring order has been added.",
        });
      }
      handleOpenChange(false);
    } catch (error) {
       toast({
        title: "Error",
        description: `Failed to ${editingOrder ? 'update' : 'add'} order.`,
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<TailoringOrder>[]>(() => {
    const actionsColumn: ColumnDef<TailoringOrder> = {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(order)}>
                Update
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableGlobalFilter: false,
    };
    return [...baseColumns, actionsColumn];
  }, [handleEdit]);

  const renderTailoringCard = (order: TailoringOrder) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    switch(order.status) {
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
    return (
      <Card key={order.id}>
        <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
            <div>
                <CardTitle className="text-lg">{order.customer}</CardTitle>
                <p className="text-sm text-muted-foreground">Bill No: {order.billNo}</p>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(order)}>
                        Update
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4 pt-0 grid gap-2">
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">{format(order.deliveryDate, "PPP")}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status</span>
                <div className={cn(badgeVariants({ variant: variant as any }))}>{order.status}</div>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Balance</span>
                <div className={cn(badgeVariants({ variant: order.balance > 0 ? "destructive" : "secondary" }))}>
                    {formatCurrency(order.balance)}
                </div>
            </div>
        </CardContent>
    </Card>
    );
  };


  return (
    <div>
      <PageHeader title="Tailoring Orders">
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Order
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingOrder ? 'Update Order' : 'Add a New Tailoring Order'}</SheetTitle>
              <SheetDescription>
                {editingOrder ? 'Update the details for this order.' : 'Fill in the details below to log a new tailoring order.'}
              </SheetDescription>
            </SheetHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8">
                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="billNo"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bill No.</FormLabel>
                    <FormControl><Input placeholder="e.g., B003" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="e.g., 123-456-7890" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Work Type</FormLabel>
                    <FormControl><Input placeholder="e.g., Dress Alteration" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="totalCost"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Total Cost</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 50.00" {...field} readOnly={!!editingOrder} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="advance"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Advance</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 20.00" {...field} readOnly={!!editingOrder} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                {editingOrder && (
                <FormField
                    control={form.control}
                    name="paymentReceived"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Receive Payment</FormLabel>
                        <FormControl><Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                )}
                <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Balance</FormLabel>
                    <FormControl><Input type="number" readOnly className="bg-muted" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Delivery Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Done – Payment Pending">Done – Payment Pending</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Canceled">Canceled</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="paymentMode"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Payment Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a payment mode" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isSubmitting} className="mb-8">
                  {isSubmitting ? (editingOrder ? "Updating..." : "Adding...") : (editingOrder ? "Update Order" : "Add Order")}
                </Button>
            </form>
            </Form>
          </SheetContent>
        </Sheet>
      </PageHeader>
      
      <DataTable 
        columns={columns} 
        data={tailoringOrders} 
        filterPlaceholder="Filter by customer or bill no..."
        isLoading={loading}
        renderCard={renderTailoringCard}
      />
    </div>
  );
}
