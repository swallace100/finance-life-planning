// Routes calls to Electron IPC (desktop) or Azure Functions (web).
// All other files import from here instead of using window.electronAPI directly.

export const isElectron = !!window.electronAPI;

async function apiFetch(path, options = {}) {
  const res = await fetch(path, options);
  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function loadExcel(path) {
  if (isElectron) return window.electronAPI.loadExcel(path);
  return apiFetch('/api/load-excel');
}

export async function saveRow(params) {
  if (isElectron) return window.electronAPI.saveRow(params);
  return apiFetch('/api/save-row', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function deleteRow(params) {
  if (isElectron) return window.electronAPI.deleteRow(params);
  return apiFetch('/api/delete-row', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

// Downloads the Excel blob to the user's machine.
// Navigates to the endpoint directly — Content-Disposition: attachment on the response
// causes the browser to save the file without leaving the current page.
export function downloadExcel() {
  if (isElectron) return;
  window.location.href = '/api/download-excel';
}

// Uploads a File to replace the Azure blob. Returns parsed workbook data.
export async function uploadExcel(file) {
  if (isElectron) return null;
  const res = await fetch('/api/upload-excel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: file,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

// Opens a local file path with the system default app.
// In the browser there is no equivalent — silently no-ops.
export async function openPath(p) {
  if (isElectron) return window.electronAPI.openPath(p);
}

// Opens a URL. In the browser, opens a new tab.
export async function openExternal(url) {
  if (isElectron) return window.electronAPI.openExternal(url);
  window.open(url, '_blank', 'noopener,noreferrer');
}
