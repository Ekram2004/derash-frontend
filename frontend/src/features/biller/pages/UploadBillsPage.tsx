// src/features/biller/pages/UploadBillsPage.tsx
import DashboardLayout from "../../../shared/components/layout/DashboardLayout";
import { useState, useRef, useEffect } from "react";
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

interface ValidatedBill {
  rowNumber: number;
  billReference: string;
  customerName: string;
  amount: string;
  period: string;
  dueDate: string;
  isValid: boolean;
  errors: string[];
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
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [validatedBills, setValidatedBills] = useState<ValidatedBill[]>([]);
  const [validationSummary, setValidationSummary] = useState({ valid: 0, invalid: 0, total: 0, allValid: false });
  const [csvText, setCsvText] = useState<string>("");
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

  const validateCSVData = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return { bills: [], summary: { valid: 0, invalid: 0, total: 0, allValid: false } };
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredCols = ['billreference', 'customername', 'amount', 'period', 'due_date'];
    const colIdx: Record<string, number> = {};
    requiredCols.forEach(col => { colIdx[col] = headers.findIndex(h => h === col); });
    const bills: ValidatedBill[] = [];
    let valid = 0, invalid = 0;
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const errors: string[] = [];
      const ref = colIdx.billreference !== -1 ? values[colIdx.billreference] : '';
      if (!ref) errors.push('Missing bill reference');
      const cust = colIdx.customername !== -1 ? values[colIdx.customername] : '';
      if (!cust) errors.push('Missing customer name');
      const amtRaw = colIdx.amount !== -1 ? values[colIdx.amount] : '';
      const amount = parseFloat(amtRaw);
      if (!amtRaw || isNaN(amount) || amount <= 0) errors.push('Invalid amount');
      const period = colIdx.period !== -1 ? values[colIdx.period] : '';
      if (!period) errors.push('Missing period (YYYY-MM-DD)');
      else if (!/^\d{4}-\d{2}$/.test(period)) errors.push('Period must be YYYY-MM');
      const due = colIdx.due_date !== -1 ? values[colIdx.due_date] : '';
      if (!due) errors.push('Missing due date');
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) errors.push('Due date must be YYYY-MM-DD');
      const isValid = errors.length === 0;
      if (isValid) valid++; else invalid++;
      bills.push({
        rowNumber: i,
        billReference: ref,
        customerName: cust,
        amount: amtRaw,
        period,
        dueDate: due,
        isValid,
        errors,
      });
    }
    return { bills, summary: { valid, invalid, total: bills.length, allValid: invalid === 0 && bills.length > 0 } };
  };

  const previewCSV = (file: File): Promise<FilePreview> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvText(text);
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) reject(new Error('CSV must have header and data rows'));
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1, 6).map(line => line.split(',').map(cell => cell.trim()));
        const required = ['billReference', 'customerName', 'amount', 'period', 'due_date'];
        const missing = required.filter(col => !headers.includes(col));
        if (missing.length) reject(new Error(`Missing required columns: ${missing.join(', ')}`));
        resolve({ headers, rows, totalRows: lines.length - 1, totalColumns: headers.length });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (selectedFile: File | null) => {
    setError(""); setResult(null); setUploadSuccess(false); setFilePreview(null); setShowPreview(false); setDetailedErrors([]);
    if (!selectedFile) { setFile(null); return; }
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) { setError("Only CSV files are allowed."); setFile(null); return; }
    if (selectedFile.size > 5 * 1024 * 1024) { setError("File size must be less than 5MB."); setFile(null); return; }
    try {
      const preview = await previewCSV(selectedFile);
      setFilePreview(preview);
      setFile(selectedFile);
    } catch (err: any) { setError(err.message); setFile(null); }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileChange(droppedFile);
  };
  const showConfirmation = () => {
    if (!csvText) { setError("Please select a file first"); return; }
    const { bills, summary } = validateCSVData(csvText);
    setValidatedBills(bills);
    setValidationSummary(summary);
    setShowConfirmModal(true);
  };
  const proceedWithUpload = async () => {
    if (!validationSummary.allValid) {
      setError(`Cannot upload: ${validationSummary.invalid} bill(s) have errors.`);
      setShowConfirmModal(false);
      return;
    }
    if (!file) { setError("No file selected"); return; }
    setShowConfirmModal(false);
    try {
      setLoading(true);
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
        if (uploadResult.success > 0) {
          setUploadSuccess(true);
          saveToHistory(uploadResult);
          await checkDatabaseStats();
          setTimeout(() => setUploadSuccess(false), 5000);
        } else {
          setError(`Upload failed: ${uploadResult.failed} out of ${uploadResult.total} bills were rejected.`);
          setDetailedErrors(uploadResult.errors);
        }
        setFile(null); setFilePreview(null); setShowPreview(false); setCsvText("");
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setError(response?.message || "Upload failed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Upload failed.");
    } finally { setLoading(false); }
  };
  const resetForm = () => {
    setFile(null); setError(""); setResult(null); setUploadSuccess(false); setFilePreview(null); setShowPreview(false); setDetailedErrors([]); setCsvText("");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const clearHistory = () => { setUploadHistory([]); localStorage.removeItem('biller_upload_history'); };
  const formatDate = (d: string) => new Date(d).toLocaleString();
  const formatCurrency = (amt: number) => new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 2 }).format(amt);

  return (
    <DashboardLayout title="Upload Bills" links={billerLinks}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-8">
        <motion.div variants={itemVariants}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl 
              font-bold bg-gradient-to-r from-red-600 via-gray-700 to-red-600
              bg-clip-text text-transparent">Upload Bills</h1>
              <p className="text-sm text-gray-400 mt-1">Upload CSV files to add bills to the database</p>
            </div>
            <div className="flex gap-3">
              <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all">
                <span className="text-sm text-green-700">Download Template</span>
              </button>
              <button onClick={checkDatabaseStats} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-red-200 transition-all">
                <ChartBarIcon className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">Refresh Stats</span>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-indigo-800">ACID Transaction Protection</p>
              <p className="text-xs text-indigo-600 mt-1">All bills are validated before upload. <strong>If ANY bill has an error, NONE will be uploaded.</strong></p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showStats && (
            <motion.div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                  <div><h3 className="font-semibold text-blue-800">Database Statistics</h3><p className="text-xs text-blue-600">Current bills stored in the system</p></div>
                </div>
                <button onClick={() => setShowStats(false)}><XCircleIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
              </div>
              {statsLoading ? <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
              : currentStats && currentStats.totalBills > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-3"><p className="text-xs text-gray-500">Total Bills</p><p className="text-2xl font-bold text-gray-800">{currentStats.totalBills}</p></div>
                  <div className="bg-white rounded-lg p-3"><p className="text-xs text-gray-500">Paid</p><p className="text-2xl font-bold text-green-600">{currentStats.paidBills || 0}</p></div>
                  <div className="bg-white rounded-lg p-3"><p className="text-xs text-gray-500">Unpaid</p><p className="text-2xl font-bold text-red-600">{currentStats.unpaidBills || 0}</p></div>
                  <div className="bg-white rounded-lg p-3"><p className="text-xs text-gray-500">Revenue</p><p className="text-xl font-bold text-emerald-600">{formatCurrency(currentStats.revenue || 0)}</p></div>
                </div>
              ) : (
                <div className="text-center py-8"><BuildingOfficeIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" /><p className="text-gray-500">No bills in database yet</p><p className="text-xs text-gray-400 mt-1">Upload your first CSV file</p></div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {result && result.success === 0 && result.failed > 0 && !uploadSuccess && (
          <motion.div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-yellow-800 font-semibold text-lg">⚠️ Upload Failed - ACID Protection</p>
                <p className="text-yellow-700 text-sm mb-3">{result.failed} out of {result.total} bills were rejected. No bills were saved.</p>
                <div className="bg-white rounded-lg p-4 space-y-2"><p className="text-sm font-medium text-gray-700">Required CSV format:</p><div className="bg-gray-100 rounded-lg p-2 font-mono text-xs">billReference,customerName,amount,period,due_date</div></div>
                {detailedErrors.length > 0 && (<div className="mt-3 bg-red-50 rounded-lg p-3"><p className="text-xs font-medium text-red-800 mb-2">Error Details:</p><ul className="text-xs text-red-600 space-y-1">{detailedErrors.slice(0,3).map((err,idx)=><li key={idx}>• {err}</li>)}</ul></div>)}
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {uploadSuccess && result && result.success > 0 && (
            <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-800 font-semibold text-lg">✓ Upload Successful!</p>
                  <p className="text-green-600 text-sm mb-2">Successfully uploaded {result.success} bill(s).</p>
                  <div className="bg-white rounded-lg p-3 mt-2"><p className="text-sm text-gray-700">📊 Upload Summary:</p><div className="grid grid-cols-2 gap-2 mt-2 text-sm"><div><span className="text-gray-500">Total:</span><span className="font-semibold ml-2">{result.total}</span></div><div><span className="text-gray-500">Saved:</span><span className="font-semibold text-green-600 ml-2">{result.success}</span></div>{result.failed>0&&<div><span className="text-gray-500">Failed:</span><span className="font-semibold text-red-600 ml-2">{result.failed}</span></div>}</div></div>
                  <button onClick={()=>{setUploadSuccess(false); checkDatabaseStats();}} className="mt-3 text-green-600 hover:text-green-800 text-sm font-medium">Dismiss</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select CSV File</label>
            <motion.div variants={dropZoneVariants} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={()=>fileInputRef.current?.click()} className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragActive ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-red-400 hover:bg-gray-50"} ${file ? "bg-green-50 border-green-500" : ""}`}>
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e)=>handleFileChange(e.target.files?.[0]||null)} />
              <div className="flex flex-col items-center gap-3">
                {file ? (<><DocumentTextIcon className="w-12 h-12 text-green-600" /><div><p className="text-sm font-medium text-gray-700">{file.name}</p><p className="text-xs text-gray-500">{(file.size/1024).toFixed(2)} KB</p></div><button onClick={(e)=>{e.stopPropagation(); resetForm();}} className="text-xs text-red-600 hover:text-red-700">Remove</button></>) : (<><CloudArrowUpIcon className={`w-12 h-12 ${dragActive ? "text-red-500" : "text-gray-400"}`} /><div><p className="text-sm text-gray-600">{dragActive ? "Drop here" : "Drag & drop CSV"}</p><p className="text-xs text-gray-400 mt-1">or click to browse</p></div></>)}
              </div>
            </motion.div>
            {filePreview && !showPreview && (<div className="mt-4 bg-blue-50 rounded-lg p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><EyeIcon className="w-4 h-4 text-blue-600" /><span className="text-sm font-medium text-blue-800">File Ready</span></div><button onClick={()=>setShowPreview(true)} className="text-xs text-blue-600 hover:text-blue-800">Preview →</button></div><p className="text-xs text-blue-600 mt-1">{filePreview.totalRows} rows × {filePreview.totalColumns} columns</p></div>)}
            <AnimatePresence>{showPreview && filePreview && (<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="mt-4 bg-gray-50 rounded-lg p-4 overflow-x-auto"><div className="flex justify-between mb-3"><span className="text-sm font-medium text-gray-700">Preview (First 5 rows)</span><button onClick={()=>setShowPreview(false)} className="text-xs text-gray-500">Hide</button></div><table className="min-w-full text-xs"><thead><tr className="border-b border-gray-300">{filePreview.headers.map((h,idx)=><th key={idx} className="text-left py-2 px-3 font-semibold text-gray-700">{h}</th>)}</tr></thead><tbody>{filePreview.rows.map((row,ridx)=><tr key={ridx} className="border-b border-gray-200">{row.map((cell,cidx)=><td key={cidx} className="py-2 px-3 text-gray-600">{cell}</td>)}</tr>)}</tbody></table></motion.div>)}</AnimatePresence>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2">📋 Required CSV Format:</p>
              <div className="bg-white rounded-lg p-2 mb-2 font-mono text-xs">billReference,customerName,amount,period,due_date</div>
              <p className="text-xs font-semibold text-gray-600 mb-1 mt-2">Example:</p>
              <div className="bg-white rounded-lg p-2 font-mono text-xs">BL-2024-001,Abebe Kebede,1500.00,2024-12,2024-12-31</div>
              <ul className="text-xs text-gray-500 space-y-1 mt-2">
                <li>• <strong>billReference</strong> - Unique bill identifier</li>
                <li>• <strong>customerName</strong> - Customer full name</li>
                <li>• <strong>amount</strong> - Positive number (no currency)</li>
                <li>• <strong>period</strong> - Billing month/year (YYYY-MM)</li>
                <li>• <strong>due_date</strong> - Payment due date (YYYY-MM-DD)</li>
              </ul>
            </div>
            <AnimatePresence>{error && (<motion.div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4"><div className="flex items-start gap-3"><ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"/><div className="flex-1"><p className="text-red-800 font-medium text-sm">Error</p><p className="text-red-600 text-sm whitespace-pre-line">{error}</p></div><button onClick={()=>setError("")} className="text-red-600">✕</button></div></motion.div>)}</AnimatePresence>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button onClick={showConfirmation} disabled={!file || loading} className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${!file || loading ? "bg-gray-300 cursor-not-allowed text-gray-500" : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg"}`}>
                {loading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Uploading...</span></>) : (<><CheckBadgeIcon className="w-5 h-5"/><span>Validate & Upload</span></>)}
              </button>
              {file && !loading && <button onClick={resetForm} className="px-6 py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Cancel</button>}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showConfirmModal && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={()=>setShowConfirmModal(false)}>
              <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}} className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden mx-4" onClick={e=>e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><CheckBadgeIcon className="w-6 h-6 text-red-500"/><div><h2 className="text-xl font-semibold text-gray-800">Review Bills Before Upload</h2><p className="text-sm text-gray-500">Verify each bill's data</p></div></div>
                    <button onClick={()=>setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6"/></button>
                  </div>
                </div>
                <div className={`px-6 py-3 border-b ${validationSummary.allValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div><p className={`text-sm font-semibold ${validationSummary.allValid ? 'text-green-800' : 'text-red-800'}`}>{validationSummary.allValid ? `✓ All ${validationSummary.total} bills are valid` : `✗ ${validationSummary.invalid} bill(s) have errors`}</p><p className="text-xs text-gray-500 mt-0.5">ACID Protection: {validationSummary.allValid ? "All bills will be uploaded together" : "No bills will be uploaded until all errors are fixed"}</p></div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-3 gap-4"><div className="text-center"><p className="text-2xl font-bold text-gray-800">{validationSummary.total}</p><p className="text-xs text-gray-500">Total</p></div><div className="text-center"><p className="text-2xl font-bold text-green-600">{validationSummary.valid}</p><p className="text-xs text-gray-500">Valid</p></div><div className="text-center"><p className="text-2xl font-bold text-red-600">{validationSummary.invalid}</p><p className="text-xs text-gray-500">Invalid</p></div></div>
                </div>
                <div className="overflow-y-auto max-h-[50vh] p-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0"><tr><th className="px-3 py-2 text-left text-xs">Row</th><th className="px-3 py-2 text-left text-xs">Bill Ref</th><th className="px-3 py-2 text-left text-xs">Customer</th><th className="px-3 py-2 text-right text-xs">Amount</th><th className="px-3 py-2 text-left text-xs">Period</th><th className="px-3 py-2 text-left text-xs">Due Date</th><th className="px-3 py-2 text-center text-xs">Status</th><th className="px-3 py-2 text-left text-xs">Errors</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {validatedBills.map(bill=>(
                        <tr key={bill.rowNumber} className={!bill.isValid ? 'bg-red-50' : 'hover:bg-gray-50'}>
                          <td className="px-3 py-2 text-xs text-gray-500">{bill.rowNumber}</td>
                          <td className="px-3 py-2"><span className={`font-mono text-xs ${!bill.isValid && !bill.billReference ? 'text-red-600' : 'text-gray-700'}`}>{bill.billReference || '—'}</span></td>
                          <td className="px-3 py-2"><span className={`text-xs ${!bill.isValid && !bill.customerName ? 'text-red-600' : 'text-gray-700'}`}>{bill.customerName || '—'}</span></td>
                          <td className="px-3 py-2 text-right"><span className={`text-xs font-medium ${!bill.isValid && !bill.amount ? 'text-red-600' : 'text-emerald-600'}`}>{bill.amount ? `ETB ${bill.amount}` : '—'}</span></td>
                          <td className="px-3 py-2"><span className={`text-xs ${!bill.isValid && !bill.period ? 'text-red-600' : 'text-gray-600'}`}>{bill.period || '—'}</span></td>
                          <td className="px-3 py-2"><span className={`text-xs ${!bill.isValid && !bill.dueDate ? 'text-red-600' : 'text-gray-600'}`}>{bill.dueDate || '—'}</span></td>
                          <td className="px-3 py-2 text-center">{bill.isValid ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full"><CheckCircleIcon className="w-3 h-3"/>Valid</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Invalid</span>}</td>
                          <td className="px-3 py-2">{bill.errors.length>0 && bill.errors.map((err,idx)=><p key={idx} className="text-xs text-red-600">• {err}</p>)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                  <button onClick={()=>setShowConfirmModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition">Cancel</button>
                  <button onClick={proceedWithUpload} disabled={!validationSummary.allValid} className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${!validationSummary.allValid ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md'}`}><CheckCircleIcon className="w-4 h-4"/> Upload All {validationSummary.valid} Valid Bill{validationSummary.valid !== 1 ? 's' : ''}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {uploadHistory.length > 0 && (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><ClockIcon className="w-5 h-5 text-red-500"/><h3 className="font-semibold text-gray-800">Upload History</h3></div><button onClick={clearHistory} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"><TrashIcon className="w-3 h-3"/>Clear</button></div>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-2">{uploadHistory.map((item,idx)=><div key={idx} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition"><div className="flex justify-between items-start mb-2"><div><p className="text-sm font-medium text-gray-800">{item.fileName}</p><p className="text-xs text-gray-400">{formatDate(item.uploadDate!)}</p></div><div className={`px-2 py-1 rounded-full text-xs font-medium ${item.success>0?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{item.success>0?`${item.success} Added`:'Failed'}</div></div><div className="flex gap-4 text-xs"><span className="text-gray-500">Total: {item.total}</span><span className="text-green-600">Success: {item.success}</span>{item.failed>0&&<span className="text-red-600">Failed: {item.failed}</span>}</div></div>)}</div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}