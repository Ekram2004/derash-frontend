import {
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

export const adminLinks = [
  { label: "Dashboard", path: "/admin", icon: HomeIcon },
  { label: "Users", path: "/admin/users", icon: UserGroupIcon },
  { label: "Agents", path: "/admin/agents", icon: UsersIcon },
  { label: "Billers", path: "/admin/billers", icon: BanknotesIcon },
  { label: "Reports", path: "/admin/reports", icon: ChartBarIcon }
];