import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import {
  HomeIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/solid";

export default function ReportsPage() {
  const billerLinks = [
    { label: "Dashboard", path: "/biller", icon: HomeIcon },
    { label: "Upload Bills", path: "/biller/upload", icon: DocumentArrowUpIcon },
    { label: "Bills", path: "/biller/bills", icon: BanknotesIcon },
    { label: "Reports", path: "/biller/reports", icon: ChartBarIcon },
  ];

  return (
    <DashboardLayout title="Reports" links={billerLinks}>
      <div className="bg-white p-6 rounded-xl shadow">
        <p>Reports and analytics will be displayed here.</p>
      </div>
    </DashboardLayout>
  );
}