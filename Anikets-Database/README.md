# Frontend-Only Google Drive File Manager

A sleek, modern, frontend-only file manager with PIN access, Google Drive integration, and direct file downloads.

---

## ⚡ Quick Start & Configuration

Edit `app.js` directly to set configuration credentials:

```javascript
const DEFAULT_CONFIG = {
  apiKey: "YOUR_GOOGLE_DRIVE_API_KEY",
  
  pinFolders: {
    "1234": {
      id: "YOUR_GOOGLE_DRIVE_FOLDER_ID",
      name: "Academics",
      tags: ["mdm", "wd", "wad"]
    },
    "5678": {
      id: "ANOTHER_FOLDER_ID",
      name: "Project Files",
      tags: ["projects"]
    }
  }
};
```

---

## 🔑 How to Get a Google Drive API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. Open **APIs & Services > Library**, search for **Google Drive API**, and click **Enable**.
4. Navigate to **APIs & Services > Credentials**.
5. Click **+ Create Credentials** at the top and select **API Key**.
6. Copy your generated key and paste it into `app.js`.
7. *(Optional)* Click **Edit API Key** to restrict key usage by HTTP Referrer (your site domain) and API type (**Google Drive API**).

---

## 📂 How to Get a Google Drive Folder ID & Share Access

1. Open [Google Drive](https://drive.google.com/).
2. Locate the folder you want to display in the File Manager.
3. Right-click the folder > **Share** > **Share** (or "Get link").
4. Change access settings from *Restricted* to **"Anyone with the link"** (Viewer access).
5. Open the folder in your browser. Look at the browser URL bar:
   ```
   https://drive.google.com/drive/folders/1RQWOkODURZUM6XlUsL-W5zPjVOfVtwIp
   ```
6. The string of characters after `/folders/` (e.g. `1RQWOkODURZUM6XlUsL-W5zPjVOfVtwIp`) is your **Drive Folder ID**.

---

## ✨ Features Included

- 🔒 **PIN Keypad Protection**: Lock screen with custom PINs mapping to specific folders.
- ⬇️ **Direct File Download**: Single-click file downloads directly from Google Drive storage.
- 📁 **Seamless Folder Navigation**: Click any folder row or breadcrumb to open subdirectories. Works on desktop and mobile.
- 🔎 **Real-time Search & Filter**: Filter files instantly by name.
- 📊 **Download Counter**: Persistent download metrics stored in browser `localStorage`.

