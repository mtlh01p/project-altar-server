"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Product } from "@/lib/types"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreHorizontal, Loader2, Trash2, Plus, Minus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function CartDetailPage() {
  const params = useParams()
  const cartId = params?.cartId as string

  const [items, setItems] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  // Form state for adding a new product to cart
  const [formData, setFormData] = React.useState({
    productId: "",
    quantity: "1"
  })
  

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/cart/${cartId}/items`)
      if (!res.ok) throw new Error("Failed to fetch cart items")
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [cartId])

  React.useEffect(() => {
    if (cartId) loadData()
  }, [cartId, loadData])

  // Add new item
  const handleAddItem = async () => {
    if (!formData.productId) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/cart/${cartId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formData.productId,
          quantity: parseInt(formData.quantity)
        }),
      })
      if (!res.ok) throw new Error("Failed to add item")
      setFormData({ productId: "", quantity: "1" })
      setOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      alert("Failed to add item")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Remove item completely
  const handleRemoveItem = async (itemId: number) => {
    const confirmDelete = confirm("Remove this item from cart completely?")
    if (!confirmDelete) return

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to remove item")
      setItems((prev) => prev.filter((i) => i.id !== itemId))
    } catch (err) {
      console.error(err)
      alert("Failed to remove item")
    }
  }

  // Update quantity (+ / -)
  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      // Optionally remove item if quantity goes to 0
      handleRemoveItem(itemId)
      return
    }

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      if (!res.ok) throw new Error("Failed to update quantity")
      loadData()
    } catch (err) {
      console.error(err)
      alert("Failed to update quantity")
    }
  }

  const filteredItems = items.filter((item) =>
    item.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium">Cart: {cartId}</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Items</h2>
                <p className="text-muted-foreground text-sm">Manage products in this cart</p>
              </div>

              {/* ADD ITEM DIALOG */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Item to Cart</DialogTitle>
                    <DialogDescription>Select a product and quantity to add.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="productId">Product ID</Label>
                      <Input
                        id="productId"
                        value={formData.productId}
                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddItem} disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="relative w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by product name..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-10">Loading...</TableCell></TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-10">No items in cart</TableCell></TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product?.name || "Unknown"}</TableCell>
                          <TableCell>${item.product?.price?.toFixed(2) || "0.00"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            if (!items.length) return alert("Cart is empty");

            try {
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  cartId,
                  items: items.map(i => ({
                    id: i.id,
                    productId: i.product?.productId,
                    quantity: i.quantity,
                    price: i.product?.price,
                    productStock: i.product?.stock
                  }))
                })
              });

              if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Checkout failed");
                return;
              }

              const data = await res.json();
              const transactionId = data.transaction?.transactionId || data.transactionId;
              alert(`Checkout success! Transaction ID: ${transactionId}`);
              // Refresh cart page
              setItems([]);
            } catch (err) {
              console.error(err);
              alert("Checkout failed");
            }
          }}
        >
          Checkout
        </Button>
      </SidebarInset>
    </SidebarProvider>
  )
}
