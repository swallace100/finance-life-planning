import { useState, useEffect, useRef } from "react";

// Components
import Sidebar from "./components/Sidebar";

// Pages (alphabetical)
import AchievementsPage from "./pages/AchievementsPage";
import AllocationPage from "./pages/AllocationPage";
import BudgetPage from "./pages/BudgetPage";
import CDsPage from "./pages/CDsPage";
import ContactsPage from "./pages/ContactsPage";
import CryptoPage from "./pages/CryptoPage";
import Dashboard from "./pages/Dashboard";
import DebtsPage from "./pages/DebtsPage";
import DigitalAssetsPage from "./pages/DigitalAssetsPage";
import DonationsPage from "./pages/DonationsPage";
import GoalsPage from "./pages/GoalsPage";
import MediaPage from "./pages/MediaPage";
import NonTangibleAssetsPage from "./pages/NonTangibleAssetsPage";
import PersonalInfoPage from "./pages/PersonalInfoPage";
import ProjectionPage from "./pages/ProjectionPage";
import ResearchPage from "./pages/ResearchPage";
import RetirementPage from "./pages/RetirementPage";
import TangibleAssetsPage from "./pages/TangibleAssetsPage";
import TasksPage from "./pages/TasksPage";
import WishlistPage from "./pages/WishlistPage";

// Data / utilities
import { mockData } from "./data/mock";
import { isElectron, loadExcel, saveRow, deleteRow, downloadExcel, uploadExcel } from "./api";

function addRowIndices(data) {
  const out = {};
  Object.entries(data).forEach(([sheet, rows]) => {
    out[sheet] = rows.map((row, i) => ({ ...row, _rowIndex: i + 2 }));
  });
  return out;
}

export default function App() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [usingMock, setUsingMock] = useState(false);
  const [excelPath, setExcelPath] = useState(null);
  const [page, setPage]           = useState("dashboard");
  const [demoMode, setDemoMode]   = useState(false);
  const realDataRef               = useRef(null);

  useEffect(() => { initData() }, []);

  // ── Initialization ───────────────────────────────────────────────────────────

  async function initData() {
    if (isElectron) {
      try {
        const config = await window.electronAPI.getConfig();
        if (config.excelPath) {
          setExcelPath(config.excelPath);
          setData(await loadExcel(config.excelPath));
          setUsingMock(false);
        } else {
          setData(addRowIndices(mockData));
          setUsingMock(true);
        }
      } catch (err) {
        setError(err.message);
        setData(addRowIndices(mockData));
        setUsingMock(true);
      }
      setLoading(false);
      return;
    }

    // Web: load from Azure Functions
    try {
      setData(await loadExcel());
      setUsingMock(false);
    } catch (err) {
      setError(err.message);
      setData(addRowIndices(mockData));
      setUsingMock(true);
    }
    setLoading(false);
  }

  // ── Demo mode ────────────────────────────────────────────────────────────────

  function toggleDemoMode() {
    if (!demoMode) {
      realDataRef.current = data;
      setData(addRowIndices(mockData));
      setDemoMode(true);
    } else {
      setData(realDataRef.current);
      setDemoMode(false);
    }
  }

  // ── Data mutations ───────────────────────────────────────────────────────────

  async function handleSave(sheetName, row, isNew) {
    if (usingMock || demoMode) {
      setData((prev) => {
        const sheet = prev[sheetName] || [];
        if (isNew) {
          const maxIdx = sheet.reduce((m, r) => Math.max(m, r._rowIndex ?? 1), 1);
          const maxId  = sheet.reduce((m, r) => Math.max(m, typeof r.ID === "number" ? r.ID : 0), 0);
          return { ...prev, [sheetName]: [...sheet, { ...row, _rowIndex: maxIdx + 1, ID: maxId + 1 }] };
        }
        return {
          ...prev,
          [sheetName]: sheet.map((r) => r._rowIndex === row._rowIndex ? { ...r, ...row } : r),
        };
      });
      return;
    }
    try {
      await saveRow({ sheetName, row, isNew });
      setData(await loadExcel(excelPath));
    } catch (err) {
      setError(`Save failed: ${err.message}`);
    }
  }

  async function handleDelete(sheetName, rowIndex) {
    if (usingMock || demoMode) {
      setData((prev) => ({
        ...prev,
        [sheetName]: (prev[sheetName] || []).filter((r) => r._rowIndex !== rowIndex),
      }));
      return;
    }
    try {
      await deleteRow({ sheetName, rowIndex });
      setData(await loadExcel(excelPath));
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
    }
  }

  // ── Electron file operations ─────────────────────────────────────────────────

  async function handleNewFile() {
    if (!isElectron) return;
    try {
      const filePath = await window.electronAPI.newExcelFile();
      if (!filePath) return;
      setExcelPath(filePath);
      setLoading(true);
      setData(await window.electronAPI.loadExcel(filePath));
      setUsingMock(false);
      setError(null);
    } catch (err) {
      setError(`Failed to create file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePickFile() {
    if (!isElectron) return;
    try {
      const filePath = await window.electronAPI.pickExcelFile();
      if (!filePath) return;
      setExcelPath(filePath);
      setLoading(true);
      setData(await window.electronAPI.loadExcel(filePath));
      setUsingMock(false);
      setError(null);
    } catch (err) {
      setError(`Failed to load file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ── Web file operations ──────────────────────────────────────────────────────

  async function handleDownload() {
    try {
      await downloadExcel();
    } catch (err) {
      setError(`Download failed: ${err.message}`);
    }
  }

  async function handleUpload(file) {
    setLoading(true);
    try {
      const freshData = await uploadExcel(file);
      if (freshData) {
        setData(freshData);
        setUsingMock(false);
        setError(null);
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ── Page routing (alphabetical by key) ──────────────────────────────────────

  const props = { data, onSave: handleSave, onDelete: handleDelete };

  const pageContent = {
    achievements: <AchievementsPage  {...props} />,
    allocation:   <AllocationPage    {...props} />,
    budget:       <BudgetPage        {...props} />,
    cds:          <CDsPage           {...props} />,
    contacts:     <ContactsPage      {...props} />,
    crypto:       <CryptoPage        {...props} />,
    dashboard:    <Dashboard         {...props} />,
    debts:        <DebtsPage         {...props} />,
    digital:      <DigitalAssetsPage {...props} />,
    donations:    <DonationsPage     {...props} />,
    goals:        <GoalsPage         {...props} />,
    media:        <MediaPage         {...props} />,
    nontangible:  <NonTangibleAssetsPage {...props} />,
    profile:      <PersonalInfoPage  data={data} onSave={handleSave} />,
    projection:   <ProjectionPage    {...props} />,
    research:     <ResearchPage      {...props} />,
    retirement:   <RetirementPage    {...props} />,
    tangible:     <TangibleAssetsPage {...props} />,
    tasks:        <TasksPage         {...props} />,
    wishlist:     <WishlistPage      {...props} />,
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        usingMock={usingMock}
        excelPath={excelPath}
        error={error}
        onPickFile={handlePickFile}
        onNewFile={handleNewFile}
        hasElectron={isElectron}
        onDownload={handleDownload}
        onUpload={handleUpload}
        demoMode={demoMode}
        onToggleDemoMode={toggleDemoMode}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {demoMode && (
          <div className="flex-shrink-0 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-xs font-semibold">Demo Mode</span>
            <span className="text-amber-600 text-xs">· showing sample data — your real data is untouched</span>
          </div>
        )}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400">Loading…</p>
            </div>
          ) : (
            pageContent[page]
          )}
        </main>
      </div>
    </div>
  );
}
