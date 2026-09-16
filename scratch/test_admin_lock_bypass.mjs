// test_admin_lock_bypass.mjs
import fs from 'fs';

// Mock browser environment
const localStorageData = {};
const sessionStorageData = {};

global.localStorage = {
  getItem: (k) => localStorageData[k] || null,
  setItem: (k, v) => { localStorageData[k] = String(v); },
  removeItem: (k) => { delete localStorageData[k]; },
  clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

global.sessionStorage = {
  getItem: (k) => sessionStorageData[k] || null,
  setItem: (k, v) => { sessionStorageData[k] = String(v); },
  removeItem: (k) => { delete sessionStorageData[k]; },
  clear: () => { Object.keys(sessionStorageData).forEach(k => delete sessionStorageData[k]); }
};

global.window = global;
global.document = {
  documentElement: { classList: { toggle: () => {}, contains: () => true } },
  addEventListener: () => {}
};

// Mock universal lock returning true for 3333 and 1111
global.isPinUniversallyLocked = (pin) => {
  if (pin === "3333" || pin === "2222" || pin === "1111") return true;
  return false;
};

// Load vault3333 logic
const vault3333Code = fs.readFileSync('vault3333.js', 'utf8');
const vault3333Fn = new Function('window', 'document', 'localStorage', 'sessionStorage', 'isPinUniversallyLocked', vault3333Code + '; return { isCurrentUserSuperAdmin, isVault3333LockedByAdmin };');
const v3333 = vault3333Fn(global.window, global.document, global.localStorage, global.sessionStorage, global.isPinUniversallyLocked);

// Test 1: Student entering locked 3333
localStorage.setItem("fm_user_email", "student@sbjit.edu.in");
sessionStorage.removeItem("vault_admin_override");
const studentAdminCheck = v3333.isCurrentUserSuperAdmin();
const studentLockedCheck = v3333.isVault3333LockedByAdmin();
console.log("Test 1 - Student: isCurrentUserSuperAdmin =", studentAdminCheck, "(expected false)");
console.log("Test 1 - Student: isVault3333LockedByAdmin =", studentLockedCheck, "(expected true)");
if (studentAdminCheck !== false || studentLockedCheck !== true) {
  throw new Error("Test 1 failed: Student should be blocked from locked 3333 vault");
}

// Test 2: Admin entering locked 3333 with email
localStorage.setItem("fm_user_email", "2007aniketsonwane@gmail.com");
sessionStorage.setItem("vault_admin_override", "true");
const adminCheck = v3333.isCurrentUserSuperAdmin();
const adminLockedCheck = v3333.isVault3333LockedByAdmin();
console.log("\nTest 2 - Admin: isCurrentUserSuperAdmin =", adminCheck, "(expected true)");
console.log("Test 2 - Admin: isVault3333LockedByAdmin =", adminLockedCheck, "(expected false)");
if (adminCheck !== true || adminLockedCheck !== false) {
  throw new Error("Test 2 failed: Admin should NOT be blocked from locked 3333 vault");
}

// Load aniket-notes logic
const notesCode = fs.readFileSync('aniket-notes.js', 'utf8');
const notesFn = new Function('window', 'document', 'localStorage', 'sessionStorage', 'isPinUniversallyLocked', notesCode + '; return { isCurrentUserSuperAdmin, isVault1111LockedByAdmin };');
const v1111 = notesFn(global.window, global.document, global.localStorage, global.sessionStorage, global.isPinUniversallyLocked);

// Test 3: Student entering locked 1111
localStorage.setItem("fm_user_email", "student@sbjit.edu.in");
sessionStorage.removeItem("vault_admin_override");
const studentNotesAdmin = v1111.isCurrentUserSuperAdmin();
const studentNotesLocked = v1111.isVault1111LockedByAdmin();
console.log("\nTest 3 - Notes Student: isCurrentUserSuperAdmin =", studentNotesAdmin, "(expected false)");
console.log("Test 3 - Notes Student: isVault1111LockedByAdmin =", studentNotesLocked, "(expected true)");
if (studentNotesAdmin !== false || studentNotesLocked !== true) {
  throw new Error("Test 3 failed: Student should be blocked from locked 1111 vault");
}

// Test 4: Admin entering locked 1111
localStorage.setItem("fm_user_email", "2007aniketsonwane@gmail.com");
sessionStorage.setItem("vault_admin_override", "true");
const adminNotesAdmin = v1111.isCurrentUserSuperAdmin();
const adminNotesLocked = v1111.isVault1111LockedByAdmin();
console.log("\nTest 4 - Notes Admin: isCurrentUserSuperAdmin =", adminNotesAdmin, "(expected true)");
console.log("Test 4 - Notes Admin: isVault1111LockedByAdmin =", adminNotesLocked, "(expected false)");
if (adminNotesAdmin !== true || adminNotesLocked !== false) {
  throw new Error("Test 4 failed: Admin should NOT be blocked from locked 1111 vault");
}

console.log("\n>>> ALL TESTS PASSED: ADMIN CAN ENTER LOCKED VAULTS WITHOUT AUTOMATIC REDIRECT/REFRESH! <<<");
