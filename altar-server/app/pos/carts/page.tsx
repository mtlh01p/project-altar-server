"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, ChevronRight, Clock, Loader2, AlertCircle } from "lucide-react"

export default function CartsPage() {
  const [carts, setCarts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // UI states
  const [addVisible, setAddVisible] = useState(false)
  const [newCartName, setNewCartName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadCarts() {
      try {
        const res = await fetch("/api/cart")
        if (!res.ok) throw new Error("Failed to fetch carts")
        const data = await res.json()
        setCarts(data.carts ?? data ?? [])
      } catch (err) {
        console.error("Error loading carts:", err)
      } finally {
        setLoading(false)
      }
    }

    loadCarts()
  }, [])

  const handleCreateCart = async () => {
    if (!newCartName.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartName: newCartName }),
      })

      if (res.ok) {
        const newCart = await res.json()
        setCarts((prev) => [newCart, ...prev])
        setNewCartName("")
        setAddVisible(false)
      } else {
        const errorData = await res.json()
        alert(errorData.error || "Failed to create cart")
      }
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
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
                <BreadcrumbPage>All Carts</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 p-4 md:p-8">
            <div className="mx-auto w-full max-w-4xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">All Carts</h1>
                <p className="text-muted-foreground mt-2">
                  Manage and open active shopping carts
                </p>
              </div>

              <div className="mb-8">
                <Button
                  size="sm"
                  variant={addVisible ? "ghost" : "outline"}
                  onClick={() => setAddVisible(!addVisible)}
                >
                  {addVisible ? "Cancel" : "Add Cart"}
                </Button>
              </div>

              {addVisible && (
                <div className="mb-8 p-4 border rounded-lg bg-card shadow-sm animate-in fade-in slide-in-from-top-2">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Create New Cart
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="e.g. Counter 1"
                      value={newCartName}
                      onChange={(e) => setNewCartName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateCart()
                      }
                      disabled={isSubmitting}
                    />

                    <Button
                      onClick={handleCreateCart}
                      disabled={isSubmitting || !newCartName.trim()}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isSubmitting ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : carts.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <p className="text-muted-foreground">
                    No carts found. Create your first one above!
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {carts.map((cart) => (
                    <Link key={cart.cartId} href={`/pos/cart/${cart.cartId}`}>
                      <Card className="group cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-primary/50">
                        <CardHeader>
                          <div className="mb-4 flex items-start justify-between">
                            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                              <ShoppingCart className="h-6 w-6" />
                            </div>
                            <ChevronRight className="text-muted-foreground h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </div>

                          <CardTitle className="text-balance">
                            {cart.cartName}
                          </CardTitle>

                          <div className="mt-4 flex items-center gap-1.5 pt-4 border-t text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {cart.created_at
                                ? new Date(cart.created_at).toLocaleDateString()
                                : "Recently created"}
                            </span>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
