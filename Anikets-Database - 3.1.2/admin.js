const _ADMIN_SEC = {
  a: "MTM1OA==",
  r: "MXlMUjBrZGFUTWk3SGJEMS1vQW8xQ205bjRieEFEVWRR",
  e: "MjAwN2FuaWtldHNvbndhbmVAZ21haWwuY29t"
};

function _adminDec(str) {
  try { return atob(str); } catch(e) { return ""; }
}

const ADMIN_PIN = _adminDec(_ADMIN_SEC.a);

const adminState = {
  isAdminLoggedIn: false,
  visitorLogs: [],
  userStats: {},
  blockedEmails: [],
  logsPage: 1,
  pinConfig: {
    "1717": { id: _adminDec(_ADMIN_SEC.r), name: "Academics", defaultSemester: "3" },
    "1919": { id: "ATTENDANCE_VAULT", name: "Student Attendance Vault" },
    "2334": { id: "189EKcPT1Nzmk57RgfnnG0JRhIMRyhyNT", name: "Public Vault", noLoginRequired: true },
    "3333": { id: "189EKcPT1Nzmk57RgfnnG0JRhIMRyhyNT", name: "Class Upload Folder", noLoginRequired: false },
    "1111": { id: _adminDec(_ADMIN_SEC.r), name: "Aniket-Notes", noLoginRequired: true }
  }
};

function initAdminData() {
  try {
    const savedLogs = localStorage.getItem("fm_visitor_logs");
    if (savedLogs) adminState.visitorLogs = JSON.parse(savedLogs);

    const savedStats = localStorage.getItem("fm_user_stats");
    if (savedStats) adminState.userStats = JSON.parse(savedStats);

    const savedBlocked = localStorage.getItem("fm_blocked_emails");
    if (savedBlocked) {
      try {
        const parsed = JSON.parse(savedBlocked);
        if (Array.isArray(parsed)) adminState.blockedEmails = parsed;
      } catch (err) {}
    }

    const savedPins = localStorage.getItem("fm_pin_config");
    if (savedPins) {
      try {
        const parsed = JSON.parse(savedPins);
        if (parsed && typeof parsed === "object") {
          adminState.pinConfig = parsed;
        }
      } catch (err) {}
    }

    const defaultFolderId = _adminDec(_ADMIN_SEC.r);
    if (!adminState.pinConfig["1717"]) {
      adminState.pinConfig["1717"] = {
        id: defaultFolderId,
        name: "Academics",
        defaultSemester: "3"
      };
      savePinConfig();
    }
    if (!adminState.pinConfig["1919"] || adminState.pinConfig["1919"].id !== "ATTENDANCE_VAULT") {
      adminState.pinConfig["1919"] = {
        id: "ATTENDANCE_VAULT",
        name: "Student Attendance Vault"
      };
      savePinConfig();
    }
    if (!adminState.pinConfig["2334"] || adminState.pinConfig["2334"].name !== "Public Vault") {
      adminState.pinConfig["2334"] = {
        id: "189EKcPT1Nzmk57RgfnnG0JRhIMRyhyNT",
        name: "Public Vault",
        noLoginRequired: true
      };
      savePinConfig();
    }
    if (!adminState.pinConfig["1111"] || adminState.pinConfig["1111"].name !== "Aniket-Notes") {
      adminState.pinConfig["1111"] = {
        id: defaultFolderId,
        name: "Aniket-Notes",
        noLoginRequired: true
      };
      savePinConfig();
    }
    if (!adminState.pinConfig["3333"] || adminState.pinConfig["3333"].name !== "Class Upload Folder") {
      adminState.pinConfig["3333"] = {
        id: "189EKcPT1Nzmk57RgfnnG0JRhIMRyhyNT",
        name: "Class Upload Folder",
        noLoginRequired: false
      };
      savePinConfig();
    }
  } catch (e) {
    console.warn("Error initializing admin storage:", e);
  }
}

initAdminData();

function savePinConfig() {
  localStorage.setItem("fm_pin_config", JSON.stringify(adminState.pinConfig));
  if (typeof saveSharedPinConfig === "function") {
    saveSharedPinConfig(adminState.pinConfig);
  }
}

function isGuestOrAdminEmail(email, vaultOrPin) {
  const e = String(email || "").trim().toLowerCase();
  const adminEmail = (typeof _ADMIN_SEC !== "undefined" && _ADMIN_SEC.e ? _adminDec(_ADMIN_SEC.e) : "2007aniketsonwane@gmail.com").toLowerCase();
  const v = String(vaultOrPin || "").trim().toLowerCase();

  return (
    !e ||
    e.includes("guest") ||
    e === "guest user" ||
    e === adminEmail ||
    e === "2007aniketsonwane@gmail.com" ||
    v === "1358" ||
    v === "2334" ||
    v === "1111" ||
    v.includes("public vault") ||
    v.includes("aniket-notes")
  );
}

const lastUserLoginTimes = {};

function trackUserLogin(email, pinUsed) {
  if (!email || isGuestOrAdminEmail(email, pinUsed)) return;
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPin = String(pinUsed || "1717").trim();
  const cooldownKey = `${cleanEmail}_${cleanPin}`;
  const nowMs = Date.now();

  if (lastUserLoginTimes[cooldownKey] && (nowMs - lastUserLoginTimes[cooldownKey] < 15000)) {
    return;
  }
  lastUserLoginTimes[cooldownKey] = nowMs;

  initAdminData();
  const now = new Date().toISOString();

  const newLog = {
    id: Date.now(),
    email: email,
    pin: pinUsed,
    timestamp: now
  };

  adminState.visitorLogs.unshift(newLog);
  if (adminState.visitorLogs.length > 500) {
    adminState.visitorLogs = adminState.visitorLogs.slice(0, 500);
  }
  localStorage.setItem("fm_visitor_logs", JSON.stringify(adminState.visitorLogs));

  if (!adminState.userStats[email]) {
    adminState.userStats[email] = {
      email: email,
      firstSeen: now,
      lastSeen: now,
      visits: 0,
      downloads: 0,
      lastPin: pinUsed
    };
  }

  adminState.userStats[email].visits += 1;
  adminState.userStats[email].lastSeen = now;
  adminState.userStats[email].lastPin = pinUsed;
  localStorage.setItem("fm_user_stats", JSON.stringify(adminState.userStats));

  if (typeof logSharedActivity === "function") {
    logSharedActivity({
      email: email,
      vault: formatVaultDisplayName(pinUsed || "1717"),
      timestamp: now,
      item: `Login / Access Vault (${pinUsed})`
    });
  }
}

function trackUserDownload(email, fileName) {
  if (!email || isGuestOrAdminEmail(email, "")) return;
  initAdminData();
  const now = new Date().toISOString();

  if (!adminState.userStats[email]) {
    trackUserLogin(email, "unknown");
  }

  if (adminState.userStats[email]) {
    adminState.userStats[email].downloads += 1;
    localStorage.setItem("fm_user_stats", JSON.stringify(adminState.userStats));
  }

  if (typeof logSharedActivity === "function") {
    logSharedActivity({
      email: email,
      vault: adminState.userStats[email]?.lastPin || "Vault",
      timestamp: now,
      item: `Downloaded: ${fileName}`
    });
  }

  if (adminState.isAdminLoggedIn) {
    renderAdminDashboard();
  }
}

function getParsedActivityLogs() {
  const isSharedConfigured = typeof sharedDataConfigured === "function" && sharedDataConfigured();
  let sheetLogs = [];
  try {
    const raw = localStorage.getItem("fm_shared_activity_logs") || localStorage.getItem("fm_activity_logs");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) sheetLogs = parsed;
    }
  } catch (e) {}

  const combined = [];

  sheetLogs.forEach(entry => {
    if (!entry) return;
    const time = entry["Timestamp"] || entry.timestamp || entry.time || new Date().toISOString();
    const email = entry["Login ID (Email)"] || entry.email || entry.loginId || entry.user || "";
    const vault = entry["Vault Name"] || entry.vault || entry.vaultName || "Vault";
    const item = entry["Action / Downloaded Item"] || entry.item || entry.action || entry.downloadItem || "Access Vault";

    if (email && !isGuestOrAdminEmail(email, vault)) {
      combined.push({
        timestamp: time,
        email: String(email).trim(),
        vault: String(vault).trim(),
        item: String(item).trim()
      });
    }
  });

  // Only include local visitor logs if shared Google Sheets data is NOT configured
  if (!isSharedConfigured && adminState.visitorLogs && Array.isArray(adminState.visitorLogs)) {
    adminState.visitorLogs.forEach(log => {
      if (!log || !log.email || isGuestOrAdminEmail(log.email, log.pin)) return;
      combined.push({
        timestamp: log.timestamp || new Date(log.id || Date.now()).toISOString(),
        email: String(log.email).trim(),
        vault: String(log.pin || "1717"),
        item: `Login / Access Vault (${log.pin || "1717"})`
      });
    });
  }

  combined.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  return combined;
}

function renderAdminDashboard() {
  initAdminData();

  const logs = getParsedActivityLogs();
  const uniqueUsers = new Set(logs.map(l => l.email.toLowerCase())).size;
  const totalVisits = logs.filter(l => (l.item || "").toLowerCase().includes("login") || (l.item || "").toLowerCase().includes("access")).length || logs.length;
  const totalDownloads = logs.filter(l => (l.item || "").toLowerCase().includes("download")).length;
  const totalUploads = logs.filter(l => (l.item || "").toLowerCase().includes("upload")).length;
  const activePinsCount = Object.keys(adminState.pinConfig).length + 1;

  if (document.getElementById("statTotalUsers")) document.getElementById("statTotalUsers").textContent = uniqueUsers.toLocaleString();
  if (document.getElementById("statTotalVisits")) document.getElementById("statTotalVisits").textContent = totalVisits.toLocaleString();
  if (document.getElementById("statTotalDownloads")) document.getElementById("statTotalDownloads").textContent = totalDownloads.toLocaleString();
  if (document.getElementById("statTotalUploads")) document.getElementById("statTotalUploads").textContent = totalUploads.toLocaleString();
  if (document.getElementById("statActivePins")) document.getElementById("statActivePins").textContent = activePinsCount.toLocaleString();

  renderVisitorsTable();
  renderPinsList();
  renderBlockedEmails();
}

function openUploadsStatsModal() {
  const modal = document.getElementById("uploadsStatsModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  renderUploadsStatsTable();

  const searchInput = document.getElementById("uploadSearchInput");
  if (searchInput) {
    searchInput.value = "";
    searchInput.oninput = (e) => renderUploadsStatsTable(e.target.value);
  }
}

function closeUploadsStatsModal() {
  const modal = document.getElementById("uploadsStatsModal");
  if (modal) modal.classList.add("hidden");
}

window.openUploadsStatsModal = openUploadsStatsModal;
window.closeUploadsStatsModal = closeUploadsStatsModal;

function renderUploadsStatsTable(filterQuery = "") {
  const tableBody = document.getElementById("uploadsStatsTableBody");
  const subtitle = document.getElementById("uploadsStatsModalSubtitle");
  if (!tableBody) return;

  const logs = getParsedActivityLogs();
  const uploadLogs = logs.filter(l => {
    const itemStr = (l.item || "").toLowerCase();
    return itemStr.includes("upload");
  });

  const query = filterQuery.toLowerCase().trim();
  let filtered = uploadLogs;
  if (query) {
    filtered = uploadLogs.filter(l => l.email.toLowerCase().includes(query) || l.item.toLowerCase().includes(query) || l.vault.toLowerCase().includes(query));
  }

  if (subtitle) {
    subtitle.textContent = `Total Uploads: ${uploadLogs.length} | Showing: ${filtered.length}`;
  }

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="py-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          No file upload activity recorded yet.
        </td>
      </tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(l => {
    let formattedTime = l.timestamp;
    try {
      const dt = new Date(l.timestamp);
      if (!isNaN(dt.getTime())) {
        formattedTime = dt.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
      }
    } catch (e) {}

    const fileName = l.item.replace(/^Uploaded\s*(?:File\s*)?:\s*/i, "").trim();

    return `
      <tr class="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs">
        <td class="py-2.5 px-4 font-bold text-teal-700 dark:text-teal-300">
          ${escapeAdminHtml(fileName || l.item)}
        </td>
        <td class="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
          ${escapeAdminHtml(l.email)}
        </td>
        <td class="py-2.5 px-4">
          <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
            ${escapeAdminHtml(formatVaultDisplayName(l.vault))}
          </span>
        </td>
        <td class="py-2.5 px-4 text-slate-500 dark:text-slate-400">
          ${escapeAdminHtml(formattedTime)}
        </td>
      </tr>`;
  }).join("");
}

window.openUploadsStatsModal = openUploadsStatsModal;
window.closeUploadsStatsModal = closeUploadsStatsModal;

function trackFileUpload(email, fileName, vaultPin = "3333") {
  if (!email || isGuestOrAdminEmail(email, vaultPin)) return;
  initAdminData();
  const now = new Date().toISOString();

  if (!adminState.userStats[email]) {
    trackUserLogin(email, vaultPin);
  }

  if (adminState.userStats[email]) {
    adminState.userStats[email].uploads = (adminState.userStats[email].uploads || 0) + 1;
    adminState.userStats[email].lastPin = vaultPin;
    localStorage.setItem("fm_user_stats", JSON.stringify(adminState.userStats));
  }

  const actionItem = `Uploaded File: ${fileName}`;

  if (typeof logSharedActivity === "function") {
    logSharedActivity({
      email: email,
      vault: formatVaultDisplayName(vaultPin),
      timestamp: now,
      item: actionItem
    });
  }

  const newLog = {
    id: Date.now(),
    email: email,
    pin: vaultPin,
    timestamp: now,
    action: actionItem
  };

  adminState.visitorLogs.unshift(newLog);
  if (adminState.visitorLogs.length > 500) {
    adminState.visitorLogs = adminState.visitorLogs.slice(0, 500);
  }
  localStorage.setItem("fm_visitor_logs", JSON.stringify(adminState.visitorLogs));

  if (adminState.isAdminLoggedIn) {
    renderAdminDashboard();
  }
}
window.trackFileUpload = trackFileUpload;

function formatVaultDisplayName(vaultRaw) {
  if (!vaultRaw) return "Academics";
  const str = String(vaultRaw).trim();

  if (str.includes("1358") || str.toUpperCase().includes("ADMIN")) {
    return "Admin";
  }

  if (str === "1717" || str.toLowerCase().includes("academic")) {
    return "Academics";
  }

  if (str === "1919" || str === "2024" || str.toLowerCase().includes("attend")) {
    return "Attendance Vault";
  }

  if (str === "3333" || str.toLowerCase().includes("class upload") || str.toLowerCase().includes("upload folder")) {
    return "Class Upload Folder (3333)";
  }

  if (str === "2334" || str.toLowerCase().includes("public vault") || str.toLowerCase().includes("public-folder") || str.toLowerCase().includes("folder vault")) {
    return "Public Vault";
  }

  if (str === "1111" || str.toLowerCase().includes("aniket-notes") || str.toLowerCase().includes("notes")) {
    return "Aniket-Notes";
  }

  if (/^\d{4}\s*-\s*(.+)/.test(str)) {
    const match = str.match(/^\d{4}\s*-\s*(.+)/);
    if (match && match[1]) return match[1].trim();
  }

  if (typeof adminState !== "undefined" && adminState.pinConfig) {
    if (adminState.pinConfig[str]) {
      const cfg = adminState.pinConfig[str];
      return cfg.name || "Vault";
    }
    for (const [pin, cfg] of Object.entries(adminState.pinConfig)) {
      if (cfg && cfg.name && str.toLowerCase() === cfg.name.toLowerCase()) {
        return cfg.name;
      }
    }
  }

  return str;
}

function formatActionItemDisplay(itemRaw) {
  if (!itemRaw) return "Login / Access Vault";
  let str = String(itemRaw).trim();

  str = str.replace(/\((?:ADMIN\s*\(\d+\)|\b1358\b|ADMIN)\)/gi, "(Admin)");
  str = str.replace(/\((?:1717)\)/gi, "(Academics)");
  str = str.replace(/\((?:1919|2024)\)/gi, "(Attendance Vault)");
  str = str.replace(/ADMIN\s*\(\d+\)/gi, "Admin");
  return str;
}

const LOGS_PER_PAGE = 10;

function changeVisitorLogsPage(newPage) {
  adminState.logsPage = newPage;
  const searchVal = document.getElementById("adminVisitorSearch")?.value || "";
  renderVisitorsTable(searchVal);
}

function renderVisitorsTable(filterQuery = "") {
  const tableBody = document.getElementById("adminVisitorTableBody");
  if (!tableBody) return;

  let logs = getParsedActivityLogs();
  const query = filterQuery.toLowerCase().trim();

  if (query) {
    logs = logs.filter(l => l.email.toLowerCase().includes(query) || l.vault.toLowerCase().includes(query) || l.item.toLowerCase().includes(query));
  }

  const paginationContainer = document.getElementById("visitorLogsPagination");

  if (logs.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="py-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          No visitor log records found in Google Sheets.
        </td>
      </tr>`;
    if (paginationContainer) paginationContainer.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(logs.length / LOGS_PER_PAGE) || 1;
  if (!adminState.logsPage || adminState.logsPage < 1) adminState.logsPage = 1;
  if (adminState.logsPage > totalPages) adminState.logsPage = totalPages;

  const pageLogs = logs.slice((adminState.logsPage - 1) * LOGS_PER_PAGE, adminState.logsPage * LOGS_PER_PAGE);

  tableBody.innerHTML = pageLogs.map(l => {
    let formattedTime = l.timestamp;
    try {
      const dt = new Date(l.timestamp);
      if (!isNaN(dt.getTime())) {
        formattedTime = dt.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      }
    } catch(e) {}

    const isSuperAdmin = l.email.toLowerCase().includes("2007aniketsonwane") || l.email.toLowerCase() === (_adminDec(_ADMIN_SEC.e) || "").toLowerCase();
    const vaultDisplay = formatVaultDisplayName(l.vault);
    const itemDisplay = formatActionItemDisplay(l.item);

    return `
      <tr class="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-indigo-50/40 dark:hover:bg-slate-900/40 transition">
        <td class="py-3 px-4 text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span class="inline-block h-2 w-2 rounded-full ${isSuperAdmin ? 'bg-purple-500 ring-2 ring-purple-400/40' : 'bg-emerald-500'}"></span>
          <span class="${isSuperAdmin ? 'text-purple-700 dark:text-purple-300 font-black' : ''}">${escapeAdminHtml(l.email)}</span>
          ${isSuperAdmin ? '<span class="px-1.5 py-0.5 text-[10px] font-black uppercase rounded bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">👑 Admin</span>' : ''}
        </td>
        <td class="py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          ${escapeAdminHtml(formattedTime)}
        </td>
        <td class="py-3 px-4 text-xs">
          <span class="inline-block whitespace-nowrap px-2.5 py-1 rounded-lg font-mono text-[11px] font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm">
            ${escapeAdminHtml(vaultDisplay)}
          </span>
        </td>
        <td class="py-3 px-4 text-xs font-medium text-slate-800 dark:text-slate-200">
          ${escapeAdminHtml(itemDisplay)}
        </td>
      </tr>`;
  }).join("");

  if (paginationContainer) {
    const startIdx = (adminState.logsPage - 1) * LOGS_PER_PAGE + 1;
    const endIdx = Math.min(adminState.logsPage * LOGS_PER_PAGE, logs.length);
    paginationContainer.innerHTML = `
      <div class="text-slate-500 dark:text-slate-400 font-semibold">
        Showing <strong class="text-slate-900 dark:text-slate-100 font-extrabold">${startIdx}-${endIdx}</strong> of <strong class="text-slate-900 dark:text-slate-100 font-extrabold">${logs.length}</strong> entries
      </div>
      <div class="flex items-center gap-1.5">
        <button type="button" onclick="changeVisitorLogsPage(${adminState.logsPage - 1})" ${adminState.logsPage <= 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
          ← Prev
        </button>
        <span class="px-2 py-1 text-xs font-black text-slate-800 dark:text-slate-200">
          Page ${adminState.logsPage} of ${totalPages}
        </span>
        <button type="button" onclick="changeVisitorLogsPage(${adminState.logsPage + 1})" ${adminState.logsPage >= totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
          Next →
        </button>
      </div>
    `;
  }
}

window.changeVisitorLogsPage = changeVisitorLogsPage;

function renderPinsList() {
  const container = document.getElementById("adminPinsList");
  if (!container) return;

  const pins = [
    { pin: ADMIN_PIN, name: "Super Admin Vault", id: "SYSTEM_ADMIN", isAdmin: true, isLocked: false },
    ...Object.entries(adminState.pinConfig).map(([pin, cfg]) => ({
      pin: pin,
      name: cfg.name || "Academic Vault",
      id: cfg.id,
      isAdmin: false,
      isLocked: Boolean(cfg.isLocked)
    }))
  ];

  container.innerHTML = pins.map(p => `
    <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl glass border border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl ${p.isAdmin ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' : (p.isLocked ? 'bg-amber-500 text-white' : 'bg-gradient-to-br from-indigo-500 to-sky-500 text-white')} text-xs font-black">
          ${p.isAdmin ? '👑' : (p.isLocked ? '🔒' : '🔑')}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono text-sm font-black text-slate-900 dark:text-slate-100">PIN: ${escapeAdminHtml(p.pin)}</span>
            ${p.isAdmin ? '<span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">Admin</span>' : ''}
            ${p.isLocked ? '<span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">LOCKED</span>' : ''}
          </div>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">${escapeAdminHtml(p.name)} (${escapeAdminHtml(p.id)})</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        ${!p.isAdmin ? `
          ${p.pin === '1717' ? `
            <button type="button" class="text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 transition" onclick="openAdminPinModal('${p.pin}')">
              Edit ⚙️ / Manage
            </button>
          ` : ''}
          <button type="button" class="text-xs font-bold px-3.5 py-1.5 rounded-xl border transition ${p.isLocked ? 'border-amber-400 text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300' : 'border-slate-200 text-slate-700 bg-slate-100 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}" onclick="togglePinLock('${p.pin}')">
            ${p.isLocked ? '🔓 Unlock' : '🔒 Lock'}
          </button>
        ` : `<span class="text-xs font-bold text-slate-400">System Protected</span>`}
      </div>
    </div>
  `).join("");
}

function togglePinLock(pin) {
  if (pin === ADMIN_PIN) {
    if (typeof showToast === "function") showToast("Admin PIN cannot be locked.");
    return;
  }

  if (!adminState.pinConfig[pin]) {
    adminState.pinConfig[pin] = {
      id: "1yLR0kdaTMi7HbD1-oAo1Cm9n4bxADUdQ",
      name: "Academics",
      isLocked: false
    };
  }

  const isLocked = Boolean(adminState.pinConfig[pin].isLocked);
  adminState.pinConfig[pin].isLocked = !isLocked;
  savePinConfig();

  const msg = !isLocked ? `🔒 Vault PIN ${pin} is now LOCKED.` : `🔓 Vault PIN ${pin} is UNLOCKED.`;
  if (typeof showToast === "function") showToast(msg);
  renderAdminDashboard();
}

let activeAdminModalTab = "security";
let adminTTFilterSem = "3";
let adminTTFilterDay = (typeof getCurrentIndianDay === "function") ? getCurrentIndianDay() : "Monday";

let openedFromAvailablePinsModal = false;

function openAdminPinModal(pin) {
  currentEditPin = pin;
  const availModal = document.getElementById("availablePinsModal");
  if (availModal && !availModal.classList.contains("hidden")) {
    openedFromAvailablePinsModal = true;
    availModal.classList.add("hidden");
  }

  const modal = document.getElementById("adminPinEditModal");
  if (!modal) return;

  const titleEl = document.getElementById("adminPinModalTitle");
  if (titleEl) titleEl.textContent = `Manage PIN ${pin} (${pin === "1717" ? "Academics Vault" : "Custom Vault"}) Settings`;

  renderAdminPinModalContent(pin);
  modal.classList.remove("hidden");

  const closeBtn = document.getElementById("closeAdminPinModalBtn");
  if (closeBtn) closeBtn.onclick = closeAdminPinModal;

  if (typeof loadSharedData === "function" && typeof sharedDataConfigured === "function" && sharedDataConfigured()) {
    loadSharedData(false).then(() => {
      if (modal && !modal.classList.contains("hidden") && currentEditPin === pin) {
        renderAdminPinModalContent(pin);
      }
    });
  }
}

function closeAdminPinModal() {
  const modal = document.getElementById("adminPinEditModal");
  if (modal) modal.classList.add("hidden");

  if (openedFromAvailablePinsModal) {
    openedFromAvailablePinsModal = false;
    const availModal = document.getElementById("availablePinsModal");
    if (availModal) {
      availModal.classList.remove("hidden");
      if (typeof renderPinsList === "function") renderPinsList();
    }
  }
}

function switchAdminModalTab(tabName, pin) {
  activeAdminModalTab = tabName;
  renderAdminPinModalContent(pin);
}

function renderAdminPinModalContent(pin) {
  const content = document.getElementById("adminPinModalContent");
  if (!content) return;

  const cfg = adminState.pinConfig[pin] || { isLocked: false, name: "Academics" };
  const isLocked = Boolean(cfg.isLocked);

  const navTabsHtml = `
    <div class="flex items-center gap-1.5 p-1.5 glass rounded-2xl border border-slate-200 dark:border-slate-800 mb-5">
      <button type="button" onclick="switchAdminModalTab('security', '${pin}')" class="flex-1 py-2 text-xs font-extrabold rounded-xl transition ${activeAdminModalTab === 'security' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}">
        🔒 Security Lock
      </button>
      <button type="button" onclick="switchAdminModalTab('exams', '${pin}')" class="flex-1 py-2 text-xs font-extrabold rounded-xl transition ${activeAdminModalTab === 'exams' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}">
        📅 Exam Dates
      </button>
      <button type="button" onclick="switchAdminModalTab('timetable', '${pin}')" class="flex-1 py-2 text-xs font-extrabold rounded-xl transition ${activeAdminModalTab === 'timetable' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}">
        ⏰ Timetables
      </button>
    </div>
  `;

  let tabBodyHtml = "";

  if (activeAdminModalTab === "security") {
    tabBodyHtml = `
      <div class="p-5 rounded-3xl glass border border-slate-200 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 class="text-base font-extrabold text-slate-900 dark:text-slate-100">Vault Access Control</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">Locking disables PIN ${pin} login for all non-admin users</p>
          </div>
          <button type="button" onclick="togglePinLock('${pin}'); renderAdminPinModalContent('${pin}');" class="px-5 py-2.5 text-xs font-black rounded-2xl shadow-lg transition ${isLocked ? 'bg-amber-500 text-white hover:bg-amber-400' : 'bg-indigo-600 text-white hover:bg-indigo-500'}">
            ${isLocked ? '🔒 Vault is LOCKED (Click to Unlock)' : '🔓 Vault is UNLOCKED (Click to Lock)'}
          </button>
        </div>
      </div>
    `;
  } else if (activeAdminModalTab === "exams") {
    const exams = (typeof getStoredExams === "function") ? getStoredExams() : [];
    exams.sort((a, b) => {
      const dA = (typeof parseDateObj === "function") ? parseDateObj(a.date).getTime() : 0;
      const dB = (typeof parseDateObj === "function") ? parseDateObj(b.date).getTime() : 0;
      return dA - dB;
    });

    tabBodyHtml = `
      <div class="p-4 rounded-3xl glass border border-slate-200 dark:border-slate-800 space-y-3 mb-5">
        <h4 class="text-sm font-extrabold text-slate-900 dark:text-slate-100">+ Add New Exam Date Entry</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input id="adminExamTitle" type="text" placeholder="Exam Title (e.g. End-Sem Physics Exam)" class="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          <select id="adminExamSem" class="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>
          <div class="relative">
            <input id="adminExamDateText" type="text" placeholder="DD/MM/YYYY (e.g. 21/08/2026)" class="w-full px-3.5 py-2.5 pr-10 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            <input id="adminExamDatePicker" type="date" class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 w-6 h-6 cursor-pointer" onchange="const txt = document.getElementById('adminExamDateText'); if(txt && typeof formatDateDDMMYYYY === 'function') txt.value = formatDateDDMMYYYY(this.value);" />
            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500">📅</span>
          </div>
          <input id="adminExamTime" type="text" placeholder="Time Slot (e.g. 10:00 AM - 01:00 PM)" class="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          <input id="adminExamRoom" type="text" placeholder="Hall / Room No. (e.g. Hall A-101)" class="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          <input id="adminExamSubject" type="text" placeholder="Subject Code (e.g. PHY101)" class="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
        </div>
        <button type="button" onclick="adminModalAddExam('${pin}')" class="w-full py-2.5 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow hover:from-amber-400 hover:to-orange-400 transition">
          + Add Exam Date Entry
        </button>
      </div>

      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Existing Exam Dates (${exams.length})</h4>
        ${exams.length === 0 ? `
          <div class="p-6 text-center rounded-2xl glass border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400">
            No exam dates recorded yet.
          </div>
        ` : `
          <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
            ${exams.map(ex => `
              <div class="flex items-center justify-between p-3 rounded-2xl glass border border-slate-200 dark:border-slate-800">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-extrabold text-slate-900 dark:text-slate-100">${escapeAdminHtml(ex.title)}</span>
                    <span class="px-2 py-0.5 text-[10px] font-black rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">Sem ${escapeAdminHtml(ex.sem)}</span>
                  </div>
                  <p class="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    📅 ${(typeof formatDateDDMMYYYY === "function") ? formatDateDDMMYYYY(ex.date) : escapeAdminHtml(ex.date)} • ⏰ ${escapeAdminHtml(ex.time)} • 📍 ${escapeAdminHtml(ex.room || "Hall")}
                  </p>
                </div>
                <button type="button" onclick="adminModalDeleteExam('${ex.id}', '${pin}')" class="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl transition">
                  Delete 🗑️
                </button>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;
  } else if (activeAdminModalTab === "timetable") {
    const tt = (typeof getStoredTimetable === "function") ? getStoredTimetable() : {};
    const dayPeriods = (tt[adminTTFilterSem] && tt[adminTTFilterSem][adminTTFilterDay]) ? [...tt[adminTTFilterSem][adminTTFilterDay]] : [];
    if (typeof parseTimeStringToMinutes === "function") {
      dayPeriods.sort((a, b) => parseTimeStringToMinutes(a.time) - parseTimeStringToMinutes(b.time));
    }

    const sems = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    tabBodyHtml = `
      <div class="p-4 rounded-3xl glass border border-slate-200 dark:border-slate-800 space-y-3 mb-5">
        <h4 class="text-sm font-extrabold text-slate-900 dark:text-slate-100">+ Add Class Period Slot</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <select id="adminTTSem" onchange="adminTTFilterSem = this.value; renderAdminPinModalContent('${pin}');" class="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            ${sems.map(s => `<option value="${s}" ${s === adminTTFilterSem ? 'selected' : ''}>Semester ${s}</option>`).join("")}
          </select>
          <select id="adminTTDay" onchange="adminTTFilterDay = this.value; renderAdminPinModalContent('${pin}');" class="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            ${days.map(d => `<option value="${d}" ${d === adminTTFilterDay ? 'selected' : ''}>${d}</option>`).join("")}
          </select>
          <input id="adminTTSubject" type="text" placeholder="Subject Name (e.g. Mathematics-1)" class="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          <input id="adminTTTime" type="text" placeholder="Time Slot (e.g. 09:00 AM - 10:00 AM)" class="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          <input id="adminTTRoom" type="text" placeholder="Room (e.g. LH-101)" class="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          <input id="adminTTFaculty" type="text" placeholder="Faculty Name (e.g. Dr. Sharma)" class="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
        </div>
        <button type="button" onclick="adminModalAddTTSlot('${pin}')" class="w-full py-2.5 text-xs font-black text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl shadow hover:from-sky-400 hover:to-indigo-500 transition">
          + Add Timetable Class Period
        </button>
      </div>

      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Semester ${adminTTFilterSem} (${adminTTFilterDay}) Periods (${dayPeriods.length})</h4>
        ${dayPeriods.length === 0 ? `
          <div class="p-6 text-center rounded-2xl glass border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400">
            No class periods scheduled for Sem ${adminTTFilterSem} on ${adminTTFilterDay}.
          </div>
        ` : `
          <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
            ${dayPeriods.map(p => `
              <div class="flex items-center justify-between p-3 rounded-2xl glass border border-slate-200 dark:border-slate-800">
                <div>
                  <div class="text-xs font-extrabold text-slate-900 dark:text-slate-100">${escapeAdminHtml(p.subject)}</div>
                  <p class="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    ⏰ ${escapeAdminHtml(p.time)} • 📍 Room: ${escapeAdminHtml(p.room || "LH")} • 👨‍🏫 ${escapeAdminHtml(p.faculty || "Staff")}
                  </p>
                </div>
                <button type="button" onclick="adminModalDeleteTTSlot('${p.id}', '${pin}')" class="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl transition">
                  Delete 🗑️
                </button>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;
  }

  content.innerHTML = navTabsHtml + tabBodyHtml;
}

function adminModalAddExam(pin) {
  const title = document.getElementById("adminExamTitle")?.value;
  const sem = document.getElementById("adminExamSem")?.value || "1";
  const rawDate = document.getElementById("adminExamDateText")?.value || document.getElementById("adminExamDatePicker")?.value || "21/08/2026";
  const date = (typeof formatDateDDMMYYYY === "function") ? formatDateDDMMYYYY(rawDate) : rawDate;
  const time = document.getElementById("adminExamTime")?.value || "10:00 AM - 01:00 PM";
  const room = document.getElementById("adminExamRoom")?.value || "Hall A-101";
  const subject = document.getElementById("adminExamSubject")?.value || "PHY101";

  if (!title) {
    if (typeof showToast === "function") showToast("Please enter an Exam Title.");
    return;
  }

  const exams = (typeof getStoredExams === "function") ? getStoredExams() : [];
  exams.push({
    id: "e_" + Date.now(),
    sem: String(sem),
    title: title.trim(),
    date: date.trim(),
    time: time.trim(),
    room: room.trim(),
    subject: subject.trim()
  });

  if (typeof saveStoredExams === "function") saveStoredExams(exams);
  if (typeof showToast === "function") showToast("Added exam date globally!");
  renderAdminPinModalContent(pin);

  if (typeof renderExamsView === "function") renderExamsView(sem, true);
}

function adminModalDeleteExam(id, pin) {
  let exams = (typeof getStoredExams === "function") ? getStoredExams() : [];
  exams = exams.filter(e => String(e.id) !== String(id));
  if (typeof saveStoredExams === "function") saveStoredExams(exams);
  if (typeof showToast === "function") showToast("Deleted exam entry globally.");
  renderAdminPinModalContent(pin);

  if (typeof renderExamsView === "function") renderExamsView(activeExamsSem, true);
}

function adminModalAddTTSlot(pin) {
  const sem = document.getElementById("adminTTSem")?.value || adminTTFilterSem;
  const day = document.getElementById("adminTTDay")?.value || adminTTFilterDay;
  const subject = document.getElementById("adminTTSubject")?.value;
  const time = document.getElementById("adminTTTime")?.value || "09:00 AM - 10:00 AM";
  const room = document.getElementById("adminTTRoom")?.value || "LH-101";
  const faculty = document.getElementById("adminTTFaculty")?.value || "Prof. Staff";

  if (!subject) {
    if (typeof showToast === "function") showToast("Please enter a Subject Name.");
    return;
  }

  const tt = (typeof getStoredTimetable === "function") ? getStoredTimetable() : {};
  if (!tt[sem]) tt[sem] = {};
  if (!tt[sem][day]) tt[sem][day] = [];

  tt[sem][day].push({
    id: "t_" + Date.now(),
    time: time.trim(),
    subject: subject.trim(),
    room: room.trim(),
    faculty: faculty.trim()
  });

  if (typeof saveStoredTimetable === "function") saveStoredTimetable(tt);
  if (typeof showToast === "function") showToast(`Added class period globally for Sem ${sem} (${day})!`);
  renderAdminPinModalContent(pin);

  if (typeof renderTimetableView === "function") renderTimetableView(sem, day, true);
}

function adminModalDeleteTTSlot(id, pin) {
  const tt = (typeof getStoredTimetable === "function") ? getStoredTimetable() : {};
  if (tt[adminTTFilterSem] && tt[adminTTFilterSem][adminTTFilterDay]) {
    tt[adminTTFilterSem][adminTTFilterDay] = tt[adminTTFilterSem][adminTTFilterDay].filter(p => String(p.id) !== String(id));
    if (typeof saveStoredTimetable === "function") saveStoredTimetable(tt);
    if (typeof showToast === "function") showToast("Deleted timetable slot globally.");
    renderAdminPinModalContent(pin);

    if (typeof renderTimetableView === "function") renderTimetableView(adminTTFilterSem, adminTTFilterDay, true);
  }
}

window.adminModalDeleteExam = adminModalDeleteExam;
window.adminModalDeleteTTSlot = adminModalDeleteTTSlot;
window.adminModalAddExam = adminModalAddExam;
window.adminModalAddTTSlot = adminModalAddTTSlot;
window.openAdminPinModal = openAdminPinModal;
window.closeAdminPinModal = closeAdminPinModal;
window.switchAdminModalTab = switchAdminModalTab;
window.togglePinLock = togglePinLock;

function addPinMapping(pin, name, driveFolderId) {
  if (!pin || pin.length !== 4 || isNaN(pin)) {
    if (typeof showToast === "function") showToast("PIN must be a 4-digit number.");
    return false;
  }
  if (!driveFolderId) {
    if (typeof showToast === "function") showToast("Google Drive Folder ID is required.");
    return false;
  }

  adminState.pinConfig[pin] = {
    id: driveFolderId.trim(),
    name: name.trim() || "Custom Vault"
  };

  savePinConfig();
  if (typeof showToast === "function") showToast(`Added PIN ${pin} successfully!`);
  renderAdminDashboard();
  return true;
}

function removePinMapping(pin) {
  if (pin === "1717" || pin === ADMIN_PIN) {
    if (typeof showToast === "function") showToast("Default PINs cannot be removed.");
    return;
  }
  delete adminState.pinConfig[pin];
  savePinConfig();
  if (typeof showToast === "function") showToast(`Removed PIN ${pin}.`);
  renderAdminDashboard();
}

function exportVisitorLogs() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(adminState.userStats, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `visitor_analytics_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  if (typeof showToast === "function") showToast("Exported visitor analytics log.");
}

async function clearVisitorLogs() {
  if (confirm("Are you sure you want to clear all visitor telemetry data from Google Sheets & local database?")) {
    adminState.visitorLogs = [];
    adminState.userStats = {};
    localStorage.removeItem("fm_visitor_logs");
    localStorage.removeItem("fm_user_stats");
    localStorage.setItem("fm_shared_activity_logs", JSON.stringify([]));

    if (typeof sharedDataConfigured === "function" && sharedDataConfigured() && typeof clearSharedActivityLogs === "function") {
      try {
        await clearSharedActivityLogs();
        if (typeof showToast === "function") showToast("Cleared visitor telemetry from Google Sheets & local storage.");
      } catch (err) {
        console.error("Error clearing Google Sheets logs:", err);
        if (typeof showToast === "function") showToast("Cleared local telemetry, but Google Sheets update failed.");
      }
    } else {
      if (typeof showToast === "function") showToast("Cleared visitor telemetry.");
    }
    renderAdminDashboard();
  }
}

function openUniqueUsersModal() {
  const modal = document.getElementById("uniqueUsersModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  renderUniqueUsersTable();
}

function closeUniqueUsersModal() {
  const modal = document.getElementById("uniqueUsersModal");
  if (modal) modal.classList.add("hidden");
}

function formatUserNameFromEmail(email) {
  if (!email) return "Unknown User";
  const clean = String(email).toLowerCase().trim();
  const adminEmail = (_adminDec(_ADMIN_SEC.e) || "2007aniketsonwane@gmail.com").toLowerCase().trim();
  if (clean === adminEmail || clean.includes("2007aniketsonwane")) {
    return "👑 Super Admin (Aniket)";
  }
  const prefix = email.split("@")[0] || email;
  return prefix
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function renderUniqueUsersTable(filterQuery = "") {
  const tableBody = document.getElementById("uniqueUsersTableBody");
  if (!tableBody) return;

  const logs = getParsedActivityLogs();
  const query = filterQuery.toLowerCase().trim();

  const userMap = new Map();

  logs.forEach(l => {
    if (!l || !l.email) return;
    const email = String(l.email).trim().toLowerCase();
    const formattedEmail = String(l.email).trim();

    if (!userMap.has(email)) {
      userMap.set(email, {
        email: formattedEmail,
        name: formatUserNameFromEmail(formattedEmail),
        visits: 0,
        lastActive: l.timestamp,
        lastVault: l.vault || "Vault"
      });
    }

    const userData = userMap.get(email);
    userData.visits += 1;
    if (new Date(l.timestamp) > new Date(userData.lastActive)) {
      userData.lastActive = l.timestamp;
      userData.lastVault = l.vault || userData.lastVault;
    }
  });

  if (adminState.userStats) {
    Object.values(adminState.userStats).forEach(st => {
      if (!st || !st.email) return;
      const email = String(st.email).trim().toLowerCase();
      if (!userMap.has(email)) {
        userMap.set(email, {
          email: st.email,
          name: formatUserNameFromEmail(st.email),
          visits: st.visits || 1,
          lastActive: st.lastSeen || new Date().toISOString(),
          lastVault: st.lastPin || "Vault"
        });
      }
    });
  }

  const adminEmail = (_adminDec(_ADMIN_SEC.e) || "2007aniketsonwane@gmail.com").toLowerCase().trim();
  if (!userMap.has(adminEmail)) {
    const adminStat = (adminState.userStats && (adminState.userStats[adminEmail] || adminState.userStats["2007aniketsonwane@gmail.com"])) || null;
    userMap.set(adminEmail, {
      email: "2007aniketsonwane@gmail.com",
      name: "👑 Super Admin (Aniket)",
      visits: adminStat?.visits || 1,
      lastActive: adminStat?.lastSeen || new Date().toISOString(),
      lastVault: adminStat?.lastPin || "SUPER_ADMIN"
    });
  }

  let users = Array.from(userMap.values());

  if (query) {
    users = users.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  }

  users.sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));

  const subtitle = document.getElementById("uniqueUsersModalSubtitle");
  if (subtitle) {
    subtitle.textContent = `Total Unique Registered Visitors: ${userMap.size}`;
  }

  if (users.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="py-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          No unique user records found.
        </td>
      </tr>`;
    return;
  }

  tableBody.innerHTML = users.map(u => {
    let formattedTime = u.lastActive;
    try {
      const dt = new Date(u.lastActive);
      if (!isNaN(dt.getTime())) {
        formattedTime = dt.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      }
    } catch(e) {}

    const isSuperAdmin = u.email.toLowerCase().includes("2007aniketsonwane") || u.email.toLowerCase() === (_adminDec(_ADMIN_SEC.e) || "").toLowerCase();

    return `
      <tr class="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-indigo-50/40 dark:hover:bg-slate-900/40 transition">
        <td class="py-3 px-4 text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span class="flex h-6 w-6 items-center justify-center rounded-full ${isSuperAdmin ? 'bg-purple-600 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'} text-[10px] font-black">
            ${isSuperAdmin ? '👑' : escapeAdminHtml(u.name.charAt(0))}
          </span>
          <span class="${isSuperAdmin ? 'text-purple-700 dark:text-purple-300 font-black' : ''}">${escapeAdminHtml(u.name)}</span>
          ${isSuperAdmin ? '<span class="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">Admin</span>' : ''}
        </td>
        <td class="py-3 px-4 text-xs font-semibold ${isSuperAdmin ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-indigo-600 dark:text-indigo-400'}">
          ${escapeAdminHtml(u.email)}
        </td>
        <td class="py-3 px-4 text-xs font-bold text-center text-slate-700 dark:text-slate-300">
          <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
            ${u.visits}
          </span>
        </td>
        <td class="py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          ${escapeAdminHtml(formattedTime)}
        </td>
      </tr>`;
  }).join("");
}

window.openUniqueUsersModal = openUniqueUsersModal;
window.closeUniqueUsersModal = closeUniqueUsersModal;
window.renderUniqueUsersTable = renderUniqueUsersTable;
window.clearVisitorLogs = clearVisitorLogs;

// Vault Visit Breakdown Modal
function openVaultStatsModal() {
  const modal = document.getElementById("vaultStatsModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  renderVaultStatsTable();
}

function closeVaultStatsModal() {
  const modal = document.getElementById("vaultStatsModal");
  if (modal) modal.classList.add("hidden");
}

function toggleVaultUserList(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.toggle("hidden");
  }
}
window.toggleVaultUserList = toggleVaultUserList;

function renderVaultStatsTable() {
  const container = document.getElementById("vaultStatsContent");
  if (!container) return;

  const logs = getParsedActivityLogs();
  const vaultMap = new Map();
  let totalVisits = 0;

  logs.forEach(l => {
    if (!l || !l.email) return;
    const isVisit = (l.item || "").toLowerCase().includes("login") || (l.item || "").toLowerCase().includes("access");
    if (!isVisit) return;

    totalVisits += 1;
    const vName = formatVaultDisplayName(l.vault);
    if (!vaultMap.has(vName)) {
      vaultMap.set(vName, { count: 0, userMap: new Map() });
    }
    const vEntry = vaultMap.get(vName);
    vEntry.count += 1;

    const emailKey = l.email.toLowerCase().trim();
    if (!vEntry.userMap.has(emailKey)) {
      vEntry.userMap.set(emailKey, {
        email: l.email.trim(),
        count: 0,
        lastSeen: l.timestamp
      });
    }
    const uEntry = vEntry.userMap.get(emailKey);
    uEntry.count += 1;
    if (new Date(l.timestamp) > new Date(uEntry.lastSeen || 0)) {
      uEntry.lastSeen = l.timestamp;
    }
  });

  if (totalVisits === 0) totalVisits = logs.length || 1;

  const sortedVaults = Array.from(vaultMap.entries()).sort((a, b) => b[1].count - a[1].count);

  const subtitle = document.getElementById("vaultStatsModalSubtitle");
  if (subtitle) {
    subtitle.textContent = `Total Visits Recorded: ${totalVisits.toLocaleString()} • Click any vault card to view accessed user emails`;
  }

  if (sortedVaults.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-xs font-bold text-slate-400">
        No vault visit statistics available.
      </div>`;
    return;
  }

  container.innerHTML = sortedVaults.map(([vName, vData], idx) => {
    const count = vData.count;
    const pct = Math.round((count / totalVisits) * 100);
    const usersList = Array.from(vData.userMap.values()).sort((a, b) => b.count - a.count);
    const uniqueUserCount = usersList.length;

    const userListId = `vaultUserList_${idx}`;

    return `
      <div class="p-4 rounded-2xl glass border border-slate-200 dark:border-slate-800 space-y-2 hover:border-purple-400/80 transition-all cursor-pointer group select-none" onclick="toggleVaultUserList('${userListId}')">
        <div class="flex items-center justify-between text-xs font-extrabold text-slate-900 dark:text-slate-100">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg font-mono text-[11px] font-black bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              ${escapeAdminHtml(vName)}
            </span>
            <span class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 opacity-80 group-hover:opacity-100 transition">
              👥 ${uniqueUserCount} Email${uniqueUserCount > 1 ? 's' : ''} (Click to toggle) ▾
            </span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-purple-600 dark:text-purple-400 font-black">${count.toLocaleString()} visits</span>
            <span class="text-[11px] font-mono text-slate-500">${pct}%</span>
          </div>
        </div>

        <div class="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
        </div>

        <div id="${userListId}" class="hidden mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2 cursor-default" onclick="event.stopPropagation()">
          <div class="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            Accounts accessing ${escapeAdminHtml(vName)}:
          </div>
          ${usersList.map(u => {
            let formattedTime = u.lastSeen;
            try {
              const dt = new Date(u.lastSeen);
              if (!isNaN(dt.getTime())) {
                formattedTime = dt.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });
              }
            } catch(e) {}

            return `
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-indigo-500 font-black">✉️</span>
                  <div>
                    <span class="font-extrabold text-slate-900 dark:text-slate-100">${escapeAdminHtml(u.email)}</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">Last Visit: ${escapeAdminHtml(formattedTime)}</span>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-black text-[11px] border border-purple-200 dark:border-purple-800">
                  ${u.count.toLocaleString()} visit${u.count > 1 ? 's' : ''}
                </span>
              </div>`;
          }).join("")}
        </div>
      </div>`;
  }).join("");
}

// File Downloads History Modal
function openDownloadsStatsModal() {
  const modal = document.getElementById("downloadsStatsModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  renderDownloadsStatsTable();
}

function closeDownloadsStatsModal() {
  const modal = document.getElementById("downloadsStatsModal");
  if (modal) modal.classList.add("hidden");
}

function renderDownloadsStatsTable(filterQuery = "") {
  const tableBody = document.getElementById("downloadsStatsTableBody");
  if (!tableBody) return;

  const logs = getParsedActivityLogs();
  const query = filterQuery.toLowerCase().trim();

  let downloadLogs = logs.filter(l => (l.item || "").toLowerCase().includes("download"));

  if (query) {
    downloadLogs = downloadLogs.filter(l =>
      l.email.toLowerCase().includes(query) ||
      l.item.toLowerCase().includes(query) ||
      l.vault.toLowerCase().includes(query)
    );
  }

  const subtitle = document.getElementById("downloadsStatsModalSubtitle");
  if (subtitle) {
    subtitle.textContent = `Total Downloads Recorded: ${downloadLogs.length}`;
  }

  if (downloadLogs.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="py-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          No file download records found.
        </td>
      </tr>`;
    return;
  }

  tableBody.innerHTML = downloadLogs.map(l => {
    let formattedTime = l.timestamp;
    try {
      const dt = new Date(l.timestamp);
      if (!isNaN(dt.getTime())) {
        formattedTime = dt.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      }
    } catch(e) {}

    const cleanItem = l.item.replace(/^Downloaded:\s*/i, "");
    const uName = formatUserNameFromEmail(l.email);

    return `
      <tr class="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-emerald-50/40 dark:hover:bg-slate-900/40 transition">
        <td class="py-3 px-4 text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>📄</span>
          ${escapeAdminHtml(cleanItem)}
        </td>
        <td class="py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div>${escapeAdminHtml(uName)}</div>
          <div class="text-[10px] text-slate-400 font-mono">${escapeAdminHtml(l.email)}</div>
        </td>
        <td class="py-3 px-4 text-xs">
          <span class="px-2 py-0.5 rounded-md font-mono text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            ${escapeAdminHtml(formatVaultDisplayName(l.vault))}
          </span>
        </td>
        <td class="py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          ${escapeAdminHtml(formattedTime)}
        </td>
      </tr>`;
  }).join("");
}

// Available PIN Codes Modal
function openAvailablePinsModal() {
  const modal = document.getElementById("availablePinsModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  renderPinsList();
}

function closeAvailablePinsModal() {
  const modal = document.getElementById("availablePinsModal");
  if (modal) modal.classList.add("hidden");
}

window.openVaultStatsModal = openVaultStatsModal;
window.closeVaultStatsModal = closeVaultStatsModal;
window.renderVaultStatsTable = renderVaultStatsTable;

window.openDownloadsStatsModal = openDownloadsStatsModal;
window.closeDownloadsStatsModal = closeDownloadsStatsModal;
window.renderDownloadsStatsTable = renderDownloadsStatsTable;

window.openAvailablePinsModal = openAvailablePinsModal;
window.closeAvailablePinsModal = closeAvailablePinsModal;


function renderBlockedEmails() {
  const container = document.getElementById("adminBlockedEmailsContainer");
  if (!container) return;

  const savedBlocked = localStorage.getItem("fm_blocked_emails");
  if (savedBlocked) {
    try {
      const parsed = JSON.parse(savedBlocked);
      if (Array.isArray(parsed)) adminState.blockedEmails = parsed;
    } catch (err) {}
  }
  if (!Array.isArray(adminState.blockedEmails)) adminState.blockedEmails = [];

  if (adminState.blockedEmails.length === 0) {
    container.innerHTML = `
      <p class="py-3 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
        No blocked email accounts.
      </p>`;
    return;
  }

  container.innerHTML = adminState.blockedEmails.map(email => `
    <div class="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60">
      <div class="flex items-center gap-2 truncate">
        <span class="text-xs">🚫</span>
        <span class="text-xs font-bold text-rose-900 dark:text-rose-200 truncate">${escapeAdminHtml(email)}</span>
      </div>
      <button type="button" onclick="removeBlockedEmail('${escapeAdminHtml(email)}')" class="px-2.5 py-1 text-[11px] font-black text-rose-600 hover:bg-rose-200 dark:text-rose-300 dark:hover:bg-rose-900 rounded-lg transition">
        Unblock 🗑️
      </button>
    </div>
  `).join("");
}

function addBlockedEmail(emailStr) {
  if (!emailStr) return;
  const email = String(emailStr).trim().toLowerCase();
  if (!email || !email.includes("@")) {
    if (typeof showToast === "function") showToast("Please enter a valid Gmail address.");
    return;
  }
  if (!adminState.blockedEmails.includes(email)) {
    adminState.blockedEmails.push(email);
    localStorage.setItem("fm_blocked_emails", JSON.stringify(adminState.blockedEmails));
    renderBlockedEmails();
    if (typeof saveSharedBlockedList === "function") {
      saveSharedBlockedList(adminState.blockedEmails);
    }
    if (typeof showToast === "function") showToast(`Blocked ${email} globally.`);
  } else {
    if (typeof showToast === "function") showToast(`${email} is already blocked.`);
  }
}

function removeBlockedEmail(emailStr) {
  const email = String(emailStr).trim().toLowerCase();
  adminState.blockedEmails = adminState.blockedEmails.filter(e => e.toLowerCase() !== email);
  localStorage.setItem("fm_blocked_emails", JSON.stringify(adminState.blockedEmails));
  renderBlockedEmails();
  if (typeof saveSharedBlockedList === "function") {
    saveSharedBlockedList(adminState.blockedEmails);
  }
  if (typeof showToast === "function") showToast(`Unblocked ${email}.`);
}

window.addBlockedEmail = addBlockedEmail;
window.removeBlockedEmail = removeBlockedEmail;
window.renderBlockedEmails = renderBlockedEmails;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("addBlockEmailBtn")) {
    document.getElementById("addBlockEmailBtn").onclick = () => {
      const inp = document.getElementById("blockEmailInput");
      if (inp) {
        addBlockedEmail(inp.value);
        inp.value = "";
      }
    };
  }
});

function escapeAdminHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
