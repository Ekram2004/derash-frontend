// derash-frontend/src/features/biller/pages/BillsPage.tsx

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import {
  BanknotesIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { getBillerBills } from "../api/biller.api";
import { billerLinks } from "../billerLinks";
import * as XLSX from "xlsx";

type BillStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "CANCELLED" | "EXPIRED";

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
  const { t } = useTranslation();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillStatus | "ALL">("ALL");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });
  const itemsPerPage = 10;

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBillerBills();

      if (response?.status === "SUCCESS") {
        const mapped: Bill[] = (response.data || []).map((b: any) => ({
          id: b.id || `bill_${Date.now()}_${Math.random()}`,
          bill_reference: b.bill_reference || `REF-${Date.now()}`,
          customer_name: b.customer_name || t("unknown_customer"),
          contract_number: b.contract_number || "",
          period: b.period || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          amount_due: Number(b.amount_due) || 0,
          amount_paid: Number(b.amount_paid) || 0,
          remaining_bal: Number(b.remaining_bal) || Number(b.amount_due) || 0,
          status: (b.status as BillStatus) || "UNPAID",
          due_date: b.due_date,
          createdAt: b.createdAt || new Date().toISOString(),
        }));
        setBills(mapped);
      } else {
        setBills([]);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      showToastMessage(t("failed_load_bills"), "error");
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const deleteSingleBill = async (id: string) => {
    setDeleting(true);
    try {
      setBills((prev) => prev.filter((bill) => bill.id !== id));
      setShowDeleteConfirm(false);
      setBillToDelete(null);
      showToastMessage(t("delete_success"), "success");
    } catch (error) {
      console.error("Delete failed:", error);
      showToastMessage(t("delete_failed"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const deleteAllBills = async () => {
    setDeleting(true);
    try {
      setBills([]);
      setShowDeleteAllConfirm(false);
      showToastMessage(t("delete_all_success"), "success");
    } catch (error) {
      console.error("Delete all failed:", error);
      showToastMessage(t("delete_all_failed"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const filteredBills = useMemo(() => {
    let filtered = bills;

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (bill) =>
          bill.bill_reference.toLowerCase().includes(searchLower) ||
          bill.customer_name.toLowerCase().includes(searchLower) ||
          bill.contract_number.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((bill) => bill.status === statusFilter);
    }

    return filtered;
  }, [bills, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: bills.length,
      unpaid: bills.filter((b) => b.status === "UNPAID").length,
      partiallyPaid: bills.filter((b) => b.status === "PARTIALLY_PAID").length,
      paid: bills.filter((b) => b.status === "PAID").length,
      totalAmount: bills.reduce((sum, b) => sum + b.amount_due, 0),
      collectedAmount: bills.reduce((sum, b) => sum + b.amount_paid, 0),
    };
  }, [bills]);

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = filteredBills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return t("na");
    try {
      return new Date(dateString).toLocaleDateString("en-ET", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return t("invalid_date");
    }
  };

  const getStatusBadge = (status: BillStatus) => {
    const styles: Record<BillStatus, string> = {
      PAID: "bg-green-100 text-green-700",
      UNPAID: "bg-red-100 text-red-700",
      PARTIALLY_PAID: "bg-yellow-100 text-yellow-700",
      CANCELLED: "bg-gray-200 text-gray-700",
      EXPIRED: "bg-purple-100 text-purple-700",
    };
    let label = "";
    switch (status) {
      case "PAID": label = t("paid"); break;
      case "UNPAID": label = t("unpaid"); break;
      case "PARTIALLY_PAID": label = t("partially_paid"); break;
      case "CANCELLED": label = t("cancelled"); break;
      case "EXPIRED": label = t("expired"); break;
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {label}
      </span>
    );
  };

  const exportToExcel = () => {
    if (filteredBills.length === 0) {
      showToastMessage(t("no_data_export"), "error");
      return;
    }

    const exportData = filteredBills.map((bill) => ({
      [t("bill_reference")]: bill.bill_reference,
      [t("customer_name")]: bill.customer_name,
      [t("contract_number")]: bill.contract_number,
      [t("period")]: bill.period,
      [t("due_date")]: formatDate(bill.due_date),
      [t("amount_due_etb")]: bill.amount_due,
      [t("amount_paid_etb")]: bill.amount_paid,
      [t("remaining_balance_etb")]: bill.remaining_bal,
      [t("status")]: bill.status,
      [t("created_at")]: formatDate(bill.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t("derash_bills"));
    XLSX.writeFile(workbook, `Derash_Bills_${new Date().toISOString().split("T")[0]}.xlsx`);
    showToastMessage(t("export_success"), "success");
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setShowMobileFilters(false);
    showToastMessage(t("filters_reset"), "success");
  };

  return (
    <DashboardLayout title={t("bills_management")} links={billerLinks}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 left-4 right-4 sm:left-auto sm:right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white sm:min-w-[300px]`}
          >
            {toast.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XCircleIcon className="w-5 h-5" />
            )}
            <span className="text-sm flex-1">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 sm:space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold 
            bg-gradient-to-r from-red-600 via-gray-700 to-red-600 bg-clip-text text-transparent">
              {t("bills_overview")}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
              {t("bills_description")}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
            >
              <FunnelIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{t("filter")}</span>
            </button>
            {filteredBills.length > 0 && (
              <button
                onClick={exportToExcel}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all"
              >
                <DocumentArrowDownIcon className="w-4 h-4 text-green-600" />
                <span className="text-xs sm:text-sm text-green-700 hidden sm:inline">{t("export")}</span>
              </button>
            )}
            {stats.total > 0 && (
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all"
              >
                <TrashIcon className="w-4 h-4 text-red-600" />
                <span className="text-xs sm:text-sm text-red-700 hidden sm:inline">{t("delete_all")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title={t("total_bills")} value={stats.total} color="blue" />
          <StatCard title={t("unpaid")} value={stats.unpaid} color="red" />
          <StatCard title={t("partially_paid")} value={stats.partiallyPaid} color="yellow" />
          <StatCard title={t("paid")} value={stats.paid} color="green" />
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("search_placeholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t("status")}</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as BillStatus | "ALL")}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="ALL">{t("all_status")}</option>
                    <option value="UNPAID">{t("unpaid")}</option>
                    <option value="PARTIALLY_PAID">{t("partially_paid")}</option>
                    <option value="PAID">{t("paid")}</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm"
                  >
                    {t("apply")}
                  </button>
                  <button
                    onClick={resetFilters}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm"
                  >
                    {t("reset")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Filters */}
        <div className="hidden lg:block bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("search_desktop_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="w-48 relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BillStatus | "ALL")}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white appearance-none"
              >
                <option value="ALL">{t("all_status")}</option>
                <option value="UNPAID">{t("unpaid")}</option>
                <option value="PARTIALLY_PAID">{t("partially_paid")}</option>
                <option value="PAID">{t("paid")}</option>
              </select>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              {t("reset")}
            </button>
            <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
              <span className="text-sm text-gray-600">
                <span className="font-bold text-gray-800">{filteredBills.length}</span> {t("bills_count")}
              </span>
            </div>
          </div>
        </div>

        {/* Bills Table / Card View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <h3 className="font-semibold text-sm sm:text-base text-gray-800">{t("bills_list")}</h3>
              {!loading && filteredBills.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                  {filteredBills.length}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-sm text-gray-500">{t("loading")}</span>
            </div>
          ) : paginatedBills.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <BanknotesIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">{t("no_bills_found")}</p>
              <p className="text-xs text-gray-400 mt-1">
                {bills.length === 0 ? t("upload_csv_prompt") : t("adjust_filters")}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden divide-y divide-gray-100">
                {paginatedBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedBill(bill)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {bill.bill_reference}
                      </span>
                      {getStatusBadge(bill.status)}
                    </div>
                    <div className="text-sm font-medium text-gray-800 mb-1">{bill.customer_name}</div>
                    <div className="text-xs text-gray-500 mb-2">{bill.period}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">{t("due")}:</span>
                        <span className="ml-1 font-semibold text-gray-800">{formatCurrency(bill.amount_due)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t("paid")}:</span>
                        <span className="ml-1 font-semibold text-green-600">{formatCurrency(bill.amount_paid)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t("remaining")}:</span>
                        <span className="ml-1 font-semibold text-red-600">{formatCurrency(bill.remaining_bal)}</span>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBillToDelete(bill);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{t("bill_ref")}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{t("customer")}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{t("period")}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">{t("amount")}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">{t("paid")}</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">{t("remaining")}</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">{t("status")}</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">{t("action")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedBills.map((bill) => (
                      <tr
                        key={bill.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedBill(bill)}
                      >
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBill(bill);
                            }}
                            className="font-mono text-sm text-blue-600 hover:underline font-medium"
                          >
                            {bill.bill_reference}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-800">{bill.customer_name}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{bill.period}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                          {formatCurrency(bill.amount_due)}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">
                          {formatCurrency(bill.amount_paid)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                          {formatCurrency(bill.remaining_bal)}
                        </td>
                        <td className="px-4 py-3 text-center">{getStatusBadge(bill.status)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBillToDelete(bill);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-500 hover:text-red-700 p-1 transition"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    {t("showing")} {(currentPage - 1) * itemsPerPage + 1} {t("to")}{" "}
                    {Math.min(currentPage * itemsPerPage, filteredBills.length)} {t("of")} {filteredBills.length} {t("bills")}
                  </p>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 sm:p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <div className="hidden sm:flex gap-1">
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNum = currentPage + i - 1;
                        if (pageNum < 1) pageNum = i + 1;
                        if (pageNum > totalPages) pageNum = totalPages - (2 - i);
                        if (pageNum < 1) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                              currentPage === pageNum
                                ? "bg-red-500 text-white"
                                : "bg-white border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <span className="flex sm:hidden text-sm text-gray-600 px-2">
                      {t("page")} {currentPage} {t("of")} {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 sm:p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Single Bill Modal */}
      <AnimatePresence>
        {showDeleteConfirm && billToDelete && (
          <Modal onClose={() => setShowDeleteConfirm(false)} title={t("confirm_delete")} icon="delete">
            <p className="text-gray-600 mb-2">
              {t("delete_confirm_message")}{" "}
              <strong className="text-red-600">{billToDelete.bill_reference}</strong>?
            </p>
            <p className="text-red-500 text-sm mb-4">{t("cannot_undo")}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBillToDelete(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => deleteSingleBill(billToDelete.id)}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                {deleting ? t("deleting") : t("delete")}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete All Bills Modal */}
      <AnimatePresence>
        {showDeleteAllConfirm && (
          <Modal onClose={() => setShowDeleteAllConfirm(false)} title={t("delete_all_bills")} icon="warning">
            <p className="text-gray-600 mb-2">
              {t("delete_all_confirm_message")}{" "}
              <strong>{t("all")} {bills.length} {t("bills")}</strong>?
            </p>
            <p className="text-red-500 text-sm mb-4">{t("cannot_undo")}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                {t("cancel")}
              </button>
              <button
                onClick={deleteAllBills}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                {deleting ? t("deleting") : t("delete_all")}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Bill Details Modal */}
      <AnimatePresence>
        {selectedBill && (
          <Modal onClose={() => setSelectedBill(null)} title={t("bill_details")} size="lg">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailItem label={t("bill_reference")} value={selectedBill.bill_reference} icon={DocumentTextIcon} />
                <DetailItem label={t("customer_name")} value={selectedBill.customer_name} icon={UserIcon} />
                <DetailItem label={t("contract_number")} value={selectedBill.contract_number || "—"} icon={DocumentTextIcon} />
                <DetailItem label={t("period")} value={selectedBill.period} icon={CalendarIcon} />
                <DetailItem label={t("due_date")} value={formatDate(selectedBill.due_date)} icon={ClockIcon} />
                <DetailItem label={t("created_at")} value={formatDate(selectedBill.createdAt)} icon={CalendarIcon} />
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">{t("amount_due")}:</span>
                  <span className="font-bold text-gray-800 text-lg">{formatCurrency(selectedBill.amount_due)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t("amount_paid")}:</span>
                  <span className="text-green-600 font-semibold">{formatCurrency(selectedBill.amount_paid)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">{t("remaining_balance")}:</span>
                  <span className="font-bold text-red-600 text-lg">{formatCurrency(selectedBill.remaining_bal)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600">{t("status")}:</span>
                  {getStatusBadge(selectedBill.status)}
                </div>
              </div>
            </div>

            <div className="border-t mt-4 pt-4 flex justify-end">
              <button
                onClick={() => setSelectedBill(null)}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition font-medium"
              >
                {t("close")}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

// ==================== SUBCOMPONENTS ====================

interface StatCardProps {
  title: string;
  value: string | number;
  color: "blue" | "red" | "green" | "yellow";
}

function StatCard({ title, value, color }: StatCardProps) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    red: "bg-red-50 border-red-200 text-red-700",
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  };

  return (
    <div className={`rounded-xl p-3 sm:p-4 border ${colors[color]} shadow-sm`}>
      <p className="text-xs font-medium opacity-75">{title}</p>
      <p className="text-base sm:text-lg md:text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  icon?: "delete" | "warning";
  size?: "sm" | "md" | "lg";
}

function Modal({ children, onClose, title, icon, size = "md" }: ModalProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  const getIconStyles = () => {
    if (icon === "delete") return "bg-red-100 text-red-600";
    if (icon === "warning") return "bg-red-100 text-red-600";
    return "bg-red-100 text-red-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-white rounded-xl ${sizeClasses[size]} w-full shadow-xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getIconStyles()}`}>
              {icon === "delete" && <TrashIcon className="w-5 h-5" />}
              {icon === "warning" && <ExclamationIcon className="w-5 h-5" />}
              {!icon && <DocumentTextIcon className="w-5 h-5" />}
            </div>
            <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
          </div>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

function DetailItem({ label, value, icon: Icon }: DetailItemProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

// Exclamation Icon Component
function ExclamationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}