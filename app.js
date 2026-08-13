/* OBFUSCATED SECURITY CONFIGURATION */
const _SEC_STORE = {
  k: "QUl6YVN5QTdLcU1vMU9XMFFzTC0xMy1TOWZZLVI5aXlhRlNkTDdJ", // API Key
  r: "MXlMUjBrZGFUTWk3SGJEMS1vQW8xQ205bjRieEFEVWRR", // Default Folder ID (1717)
  a: "OTk5OQ==", // Admin PIN 9999
  p: "MTcxNw==", // 1717 PIN
  e: "Ymh1cGkuYW5pa2V0QGdhbWlsLmNvbQ==" // Admin Email: Bhupi.aniket@gamil.com
};

function _secDec(b64Str) {
  try {
    return atob(b64Str);
  } catch (e) {
    return "";
  }
}

const DEFAULT_CONFIG = {
  apiKey: _secDec(_SEC_STORE.k),
  pinFolders: {
    "1717": {
      id: _secDec(_SEC_STORE.r),
      name: "Academics"
    }
  }
};

function getActiveConfig() {
  return DEFAULT_CONFIG;
}

let CONFIG = getActiveConfig();

const state = {
  pin: "",
  userEmail: "",
  root: null,
  currentFolder: null,
  breadcrumb: [],
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

function updatePinDots() {
  const dotsContainer = $("pinDots");
  if (!dotsContainer) return;
  [...dotsContainer.children].forEach((dot, i) => {
    dot.classList.toggle("filled", i < state.pin.length);
  });
}

function resetPin() {
  state.pin = "";
  updatePinDots();
}

function submitPin() {
  CONFIG = getActiveConfig();

  const emailInput = $("gmailInput");
  const rawEmail = emailInput ? emailInput.value.trim().toLowerCase() : "";

  if (!rawEmail || !rawEmail.includes("@") || !rawEmail.includes(".")) {
    $("pinMessage").textContent = "Please enter a valid email address.";
    emailInput?.focus();
    return;
  }

  const entry = state.pin;
  const adminEmail = _secDec(_SEC_STORE.e).toLowerCase(); // Bhupi.aniket@gamil.com
  const adminPin = _secDec(_SEC_STORE.a); // 9999
  const isAdminUser = (rawEmail === adminEmail || rawEmail === "bhupi.aniket@gmail.com");

  // Rule 1: Only Bhupi.aniket@gamil.com can access the Admin Dashboard (PIN 9999)
  if (entry === adminPin || entry === "9999") {
    if (!isAdminUser) {
      $("pinMessage").textContent = "⛔ Access Denied: Only Super Admin can access the Admin Dashboard.";
      const card = document.querySelector(".pin-card");
      if (card) {
        card.classList.add("shake");
        setTimeout(() => card.classList.remove("shake"), 380);
      }
      resetPin();
      return;
    }

    localStorage.setItem("fm_user_email", rawEmail);
    state.userEmail = rawEmail;
    $("pinMessage").textContent = "";

    if (typeof trackUserLogin === "function") trackUserLogin(rawEmail, "ADMIN (9999)");
    if (typeof adminState !== "undefined") adminState.isAdminLoggedIn = true;

    $("pinScreen").classList.add("hidden");
    $("managerScreen").classList.add("hidden");
    $("adminScreen").classList.remove("hidden");

    if (typeof renderAdminDashboard === "function") renderAdminDashboard();
    if (typeof showToast === "function") showToast(`Welcome Super Admin (${rawEmail})!`);
    resetPin();
    return;
  }

  // Get target folder configuration
  const pinConfig = (typeof adminState !== "undefined" && adminState.pinConfig) ? adminState.pinConfig : CONFIG.pinFolders;
  const targetFolder = pinConfig[entry] || CONFIG.pinFolders[entry];

  // Standard PIN verification
  if (state.pin.length !== 4 || !targetFolder) {
    $("pinMessage").textContent = "Incorrect PIN. Please try again.";
    const card = document.querySelector(".pin-card");
    if (card) {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 380);
    }
    resetPin();
    return;
  }

  // Rule 2: 1717 PIN code can ONLY be accessed by @sbjit.edu.in emails (unless user is Admin)
  if (entry === "1717" && !isAdminUser) {
    if (!rawEmail.endsWith("@sbjit.edu.in")) {
      $("pinMessage").textContent = "⛔ Access Denied: Vault 1717 is restricted strictly to selected user.";
      const card = document.querySelector(".pin-card");
      if (card) {
        card.classList.add("shake");
        setTimeout(() => card.classList.remove("shake"), 380);
      }
      resetPin();
      return;
    }
  }

  // Rule 3: Check lock folder status (unless user is Admin)
  if (targetFolder.isLocked && !isAdminUser) {
    $("pinMessage").textContent = `🔒 Vault (${entry}) is currently locked by Admin.`;
    const card = document.querySelector(".pin-card");
    if (card) {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 380);
    }
    resetPin();
    return;
  }

  // Rule 4: Admin can access any PIN code!
  localStorage.setItem("fm_user_email", rawEmail);
  state.userEmail = rawEmail;
  if (typeof trackUserLogin === "function") trackUserLogin(rawEmail, entry);

  $("pinMessage").textContent = "";
  openManager(entry, targetFolder);
}

async function openManager(pin, targetFolder) {
  CONFIG = getActiveConfig();
  state.pin = pin;
  state.root = targetFolder || CONFIG.pinFolders[pin] || (adminState?.pinConfig ? adminState.pinConfig[pin] : null);

  if (!state.root) {
    showToast("Folder mapping not found for this PIN.");
    return;
  }

  if ($("searchInput")) $("searchInput").value = "";
  state.currentFolder = state.root;
  state.breadcrumb = [{ id: state.root.id, name: state.root.name, root: true }];
  state.vaultIndex = [];

  $("pinScreen").classList.add("hidden");
  $("adminScreen").classList.add("hidden");
  $("managerScreen").classList.remove("hidden");

  $("headerAction").innerHTML = `
    <div class="flex items-center gap-2">
      <span class="status-badge">● Live API</span>
      <button id="logoutBtn" class="logout-btn">Logout</button>
    </div>`;
  $("logoutBtn").onclick = logout;

  renderHeader();
  await loadFolder(state.root.id);
  buildVaultIndex(state.root.id);
}

function logout() {
  state.pin = "";
  state.root = null;
  state.currentFolder = null;
  state.items = [];
  state.breadcrumb = [];
  if ($("searchInput")) $("searchInput").value = "";
  $("managerScreen").classList.add("hidden");
  $("pinScreen").classList.remove("hidden");
  $("headerAction").innerHTML = `<span class="status-badge">🔐 Sealed Vault</span>`;
  closeSettingsModal();
  closeContactModal();
  resetPin();
}

function renderHeader() {
  if (!state.currentFolder) return;
  $("folderTitle").textContent = state.currentFolder.name;
  if ($("userEmailBadge")) {
    $("userEmailBadge").textContent = state.userEmail ? `Logged in as ${state.userEmail}` : "";
  }
  renderBreadcrumb();
}

function renderBreadcrumb() {
  const box = $("breadcrumb");
  if (!box) return;
  box.innerHTML = state.breadcrumb.map((b, i) => {
    const isLast = i === state.breadcrumb.length - 1;
    return `${i ? `<span class="text-slate-500 light:text-slate-400">/</span>` : ""}${isLast
      ? `<span class="breadcrumb-current">${escapeHtml(b.name)}</span>`
      : `<button class="breadcrumb-btn" data-breadcrumb="${i}">${escapeHtml(b.name)}</button>`}`;
  }).join("");

  box.querySelectorAll("[data-breadcrumb]").forEach(btn => {
    btn.onclick = async () => {
      const idx = Number(btn.dataset.breadcrumb);
      const target = state.breadcrumb[idx];
      if ($("searchInput")) $("searchInput").value = "";
      state.breadcrumb = state.breadcrumb.slice(0, idx + 1);
      state.currentFolder = target;
      renderHeader();
      await loadFolder(target.id);
    };
  });
}

async function openFolder(item) {
  if (!item) return;
  if ($("searchInput")) $("searchInput").value = "";

  state.currentFolder = { id: item.id, name: item.name };

  const existingIdx = state.breadcrumb.findIndex(b => b.id === item.id);
  if (existingIdx !== -1) {
    state.breadcrumb = state.breadcrumb.slice(0, existingIdx + 1);
  } else if (item.breadcrumb && item.breadcrumb.length > 0) {
    state.breadcrumb = item.breadcrumb.map(b => ({ ...b }));
  } else {
    state.breadcrumb.push({ id: item.id, name: item.name });
  }

  renderHeader();
  await loadFolder(item.id);
}

async function loadFolder(folderId) {
  state.lastError = null;
  $("loading").classList.remove("hidden");
  $("fileList").innerHTML = "";
  $("emptyState").classList.add("hidden");

  try {
    state.items = await getDriveItems(folderId);
    renderItems();
  } catch (error) {
    console.error("Folder Load Error:", error);
    state.lastError = error.message || "Could not load folder.";
    state.items = [];
    showToast(state.lastError);
    renderItems();
  } finally {
    $("loading").classList.add("hidden");
  }
}

async function getDriveItems(folderId) {
  if (!CONFIG.apiKey || CONFIG.apiKey.trim() === "") {
    throw new Error("Google Drive API key is missing.");
  }
  if (!folderId || folderId === "YOUR_GOOGLE_DRIVE_FOLDER_ID") {
    throw new Error("Invalid Folder ID. Please check your folder configuration.");
  }
  const q = `'${folderId}' in parents and trashed = false`;
  const fields = "files(id,name,mimeType,size,modifiedTime,webContentLink,webViewLink,thumbnailLink,parents)";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&pageSize=1000&orderBy=name&fields=${encodeURIComponent(fields)}&key=${encodeURIComponent(CONFIG.apiKey.trim())}`;

  let res;
  try {
    res = await fetch(url);
  } catch (netErr) {
    throw new Error(`Connection Error: Failed to fetch from Google Drive API. Requests may be blocked by HTTP Referrer restrictions in Google Cloud Console.`);
  }

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const errObj = errorJson.error || {};
    const code = errObj.code || res.status;
    const msg = errObj.message || res.statusText || "";

    if (code === 400) {
      throw new Error(`API Error (400): ${msg || "Invalid API key or request parameters."}`);
    } else if (code === 403) {
      if (msg.includes("referer") || msg.includes("referrer") || msg.includes("blocked")) {
        throw new Error(`API Key HTTP Referrer Blocked: Requests from your domain are blocked in Google Cloud Console.`);
      } else {
        throw new Error(`API Error (403): ${msg.includes("API key") ? "Google Drive API not enabled or API key restricted." : msg}`);
      }
    } else if (code === 404) {
      throw new Error(`Drive Folder Not Found (404). Ensure folder sharing is set to "Anyone with link".`);
    } else {
      throw new Error(`Google Drive API Error (${code}): ${msg}`);
    }
  }

  const data = await res.json();
  const items = (data.files || []).map(f => ({ ...f, folderId }));

  // Sort folders first, then files alphabetically by name
  items.sort((a, b) => {
    const aIsFolder = a.mimeType === "folder" || a.mimeType === "application/vnd.google-apps.folder";
    const bIsFolder = b.mimeType === "folder" || b.mimeType === "application/vnd.google-apps.folder";
    if (aIsFolder && !bIsFolder) return -1;
    if (!aIsFolder && bIsFolder) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });

  return items;
}

async function buildVaultIndex(rootId) {
  state.vaultIndex = [];
  const rootBreadcrumb = (state.breadcrumb && state.breadcrumb.length > 0)
    ? state.breadcrumb.map(b => ({ ...b }))
    : [{ id: state.root.id, name: state.root.name, root: true }];

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
        state.vaultIndex.push(itemWithPath);

        if (isFolder && !visited.has(file.id)) {
          const nextPath = current.path ? `${current.path} / ${file.name}` : file.name;
          queue.push({ id: file.id, path: nextPath, breadcrumb: fileBreadcrumb });
        }
      }
    } catch (e) {
      console.warn("Indexing step warning:", e);
    }
  }

  if ($("searchInput") && $("searchInput").value.trim() !== "") {
    renderItems();
  }
}

function renderItems() {
  const rawQuery = ($("searchInput")?.value || "").trim();
  const query = rawQuery.toLowerCase();

  const clearBtn = $("clearSearchBtn");
  if (clearBtn) {
    clearBtn.classList.toggle("hidden", !rawQuery);
  }

  const isSearching = Boolean(rawQuery);
  let pool = state.items;

  if (isSearching) {
    const combined = [...state.items, ...(state.vaultIndex || [])];
    const uniqueMap = new Map();
    combined.forEach(item => uniqueMap.set(item.id, item));
    pool = Array.from(uniqueMap.values());
  }

  const filtered = !isSearching ? pool : pool.filter(item => {
    if (!item.name) return false;
    const nameMatch = item.name.toLowerCase().includes(query);
    const typeMatch = fileType(item).toLowerCase().includes(query);
    const extMatch = item.name.split(".").pop().toLowerCase() === query;
    const pathMatch = item.parentPath ? item.parentPath.toLowerCase().includes(query) : false;
    return nameMatch || typeMatch || extMatch || pathMatch;
  });

  $("fileCount").textContent = filtered.length.toLocaleString();

  if (state.lastError) {
    $("fileList").innerHTML = "";
    const errStr = state.lastError.toLowerCase();
    const isReferrerOrNet = errStr.includes("referrer") || errStr.includes("blocked") || errStr.includes("connection") || errStr.includes("fetch") || errStr.includes("403");
    const is404 = errStr.includes("404") || errStr.includes("not found");
    $("emptyStateMsg").innerHTML = `
      <div class="max-w-xl mx-auto p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 animate-slide-up text-left space-y-3">
        <div class="flex items-center gap-2.5 font-black text-amber-400 text-base">
          <span class="text-xl">⚠️</span> Google Drive Connection Issue
        </div>
        <p class="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed">${escapeHtml(state.lastError)}</p>
        <div class="pt-2 text-xs text-slate-300 space-y-2 border-t border-amber-500/20">
          <p class="font-bold text-amber-300">How to fix this issue:</p>
          ${isReferrerOrNet ? `
            <ol class="list-decimal list-inside space-y-1.5 text-slate-300">
              <li>Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" class="underline text-indigo-400 font-bold hover:text-indigo-300">Google Cloud Console > Credentials</a>.</li>
              <li>Click your API Key to edit it.</li>
              <li>Under <strong>Website restrictions</strong> (HTTP referrers), add your site URL domain patterns:
                <code class="block my-1.5 p-2 rounded bg-slate-900 border border-slate-700 text-emerald-400 text-[11px] font-mono select-all">http://localhost/*
http://127.0.0.1/*
http://localhost:5500/*
http://127.0.0.1:5500/*
https://*.github.io/*</code>
              </li>
              <li>Click <strong>Save</strong> and wait 1-2 minutes for Google to update permissions, then refresh this page.</li>
            </ol>
          ` : is404 ? `
            <ol class="list-decimal list-inside space-y-1 text-slate-300">
              <li>Open your folder in <a href="https://drive.google.com" target="_blank" rel="noopener" class="underline text-indigo-400 font-bold hover:text-indigo-300">Google Drive</a>.</li>
              <li>Right-click the folder > <strong>Share</strong> > <strong>Share</strong>.</li>
              <li>Change access from <em>Restricted</em> to <strong>"Anyone with the link can view"</strong>.</li>
              <li>Click <strong>Done</strong> and refresh this page.</li>
            </ol>
          ` : `
            <p class="text-slate-300">Verify that the Google Drive API is enabled in Google Cloud Console and the folder is shared publicly.</p>
          `}
        </div>
      </div>
    `;
    $("emptyState").classList.remove("hidden");
    return;
  }

  if (!filtered.length) {
    $("fileList").innerHTML = "";
    $("emptyStateMsg").textContent = isSearching
      ? `No files found matching "${escapeHtml(rawQuery)}".`
      : "No files found in this directory.";
    $("emptyState").classList.remove("hidden");
    return;
  }

  $("emptyState").classList.add("hidden");
  $("fileList").innerHTML = filtered.map(item => {
    const isFolder = item.mimeType === "folder" || item.mimeType === "application/vnd.google-apps.folder";
    const icon = isFolder ? "📁" : getFileIcon(item.name, item.mimeType);
    let meta = isFolder ? "Folder" : `${fileType(item)}${item.size ? " • " + formatBytes(Number(item.size)) : ""}`;
    if (isSearching && item.parentPath) {
      meta += ` • 📁 in ${escapeHtml(item.parentPath)}`;
    }

    return `
      <div class="file-row ${isFolder ? 'is-folder' : ''}" data-id="${escapeAttr(item.id)}">
        <div class="file-icon">${icon}</div>
        <div class="file-main">
          <div class="file-name" title="${escapeAttr(item.name)}">${escapeHtml(item.name)}</div>
          <div class="file-meta">${escapeHtml(meta)}</div>
        </div>
        <div class="row-actions">
          ${isFolder
            ? `<button class="action-btn open-btn" data-open="${escapeAttr(item.id)}">Open →</button>`
            : `
              <button class="action-btn preview-btn" data-preview="${escapeAttr(item.id)}">Preview 👁️</button>
              <button class="action-btn" data-download="${escapeAttr(item.id)}">Download ↓</button>
            `}
        </div>
      </div>`;
  }).join("");

  // Entire row click for folders
  $("fileList").querySelectorAll(".file-row.is-folder").forEach(row => {
    row.onclick = async () => {
      const folderId = row.dataset.id;
      const item = pool.find(x => x.id === folderId);
      if (item) await openFolder(item);
    };
  });

  // Folder open buttons
  $("fileList").querySelectorAll("[data-open]").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const item = pool.find(x => x.id === btn.dataset.open);
      if (item) await openFolder(item);
    };
  });

  // Preview buttons
  $("fileList").querySelectorAll("[data-preview]").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const item = pool.find(x => x.id === btn.dataset.preview);
      if (item) previewItem(item);
    };
  });

  // Download buttons
  $("fileList").querySelectorAll("[data-download]").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const item = pool.find(x => x.id === btn.dataset.download);
      if (item) downloadItem(item);
    };
  });
}

function previewItem(item) {
  const url = item.webViewLink || `https://drive.google.com/file/d/${encodeURIComponent(item.id)}/view`;
  window.open(url, "_blank", "noopener");
}

function downloadItem(item) {
  const url = item.webContentLink || getBrowserDownloadUrl(item);
  if (typeof trackUserDownload === "function") {
    trackUserDownload(state.userEmail, item.name);
  }
  showToast(`Downloading "${item.name}"...`);
  window.open(url, "_blank", "noopener");
}

function getBrowserDownloadUrl(item) {
  if (item.mimeType === "application/vnd.google-apps.document") {
    return `https://www.googleapis.com/drive/v3/files/${item.id}/export?mimeType=application/pdf&key=${encodeURIComponent(CONFIG.apiKey)}`;
  }
  if (item.mimeType === "application/vnd.google-apps.spreadsheet") {
    return `https://www.googleapis.com/drive/v3/files/${item.id}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet&key=${encodeURIComponent(CONFIG.apiKey)}`;
  }
  if (item.mimeType === "application/vnd.google-apps.presentation") {
    return `https://www.googleapis.com/drive/v3/files/${item.id}/export?mimeType=application/vnd.openxmlformats-officedocument.presentationml.presentation&key=${encodeURIComponent(CONFIG.apiKey)}`;
  }
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(item.id)}`;
}

function getFileIcon(name, mime) {
  const ext = name.split(".").pop().toLowerCase();
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
  if (m.includes("spreadsheet")) return "Spreadsheet";
  if (m.includes("presentation")) return "Presentation";
  if (m.includes("document")) return "Document";
  return (item.name.split(".").pop() || "File").toUpperCase();
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function setActiveNavCard(navName) {
  document.querySelectorAll("[data-nav]").forEach(btn => {
    const isActive = btn.dataset.nav === navName;
    btn.classList.toggle("nav-active", isActive);
  });
}

/* SUBJECT FOLDER PARSER & FAST ENTIRE VAULT SEARCH */
async function searchEntireVaultForSubjects(rootId) {
  const subjectMap = new Map();

  function parseItem(item) {
    if (!item || !item.name) return;
    const match = item.name.match(/SEM[_-]?(\d+)[_-]Courses[_-](.+)/i);
    if (match) {
      const semNum = match[1];
      const subjectName = match[2].trim().replace(/\.[^/.]+$/, "");
      const folderName = `SEM_${semNum}-Courses-${subjectName}`;
      const folderKey = folderName.toLowerCase();

      if (!subjectMap.has(folderKey)) {
        const isFolder = item.mimeType === "folder" || item.mimeType === "application/vnd.google-apps.folder";
        subjectMap.set(folderKey, {
          id: item.id,
          name: folderName,
          sem: semNum,
          subject: subjectName,
          isFolder: isFolder,
          originalItem: item,
          items: [item]
        });
      } else {
        subjectMap.get(folderKey).items.push(item);
      }
    }
  }

  // 1. Instantly parse in-memory index & current folder items (0ms)
  if (state.vaultIndex && state.vaultIndex.length > 0) {
    state.vaultIndex.forEach(parseItem);
  }
  if (state.items && state.items.length > 0) {
    state.items.forEach(parseItem);
  }

  // 2. Perform ONE fast single-request Drive API query for items containing 'Courses'
  try {
    const q = `name contains 'Courses' and trashed = false`;
    const fields = "files(id,name,mimeType,size,modifiedTime,webContentLink,webViewLink,parents)";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&pageSize=500&fields=${encodeURIComponent(fields)}&key=${encodeURIComponent(CONFIG.apiKey.trim())}`;
    
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      (data.files || []).forEach(parseItem);
    }
  } catch (e) {
    console.warn("Fast Drive API subject search notice:", e);
  }

  return Array.from(subjectMap.values());
}

async function renderSubjectView() {
  if ($("searchInput")) $("searchInput").value = "";
  if ($("folderTitle")) $("folderTitle").textContent = "Subject Folders";

  $("loading").classList.remove("hidden");
  $("fileList").innerHTML = "";
  $("emptyState").classList.add("hidden");

  try {
    const rootId = state.root ? state.root.id : null;
    const subjects = await searchEntireVaultForSubjects(rootId);

    $("fileCount").textContent = subjects.length.toLocaleString();

    if (subjects.length === 0) {
      $("fileList").innerHTML = "";
      $("emptyStateMsg").textContent = "No subject folders found matching pattern SEM_(sem number)-Courses-(subject Name) across the entire directory.";
      $("emptyState").classList.remove("hidden");
      return;
    }

    $("emptyState").classList.add("hidden");
    renderSubjectList(subjects.map(s => ({
      id: s.id,
      name: s.name,
      meta: `Semester ${s.sem} Course • ${s.items.length} file(s)`,
      subjectObj: s
    })));

    showToast(`Found ${subjects.length} Subject Folders across entire vault.`);
  } catch (err) {
    console.error("Subject search error:", err);
    showToast("Could not retrieve subject folders.");
  } finally {
    $("loading").classList.add("hidden");
  }
}

function renderSubjectList(subjectItems) {
  $("fileList").innerHTML = subjectItems.map((item, idx) => `
    <div class="file-row is-subject-folder" data-subject-idx="${idx}">
      <div class="file-icon">📚</div>
      <div class="file-main">
        <div class="file-name">${escapeHtml(item.name)}</div>
        <div class="file-meta">${escapeHtml(item.meta)}</div>
      </div>
      <div class="row-actions">
        <button class="action-btn open-btn" data-open-subject="${idx}">Open Subject →</button>
      </div>
    </div>
  `).join("");

  $("fileList").querySelectorAll(".file-row.is-subject-folder").forEach(row => {
    row.onclick = async () => {
      const idx = Number(row.dataset.subjectIdx);
      const sObj = subjectItems[idx];
      await openSubjectCourse(sObj);
    };
  });

  $("fileList").querySelectorAll("[data-open-subject]").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.openSubject);
      const sObj = subjectItems[idx];
      await openSubjectCourse(sObj);
    };
  });
}

async function openSubjectCourse(sObj) {
  if (!sObj) return;
  if (sObj.subjectObj && sObj.subjectObj.originalItem) {
    if (sObj.subjectObj.isFolder) {
      await openFolder(sObj.subjectObj.originalItem);
    } else {
      if ($("searchInput")) $("searchInput").value = sObj.subjectObj.name;
      renderItems();
    }
  } else if (sObj.originalItem) {
    await openFolder(sObj.originalItem);
  }
}

/* DATE FORMATTING HELPERS (DD/MM/YYYY) */
function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return "";
  const str = String(dateStr).trim();
  if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(str)) return str.replace(/-/g, "/");
  const parts = str.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  }
  const dt = new Date(str);
  if (!isNaN(dt.getTime())) {
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const year = dt.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return str;
}

function parseDateObj(dateStr) {
  if (!dateStr) return new Date(0);
  const str = String(dateStr).trim();
  if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(str)) {
    const parts = str.split(/[\/\-]/);
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  const dt = new Date(str);
  return isNaN(dt.getTime()) ? new Date(0) : dt;
}

/* EXAM DATES & DATESHEET MANAGEMENT */
const DEFAULT_EXAMS = [
  { id: "e1", sem: "1", title: "Mid-Semester Mathematics Exam", date: "15/09/2026", time: "10:00 AM - 12:00 PM", room: "Hall A-101", subject: "MATH101" },
  { id: "e2", sem: "1", title: "Physics Lab Viva & Practical", date: "18/09/2026", time: "02:00 PM - 04:00 PM", room: "Physics Lab 2", subject: "PHY102" },
  { id: "e3", sem: "2", title: "End-Sem Data Structures Exam", date: "05/10/2026", time: "09:30 AM - 12:30 PM", room: "Auditorium", subject: "CS201" },
  { id: "e4", sem: "3", title: "Operating Systems Theory Exam", date: "12/10/2026", time: "01:30 PM - 04:30 PM", room: "Hall B-204", subject: "CS301" }
];

function getStoredExams() {
  try {
    const raw = localStorage.getItem("fm_exam_dates");
    return raw ? JSON.parse(raw) : DEFAULT_EXAMS;
  } catch (e) {
    return DEFAULT_EXAMS;
  }
}

async function saveStoredExams(exams) {
  localStorage.setItem("fm_exam_dates", JSON.stringify(exams));
  if (typeof saveSharedExams === "function") return await saveSharedExams(exams);
  return false;
}

let activeExamsSem = "all";

function renderExamsView(semFilter = activeExamsSem, skipSync = false) {
  activeExamsSem = semFilter;
  if (!skipSync && typeof refreshSharedExams === "function" && sharedDataConfigured()) {
    refreshSharedExams();
  }
  if ($("searchInput")) $("searchInput").value = "";
  if ($("folderTitle")) $("folderTitle").textContent = "Exam Dates";

  $("emptyState").classList.add("hidden");
  $("loading").classList.add("hidden");

  const exams = getStoredExams();
  let filteredExams = semFilter === "all" ? exams : exams.filter(e => String(e.sem) === String(semFilter));
  
  // Sort exams by date: nearest to oldest
  filteredExams.sort((a, b) => {
    const dA = parseDateObj(a.date).getTime();
    const dB = parseDateObj(b.date).getTime();
    return dA - dB;
  });

  const isAdmin = typeof adminState !== "undefined" && adminState.isAdminLoggedIn;

  $("fileCount").textContent = filteredExams.length.toLocaleString();

  const sems = ["all", "1", "2", "3", "4", "5", "6", "7", "8"];

  const semTabsHtml = `
    <div class="mb-5 p-3.5 glass rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2.5">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Filter Semester:</span>
        ${isAdmin ? `
          <button id="addExamBtn" class="px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md hover:from-amber-400 hover:to-orange-400 transition">
            + Add Exam Date
          </button>` : ''}
      </div>
      <div class="flex flex-wrap items-center gap-2">
        ${sems.map(s => `
          <button class="exam-sem-btn px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition ${String(s) === String(activeExamsSem) ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700'}" data-sem="${s}">
            ${s === "all" ? "All Semesters" : "Sem " + s}
          </button>
        `).join("")}
      </div>
    </div>
  `;

  if (filteredExams.length === 0) {
    $("fileList").innerHTML = semTabsHtml + `
      <div class="p-8 text-center glass rounded-2xl">
        <p class="text-sm font-extrabold text-slate-600 dark:text-slate-400">No exam dates recorded for ${semFilter === "all" ? "any semester" : "Semester " + semFilter}.</p>
        ${isAdmin ? '<p class="mt-1 text-xs text-slate-400">Click "+ Add Exam Date" to add upcoming datesheet entries!</p>' : ''}
      </div>`;
    wireExamEvents();
    return;
  }

  const cardsHtml = filteredExams.map(ex => `
    <div class="file-row border-l-4 border-l-amber-500 cursor-pointer transition hover:scale-[1.005]" onclick="showExamDetail('${ex.id}')">
      <div class="file-icon bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black">📅</div>
      <div class="file-main">
        <div class="flex items-center gap-2">
          <div class="file-name">${escapeHtml(ex.title)}</div>
          <span class="px-2 py-0.5 text-[10px] font-black rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">Sem ${escapeHtml(ex.sem)}</span>
        </div>
        <div class="file-meta">
          📅 ${escapeHtml(formatDateDDMMYYYY(ex.date))} • ⏰ ${escapeHtml(ex.time)} • 📍 ${escapeHtml(ex.room || "Main Hall")} • 📘 ${escapeHtml(ex.subject || "Course")}
        </div>
      </div>
      ${isAdmin ? `
        <div class="row-actions" onclick="event.stopPropagation()">
          <button class="action-btn text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40" onclick="deleteExamDate('${ex.id}')">Delete 🗑️</button>
        </div>` : ''}
    </div>
  `).join("");

  $("fileList").innerHTML = semTabsHtml + cardsHtml;
  wireExamEvents();
}

function wireExamEvents() {
  document.querySelectorAll(".exam-sem-btn").forEach(btn => {
    btn.onclick = () => renderExamsView(btn.dataset.sem);
  });

  const addBtn = $("addExamBtn");
  if (addBtn) {
    addBtn.onclick = () => promptAddExam();
  }
}

async function promptAddExam() {
  const title = prompt("Enter Exam Title (e.g. End-Sem Physics Exam):");
  if (!title) return;
  const sem = prompt("Enter Semester Number (1-8):", activeExamsSem === "all" ? "1" : activeExamsSem);
  if (!sem) return;
  const date = prompt("Enter Date (e.g. 2026-10-15 or Oct 15):", "2026-10-15");
  if (!date) return;
  const time = prompt("Enter Exam Time Slot:", "10:00 AM - 01:00 PM");
  const room = prompt("Enter Exam Hall / Room Number:", "Hall A-101");
  const subject = prompt("Enter Subject Code / Name:", "PHY101");

  const exams = getStoredExams();
  exams.push({
    id: "e_" + Date.now(),
    sem: sem.trim(),
    title: title.trim(),
    date: date.trim(),
    time: time ? time.trim() : "10:00 AM",
    room: room ? room.trim() : "TBA",
    subject: subject ? subject.trim() : "Subject"
  });

  await saveStoredExams(exams);
  showToast("Added new exam date entry!");
  renderExamsView(sem.trim(), true);
}

async function deleteExamDate(id) {
  let exams = getStoredExams();
  exams = exams.filter(e => String(e.id) !== String(id));
  await saveStoredExams(exams);
  showToast("Deleted exam entry.");
  renderExamsView(activeExamsSem, true);
}
window.deleteExamDate = deleteExamDate;

/* SEMESTER-WISE WEEKLY TIMETABLE MANAGEMENT */
const DEFAULT_TIMETABLE = {
  "1": {
    "Monday": [
      { id: "t1", time: "09:00 AM - 10:00 AM", subject: "Mathematics-1 (M-1)", room: "LH-101", faculty: "Dr. A. Sharma" },
      { id: "t2", time: "10:00 AM - 11:00 AM", subject: "Physics-1", room: "LH-102", faculty: "Prof. R. Verma" },
      { id: "t3", time: "11:15 AM - 01:15 PM", subject: "Computer Fundamentals Lab", room: "Lab-3", faculty: "Prof. K. Singh" }
    ],
    "Tuesday": [
      { id: "t5", time: "09:00 AM - 10:00 AM", subject: "Basic Electrical Eng.", room: "LH-103", faculty: "Dr. P. Gupta" },
      { id: "t6", time: "10:00 AM - 12:00 PM", subject: "Physics Lab", room: "Phy-Lab", faculty: "Prof. R. Verma" }
    ],
    "Wednesday": [
      { id: "t8", time: "09:00 AM - 11:00 AM", subject: "Engineering Graphics", room: "Drawing Hall", faculty: "Prof. M. Joshi" },
      { id: "t9", time: "11:15 AM - 12:15 PM", subject: "Mathematics-1 (M-1)", room: "LH-101", faculty: "Dr. A. Sharma" }
    ],
    "Thursday": [
      { id: "t10", time: "09:00 AM - 10:00 AM", subject: "Physics-1", room: "LH-102", faculty: "Prof. R. Verma" },
      { id: "t11", time: "10:00 AM - 11:00 AM", subject: "Basic Electrical Eng.", room: "LH-103", faculty: "Dr. P. Gupta" }
    ],
    "Friday": [
      { id: "t12", time: "09:00 AM - 10:00 AM", subject: "Communication Skills", room: "LH-104", faculty: "Prof. N. Kapoor" }
    ]
  }
};

function getStoredTimetable() {
  try {
    const raw = localStorage.getItem("fm_timetables");
    return raw ? JSON.parse(raw) : DEFAULT_TIMETABLE;
  } catch (e) {
    return DEFAULT_TIMETABLE;
  }
}

async function saveStoredTimetable(tt) {
  localStorage.setItem("fm_timetables", JSON.stringify(tt));
  if (typeof saveSharedTimetable === "function") return await saveSharedTimetable(tt);
  return false;
}

let activeTTState = { sem: "1", day: "Monday" };

function renderTimetableView(sem = activeTTState.sem, day = activeTTState.day, skipSync = false) {
  activeTTState.sem = String(sem);
  if (!skipSync && typeof refreshSharedTimetable === "function" && sharedDataConfigured()) {
    refreshSharedTimetable();
  }
  activeTTState.day = day;

  if ($("searchInput")) $("searchInput").value = "";
  if ($("folderTitle")) $("folderTitle").textContent = "Semester Weekly Timetable";

  $("emptyState").classList.add("hidden");
  $("loading").classList.add("hidden");

  const tt = getStoredTimetable();
  const semSchedule = tt[sem] || {};
  const dayPeriods = semSchedule[day] || [];
  const isAdmin = typeof adminState !== "undefined" && adminState.isAdminLoggedIn;

  $("fileCount").textContent = dayPeriods.length.toLocaleString();

  const sems = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const controlsHtml = `
    <div class="mb-5 space-y-4 glass p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
      <!-- Sem Selector -->
      <div class="space-y-2">
        <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Select Semester:</span>
        <div class="flex flex-wrap items-center gap-2">
          ${sems.map(s => `
            <button class="tt-sem-btn px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition ${String(s) === String(activeTTState.sem) ? 'bg-sky-600 text-white shadow-md' : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700'}" data-tt-sem="${s}">
              Sem ${s}
            </button>
          `).join("")}
        </div>
      </div>

      <!-- Day Selector -->
      <div class="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Select Day:</span>
          ${isAdmin ? `
            <button id="addTTSlotBtn" class="px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl shadow-md hover:from-sky-400 hover:to-indigo-500 transition">
              + Add Class Period
            </button>` : ''}
        </div>
        <div class="flex flex-wrap items-center gap-2">
          ${days.map(d => `
            <button class="tt-day-btn px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition ${d === activeTTState.day ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700'}" data-tt-day="${d}">
              ${d}
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  if (dayPeriods.length === 0) {
    $("fileList").innerHTML = controlsHtml + `
      <div class="p-8 text-center glass rounded-2xl">
        <p class="text-sm font-extrabold text-slate-600 dark:text-slate-400">No periods scheduled for Semester ${sem} on ${day}.</p>
        ${isAdmin ? '<p class="mt-1 text-xs text-slate-400">Click "+ Add Class Period" to edit and customize the timetable!</p>' : ''}
      </div>`;
    wireTTEvents();
    return;
  }

  const periodsHtml = dayPeriods.map(p => `
    <div class="file-row border-l-4 border-l-sky-500 cursor-pointer transition hover:scale-[1.005]" onclick="showTimetableDetail('${p.id}')">
      <div class="file-icon bg-sky-500/10 text-sky-600 dark:text-sky-400 font-black">⏰</div>
      <div class="file-main">
        <div class="file-name">${escapeHtml(p.subject)}</div>
        <div class="file-meta">
          ⏰ Slot: ${escapeHtml(p.time)} • 📍 Room: ${escapeHtml(p.room || "LH")} • 👨‍🏫 Faculty: ${escapeHtml(p.faculty || "Staff")}
        </div>
      </div>
      ${isAdmin ? `
        <div class="row-actions" onclick="event.stopPropagation()">
          <button class="action-btn text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40" onclick="deleteTTSlot('${p.id}')">Delete 🗑️</button>
        </div>` : ''}
    </div>
  `).join("");

  $("fileList").innerHTML = controlsHtml + periodsHtml;
  wireTTEvents();
}

function wireTTEvents() {
  document.querySelectorAll(".tt-sem-btn").forEach(btn => {
    btn.onclick = () => renderTimetableView(btn.dataset.ttSem, activeTTState.day);
  });

  document.querySelectorAll(".tt-day-btn").forEach(btn => {
    btn.onclick = () => renderTimetableView(activeTTState.sem, btn.dataset.ttDay);
  });

  const addBtn = $("addTTSlotBtn");
  if (addBtn) {
    addBtn.onclick = () => promptAddTTSlot();
  }
}

async function promptAddTTSlot() {
  const subject = prompt("Enter Subject / Class Name (e.g. Mathematics-1):");
  if (!subject) return;
  const time = prompt("Enter Time Slot (e.g. 09:00 AM - 10:00 AM):", "09:00 AM - 10:00 AM");
  if (!time) return;
  const room = prompt("Enter Room / Lecture Hall (e.g. LH-101):", "LH-101");
  const faculty = prompt("Enter Faculty / Professor Name:", "Prof. Staff");

  const tt = getStoredTimetable();
  if (!tt[activeTTState.sem]) tt[activeTTState.sem] = {};
  if (!tt[activeTTState.sem][activeTTState.day]) tt[activeTTState.sem][activeTTState.day] = [];

  tt[activeTTState.sem][activeTTState.day].push({
    id: "t_" + Date.now(),
    time: time.trim(),
    subject: subject.trim(),
    room: room ? room.trim() : "LH",
    faculty: faculty ? faculty.trim() : "Staff"
  });

  await saveStoredTimetable(tt);
  showToast(`Added class period for Sem ${activeTTState.sem} (${activeTTState.day})!`);
  renderTimetableView(activeTTState.sem, activeTTState.day, true);
}

async function deleteTTSlot(id) {
  const tt = getStoredTimetable();
  if (tt[activeTTState.sem] && tt[activeTTState.sem][activeTTState.day]) {
    tt[activeTTState.sem][activeTTState.day] = tt[activeTTState.sem][activeTTState.day].filter(p => String(p.id) !== String(id));
    await saveStoredTimetable(tt);
    showToast("Deleted class slot.");
    renderTimetableView(activeTTState.sem, activeTTState.day, true);
  }
}
window.deleteTTSlot = deleteTTSlot;

/* DETAIL CARD MODAL SHOW HANDLERS */
function showExamDetail(id) {
  const exams = getStoredExams();
  const ex = exams.find(e => String(e.id) === String(id));
  if (!ex) return;

  const modal = $("itemDetailModal");
  const content = $("itemDetailModalContent");
  if (!modal || !content) return;

  let countdownText = "";
  if (ex.date) {
    const examDate = parseDateObj(ex.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = examDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      countdownText = `⏳ ${diffDays} Day${diffDays > 1 ? 's' : ''} Remaining`;
    } else if (diffDays === 0) {
      countdownText = `🔥 Exam is TODAY!`;
    } else {
      countdownText = `✅ Exam Completed`;
    }
  }

  content.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 text-2xl font-black">
          📅
        </div>
        <div>
          <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
            Semester ${escapeHtml(ex.sem)} • ${escapeHtml(ex.subject || 'Subject')}
          </span>
          <h3 class="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">${escapeHtml(ex.title)}</h3>
        </div>
      </div>

      ${countdownText ? `
        <div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black text-center">
          ${countdownText}
        </div>
      ` : ''}

      <div class="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300 p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
          <span class="text-slate-400 font-bold">Exam Date:</span>
          <span class="font-extrabold text-slate-900 dark:text-slate-100">📅 ${escapeHtml(formatDateDDMMYYYY(ex.date))}</span>
        </div>
        <div class="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
          <span class="text-slate-400 font-bold">Time Slot:</span>
          <span class="font-extrabold text-slate-900 dark:text-slate-100">⏰ ${escapeHtml(ex.time)}</span>
        </div>
        <div class="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
          <span class="text-slate-400 font-bold">Exam Hall / Room:</span>
          <span class="font-extrabold text-slate-900 dark:text-slate-100">📍 ${escapeHtml(ex.room || 'Main Hall')}</span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-slate-400 font-bold">Course Code:</span>
          <span class="font-extrabold text-indigo-600 dark:text-indigo-400">📘 ${escapeHtml(ex.subject || 'Course')}</span>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}

function showTimetableDetail(id) {
  const tt = getStoredTimetable();
  let found = null;
  let foundSem = "";
  let foundDay = "";

  for (const [sem, days] of Object.entries(tt)) {
    for (const [day, periods] of Object.entries(days)) {
      const p = periods.find(item => String(item.id) === String(id));
      if (p) {
        found = p;
        foundSem = sem;
        foundDay = day;
        break;
      }
    }
  }

  if (!found) return;

  const modal = $("itemDetailModal");
  const content = $("itemDetailModalContent");
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 text-2xl font-black">
          ⏰
        </div>
        <div>
          <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">
            Semester ${escapeHtml(foundSem)} • ${escapeHtml(foundDay)}
          </span>
          <h3 class="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">${escapeHtml(found.subject)}</h3>
        </div>
      </div>

      <div class="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300 p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
          <span class="text-slate-400 font-bold">Class Schedule Slot:</span>
          <span class="font-extrabold text-slate-900 dark:text-slate-100">⏰ ${escapeHtml(found.time)}</span>
        </div>
        <div class="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
          <span class="text-slate-400 font-bold">Lecture Hall / Room:</span>
          <span class="font-extrabold text-slate-900 dark:text-slate-100">📍 ${escapeHtml(found.room || 'LH')}</span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-slate-400 font-bold">Faculty / Lecturer:</span>
          <span class="font-extrabold text-sky-600 dark:text-sky-400">👨‍🏫 ${escapeHtml(found.faculty || 'Staff')}</span>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}

function closeItemDetailModal() {
  const modal = $("itemDetailModal");
  if (modal) modal.classList.add("hidden");
}

window.showExamDetail = showExamDetail;
window.showTimetableDetail = showTimetableDetail;
window.closeItemDetailModal = closeItemDetailModal;

/* NAVIGATION CARDS HANDLERS */
document.querySelectorAll("[data-nav]").forEach(btn => {
  btn.onclick = async () => {
    const action = btn.dataset.nav;
    setActiveNavCard(action);

    // Hide search bar on timetable and exam dates sections
    const sb = $("searchBarContainer");
    if (sb) {
      if (action === "timetable" || action === "exams") {
        sb.classList.add("hidden");
      } else {
        sb.classList.remove("hidden");
      }
    }

    if (action === "all") {
      if ($("searchInput")) $("searchInput").value = "";
      if (state.root) {
        state.currentFolder = state.root;
        state.breadcrumb = [{ id: state.root.id, name: state.root.name, root: true }];
        renderHeader();
        await loadFolder(state.root.id);
      }
    } else if (action === "subjects") {
      renderSubjectView();
    } else if (action === "timetable") {
      renderTimetableView();
    } else if (action === "exams") {
      renderExamsView();
    } else if (action === "settings") {
      openSettingsModal();
    }
  };
});

/* SETTINGS MODAL MANAGERS */
const settingsModal = $("settingsModal");
const headerSettingsBtn = $("headerSettingsBtn");

if (headerSettingsBtn) {
  headerSettingsBtn.onclick = openSettingsModal;
}

function openSettingsModal() {
  if (settingsModal) settingsModal.classList.remove("hidden");
}

function closeSettingsModal() {
  if (settingsModal) settingsModal.classList.add("hidden");
}

if ($("closeSettingsBtn")) $("closeSettingsBtn").onclick = closeSettingsModal;

/* CONTACT MODAL MANAGERS */
const contactModal = $("contactModal");
function openContactModal() {
  if (contactModal) contactModal.classList.remove("hidden");
}
function closeContactModal() {
  if (contactModal) contactModal.classList.add("hidden");
}

if ($("contactMeBtn")) $("contactMeBtn").onclick = openContactModal;
if ($("closeContactBtn")) $("closeContactBtn").onclick = closeContactModal;
if ($("settingsLogoutBtn")) $("settingsLogoutBtn").onclick = logout;

if ($("settingsThemeToggle")) {
  $("settingsThemeToggle").onclick = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    if (typeof setTheme === "function") {
      setTheme(isDark ? "light" : "dark");
    }
  };
}

/* INITIALIZE GMAIL INPUT PREFILL */
if ($("gmailInput") && state.userEmail) {
  $("gmailInput").value = state.userEmail;
}

/* KEYPAD & SHORTCUT LISTENERS */
$("pinScreen").querySelectorAll("[data-key]").forEach(btn => {
  btn.addEventListener("click", () => {
    if (state.pin.length >= 4) return;
    state.pin += btn.dataset.key;
    updatePinDots();
    $("pinMessage").textContent = "";
    if (state.pin.length === 4) setTimeout(submitPin, 120);
  });
});

$("pinScreen").querySelector("[data-action='backspace']").onclick = () => {
  state.pin = state.pin.slice(0, -1);
  updatePinDots();
  $("pinMessage").textContent = "";
};

$("pinScreen").querySelector("[data-action='submit']").onclick = submitPin;

document.addEventListener("keydown", e => {
  const activeEl = document.activeElement;
  const isInputActive = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");

  if (isInputActive) return;

  if (!$("pinScreen").classList.contains("hidden")) {
    if (/^\d$/.test(e.key)) {
      if (state.pin.length < 4) {
        state.pin += e.key;
        updatePinDots();
        if (state.pin.length === 4) setTimeout(submitPin, 120);
      }
    } else if (e.key === "Backspace") {
      state.pin = state.pin.slice(0, -1);
      updatePinDots();
    } else if (e.key === "Enter") {
      submitPin();
    }
  }
});

const searchInput = $("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", renderItems);
  searchInput.addEventListener("search", renderItems);
  searchInput.addEventListener("keyup", e => {
    if (e.key === "Escape") {
      searchInput.value = "";
      renderItems();
    }
  });
}

const clearSearchBtn = $("clearSearchBtn");
if (clearSearchBtn) {
  clearSearchBtn.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    renderItems();
    searchInput?.focus();
  });
}

$("refreshBtn").onclick = () => {
  if (state.currentFolder) loadFolder(state.currentFolder.id);
};

$("headerAction").innerHTML = `<span class="status-badge">🔐 Sealed Vault</span>`;
updatePinDots();

/* ADMIN UI CONTROLS & REFRESH EMAIL RESET INITIALIZATION */
document.addEventListener("DOMContentLoaded", () => {
  // Empty email input box on page load/refresh
  const emailInp = $("gmailInput");
  if (emailInp) emailInp.value = "";

  if ($("adminExitBtn")) {
    $("adminExitBtn").onclick = () => {
      if (typeof adminState !== "undefined") adminState.isAdminLoggedIn = false;
      $("adminScreen").classList.add("hidden");
      $("managerScreen").classList.add("hidden");
      $("pinScreen").classList.remove("hidden");
      resetPin();
    };
  }

  if ($("adminVisitorSearch")) {
    $("adminVisitorSearch").oninput = (e) => {
      if (typeof renderVisitorsTable === "function") renderVisitorsTable(e.target.value);
    };
  }

  if ($("adminExportLogsBtn")) {
    $("adminExportLogsBtn").onclick = () => {
      if (typeof exportVisitorLogs === "function") exportVisitorLogs();
    };
  }

  if ($("adminClearLogsBtn")) {
    $("adminClearLogsBtn").onclick = () => {
      if (typeof clearVisitorLogs === "function") clearVisitorLogs();
    };
  }

  if ($("addPinSubmitBtn")) {
    $("addPinSubmitBtn").onclick = () => {
      const pin = $("newPinCodeInput")?.value;
      const name = $("newPinNameInput")?.value;
      const id = $("newPinFolderIdInput")?.value;
      if (typeof addPinMapping === "function" && addPinMapping(pin, name, id)) {
        if ($("newPinCodeInput")) $("newPinCodeInput").value = "";
        if ($("newPinNameInput")) $("newPinNameInput").value = "";
        if ($("newPinFolderIdInput")) $("newPinFolderIdInput").value = "";
      }
    };
  }
});

// Extra safeguard to clear email input on refresh / pageshow event
window.addEventListener("pageshow", () => {
  const emailInp = $("gmailInput");
  if (emailInp) emailInp.value = "";
});
