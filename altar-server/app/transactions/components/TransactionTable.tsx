import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transaction } from "@/lib/types";

interface TransactionTableProps {
  transactions: Transaction[];
  userMap: Record<string, any>;
  expanded: number | null;
  setExpanded: (id: number | null) => void;
  productMap: Record<string, any>;
  inventoryMap: Record<string, any>;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, userMap, expanded, setExpanded, productMap, inventoryMap }) => {
  return (
    <Table className="liquid-glass">
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
  );
};
