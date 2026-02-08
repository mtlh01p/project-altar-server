"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

export default function CartPage() {
  const params = useParams();
  const cartId = params?.cartId;
  const [cartItems, setCartItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    if (!cartId) return;
    loadCartItems();
  }, [cartId]);

  const loadCartItems = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/cart/${cartId}`);
      if (!res.ok) throw new Error("Failed to fetch cart items");
      const data = await res.json();
      setCartItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: string) => {
    try {
      const res = await apiFetch(`/cart/${cartId}`, {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      await loadCartItems();
    } catch (err) {
      console.error(err);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const res = await apiFetch(`/cart/${cartId}`, {
        method: "PATCH",
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) throw new Error("Failed to update item");
      await loadCartItems();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const res = await apiFetch(`/cart/${cartId}`, {
        method: "DELETE",
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      await loadCartItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Cart #{cartId}</h1>

        {loading ? (
          <p>Loading cart items...</p>
        ) : cartItems.length === 0 ? (
          <p>No items in this cart</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>{item.productName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</Button>
                    <span>{item.quantity}</span>
                    <Button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</Button>
                    <Button variant="destructive" onClick={() => removeItem(item.productId)}>Remove</Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
