"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, ShoppingBag } from "lucide-react"
import { getProductsByInventory } from "@/lib/products"
import { Product } from "@/lib/types"
import { Suspense } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CheckoutPage() {
  const params = useParams()
  const inventoryId = params?.inventoryId as string
  const router = useRouter()
  const [items, setItems] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [cartCount, setCartCount] = React.useState(0)
  const [selectedCategory, setSelectedCategory] = React.useState("All")
  const [activeCartId, setActiveCartId] = React.useState<string | null>(null)

  // New state for Add-to-Cart dialog
  const [cartDialogOpen, setCartDialogOpen] = React.useState(false)
  const [carts, setCarts] = React.useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)

  React.useEffect(() => {
    const stored = localStorage.getItem("activeCartId")
    if (stored) setActiveCartId(stored)
  }, [])

  const cartItemCount = cartCount // UI badge

  // FETCH REAL PRODUCTS
  React.useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const data = await getProductsByInventory(inventoryId)
        setItems(data.products || [])
      } catch (err) {
        console.error("Failed to load products", err)
      } finally {
        setLoading(false)
      }
    }

    if (inventoryId) loadProducts()
  }, [inventoryId])

  // Load carts for the dialog
  const loadCarts = async () => {
    try {
      const res = await fetch("/api/cart", { headers: { "Content-Type": "application/json" } })
      if (!res.ok) throw new Error("Failed to fetch carts")
      const data = await res.json()
      setCarts(data.carts || data)
    } catch (err) {
      console.error("Failed to load carts", err)
    }
  }

  // Open Add-to-Cart dialog
  const handleAddClick = (product: Product) => {
    setSelectedProduct(product)
    setCartDialogOpen(true)
    loadCarts()
  }

  const addToCart = async (cartId: string, product: Product) => {
    try {
      const res = await fetch(`/api/cart/${cartId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.productId, quantity: 1 }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        alert(errorData.error || "Failed to add item")
        return
      }

      setCartCount((prev) => prev + 1)
      setCartDialogOpen(false)
      setSelectedProduct(null)
    } catch (err) {
      console.error("Failed to add to cart", err)
      alert("Failed to add item to cart")
    }
  }

  const filteredProducts = items.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.name === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <Suspense fallback={null}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 border-b px-2 md:px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">SwiftPOS</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/pos">Checkout</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{inventoryId}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-1 md:gap-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search..."
                  className="w-32 md:w-48 lg:w-64 pl-8 h-8 md:h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="relative bg-transparent h-8 md:h-10 px-2 md:px-4"
                onClick={() => {
                  if (!activeCartId) router.push("/pos/carts")
                  else router.push(`/pos/cart/${activeCartId}`)
                }}
              >
                <ShoppingBag className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 flex items-center justify-center text-[10px] md:text-xs">
                    🔼
                  </Badge>
                )}
              </Button>
            </div>
          </header>

          <div className="flex flex-1 flex-col overflow-hidden p-4">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full flex flex-col">
              {/*<div className="mb-4 flex items-center justify-between">
                <TabsList className="bg-muted/50 border">
                  <TabsTrigger value="All">All Items</TabsTrigger>
                  <TabsTrigger value="Coffee">Coffee</TabsTrigger>
                  <TabsTrigger value="Tea">Tea</TabsTrigger>
                  <TabsTrigger value="Pastries">Pastries</TabsTrigger>
                  <TabsTrigger value="Food">Food</TabsTrigger>
                  <TabsTrigger value="Beverages">Beverages</TabsTrigger>
                </TabsList>
              </div>*/}

              <ScrollArea className="flex-1">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-4">
                  {loading ? (
                    <div className="col-span-full py-20 text-center">Loading items...</div>
                  ) : filteredProducts.map((product) => (
                    <Card
                      key={product.productId}
                      className="group flex flex-col overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant={product.stock < 10 ? "destructive" : "secondary"}
                            className="bg-background/80 backdrop-blur-sm"
                          >
                            {product.stock} in stock
                          </Badge>
                        </div>
                      </div>
                      
                      <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-sm line-clamp-1">{product.name}</CardTitle>
                        <div className="text-primary font-bold text-lg">
                          ${product.price.toFixed(2)}
                        </div>
                      </CardHeader>

                      <div className="p-3 pt-2 mt-auto">
                        <Button
                          className="w-full gap-2"
                          size="sm"
                          onClick={() => handleAddClick(product)}
                        >
                          <Plus className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </Tabs>
          </div>

          {/* --- ADD TO CART DIALOG --- */}
          <Dialog open={cartDialogOpen} onOpenChange={setCartDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Select a Cart</DialogTitle>
                <DialogDescription>
                  Choose which cart to add <strong>{selectedProduct?.name}</strong> to.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2 py-2">
                {carts.length === 0 ? (
                  <p>No carts found. Create one first in <strong>Checkout → Carts</strong>.</p>
                ) : (
                  carts.map((cart) => (
                    <Button
                      key={cart.cartId}
                      variant="outline"
                      onClick={() => selectedProduct && addToCart(cart.cartId, selectedProduct)}
                    >
                      {cart.name || `${cart.cartName}`}
                    </Button>
                  ))
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCartDialogOpen(false)}>Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  )
}
