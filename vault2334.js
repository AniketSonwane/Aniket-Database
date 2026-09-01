const VAULT_CONFIG = {
  pin: "2334",
  folderId: "189EKcPT1Nzmk57RgfnnG0JRhIMRyhyNT",
  folderName: "Public Vault",
  driveUrl: "https://drive.google.com/drive/folders/189EKcPT1Nzmk57RgfnnG0JRhIMRyhyNT?usp=sharing",
  apiKey: atob("QUl6YVN5QTdLcU1vMU9XMFFzTC0xMy1TOWZZLVI5aXlhRlNkTDdJ"),
  uploadScriptUrl: "https://script.google.com/macros/s/AKfycbwRweKFf16EEF0BB3iBntBYhe0gYklvkCkMAZb9JJrXIWhRKGPajbg5YCtF78SBiL4/exec"
};

const vaultState = {
  isUnlocked: false,
  pin: "",
  currentFolder: { id: VAULT_CONFIG.folderId, name: VAULT_CONFIG.folderName },
  breadcrumb: [{ id: VAULT_CONFIG.folderId, name: VAULT_CONFIG.folderName, root: true }],
  items: [],
  vaultIndex: []
};

const $ = (id) => document.getElementById(id);

function showToast(message) {
  const t = $("toast");
  if (!t) return;
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => t.classList.remove("show"), 2800);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes) || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(name, mime) {
  const ext = (name || "").split(".").pop().toLowerCase();
  if (mime?.includes("pdf") || ext === "pdf") return "📕";
  if (mime?.includes("image") || ["jpg","jpeg","png","gif","webp"].includes(ext)) return "🖼️";
  if (mime?.includes("video") || ["mp4","mkv","webm","mov"].includes(ext)) return "🎬";
  if (mime?.includes("audio") || ["mp3","wav","m4a"].includes(ext)) return "🎵";
  if (["zip","rar","7z"].includes(ext)) return "🗜️";
  if (["doc","docx"].includes(ext)) return "📘";
  if (["xls","xlsx"].includes(ext)) return "📗";
  if (["ppt","pptx"].includes(ext)) return "📙";
  if (["cpp","c","js","html","css","py","java"].includes(ext)) return "💻";
  return "📄";
}

function fileType(item) {
  const m = item.mimeType || "";
  if (m.includes("pdf")) return "PDF";
  if (m.includes("image")) return "Image";
  if (m.includes("video")) return "Video";
  if (m.includes("audio")) return "Audio";
  if (m.includes("spreadsheet") || m.includes("excel")) return "Spreadsheet";
  if (m.includes("presentation") || m.includes("powerpoint")) return "Presentation";
  if (m.includes("word") || m.includes("document")) return "Document";
  if (m.includes("zip") || m.includes("compressed")) return "Archive";
  const ext = (item.name || "").split(".").pop().toUpperCase();
  return ext ? `${ext} File` : "File";
}

function updatePinDots() {
  const dotsContainer = $("pinDots");
  if (!dotsContainer) return;
  [...dotsContainer.children].forEach((dot, i) => {
    dot.classList.toggle("filled", i < vaultState.pin.length);
  });
}

function resetPin() {
  vaultState.pin = "";
  updatePinDots();
}

function pressPinKey(num) {
  if (vaultState.pin.length < 4) {
    vaultState.pin += String(num);
    updatePinDots();
    if (vaultState.pin.length === 4) {
      setTimeout(submitPin, 120);
    }
  }
}

function deletePinKey() {
  if (vaultState.pin.length > 0) {
    vaultState.pin = vaultState.pin.slice(0, -1);
    updatePinDots();
  }
}

function isVault2334LockedByAdmin() {
  try {
    const raw = localStorage.getItem("fm_pin_config");
    if (raw) {
      const cfg = JSON.parse(raw);
      if (cfg && cfg["2334"] && cfg["2334"].isLocked) return true;
    }
  } catch (err) {}
  return false;
}

function submitPin() {
  if (isVault2334LockedByAdmin()) {
    if ($("pinMessage")) $("pinMessage").textContent = "🔒 Vault (2334) is currently locked by Admin.";
    const card = document.querySelector(".pin-card");
    if (card) {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 400);
    }
    resetPin();
    return;
  }
  if (vaultState.pin === VAULT_CONFIG.pin) {
    unlockVault();
  } else {
    if ($("pinMessage")) $("pinMessage").textContent = "Incorrect PIN. (Vault PIN is 2334)";
    const card = document.querySelector(".pin-card");
    if (card) {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 400);
    }
    resetPin();
  }
}

function unlockVault() {
  if (isVault2334LockedByAdmin()) {
    lockVault();
    if ($("pinMessage")) $("pinMessage").textContent = "🔒 Vault (2334) is currently locked by Admin.";
    return;
  }
  vaultState.isUnlocked = true;
  sessionStorage.setItem("vault_2334_unlocked", "true");
  if ($("pinScreen")) $("pinScreen").classList.add("hidden");
  if ($("vaultScreen")) $("vaultScreen").classList.remove("hidden");
  
  if ($("headerAction")) {
    $("headerAction").innerHTML = `
      <div class="flex items-center gap-2">
        <button id="exitVaultBtn" onclick="lockVault()" class="px-3.5 py-1.5 rounded-xl font-black text-xs bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-400/30 transition">Exit Vault 🚪</button>
      </div>`;
  }

  showToast("Vault Unlocked! 🎉 (No Google Login Required)");
  loadFolder(vaultState.currentFolder.id);
  buildVaultIndex(vaultState.currentFolder.id);
}

function lockVault() {
  vaultState.isUnlocked = false;
  sessionStorage.removeItem("vault_2334_unlocked");
  sessionStorage.removeItem("vault_1111_unlocked");
  sessionStorage.removeItem("vault_3333_unlocked");
  closeFilePreviewModal();
  if (typeof closeUploadModal === "function") closeUploadModal();
  window.location.href = "./index.html";
}
window.lockVault = lockVault;
window.exitVault = lockVault;

async function getDriveItems(folderId) {
  if (!VAULT_CONFIG.apiKey) throw new Error("API key missing.");
  const q = `'${folderId}' in parents and trashed = false`;
  const fields = "files(id,name,mimeType,size,modifiedTime,webContentLink,webViewLink,thumbnailLink,parents)";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&pageSize=1000&orderBy=name&fields=${encodeURIComponent(fields)}&key=${encodeURIComponent(VAULT_CONFIG.apiKey.trim())}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Drive API Error (${res.status})`);
  }

  const data = await res.json();
  const items = (data.files || []).map(f => ({ ...f, folderId }));

  items.sort((a, b) => {
    const aFolder = a.mimeType === "folder" || a.mimeType === "application/vnd.google-apps.folder";
    const bFolder = b.mimeType === "folder" || b.mimeType === "application/vnd.google-apps.folder";
    if (aFolder && !bFolder) return -1;
    if (!aFolder && bFolder) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });

  return items;
}

async function loadFolder(folderId) {
  if ($("loading")) $("loading").classList.remove("hidden");
  if ($("fileList")) $("fileList").innerHTML = "";
  if ($("emptyState")) $("emptyState").classList.add("hidden");

  try {
    let driveItems = await getDriveItems(folderId).catch(() => []);

    let deletedIds = [];
    try {
      const raw = localStorage.getItem("fm_deleted_files");
      if (raw) deletedIds = JSON.parse(raw);
    } catch(e) {}

    if (Array.isArray(deletedIds) && deletedIds.length > 0) {
      driveItems = driveItems.filter(item => !deletedIds.includes(item.id));
    }

    let customItems = [];
    try {
      const rawCustom = localStorage.getItem("fm_custom_uploads_" + folderId);
      if (rawCustom) customItems = JSON.parse(rawCustom);
    } catch(e) {}

    if (Array.isArray(customItems) && customItems.length > 0) {
      const activeCustom = customItems.filter(item => !deletedIds.includes(item.id));
      driveItems = [...activeCustom, ...driveItems];
    }

    vaultState.items = driveItems;
    renderHeader();
    renderItems();
  } catch (error) {
    console.error("Load folder error:", error);
    vaultState.items = [];
    renderItems();
  } finally {
    if ($("loading")) $("loading").classList.add("hidden");
  }
}

async function buildVaultIndex(rootId) {
  vaultState.vaultIndex = [];
  const queue = [{ id: rootId, path: "", breadcrumb: vaultState.breadcrumb }];
  const visited = new Set();

  while (queue.length > 0 && visited.size < 30) {
    const current = queue.shift();
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    try {
      const files = await getDriveItems(current.id);
      for (const file of files) {
        const isFolder = file.mimeType === "folder" || file.mimeType === "application/vnd.google-apps.folder";
        const fileBreadcrumb = isFolder
          ? [...current.breadcrumb, { id: file.id, name: file.name }]
          : current.breadcrumb;

        vaultState.vaultIndex.push({
          ...file,
          parentPath: current.path,
          breadcrumb: fileBreadcrumb
        });

        if (isFolder && !visited.has(file.id)) {
          const nextPath = current.path ? `${current.path} / ${file.name}` : file.name;
          queue.push({ id: file.id, path: nextPath, breadcrumb: fileBreadcrumb });
        }
      }
    } catch (e) {}
  }

  let deletedIds = [];
  try {
    const raw = localStorage.getItem("fm_deleted_files");
    if (raw) deletedIds = JSON.parse(raw);
  } catch(e) {}

  if (Array.isArray(deletedIds) && deletedIds.length > 0) {
    vaultState.vaultIndex = vaultState.vaultIndex.filter(item => !deletedIds.includes(item.id));
  }

  if ($("searchInput") && $("searchInput").value.trim() !== "") {
    renderItems();
  }
}

function renderHeader() {
  if ($("folderTitle")) $("folderTitle").textContent = vaultState.currentFolder.name;
  renderBreadcrumb();
}

function renderBreadcrumb() {
  const box = $("breadcrumb");
  if (!box) return;
  box.innerHTML = vaultState.breadcrumb.map((b, i) => {
    const isLast = i === vaultState.breadcrumb.length - 1;
    return `${i ? `<span class="text-slate-500">/</span>` : ""}${isLast
      ? `<span class="font-bold text-slate-900 dark:text-slate-100">${escapeHtml(b.name)}</span>`
      : `<button class="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold" onclick="navigateToBreadcrumb(${i})">${escapeHtml(b.name)}</button>`}`;
  }).join("");
}

async function navigateToBreadcrumb(idx) {
  const target = vaultState.breadcrumb[idx];
  if (!target) return;
  if ($("searchInput")) $("searchInput").value = "";
  vaultState.breadcrumb = vaultState.breadcrumb.slice(0, idx + 1);
  vaultState.currentFolder = target;
  await loadFolder(target.id);
}

async function openFolder(item) {
  if (!item) return;
  if ($("searchInput")) $("searchInput").value = "";
  vaultState.currentFolder = { id: item.id, name: item.name };

  const existingIdx = vaultState.breadcrumb.findIndex(b => b.id === item.id);
  if (existingIdx !== -1) {
    vaultState.breadcrumb = vaultState.breadcrumb.slice(0, existingIdx + 1);
  } else {
    vaultState.breadcrumb.push({ id: item.id, name: item.name });
  }

  await loadFolder(item.id);
}

function renderItems() {
  const rawQuery = ($("searchInput")?.value || "").trim();
  const query = rawQuery.toLowerCase();

  const isSearching = Boolean(rawQuery);
  let pool = vaultState.items;

  if (isSearching) {
    const combined = [...vaultState.items, ...(vaultState.vaultIndex || [])];
    const uniqueMap = new Map();
    combined.forEach(item => uniqueMap.set(item.id, item));
    pool = Array.from(uniqueMap.values());
  }

  const filtered = !isSearching ? pool : pool.filter(item => {
    if (!item.name) return false;
    const nameMatch = item.name.toLowerCase().includes(query);
    const typeMatch = fileType(item).toLowerCase().includes(query);
    const extMatch = item.name.split(".").pop().toLowerCase() === query;
    return nameMatch || typeMatch || extMatch;
  });

  if ($("fileCount")) $("fileCount").textContent = filtered.length.toLocaleString();

  if (!filtered.length) {
    if ($("fileList")) $("fileList").innerHTML = "";
    if ($("emptyState")) $("emptyState").classList.remove("hidden");
    return;
  }

  if ($("emptyState")) $("emptyState").classList.add("hidden");
  if ($("fileList")) {
    $("fileList").innerHTML = filtered.map(item => {
      const isFolder = item.mimeType === "folder" || item.mimeType === "application/vnd.google-apps.folder";
      const icon = isFolder ? "📁" : getFileIcon(item.name, item.mimeType);
      let meta = isFolder ? "Folder" : `${fileType(item)}${item.size ? " • " + formatBytes(Number(item.size)) : ""}`;

      return `
        <div class="file-row flex items-center justify-between p-3.5 rounded-2xl glass border border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition gap-3" data-id="${escapeAttr(item.id)}">
          <div class="flex items-center gap-3 truncate">
            <div class="text-2xl flex-shrink-0">${icon}</div>
            <div class="truncate">
              <div class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate" title="${escapeAttr(item.name)}">${escapeHtml(item.name)}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">${escapeHtml(meta)}</div>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            ${isFolder
              ? `<button class="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100 transition" onclick="openFolderById('${escapeAttr(item.id)}')">Open →</button>`
              : `
                <button class="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300 hover:bg-indigo-100 transition border border-indigo-200/60 dark:border-indigo-800/60" onclick="previewItemById('${escapeAttr(item.id)}')">Preview 👁️</button>
                <button class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-100 transition border border-emerald-200/60 dark:border-emerald-800/60" onclick="downloadItemById('${escapeAttr(item.id)}')">Download ↓</button>
                <button class="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300 hover:bg-rose-100 transition border border-rose-200/60 dark:border-rose-800/60" onclick="deleteItemById('${escapeAttr(item.id)}')">Delete 🗑️</button>
              `}
          </div>
        </div>`;
    }).join("");
  }
}

function getItemById(id) {
  return [...vaultState.items, ...(vaultState.vaultIndex || [])].find(x => x.id === id);
}

function openFolderById(id) {
  const item = getItemById(id);
  if (item) openFolder(item);
}

function previewItemById(id) {
  const item = getItemById(id);
  if (item) previewItem(item);
}

function downloadItemById(id) {
  const item = getItemById(id);
  if (item) downloadItem(item);
}

function deleteItemById(id) {
  const item = getItemById(id);
  if (item) deleteItem(item);
}

let currentPreviewItem = null;

function previewItem(item) {
  if (!item) return;
  currentPreviewItem = item;

  const modal = $("filePreviewModal");
  const iframe = $("previewIframe");
  if (!modal || !iframe) return;

  if ($("previewFileName")) $("previewFileName").textContent = item.name || "File Preview";
  if ($("previewFileMeta")) $("previewFileMeta").textContent = `${fileType(item)}${item.size ? " • " + formatBytes(Number(item.size)) : ""}`;
  if ($("previewFileIcon")) $("previewFileIcon").textContent = getFileIcon(item.name || "", item.mimeType || "");

  const isCustomUpload = item.id && item.id.startsWith("upload_");
  if ($("previewOpenDriveBtn")) {
    if (isCustomUpload) {
      $("previewOpenDriveBtn").classList.add("hidden");
    } else {
      $("previewOpenDriveBtn").classList.remove("hidden");
      const driveUrl = item.webViewLink || `https://drive.google.com/file/d/${encodeURIComponent(item.id)}/view`;
      $("previewOpenDriveBtn").onclick = () => window.open(driveUrl, "_blank", "noopener");
    }
  }

  if ($("previewDownloadBtn")) {
    $("previewDownloadBtn").onclick = () => downloadItem(item);
  }

  if ($("previewDeleteBtn")) {
    $("previewDeleteBtn").onclick = () => deleteItem(item);
  }

  iframe.src = isCustomUpload ? (item.webViewLink || item.webContentLink) : `https://drive.google.com/file/d/${encodeURIComponent(item.id)}/preview`;
  modal.classList.remove("hidden");
  modal.setAttribute("style", "display: flex !important; position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 999999; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); justify-content: center; align-items: center; pointer-events: auto !important;");
}

function closeFilePreviewModal() {
  const modal = $("filePreviewModal");
  const iframe = $("previewIframe");
  if (modal) {
    modal.classList.add("hidden");
    modal.setAttribute("style", "display: none !important;");
  }
  if (iframe) iframe.src = "about:blank";
  currentPreviewItem = null;
}

async function downloadItem(item) {
  if (!item || !item.id) return;
  const filename = item.name || "file";
  showToast(`Downloading "${filename}"...`);
  
  if (item.id && item.id.startsWith("upload_")) {
    const a = document.createElement("a");
    a.href = item.webViewLink || item.webContentLink;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 200);
    showToast(`Downloaded "${filename}"!`);
    return;
  }

  const key = encodeURIComponent(VAULT_CONFIG.apiKey);
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(item.id)}?alt=media&key=${key}`;

  try {
    const res = await fetch(downloadUrl);
    if (!res.ok) throw new Error("Fetch failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 200);
    showToast(`Downloaded "${filename}"!`);
  } catch (e) {
    window.open(`https://drive.google.com/uc?export=download&id=${encodeURIComponent(item.id)}`, "_blank");
  }
}

async function deleteItem(item) {
  if (!item || !item.id) return;
  const filename = item.name || "this file";
  if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

  let deleted = [];
  try {
    const raw = localStorage.getItem("fm_deleted_files");
    if (raw) deleted = JSON.parse(raw);
  } catch(e) {}

  if (!deleted.includes(item.id)) {
    deleted.push(item.id);
    localStorage.setItem("fm_deleted_files", JSON.stringify(deleted));
  }

  const folderId = vaultState.currentFolder.id;
  const customKey = "fm_custom_uploads_" + folderId;
  try {
    const rawCustom = localStorage.getItem(customKey);
    if (rawCustom) {
      let customItems = JSON.parse(rawCustom).filter(x => x.id !== item.id);
      localStorage.setItem(customKey, JSON.stringify(customItems));
    }
  } catch(e) {}

  vaultState.items = vaultState.items.filter(x => x.id !== item.id);
  if (vaultState.vaultIndex) {
    vaultState.vaultIndex = vaultState.vaultIndex.filter(x => x.id !== item.id);
  }

  if (VAULT_CONFIG.uploadScriptUrl && item.id && !item.id.startsWith("upload_")) {
    fetch(VAULT_CONFIG.uploadScriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "delete", fileId: item.id })
    }).catch(() => null);
  }

  renderItems();
  closeFilePreviewModal();
  showToast(`Deleted "${filename}" 🗑️`);
}

document.addEventListener("DOMContentLoaded", () => {
  const isDark = (localStorage.getItem("fm_theme") || "dark") === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);

  const isAutoUnlock = window.location.search.includes("autounlock") || sessionStorage.getItem("vault_2334_unlocked") === "true";
  if (isAutoUnlock && !isVault2334LockedByAdmin()) {
    unlockVault();
  } else {
    lockVault();
  }

  setupDropZoneEvents();

  window.addEventListener("fmSharedDataSynced", () => {
    if (isVault2334LockedByAdmin()) {
      lockVault();
    }
  });
});

let stagedFiles = [];

function openUploadModal() {
  const modal = $("uploadModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  stagedFiles = [];
  renderStagedFiles();
  updateUploadProgress(0, 0);
}

function closeUploadModal() {
  const modal = $("uploadModal");
  if (modal) modal.classList.add("hidden");
  stagedFiles = [];
  renderStagedFiles();
  const fileInput = $("modalFileInput");
  if (fileInput) fileInput.value = "";
  updateUploadProgress(0, 0);
}

function triggerFileInputClick() {
  const fileInput = $("modalFileInput");
  if (fileInput) fileInput.click();
}

function handleModalFileSelect(e) {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  files.forEach(file => {
    stagedFiles.push({
      file: file,
      name: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type
    });
  });

  if (e.target) e.target.value = "";
  renderStagedFiles();
}

function renderStagedFiles() {
  const container = $("uploadStagingContainer");
  const list = $("stagingFileList");
  const countEl = $("stagingFileCount");
  const confirmBtn = $("confirmUploadBtn");

  if (!container || !list) return;

  if (countEl) countEl.textContent = stagedFiles.length;

  if (stagedFiles.length === 0) {
    container.classList.add("hidden");
    if (confirmBtn) confirmBtn.disabled = true;
    return;
  }

  container.classList.remove("hidden");
  if (confirmBtn) confirmBtn.disabled = false;

  list.innerHTML = stagedFiles.map((item, idx) => {
    const sizeKb = (item.size / 1024).toFixed(1);
    const sizeMb = (item.size / (1024 * 1024)).toFixed(2);
    const formattedSize = item.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

    return `
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 transition group">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm flex-shrink-0">
          📄
        </div>
        <div class="flex-1 min-w-0">
          <input type="text" value="${escapeHtml(item.name)}" onchange="updateStagedFileName(${idx}, this.value)" class="w-full text-xs font-extrabold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 truncate" />
          <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 truncate">Original: ${escapeHtml(item.originalName)} • ${formattedSize}</p>
        </div>
        <button type="button" onclick="removeStagedFile(${idx})" title="Remove file" class="flex h-8 w-8 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold transition flex-shrink-0">
          ✕
        </button>
      </div>`;
  }).join("");
}

function removeStagedFile(index) {
  stagedFiles.splice(index, 1);
  renderStagedFiles();
}

function updateStagedFileName(index, newName) {
  if (stagedFiles[index]) {
    stagedFiles[index].name = (newName || "").trim() || stagedFiles[index].originalName;
  }
}

function updateUploadProgress(current, total) {
  const container = $("uploadProgressContainer");
  const fill = $("uploadProgressBarFill");
  const percentText = $("uploadProgressPercentText");
  const currentText = $("uploadProgressCurrent");
  const totalText = $("uploadProgressTotal");

  if (!container) return;

  if (total === 0) {
    container.classList.add("hidden");
    if (fill) fill.style.width = "0%";
    return;
  }

  container.classList.remove("hidden");
  const pct = Math.min(100, Math.round((current / total) * 100));
  if (fill) fill.style.width = `${pct}%`;
  if (percentText) percentText.textContent = `${pct}%`;
  if (currentText) currentText.textContent = Math.floor(current);
  if (totalText) totalText.textContent = total;
}

function setupDropZoneEvents() {
  const dropZone = $("dropZone");
  if (!dropZone) return;

  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.add("border-indigo-500", "bg-indigo-50/80", "dark:bg-indigo-950/60");
    }, false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove("border-indigo-500", "bg-indigo-50/80", "dark:bg-indigo-950/60");
    }, false);
  });

  dropZone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = Array.from(dt.files || []);
    if (files.length > 0) {
      files.forEach(file => {
        stagedFiles.push({
          file: file,
          name: file.name,
          originalName: file.name,
          size: file.size,
          type: file.type
        });
      });
      renderStagedFiles();
    }
  }, false);
}

async function uploadToGoogleAppsScript(stagedItem, finalName, folderId, rawEmail, base64Data) {
  if (!VAULT_CONFIG.uploadScriptUrl) return null;
  const payload = {
    action: "uploadFile",
    filename: finalName,
    name: finalName,
    mimeType: stagedItem.type || "application/octet-stream",
    base64: base64Data,
    fileData: base64Data,
    folderId: folderId,
    uploaderEmail: rawEmail
  };

  const fetchPromise = fetch(VAULT_CONFIG.uploadScriptUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }).then(() => ({ status: "success", fileName: finalName })).catch(() => null);

  const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 30000));
  return Promise.race([fetchPromise, timeoutPromise]);
}

async function confirmStagedUpload() {
  if (stagedFiles.length === 0) return;

  const rawEmail = (vaultState.userEmail || localStorage.getItem("fm_user_email") || "Guest User").trim();
  const folderId = vaultState.currentFolder.id;

  const confirmBtn = $("confirmUploadBtn");
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<span>⏳</span> Uploading files...`;
  }

  const totalFiles = stagedFiles.length;
  let completedCount = 0;
  updateUploadProgress(0, totalFiles);

  try {
    for (let i = 0; i < stagedFiles.length; i++) {
      const stagedItem = stagedFiles[i];
      const finalName = stagedItem.name || stagedItem.originalName || "Uploaded_File";

      updateUploadProgress(i + 0.3, totalFiles);

      const fileData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(stagedItem.file);
      });

      const base64Data = fileData ? fileData.split(",")[1] : "";

      updateUploadProgress(i + 0.6, totalFiles);

      if (fileData && VAULT_CONFIG.uploadScriptUrl) {
        await uploadToGoogleAppsScript(stagedItem, finalName, folderId, rawEmail, base64Data);
      }

      completedCount++;
      updateUploadProgress(completedCount, totalFiles);
      showToast(`✓ Uploaded "${finalName}" (${completedCount}/${totalFiles})`);

      if (typeof trackFileUpload === "function") {
        trackFileUpload(rawEmail, finalName, "2334");
      }
    }
  } catch (err) {
    console.error("Batch upload error:", err);
    showToast("⚠️ Upload error occurred.");
  } finally {
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `<span>📤</span> Upload Now`;
    }
    showToast(`✓ Upload complete! Syncing with Google Drive...`);
    setTimeout(async () => {
      closeUploadModal();
      await loadFolder(folderId);
      buildVaultIndex(folderId);
    }, 1800);
  }
}

window.openUploadModal = openUploadModal;
window.closeUploadModal = closeUploadModal;
window.triggerFileInputClick = triggerFileInputClick;
window.handleModalFileSelect = handleModalFileSelect;
window.removeStagedFile = removeStagedFile;
window.updateStagedFileName = updateStagedFileName;
window.confirmStagedUpload = confirmStagedUpload;

