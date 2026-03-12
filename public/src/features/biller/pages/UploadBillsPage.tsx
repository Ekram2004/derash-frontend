import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { useState } from "react";
import {
  HomeIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/solid";

export default function UploadBillsPage() {
  const [file, setFile] = useState<File | null>(null);

  // ✅ Add icons (required by DashboardLayout)
  const billerLinks = [
    { label: "Dashboard", path: "/biller", icon: HomeIcon },
    { label: "Upload Bills", path: "/biller/upload", icon: DocumentArrowUpIcon },
    { label: "Bills", path: "/biller/bills", icon: BanknotesIcon },
    { label: "Reports", path: "/biller/reports", icon: ChartBarIcon },
  ];

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    alert("Bills uploaded successfully!");
  };

  return (
    <DashboardLayout title="Upload Bills" links={billerLinks}>
      <div className="bg-white p-6 rounded-xl shadow max-w-lg">
        <input
          type="file"
          className="mb-4 block w-full border p-2 rounded"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleUpload}
          className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          Upload
        </button>
      </div>
    </DashboardLayout>
  );
}