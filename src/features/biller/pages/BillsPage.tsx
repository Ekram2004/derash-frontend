import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import Table, { type TableColumn } from "../../../shared/components/ui/Table";
import {
  HomeIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/solid";
import { getBillerBills } from "../api/biller.api";

type BillStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED";

interface Bill {
  id: string;
  bill_reference: string;
  customer_name: string;
  contract_number: string;
  period: string;
  amount_due: number;
  amount_paid: number;
  remaining_bal: number;
  status: BillStatus;
  due_date?: string;
  createdAt: string;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const billerLinks = [
    { label: "Dashboard", path: "/biller", icon: HomeIcon },
    { label: "Upload Bills", path: "/biller/upload", icon: DocumentArrowUpIcon },
    { label: "Bills", path: "/biller/bills", icon: BanknotesIcon },
    { label: "Reports", path: "/biller/reports", icon: ChartBarIcon },
  ];

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await getBillerBills();

        if (response.status === "SUCCESS") {
          const mapped: Bill[] = response.data.map((b: any) => {
            const amount = Number(b.amount_due ?? 0);
            const paid = Number(b.amount_paid ?? 0);

            return {
              id: b.id,
              bill_reference: b.bill_reference ?? "",
              customer_name: b.customer_name ?? "",
              contract_number: b.contract_number ?? "",
              period: b.period ?? "",
              amount_due: amount,
              amount_paid: paid,
              remaining_bal: amount - paid,
              status: b.status,
              due_date: b.due_date,
              createdAt: b.createdAt,
            };
          });

          setBills(mapped);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        bill.bill_reference.toLowerCase().includes(search.toLowerCase()) ||
        bill.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        bill.contract_number.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || bill.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bills, search, statusFilter]);

  const columns: TableColumn<Bill>[] = [
    {
      header: "Bill Ref",
      accessor: "bill_reference",
      render: (row) => (
        <button
          onClick={() => setSelectedBill(row)}
          className="text-blue-600 hover:underline font-medium"
        >
          {row.bill_reference}
        </button>
      ),
    },
    { header: "Customer", accessor: "customer_name" },
    { header: "Period", accessor: "period" },
    {
      header: "Due",
      accessor: "amount_due",
      render: (row) => `ETB ${row.amount_due.toLocaleString()}`,
    },
    {
      header: "Remaining",
      accessor: "remaining_bal",
      render: (row) => `ETB ${row.remaining_bal.toLocaleString()}`,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <DashboardLayout title="Bills Management" links={billerLinks}>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm p-5 border">
          <h1 className="text-xl font-bold text-gray-800">Bills Overview</h1>
          <p className="text-sm text-gray-500">
            Manage and track all customer bills in one place
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-center">
          <input
            type="text"
            placeholder="Search by bill ref, customer, contract..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full md:w-52 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>

          <div className="text-sm text-gray-500 md:ml-auto">
            Total: <span className="font-semibold">{filteredBills.length}</span>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading bills...
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No bills found
            </div>
          ) : (
            <Table columns={columns} data={filteredBills} />
          )}
        </div>
      </div>

      {/* MODAL */}
      {selectedBill && (
        <BillDetailsModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
          onCancel={(id) =>
            setBills((prev) =>
              prev.map((b) =>
                b.id === id ? { ...b, status: "CANCELLED" } : b
              )
            )
          }
        />
      )}
    </DashboardLayout>
  );
}

/* ---------------- STATUS BADGE ---------------- */

function StatusBadge({ status }: { status: BillStatus }) {
  const styles: Record<BillStatus, string> = {
    PAID: "bg-green-100 text-green-700",
    UNPAID: "bg-red-100 text-red-700",
    PARTIALLY_PAID: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-gray-200 text-gray-700",
    EXPIRED: "bg-purple-100 text-purple-700",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

/* ---------------- MODAL ---------------- */

function BillDetailsModal({
  bill,
  onClose,
  onCancel,
}: {
  bill: Bill;
  onClose: () => void;
  onCancel: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">

        <h2 className="text-lg font-bold mb-4">
          Bill Details
        </h2>

        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Customer:</strong> {bill.customer_name}</p>
          <p><strong>Contract:</strong> {bill.contract_number}</p>
          <p><strong>Period:</strong> {bill.period}</p>
          <p><strong>Due:</strong> ETB {bill.amount_due.toLocaleString()}</p>
          <p><strong>Paid:</strong> ETB {bill.amount_paid.toLocaleString()}</p>
          <p><strong>Remaining:</strong> ETB {bill.remaining_bal.toLocaleString()}</p>
          <p><strong>Status:</strong> {bill.status}</p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          {bill.status !== "PAID" && bill.status !== "CANCELLED" && (
            <button
              onClick={() => onCancel(bill.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Cancel Bill
            </button>
          )}

          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}