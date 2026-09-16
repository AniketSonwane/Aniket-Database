// test_universal_lock_e2e.mjs
// Verifies universal pin locking via live Google Sheets API

const API_URL = "https://script.google.com/macros/s/AKfycbxhqMdRnD9mNQ4IjHvQGRqL_7hC1ZbXaklc0J0TY27i6W8T5TqvdIpWDC3jl-NE04FV/exec";
const TOKEN = "Aniketexamtimetabledatemangement";

async function request(action, method = "GET", payload = null) {
  let url = API_URL;
  const options = { method, redirect: "follow" };
  if (method === "GET") {
    url += `?action=${encodeURIComponent(action)}&token=${encodeURIComponent(TOKEN)}`;
  } else {
    options.headers = { "Content-Type": "text/plain;charset=utf-8" };
    options.body = JSON.stringify({ action, token: TOKEN, ...(payload || {}) });
  }
  const res = await fetch(url, options);
  return await res.json();
}

async function run() {
  console.log("=== STEP 1: Fetch current bootstrap from Google Sheets ===");
  const boot1 = await request("bootstrap");
  console.log("Current pinConfig from Sheet:", JSON.stringify(boot1.pinConfig, null, 2));

  const initialLock1717 = Boolean(boot1.pinConfig?.["1717"]?.isLocked);
  console.log("PIN 1717 initial isLocked:", initialLock1717);

  console.log("\n=== STEP 2: Lock PIN 1717 on Google Sheets ===");
  const updatedCfg = {
    ...boot1.pinConfig,
    "1717": {
      ...(boot1.pinConfig?.["1717"] || { id: "1yLR0kdaTMi7HbD1-oAo1Cm9n4bxADUdQ", name: "Academics" }),
      isLocked: true
    }
  };
  const saveRes = await request("savePinConfig", "POST", { pinConfig: updatedCfg });
  console.log("savePinConfig result:", saveRes);
  if (!saveRes.success) throw new Error("Failed to save locked pinConfig");

  console.log("\n=== STEP 3: Verify fresh client sees 1717 as locked directly from Google Sheets ===");
  const boot2 = await request("bootstrap");
  console.log("Verified 1717 isLocked in Sheet:", boot2.pinConfig?.["1717"]?.isLocked);
  if (boot2.pinConfig?.["1717"]?.isLocked !== true) {
    throw new Error("Expected 1717 to be locked in Google Sheets!");
  }

  console.log("\n=== STEP 4: Unlock PIN 1717 on Google Sheets ===");
  const unlockedCfg = {
    ...boot2.pinConfig,
    "1717": {
      ...boot2.pinConfig["1717"],
      isLocked: false
    }
  };
  const saveRes2 = await request("savePinConfig", "POST", { pinConfig: unlockedCfg });
  console.log("savePinConfig unlock result:", saveRes2);

  const boot3 = await request("bootstrap");
  console.log("Verified 1717 isLocked after unlock in Sheet:", boot3.pinConfig?.["1717"]?.isLocked);
  if (boot3.pinConfig?.["1717"]?.isLocked !== false) {
    throw new Error("Expected 1717 to be unlocked in Google Sheets!");
  }

  console.log("\n>>> LIVE GOOGLE SHEETS UNIVERSAL LOCK ROUND-TRIP TEST PASSED SUCCESSFULLY! <<<");
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
