"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Product } from "@/lib/types"
import { getProductsByInventory } from "@/lib/products"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreHorizontal, FileEdit, Trash2, Plus, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function InventoryDetailPage() {
  const params = useParams()
  const inventoryId = params?.inventoryId as string
  
  const [items, setItems] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  // Form State
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    price: "",
    stock: ""
  })

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await getProductsByInventory(inventoryId)
      setItems(data.products || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [inventoryId])

  React.useEffect(() => {
    if (inventoryId) loadData()
  }, [inventoryId, loadData])

  const handleCreateProduct = async () => {
    setIsSubmitting(true)
    try {
      // Generate a simple random Product ID
      const generatedId = `PROD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      const payload = {
        ...formData,
        productId: generatedId,
        inventoryId: inventoryId,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setOpen(false)
        setFormData({ name: "", description: "", price: "", stock: "" })
        loadData() // Refresh list
      }
    } catch (err) {
      console.error("Failed to create product", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Inside your InventoryDetailPage component

const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
const [isUpdating, setIsUpdating] = React.useState(false);

const handleUpdateProduct = async () => {
  if (!editingProduct?.productId) {
    console.error("Cannot update: Database UUID (productId) is missing");
    return;
  }

  setIsUpdating(true);
  try {
    // Send the ID in the URL so Flask can find it
    const res = await fetch(`/api/products/${editingProduct.productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        stock: editingProduct.stock,
      }),
    });

    if (res.ok) {
      setEditingProduct(null); // Close dialog
      loadData(); // Refresh list
    }
  } catch (err) {
    console.error("Update failed:", err);
  } finally {
    setIsUpdating(false);
  }
};

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium">Inventory: {inventoryId}</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Products</h2>
                <p className="text-muted-foreground text-sm">Manage items for this location</p>
              </div>

              {/* ADD PRODUCT DIALOG */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
                </DialogTrigger>
                {/* EDIT PRODUCT DIALOG */}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Enter details to add stock to this inventory.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stock">Initial Stock</Label>
                        <Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateProduct} disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Product
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
                <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Product</DialogTitle>
                      <DialogDescription>Modify the details for {editingProduct?.productId}.</DialogDescription>
                    </DialogHeader>
                    
                    {editingProduct && (
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-name">Product Name</Label>
                          <Input 
                            id="edit-name" 
                            value={editingProduct.name} 
                            onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-desc">Description</Label>
                          <Textarea 
                            id="edit-desc" 
                            value={editingProduct.description || ""} 
                            onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-price">Price ($)</Label>
                            <Input 
                              id="edit-price" 
                              type="number" 
                              value={editingProduct.price} 
                              onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})} 
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-stock">Stock</Label>
                            <Input 
                              id="edit-stock" 
                              type="number" 
                              value={editingProduct.stock} 
                              onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})} 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
                      <Button onClick={handleUpdateProduct} disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Product
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
                    placeholder="Search by name..." 
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
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                       <TableRow><TableCell colSpan={4} className="text-center py-10">Loading...</TableCell></TableRow>
                    ) : filteredItems.length === 0 ? (
                       <TableRow><TableCell colSpan={4} className="text-center py-10">No products found.</TableCell></TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>{item.stock}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => setEditingProduct(item)}
                                  >
                                    <FileEdit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={async () => {
                                    if (!item.productId) return;

                                    const confirmDelete = confirm(`Delete ${item.name}?`);
                                    if (!confirmDelete) return;

                                    try {
                                      await fetch(`/api/products/${item.productId}`, {
                                        method: "DELETE",
                                      });

                                      // Remove from UI immediately
                                      setItems((prev) => prev.filter((p) => p.productId !== item.productId));
                                    } catch (err) {
                                      console.error("Delete failed:", err);
                                      alert("Failed to delete product");
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>

                              </DropdownMenuContent>
                            </DropdownMenu>
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

      </SidebarInset>
    </SidebarProvider>
  )
}