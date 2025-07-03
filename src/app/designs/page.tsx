
"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { useData } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { InHouseDesign } from "@/lib/types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(2, "Design name is required."),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  materialCost: z.coerce.number().min(0, "Material cost must be a positive number."),
  laborCost: z.coerce.number().min(0, "Labor cost must be a positive number."),
  sellingPrice: z.coerce.number().min(0, "Selling price must be a positive number."),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date().optional(),
  status: z.enum(['Designing', 'Stitching', 'Finished', 'Sold']),
}).transform(data => ({
    ...data,
    totalCost: data.materialCost + data.laborCost
})).superRefine((data, ctx) => {
    if (data.endDate && data.startDate > data.endDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date cannot be earlier than start date.",
            path: ["endDate"],
        });
    }
});

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
}).format(amount)

export default function DesignsPage() {
  const { designs, addDesign, loading } = useData();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      materialCost: 0,
      laborCost: 0,
      sellingPrice: 0,
      startDate: new Date(),
      endDate: undefined,
      status: 'Designing',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await addDesign(values);
      toast({
        title: "Success!",
        description: "New design has been added.",
      });
      form.reset();
      setOpen(false);
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to add new design.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderDesignCard = (design: InHouseDesign) => {
      let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

      switch(design.status) {
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

    return (
      <Card key={design.id}>
        <CardHeader className="flex flex-row items-center gap-4 p-4 pb-2">
          <Image
            src={design.imageUrl || 'https://placehold.co/100x100.png'}
            alt={design.name}
            data-ai-hint="dress design"
            width={64}
            height={64}
            className="object-cover rounded-md aspect-square"
          />
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{design.name}</CardTitle>
            <Badge variant={variant} className="mt-1">{design.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 grid gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Start Date</span>
            <span className="font-medium">{format(design.startDate, "PPP")}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Selling Price</span>
            <span className="font-bold">{formatCurrency(design.sellingPrice)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="In-House Designs">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Design
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add a New Design</SheetTitle>
              <SheetDescription>
                Fill in the details below to track a new in-house design.
              </SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Design Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Summer Floral Maxi Dress" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://placehold.co/100x100.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
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
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
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
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="materialCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Cost</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1500.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="laborCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Labor Cost</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 800.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 3500.00" {...field} />
                      </FormControl>
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
                          <SelectItem value="Designing">Designing</SelectItem>
                          <SelectItem value="Stitching">Stitching</SelectItem>
                          <SelectItem value="Finished">Finished</SelectItem>
                          <SelectItem value="Sold">Sold</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Design"}
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </PageHeader>
      <DataTable 
        columns={columns} 
        data={designs}
        filterPlaceholder="Filter by design name..."
        isLoading={loading}
        renderCard={renderDesignCard}
      />
    </div>
  );
}
