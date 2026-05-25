import {
  HomeIcon,
  Squares2X2Icon,
  BuildingOfficeIcon,
  UserGroupIcon,
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
} from "@heroicons/react/24/solid";



export const adminLinks = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: HomeIcon,
  },
  {
    label: "Billers",
    path: "/admin/billers",
    icon: UserGroupIcon,
  },
  {
    label: "Agents",
    path: "/admin/agents",
    icon: UsersIcon,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: BanknotesIcon,
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: ChartBarIcon,
  },
  { label: "Notifications", path: "/admin/notifications", icon: BellIcon },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Cog6ToothIcon,
  },
];