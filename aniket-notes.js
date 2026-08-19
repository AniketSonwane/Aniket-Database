const VAULT_CONFIG = {
  pin: "1111",
  folderId: "1yLR0kdaTMi7HbD1-oAo1Cm9n4bxADUdQ",
  folderName: "Aniket-Notes",
  driveUrl: "https://drive.google.com/drive/folders/1yLR0kdaTMi7HbD1-oAo1Cm9n4bxADUdQ",
  apiKey: atob("QUl6YVN5QTdLcU1vMU9XMFFzTC0xMy1TOWZZLVI5aXlhRlNkTDdJ")
};

const vaultState = {
  isUnlocked: true,
  pinEntered: "",
  items: [],
  vaultIndex: [],
  currentSubject: null,
  currentCategory: null,
  breadcrumb: []
};

// Curated subjects & topics structure matching the exact wireframe
const NOTES_DATA = {
  "DSA": {
    name: "Data Structures & Algorithms",
    code: "DSA",
    icon: "🧬",
    color: "from-indigo-500 to-violet-600",
    categories: [
      {
        title: "Sorting Algorithms",
        icon: "🔀",
        topics: [
          { id: "Bubble_Sort", name: "Bubble Sort", desc: "Interactive visualization & step-by-step sorting notes", localUrl: "./Aniket-Notes/DSA/Bubble_Sort/bubblesort.html" },
          { id: "Selection_Sort", name: "Selection Sort", desc: "Interactive visualization & step-by-step selection sorting notes", localUrl: "./Aniket-Notes/DSA/Selection_Sort/selectionsort.html" },
          { id: "Quick_Sort", name: "Quick Sort", desc: "Pivot partitioning visualization & algorithmic breakdown", localUrl: "./Aniket-Notes/DSA/Quick_Sort/quicksort.html" },
          { id: "Merge_Sort", name: "Merge Sort", desc: "Divide-and-conquer merge visualization & complexity notes", localUrl: "./Aniket-Notes/DSA/Merge_Sort/mergesort.html" },
          { id: "Radix_Sort", name: "Radix Sort", desc: "Non-comparative digit-by-digit sorting visualizer & notes", localUrl: "./Aniket-Notes/DSA/Radix_Sort/radixsort.html" }
        ]
      },
      {
        title: "Searching Algorithms",
        icon: "🔍",
        topics: [
          { id: "Binary_Search", name: "Binary Search", desc: "O(log n) divide-and-conquer search visualizer & notes", localUrl: "./Aniket-Notes/DSA/Binary_Search/binarysearch.html" },
          { id: "Linear_Search", name: "Linear Search", desc: "Sequential array element traversal visualizer & notes", localUrl: "./Aniket-Notes/DSA/Linear_Search/linearsearch.html" }
        ]
      }
    ]
  }
};

function $(id) {
  return document.getElementById(id);
}

function showToast(msg) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("opacity-0", "translate-y-4");
  toast.classList.add("opacity-100", "translate-y-0");
  setTimeout(() => {
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "translate-y-4");
  }, 2800);
}

function updatePinDots() {
  const dots = document.querySelectorAll("#pinDots span");
  dots.forEach((dot, index) => {
    if (index < vaultState.pinEntered.length) {
      dot.classList.add("filled");
    } else {
      dot.classList.remove("filled");
    }
  });
}

function pressPinKey(digit) {
  if (vaultState.pinEntered.length < 4) {
    vaultState.pinEntered += digit;
    updatePinDots();
    if (vaultState.pinEntered.length === 4) {
      setTimeout(submitPin, 100);
    }
  }
}

function deletePinKey() {
  if (vaultState.pinEntered.length > 0) {
    vaultState.pinEntered = vaultState.pinEntered.slice(0, -1);
    updatePinDots();
  }
}

function resetPin() {
  vaultState.pinEntered = "";
  updatePinDots();
}

function submitPin() {
  if (vaultState.pinEntered === VAULT_CONFIG.pin) {
    vaultState.isUnlocked = true;
    sessionStorage.setItem("vault_1111_unlocked", "true");
    unlockVaultUI();
  } else {
    $("pinMessage").textContent = "Incorrect PIN. Try 1111.";
    const card = document.querySelector(".pin-card");
    if (card) {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 380);
    }
    resetPin();
  }
}

function unlockVaultUI() {
  $("pinScreen").classList.add("hidden");
  $("vaultScreen").classList.remove("hidden");
  renderAniketNotesHome();
  loadDriveFiles();
}

function lockVault() {
  vaultState.isUnlocked = false;
  sessionStorage.removeItem("vault_1111_unlocked");
  resetPin();
  $("pinScreen").classList.remove("hidden");
  $("vaultScreen").classList.add("hidden");
  if ($("pinMessage")) $("pinMessage").textContent = "";
  closeFilePreviewModal();
  closeSettingsModal();
}

function renderAniketNotesHome() {
  vaultState.currentSubject = null;
  if ($("breadcrumbView")) {
    $("breadcrumbView").classList.add("hidden");
    $("breadcrumbView").innerHTML = "";
  }

  const subjectsContainer = $("subjectsContainer");
  if (!subjectsContainer) return;

  const subjects = Object.keys(NOTES_DATA);
  
  let html = `
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h3 class="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          📚 Subjects
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Select a subject to view categorized notes.</p>
      </div>
      <span class="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
        ${subjects.length} Subjects Available
      </span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
  `;

  subjects.forEach(code => {
    const sub = NOTES_DATA[code];
    html += `
      <div onclick="openSubject('${code}')" class="group relative overflow-hidden rounded-2xl p-4 sm:p-5 glass border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer transition-all duration-300 hover:-translate-y-1">
        <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${sub.color} text-white text-xl shadow-md group-hover:scale-110 transition-transform">
          ${sub.icon}
        </div>
        <h4 class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          ${sub.code}
        </h4>
        <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
          ${sub.name}
        </p>
        <div class="mt-3 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400 opacity-80 group-hover:opacity-100">
          <span>${sub.categories.length} Modules</span>
          <span>Explore →</span>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  subjectsContainer.innerHTML = html;
}

function openSubject(code) {
  const sub = NOTES_DATA[code];
  if (!sub) return;

  vaultState.currentSubject = sub;
  if ($("breadcrumbView")) {
    $("breadcrumbView").classList.remove("hidden");
    $("breadcrumbView").innerHTML = `
      <button onclick="renderAniketNotesHome()" class="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition">Aniket-Notes</button>
      <span class="text-slate-400">/</span>
      <span class="text-indigo-600 dark:text-indigo-400 font-black">${sub.code}</span>
    `;
  }

  const subjectsContainer = $("subjectsContainer");
  if (!subjectsContainer) return;

  let html = `
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-3">
        <button onclick="renderAniketNotesHome()" class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition">
          ←
        </button>
        <div>
          <h3 class="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>${sub.icon}</span> ${sub.name} (${sub.code})
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Categorized notes, algorithms & modules</p>
        </div>
      </div>
    </div>
  `;

  sub.categories.forEach(cat => {
    html += `
      <div class="mb-7 glass rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>${cat.icon}</span> ${cat.title}
          </h4>
          <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">${cat.topics.length} items</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
    `;

    cat.topics.forEach(topic => {
      html += `
        <div onclick="previewTopic('${topic.id}', '${escapeAttr(topic.name)}', '${topic.localUrl}')" class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 cursor-pointer transition group">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">💻</span>
              <h5 class="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                ${topic.name}
              </h5>
            </div>
            <span class="text-xs text-slate-400 group-hover:text-indigo-500 transition">🚀</span>
          </div>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            ${topic.desc}
          </p>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  subjectsContainer.innerHTML = html;
}

function escapeAttr(str) {
  return (str || "").replace(/'/g, "\\'");
}

function handleSearch(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) {
    if (vaultState.currentSubject) {
      openSubject(vaultState.currentSubject.code);
    } else {
      renderAniketNotesHome();
    }
    return;
  }

  const subjectsContainer = $("subjectsContainer");
  if (!subjectsContainer) return;

  const matches = [];
  Object.keys(NOTES_DATA).forEach(code => {
    const sub = NOTES_DATA[code];
    sub.categories.forEach(cat => {
      cat.topics.forEach(topic => {
        if (topic.name.toLowerCase().includes(q) || topic.desc.toLowerCase().includes(q) || sub.name.toLowerCase().includes(q) || cat.title.toLowerCase().includes(q)) {
          matches.push({ ...topic, subjectCode: sub.code, subjectName: sub.name, catTitle: cat.title });
        }
      });
    });
  });

  let html = `
    <div class="mb-4">
      <h3 class="text-base font-black text-slate-900 dark:text-slate-100">
        Search Results for "${query}" (${matches.length} found)
      </h3>
    </div>
  `;

  if (matches.length === 0) {
    html += `
      <div class="py-12 text-center glass rounded-2xl">
        <span class="text-3xl">🔍</span>
        <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">No matching topics or notes found</p>
        <button onclick="renderAniketNotesHome()" class="mt-3 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline">Clear Search</button>
      </div>
    `;
  } else {
    html += `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">`;
    matches.forEach(topic => {
      html += `
        <div onclick="previewTopic('${topic.id}', '${escapeAttr(topic.name)}', '${topic.localUrl}')" class="p-3.5 rounded-xl glass border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 cursor-pointer transition group">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 text-[9px] font-extrabold rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">${topic.subjectCode}</span>
            <span class="text-xs text-slate-400">👁️</span>
          </div>
          <h5 class="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            ${topic.name}
          </h5>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${topic.desc}</p>
        </div>
      `;
    });
    html += `</div>`;
  }

  subjectsContainer.innerHTML = html;
}

function previewTopic(id, name, localUrl) {
  const targetUrl = localUrl || `./Aniket-Notes/DSA/${id}/${id.replace('_', '').toLowerCase()}.html`;
  window.location.href = targetUrl;
}

function closeFilePreviewModal() {
  const modal = $("filePreviewModal");
  const iframe = $("previewIframe");
  if (modal) {
    modal.classList.add("hidden");
    modal.setAttribute("style", "display: none !important;");
  }
  if (iframe) iframe.src = "about:blank";
}

function openSettingsModal() {
  const modal = $("settingsModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.setAttribute("style", "display: flex !important; position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 999999; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); justify-content: center; align-items: center;");
  }
}

function closeSettingsModal() {
  const modal = $("settingsModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.setAttribute("style", "display: none !important;");
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  document.documentElement.classList.toggle("dark", !isDark);
  document.documentElement.classList.toggle("light", isDark);
  localStorage.setItem("fm_theme", newTheme);
  showToast(`Theme switched to ${newTheme} mode`);
}

async function loadDriveFiles() {
  if (!VAULT_CONFIG.apiKey) return;
  try {
    const q = `'${VAULT_CONFIG.folderId}' in parents and trashed = false`;
    const fields = "files(id,name,mimeType,size,modifiedTime,webContentLink,webViewLink)";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&pageSize=100&key=${encodeURIComponent(VAULT_CONFIG.apiKey.trim())}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.files) {
        vaultState.items = data.files;
      }
    }
  } catch (e) {
    console.warn("Drive sync notice:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const isDark = (localStorage.getItem("fm_theme") || "dark") === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);

  renderAniketNotesHome();
  loadDriveFiles();
});
