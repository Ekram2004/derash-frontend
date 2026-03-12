import {
  HomeIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/solid";

import DashboardLayout from "@/shared/components/layout/DashboardLayout";

export default function BillsPage() {
  const billerLinks = [
    { label: "Dashboard", path: "/biller", icon: HomeIcon },
    { label: "Upload Bills", path: "/biller/upload", icon: DocumentArrowUpIcon },
    { label: "Bills", path: "/biller/bills", icon: BanknotesIcon },
    { label: "Reports", path: "/biller/reports", icon: ChartBarIcon },
  ];

  return (
    <DashboardLayout title="Bills List" links={billerLinks}>
      <div className="bg-white p-6 rounded-xl shadow">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Bill ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">B001</td>
              <td>John Doe</td>
              <td>1500 ETB</td>
              <td className="text-green-600">Paid</td>
            </tr>
            <tr>
              <td className="py-2">B002</td>
              <td>Jane Smith</td>
              <td>2200 ETB</td>
              <td className="text-red-600">Unpaid</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}