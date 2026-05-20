// derash-frontend/src/features/biller/pages/ReportsPage.tsx

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import {
  BanknotesIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PrinterIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import * as XLSX from "xlsx";
import { getBillerReport } from "../api/biller.api";
import { billerLinks } from "../billerLinks";

// ==================== TYPES ====================
type BillStatus = "PAID" | "UNPAID" | "PARTIALLY_PAID" | "CANCELLED" | "EXPIRED";

interface ReportRow {
  id: string;
  bill_reference: string;
  customer_name: string;
  customer_phone?: string;
  period: string;
  amount_due: number;
  amount_paid: number;
  remaining_bal: number;
  status: BillStatus;
  payment_method?: string;
  createdAt: string;
  due_date?: string;
  paidAt?: string;
  paidBy?: string;
}

interface Summary {
  totalCollected: number;
  totalOutstanding: number;
  totalBills: number;
  collectionRate: number;
  averageBillAmount: number;
  paidBillsCount: number;
  unpaidBillsCount: number;
  partiallyPaidCount: number;
  totalAmount: number;
}

// ==================== STATUS CONFIGURATION ====================
const STATUS_CONFIG: Record<BillStatus, { bg: string; text: string; label: string }> = {
  PAID: { bg: "bg-green-50", text: "text-green-700", label: "PAID" },
  UNPAID: { bg: "bg-red-50", text: "text-red-700", label: "UNPAID" },
  PARTIALLY_PAID: { bg: "bg-yellow-50", text: "text-yellow-700", label: "PARTIAL" },
  CANCELLED: { bg: "bg-gray-50", text: "text-gray-700", label: "CANCELLED" },
  EXPIRED: { bg: "bg-purple-50", text: "text-purple-700", label: "EXPIRED" },
};

// ==================== MAIN COMPONENT ====================
export default function ReportsPage() {
  const [data, setData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "ALL" as BillStatus | "ALL",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });
  const itemsPerPage = 10;

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBillerReport(filters.fromDate || undefined, filters.toDate || undefined);

      if (response?.status === "SUCCESS") {
        const reportData: ReportRow[] = response.data?.rows || response.data || [];
        setData(reportData);
        setCurrentPage(1);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Report fetch failed:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters.fromDate, filters.toDate]);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (filters.status !== "ALL") {
      filtered = filtered.filter((row) => row.status === filters.status);
    }

    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          row.bill_reference.toLowerCase().includes(searchLower) ||
          row.customer_name.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [data, filters.status, filters.search]);

  const summary = useMemo((): Summary => {
    const totalBills = filteredData.length;
    const totalCollected = filteredData.reduce((sum, row) => sum + (row.amount_paid || 0), 0);
    const totalOutstanding = filteredData.reduce((sum, row) => sum + (row.remaining_bal || 0), 0);
    const totalAmount = totalCollected + totalOutstanding;
    const paidBillsCount = filteredData.filter((row) => row.status === "PAID").length;
    const unpaidBillsCount = filteredData.filter((row) => row.status === "UNPAID").length;
    const partiallyPaidCount = filteredData.filter((row) => row.status === "PARTIALLY_PAID").length;
    const collectionRate = totalAmount > 0 ? (totalCollected / totalAmount) * 100 : 0;
    const averageBillAmount = totalBills > 0 ? totalAmount / totalBills : 0;

    return {
      totalCollected,
      totalOutstanding,
      totalBills,
      collectionRate,
      averageBillAmount,
      paidBillsCount,
      unpaidBillsCount,
      partiallyPaidCount,
      totalAmount,
    };
  }, [filteredData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.search]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-ET", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status: BillStatus) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.UNPAID;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      showToast("No data to export", "error");
      return;
    }

    const exportData = filteredData.map((row) => ({
      "Bill Reference": row.bill_reference,
      "Customer Name": row.customer_name,
      "Period": row.period,
      "Amount Due (ETB)": row.amount_due,
      "Amount Paid (ETB)": row.amount_paid,
      "Remaining Balance (ETB)": row.remaining_bal,
      "Status": row.status,
      "Payment Method": row.payment_method || "N/A",
      "Date": formatDate(row.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Derash_Report");
    XLSX.writeFile(workbook, `Derash_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
    showToast("Report exported successfully!", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      status: "ALL",
      search: "",
    });
    setShowMobileFilters(false);
    showToast("Filters reset", "success");
  };

  return (
    <DashboardLayout title="Reports & Analytics" links={billerLinks}>
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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-gray-900 to-red-500 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
              Generate and download detailed reports
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 print:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
            >
              <FunnelIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Filter</span>
            </button>
            <button
              onClick={exportToExcel}
              disabled={filteredData.length === 0}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="w-4 h-4 text-green-600" />
              <span className="text-xs sm:text-sm text-green-700 hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
            >
              <PrinterIcon className="w-4 h-4 text-gray-600" />
              <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">Print</span>
            </button>
          </div>
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
                    placeholder="Search by bill ref or customer..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as BillStatus | "ALL" }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      loadReport();
                      setShowMobileFilters(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm"
                  >
                    Apply
                  </button>
                  <button
                    onClick={resetFilters}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Filters */}
        <div className="hidden lg:block bg-white border border-gray-200 rounded-xl shadow-sm p-4 print:hidden">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by bill ref or customer..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="w-48">
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="From Date"
              />
            </div>
            <div className="w-48">
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="To Date"
              />
            </div>
            <div className="w-40">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as BillStatus | "ALL" }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
              </select>
            </div>
            <button
              onClick={() => loadReport()}
              className="px-5 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
            >
              Apply
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <ResponsiveCard
            title="Total Bills"
            value={summary.totalBills.toLocaleString()}
            icon={DocumentTextIcon}
            color="blue"
          />
          <ResponsiveCard
            title="Total Collected"
            value={formatCurrency(summary.totalCollected)}
            icon={CurrencyDollarIcon}
            color="green"
          />
          <ResponsiveCard
            title="Outstanding"
            value={formatCurrency(summary.totalOutstanding)}
            icon={BanknotesIcon}
            color="red"
          />
          <ResponsiveCard
            title="Collection Rate"
            value={`${summary.collectionRate.toFixed(1)}%`}
            icon={ChartBarIcon}
            color="purple"
            progress={summary.collectionRate}
          />
        </div>

        {/* Additional Stats */}
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex gap-3 min-w-max sm:grid sm:grid-cols-5 sm:min-w-0">
            <SmallCard title="Average Bill" value={formatCurrency(summary.averageBillAmount)} color="blue" />
            <SmallCard title="Paid Bills" value={summary.paidBillsCount} color="green" />
            <SmallCard title="Unpaid Bills" value={summary.unpaidBillsCount} color="red" />
            <SmallCard title="Partially Paid" value={summary.partiallyPaidCount} color="yellow" />
            <SmallCard title="Total Amount" value={formatCurrency(summary.totalAmount)} color="purple" />
          </div>
        </div>

        {/* Report Table / Card View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <h3 className="font-semibold text-sm sm:text-base text-gray-800">Transaction Report</h3>
                {!loading && filteredData.length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                    {filteredData.length}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {filters.fromDate || filters.toDate ? (
                  <span className="hidden sm:inline">
                    {filters.fromDate && formatDate(filters.fromDate)}{filters.fromDate && filters.toDate && " - "}
                    {filters.toDate && formatDate(filters.toDate)}
                  </span>
                ) : (
                  "All Time"
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-sm text-gray-500">Loading...</span>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <DocumentTextIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No report data found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden divide-y divide-gray-100">
                {paginatedData.map((row, idx) => (
                  <div key={idx} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {row.bill_reference}
                      </span>
                      {getStatusBadge(row.status)}
                    </div>
                    <div className="text-sm font-medium text-gray-800 mb-1">{row.customer_name}</div>
                    <div className="text-xs text-gray-500 mb-2">{row.period}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Due:</span>
                        <span className="ml-1 font-semibold text-gray-800">{formatCurrency(row.amount_due)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Paid:</span>
                        <span className="ml-1 font-semibold text-green-600">{formatCurrency(row.amount_paid)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Remaining:</span>
                        <span className="ml-1 font-semibold text-red-600">{formatCurrency(row.remaining_bal)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Method:</span>
                        <span className="ml-1 text-gray-600">{row.payment_method || "-"}</span>
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Bill Ref</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Period</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Amount Due</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Amount Paid</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Remaining</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-blue-600 font-medium">{row.bill_reference}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-800">{row.customer_name}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.period}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                          {formatCurrency(row.amount_due)}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">
                          {formatCurrency(row.amount_paid)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                          {formatCurrency(row.remaining_bal)}
                        </td>
                        <td className="px-4 py-3 text-center">{getStatusBadge(row.status)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.payment_method || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
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
                      Page {currentPage} of {totalPages}
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

        {/* Summary Footer */}
        {!loading && filteredData.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 sm:p-4 border border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Total Bills</p>
                <p className="text-base sm:text-lg font-bold text-gray-800">{summary.totalBills}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Collection Rate</p>
                <p className="text-base sm:text-lg font-bold text-green-600">{summary.collectionRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Average Bill</p>
                <p className="text-base sm:text-lg font-bold text-blue-600">{formatCurrency(summary.averageBillAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Generated</p>
                <p className="text-xs sm:text-sm font-medium text-gray-600">{formatDate(new Date().toISOString())}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ==================== RESPONSIVE SUBCOMPONENTS ====================

interface ResponsiveCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "red" | "purple";
  progress?: number;
}

function ResponsiveCard({ title, value, icon: Icon, color, progress }: ResponsiveCardProps) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`p-1.5 sm:p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
      <p className="text-lg sm:text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">{title}</p>
      {progress !== undefined && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-purple-600 h-1 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface SmallCardProps {
  title: string;
  value: string | number;
  color: "blue" | "green" | "red" | "yellow" | "purple";
}

function SmallCard({ title, value, color }: SmallCardProps) {
  const colors = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    green: "bg-green-50 border-green-100 text-green-700",
    red: "bg-red-50 border-red-100 text-red-700",
    yellow: "bg-yellow-50 border-yellow-100 text-yellow-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
  };

  return (
    <div className={`rounded-xl px-3 py-2 border ${colors[color]} text-center min-w-[100px]`}>
      <p className="text-xs font-medium opacity-75">{title}</p>
      <p className="text-base sm:text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}