"use client";

import { useData } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalysisPage() {
  const { sales, expenses, tailoringOrders, loading } = useData();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && user?.role === "staff") {
      router.replace("/tailoring");
    }
  }, [user, isAuthLoading, router]);

  const monthlySummary = useMemo(() => {
    if (loading) return [];

    const summary: { [key: string]: { income: number; expenses: number } } = {};

    tailoringOrders.forEach((order) => {
      const monthKey = format(order.date, "yyyy-MM");
      if (!summary[monthKey]) {
        summary[monthKey] = { income: 0, expenses: 0 };
      }
      summary[monthKey].income += order.advance;
    });

    sales.forEach((sale) => {
      const monthKey = format(sale.date, "yyyy-MM");
      if (!summary[monthKey]) {
        summary[monthKey] = { income: 0, expenses: 0 };
      }
      summary[monthKey].income += sale.price;
    });

    expenses.forEach((expense) => {
      const monthKey = format(expense.date, "yyyy-MM");
      if (!summary[monthKey]) {
        summary[monthKey] = { income: 0, expenses: 0 };
      }
      summary[monthKey].expenses += expense.amount;
    });

    return Object.entries(summary)
      .map(([monthKey, data]) => ({
        month: format(new Date(`${monthKey}-02`), "MMMM yyyy"),
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses,
      }))
      .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
  }, [sales, expenses, tailoringOrders, loading]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  if (isAuthLoading || user?.role === "staff") {
    return null;
  }

  return (
    <div>
      <PageHeader title="Monthly Analysis" />
      <Card>
        <CardHeader>
          <CardTitle>Month-wise Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Month</TableHead>
                <TableHead className="text-right font-semibold">
                  Total Income
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Total Expenses
                </TableHead>
                <TableHead className="text-right font-semibold">
                  Balance
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-6 w-3/4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-3/4 ml-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-3/4 ml-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-3/4 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : monthlySummary.length > 0 ? (
                monthlySummary.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.income)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.expenses)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        row.balance < 0 ? "text-destructive" : ""
                      }`}
                    >
                      {formatCurrency(row.balance)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No data available to generate a summary.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
