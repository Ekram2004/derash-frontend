// derash-frontend/src/features/biller/billerLinks.ts

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
    path: "/biller/dashboard",  // ✅ Use full path
    icon: HomeIcon,
  },
  {
    label: "Upload Bills",
    path: "/biller/upload",     // ✅ Use full path
    icon: DocumentArrowUpIcon,
  },
  {
    label: "Bills",
    path: "/biller/bills",      // ✅ Use full path
    icon: BanknotesIcon,
  },
  {
    label: "Reports",
    path: "/biller/reports",    // ✅ Use full path
    icon: ChartBarIcon,
  },
  {
    label: "Settings",
    path: "/biller/settings",   // ✅ FIXED: Now matches the route
    icon: Cog6ToothIcon,
  },
];