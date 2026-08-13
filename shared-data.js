const SHARED_DATA_API_URL = "https://script.google.com/macros/s/AKfycbxhqMdRnD9mNQ4IjHvQGRqL_7hC1ZbXaklc0J0TY27i6W8T5TqvdIpWDC3jl-NE04FV/exec";
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

let sharedDataInFlightPromise = null;

async function loadSharedData(showError = false) {
  if (!sharedDataConfigured()) return null;
  if (sharedDataInFlightPromise) return sharedDataInFlightPromise;

  sharedDataInFlightPromise = (async () => {
    try {
      const data = await sharedDataRequest("bootstrap");

      const exams = Array.isArray(data.exams) ? data.exams : [];
      const timetable = data.timetable && typeof data.timetable === "object" ? data.timetable : {};
      const activityLogs = Array.isArray(data.activityLogs) ? data.activityLogs : [];
      const blockedEmails = Array.isArray(data.blockedEmails) ? data.blockedEmails : [];
      const pinConfig = data.pinConfig && typeof data.pinConfig === "object" ? data.pinConfig : null;

      localStorage.setItem(SHARED_EXAMS_KEY, JSON.stringify(exams));
      localStorage.setItem(SHARED_TIMETABLE_KEY, JSON.stringify(timetable));
      localStorage.setItem("fm_shared_activity_logs", JSON.stringify(activityLogs));
      localStorage.setItem("fm_blocked_emails", JSON.stringify(blockedEmails));
      if (pinConfig) {
        localStorage.setItem("fm_pin_config", JSON.stringify(pinConfig));
      }

      if (typeof adminState !== "undefined") {
        adminState.blockedEmails = blockedEmails;
        if (pinConfig) adminState.pinConfig = pinConfig;
      }

      return { exams, timetable, activityLogs, blockedEmails, pinConfig };
    } catch (error) {
      console.warn("Global data sync failed:", error);
      if (showError && typeof showToast === "function") {
        showToast("Could not sync shared exam/timetable data.");
      }
      return null;
    } finally {
      sharedDataInFlightPromise = null;
    }
  })();

  return sharedDataInFlightPromise;
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

async function saveSharedBlockedList(blockedEmails) {
  if (!sharedDataConfigured()) return false;
  try {
    await sharedDataRequest("saveBlockedList", "POST", { blockedEmails });
    return true;
  } catch (error) {
    console.error("Saving blocked list to Google Sheets failed:", error);
    if (typeof showToast === "function") showToast("Blocked list could not be saved to Google Sheets.");
    return false;
  }
}

async function saveSharedPinConfig(pinConfig) {
  if (!sharedDataConfigured()) return false;
  try {
    await sharedDataRequest("savePinConfig", "POST", { pinConfig });
    return true;
  } catch (error) {
    console.error("Saving PIN configuration to Google Sheets failed:", error);
    if (typeof showToast === "function") showToast("PIN configuration could not be saved to Google Sheets.");
    return false;
  }
}

function logSharedActivity(logData) {
  if (typeof sharedDataConfigured !== "function" || !sharedDataConfigured()) return;
  const payload = typeof logData === "object" ? logData : { item: String(logData) };
  sharedDataRequest("logActivity", "POST", payload).catch(error => {
    console.warn("Logging activity to Google Sheets notice:", error);
  });
}

async function refreshSharedExams() {
  const data = await loadSharedData(false);
  const currentNav = (typeof state !== "undefined" && state.activeNav) ? state.activeNav : "exams";
  if (data && typeof renderExamsView === "function" && currentNav === "exams") {
    renderExamsView(activeExamsSem, true);
  }
  return data?.exams || null;
}

async function refreshSharedTimetable() {
  const data = await loadSharedData(false);
  const currentNav = (typeof state !== "undefined" && state.activeNav) ? state.activeNav : "timetable";
  if (data && typeof renderTimetableView === "function" && currentNav === "timetable") {
    renderTimetableView(activeTTState.sem, activeTTState.day, true);
  }
  return data?.timetable || null;
}

document.addEventListener("DOMContentLoaded", () => {
  loadSharedData(false);
});
