import { useState, useRef } from "react";

function NavButton({ item, currentPage, onClick, activeClass }) {
  const active = currentPage === item.id;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors text-left ${
        active
          ? activeClass
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
      }`}
    >
      {item.icon}
      {item.label}
    </button>
  );
}

function SectionLabel({ label }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 select-none">
      {label}
    </p>
  );
}

function BackToLauncherButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors text-left text-slate-400 hover:text-slate-100 hover:bg-slate-800"
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
      All Apps
    </button>
  );
}

export function FileControls({ usingMock, excelPath, error, onPickFile, onNewFile, hasElectron, onDownload, onUpload, demoMode, onToggleDemoMode }) {
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = "";
    }
  }

  const btnCls = "w-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-md transition-colors text-left";

  return (
    <div className="px-4 py-4 border-t border-slate-800 space-y-2">
      {error && <p className="text-xs text-red-400">{error}</p>}
      {usingMock && !demoMode && <p className="text-xs text-amber-400">Using mock data</p>}
      {excelPath && !usingMock && !demoMode && (
        <p className="text-xs text-slate-500 truncate" title={excelPath}>
          {excelPath.split(/[\\/]/).pop()}
        </p>
      )}
      {hasElectron && !demoMode && (
        <button onClick={onNewFile} className={btnCls}>New Excel File</button>
      )}
      {hasElectron && !demoMode && (
        <button onClick={onPickFile} className={btnCls}>
          {usingMock ? "Connect Excel File" : "Change File"}
        </button>
      )}
      {!hasElectron && (
        <>
          <button
            onClick={onDownload}
            disabled={demoMode}
            className={`${btnCls} disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            ↓ Download Data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={demoMode}
            className={`${btnCls} disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            ↑ Upload Data
          </button>
        </>
      )}
      {!usingMock && (
        <button
          onClick={onToggleDemoMode}
          className={`w-full text-xs px-3 py-2 rounded-md transition-colors text-left flex items-center justify-between ${
            demoMode
              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
              : "bg-slate-800 hover:bg-slate-700 text-slate-400"
          }`}
        >
          <span>{demoMode ? "Demo Mode: On" : "Demo Mode"}</span>
          <span
            className={`relative flex-shrink-0 w-8 h-4 rounded-full transition-colors ${demoMode ? "bg-amber-500" : "bg-slate-600"}`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${demoMode ? "translate-x-4" : "translate-x-0.5"}`}
            />
          </span>
        </button>
      )}
    </div>
  );
}

export default function Sidebar({
  workspace,
  currentPage,
  onNavigate,
  onBackToLauncher,
  usingMock,
  excelPath,
  error,
  onPickFile,
  onNewFile,
  hasElectron,
  onDownload,
  onUpload,
  demoMode,
  onToggleDemoMode,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const allItems = workspace.sections.flatMap((s) => s.items);
  const currentItem = allItems.find((item) => item.id === currentPage);

  function handleNavigate(id) {
    setMobileOpen(false);
    onNavigate(id);
  }

  const fileControlProps = {
    usingMock,
    excelPath,
    error,
    onPickFile,
    onNewFile,
    hasElectron,
    onDownload,
    onUpload,
    demoMode,
    onToggleDemoMode,
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex-shrink-0 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-bold text-slate-100 uppercase tracking-widest">{workspace.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{workspace.tagline}</p>
          </div>
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-slate-800 text-slate-100"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {currentItem?.icon}
            <span>{currentItem?.label ?? "Menu"}</span>
            <svg
              className={`w-4 h-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <nav className="px-2 pb-3 max-h-[70vh] overflow-y-auto border-t border-slate-800">
            <div className="pt-2">
              <BackToLauncherButton
                onClick={() => {
                  setMobileOpen(false);
                  onBackToLauncher();
                }}
              />
            </div>
            {workspace.sections.map((section) => (
              <div key={section.label}>
                <SectionLabel label={section.label} />
                {section.items.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    currentPage={currentPage}
                    onClick={handleNavigate}
                    activeClass={workspace.accent.navActive}
                  />
                ))}
              </div>
            ))}
            <FileControls {...fileControlProps} />
          </nav>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex-col">
        <div className="px-5 py-5 border-b border-slate-800">
          <p className="text-xs font-bold text-slate-100 uppercase tracking-widest">{workspace.label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{workspace.tagline}</p>
        </div>

        <nav className="flex-1 py-2 px-2 overflow-y-auto">
          <div className="pt-2">
            <BackToLauncherButton onClick={onBackToLauncher} />
          </div>
          {workspace.sections.map((section) => (
            <div key={section.label}>
              <SectionLabel label={section.label} />
              {section.items.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  currentPage={currentPage}
                  onClick={onNavigate}
                  activeClass={workspace.accent.navActive}
                />
              ))}
            </div>
          ))}
        </nav>

        <FileControls {...fileControlProps} />
      </div>
    </>
  );
}
