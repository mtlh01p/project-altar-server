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
import { Search, Download, ArrowRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const allLogs = [
  {
    id: 1,
    product: "Coffee Beans",
    change: "edited",
    user: "Admin",
    date: "Jan 20, 2026 10:30 AM",
    details: { field: "Stock Level", from: "12kg", to: "20kg" },
  },
  {
    id: 2,
    product: "Paper Cups",
    change: "added",
    user: "Manager",
    date: "Jan 19, 2026 02:15 PM",
    details: null,
  },
  {
    id: 3,
    product: "Green Tea",
    change: "removed",
    user: "Admin",
    date: "Jan 18, 2026 09:00 AM",
    details: null,
  },
  {
    id: 4,
    product: "Whole Milk",
    change: "edited",
    user: "Cashier 1",
    date: "Jan 18, 2026 08:45 AM",
    details: { field: "Unit Price", from: "$1.00", to: "$1.20" },
  },
  {
    id: 5,
    product: "Croissants",
    change: "edited",
    user: "Manager",
    date: "Jan 17, 2026 04:30 PM",
    details: { field: "Low Stock Threshold", from: "10", to: "15" },
  },
]

export default function InventoryLogsPage() {
  const [logs, setLogs] = React.useState(allLogs)
  const [selectedLog, setSelectedLog] = React.useState<any>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterAction, setFilterAction] = React.useState("all")
  const [filterUser, setFilterUser] = React.useState("all")

  const filteredLogs = React.useMemo(() => {
    let filtered = [...logs]

    if (searchQuery) {
      filtered = filtered.filter((log) => log.product.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (filterAction !== "all") {
      filtered = filtered.filter((log) => log.change === filterAction)
    }

    if (filterUser !== "all") {
      filtered = filtered.filter((log) => log.user === filterUser)
    }

    return filtered
  }, [logs, searchQuery, filterAction, filterUser])

  const uniqueUsers = Array.from(new Set(logs.map((log) => log.user)))

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
                <BreadcrumbLink href="/inventory">Inventory</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Logs</BreadcrumbPage>
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
            <h1 className="text-3xl font-bold tracking-tight">Inventory Logs</h1>
            <p className="text-muted-foreground mt-2">Complete audit trail of inventory changes</p>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search by product name..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="added">Added</SelectItem>
                    <SelectItem value="edited">Edited</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                  </SelectContent>
                </Select>
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
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Showing {filteredLogs.length} of {logs.length} log entries
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>By Who</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLog(log)}
                    >
                      <TableCell className="font-medium">{log.product}</TableCell>
                      <TableCell>
                        <Badge
                          variant={log.change === "removed" ? "destructive" : log.change === "edited" ? "outline" : "secondary"}
                          className="capitalize"
                        >
                          {log.change}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{log.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Log Details Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Details</DialogTitle>
              <DialogDescription>
                {selectedLog?.product} - {selectedLog?.change}
              </DialogDescription>
            </DialogHeader>
            {selectedLog?.change === "edited" && selectedLog.details ? (
              <div className="space-y-4 py-4">
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">Field Changed</div>
                  <div className="text-lg font-semibold">{selectedLog.details.field}</div>
                </div>
                <div className="flex items-center justify-center gap-8">
                  <div className="space-y-1 text-center">
                    <div className="text-xs text-muted-foreground">Before</div>
                    <div className="text-lg font-bold">{selectedLog.details.from}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1 text-center">
                    <div className="text-xs text-muted-foreground">After</div>
                    <div className="text-lg font-bold text-emerald-600">{selectedLog.details.to}</div>
                  </div>
                </div>
                <div className="text-center text-xs text-muted-foreground border-t pt-4">
                  Updated by {selectedLog.user} on {selectedLog.date}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4 text-center">
                <div className="text-sm text-muted-foreground">
                  {selectedLog?.change === "added" && `Product "${selectedLog.product}" was added to inventory.`}
                  {selectedLog?.change === "removed" && `Product "${selectedLog.product}" was removed from inventory.`}
                </div>
                <div className="text-xs text-muted-foreground border-t pt-4">
                  Performed by {selectedLog?.user} on {selectedLog?.date}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
