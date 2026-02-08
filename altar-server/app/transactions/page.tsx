"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, ArrowUpDown, Undo2, CalendarIcon, Download, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const allTransactions = [
  {
    id: "TX1234",
    items: [
      { name: "Espresso", price: 3.5 },
      { name: "Latte", price: 4.5 },
      { name: "Croissant", price: 2.75 },
    ],
    total: 10.75,
    user: "Admin",
    date: new Date(2026, 0, 20, 10, 30),
    refunded: false,
  },
  {
    id: "TX1235",
    items: [{ name: "Cappuccino", price: 4.5 }],
    total: 4.5,
    user: "Cashier 1",
    date: new Date(2026, 0, 20, 9, 15),
    refunded: false,
  },
  {
    id: "TX1236",
    items: [
      { name: "Green Tea", price: 3.0 },
      { name: "Sandwich", price: 6.5 },
    ],
    total: 9.5,
    user: "Admin",
    date: new Date(2026, 0, 19, 14, 22),
    refunded: false,
  },
  {
    id: "TX1237",
    items: [{ name: "Orange Juice", price: 3.5 }],
    total: 3.5,
    user: "Cashier 2",
    date: new Date(2026, 0, 19, 11, 45),
    refunded: true,
  },
  {
    id: "TX1238",
    items: [
      { name: "Espresso", price: 3.5 },
      { name: "Blueberry Muffin", price: 3.25 },
    ],
    total: 6.75,
    user: "Cashier 1",
    date: new Date(2026, 0, 18, 16, 10),
    refunded: false,
  },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = React.useState(allTransactions)
  const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterUser, setFilterUser] = React.useState("all")
  const [sortBy, setSortBy] = React.useState<"date" | "amount">("date")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [dateFrom, setDateFrom] = React.useState<Date>()
  const [dateTo, setDateTo] = React.useState<Date>()

  const handleRefund = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, refunded: true } : tx))
    )
    setSelectedTransaction(null)
  }

  const filteredTransactions = React.useMemo(() => {
    let filtered = [...transactions]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (tx) =>
          tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by user
    if (filterUser !== "all") {
      filtered = filtered.filter((tx) => tx.user === filterUser)
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter((tx) => tx.date >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((tx) => tx.date <= dateTo)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? a.date.getTime() - b.date.getTime()
          : b.date.getTime() - a.date.getTime()
      } else {
        return sortOrder === "asc" ? a.total - b.total : b.total - a.total
      }
    })

    return filtered
  }, [transactions, searchQuery, filterUser, dateFrom, dateTo, sortBy, sortOrder])

  const uniqueUsers = Array.from(new Set(transactions.map((tx) => tx.user)))

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">SwiftPOS</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Transactions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>
            <p className="text-muted-foreground mt-2">View and manage transaction history</p>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder="Search by transaction ID or items..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {uniqueUsers.map((user) => (
                        <SelectItem key={user} value={user}>
                          {user}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex gap-2 items-center flex-1">
                    <Label className="text-sm text-muted-foreground whitespace-nowrap">Date Range:</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal bg-transparent",
                            !dateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom ? format(dateFrom, "PPP") : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <span className="text-muted-foreground">to</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal bg-transparent",
                            !dateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo ? format(dateTo, "PPP") : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-transparent">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Sort by {sortBy === "date" ? "Date" : "Amount"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("date")
                          setSortOrder("desc")
                        }}
                      >
                        Date (Newest First)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("date")
                          setSortOrder("asc")
                        }}
                      >
                        Date (Oldest First)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("amount")
                          setSortOrder("desc")
                        }}
                      >
                        Amount (High to Low)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("amount")
                          setSortOrder("asc")
                        }}
                      >
                        Amount (Low to High)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedTransaction(tx)}
                    >
                      <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {tx.items
                            .slice(0, 2)
                            .map((i) => i.name)
                            .join(", ")}
                          {tx.items.length > 2 && "..."}
                        </div>
                        <div className="text-xs text-muted-foreground">{tx.items.length} items</div>
                      </TableCell>
                      <TableCell>{tx.user}</TableCell>
                      <TableCell className="text-sm">{format(tx.date, "MMM dd, yyyy HH:mm")}</TableCell>
                      <TableCell className="text-right font-semibold">${tx.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {tx.refunded ? (
                          <Badge variant="destructive">Refunded</Badge>
                        ) : (
                          <Badge variant="secondary">Completed</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Details Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>Transaction {selectedTransaction?.id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">User</span>
                <span className="font-medium">{selectedTransaction?.user}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {selectedTransaction && format(selectedTransaction.date, "MMM dd, yyyy HH:mm")}
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground">Items</div>
                {selectedTransaction?.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-lg">
                <span>Total</span>
                <span>${selectedTransaction?.total.toFixed(2)}</span>
              </div>
              {selectedTransaction?.refunded && (
                <Badge variant="destructive" className="w-full justify-center">
                  This transaction has been refunded
                </Badge>
              )}
            </div>
            <DialogFooter>
              {!selectedTransaction?.refunded && (
                <Button
                  variant="outline"
                  className="text-destructive border-destructive hover:bg-destructive hover:text-white bg-transparent"
                  onClick={() => handleRefund(selectedTransaction?.id)}
                >
                  <Undo2 className="mr-2 h-4 w-4" />
                  Issue Refund
                </Button>
              )}
              <Button onClick={() => setSelectedTransaction(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
