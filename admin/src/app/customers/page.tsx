"use client";

import Shell from "@/components/Shell";
import { api, when } from "@/lib/api";
import { btnDanger, useResource } from "@/lib/ui";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  orders: number;
  createdAt: string;
};

export default function CustomersPage() {
  const { data, error, loading, reload } = useResource<Customer[]>("/admin/customers");
  return (
    <Shell title="Customers">
      {loading && <p className="text-sm text-muted">Loading customers...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-[11px] tracking-[0.14em] text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">Phone</th>
                <th className="px-3 py-3 font-semibold">Email</th>
                <th className="px-3 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((customer) => (
                <tr key={customer.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                    <p className="text-xs text-muted">{customer.city || "No city"} · {when(customer.createdAt)}</p>
                  </td>
                  <td className="px-3 py-3">{customer.phone}</td>
                  <td className="px-3 py-3">{customer.email}</td>
                  <td className="px-3 py-3">{customer.orders}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className={btnDanger}
                      onClick={async () => {
                        if (!confirm("Delete this customer? Their orders stay in the order list.")) return;
                        await api(`/admin/customers/${customer.id}`, { method: "DELETE" });
                        await reload();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {data && data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted">No customer accounts yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
