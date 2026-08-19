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

  const email = String(payload.email || "").trim().toLowerCase();
  const vault = String(payload.vault || "").trim().toLowerCase();

  if (
    !email ||
    email.includes("guest") ||
    email === "guest user" ||
    email === "2007aniketsonwane@gmail.com" ||
    vault === "1358" ||
    vault === "2334" ||
    vault === "1111" ||
    vault.includes("public vault") ||
    vault.includes("aniket-notes")
  ) {
    return;
  }

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

  const headers = parseCSVLine(lines[0]);
  const mainSubjectCols = ["CAO", "DSA", "DSA Lab", "ED", "DMGT", "ES", "FCC Lab", "PCC Lab"];
  const mdmSubjectCols = ["WD", "WD Lab", "MWD", "MWD Lab", "BA", "IoT", "IoT Lab", "EF"];
  const openElectiveCols = ["SPS", "EDP", "EST", "DCD"];

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

    headers.forEach((h, colIdx) => {
      let cleanH = h.replace(/^(Main Subject|MDM|Open elective|Student details srn|Student details)\s*/i, "").trim();
      if (/^mwd$/i.test(cleanH)) cleanH = "WD";
      if (/^mwd\s*lab$/i.test(cleanH)) cleanH = "WD Lab";
      if (/^wd\s*lab$/i.test(cleanH)) cleanH = "WD Lab";

      const valStr = row[colIdx];
      if (valStr !== undefined && valStr !== null && valStr !== "") {
        const valNum = parseFloat(valStr);
        if (!isNaN(valNum)) {
          if (mainSubjectCols.some(m => cleanH.toLowerCase() === m.toLowerCase())) {
            main[cleanH] = valNum;
          } else if (mdmSubjectCols.some(m => cleanH.toLowerCase() === m.toLowerCase())) {
            mdm[cleanH] = valNum;
          } else if (openElectiveCols.some(o => cleanH.toLowerCase() === o.toLowerCase())) {
            openElective[cleanH] = valNum;
          }
        }
      }
    });

    const avgStr = row[headers.length - 1] || row[20] || "";
    const avgNum = parseFloat(avgStr);

    parsedStudents.push({
      usn,
      name,
      main,
      mdm,
      openElective,
      average: !isNaN(avgNum) ? avgNum : 0
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
  {"usn":"CS25128","name":"ADITI KARAN","main":{"CAO":80,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":71.43,"FCC Lab":100},"mdm":{"EF":100},"openElective":{},"average":92.23},
  {"usn":"CS25129","name":"ADITYA YOGESH BHURSE","main":{"CAO":90,"DSA":66.67,"DSA Lab":100,"ED":57.1,"DMGT":78.95,"ES":71.43,"FCC Lab":100},"mdm":{"EF":40},"openElective":{},"average":75.52},
  {"usn":"CS25130","name":"AKANSHA PRASHANT SHARMA","main":{"CAO":40,"DSA":33.33,"DSA Lab":50,"ED":42.9,"DMGT":42.11,"ES":28.57,"FCC Lab":50},"mdm":{"EF":20},"openElective":{},"average":38.36},
  {"usn":"CS25131","name":"ANIKET UMESH SONWANE","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":85.71,"FCC Lab":100},"mdm":{"WD":100,"WD Lab":100},"openElective":{},"average":97.83},
  {"usn":"CS25132","name":"ANKIT ASHWIN ITANKAR","main":{"CAO":90,"DSA":91.67,"DSA Lab":100,"ED":57.1,"DMGT":78.95,"ES":100,"FCC Lab":75},"mdm":{"BA":72.73},"openElective":{},"average":83.18},
  {"usn":"CS25133","name":"ASAWARI SURESH CHICHMALKAR","main":{"CAO":90,"DSA":91.67,"DSA Lab":100,"ED":85.7,"DMGT":84.21,"ES":57.14,"FCC Lab":100},"mdm":{"EF":70},"openElective":{},"average":84.84},
  {"usn":"CS25134","name":"ATHARVA BALU JADHAV","main":{"CAO":80,"DSA":91.67,"DSA Lab":100,"ED":85.7,"DMGT":84.21,"ES":85.71,"FCC Lab":75},"mdm":{"EF":100},"openElective":{"EST":90},"average":88.03},
  {"usn":"CS25135","name":"ATHARVA PRADIP PANNASE","main":{"CAO":40,"DSA":75,"DSA Lab":75,"ED":71.4,"DMGT":68.42,"ES":71.43,"FCC Lab":50},"mdm":{"EF":40},"openElective":{"DCD":80},"average":63.47},
  {"usn":"CS25136","name":"AYAN SHOUKT SAYYED SAYYEDAYAN ALI","main":{"CAO":90,"DSA":91.67,"DSA Lab":100,"ED":85.7,"DMGT":94.74,"ES":100,"FCC Lab":75},"mdm":{"EF":80},"openElective":{},"average":89.64},
  {"usn":"CS25137","name":"AYUSHI GADGE","main":{"CAO":90,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":89.47,"ES":85.71,"FCC Lab":100},"mdm":{"BA":90.91},"openElective":{},"average":93.47},
  {"usn":"CS25138","name":"BINA MUKESH TANTI","main":{"CAO":100,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":100,"ES":100,"FCC Lab":75},"mdm":{"EF":100},"openElective":{},"average":95.83},
  {"usn":"CS25139","name":"GANESH VYANKATI LINGALWAR","main":{"CAO":80,"DSA":91.67,"DSA Lab":100,"ED":85.7,"DMGT":89.47,"ES":85.71,"FCC Lab":100},"mdm":{"EF":50},"openElective":{},"average":85.32},
  {"usn":"CS25140","name":"GAURIKA HEMANT PAWADE","main":{"CAO":90,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":85.71,"FCC Lab":75},"mdm":{"WD":80,"WD Lab":100},"openElective":{},"average":91.72},
  {"usn":"CS25141","name":"HAMROZ QUAMUDDIN ANSARI","main":{"CAO":90,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":100,"ES":71.43,"FCC Lab":100},"mdm":{"EF":100},"openElective":{"EDP":60},"average":90.34},
  {"usn":"CS25142","name":"HARSHAL RAJKUMAR HARINKHEDE","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":100,"FCC Lab":100},"mdm":{"EF":100},"openElective":{},"average":99.34},
  {"usn":"CS25143","name":"HIMANEE MAHESH DHARMIK","main":{"CAO":100,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":89.47,"ES":71.43,"FCC Lab":100},"mdm":{"EF":100},"openElective":{},"average":94.07},
  {"usn":"CS25144","name":"HIMANSHU ANJANIKUMAR SINGH","main":{"CAO":80,"DSA":75,"DSA Lab":100,"ED":85.7,"DMGT":78.95,"ES":57.14,"FCC Lab":100},"mdm":{"EF":70},"openElective":{},"average":80.85},
  {"usn":"CS25145","name":"JAY NARENDRA BALPANDE","main":{"CAO":80,"DSA":83.33,"DSA Lab":100,"ED":85.7,"DMGT":84.21,"ES":71.43,"FCC Lab":50},"mdm":{"EF":50},"openElective":{"EST":80},"average":76.07},
  {"usn":"CS25146","name":"KAJAL KRISHNA DHAKATE","main":{"CAO":90,"DSA":91.67,"DSA Lab":100,"ED":71.4,"DMGT":84.21,"ES":71.43,"FCC Lab":100},"mdm":{"EF":70},"openElective":{"EDP":30},"average":78.75},
  {"usn":"CS25147","name":"KETAKI DEEPAK BARAPATRE","main":{"CAO":70,"DSA":100,"DSA Lab":75,"ED":85.7,"DMGT":84.21,"ES":85.71,"FCC Lab":100},"mdm":{"WD":100,"WD Lab":66.67},"openElective":{},"average":85.25},
  {"usn":"CS25148","name":"KHUSHBU MORESHWAR HOOD","main":{"CAO":100,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":100,"ES":71.43,"FCC Lab":100},"mdm":{"WD":90,"WD Lab":100},"openElective":{},"average":94.79},
  {"usn":"CS25149","name":"KOSTUBHI VILAS SONKUSARE","main":{"CAO":90,"DSA":91.67,"DSA Lab":75,"ED":100,"DMGT":78.95,"ES":57.14,"FCC Lab":100},"mdm":{"EF":70},"openElective":{"EDP":70},"average":81.42},
  {"usn":"CS25150","name":"KRISH WALMIK BORKAR","main":{"CAO":100,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":100,"ES":71.43,"FCC Lab":100},"mdm":{"WD":90,"WD Lab":100},"openElective":{},"average":94.79},
  {"usn":"CS25151","name":"KRUTIKA CHANDRAKUMAR WASNIK","main":{"CAO":90,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":84.21,"ES":85.71,"FCC Lab":100},"mdm":{"EF":80},"openElective":{"SPS":40},"average":85.73},
  {"usn":"CS25152","name":"MAHESHWARI DAYAL MILMILE","main":{"CAO":90,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":71.43,"FCC Lab":100},"mdm":{"BA":90.91},"openElective":{},"average":92.34},
  {"usn":"CS25153","name":"MAITHALI SITARAM YADAV","main":{"CAO":90,"DSA":100,"DSA Lab":75,"ED":100,"DMGT":78.95,"ES":100,"FCC Lab":100},"mdm":{"EF":100},"openElective":{"EST":70},"average":90.44},
  {"usn":"CS25154","name":"MANSI MORESHWAR NAGBHIDKAR","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":85.7,"DMGT":89.47,"ES":85.71,"FCC Lab":100},"mdm":{"WD":80,"WD Lab":100},"openElective":{},"average":93.43},
  {"usn":"CS25155","name":"SNEHSHRI MAJI RATAN","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":85.71,"FCC Lab":75},"mdm":{"BA":100},"openElective":{},"average":94.43},
  {"usn":"CS25156","name":"MOHD MAAZ MUDASSAR KHAN","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":85.71,"FCC Lab":100},"mdm":{"EF":100},"openElective":{"EST":90},"average":96.72},
  {"usn":"CS25157","name":"MOLYANI PAWAN PANDE","main":{"CAO":90,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":84.21,"ES":71.43,"FCC Lab":100},"mdm":{"EF":100},"openElective":{},"average":92.16},
  {"usn":"CS25158","name":"OM SATISH NIPANE","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":100,"FCC Lab":100},"mdm":{"BA":100},"openElective":{"EDP":100,"DCD":100},"average":100},
  {"usn":"CS25159","name":"PARINITA MILIND WELEKAR","main":{"CAO":90,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":85.71,"FCC Lab":75},"mdm":{"WD":100,"WD Lab":66.67},"openElective":{},"average":90.24},
  {"usn":"CS25160","name":"POONAM SUDHIR BANDE","main":{"CAO":100,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":89.47,"ES":85.71,"FCC Lab":75},"mdm":{"BA":100},"openElective":{"EST":90},"average":92.43},
  {"usn":"CS25161","name":"PRACHI RUPESH BAJORIA","main":{"CAO":90,"DSA":83.33,"DSA Lab":100,"ED":100,"DMGT":89.47,"ES":57.14,"FCC Lab":100},"mdm":{"EF":100},"openElective":{},"average":89.99},
  {"usn":"CS25162","name":"PRAJWAL GAJENDRA SOMKUWAR","main":{"CAO":60,"DSA":83.33,"DSA Lab":75,"ED":71.4,"DMGT":73.68,"ES":71.43,"FCC Lab":100},"mdm":{"EF":80},"openElective":{"DCD":80},"average":77.2},
  {"usn":"CS25163","name":"PRATHMESH VIJAY LONARKAR","main":{"CAO":70,"DSA":75,"DSA Lab":75,"ED":57.1,"DMGT":84.21,"ES":57.14,"FCC Lab":100},"mdm":{"EF":80},"openElective":{},"average":74.81},
  {"usn":"CS25164","name":"PRESHITA TIKARAM KOHAD","main":{"CAO":90,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":100,"FCC Lab":100},"mdm":{"BA":100},"openElective":{"EST":90},"average":97.78},
  {"usn":"CS25165","name":"PRIYASHI PANKAJ SONI","main":{"CAO":60,"DSA":58.33,"DSA Lab":25,"ED":71.4,"DMGT":57.89,"ES":42.86,"FCC Lab":75},"mdm":{"EF":70},"openElective":{},"average":57.56},
  {"usn":"CS25166","name":"RIYA PRATAPSINGH CHAUHAN","main":{"CAO":70,"DSA":91.67,"DSA Lab":75,"ED":71.4,"DMGT":63.16,"ES":85.71,"FCC Lab":75},"mdm":{"BA":72.73},"openElective":{},"average":75.58},
  {"usn":"CS25167","name":"RIYA SURESH BIHANI","main":{"CAO":100,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":89.47,"ES":100,"FCC Lab":100},"mdm":{"EF":80},"openElective":{"SPS":70},"average":92.35},
  {"usn":"CS25168","name":"RUKHSAR ASHIK MALADHARI","main":{"CAO":90,"DSA":100,"DSA Lab":75,"ED":100,"DMGT":89.47,"ES":100,"FCC Lab":100},"mdm":{"IoT":100,"IoT Lab":100},"openElective":{},"average":94.94},
  {"usn":"CS25169","name":"SAKSHI RAJESH SANDEL","main":{"CAO":70,"DSA":66.67,"DSA Lab":100,"ED":57.1,"DMGT":78.95,"ES":57.14,"FCC Lab":50},"mdm":{"BA":36.36,"IoT Lab":0},"openElective":{},"average":57.36},
  {"usn":"CS25170","name":"SAMEER SUBHAN MAHAJAN","main":{"CAO":90,"DSA":100,"DSA Lab":100,"ED":85.7,"DMGT":84.21,"ES":85.71,"FCC Lab":75},"mdm":{"BA":90.91},"openElective":{},"average":88.94},
  {"usn":"CS25171","name":"SANKET SHANKAR BARAI","main":{"CAO":100,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":85.71,"FCC Lab":100},"mdm":{"EF":100,"SPS":100},"openElective":{},"average":96.9},
  {"usn":"CS25172","name":"SARAKSHI SANJAY MISHRA","main":{"CAO":90,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":84.21,"ES":85.71,"FCC Lab":100},"mdm":{"BA":90.91},"openElective":{},"average":93.85},
  {"usn":"CS25173","name":"SAURABH SANJAY SATPHALE","main":{"CAO":100,"DSA":75,"DSA Lab":100,"ED":100,"DMGT":84.21,"ES":57.14,"FCC Lab":75},"mdm":{"BA":72.73},"openElective":{"EST":80},"average":82.68},
  {"usn":"CS25176","name":"SHREYA SACHIN NIMBALKAR","main":{"CAO":100,"DSA":83.33,"DSA Lab":100,"ED":85.7,"DMGT":89.47,"ES":85.71,"FCC Lab":100},"mdm":{"BA":100},"openElective":{},"average":93.03},
  {"usn":"CS25177","name":"SHRUTIKA DIPAK SAWANKAR","main":{"CAO":20,"DSA":0,"DSA Lab":25,"ED":0,"DMGT":15.79,"ES":0,"FCC Lab":0},"mdm":{"EF":0},"openElective":{"EST":0},"average":6.75},
  {"usn":"CS25178","name":"SIDDHESH UMESH NERKAR","main":{"CAO":80,"DSA":58.33,"DSA Lab":100,"ED":71.4,"DMGT":78.95,"ES":42.86,"FCC Lab":50},"mdm":{"EF":30},"openElective":{},"average":63.94},
  {"usn":"CS25179","name":"TANIYA RAJESH SINHA","main":{"CAO":90,"DSA":91.67,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":71.43,"FCC Lab":100},"mdm":{"WD":90,"WD Lab":100},"openElective":{},"average":93.09},
  {"usn":"CS25180","name":"TANUSHREE RAVINDRA DHOLE","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":100,"FCC Lab":100},"mdm":{"BA":100},"openElective":{},"average":100},
  {"usn":"CS25181","name":"TUSHAR GAJENDRA SHANWARE","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":100,"FCC Lab":100},"mdm":{"BA":90.91},"openElective":{},"average":98.86},
  {"usn":"CS25182","name":"TUSHAR KISHOR PAL","main":{"CAO":100,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":85.71,"FCC Lab":100},"mdm":{"EF":100},"openElective":{},"average":97.56},
  {"usn":"CS25183","name":"TWINKLE HEMRAJ PAWAR","main":{"CAO":90,"DSA":83.33,"DSA Lab":100,"ED":85.7,"DMGT":84.21,"ES":42.86,"FCC Lab":100},"mdm":{"EF":70},"openElective":{},"average":82.01},
  {"usn":"CS25184","name":"UDAY DILIP WANDHARE","main":{"CAO":70,"DSA":58.33,"DSA Lab":50,"ED":57.1,"DMGT":47.37,"ES":28.57,"FCC Lab":25},"mdm":{"EF":60},"openElective":{},"average":49.55},
  {"usn":"CS25185","name":"UJJWAL CHANDRASHEKHAR HAWARE","main":{"CAO":90,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":85.71,"FCC Lab":100},"mdm":{"EF":100},"openElective":{},"average":96.31},
  {"usn":"CS25186","name":"VAIDEHI DHANANJAY PADOLE","main":{"CAO":60,"DSA":58.33,"DSA Lab":75,"ED":71.4,"DMGT":68.42,"ES":100,"FCC Lab":75},"mdm":{"BA":72.73},"openElective":{"SPS":60},"average":71.21},
  {"usn":"CS25187","name":"VEDANT RAJU CHAFALE","main":{"CAO":90,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":94.74,"ES":85.71,"FCC Lab":100},"mdm":{"EF":90},"openElective":{},"average":95.06},
  {"usn":"CS25188","name":"VEDANTH LAXMAN PASPULWAR","main":{"CAO":90,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":100,"FCC Lab":100},"mdm":{"IoT":100,"IoT Lab":100},"openElective":{},"average":98.89},
  {"usn":"CS25189","name":"YASHSWEETA LOKCHAND KAWLE","main":{"CAO":90,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":100,"FCC Lab":100},"mdm":{"BA":100},"openElective":{},"average":98.75},
  {"usn":"CS25190","name":"ZEBA ZAFARULLAH BAIG","main":{"CAO":90,"DSA":100,"DSA Lab":100,"ED":100,"DMGT":100,"ES":100,"FCC Lab":100},"mdm":{"WD":100,"WD Lab":100},"openElective":{},"average":98.89}
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
