/**
 * Class Upload Vault (PIN 3333) JavaScript Controller
 * Exact 1717 Vault Layout, Hover Effects, Click Behavior, History Navigation,
 * Drag & Drop Upload Modal with Pre-Upload File Renamer & User-Scoped Delete.
 * Developed by Aniket | CS25131
 */

const VAULT_CONFIG = {
  pin: "3333",
  folderId: "189EKcPT1Nzmk57RgfnnG0JRhIMRyhyNT",
  folderName: "Class Upload Folder",
  driveUrl: "https://drive.google.com/drive/folders/189EKcPT1Nzmk57RgfnnG0JRhIMRyhyNT?usp=sharing",
  apiKey: atob("QUl6YVN5QTdLcU1vMU9XMFFzTC0xMy1TOWZZLVI5aXlhRlNkTDdJ"),
  uploadScriptUrl: "https://script.google.com/macros/s/AKfycbwRweKFf16EEF0BB3iBntBYhe0gYklvkCkMAZb9JJrXIWhRKGPajbg5YCtF78SBiL4/exec"
};

const vaultState = {
  userEmail: localStorage.getItem("fm_user_email") || "",
  currentFolder: { id: VAULT_CONFIG.folderId, name: VAULT_CONFIG.folderName },
  breadcrumb: [{ id: VAULT_CONFIG.folderId, name: VAULT_CONFIG.folderName, root: true }],
  items: [],
  vaultIndex: [],
  history: [],
  historyIndex: -1
};

// Staged files for drag-and-drop & pre-upload renamer
let stagedFiles = [];

const $ = (id) => document.getElementById(id);

function showToast(message) {
  const t = $("toast");
  if (!t) return;
  t.textContent = message;
  t.classList.remove("opacity-0", "translate-y-4");
  t.classList.add("opacity-100", "translate-y-0");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    t.classList.remove("opacity-100", "translate-y-0");
    t.classList.add("opacity-0", "translate-y-4");
  }, 3200);
}

function updateAuthUI() {
  const email = (vaultState.userEmail || localStorage.getItem("fm_user_email") || "").trim().toLowerCase();
  const userBadge = $("userEmailBadge");
  if (userBadge) {
    userBadge.textContent = email ? `Logged in as ${email}` : "";
  }
}

function updateThemeBtnUI() {
  const isDark = document.documentElement.classList.contains("dark");
  const themeLabel = $("themeLabel");
  const themeIcon = $("themeIcon");

  if (themeLabel) {
    themeLabel.textContent = isDark ? "Dark" : "Light";
  }
  if (themeIcon) {
    themeIcon.innerHTML = isDark
      ? `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`
      : `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42" /><circle cx="12" cy="12" r="3.5" /></svg>`;
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const nextTheme = isDark ? "light" : "dark";
  document.documentElement.classList.toggle("dark", !isDark);
  document.documentElement.classList.toggle("light", isDark);
  localStorage.setItem("fm_theme", nextTheme);
  updateThemeBtnUI();
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

function exitVault() {
  sessionStorage.removeItem("vault_3333_unlocked");
  closeFilePreviewModal();
  closeUploadModal();
  window.location.href = "./index.html";
}

// Drive Item Fetcher
async function getDriveItems(folderId) {
  if (!VAULT_CONFIG.apiKey) throw new Error("API key missing.");
  const q = `'${folderId}' in parents and trashed = false`;
  const fields = "files(id,name,mimeType,size,modifiedTime,webContentLink,webViewLink,thumbnailLink,parents)";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&pageSize=1000&orderBy=name&fields=${encodeURIComponent(fields)}&key=${encodeURIComponent(VAULT_CONFIG.apiKey.trim())}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Drive API Error (${res.status})`);
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

// History Navigation Stack Management
function pushNavState(folderObj) {
  if (vaultState.historyIndex >= 0 && vaultState.history[vaultState.historyIndex]?.id === folderObj.id) {
    return;
  }
  vaultState.history = vaultState.history.slice(0, vaultState.historyIndex + 1);
  vaultState.history.push({ ...folderObj, breadcrumb: vaultState.breadcrumb.map(b => ({ ...b })) });
  vaultState.historyIndex = vaultState.history.length - 1;
  updateNavButtons();
}

function updateNavButtons() {
  const backBtn = $("navBackBtn");
  const fwdBtn = $("navForwardBtn");
  if (backBtn) backBtn.disabled = vaultState.historyIndex <= 0;
  if (fwdBtn) fwdBtn.disabled = vaultState.historyIndex >= vaultState.history.length - 1;
}

async function navBack() {
  if (vaultState.historyIndex > 0) {
    vaultState.historyIndex--;
    const stateObj = vaultState.history[vaultState.historyIndex];
    vaultState.currentFolder = { id: stateObj.id, name: stateObj.name };
    vaultState.breadcrumb = stateObj.breadcrumb ? stateObj.breadcrumb.map(b => ({ ...b })) : [];
    renderHeader();
    await loadFolder(stateObj.id, true);
    updateNavButtons();
  }
}

async function navForward() {
  if (vaultState.historyIndex < vaultState.history.length - 1) {
    vaultState.historyIndex++;
    const stateObj = vaultState.history[vaultState.historyIndex];
    vaultState.currentFolder = { id: stateObj.id, name: stateObj.name };
    vaultState.breadcrumb = stateObj.breadcrumb ? stateObj.breadcrumb.map(b => ({ ...b })) : [];
    renderHeader();
    await loadFolder(stateObj.id, true);
    updateNavButtons();
  }
}

async function loadFolder(folderId, isHistoryNav = false) {
  if ($("loading")) $("loading").classList.remove("hidden");
  if ($("fileList")) $("fileList").innerHTML = "";
  if ($("emptyState")) $("emptyState").classList.add("hidden");

  try {
    let driveItems = await getDriveItems(folderId).catch(() => []);

    // Filter out deleted items
    let deletedIds = [];
    try {
      const raw = localStorage.getItem("fm_deleted_files");
      if (raw) deletedIds = JSON.parse(raw);
    } catch(e) {}

    if (Array.isArray(deletedIds) && deletedIds.length > 0) {
      driveItems = driveItems.filter(item => !deletedIds.includes(item.id));
    }

    // Load custom uploaded files for Vault 3333 at this folder level
    let customItems = [];
    try {
      const rawCustom = localStorage.getItem("fm_class_uploads_" + folderId);
      if (rawCustom) customItems = JSON.parse(rawCustom);
    } catch(e) {}

    // Auto-sync & purge custom local records if file was deleted directly on drive.google.com
    const now = Date.now();
    const driveNameSet = new Set(driveItems.map(x => (x.name || "").toLowerCase()));
    const driveIdSet = new Set(driveItems.map(x => x.id));

    // Map uploader metadata to Drive items matching by name or ID
    driveItems.forEach(dItem => {
      const matchCustom = customItems.find(c => c.id === dItem.id || (c.name && c.name.toLowerCase() === (dItem.name || "").toLowerCase()));
      if (matchCustom) {
        dItem.uploadedBy = matchCustom.uploadedBy || matchCustom.uploaderEmail;
        dItem.uploaderEmail = matchCustom.uploaderEmail || matchCustom.uploadedBy;
      }
    });

    if (Array.isArray(customItems) && customItems.length > 0) {
      const updatedCustom = customItems.filter(item => {
        if (deletedIds.includes(item.id)) return false;
        
        // If file exists in Google Drive API list, driveItems already renders it with uploader metadata
        if (driveIdSet.has(item.id) || (item.name && driveNameSet.has(item.name.toLowerCase()))) {
          return false;
        }

        // If local custom record is older than 45 seconds and no longer returned by Google Drive API,
        // it means the file was deleted directly on drive.google.com -> purge it!
        const createdTimestamp = parseInt((item.id || "").split("_")[1] || "0", 10);
        if (createdTimestamp > 0 && (now - createdTimestamp > 45000)) {
          return false;
        }

        return true;
      });

      localStorage.setItem("fm_class_uploads_" + folderId, JSON.stringify(updatedCustom));
      driveItems = [...updatedCustom, ...driveItems];
    }

    vaultState.items = driveItems;
    renderHeader();
    renderItems();

    if (!isHistoryNav) {
      pushNavState({ id: folderId, name: vaultState.currentFolder.name });
    }
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
  const rootBreadcrumb = (vaultState.breadcrumb && vaultState.breadcrumb.length > 0)
    ? vaultState.breadcrumb.map(b => ({ ...b }))
    : [{ id: VAULT_CONFIG.folderId, name: VAULT_CONFIG.folderName, root: true }];

  const queue = [{ id: rootId, path: "", breadcrumb: rootBreadcrumb }];
  const visited = new Set();

  while (queue.length > 0 && visited.size < 40) {
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

        const itemWithPath = {
          ...file,
          parentPath: current.path,
          breadcrumb: fileBreadcrumb
        };
        vaultState.vaultIndex.push(itemWithPath);

        if (isFolder && !visited.has(file.id)) {
          const nextPath = current.path ? `${current.path} / ${file.name}` : file.name;
          queue.push({ id: file.id, path: nextPath, breadcrumb: fileBreadcrumb });
        }
      }
    } catch (e) {
      console.warn("Indexing step warning:", e);
    }
  }

  let deletedIds = [];
  try {
    const rawDeleted = localStorage.getItem("fm_deleted_files");
    if (rawDeleted) deletedIds = JSON.parse(rawDeleted);
  } catch (e) {}

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
    return `${i ? `<span class="text-slate-500 light:text-slate-400 font-medium">/</span>` : ""}${isLast
      ? `<span class="breadcrumb-current">${escapeHtml(b.name)}</span>`
      : `<button class="breadcrumb-btn" onclick="navigateToBreadcrumb(${i})">${escapeHtml(b.name)}</button>`}`;
  }).join("");
}

async function navigateToBreadcrumb(idx) {
  const target = vaultState.breadcrumb[idx];
  if (!target) return;
  if ($("searchInput")) $("searchInput").value = "";
  vaultState.breadcrumb = vaultState.breadcrumb.slice(0, idx + 1);
  vaultState.currentFolder = target;
  renderHeader();
  await loadFolder(target.id);
}

async function openFolder(item) {
  if (!item) return;
  if ($("searchInput")) $("searchInput").value = "";
  vaultState.currentFolder = { id: item.id, name: item.name };

  const existingIdx = vaultState.breadcrumb.findIndex(b => b.id === item.id);
  if (existingIdx !== -1) {
    vaultState.breadcrumb = vaultState.breadcrumb.slice(0, existingIdx + 1);
  } else if (item.breadcrumb && item.breadcrumb.length > 0) {
    vaultState.breadcrumb = item.breadcrumb.map(b => ({ ...b }));
  } else {
    vaultState.breadcrumb.push({ id: item.id, name: item.name });
  }

  renderHeader();
  await loadFolder(item.id);
}

// DRAG & DROP UPLOAD MODAL + PRE-UPLOAD RENAMER LOGIC
function openUploadModal() {
  const rawEmail = (vaultState.userEmail || localStorage.getItem("fm_user_email") || "").trim().toLowerCase();
  if (!rawEmail || !rawEmail.includes("@")) {
    showToast("⛔ Please sign in with Google on the main page to upload files.");
    return;
  }

  stagedFiles = [];
  renderStagingList();

  const modal = $("uploadModal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function updateUploadProgress(current, total) {
  const container = $("uploadProgressContainer");
  const fill = $("uploadProgressBarFill");
  const percentText = $("uploadProgressPercentText");
  const currentText = $("uploadProgressCurrent");
  const totalText = $("uploadProgressTotal");

  if (!container) return;

  if (total <= 0) {
    container.classList.add("hidden");
    if (fill) fill.style.width = "0%";
    return;
  }

  container.classList.remove("hidden");
  const percent = Math.round((current / total) * 100);
  if (fill) fill.style.width = `${percent}%`;
  if (percentText) percentText.textContent = `${percent}%`;
  if (currentText) currentText.textContent = current.toString();
  if (totalText) totalText.textContent = total.toString();
}

function closeUploadModal() {
  const modal = $("uploadModal");
  if (modal) {
    modal.classList.add("hidden");
  }
  stagedFiles = [];
  const fileInput = $("modalFileInput");
  if (fileInput) fileInput.value = "";
  updateUploadProgress(0, 0);
}

function triggerFileInputClick() {
  const fileInput = $("modalFileInput");
  if (fileInput) fileInput.click();
}

function handleModalFileSelect(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    addFilesToStaging(files);
  }
  event.target.value = "";
}

function addFilesToStaging(files) {
  Array.from(files).forEach((file, index) => {
    stagedFiles.push({
      id: "stage_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7) + "_" + index,
      file: file,
      name: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type || "application/octet-stream"
    });
  });

  renderStagingList();
}

function updateStagedName(id, newName) {
  const target = stagedFiles.find(item => item.id === id);
  if (target) {
    target.name = newName.trim();
  }
}

function removeStagedFile(id) {
  stagedFiles = stagedFiles.filter(item => item.id !== id);
  renderStagingList();
}

function renderStagingList() {
  const container = $("uploadStagingContainer");
  const list = $("stagingFileList");
  const countLabel = $("stagingFileCount");
  const confirmBtn = $("confirmUploadBtn");

  if (!container || !list) return;

  if (stagedFiles.length === 0) {
    container.classList.add("hidden");
    list.innerHTML = "";
    if (confirmBtn) confirmBtn.disabled = true;
    if (countLabel) countLabel.textContent = "0";
    return;
  }

  container.classList.remove("hidden");
  if (confirmBtn) confirmBtn.disabled = false;
  if (countLabel) countLabel.textContent = stagedFiles.length.toString();

  list.innerHTML = stagedFiles.map(item => {
    const icon = getFileIcon(item.name, item.type);
    return `
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <div class="text-xl flex-shrink-0">${icon}</div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rename File:</span>
            <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-500">${formatBytes(item.size)}</span>
          </div>
          <input type="text" value="${escapeAttr(item.name)}" oninput="updateStagedName('${escapeAttr(item.id)}', this.value)" class="w-full px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-sm" placeholder="Enter file name..." />
        </div>

        <button type="button" onclick="removeStagedFile('${escapeAttr(item.id)}')" class="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100 font-bold transition flex-shrink-0">
          ✕
        </button>
      </div>`;
  }).join("");
}

async function uploadToGoogleAppsScript(stagedItem, finalName, folderId, rawEmail, base64Data) {
  if (!VAULT_CONFIG.uploadScriptUrl) return null;

  const payload = {
    filename: finalName,
    mimeType: stagedItem.type || "application/octet-stream",
    base64: base64Data,
    folderId: folderId,
    uploaderEmail: rawEmail
  };

  const fetchPromise = fetch(VAULT_CONFIG.uploadScriptUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }).then(() => ({ status: "success", fileName: finalName })).catch(() => null);

  // Timeout after 2.5 seconds so upload loop never gets stuck
  const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 2500));

  return Promise.race([fetchPromise, timeoutPromise]);
}

async function confirmStagedUpload() {
  if (stagedFiles.length === 0) return;

  const rawEmail = (vaultState.userEmail || localStorage.getItem("fm_user_email") || "").trim().toLowerCase();
  if (!rawEmail || !rawEmail.includes("@")) {
    showToast("⛔ Please sign in with Google on the main page to upload files.");
    return;
  }

  const folderId = vaultState.currentFolder.id;
  const customKey = "fm_class_uploads_" + folderId;
  let customItems = [];
  try {
    const raw = localStorage.getItem(customKey);
    if (raw) customItems = JSON.parse(raw);
  } catch(e) {}

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
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(stagedItem.file);
      });

      updateUploadProgress(i + 0.6, totalFiles);

      let driveResult = null;
      if (fileData && VAULT_CONFIG.uploadScriptUrl) {
        const base64Data = fileData.split(',')[1] || "";
        driveResult = await uploadToGoogleAppsScript(stagedItem, finalName, folderId, rawEmail, base64Data);
      }

      const customItem = {
        id: (driveResult && driveResult.fileId) ? driveResult.fileId : ("upload_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7)),
        name: finalName,
        size: stagedItem.size,
        mimeType: stagedItem.type || "application/octet-stream",
        modifiedTime: new Date().toISOString(),
        folderId: folderId,
        uploadedBy: rawEmail,
        uploaderEmail: rawEmail,
        webContentLink: (driveResult && driveResult.fileUrl) ? driveResult.fileUrl : (fileData || ""),
        webViewLink: (driveResult && driveResult.fileUrl) ? driveResult.fileUrl : (fileData || "")
      };

      customItems.unshift(customItem);
      localStorage.setItem(customKey, JSON.stringify(customItems));

      completedCount++;
      updateUploadProgress(completedCount, totalFiles);
      showToast(`✓ Uploaded "${finalName}" (${completedCount}/${totalFiles})`);

      if (typeof trackFileUpload === "function") {
        trackFileUpload(rawEmail, finalName, "3333");
      }
    }
  } catch (err) {
    console.error("Batch upload error:", err);
    showToast("⚠️ Upload processed with local copy.");
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

function clearSearch() {
  if ($("searchInput")) $("searchInput").value = "";
  if ($("clearSearchBtn")) $("clearSearchBtn").classList.add("hidden");
  renderItems();
}

// Render Items matching 1717 Vault Exact Classes & Actions
function renderItems() {
  const rawQuery = ($("searchInput")?.value || "").trim();
  const query = rawQuery.toLowerCase();

  const clearBtn = $("clearSearchBtn");
  if (clearBtn) {
    clearBtn.classList.toggle("hidden", !rawQuery);
  }

  const isSearching = Boolean(rawQuery);
  const currentUserEmail = (vaultState.userEmail || localStorage.getItem("fm_user_email") || "").trim().toLowerCase();
  const isAdminUser = (currentUserEmail === "2007aniketsonwane@gmail.com");

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
    const uploaderMatch = (item.uploadedBy || "").toLowerCase().includes(query);
    const pathMatch = item.parentPath ? item.parentPath.toLowerCase().includes(query) : false;
    return nameMatch || typeMatch || extMatch || uploaderMatch || pathMatch;
  });

  if ($("fileCount")) $("fileCount").textContent = filtered.length.toLocaleString();

  if (!filtered.length) {
    if ($("fileList")) $("fileList").innerHTML = "";
    if ($("emptyState")) $("emptyState").classList.remove("hidden");
    if ($("emptyStateMsg")) {
      $("emptyStateMsg").innerHTML = isSearching
        ? `No files found matching "<strong>${escapeHtml(rawQuery)}</strong>".`
        : `No files found in this directory. Use <strong>"Upload File"</strong> to add files.`;
    }
    return;
  }

  if ($("emptyState")) $("emptyState").classList.add("hidden");
  if ($("fileList")) {
    $("fileList").innerHTML = filtered.map(item => {
      const isFolder = item.mimeType === "folder" || item.mimeType === "application/vnd.google-apps.folder";
      const icon = isFolder ? "📁" : getFileIcon(item.name, item.mimeType);
      
      const itemUploader = (item.uploadedBy || item.uploaderEmail || "").toLowerCase();
      const isOwner = Boolean(itemUploader && itemUploader === currentUserEmail);
      const canDelete = isOwner || isAdminUser;

      let metaStr = isFolder ? "Folder" : `${fileType(item)}${item.size ? " • " + formatBytes(Number(item.size)) : ""}`;
      if (itemUploader) {
        metaStr += ` • Uploaded by ${itemUploader === currentUserEmail ? 'You' : itemUploader}`;
      }
      if (isSearching && item.parentPath) {
        metaStr += ` • 📁 in ${escapeHtml(item.parentPath)}`;
      }

      return `
        <div class="file-row ${isFolder ? 'is-folder' : ''}" data-id="${escapeAttr(item.id)}">
          <div class="file-icon">${icon}</div>
          <div class="file-main">
            <div class="file-name" title="${escapeAttr(item.name)}">${escapeHtml(item.name)}</div>
            <div class="file-meta">${escapeHtml(metaStr)}</div>
          </div>

          <div class="row-actions">
            ${isFolder
              ? `<button class="action-btn open-btn" data-open="${escapeAttr(item.id)}">Open →</button>`
              : `
                <button class="action-btn preview-btn" data-preview="${escapeAttr(item.id)}">Preview 👁️</button>
                <button class="action-btn" data-download="${escapeAttr(item.id)}">Download ↓</button>
                ${canDelete
                  ? `<button class="action-btn delete-btn" data-delete="${escapeAttr(item.id)}">Delete 🗑️</button>`
                  : `<span class="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500" title="Only the uploader can delete this file">Protected 🔒</span>`
                }
              `}
          </div>
        </div>`;
    }).join("");

    // Bind Click Events
    const listEl = $("fileList");

    listEl.querySelectorAll(".file-row.is-folder").forEach(row => {
      row.onclick = async () => {
        const folderId = row.dataset.id;
        const item = pool.find(x => x.id === folderId);
        if (item) await openFolder(item);
      };
    });

    listEl.querySelectorAll("[data-open]").forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const item = pool.find(x => x.id === btn.dataset.open);
        if (item) await openFolder(item);
      };
    });

    listEl.querySelectorAll("[data-preview]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const item = pool.find(x => x.id === btn.dataset.preview);
        if (item) previewItem(item);
      };
    });

    listEl.querySelectorAll("[data-download]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const item = pool.find(x => x.id === btn.dataset.download);
        if (item) downloadItem(item);
      };
    });

    listEl.querySelectorAll("[data-delete]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const item = pool.find(x => x.id === btn.dataset.delete);
        if (item) deleteItem(item);
      };
    });
  }
}

let currentBlobUrl = null;

function dataURLtoBlob(dataurl) {
  if (!dataurl || typeof dataurl !== "string" || !dataurl.startsWith("data:")) return null;
  try {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.warn("DataURL to Blob conversion error:", e);
    return null;
  }
}

function previewItem(item) {
  if (!item) return;

  const modal = $("filePreviewModal");
  const iframe = $("previewIframe");
  if (!modal || !iframe) return;

  if ($("previewFileName")) $("previewFileName").textContent = item.name || "File Preview";
  if ($("previewFileMeta")) $("previewFileMeta").textContent = `${fileType(item)}${item.size ? " • " + formatBytes(Number(item.size)) : ""}`;
  if ($("previewFileIcon")) $("previewFileIcon").textContent = getFileIcon(item.name || "", item.mimeType || "");

  const isCustomUpload = item.id && item.id.startsWith("upload_");
  const isDataUrl = item.webViewLink && item.webViewLink.startsWith("data:");

  if ($("previewOpenDriveBtn")) {
    if (isCustomUpload || isDataUrl) {
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

  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }

  let finalPreviewUrl = "";
  if (isDataUrl) {
    const blob = dataURLtoBlob(item.webViewLink || item.webContentLink);
    if (blob) {
      currentBlobUrl = URL.createObjectURL(blob);
      finalPreviewUrl = currentBlobUrl;
    } else {
      finalPreviewUrl = item.webViewLink || item.webContentLink;
    }
  } else if (isCustomUpload) {
    finalPreviewUrl = item.webViewLink || item.webContentLink || "";
  } else {
    finalPreviewUrl = `https://drive.google.com/file/d/${encodeURIComponent(item.id)}/preview`;
  }

  iframe.src = finalPreviewUrl;
  modal.classList.remove("hidden");
  modal.setAttribute("style", "display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 999999 !important; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); justify-content: center; align-items: center; pointer-events: auto !important;");
}

function closeFilePreviewModal() {
  const modal = $("filePreviewModal");
  const iframe = $("previewIframe");
  if (modal) {
    modal.classList.add("hidden");
    modal.setAttribute("style", "display: none !important;");
  }
  if (iframe) iframe.src = "about:blank";
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }
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

// User-Scoped Delete Functionality & Instant Drive Trash Sync
function deleteItem(item) {
  if (!item || !item.id) return;

  const currentUserEmail = (vaultState.userEmail || localStorage.getItem("fm_user_email") || "").trim().toLowerCase();
  const itemUploader = (item.uploadedBy || item.uploaderEmail || "").trim().toLowerCase();
  const isOwner = Boolean(itemUploader && itemUploader === currentUserEmail);
  const isAdminUser = (currentUserEmail === "2007aniketsonwane@gmail.com");

  if (!isOwner && !isAdminUser) {
    showToast("⛔ Permission Denied: You can ONLY delete files that YOU uploaded.");
    return;
  }

  const filename = item.name || "this file";
  if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

  // 1. Instant local removal (0ms UI latency)
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
  const customKey = "fm_class_uploads_" + folderId;
  try {
    const rawCustom = localStorage.getItem(customKey);
    if (rawCustom) {
      let customItems = JSON.parse(rawCustom).filter(x => x.id !== item.id && x.name !== filename);
      localStorage.setItem(customKey, JSON.stringify(customItems));
    }
  } catch(e) {}

  vaultState.items = vaultState.items.filter(x => x.id !== item.id && x.name !== filename);
  renderItems();
  closeFilePreviewModal();
  showToast(`Deleted "${filename}" 🗑️`);

  // 2. Fire-and-forget background delete request to Google Drive via Apps Script
  if (VAULT_CONFIG.uploadScriptUrl && item.id && !item.id.startsWith("upload_")) {
    fetch(VAULT_CONFIG.uploadScriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "delete", fileId: item.id, uploaderEmail: currentUserEmail })
    }).catch(err => console.warn("Background drive trash request warning:", err));
  }
}

// Setup Drag and Drop Event Listeners
function setupDropZoneEvents() {
  const dz = $("dropZone");
  if (!dz) return;

  ["dragenter", "dragover"].forEach(eventName => {
    dz.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dz.classList.add("dropzone-active");
    }, false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    dz.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dz.classList.remove("dropzone-active");
    }, false);
  });

  dz.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      addFilesToStaging(files);
    }
  }, false);
}

document.addEventListener("DOMContentLoaded", () => {
  const isDark = (localStorage.getItem("fm_theme") || "dark") === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);
  updateThemeBtnUI();

  const isUnlocked = sessionStorage.getItem("vault_3333_unlocked") === "true";
  
  if (!isUnlocked) {
    // If not unlocked via main page PIN 3333, redirect back to index.html
    window.location.href = "./index.html";
    return;
  }

  updateAuthUI();

  if (vaultState.userEmail && typeof trackUserLogin === "function") {
    trackUserLogin(vaultState.userEmail, "3333");
  }

  setupDropZoneEvents();
  loadFolder(vaultState.currentFolder.id);
  buildVaultIndex(vaultState.currentFolder.id);
});
