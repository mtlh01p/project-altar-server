"use client"
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
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Store, ChevronRight, Users, Clock, Package } from "lucide-react"
import { useState, useEffect } from "react"
import type { Inventory } from "@/lib/types"
import Link from "next/link"

export default function CheckoutSelectPage() {
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  
  // UI & Form States
  const [addVisible, setAddVisible] = useState(false)
  const [newInventoryName, setNewInventoryName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch Inventories
  useEffect(() => {
    async function loadInventories() {
      try {
        const res = await fetch("/api/inventory")
        if (!res.ok) throw new Error("Failed to fetch inventories")
        const data = await res.json()
        // Handle variations in API response structure
        setInventories(data.inventories ?? data ?? [])
      } catch (err) {
        console.error("Error loading inventories:", err)
      } finally {
        setLoading(false)
      }
    }
    loadInventories()
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">SwiftPOS</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Select Inventory</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Select an Inventory</h1>
              <p className="text-muted-foreground mt-2">Choose which inventory to access for checkout</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inventories.map((inventory) => (
                <Link key={inventory.inventoryId} href={`/pos/${inventory.inventoryId}`}>
                  <Card className="group cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-primary/50">
                    <CardHeader>
                      <div className="mb-4 flex items-start justify-between">
                        <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                          <Store className="h-6 w-6" />
                        </div>
                        <ChevronRight className="text-muted-foreground h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </div>
                      <CardTitle className="text-balance">{inventory.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{inventory.description}</CardDescription>
                      <div className="mt-4 flex flex-wrap items-center gap-4 pt-4 border-t text-xs text-muted-foreground">
                        {/*<div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5" />
                          <span>{inventory.itemCount} items</span>
                        </div>*/}
                        {/*<div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          <span>{inventory.role}</span>
                        </div>*/}
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{inventory.created_at}</span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
