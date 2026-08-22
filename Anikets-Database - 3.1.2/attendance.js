let currentSearchQuery = "";
let currentStatusFilter = "all";

const $ = id => document.getElementById(id);

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let searchDebounceTimer = null;
function initAttendanceEvents() {
  const searchInp = $("searchInput");
  if (searchInp) {
    const handleSearchInput = (val) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        requestAnimationFrame(() => renderAttendanceView(val, currentStatusFilter));
      }, 30);
    };
    searchInp.oninput = e => handleSearchInput(e.target.value);
    searchInp.onsearch = e => handleSearchInput(e.target.value);
  }

  const filterSel = $("statusFilter");
  if (filterSel) {
    filterSel.onchange = e => renderAttendanceView(currentSearchQuery, e.target.value);
  }

  const themeBtn = $("themeToggleBtn");
  if (themeBtn) {
    themeBtn.onclick = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const moonIcon = `<div class="theme-icon-circle"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg></div>`;
      const sunIcon = `<div class="theme-icon-circle"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg></div>`;
      if (isDark) {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        themeBtn.innerHTML = sunIcon;
      } else {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
        themeBtn.innerHTML = moonIcon;
      }
    };
  }
}

async function initAttendanceView() {
  if (typeof fetchLiveGoogleSheetAttendance === "function") {
    await fetchLiveGoogleSheetAttendance();
  }
  renderAttendanceView();
}

function renderAttendanceView(searchQuery = currentSearchQuery, statusFilter = currentStatusFilter) {
  currentSearchQuery = searchQuery;
  currentStatusFilter = statusFilter;

  const attendanceData = (typeof getStoredAttendance === "function") ? getStoredAttendance() : [];
  const query = searchQuery.toLowerCase().trim();

  const totalStudents = attendanceData.length;
  const avgAttendance = totalStudents > 0
    ? (attendanceData.reduce((acc, s) => acc + Number(s.average || 0), 0) / totalStudents).toFixed(1)
    : "0.0";
  const lowCount = attendanceData.filter(s => Number(s.average || 0) < 75).length;
  const topAvg = totalStudents > 0
    ? Math.max(...attendanceData.map(s => Number(s.average || 0))).toFixed(1)
    : "0.0";

  if ($("statTotalStudents")) $("statTotalStudents").textContent = totalStudents;
  if ($("statClassAverage")) $("statClassAverage").textContent = `${avgAttendance}%`;
  if ($("statLowCount")) $("statLowCount").textContent = lowCount;
  if ($("statTopAttendance")) $("statTopAttendance").textContent = `${topAvg}%`;

  const container = $("studentContainer");
  if (!container) return;

  // FAST PATH: Toggle visibility on existing DOM cards for 60fps instant search
  const existingCards = container.querySelectorAll("[data-student-usn]");
  if (existingCards.length === attendanceData.length && existingCards.length > 0) {
    let matchCount = 0;
    existingCards.forEach(card => {
      const usn = (card.getAttribute("data-student-usn") || "").toLowerCase();
      const name = (card.getAttribute("data-student-name") || "").toLowerCase();
      const avg = Number(card.getAttribute("data-student-avg") || 0);

      const matchesQuery = !query || usn.includes(query) || name.includes(query);
      let matchesStatus = true;
      if (statusFilter === "low") matchesStatus = avg < 75;
      else if (statusFilter === "good") matchesStatus = avg >= 75;

      const isVisible = matchesQuery && matchesStatus;
      if (isVisible) matchCount++;
      card.style.display = isVisible ? "block" : "none";
    });

    let noMatchEl = $("noMatchMsg");
    if (matchCount === 0) {
      if (!noMatchEl) {
        noMatchEl = document.createElement("div");
        noMatchEl.id = "noMatchMsg";
        noMatchEl.className = "p-10 text-center glass rounded-3xl";
        container.appendChild(noMatchEl);
      }
      noMatchEl.style.display = "block";
      noMatchEl.innerHTML = `
        <div class="text-3xl mb-2">🔍</div>
        <p class="text-sm font-extrabold text-slate-700 dark:text-slate-300">No student attendance records match "${escapeHtml(searchQuery)}".</p>
        <p class="mt-1 text-xs text-slate-400">Try searching by another USN or Name.</p>`;
    } else if (noMatchEl) {
      noMatchEl.style.display = "none";
    }
    return;
  }

  // SLOW PATH: First render all student cards with metadata attributes
  container.innerHTML = attendanceData.map(st => {
    const avg = Number(st.average || 0);
    const usnLower = (st.usn || "").toLowerCase();
    const nameLower = (st.name || "").toLowerCase();

    const matchesQuery = !query || usnLower.includes(query) || nameLower.includes(query);
    let matchesStatus = true;
    if (statusFilter === "low") matchesStatus = avg < 75;
    else if (statusFilter === "good") matchesStatus = avg >= 75;
    const isVisible = matchesQuery && matchesStatus;

    let badgeBg = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
    let statusLabel = "Eligible";
    if (avg < 75) {
      badgeBg = "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse";
      statusLabel = "Shortage ⚠️";
    } else if (avg < 85) {
      badgeBg = "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      statusLabel = "Satisfactory";
    }

    const mainEntries = Object.entries(st.main || {});
    const mdmEntries = Object.entries(st.mdm || {}).filter(([_, val]) => val !== undefined && val !== null && val !== "");
    const openEntries = Object.entries(st.openElective || {}).filter(([_, val]) => val !== undefined && val !== null && val !== "");

    return `
      <div class="student-card p-5 rounded-3xl glass border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-2xl hover:scale-[1.015] hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 transform-gpu cursor-pointer select-none space-y-4"
        style="display: ${isVisible ? 'block' : 'none'};"
        data-student-usn="${escapeHtml(st.usn)}"
        data-student-name="${escapeHtml(st.name)}"
        data-student-avg="${avg}">
        <div class="flex items-start justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl ${avg < 75 ? 'bg-rose-500/20 text-rose-600' : 'bg-emerald-500/20 text-emerald-600'} font-black text-lg">
              🎓
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="text-base font-black text-slate-900 dark:text-slate-100">${escapeHtml(st.name)}</h4>
                <span class="px-2.5 py-0.5 text-[11px] font-mono font-black uppercase rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  ${escapeHtml(st.usn)}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Click for full subject metrics breakdown</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-right">
              <div class="text-[10px] font-black uppercase tracking-wider text-slate-400">Average Attendance</div>
              <div class="px-3 py-1 rounded-xl text-sm font-black border ${badgeBg} inline-block mt-0.5 shadow-sm">
                ${avg.toFixed(1)}% (${statusLabel})
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <div class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Subject-wise Attendance</div>
          <div class="flex flex-wrap items-center gap-2">
            ${mainEntries.map(([sub, val]) => `
              <div class="px-2.5 py-1 rounded-xl glass border border-slate-200 dark:border-slate-800 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                <span class="text-slate-500 dark:text-slate-400">${escapeHtml(sub)}:</span>
                <span class="${Number(val) < 75 ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-900 dark:text-slate-100'}">${val}%</span>
              </div>
            `).join("")}

            ${mdmEntries.map(([sub, val]) => `
              <div class="px-2.5 py-1 rounded-xl glass border border-amber-300/60 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                <span class="text-amber-700 dark:text-amber-400 font-bold">${escapeHtml(sub)} (MDM):</span>
                <span class="${Number(val) < 75 ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-amber-900 dark:text-amber-200'}">${val}%</span>
              </div>
            `).join("")}

            ${openEntries.map(([sub, val]) => `
              <div class="px-2.5 py-1 rounded-xl glass border border-purple-300/60 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                <span class="text-purple-700 dark:text-purple-400 font-bold">${escapeHtml(sub)} (OE):</span>
                <span class="${Number(val) < 75 ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-purple-900 dark:text-purple-200'}">${val}%</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }).join("");

  if (!container._hasDelegate) {
    container._hasDelegate = true;
    container.addEventListener("click", (e) => {
      const card = e.target.closest("[data-student-usn]");
      if (card) {
        const usn = card.getAttribute("data-student-usn");
        if (usn) showStudentModal(usn);
      }
    });
  }
}

function getAttendanceModalElement() {
  let el = $("studentModal") || $("studentAttendanceModal");
  if (!el) {
    el = document.createElement("div");
    el.id = "studentModal";
    el.className = "hidden fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md cursor-pointer modal-backdrop-animate";
    el.onclick = function(e) { if(e.target === this) closeStudentModal(); };
    el.innerHTML = `
      <div onclick="event.stopPropagation()" class="glass modal-card-animate w-full max-w-2xl max-h-[88vh] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 flex flex-col overflow-hidden relative cursor-default">
        <div class="mb-4 flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm">
              📊
            </div>
            <div>
              <h3 id="modalStudentTitle" class="text-lg font-black text-slate-900 dark:text-slate-100">Student Attendance Breakdown</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Subject metrics and exam eligibility status</p>
            </div>
          </div>
          <button onclick="closeStudentModal()" type="button" class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 transition">✕</button>
        </div>
        <div id="modalStudentContent" class="overflow-y-auto flex-1 space-y-4 pr-1"></div>
      </div>
    `;
  }
  if (el && el.parentNode !== document.body) {
    document.body.appendChild(el);
  }
  return el;
}

function showStudentModal(usn) {
  try {
    const modal = getAttendanceModalElement();
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("modal-backdrop-animate");
      const cardEl = modal.querySelector(".glass");
      if (cardEl) {
        cardEl.classList.remove("modal-card-animate");
        void cardEl.offsetWidth; // trigger reflow
        cardEl.classList.add("modal-card-animate");
      }
      modal.removeAttribute("hidden");
      modal.setAttribute("style", "display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 999999 !important; background-color: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); justify-content: center; align-items: center; pointer-events: auto !important;");
    }

    const attendanceData = (typeof getStoredAttendance === "function") ? getStoredAttendance() : [];
    const cleanUsn = String(usn || "").trim().toLowerCase();

    let student = attendanceData.find(s =>
      s && (
        (s.usn && String(s.usn).trim().toLowerCase() === cleanUsn) ||
        (s.name && String(s.name).trim().toLowerCase() === cleanUsn)
      )
    );

    if (!student && typeof DEFAULT_ATTENDANCE !== "undefined" && Array.isArray(DEFAULT_ATTENDANCE)) {
      student = DEFAULT_ATTENDANCE.find(s =>
        s && (
          (s.usn && String(s.usn).trim().toLowerCase() === cleanUsn) ||
          (s.name && String(s.name).trim().toLowerCase() === cleanUsn)
        )
      );
    }

    if (!student) {
      student = {
        usn: String(usn || "CS25128"),
        name: "Student Record",
        average: 85,
        main: { "CAO": 85, "DSA": 85, "ED": 85, "DMGT": 85 },
        mdm: {},
        openElective: {}
      };
    }

    const titleEl = $("modalStudentTitle") || $("studentAttendanceModalTitle");
    if (titleEl) titleEl.textContent = `${student.name} (${student.usn})`;

    const contentEl = $("modalStudentContent") || $("studentAttendanceModalContent");
    if (!contentEl) return;

    const avg = Number(student.average || 0);

    const mainEntries = student && student.main && typeof student.main === "object" ? Object.entries(student.main) : [];
    const mdmEntries = student && student.mdm && typeof student.mdm === "object"
      ? Object.entries(student.mdm).filter(([_, val]) => val !== undefined && val !== null && val !== "")
      : [];
    const openEntries = student && student.openElective && typeof student.openElective === "object"
      ? Object.entries(student.openElective).filter(([_, val]) => val !== undefined && val !== null && val !== "")
      : [];

    contentEl.innerHTML = `
      <div class="p-3.5 sm:p-4 rounded-2xl glass border border-slate-200 dark:border-slate-800 space-y-2 bg-gradient-to-r from-indigo-50/50 via-emerald-50/30 to-teal-50/50 dark:from-indigo-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Cumulative Average</span>
            <h4 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">${avg.toFixed(1)}%</h4>
          </div>
          <div class="px-2.5 py-1 rounded-xl text-[11px] font-black ${avg < 75 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}">
            ${avg >= 75 ? 'Exam Eligible ✅' : 'Attendance Shortage ⚠️'}
          </div>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div class="modal-progress-bar h-full rounded-full transition-all duration-700 ease-out ${avg < 75 ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}" style="width: 0%;" data-target-width="${Math.min(avg, 100)}%"></div>
        </div>
      </div>

      <div class="space-y-1.5">
        <h5 class="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Main Subjects (Mandatory)</h5>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          ${mainEntries.map(([sub, val]) => `
            <div class="p-2.5 rounded-xl glass border border-slate-200 dark:border-slate-800 space-y-1">
              <div class="flex items-center justify-between text-xs font-extrabold">
                <span class="text-slate-800 dark:text-slate-200 truncate pr-1">${escapeHtml(sub)}</span>
                <span class="${Number(val) < 75 ? 'text-rose-600 font-black' : 'text-slate-900 dark:text-slate-100'}">${val}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div class="modal-progress-bar h-full rounded-full transition-all duration-700 ease-out ${Number(val) < 75 ? 'bg-rose-500' : 'bg-indigo-600'}" style="width: 0%;" data-target-width="${Math.min(Number(val), 100)}%"></div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      ${mdmEntries.length > 0 ? `
        <div class="space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800">
          <h5 class="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">MDM Elective Subjects</h5>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${mdmEntries.map(([sub, val]) => `
              <div class="p-2.5 rounded-xl glass border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-1">
                <div class="flex items-center justify-between text-xs font-extrabold">
                  <span class="text-amber-900 dark:text-amber-200 truncate pr-1">${escapeHtml(sub)}</span>
                  <span class="${Number(val) < 75 ? 'text-rose-600 font-black' : 'text-amber-900 dark:text-amber-100'}">${val}%</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="modal-progress-bar h-full rounded-full transition-all duration-700 ease-out ${Number(val) < 75 ? 'bg-rose-500' : 'bg-amber-500'}" style="width: 0%;" data-target-width="${Math.min(Number(val), 100)}%"></div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ''}

      ${openEntries.length > 0 ? `
        <div class="space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800">
          <h5 class="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">Open Elective Subjects</h5>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${openEntries.map(([sub, val]) => `
              <div class="p-2.5 rounded-xl glass border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 space-y-1">
                <div class="flex items-center justify-between text-xs font-extrabold">
                  <span class="text-purple-900 dark:text-purple-200 truncate pr-1">${escapeHtml(sub)}</span>
                  <span class="${Number(val) < 75 ? 'text-rose-600 font-black' : 'text-purple-900 dark:text-purple-100'}">${val}%</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="modal-progress-bar h-full rounded-full transition-all duration-700 ease-out ${Number(val) < 75 ? 'bg-rose-500' : 'bg-purple-500'}" style="width: 0%;" data-target-width="${Math.min(Number(val), 100)}%"></div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ''}
    `;

    // Smoothly animate progress bars fill after modal opens
    requestAnimationFrame(() => {
      setTimeout(() => {
        contentEl.querySelectorAll(".modal-progress-bar").forEach(bar => {
          const targetWidth = bar.getAttribute("data-target-width");
          if (targetWidth) bar.style.width = targetWidth;
        });
      }, 50);
    });

  } catch (err) {
    console.error("Error showing student modal:", err);
  }
}

function closeStudentModal() {
  const modal = getAttendanceModalElement();
  if (modal) {
    modal.classList.add("hidden");
    modal.setAttribute("style", "display: none !important;");
  }
}

window.showStudentModal = showStudentModal;
window.showStudentAttendanceDetail = showStudentModal;
window.closeStudentModal = closeStudentModal;
window.closeStudentAttendanceModal = closeStudentModal;

document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-student-usn]");
  if (card) {
    const usn = card.dataset.studentUsn;
    if (usn) {
      showStudentModal(usn);
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  initAttendanceEvents();
  initAttendanceView();
});
