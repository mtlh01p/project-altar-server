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
import { Plus, Search, ShoppingCart } from "lucide-react"
import { getProductsByInventory } from "@/lib/products"
import { Product } from "@/lib/types"
import { Suspense } from "react" // Added Suspense

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

  React.useEffect(() => {
    const stored = localStorage.getItem("activeCartId")
    if (stored) setActiveCartId(stored)
  }, [])
    const cartItemCount = cartCount // You can replace this with actual cart item count logic

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

const addToCart = async (product: Product) => {
  if (!activeCartId) {
    alert("No active cart selected")
    return
  }

  try {
    await fetch("/api/cart-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartId: activeCartId,
        productId: product.productId,
      }),
    })
  } catch (err) {
    console.error("Failed to add to cart", err)
  }
}


  const filteredProducts = items.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    // Ensure category exists in your DB or default to 'All'
    const matchesCategory = selectedCategory === "All" || product.name === selectedCategory // To be edited later
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
                  if (!activeCartId) {
                    router.push("/pos/carts") // choose or create cart first
                  } else {
                    router.push(`/pos/cart/${activeCartId}`)
                  }
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 flex items-center justify-center text-[10px] md:text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </header>

          <div className="flex flex-1 flex-col overflow-hidden p-4">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <TabsList className="bg-muted/50 border">
                  <TabsTrigger value="All">All Items</TabsTrigger>
                  <TabsTrigger value="Coffee">Coffee</TabsTrigger>
                  <TabsTrigger value="Tea">Tea</TabsTrigger>
                  <TabsTrigger value="Pastries">Pastries</TabsTrigger>
                  <TabsTrigger value="Food">Food</TabsTrigger>
                  <TabsTrigger value="Beverages">Beverages</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-4">
                {/* Replace your .map content with this */}
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
                        onClick={() => addToCart(product)}
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
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  )
}
