import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import NonTangibleAssetsPage from "./pages/NonTangibleAssetsPage";
import CDsPage from "./pages/CDsPage";
import CryptoPage from "./pages/CryptoPage";
import RetirementPage from "./pages/RetirementPage";
import BudgetPage from "./pages/BudgetPage";
import DonationsPage from "./pages/DonationsPage";
import TangibleAssetsPage from "./pages/TangibleAssetsPage";
import DigitalAssetsPage from "./pages/DigitalAssetsPage";
import AllocationPage from "./pages/AllocationPage";
import GoalsPage from "./pages/GoalsPage";
import TasksPage from "./pages/TasksPage";
import ResearchPage from "./pages/ResearchPage";
import MediaPage from "./pages/MediaPage";
import ContactsPage from "./pages/ContactsPage";
import AchievementsPage from "./pages/AchievementsPage";
import PersonalInfoPage from "./pages/PersonalInfoPage";
import ProjectionPage from "./pages/ProjectionPage";
import DebtsPage from "./pages/DebtsPage";
import WishlistPage from "./pages/WishlistPage";
import { mockData } from "./data/mock";
import { isElectron, loadExcel, saveRow, deleteRow, downloadExcel, uploadExcel } from "./api";

function addRowIndices(data) {
  const out = {}
  Object.entries(data).forEach(([sheet, rows]) => {
    out[sheet] = rows.map((row, i) => ({ ...row, _rowIndex: i + 2 }))
  })
  return out
}

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMock, setUsingMock] = useState(false);
  const [excelPath, setExcelPath] = useState(null);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    initData();
  }, []);

  async function initData() {
    if (isElectron) {
      try {
        const config = await window.electronAPI.getConfig();
        if (config.excelPath) {
          setExcelPath(config.excelPath);
          const excelData = await loadExcel(config.excelPath);
          setData(excelData);
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

    // Web — load from Azure Functions
    try {
      const excelData = await loadExcel();
      setData(excelData);
      setUsingMock(false);
    } catch (err) {
      setError(err.message);
      setData(addRowIndices(mockData));
      setUsingMock(true);
    }
    setLoading(false);
  }

  async function handleDelete(sheetName, rowIndex) {
    if (usingMock) {
      setData(prev => ({
        ...prev,
        [sheetName]: (prev[sheetName] || []).filter(r => r._rowIndex !== rowIndex),
      }))
      return
    }
    try {
      await deleteRow({ sheetName, rowIndex })
      const fresh = await loadExcel(excelPath)
      setData(fresh)
    } catch (err) {
      setError(`Delete failed: ${err.message}`)
    }
  }

  async function handleNewFile() {
    if (!isElectron) return
    try {
      const filePath = await window.electronAPI.newExcelFile()
      if (!filePath) return
      setExcelPath(filePath)
      setLoading(true)
      const excelData = await window.electronAPI.loadExcel(filePath)
      setData(excelData)
      setUsingMock(false)
      setError(null)
    } catch (err) {
      setError(`Failed to create file: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handlePickFile() {
    if (!isElectron) return;
    try {
      const filePath = await window.electronAPI.pickExcelFile();
      if (!filePath) return;
      setExcelPath(filePath);
      setLoading(true);
      const excelData = await window.electronAPI.loadExcel(filePath);
      setData(excelData);
      setUsingMock(false);
      setError(null);
    } catch (err) {
      setError(`Failed to load file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

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

  async function handleSave(sheetName, row, isNew) {
    if (usingMock) {
      setData(prev => {
        const sheet = prev[sheetName] || []
        if (isNew) {
          const maxIdx = sheet.reduce((m, r) => Math.max(m, r._rowIndex ?? 1), 1)
          const maxId  = sheet.reduce((m, r) => Math.max(m, typeof r.ID === 'number' ? r.ID : 0), 0)
          return { ...prev, [sheetName]: [...sheet, { ...row, _rowIndex: maxIdx + 1, ID: maxId + 1 }] }
        }
        return {
          ...prev,
          [sheetName]: sheet.map(r => r._rowIndex === row._rowIndex ? { ...r, ...row } : r),
        }
      })
      return
    }
    try {
      await saveRow({ sheetName, row, isNew })
      const fresh = await loadExcel(excelPath)
      setData(fresh)
    } catch (err) {
      setError(`Save failed: ${err.message}`)
    }
  }

  const pageContent = {
    dashboard:   <Dashboard data={data} onSave={handleSave} onDelete={handleDelete} />,
    allocation:  <AllocationPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    budget:      <BudgetPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    nontangible: <NonTangibleAssetsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    retirement:  <RetirementPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    crypto:      <CryptoPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    cds:         <CDsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    tangible:    <TangibleAssetsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    digital:     <DigitalAssetsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    donations:   <DonationsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    goals:        <GoalsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    achievements: <AchievementsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    tasks:       <TasksPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    research:    <ResearchPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    media:       <MediaPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    contacts:    <ContactsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    profile:     <PersonalInfoPage data={data} onSave={handleSave} />,
    projection:  <ProjectionPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    debts:       <DebtsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    wishlist:    <WishlistPage data={data} onSave={handleSave} onDelete={handleDelete} />,
  };

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
      />

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
  );
}
