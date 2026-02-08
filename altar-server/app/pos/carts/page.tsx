"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

export default function CartsPage() {
  const [carts, setCarts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newCartName, setNewCartName] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    loadCarts();
  }, []);

  const loadCarts = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch carts");
      const data = await res.json();
      setCarts(data.carts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCart = async () => {
    if (!newCartName) return;
    try {
      const res = await apiFetch("/api/cart", {
        method: "POST",
        body: JSON.stringify({ name: newCartName }),
      });
      if (!res.ok) throw new Error("Failed to create cart");
      const data = await res.json();
      setCarts((prev) => [...prev, data]);
      setNewCartName("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Carts</h1>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="New Cart Name"
              value={newCartName}
              onChange={(e) => setNewCartName(e.target.value)}
            />
            <Button onClick={createCart}>Create Cart</Button>
          </div>

          {loading ? (
            <p>Loading carts...</p>
          ) : carts.length === 0 ? (
            <p>No carts found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {carts.map((cart) => (
                <Card
                  key={cart.cartId}
                  className="cursor-pointer"
                  onClick={() => router.push(`/pos/api/cart/${cart.cartId}`)}
                >
                  <CardHeader>
                    <CardTitle>{cart.name || `Cart #${cart.cartId}`}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
