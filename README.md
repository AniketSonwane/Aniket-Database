# Aniket's Database - Frontend Google Drive File Manager

A sleek, modern, frontend-only file manager with PIN security, Google Drive API integration, subject-based filtering, and direct downloads. Ready for instant deployment on **GitHub Pages**.

---

## 🚀 Hosting on GitHub Pages

This project is 100% static HTML/CSS/JS and is **fully ready for GitHub Pages hosting**.

### Option A: Automatic Deployment via GitHub Actions (Recommended)

1. Push your project to GitHub:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```
2. Go to your GitHub repository **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. GitHub Actions will automatically build and publish your site!

### Option B: Standard Deploy from Branch

1. Push your project to GitHub (`main` or `master` branch).
2. Go to **Settings** > **Pages**.
3. Under **Source**, select **Deploy from a branch**.
4. Select `main` branch and `/ (root)` folder, then click **Save**.

---

## 🔑 Crucial Google Cloud API Key Setting for GitHub Pages

Because your app makes calls to the Google Drive API directly from the browser:

1. Open [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2. Click on your **API Key** (`AIzaSyA7KqMo1OW...`) to edit it.
3. Under **Set an application restriction**, select **Website restrictions** (HTTP referrers).
4. Add your GitHub Pages URL pattern under **Website restrictions**:
   ```
   https://<your-github-username>.github.io/*
   ```
   *(You can also add `http://localhost:*/*` or `http://127.0.0.1:*/*` for local development).*
5. Under **API restrictions**, ensure **Google Drive API** is selected or unrestricted.
6. Click **Save**.

---

## 🔐 Credentials & PIN Security Configuration

Credentials and PIN mappings are secured in `app.js` (`_SEC_STORE`) and `admin.js` (`_ADMIN_SEC`).

- **Default Vault PIN**: `1717` (Maps to Folder ID: `1yLR0kdaTMi7HbD1-oAo1Cm9n4bxADUdQ`)
- **Super Admin PIN**: `1358` (Access restricted to authorized Admin email `2007aniketsonwane@gmail.com`)

---

## ✨ Features Included

- 🔒 **PIN Keypad Protection**: Custom PIN access mapping directly to Google Drive folders.
- 📁 **Google Drive Integration**: Dynamic recursive folder indexing and live navigation.
- 🔎 **Real-time Vault Search & Subject Filter**: Fast global search and subject-wise course grouping.
- ⬇️ **Direct Downloads & Previews**: Single-click downloads for PDF, Office, and media files.
- 📊 **Visitor & Download Telemetry**: Built-in admin telemetry dashboard.
- 🎨 **Modern Dark/Light UI**: Built with Tailwind CSS and modern glassmorphism UI design.
