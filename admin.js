/*
  ADMIN & VISITOR TELEMETRY ENGINE (admin.js)
*/

const _ADMIN_SEC = {
  a: "OTk5OQ==", // 9999
  r: "MXlMUjBrZGFUTWk3SGJEMTFvQW8xQ205bjRieEFEVWRR", // Folder ID
  e: "Ymh1cGkuYW5pa2V0QGdhbWlsLmNvbQ==" // Bhupi.aniket@gamil.com
};

function _adminDec(str) {
  try { return atob(str); } catch(e) { return ""; }
}

const ADMIN_PIN = _adminDec(_ADMIN_SEC.a);

const adminState = {
  isAdminLoggedIn: false,
  visitorLogs: [],
  userStats: {},
  pinConfig: {
    "1717": { id: _adminDec(_ADMIN_SEC.r), name: "Academics" }
  }
};

// Load saved data from localStorage
function initAdminData() {
  try {
    const savedLogs = localStorage.getItem("fm_visitor_logs");
    if (savedLogs) adminState.visitorLogs = JSON.parse(savedLogs);

    const savedStats = localStorage.getItem("fm_user_stats");
    if (savedStats) adminState.userStats = JSON.parse(savedStats);

    const savedPins = localStorage.getItem("fm_pin_config");
    if (savedPins) {
      adminState.pinConfig = JSON.parse(savedPins);
    }

    // Always keep the built-in 1717 mapping authoritative.
    // This repairs old localStorage data from previous deployments/tests.
    adminState.pinConfig["1717"] = {
      id: _adminDec(_ADMIN_SEC.r),
      name: "Academics"
    };
  } catch (e) {
    console.warn("Error initializing admin storage:", e);
  }
}

initAdminData();

function savePinConfig() {
  // 1717 is a protected built-in mapping.
  adminState.pinConfig["1717"] = {
    id: _adminDec(_ADMIN_SEC.r),
    name: "Academics"
  };
  localStorage.setItem("fm_pin_config", JSON.stringify(adminState.pinConfig));
}

// Track user login telemetry
function trackUserLogin(email, pinUsed) {
  if (!email) return;
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
}

// Track user file download
function trackUserDownload(email, fileName) {
  if (!email) return;
  initAdminData();
  const now = new Date().toISOString();

  if (!adminState.userStats[email]) {
    trackUserLogin(email, "unknown");
  }

  adminState.userStats[email].downloads += 1;
  localStorage.setItem("fm_user_stats", JSON.stringify(adminState.userStats));

  if (adminState.isAdminLoggedIn) {
    renderAdminDashboard();
  }
}

// Render Admin Dashboard
function renderAdminDashboard() {
  initAdminData();

  const users = Object.values(adminState.userStats);
  const totalVisits = users.reduce((acc, u) => acc + (u.visits || 0), 0);
  const totalDownloads = users.reduce((acc, u) => acc + (u.downloads || 0), 0);
  const activePinsCount = Object.keys(adminState.pinConfig).length + 1; // +1 for Admin PIN 9999

  // Update counters
  if (document.getElementById("statTotalUsers")) document.getElementById("statTotalUsers").textContent = users.length.toLocaleString();
  if (document.getElementById("statTotalVisits")) document.getElementById("statTotalVisits").textContent = totalVisits.toLocaleString();
  if (document.getElementById("statTotalDownloads")) document.getElementById("statTotalDownloads").textContent = totalDownloads.toLocaleString();
  if (document.getElementById("statActivePins")) document.getElementById("statActivePins").textContent = activePinsCount.toLocaleString();

  renderVisitorsTable();
  renderPinsList();
}

// Render Visitor Telemetry Table
function renderVisitorsTable(filterQuery = "") {
  const tableBody = document.getElementById("adminVisitorTableBody");
  if (!tableBody) return;

  let users = Object.values(adminState.userStats);
  const query = filterQuery.toLowerCase().trim();

  if (query) {
    users = users.filter(u => u.email.toLowerCase().includes(query) || (u.lastPin && u.lastPin.includes(query)));
  }

  // Sort by last seen descending
  users.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));

  if (users.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="py-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          No visitor login records found.
        </td>
      </tr>`;
    return;
  }

  tableBody.innerHTML = users.map(u => {
    const formattedTime = new Date(u.lastSeen).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    return `
      <tr class="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-indigo-50/40 dark:hover:bg-slate-900/40 transition">
        <td class="py-3 px-4 text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span class="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
          ${escapeAdminHtml(u.email)}
        </td>
        <td class="py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          ${formattedTime}
        </td>
        <td class="py-3 px-4 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
          ${u.visits || 0} visit(s)
        </td>
        <td class="py-3 px-4 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
          ${u.downloads || 0} download(s)
        </td>
        <td class="py-3 px-4 text-xs">
          <span class="px-2 py-1 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            PIN: ${escapeAdminHtml(u.lastPin || "1717")}
          </span>
        </td>
      </tr>`;
  }).join("");
}

// Render Available PINs Management List
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
          <button type="button" class="text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 transition" onclick="openAdminPinModal('${p.pin}')">
            Edit ⚙️ / Manage
          </button>
          <button type="button" class="text-xs font-bold px-3 py-1.5 rounded-xl border transition ${p.isLocked ? 'border-amber-400 text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300' : 'border-slate-200 text-slate-700 bg-slate-100 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}" onclick="togglePinLock('${p.pin}')">
            ${p.isLocked ? '🔓 Unlock' : '🔒 Lock'}
          </button>
          ${p.pin !== '1717' ? `
            <button type="button" class="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/40 dark:text-rose-300 transition" onclick="removePinMapping('${p.pin}')">
              Remove
            </button>` : ''}
        ` : `<span class="text-xs font-bold text-slate-400">System Protected</span>`}
      </div>
    </div>
  `).join("");
}

// Toggle Lock folder status for PIN
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
let adminTTFilterSem = "1";
let adminTTFilterDay = "Monday";

function openAdminPinModal(pin) {
  currentEditPin = pin;
  const modal = document.getElementById("adminPinEditModal");
  if (!modal) return;

  const titleEl = document.getElementById("adminPinModalTitle");
  if (titleEl) titleEl.textContent = `Manage PIN ${pin} (${pin === "1717" ? "Academics Vault" : "Custom Vault"}) Settings`;

  renderAdminPinModalContent(pin);
  modal.classList.remove("hidden");

  const closeBtn = document.getElementById("closeAdminPinModalBtn");
  if (closeBtn) closeBtn.onclick = closeAdminPinModal;
}

function closeAdminPinModal() {
  const modal = document.getElementById("adminPinEditModal");
  if (modal) modal.classList.add("hidden");
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

  // Sub-Navigation Tabs
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
    const rawExams = localStorage.getItem("fm_exam_dates");
    const DEFAULT_EXAMS = [
      { id: "e1", sem: "1", title: "Mid-Semester Mathematics Exam", date: "15/09/2026", time: "10:00 AM - 12:00 PM", room: "Hall A-101", subject: "MATH101" },
      { id: "e2", sem: "1", title: "Physics Lab Viva & Practical", date: "18/09/2026", time: "02:00 PM - 04:00 PM", room: "Physics Lab 2", subject: "PHY102" }
    ];
    const exams = rawExams ? JSON.parse(rawExams) : DEFAULT_EXAMS;
    exams.sort((a, b) => {
      const dA = (typeof parseDateObj === "function") ? parseDateObj(a.date).getTime() : 0;
      const dB = (typeof parseDateObj === "function") ? parseDateObj(b.date).getTime() : 0;
      return dA - dB;
    });

    tabBodyHtml = `
      <!-- Add Exam Form -->
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

      <!-- Existing Exam Dates List -->
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
    const rawTT = localStorage.getItem("fm_timetables");
    const DEFAULT_TIMETABLE = {
      "1": {
        "Monday": [
          { id: "t1", time: "09:00 AM - 10:00 AM", subject: "Mathematics-1 (M-1)", room: "LH-101", faculty: "Dr. A. Sharma" },
          { id: "t2", time: "10:00 AM - 11:00 AM", subject: "Physics-1", room: "LH-102", faculty: "Prof. R. Verma" }
        ]
      }
    };
    const tt = rawTT ? JSON.parse(rawTT) : DEFAULT_TIMETABLE;
    const dayPeriods = (tt[adminTTFilterSem] && tt[adminTTFilterSem][adminTTFilterDay]) ? tt[adminTTFilterSem][adminTTFilterDay] : [];

    const sems = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    tabBodyHtml = `
      <!-- Add Period Form -->
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

      <!-- Existing Class Periods List -->
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

  const raw = localStorage.getItem("fm_exam_dates");
  const DEFAULT_EXAMS = [
    { id: "e1", sem: "1", title: "Mid-Semester Mathematics Exam", date: "15/09/2026", time: "10:00 AM - 12:00 PM", room: "Hall A-101", subject: "MATH101" }
  ];
  const exams = raw ? JSON.parse(raw) : DEFAULT_EXAMS;
  exams.push({
    id: "e_" + Date.now(),
    sem: String(sem),
    title: title.trim(),
    date: date.trim(),
    time: time.trim(),
    room: room.trim(),
    subject: subject.trim()
  });

  localStorage.setItem("fm_exam_dates", JSON.stringify(exams));
  if (typeof showToast === "function") showToast("Added exam date!");
  renderAdminPinModalContent(pin);

  if (typeof renderExamsView === "function") renderExamsView(sem);
}

function adminModalDeleteExam(id, pin) {
  const DEFAULT_EXAMS = [
    { id: "e1", sem: "1", title: "Mid-Semester Mathematics Exam", date: "2026-09-15", time: "10:00 AM - 12:00 PM", room: "Hall A-101", subject: "MATH101" },
    { id: "e2", sem: "1", title: "Physics Lab Viva & Practical", date: "2026-09-18", time: "02:00 PM - 04:00 PM", room: "Physics Lab 2", subject: "PHY102" },
    { id: "e3", sem: "2", title: "End-Sem Data Structures Exam", date: "2026-10-05", time: "09:30 AM - 12:30 PM", room: "Auditorium", subject: "CS201" },
    { id: "e4", sem: "3", title: "Operating Systems Theory Exam", date: "2026-10-12", time: "01:30 PM - 04:30 PM", room: "Hall B-204", subject: "CS301" }
  ];
  const raw = localStorage.getItem("fm_exam_dates");
  let exams = raw ? JSON.parse(raw) : DEFAULT_EXAMS;
  exams = exams.filter(e => String(e.id) !== String(id));
  localStorage.setItem("fm_exam_dates", JSON.stringify(exams));
  if (typeof showToast === "function") showToast("Deleted exam entry.");
  renderAdminPinModalContent(pin);

  if (typeof renderExamsView === "function") renderExamsView();
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

  const raw = localStorage.getItem("fm_timetables");
  const tt = raw ? JSON.parse(raw) : {};
  if (!tt[sem]) tt[sem] = {};
  if (!tt[sem][day]) tt[sem][day] = [];

  tt[sem][day].push({
    id: "t_" + Date.now(),
    time: time.trim(),
    subject: subject.trim(),
    room: room.trim(),
    faculty: faculty.trim()
  });

  localStorage.setItem("fm_timetables", JSON.stringify(tt));
  if (typeof showToast === "function") showToast(`Added class period for Sem ${sem} (${day})!`);
  renderAdminPinModalContent(pin);

  if (typeof renderTimetableView === "function") renderTimetableView(sem, day);
}

function adminModalDeleteTTSlot(id, pin) {
  const DEFAULT_TIMETABLE = {
    "1": {
      "Monday": [
        { id: "t1", time: "09:00 AM - 10:00 AM", subject: "Mathematics-1 (M-1)", room: "LH-101", faculty: "Dr. A. Sharma" },
        { id: "t2", time: "10:00 AM - 11:00 AM", subject: "Physics-1", room: "LH-102", faculty: "Prof. R. Verma" }
      ]
    }
  };
  const raw = localStorage.getItem("fm_timetables");
  const tt = raw ? JSON.parse(raw) : DEFAULT_TIMETABLE;
  if (tt[adminTTFilterSem] && tt[adminTTFilterSem][adminTTFilterDay]) {
    tt[adminTTFilterSem][adminTTFilterDay] = tt[adminTTFilterSem][adminTTFilterDay].filter(p => String(p.id) !== String(id));
    localStorage.setItem("fm_timetables", JSON.stringify(tt));
    if (typeof showToast === "function") showToast("Deleted timetable slot.");
    renderAdminPinModalContent(pin);

    if (typeof renderTimetableView === "function") renderTimetableView(adminTTFilterSem, adminTTFilterDay);
  }
}

// Global Window bindings for inline onclick listeners
window.adminModalDeleteExam = adminModalDeleteExam;
window.adminModalDeleteTTSlot = adminModalDeleteTTSlot;
window.adminModalAddExam = adminModalAddExam;
window.adminModalAddTTSlot = adminModalAddTTSlot;
window.openAdminPinModal = openAdminPinModal;
window.closeAdminPinModal = closeAdminPinModal;
window.switchAdminModalTab = switchAdminModalTab;
window.togglePinLock = togglePinLock;

// Add new custom PIN mapping
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

// Remove PIN mapping
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

// Export Telemetry Log
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

// Clear Telemetry Data
function clearVisitorLogs() {
  if (confirm("Are you sure you want to clear all visitor telemetry data?")) {
    adminState.visitorLogs = [];
    adminState.userStats = {};
    localStorage.removeItem("fm_visitor_logs");
    localStorage.removeItem("fm_user_stats");
    if (typeof showToast === "function") showToast("Cleared visitor telemetry.");
    renderAdminDashboard();
  }
}

function escapeAdminHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
