"use client"

import React, { useEffect, useState } from "react";
import { getProduct } from "@/lib/products";
import { fetchInventories } from "@/lib/inventory";
import { getCurrentUser } from "@/lib/auth";

// Helper to fetch user name by userId
async function fetchUserName(userId: string): Promise<string> {
  try {
    const res = await fetch(`/api/auth/user/${userId}`);
    if (!res.ok) return userId;
    const data = await res.json();
    return data.user?.name || userId;
  } catch {
    return userId;
  }
}
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transaction } from "@/lib/types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [productMap, setProductMap] = useState<Record<string, any>>({});
  const [inventoryMap, setInventoryMap] = useState<Record<string, any>>({});
  const [userMap, setUserMap] = useState<Record<string, any>>({});
  const [filterInventory, setFilterInventory] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        let url = "/api/transactions";
        const params = [];
        if (filterUser) params.push(`userId=${encodeURIComponent(filterUser)}`);
        if (filterInventory) params.push(`inventoryId=${encodeURIComponent(filterInventory)}`);
        if (params.length) url += `?${params.join("&")}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const data = await res.json();
        let txns: Transaction[] = [];
        if (Array.isArray(data)) {
          txns = data;
        } else if (data?.transactions && Array.isArray(data.transactions)) {
          txns = data.transactions;
        } else if (data?.data && Array.isArray(data.data)) {
          txns = data.data;
        }
        setTransactions(txns);

        // Preload product, inventory, and user names for all transactions
        const allProductIds = Array.from(new Set(txns.flatMap((t: Transaction) => t.productIds)));
        const allInventoryIds = Array.from(new Set(txns.map((t: Transaction) => t.inventoryId).filter((id): id is string => Boolean(id))));
        const allUserIds = Array.from(new Set(txns.map((t: Transaction) => t.userId).filter((id): id is string => Boolean(id))));

        // Fetch product names
        const productMap: Record<string, any> = {};
        await Promise.all(allProductIds.map(async (pid: string) => {
          try {
            const prod = await getProduct(pid);
            productMap[pid] = prod.product?.name || pid;
          } catch {
            productMap[pid] = pid;
          }
        }));
        setProductMap(productMap);

        // Fetch inventory names
        const inventoryMap: Record<string, any> = {};
        if (allInventoryIds.length) {
          const inventories = await fetchInventories();
          for (const inv of inventories) {
            inventoryMap[inv.inventoryId] = inv.name;
          }
        }
        setInventoryMap(inventoryMap);

        // Fetch user names
        const userMap: Record<string, any> = {};
        await Promise.all(allUserIds.map(async (uid: string) => {
          userMap[uid] = await fetchUserName(uid);
        }));
        setUserMap(userMap);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [filterUser, filterInventory]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium">Transactions</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <p className="text-muted-foreground text-sm">View all completed transactions</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div>
                    <label className="block text-xs mb-1">Filter by Inventory</label>
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={filterInventory}
                      onChange={e => setFilterInventory(e.target.value)}
                    >
                      <option value="">All</option>
                      {Object.entries(inventoryMap).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Filter by User</label>
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={filterUser}
                      onChange={e => setFilterUser(e.target.value)}
                    >
                      <option value="">All</option>
                      {Object.entries(userMap).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-10">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">No transactions found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead></TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>User</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t) => {
                        // Count product quantities
                        const productCount: Record<string, number> = {};
                        t.productIds?.forEach((pid: string) => {
                          productCount[pid] = (productCount[pid] || 0) + 1;
                        });
                        return (
                          <React.Fragment key={t.transactionId}>
                            <TableRow>
                              <TableCell>
                                <button
                                  className="text-xs underline"
                                  onClick={() => setExpanded(expanded === t.transactionId ? null : t.transactionId)}
                                >
                                  {expanded === t.transactionId ? "-" : "+"}
                                </button>
                              </TableCell>
                              <TableCell>{t.transactionId}</TableCell>
                              <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>
                              <TableCell className="font-semibold">${t.total?.toFixed(2) || "0.00"}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {t.userId ? (userMap[t.userId] || t.userId) : "Anonymous"}
                              </TableCell>
                            </TableRow>
                            {expanded === t.transactionId && (
                              <TableRow>
                                <TableCell colSpan={5} className="bg-muted/30">
                                  <div className="pl-4">
                                    <div className="font-semibold mb-1">Products:</div>
                                    <ul className="list-disc pl-6">
                                      {Object.entries(productCount).map(([pid, qty]) => (
                                        <li key={pid}>
                                          {productMap[pid] || pid} <span className="text-xs text-muted-foreground">(x{qty})</span>
                                          {(() => {
                                            // Show inventory name next to product
                                            // Try to get inventoryId from transaction or from product
                                            const invName = t.inventoryId && inventoryMap[t.inventoryId]
                                              ? inventoryMap[t.inventoryId]
                                              : null;
                                            return invName ? (
                                              <span className="ml-2 text-xs text-muted-foreground">[{invName}]</span>
                                            ) : null;
                                          })()}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
