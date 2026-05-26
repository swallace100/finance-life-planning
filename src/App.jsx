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
import { mockData } from "./data/mock";

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
      setData(mockData);
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
        setData(mockData);
        setUsingMock(true);
      }
    } catch (err) {
      setError(err.message);
      setData(mockData);
      setUsingMock(true);
    }
    setLoading(false);
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

  const pageContent = {
    dashboard: <Dashboard data={data} />,
    budget: <BudgetPage data={data} />,
    nontangible: <NonTangibleAssetsPage data={data} />,
    retirement: <RetirementPage data={data} />,
    crypto: <CryptoPage data={data} />,
    cds: <CDsPage data={data} />,
    tangible: <TangibleAssetsPage data={data} />,
    digital: <DigitalAssetsPage data={data} />,
    donations: <DonationsPage data={data} />,
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
