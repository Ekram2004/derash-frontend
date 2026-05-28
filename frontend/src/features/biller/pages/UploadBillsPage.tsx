// src/features/biller/pages/UploadBillsPage.tsx
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  EyeIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { uploadBillsCsv, getBillerStats } from "../api/biller.api";
import { billerLinks } from "../billerLinks";

interface UploadResult {
  total: number;
  success: number;
  failed: number;
  errors?: string[];
  failedBills?: any[];
  fileName?: string;
  uploadDate?: string;
  rawResponse?: any;
}

interface FilePreview {
  headers: string[];
  rows: string[][];
  totalRows: number;
  totalColumns: number;
}

interface DatabaseStats {
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
  partiallyPaidBills: number;
  revenue: number;
  thisMonthRevenue: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const dropZoneVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

export default function UploadBillsPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [uploadHistory, setUploadHistory] = useState<UploadResult[]>([]);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [currentStats, setCurrentStats] = useState<DatabaseStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [detailedErrors, setDetailedErrors] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('biller_upload_history');
    if (savedHistory) setUploadHistory(JSON.parse(savedHistory));
    checkDatabaseStats();
  }, []);

  const saveToHistory = (uploadResult: UploadResult) => {
    const newHistory = [uploadResult, ...uploadHistory].slice(0, 10);
    setUploadHistory(newHistory);
    localStorage.setItem('biller_upload_history', JSON.stringify(newHistory));
  };

  const checkDatabaseStats = async () => {
    try {
      setStatsLoading(true);
      setShowStats(true);
      const response = await getBillerStats();
      if (response?.status === "SUCCESS") setCurrentStats(response.data);
    } catch (error) { console.error(error); } 
    finally { setStatsLoading(false); }
  };

  const downloadTemplate = () => {
    const template = `billReference,customerName,amount,period,due_date
BL-2024-001,Abebe Kebede,1500.00,2024-12,2024-12-31
BL-2024-002,Tigist Desta,2500.50,2024-12,2024-12-31
BL-2024-003,Almaz Bekele,3200.00,2024-12,2024-12-31
BL-2024-004,Marta Alem,1200.00,2026-06,2026-06-01
BL-2024-005,Samuel Bekele,450.00,2026-06,2026-06-07`;
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'derash_bill_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const previewCSV = (file: File): Promise<FilePreview> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) reject(new Error(t('error_csv_required')));
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1, 6).map(line => line.split(',').map(cell => cell.trim()));
        resolve({ headers, rows, totalRows: lines.length - 1, totalColumns: headers.length });
      };
      reader.onerror = () => reject(new Error(t('error_file_read')));
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (selectedFile: File | null) => {
    setError("");
    setResult(null);
    setUploadSuccess(false);
    setFilePreview(null);
    setShowPreview(false);
    setDetailedErrors([]);
    setShowSuccessModal(false);
    setSuccessResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const fileName = selectedFile.name.toLowerCase();
    const validExtensions = [".csv", ".xlsx", ".xls", ".zip"];
    const isAllowed = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isAllowed) {
      setError(t('error_invalid_file_type'));
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(t('error_file_too_large'));
      setFile(null);
      return;
    }

    setFile(selectedFile);

    if (fileName.endsWith(".csv")) {
      try {
        const preview = await previewCSV(selectedFile);
        setFilePreview(preview);
      } catch (err: any) {
        setError(err.message);
        setFile(null);
      }
    } else {
      setFilePreview(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileChange(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) { setError(t('error_no_file')); return; }
    
    try {
      setLoading(true);
      setError("");
      setShowSuccessModal(false);
      setSuccessResult(null);
      
      const response = await uploadBillsCsv(file);
      
      if (response?.status === "SUCCESS") {
        const respData = response.data || {};
        
        const uploadResult: UploadResult = {
          total: respData.total || 0,
          success: respData.success || 0,
          failed: respData.failed || 0,
          errors: respData.errors || [],
          failedBills: respData.failedBills || [],
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          rawResponse: respData,
        };
        
        setResult(uploadResult);
        
        // ONLY show success modal if at least one bill was uploaded successfully
        if (uploadResult.success > 0) {
          setUploadSuccess(true);
          setSuccessResult(uploadResult);
          setShowSuccessModal(true);
          saveToHistory(uploadResult);
          await checkDatabaseStats();
          // Clear the file after successful upload
          setFile(null);
          setFilePreview(null);
          setShowPreview(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } 
        // If no bills were uploaded successfully (all failed)
        else if (uploadResult.failed > 0 && uploadResult.success === 0) {
          setError(`${t('error_upload_failed')} ${uploadResult.failed} ${t('error_out_of')} ${uploadResult.total} ${t('error_bills_rejected')}`);
          setDetailedErrors(respData.errors || []);
        }
      } else {
        setError(response?.message || t('error_upload_failed_general'));
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || err.message || t('error_upload_failed_general'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null); 
    setError(""); 
    setResult(null); 
    setUploadSuccess(false); 
    setFilePreview(null); 
    setShowPreview(false); 
    setDetailedErrors([]);
    setShowSuccessModal(false);
    setSuccessResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearHistory = () => { setUploadHistory([]); localStorage.removeItem('biller_upload_history'); };
  const formatDate = (d: string) => new Date(d).toLocaleString();
  const formatCurrency = (amt: number) => new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 2 }).format(amt);

  return (
    <DashboardLayout title={t("upload_bills")} links={billerLinks}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-8">
        <motion.div variants={itemVariants}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-gray-700 to-red-600 bg-clip-text text-transparent">
                {t("upload_bills")}
              </h1>
              <p className="text-sm text-gray-400 mt-1">{t("upload_description")}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all">
                <span className="text-sm text-green-700">{t("download_template")}</span>
              </button>
              <button onClick={checkDatabaseStats} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-red-200 transition-all">
                <ChartBarIcon className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">{t("refresh_stats")}</span>
              </button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showStats && (
            <motion.div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                  <div><h3 className="font-semibold text-blue-800">{t("database_statistics")}</h3><p className="text-xs text-blue-600">{t("database_stats_description")}</p></div>
                </div>
                <button onClick={() => setShowStats(false)}><XCircleIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
              </div>
              {statsLoading ? <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
              : currentStats && currentStats.totalBills > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-3"><p className="text-xs text-gray-500">{t("total_bills")}</p><p className="text-2xl font-bold text-gray-800">{currentStats.totalBills}</p></div>
                  <div className="bg-white rounded-lg p-3"><p className="text-xs text-gray-500">{t("paid")}</p><p className="text-2xl font-bold text-green-600">{currentStats.paidBills || 0}</p></div>
                  <div className="bg-white rounded-lg p-3"><p className="text-xs text-gray-500">{t("unpaid")}</p><p className="text-2xl font-bold text-red-600">{currentStats.unpaidBills || 0}</p></div>
                  <div className="bg-white rounded-lg p-3"><p className="text-xs text-gray-500">{t("revenue")}</p><p className="text-xl font-bold text-emerald-600">{formatCurrency(currentStats.revenue || 0)}</p></div>
                </div>
              ) : (
                <div className="text-center py-8"><BuildingOfficeIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" /><p className="text-gray-500">{t("no_bills_in_database")}</p><p className="text-xs text-gray-400 mt-1">{t("upload_first_csv")}</p></div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">{t("select_file")}</label>
            <motion.div variants={dropZoneVariants} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={()=>fileInputRef.current?.click()} className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragActive ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-red-400 hover:bg-gray-50"} ${file ? "bg-green-50 border-green-500" : ""}`}>
              <input ref={fileInputRef} type="file" accept=".csv, .xlsx, .zip" className="hidden" onChange={(e)=>handleFileChange(e.target.files?.[0]||null)} />
              <div className="flex flex-col items-center gap-3">
                {file ? (<><DocumentTextIcon className="w-12 h-12 text-green-600" /><div><p className="text-sm font-medium text-gray-700">{file.name}</p><p className="text-xs text-gray-500">{(file.size/1024).toFixed(2)} KB</p></div><button onClick={(e)=>{e.stopPropagation(); resetForm();}} className="text-xs text-red-600 hover:text-red-700">{t("remove")}</button></>) : (<><CloudArrowUpIcon className={`w-12 h-12 ${dragActive ? "text-red-500" : "text-gray-400"}`} /><div><p className="text-sm text-gray-600">{dragActive ? t("drop_here") : t("drag_drop_csv")}</p><p className="text-xs text-gray-400 mt-1">{t("or_click_to_browse")}</p></div></>)}
              </div>
            </motion.div>
            {filePreview && !showPreview && (<div className="mt-4 bg-blue-50 rounded-lg p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><EyeIcon className="w-4 h-4 text-blue-600" /><span className="text-sm font-medium text-blue-800">{t("file_ready")}</span></div><button onClick={()=>setShowPreview(true)} className="text-xs text-blue-600 hover:text-blue-800">{t("preview")} →</button></div><p className="text-xs text-blue-600 mt-1">{filePreview.totalRows} {t("rows")} × {filePreview.totalColumns} {t("columns")}</p></div>)}
            <AnimatePresence>{showPreview && filePreview && (<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="mt-4 bg-gray-50 rounded-lg p-4 overflow-x-auto"><div className="flex justify-between mb-3"><span className="text-sm font-medium text-gray-700">{t("preview_first_rows")}</span><button onClick={()=>setShowPreview(false)} className="text-xs text-gray-500">{t("hide")}</button></div><table className="min-w-full text-xs"><thead><tr className="border-b border-gray-300">{filePreview.headers.map((h,idx)=><th key={idx} className="text-left py-2 px-3 font-semibold text-gray-700">{h}</th>)}</tr></thead><tbody>{filePreview.rows.map((row,ridx)=><tr key={ridx} className="border-b border-gray-200">{row.map((cell,cidx)=><td key={cidx} className="py-2 px-3 text-gray-600">{cell} </td>)}</tr>)}</tbody></table></motion.div>)}</AnimatePresence>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2">📋 {t("required_format_title")}:</p>
              <div className="bg-white rounded-lg p-2 mb-2 font-mono text-xs">billReference,customerName,amount,period,due_date</div>
              <ul className="text-xs text-gray-500 space-y-1 mt-2">
                <li>• <strong>{t("supported_formats")}:</strong> CSV, Excel (.xlsx, .xls), or ZIP</li>
                <li>• <strong>{t("bill_reference")}</strong> - {t("bill_reference_desc")}</li>
                <li>• <strong>{t("customer_name")}</strong> - {t("customer_name_desc")}</li>
                <li>• <strong>{t("amount")}</strong> - {t("amount_desc")}</li>
                <li>• <strong>{t("period")}</strong> - {t("period_desc")}</li>
                <li>• <strong>{t("due_date")}</strong> - {t("due_date_desc")}</li>
              </ul>
            </div>
            <AnimatePresence>{error && (<motion.div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4"><div className="flex items-start gap-3"><ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"/><div className="flex-1"><p className="text-red-800 font-medium text-sm">{t("error")}</p><p className="text-red-600 text-sm whitespace-pre-line">{error}</p></div><button onClick={()=>setError("")} className="text-red-600">✕</button></div></motion.div>)}</AnimatePresence>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button onClick={handleUpload} disabled={!file || loading} className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${!file || loading ? "bg-gray-300 cursor-not-allowed text-gray-500" : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg"}`}>
                {loading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>{t("uploading")}</span></>) : (<><CheckBadgeIcon className="w-5 h-5"/><span>{t("upload_bills")}</span></>)}
              </button>
              {file && !loading && <button onClick={resetForm} className="px-6 py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">{t("cancel")}</button>}
            </div>
          </div>
        </motion.div>

        {/* Success Modal - ONLY shows when bills are successfully uploaded */}
        <AnimatePresence>
          {showSuccessModal && successResult && successResult.success > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSuccessModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-center">
                  <CheckCircleIcon className="w-16 h-16 text-white mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-white">{t("upload_successful")}</h2>
                  <p className="text-green-100 mt-1">{t("upload_successful_message", { count: successResult.success })}</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600">{t("file_name")}</span>
                      <span className="font-medium text-gray-800">{successResult.fileName}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600">{t("total_bills")}</span>
                      <span className="font-bold text-gray-800">{successResult.total}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-green-100">
                      <span className="text-gray-600">{t("successfully_uploaded")}</span>
                      <span className="font-bold text-green-600">{successResult.success}</span>
                    </div>
                    {successResult.failed > 0 && (
                      <div className="flex justify-between items-center pb-2 border-b border-red-100">
                        <span className="text-gray-600">{t("failed")}</span>
                        <span className="font-bold text-red-600">{successResult.failed}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      setSuccessResult(null);
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl font-semibold transition-all"
                  >
                    {t("done")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {uploadHistory.length > 0 && (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><ClockIcon className="w-5 h-5 text-red-500"/><h3 className="font-semibold text-gray-800">{t("upload_history")}</h3></div><button onClick={clearHistory} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"><TrashIcon className="w-3 h-3"/>{t("clear")}</button></div>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-2">{uploadHistory.map((item,idx)=><div key={idx} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition"><div className="flex justify-between items-start mb-2"><div><p className="text-sm font-medium text-gray-800">{item.fileName}</p><p className="text-xs text-gray-400">{formatDate(item.uploadDate!)}</p></div><div className={`px-2 py-1 rounded-full text-xs font-medium ${item.success>0?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{item.success>0?`${item.success} ${t("added")}`:t("failed")}</div></div><div className="flex gap-4 text-xs"><span className="text-gray-500">{t("total")}: {item.total}</span><span className="text-green-600">{t("success")}: {item.success}</span>{item.failed>0&&<span className="text-red-600">{t("failed")}: {item.failed}</span>}</div></div>)}</div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}