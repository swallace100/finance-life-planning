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
import { mockData } from "./data/mock";

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
    if (!window.electronAPI) {
      setData(addRowIndices(mockData));
      setUsingMock(true);
      setLoading(false);
      return;
    }
    try {
      const config = await window.electronAPI.getConfig();
      if (config.excelPath) {
        setExcelPath(config.excelPath);
        const excelData = await window.electronAPI.loadExcel(config.excelPath);
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
      await window.electronAPI.deleteRow({ sheetName, rowIndex })
      const fresh = await window.electronAPI.loadExcel(excelPath)
      setData(fresh)
    } catch (err) {
      setError(`Delete failed: ${err.message}`)
    }
  }

  async function handleNewFile() {
    if (!window.electronAPI) return
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
    if (!window.electronAPI) return;
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
      await window.electronAPI.saveRow({ sheetName, row, isNew })
      const fresh = await window.electronAPI.loadExcel(excelPath)
      setData(fresh)
    } catch (err) {
      setError(`Save failed: ${err.message}`)
    }
  }

  const pageContent = {
    dashboard:   <Dashboard data={data} />,
    allocation:  <AllocationPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    budget:      <BudgetPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    nontangible: <NonTangibleAssetsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    retirement:  <RetirementPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    crypto:      <CryptoPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    cds:         <CDsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    tangible:    <TangibleAssetsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    digital:     <DigitalAssetsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    donations:   <DonationsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    goals:       <GoalsPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    tasks:       <TasksPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    research:    <ResearchPage data={data} onSave={handleSave} onDelete={handleDelete} />,
    media:       <MediaPage data={data} onSave={handleSave} onDelete={handleDelete} />,
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        usingMock={usingMock}
        excelPath={excelPath}
        error={error}
        onPickFile={handlePickFile}
        onNewFile={handleNewFile}
        hasElectron={!!window.electronAPI}
      />

      <main className="flex-1 overflow-auto p-6">
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
