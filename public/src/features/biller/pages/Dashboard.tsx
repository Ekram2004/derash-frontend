import { useEffect, useState } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import {
  HomeIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/solid";

interface BillerStats {
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
  revenue: number;
}

export default function BillerDashboard() {
  const [stats, setStats] = useState<BillerStats>({
    totalBills: 0,
    paidBills: 0,
    unpaidBills: 0,
    revenue: 0,
  });

  useEffect(() => {
    // Mock data (replace later with API)
    setStats({
      totalBills: 1200,
      paidBills: 950,
      unpaidBills: 250,
      revenue: 350000,
    });
  }, []);

  // ✅ FIX: Add icons to match DashboardLayout type
  const billerLinks = [
    { label: "Dashboard", path: "/biller", icon: HomeIcon },
    { label: "Upload Bills", path: "/biller/upload", icon: DocumentArrowUpIcon },
    { label: "Bills", path: "/biller/bills", icon: BanknotesIcon },
    { label: "Reports", path: "/biller/reports", icon: ChartBarIcon },
  ];

  return (
    <DashboardLayout title="Biller Dashboard" links={billerLinks}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Bills" value={stats.totalBills} />
        <StatCard title="Paid Bills" value={stats.paidBills} />
        <StatCard title="Unpaid Bills" value={stats.unpaidBills} />
        <StatCard title="Revenue (ETB)" value={stats.revenue} />
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value.toLocaleString()}</p>
    </div>
  );
}