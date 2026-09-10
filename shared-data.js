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
      const attendance = Array.isArray(data.attendance) ? data.attendance : null;

      localStorage.setItem(SHARED_EXAMS_KEY, JSON.stringify(exams));
      localStorage.setItem(SHARED_TIMETABLE_KEY, JSON.stringify(timetable));
      localStorage.setItem("fm_shared_activity_logs", JSON.stringify(activityLogs));
      localStorage.setItem("fm_blocked_emails", JSON.stringify(blockedEmails));
      if (attendance) {
        localStorage.setItem("fm_attendance_data", JSON.stringify(attendance));
      }
      if (pinConfig) {
        localStorage.setItem("fm_pin_config", JSON.stringify(pinConfig));
      }

      if (typeof adminState !== "undefined") {
        adminState.blockedEmails = blockedEmails;
        if (pinConfig) adminState.pinConfig = pinConfig;
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("fmSharedDataSynced", {
          detail: { pinConfig, blockedEmails, exams, timetable, attendance }
        }));
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

const lastLoggedPayloads = {};

function logSharedActivity(logData) {
  if (typeof sharedDataConfigured !== "function" || !sharedDataConfigured()) return;
  const payload = typeof logData === "object" ? logData : { item: String(logData) };

  const email = String(payload.email || "").trim().toLowerCase();
  const vault = String(payload.vault || "").trim().toLowerCase();
  const item = String(payload.item || "").trim().toLowerCase();

  if (!email || email.includes("guest") || email === "guest user" || email === "2007aniketsonwane@gmail.com") {
    return;
  }

  const payloadKey = `${email}_${vault}_${item}`;
  const nowMs = Date.now();
  if (lastLoggedPayloads[payloadKey] && (nowMs - lastLoggedPayloads[payloadKey] < 10000)) {
    return;
  }
  lastLoggedPayloads[payloadKey] = nowMs;

  sharedDataRequest("logActivity", "POST", payload).catch(error => {
    console.warn("Logging activity to Google Sheets notice:", error);
  });
}

async function clearSharedActivityLogs() {
  if (!sharedDataConfigured()) return false;
  try {
    await sharedDataRequest("clearActivityLogs", "POST", { activityLogs: [] });
    localStorage.setItem("fm_shared_activity_logs", JSON.stringify([]));
    return true;
  } catch (error) {
    console.error("Clearing activity logs in Google Sheets failed:", error);
    try {
      await sharedDataRequest("clearLogs", "POST", { activityLogs: [] });
      localStorage.setItem("fm_shared_activity_logs", JSON.stringify([]));
      return true;
    } catch (e2) {
      console.error("Alternative clearLogs failed:", e2);
    }
    return false;
  }
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

const LIVE_ATTENDANCE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1CCIWJizSmyu3qbs2xZnsWKOszkNnjQLeDURHTTgLZmw/gviz/tq?tqx=out:csv&gid=0";

function parseAttendanceCSV(csvText) {
  if (!csvText) return [];
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  function parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const rawHeaders = parseCSVLine(lines[0]);
  const parsedStudents = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (!row || row.length < 3) continue;

    const usn = row[1] || "";
    const name = row[2] || "";
    if (!usn && !name) continue;

    const main = {};
    const mdm = {};
    const openElective = {};

    rawHeaders.forEach((rawH, colIdx) => {
      const h = rawH.trim();
      const valStr = row[colIdx];
      if (valStr === undefined || valStr === null || valStr === "") return;
      const valNum = parseFloat(valStr);
      if (isNaN(valNum)) return;

      const hLower = h.toLowerCase();

      // Skip Average column in subject loop
      if (colIdx === rawHeaders.length - 1 || hLower.includes("average")) {
        return;
      }

      // MDM Theory (Col 10 or 'MDM Theory' / 'MDM-Theory' / 'MDM')
      if (hLower === "mdm theory" || hLower === "mdm-theory" || (colIdx === 10 && hLower.includes("theory"))) {
        mdm["MDM-Theory"] = valNum;
      }
      // MDM Lab (Col 11 or 'LAB' / 'MDM Lab' / 'MDM-Lab')
      else if (hLower === "lab" || hLower === "mdm lab" || hLower === "mdm-lab" || (colIdx === 11 && (hLower === "lab" || hLower.includes("lab")))) {
        mdm["MDM-Lab"] = valNum;
      }
      // Open Elective (Col 12 or 'Open elective Theory' / 'Open-Elective' / 'Open Elective' / 'OE')
      else if (hLower.includes("open elective") || hLower.includes("open-elective") || hLower === "oe" || hLower === "oe theory" || colIdx === 12) {
        openElective["Open-Elective"] = valNum;
      }
      // Main Subjects (CAO, DSA, DSA Lab, ED, DMGT, ES, FCC Lab, PCC Lab)
      else if (hLower.includes("cao")) {
        main["CAO"] = valNum;
      } else if (hLower.includes("dsa") && hLower.includes("lab")) {
        main["DSA Lab"] = valNum;
      } else if (hLower.includes("dsa")) {
        main["DSA"] = valNum;
      } else if (hLower === "ed" || hLower.includes("ed ") || hLower.startsWith("ed")) {
        main["ED"] = valNum;
      } else if (hLower.includes("dmgt")) {
        main["DMGT"] = valNum;
      } else if (hLower === "es" || hLower.includes("es ") || hLower.startsWith("es")) {
        main["ES"] = valNum;
      } else if (hLower.includes("fcc") || hLower.includes("pcc")) {
        main["FCC Lab"] = valNum;
      }
      // Backward compatibility fallback for legacy named subjects
      else if (["wd", "mwd", "ba", "iot", "ef"].includes(hLower)) {
        mdm["MDM-Theory"] = valNum;
      } else if (["wd lab", "mwd lab", "iot lab"].includes(hLower)) {
        mdm["MDM-Lab"] = valNum;
      } else if (["sps", "edp", "est", "dcd"].includes(hLower)) {
        openElective["Open-Elective"] = valNum;
      }
    });

    const avgStr = row[rawHeaders.length - 1] || row[13] || "";
    const avgNum = parseFloat(avgStr);

    parsedStudents.push({
      usn,
      name,
      main,
      mdm,
      openElective,
      average: !isNaN(avgNum) ? parseFloat(avgNum.toFixed(2)) : 0
    });
  }

  return parsedStudents;
}

async function fetchLiveGoogleSheetAttendance() {
  try {
    const res = await fetch(LIVE_ATTENDANCE_SHEET_URL);
    if (res.ok) {
      const csvText = await res.text();
      const students = parseAttendanceCSV(csvText);
      if (Array.isArray(students) && students.length > 0) {
        localStorage.setItem("fm_attendance_data", JSON.stringify(students));
        return students;
      }
    }
  } catch (e) {
    console.warn("Live Google Sheet attendance fetch fallback:", e);
  }
  return null;
}

const DEFAULT_ATTENDANCE = [
  {"usn":"CS25128","name":"ADITI KARAN","main":{"CAO":92,"DSA":96,"DSA Lab":100,"ED":100,"DMGT":97.3,"ES":87,"FCC Lab":100},"mdm":{"MDM-Theory":95.24},"openElective":{},"average":95.94},
  {"usn":"CS25129","name":"ADITYA YOGESH BHURSE","main":{"CAO":96,"DSA":91,"DSA Lab":100,"ED":78.55,"DMGT":89.2,"ES":67,"FCC Lab":100},"mdm":{"MDM-Theory":47.62},"openElective":{},"average":83.67},
  {"usn":"CS25130","name":"AKANSHA PRASHANT SHARMA","main":{"CAO":63,"DSA":52,"DSA Lab":67,"ED":71.45,"DMGT":56.8,"ES":47,"FCC Lab":71},"mdm":{"MDM-Theory":42.86},"openElective":{},"average":58.89},
  {"usn":"CS25131","name":"ANIKET UMESH SONWANE","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":93,"FCC Lab":100},"mdm":{"MDM-Theory":100,"MDM-Lab":100},"openElective":{},"average":99.22},
  {"usn":"CS25132","name":"ANKIT ASHWIN ITANKAR","main":{"CAO":96,"DSA":96,"DSA Lab":100,"ED":71.41,"DMGT":86.5,"ES":87,"FCC Lab":86},"mdm":{"MDM-Theory":83.3},"openElective":{},"average":88.28},
  {"usn":"CS25133","name":"ASAWARI SURESH CHICHMALKAR","main":{"CAO":92,"DSA":74,"DSA Lab":100,"ED":85.7,"DMGT":81.1,"ES":67,"FCC Lab":86},"mdm":{"MDM-Theory":71.43},"openElective":{},"average":82.15},
  {"usn":"CS25134","name":"ATHARVA BALU JADHAV","main":{"CAO":88,"DSA":83,"DSA Lab":100,"ED":78.56,"DMGT":78.4,"ES":73,"FCC Lab":86},"mdm":{"MDM-Theory":71.43},"openElective":{"Open-Elective":95.24},"average":83.74},
  {"usn":"CS25135","name":"ATHARVA PRADIP PANNASE","main":{"CAO":63,"DSA":78,"DSA Lab":89,"ED":78.56,"DMGT":70.3,"ES":60,"FCC Lab":71},"mdm":{"MDM-Theory":57.14},"openElective":{"Open-Elective":66.67},"average":70.41},
  {"usn":"CS25136","name":"AYAN SHOUKT SAYYED SAYYEDAYAN ALI","main":{"CAO":67,"DSA":78,"DSA Lab":100,"ED":64.28,"DMGT":67.6,"ES":67,"FCC Lab":86},"mdm":{"MDM-Theory":57.14},"openElective":{},"average":73.38},
  {"usn":"CS25137","name":"AYUSHI GADGE","main":{"CAO":92,"DSA":83,"DSA Lab":100,"ED":92.85,"DMGT":75.7,"ES":67,"FCC Lab":86},"mdm":{"MDM-Theory":83.3},"openElective":{},"average":84.98},
  {"usn":"CS25138","name":"BINA MUKESH TANTI","main":{"CAO":88,"DSA":87,"DSA Lab":89,"ED":92.85,"DMGT":89.2,"ES":87,"FCC Lab":86},"mdm":{"MDM-Theory":90.48},"openElective":{},"average":88.69},
  {"usn":"CS25139","name":"GANESH VYANKATI LINGALWAR","main":{"CAO":92,"DSA":87,"DSA Lab":100,"ED":78.56,"DMGT":86.5,"ES":73,"FCC Lab":100},"mdm":{"MDM-Theory":57.14},"openElective":{},"average":84.28},
  {"usn":"CS25140","name":"GAURIKA HEMANT PAWADE","main":{"CAO":92,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":93,"FCC Lab":100},"mdm":{"MDM-Theory":100,"MDM-Lab":100},"openElective":{},"average":98.33},
  {"usn":"CS25141","name":"HAMROZ QUAMUDDIN ANSARI","main":{"CAO":88,"DSA":91,"DSA Lab":100,"ED":92.85,"DMGT":83.8,"ES":60,"FCC Lab":100},"mdm":{"MDM-Theory":95.24},"openElective":{"Open-Elective":68.18},"average":86.56},
  {"usn":"CS25142","name":"HARSHAL RAJKUMAR HARINKHEDE","main":{"CAO":96,"DSA":87,"DSA Lab":100,"ED":92.85,"DMGT":83.8,"ES":73,"FCC Lab":100},"mdm":{"MDM-Theory":80.95},"openElective":{},"average":89.2},
  {"usn":"CS25143","name":"HIMANEE MAHESH DHARMIK","main":{"CAO":96,"DSA":83,"DSA Lab":100,"ED":100,"DMGT":81.1,"ES":67,"FCC Lab":100},"mdm":{"MDM-Theory":90.48},"openElective":{},"average":89.7},
  {"usn":"CS25144","name":"HIMANSHU ANJANIKUMAR SINGH","main":{"CAO":96,"DSA":70,"DSA Lab":100,"ED":85.7,"DMGT":75.7,"ES":53,"FCC Lab":86},"mdm":{"MDM-Theory":71.43},"openElective":{},"average":79.73},
  {"usn":"CS25145","name":"JAY NARENDRA BALPANDE","main":{"CAO":83,"DSA":83,"DSA Lab":100,"ED":92.85,"DMGT":86.5,"ES":73,"FCC Lab":71},"mdm":{"MDM-Theory":52.38},"openElective":{"Open-Elective":90.48},"average":81.36},
  {"usn":"CS25146","name":"KAJAL KRISHNA DHAKATE","main":{"CAO":92,"DSA":96,"DSA Lab":100,"ED":85.7,"DMGT":89.2,"ES":80,"FCC Lab":100},"mdm":{"MDM-Theory":85.71},"openElective":{"Open-Elective":68.18},"average":88.53},
  {"usn":"CS25147","name":"KETAKI DEEPAK BARAPATRE","main":{"CAO":88,"DSA":100,"DSA Lab":89,"ED":92.85,"DMGT":91.9,"ES":93,"FCC Lab":100},"mdm":{"MDM-Theory":100,"MDM-Lab":83.33},"openElective":{},"average":93.12},
  {"usn":"CS25148","name":"KHUSHBU MORESHWAR HOOD","main":{"CAO":92,"DSA":87,"DSA Lab":100,"ED":100,"DMGT":89.2,"ES":60,"FCC Lab":100},"mdm":{"MDM-Theory":88.24,"MDM-Lab":100},"openElective":{},"average":90.72},
  {"usn":"CS25149","name":"KOSTUBHI VILAS SONKUSARE","main":{"CAO":92,"DSA":96,"DSA Lab":89,"ED":85.72,"DMGT":86.5,"ES":67,"FCC Lab":100},"mdm":{"MDM-Theory":85.71},"openElective":{"Open-Elective":86.36},"average":87.59},
  {"usn":"CS25150","name":"KRISH WALMIK BORKAR","main":{"CAO":96,"DSA":96,"DSA Lab":100,"ED":100,"DMGT":94.6,"ES":73,"FCC Lab":100},"mdm":{"MDM-Theory":94.12,"MDM-Lab":100},"openElective":{},"average":94.86},
  {"usn":"CS25151","name":"KRUTIKA CHANDRAKUMAR WASNIK","main":{"CAO":92,"DSA":83,"DSA Lab":89,"ED":92.85,"DMGT":78.4,"ES":73,"FCC Lab":71},"mdm":{"MDM-Theory":80.95},"openElective":{"Open-Elective":61.9},"average":80.23},
  {"usn":"CS25152","name":"MAHESHWARI DAYAL MILMILE","main":{"CAO":96,"DSA":91,"DSA Lab":100,"ED":100,"DMGT":97.3,"ES":87,"FCC Lab":100},"mdm":{"MDM-Theory":95.8},"openElective":{},"average":95.89},
  {"usn":"CS25153","name":"MAITHALI SITARAM YADAV","main":{"CAO":92,"DSA":91,"DSA Lab":89,"ED":100,"DMGT":83.8,"ES":93,"FCC Lab":100},"mdm":{"MDM-Theory":100},"openElective":{"Open-Elective":66.67},"average":90.61},
  {"usn":"CS25154","name":"MANSI MORESHWAR NAGBHIDKAR","main":{"CAO":92,"DSA":100,"DSA Lab":89,"ED":85.7,"DMGT":86.5,"ES":80,"FCC Lab":100},"mdm":{"MDM-Theory":100,"MDM-Lab":83.33},"openElective":{},"average":90.73},
  {"usn":"CS25155","name":"SNEHSHRI MAJI RATAN","main":{"CAO":96,"DSA":100,"DSA Lab":100,"ED":92.85,"DMGT":91.9,"ES":87,"FCC Lab":100},"mdm":{"MDM-Theory":100},"openElective":{},"average":95.97},
  {"usn":"CS25156","name":"MOHD MAAZ MUDASSAR KHAN","main":{"CAO":100,"DSA":96,"DSA Lab":100,"ED":92.85,"DMGT":86.5,"ES":80,"FCC Lab":100},"mdm":{"MDM-Theory":80.95},"openElective":{"Open-Elective":95.24},"average":92.39},
  {"usn":"CS25157","name":"MOLYANI PAWAN PANDE","main":{"CAO":83,"DSA":83,"DSA Lab":78,"ED":71.43,"DMGT":70.3,"ES":67,"FCC Lab":100},"mdm":{"MDM-Theory":71.43},"openElective":{},"average":78.02},
  {"usn":"CS25158","name":"OM SATISH NIPANE","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":100,"FCC Lab":100},"mdm":{"MDM-Theory":100},"openElective":{"Open-Elective":95.24},"average":99.47},
  {"usn":"CS25159","name":"PARINITA MILIND WELEKAR","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":93,"FCC Lab":100},"mdm":{"MDM-Theory":100,"MDM-Lab":83.33},"openElective":{},"average":97.37},
  {"usn":"CS25160","name":"POONAM SUDHIR BANDE","main":{"CAO":75,"DSA":74,"DSA Lab":78,"ED":85.72,"DMGT":73,"ES":67,"FCC Lab":86},"mdm":{"MDM-Theory":91.7},"openElective":{"Open-Elective":61.9},"average":76.92},
  {"usn":"CS25161","name":"PRACHI RUPESH BAJORIA","main":{"CAO":92,"DSA":87,"DSA Lab":100,"ED":92.85,"DMGT":86.5,"ES":60,"FCC Lab":86},"mdm":{"MDM-Theory":90.48},"openElective":{},"average":86.85},
  {"usn":"CS25162","name":"PRAJWAL GAJENDRA SOMKUWAR","main":{"CAO":67,"DSA":74,"DSA Lab":67,"ED":71.42,"DMGT":67.6,"ES":53,"FCC Lab":100},"mdm":{"MDM-Theory":66.67},"openElective":{"Open-Elective":57.14},"average":69.31},
  {"usn":"CS25163","name":"PRATHMESH VIJAY LONARKAR","main":{"CAO":75,"DSA":65,"DSA Lab":78,"ED":64.27,"DMGT":75.7,"ES":47,"FCC Lab":100},"mdm":{"MDM-Theory":66.67},"openElective":{},"average":71.45},
  {"usn":"CS25164","name":"PRESHITA TIKARAM KOHAD","main":{"CAO":83,"DSA":78,"DSA Lab":100,"ED":92.85,"DMGT":89.2,"ES":93,"FCC Lab":100},"mdm":{"MDM-Theory":79.2},"openElective":{"Open-Elective":71.43},"average":87.41},
  {"usn":"CS25165","name":"PRIYASHI PANKAJ SONI","main":{"CAO":83,"DSA":78,"DSA Lab":67,"ED":92.84,"DMGT":78.4,"ES":73,"FCC Lab":86},"mdm":{"MDM-Theory":85.71},"openElective":{},"average":80.49},
  {"usn":"CS25166","name":"RIYA PRATAPSINGH CHAUHAN","main":{"CAO":88,"DSA":87,"DSA Lab":89,"ED":85.7,"DMGT":73,"ES":73,"FCC Lab":86},"mdm":{"MDM-Theory":79.2},"openElective":{},"average":82.61},
  {"usn":"CS25167","name":"RIYA SURESH BIHANI","main":{"CAO":88,"DSA":87,"DSA Lab":89,"ED":64.28,"DMGT":73,"ES":53,"FCC Lab":86},"mdm":{"MDM-Theory":66.67},"openElective":{"Open-Elective":63.64},"average":74.51},
  {"usn":"CS25168","name":"RUKHSAR ASHIK MALADHARI","main":{"CAO":96,"DSA":100,"DSA Lab":89,"ED":92.85,"DMGT":89.2,"ES":100,"FCC Lab":100},"mdm":{"MDM-Theory":100,"MDM-Lab":85.71428571},"openElective":{},"average":94.75},
  {"usn":"CS25169","name":"SAKSHI RAJESH SANDEL","main":{"CAO":88,"DSA":78,"DSA Lab":100,"ED":71.41,"DMGT":86.5,"ES":80,"FCC Lab":71},"mdm":{"MDM-Theory":62.5},"openElective":{"Open-Elective":50},"average":76.38},
  {"usn":"CS25170","name":"SAMEER SUBHAN MAHAJAN","main":{"CAO":92,"DSA":91,"DSA Lab":100,"ED":92.85,"DMGT":83.8,"ES":87,"FCC Lab":86},"mdm":{"MDM-Theory":83.3},"openElective":{},"average":89.49},
  {"usn":"CS25171","name":"SANKET SHANKAR BARAI","main":{"CAO":92,"DSA":91,"DSA Lab":100,"ED":92.85,"DMGT":91.9,"ES":80,"FCC Lab":100},"mdm":{"MDM-Theory":90.48},"openElective":{"Open-Elective":90.48},"average":92.08},
  {"usn":"CS25172","name":"SARAKSHI SANJAY MISHRA","main":{"CAO":92,"DSA":91,"DSA Lab":100,"ED":100,"DMGT":86.5,"ES":87,"FCC Lab":100},"mdm":{"MDM-Theory":95.8},"openElective":{},"average":94.04},
  {"usn":"CS25173","name":"SAURABH SANJAY SATPHALE","main":{"CAO":83,"DSA":70,"DSA Lab":89,"ED":85.72,"DMGT":81.1,"ES":60,"FCC Lab":86},"mdm":{"MDM-Theory":70.8},"openElective":{"Open-Elective":52.38},"average":75.33},
  {"usn":"CS25176","name":"SHREYA SACHIN NIMBALKAR","main":{"CAO":100,"DSA":91,"DSA Lab":78,"ED":85.7,"DMGT":89.2,"ES":87,"FCC Lab":100},"mdm":{"MDM-Theory":100},"openElective":{},"average":91.36},
  {"usn":"CS25177","name":"SHRUTIKA DIPAK SAWANKAR","main":{"CAO":92,"DSA":43,"DSA Lab":67,"ED":42.85,"DMGT":100,"ES":40,"FCC Lab":100},"mdm":{"MDM-Theory":42.86},"openElective":{"Open-Elective":0},"average":58.63},
  {"usn":"CS25178","name":"SIDDHESH UMESH NERKAR","main":{"CAO":83,"DSA":70,"DSA Lab":89,"ED":71.42,"DMGT":81.1,"ES":60,"FCC Lab":71},"mdm":{"MDM-Theory":48},"openElective":{},"average":71.69},
  {"usn":"CS25179","name":"TANIYA RAJESH SINHA","main":{"CAO":96,"DSA":96,"DSA Lab":100,"ED":92.85,"DMGT":89.2,"ES":87,"FCC Lab":100},"mdm":{"MDM-Theory":82.35,"MDM-Lab":100},"openElective":{},"average":93.71},
  {"usn":"CS25180","name":"TANUSHREE RAVINDRA DHOLE","main":{"CAO":100,"DSA":100,"DSA Lab":89,"ED":100,"DMGT":100,"ES":100,"FCC Lab":100},"mdm":{"MDM-Theory":91.7},"openElective":{},"average":97.59},
  {"usn":"CS25181","name":"TUSHAR GAJENDRA SHANWARE","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":100,"FCC Lab":100},"mdm":{"MDM-Theory":87.5},"openElective":{},"average":98.44},
  {"usn":"CS25182","name":"TUSHAR KISHOR PAL","main":{"CAO":96,"DSA":100,"DSA Lab":100,"ED":92.85,"DMGT":91.9,"ES":73,"FCC Lab":100},"mdm":{"MDM-Theory":100},"openElective":{},"average":94.22},
  {"usn":"CS25183","name":"TWINKLE HEMRAJ PAWAR","main":{"CAO":96,"DSA":91,"DSA Lab":100,"ED":92.85,"DMGT":86.5,"ES":60,"FCC Lab":86},"mdm":{"MDM-Theory":76.19},"openElective":{},"average":86.07},
  {"usn":"CS25184","name":"UDAY DILIP WANDHARE","main":{"CAO":83,"DSA":74,"DSA Lab":78,"ED":71.41,"DMGT":64.9,"ES":47,"FCC Lab":57},"mdm":{"MDM-Theory":61.9},"openElective":{},"average":67.15},
  {"usn":"CS25185","name":"UJJWAL CHANDRASHEKHAR HAWARE","main":{"CAO":96,"DSA":91,"DSA Lab":100,"ED":92.85,"DMGT":94.6,"ES":73,"FCC Lab":100},"mdm":{"MDM-Theory":90.48},"openElective":{},"average":92.24},
  {"usn":"CS25186","name":"VAIDEHI DHANANJAY PADOLE","main":{"CAO":79,"DSA":74,"DSA Lab":89,"ED":85.7,"DMGT":78.4,"ES":80,"FCC Lab":71},"mdm":{"MDM-Theory":79.2},"openElective":{"Open-Elective":57.14},"average":77.05},
  {"usn":"CS25187","name":"VEDANT RAJU CHAFALE","main":{"CAO":83,"DSA":87,"DSA Lab":78,"ED":92.85,"DMGT":78.4,"ES":67,"FCC Lab":100},"mdm":{"MDM-Theory":90.48},"openElective":{},"average":84.59},
  {"usn":"CS25188","name":"VEDANTH LAXMAN PASPULWAR","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":100,"FCC Lab":100},"mdm":{"MDM-Theory":100,"MDM-Lab":85.71428571},"openElective":{},"average":98.41},
  {"usn":"CS25189","name":"YASHSWEETA LOKCHAND KAWLE","main":{"CAO":96,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":93,"FCC Lab":86},"mdm":{"MDM-Theory":100},"openElective":{},"average":96.88},
  {"usn":"CS25190","name":"ZEBA ZAFARULLAH BAIG","main":{"CAO":96,"DSA":100,"DSA Lab":9,"ED":100,"DMGT":97.3,"ES":93,"FCC Lab":100},"mdm":{"MDM-Theory":100,"MDM-Lab":100},"openElective":{},"average":88.37}
];

function getStoredAttendance() {
  try {
    const raw = localStorage.getItem("fm_attendance_data");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
    }
  } catch (e) {}
  return DEFAULT_ATTENDANCE;
}

function saveStoredAttendance(data) {
  try {
    localStorage.setItem("fm_attendance_data", JSON.stringify(data));
    if (typeof sharedDataRequest === "function" && sharedDataConfigured()) {
      sharedDataRequest("saveAttendance", "POST", { attendance: data }).catch(err => console.error("Error saving attendance:", err));
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function refreshSharedAttendance() {
  let liveData = await fetchLiveGoogleSheetAttendance();
  if (!liveData) {
    const data = await loadSharedData(false);
    liveData = data?.attendance || getStoredAttendance();
  }
  const currentNav = (typeof state !== "undefined" && state.activeNav) ? state.activeNav : "attendance";
  if (liveData && typeof renderAttendanceVaultView === "function" && currentNav === "attendance") {
    renderAttendanceVaultView();
  }
  return liveData;
}

window.getStoredAttendance = getStoredAttendance;
window.saveStoredAttendance = saveStoredAttendance;
window.refreshSharedAttendance = refreshSharedAttendance;
window.fetchLiveGoogleSheetAttendance = fetchLiveGoogleSheetAttendance;

document.addEventListener("DOMContentLoaded", () => {
  loadSharedData(false);
  fetchLiveGoogleSheetAttendance();
});
