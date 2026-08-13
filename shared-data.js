/*
  GLOBAL SHARED DATA SYNC
  Google Sheets + Google Apps Script Web App
*/

// Paste your deployed Google Apps Script Web App URL here.
const SHARED_DATA_API_URL = "https://script.google.com/macros/s/AKfycbxhqMdRnD9mNQ4IjHvQGRqL_7hC1ZbXaklc0J0TY27i6W8T5TqvdIpWDC3jl-NE04FV/exec";

// Must match the token stored in Apps Script > Project Settings > Script Properties.
// NOTE: This is a lightweight protection only; anything in frontend JS is visible to users.
const SHARED_DATA_TOKEN = "Aniketexamtimetabledatemangement";

const SHARED_EXAMS_KEY = "fm_exam_dates";
const SHARED_TIMETABLE_KEY = "fm_timetables";

function sharedDataConfigured() {
  return Boolean(
    SHARED_DATA_API_URL &&
    !SHARED_DATA_API_URL.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT")
  );
}

async function sharedDataRequest(action, method = "GET", payload = null) {
  if (!sharedDataConfigured()) {
    throw new Error("Shared Google Sheets API URL is not configured.");
  }

  let url = SHARED_DATA_API_URL;
  const options = { method, redirect: "follow" };

  if (method === "GET") {
    url += `?action=${encodeURIComponent(action)}&token=${encodeURIComponent(SHARED_DATA_TOKEN)}`;
  } else {
    options.headers = { "Content-Type": "text/plain;charset=utf-8" };
    options.body = JSON.stringify({
      action,
      token: SHARED_DATA_TOKEN,
      ...(payload || {})
    });
  }

  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Shared data API error (${response.status})`);

  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Shared data request failed.");
  return data;
}

async function loadSharedData(showError = false) {
  if (!sharedDataConfigured()) return null;

  try {
    const data = await sharedDataRequest("bootstrap");

    const exams = Array.isArray(data.exams) ? data.exams : [];
    const timetable = data.timetable && typeof data.timetable === "object" ? data.timetable : {};

    localStorage.setItem(SHARED_EXAMS_KEY, JSON.stringify(exams));
    localStorage.setItem(SHARED_TIMETABLE_KEY, JSON.stringify(timetable));

    return { exams, timetable };
  } catch (error) {
    console.warn("Global data sync failed:", error);
    if (showError && typeof showToast === "function") {
      showToast("Could not sync shared exam/timetable data.");
    }
    return null;
  }
}

async function saveSharedExams(exams) {
  if (!sharedDataConfigured()) return false;
  try {
    await sharedDataRequest("saveExams", "POST", { exams });
    return true;
  } catch (error) {
    console.error("Saving exams to Google Sheets failed:", error);
    if (typeof showToast === "function") showToast("Exam data could not be saved globally.");
    return false;
  }
}

async function saveSharedTimetable(timetable) {
  if (!sharedDataConfigured()) return false;
  try {
    await sharedDataRequest("saveTimetable", "POST", { timetable });
    return true;
  } catch (error) {
    console.error("Saving timetable to Google Sheets failed:", error);
    if (typeof showToast === "function") showToast("Timetable could not be saved globally.");
    return false;
  }
}

async function refreshSharedExams() {
  const data = await loadSharedData(false);
  if (data && typeof renderExamsView === "function") renderExamsView(activeExamsSem, true);
  return data?.exams || null;
}

async function refreshSharedTimetable() {
  const data = await loadSharedData(false);
  if (data && typeof renderTimetableView === "function") {
    renderTimetableView(activeTTState.sem, activeTTState.day, true);
  }
  return data?.timetable || null;
}

// Initial background sync. The existing local cache/defaults keep the UI usable while it loads.
document.addEventListener("DOMContentLoaded", () => {
  loadSharedData(false);
});
