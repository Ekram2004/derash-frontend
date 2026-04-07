import {
  HomeIcon,
  DocumentArrowUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

export const billerLinks = [
  {
    label: "Dashboard",
    path: "/biller",
    icon: HomeIcon,
  },
  {
    label: "Upload Bills",
    path: "/biller/upload",
    icon: DocumentArrowUpIcon,
  },
  {
    label: "Bills",
    path: "/biller/bills",
    icon: BanknotesIcon,
  },
  {
    label: "Reports",
    path: "/biller/reports",
    icon: ChartBarIcon,
  },
  {
    label: "Settings",
    path: "/settings", // ✅ shared settings page
    icon: Cog6ToothIcon,
  },
];