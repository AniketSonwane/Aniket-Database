/**
 * In-App File Preview Engine
 * Robust, high-performance in-app viewer for PDF, Word (.docx/.doc), Excel (.xlsx/.xls/.csv),
 * Images, Audio/Video, and Text/Code files with responsive modal fitting, smooth 2D/vertical scrolling,
 * one-click text and table copying, and fullscreen mode.
 */

(function () {
  "use strict";

  const FilePreviewer = {
    state: {
      isOpen: false,
      currentItem: null,
      currentBlobUrl: null,
      currentBlob: null,
      currentText: "",
      currentTableData: null,
      activeSheetName: "",
      workbook: null,
      zoomLevel: 1,
      rotateDeg: 0,
      isFullscreen: false,
      wordWrap: true,
      searchQuery: "",
      viewMode: "visual", // 'visual' | 'text' | 'drive'
      isPanning: false,
      panStartX: 0,
      panStartY: 0,
      panCurrentX: 0,
      panCurrentY: 0,
    },

    // Cache DOM references
    dom: {},

    init() {
      this.cacheDom();
      this.bindEvents();
    },

    cacheDom() {
      this.dom = {
        modal: document.getElementById("filePreviewModal"),
        modalCard: document.getElementById("previewModalCard"),
        modalHeader: document.getElementById("previewModalHeader") || document.querySelector("#previewModalCard > div:first-child"),
        fileIcon: document.getElementById("previewFileIcon"),
        fileName: document.getElementById("previewFileName"),
        fileMeta: document.getElementById("previewFileMeta"),
        extraMeta: document.getElementById("previewExtraMeta"),
        dynamicToolbar: document.getElementById("previewDynamicToolbar"),
        copyBtn: document.getElementById("previewCopyBtn"),
        copyBtnLabel: document.getElementById("previewCopyBtnLabel"),
        openDriveBtn: document.getElementById("previewOpenDriveBtn"),
        downloadBtn: document.getElementById("previewDownloadBtn"),
        fullscreenBtn: document.getElementById("previewFullscreenBtn"),
        closeBtn: document.getElementById("closeFilePreviewBtn") || document.getElementById("previewCloseBtn"),
        viewerContainer: document.getElementById("previewViewerContainer"),
        loading: document.getElementById("previewLoading"),
        loadingText: document.getElementById("previewLoadingText"),
        noticeBar: document.getElementById("previewNoticeBar"),
        noticeText: document.getElementById("previewNoticeText"),
        contentArea: document.getElementById("previewContentArea"),
        footer: document.getElementById("previewFooter"),
        footerInfo: document.getElementById("previewFooterInfo"),
      };
    },

    bindEvents() {
      // Escape key to exit fullscreen or close, 'f' to toggle fullscreen
      window.addEventListener("keydown", (e) => {
        if (!this.state.isOpen) return;

        // If target is an input (like search input), don't trigger hotkeys
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
          if (e.key === "Escape") {
            e.target.blur();
          }
          return;
        }

        if (e.key === "Escape") {
          e.preventDefault();
          if (this.state.isFullscreen) {
            this.toggleFullscreen(false);
          } else {
            this.close();
          }
        } else if (e.key.toLowerCase() === "f" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          this.toggleFullscreen();
        } else if (
          ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "PageUp", "PageDown", " "].includes(e.key) &&
          this.getPreviewType() === "ppt"
        ) {
          const iframe = document.getElementById("previewPptIframe") || document.getElementById("previewIframe");
          if (iframe && document.activeElement !== iframe) {
            try {
              iframe.focus();
            } catch (err) {}
          }
        } else if ((e.key === "+" || e.key === "=") && this.getPreviewType() === "image") {
          e.preventDefault();
          this.zoomImage(0.25);
        } else if ((e.key === "-" || e.key === "_") && this.getPreviewType() === "image") {
          e.preventDefault();
          this.zoomImage(-0.25);
        } else if (e.key === "0" && this.getPreviewType() === "image") {
          e.preventDefault();
          this.resetImageZoom();
        }
      });

      // Sync browser native fullscreen changes (e.g. user presses Esc in native slideshow)
      document.addEventListener("fullscreenchange", () => {
        const isNative = Boolean(document.fullscreenElement);
        if (!isNative && this.state.isFullscreen) {
          this.toggleFullscreen(false);
        } else if (isNative && !this.state.isFullscreen) {
          this.toggleFullscreen(true);
        }
      });
      document.addEventListener("webkitfullscreenchange", () => {
        const isNative = Boolean(document.webkitFullscreenElement);
        if (!isNative && this.state.isFullscreen) {
          this.toggleFullscreen(false);
        } else if (isNative && !this.state.isFullscreen) {
          this.toggleFullscreen(true);
        }
      });

      // Close on backdrop click (if clicking the outer dark overlay)
      if (this.dom.modal) {
        this.dom.modal.addEventListener("click", (e) => {
          if (e.target === this.dom.modal) {
            this.close();
          }
        });
      }

      // Auto-refocus presentation iframe on viewer interaction so arrow keys work immediately
      if (this.dom.modalCard) {
        this.dom.modalCard.addEventListener("click", () => {
          if (this.getPreviewType() === "ppt") {
            const iframe = document.getElementById("previewPptIframe") || document.getElementById("previewIframe");
            if (iframe) {
              try { iframe.focus(); } catch (e) {}
            }
          }
        });
      }

      // Close button
      if (this.dom.closeBtn) {
        this.dom.closeBtn.onclick = () => this.close();
      }

      // Fullscreen toggle button
      if (this.dom.fullscreenBtn) {
        this.dom.fullscreenBtn.onclick = () => this.toggleFullscreen();
      }

      // Copy button
      if (this.dom.copyBtn) {
        this.dom.copyBtn.onclick = () => this.handleCopyAction();
      }

      // Open in Drive button
      if (this.dom.openDriveBtn) {
        this.dom.openDriveBtn.onclick = () => this.openInDrive();
      }

      // Download button
      if (this.dom.downloadBtn) {
        this.dom.downloadBtn.onclick = () => this.downloadCurrentItem();
      }
    },

    getPreviewType(item = this.state.currentItem) {
      if (!item) return "other";
      const name = (item.name || "").toLowerCase();
      const mime = (item.mimeType || "").toLowerCase();

      if (mime === "application/pdf" || name.endsWith(".pdf") || mime === "application/vnd.google-apps.document") {
        return "pdf";
      }
      if (
        mime.includes("presentationml") ||
        mime.includes("ms-powerpoint") ||
        mime === "application/vnd.google-apps.presentation" ||
        name.endsWith(".pptx") ||
        name.endsWith(".ppt") ||
        name.endsWith(".pps") ||
        name.endsWith(".ppsx") ||
        name.endsWith(".odp")
      ) {
        return "ppt";
      }
      if (
        mime.includes("wordprocessingml") ||
        mime === "application/msword" ||
        name.endsWith(".docx") ||
        name.endsWith(".doc")
      ) {
        return "word";
      }
      if (
        mime.includes("spreadsheetml") ||
        mime.includes("ms-excel") ||
        mime === "text/csv" ||
        mime === "text/tab-separated-values" ||
        mime === "application/vnd.google-apps.spreadsheet" ||
        name.endsWith(".xlsx") ||
        name.endsWith(".xls") ||
        name.endsWith(".csv") ||
        name.endsWith(".tsv")
      ) {
        return "excel";
      }
      if (
        mime.startsWith("image/") ||
        name.endsWith(".png") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".gif") ||
        name.endsWith(".webp") ||
        name.endsWith(".svg") ||
        name.endsWith(".bmp") ||
        name.endsWith(".ico")
      ) {
        return "image";
      }
      if (
        mime.startsWith("audio/") ||
        name.endsWith(".mp3") ||
        name.endsWith(".wav") ||
        name.endsWith(".ogg") ||
        name.endsWith(".m4a") ||
        name.endsWith(".aac")
      ) {
        return "audio";
      }
      if (
        mime.startsWith("video/") ||
        name.endsWith(".mp4") ||
        name.endsWith(".webm") ||
        name.endsWith(".ogv") ||
        name.endsWith(".mov")
      ) {
        return "video";
      }
      if (
        mime.startsWith("text/") ||
        mime.includes("json") ||
        mime.includes("javascript") ||
        mime.includes("typescript") ||
        mime.includes("xml") ||
        mime.includes("sql") ||
        name.endsWith(".txt") ||
        name.endsWith(".json") ||
        name.endsWith(".js") ||
        name.endsWith(".ts") ||
        name.endsWith(".jsx") ||
        name.endsWith(".tsx") ||
        name.endsWith(".py") ||
        name.endsWith(".html") ||
        name.endsWith(".css") ||
        name.endsWith(".md") ||
        name.endsWith(".xml") ||
        name.endsWith(".sql") ||
        name.endsWith(".sh") ||
        name.endsWith(".log") ||
        name.endsWith(".env") ||
        name.endsWith(".yaml") ||
        name.endsWith(".yml")
      ) {
        return "text";
      }
      return "other";
    },

    getFileTypeLabel(item) {
      if (!item) return "Document";
      const name = (item.name || "").toLowerCase();
      const mime = (item.mimeType || "").toLowerCase();

      if (
        mime.includes("presentationml") ||
        mime.includes("powerpoint") ||
        mime === "application/vnd.google-apps.presentation" ||
        name.endsWith(".pptx") ||
        name.endsWith(".ppt") ||
        name.endsWith(".pps") ||
        name.endsWith(".ppsx") ||
        name.endsWith(".odp")
      ) {
        return "PowerPoint Presentation";
      }
      if (mime === "application/pdf" || name.endsWith(".pdf") || mime === "application/vnd.google-apps.document") {
        return "PDF Document";
      }
      if (
        mime.includes("wordprocessingml") ||
        mime === "application/msword" ||
        name.endsWith(".docx") ||
        name.endsWith(".doc")
      ) {
        return "Word Document";
      }
      if (
        mime.includes("spreadsheetml") ||
        mime.includes("excel") ||
        name.endsWith(".xlsx") ||
        name.endsWith(".xls")
      ) {
        return "Excel Spreadsheet";
      }
      if (name.endsWith(".csv") || mime === "text/csv") {
        return "CSV Spreadsheet";
      }
      if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|ico|bmp)$/.test(name)) {
        const ext = name.split(".").pop();
        return ext && ext.length <= 4 ? `${ext.toUpperCase()} Image` : "Image";
      }
      if (mime.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/.test(name)) {
        return "Video";
      }
      if (mime.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac)$/.test(name)) {
        return "Audio";
      }
      if (/\.(zip|rar|7z|tar|gz)$/.test(name)) {
        return "Archive";
      }
      if (/\.(txt|md|json|js|py|html|css|cpp|c|java|ts|xml|yaml|yml|sql|sh|env)$/.test(name) || mime.startsWith("text/")) {
        const ext = name.split(".").pop();
        return ext && ext.length <= 4 ? `${ext.toUpperCase()} Document` : "Text Document";
      }
      return "Document";
    },

    getGoogleDriveImageSrc(item) {
      if (!item) return "";
      if (item.webViewLink && item.webViewLink.startsWith("data:")) {
        return item.webViewLink;
      }
      if (item.id && !String(item.id).startsWith("upload_")) {
        // High-res Google Drive thumbnail endpoint
        return `https://drive.google.com/thumbnail?id=${encodeURIComponent(item.id)}&sz=w2500`;
      }
      return item.webContentLink || item.webViewLink || "";
    },

    getGoogleDriveEmbedUrl(item) {
      if (!item) return "about:blank";
      if (item.id && !String(item.id).startsWith("upload_")) {
        return `https://drive.google.com/file/d/${encodeURIComponent(item.id)}/preview`;
      }
      return item.webViewLink || item.webContentLink || "about:blank";
    },

    getGoogleDriveViewUrl(item) {
      if (!item) return "";
      if (item.webViewLink && !item.webViewLink.startsWith("data:")) {
        return item.webViewLink;
      }
      if (item.id && !String(item.id).startsWith("upload_")) {
        return `https://drive.google.com/file/d/${encodeURIComponent(item.id)}/view`;
      }
      return item.webContentLink || "";
    },

    findItemById(id) {
      if (!id) return null;
      // Check active items in state
      if (window.state && Array.isArray(window.state.items)) {
        const found = window.state.items.find((x) => x.id === id);
        if (found) return found;
      }
      if (window.state && Array.isArray(window.state.vaultIndex)) {
        const found = window.state.vaultIndex.find((x) => x.id === id);
        if (found) return found;
      }
      // Check vaultState
      if (window.vaultState && Array.isArray(window.vaultState.items)) {
        const found = window.vaultState.items.find((x) => x.id === id);
        if (found) return found;
      }
      if (window.vaultState && Array.isArray(window.vaultState.vaultIndex)) {
        const found = window.vaultState.vaultIndex.find((x) => x.id === id);
        if (found) return found;
      }
      // DOM Fallback: reconstruct from row if element exists in page
      const el = document.querySelector(`[data-id="${id}"]`) || document.querySelector(`[data-preview="${id}"]`);
      if (el) {
        const row = el.closest(".file-row") || el;
        const nameEl = row.querySelector(".file-name");
        const name = nameEl ? nameEl.textContent.trim() : (el.dataset.name || "File");
        const mime = el.dataset.mime || "";
        const size = el.dataset.size || "";
        return { id, name, mimeType: mime, size };
      }
      return null;
    },

    openById(id, event) {
      if (event && typeof event.stopPropagation === "function") {
        event.stopPropagation();
      }
      const item = this.findItemById(id);
      if (item) {
        this.open(item);
      } else {
        console.warn("Item not found by ID:", id);
      }
    },

    formatBytes(bytes) {
      if (!bytes || isNaN(bytes)) return "";
      const b = Number(bytes);
      if (b === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(b) / Math.log(k));
      return parseFloat((b / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    },

    getFileIcon(name = "", mime = "") {
      const n = (name || "").toLowerCase();
      const m = (mime || "").toLowerCase();
      if (n.endsWith(".ppt") || n.endsWith(".pptx") || n.endsWith(".pps") || n.endsWith(".ppsx") || n.endsWith(".odp") || m.includes("presentation") || m.includes("powerpoint")) return "📙";
      if (n.endsWith(".pdf") || m === "application/pdf" || m === "application/vnd.google-apps.document") return "📕";
      if (n.endsWith(".doc") || n.endsWith(".docx") || m.includes("word") || m.includes("wordprocessingml")) return "📘";
      if (n.endsWith(".xls") || n.endsWith(".xlsx") || n.endsWith(".csv") || m.includes("spreadsheet") || m.includes("excel")) return "📗";
      if (m.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg|ico|bmp)$/.test(n)) return "🖼️";
      if (m.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/.test(n)) return "🎬";
      if (m.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac)$/.test(n)) return "🎵";
      if (/\.(zip|rar|7z|tar|gz)$/.test(n)) return "📦";
      if (/\.(txt|md|json|js|py|html|css|cpp|c|java|ts)$/.test(n) || m.startsWith("text/")) return "📝";
      return "📄";
    },

    showLoading(text = "Loading Preview...") {
      this.cacheDom();
      if (this.dom.loading) {
        this.dom.loading.classList.remove("hidden");
        this.dom.loading.classList.remove("opacity-0");
        this.dom.loading.style.display = "flex";
      }
      if (this.dom.loadingText) {
        this.dom.loadingText.textContent = text;
      }
    },

    hideLoading() {
      this.cacheDom();
      if (this.dom.loading) {
        this.dom.loading.classList.add("opacity-0");
        setTimeout(() => {
          if (this.dom.loading) {
            this.dom.loading.classList.add("hidden");
            this.dom.loading.style.display = "none";
          }
        }, 180);
      }
    },

    showNotice(text, isWarning = false) {
      this.cacheDom();
      if (!this.dom.noticeBar || !this.dom.noticeText) return;
      this.dom.noticeText.textContent = text;
      this.dom.noticeBar.classList.remove("hidden");
      if (isWarning) {
        this.dom.noticeBar.className =
          "px-4 py-2 text-xs font-semibold bg-amber-500/15 border-b border-amber-500/30 text-amber-800 dark:text-amber-200 flex items-center justify-between flex-shrink-0";
      } else {
        this.dom.noticeBar.className =
          "px-4 py-2 text-xs font-semibold bg-indigo-500/15 border-b border-indigo-500/30 text-indigo-800 dark:text-indigo-200 flex items-center justify-between flex-shrink-0";
      }
    },

    hideNotice() {
      if (this.dom.noticeBar) this.dom.noticeBar.classList.add("hidden");
    },

    async open(item, customBlob = null) {
      if (!item) return;

      this.cacheDom();
      if (!this.dom.modal) {
        console.error("filePreviewModal DOM element not found.");
        return;
      }

      // Guarantee modal is top-level child of body to avoid stacking/clip context issues
      if (this.dom.modal.parentNode !== document.body) {
        document.body.appendChild(this.dom.modal);
        this.cacheDom();
      }

      // Cleanup previous state & memory
      this.cleanupPrevious();

      if (customBlob) {
        this.state.currentBlob = customBlob;
        this.state.currentBlobUrl = URL.createObjectURL(customBlob);
      } else if (item.blob) {
        this.state.currentBlob = item.blob;
        this.state.currentBlobUrl = URL.createObjectURL(item.blob);
      } else if (item.file) {
        this.state.currentBlob = item.file;
        this.state.currentBlobUrl = URL.createObjectURL(item.file);
      }

      this.state.isOpen = true;
      this.state.currentItem = item;
      this.state.zoomLevel = 1;
      this.state.rotateDeg = 0;
      this.state.searchQuery = "";
      this.state.viewMode = "visual";

      // Prevent background body scrolling
      document.body.style.overflow = "hidden";

      // Make modal visible with styling
      this.dom.modal.classList.remove("hidden");
      this.dom.modal.removeAttribute("hidden");
      this.dom.modal.setAttribute(
        "style",
        "display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 9999999 !important; background: rgba(15, 23, 42, 0.90); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); justify-content: center; align-items: center; pointer-events: auto !important;"
      );

      // Update Header info
      const type = this.getPreviewType(item);
      const icon = this.getFileIcon(item.name, item.mimeType);

      if (this.dom.fileIcon) this.dom.fileIcon.textContent = icon;
      if (this.dom.fileName) {
        this.dom.fileName.textContent = item.name || "File Preview";
        this.dom.fileName.setAttribute("title", item.name || "File Preview");
      }
      if (this.dom.fileMeta) {
        const sizeStr = item.size ? this.formatBytes(Number(item.size)) : "";
        const typeLabel = this.getFileTypeLabel(item);
        this.dom.fileMeta.textContent = `${typeLabel}${sizeStr ? " • " + sizeStr : ""}`;
      }
      if (this.dom.extraMeta) {
        this.dom.extraMeta.textContent = "";
        this.dom.extraMeta.classList.add("hidden");
      }

      // Configure Action Buttons
      const isCustomUpload = item.id && String(item.id).startsWith("upload_");
      const isDataUrl = item.webViewLink && item.webViewLink.startsWith("data:");

      if (this.dom.openDriveBtn) {
        if (isCustomUpload || isDataUrl) {
          this.dom.openDriveBtn.classList.add("hidden");
        } else {
          this.dom.openDriveBtn.classList.remove("hidden");
          this.dom.openDriveBtn.onclick = () => this.openInDrive();
        }
      }

      if (this.dom.downloadBtn) {
        this.dom.downloadBtn.classList.remove("hidden");
        this.dom.downloadBtn.innerHTML = `<span>↓</span> <span>Save</span>`;
        this.dom.downloadBtn.onclick = () => this.downloadCurrentItem();
      }

      // Reset dynamic toolbar & notice bar
      if (this.dom.dynamicToolbar) this.dom.dynamicToolbar.innerHTML = "";
      this.hideNotice();
      if (this.dom.contentArea) this.dom.contentArea.innerHTML = "";

      // Initialize default text (filename & link)
      this.state.currentText = `${item.name || "File"}\nLink: ${this.getGoogleDriveViewUrl(item) || item.webContentLink || ""}`;

      // Route to dedicated renderer based on file type
      await this.routeRenderer(type, item);
    },

    async routeRenderer(type, item) {
      this.showLoading(`Loading ${item.name || "file"}...`);

      try {
        // 1. Direct data URLs (e.g. from local uploads or memory)
        if (item.webViewLink && item.webViewLink.startsWith("data:")) {
          const blob = this.dataURLtoBlob(item.webViewLink);
          if (blob) {
            this.state.currentBlob = blob;
            this.state.currentBlobUrl = URL.createObjectURL(blob);
          }
        }

        // 2. Dispatch to dedicated viewers
        switch (type) {
          case "image":
            await this.renderImage(item);
            break;
          case "word":
            await this.renderWord(item);
            break;
          case "excel":
            await this.renderExcel(item);
            break;
          case "ppt":
            await this.renderPpt(item);
            break;
          case "pdf":
            await this.renderPdf(item);
            break;
          case "audio":
          case "video":
            await this.renderMedia(item, type);
            break;
          case "text":
            await this.renderText(item);
            break;
          default:
            this.renderDriveIframe(item);
            break;
        }
      } catch (err) {
        console.error("Preview render failed:", err);
        this.renderDriveIframe(item, "Rich in-app reader unavailable for this file. Loaded standard viewer.");
      }
    },

    // -------------------------------------------------------------
    // IMAGE RENDERER (Supports Google Drive Images & Local Uploads)
    // -------------------------------------------------------------
    async renderImage(item) {
      const container = this.dom.contentArea;
      if (!container) return;

      const imgSrc = this.state.currentBlobUrl || this.getGoogleDriveImageSrc(item);
      this.updateCopyButtonLabel("Copy Image");

      container.innerHTML = `
        <div id="imageCanvasContainer" class="w-full h-full flex items-center justify-center overflow-hidden relative select-none bg-slate-950/90 cursor-grab">
          <img 
            id="previewImageEl" 
            src="${this.escapeAttr(imgSrc)}" 
            alt="${this.escapeAttr(item.name || "Preview")}" 
            class="max-w-none transition-transform duration-75 ease-out shadow-2xl rounded-lg" 
            style="transform: scale(1) rotate(0deg);"
          />
        </div>
      `;

      // Set up Image Controls in dynamic toolbar
      if (this.dom.dynamicToolbar) {
        this.dom.dynamicToolbar.innerHTML = `
          <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <button id="imgZoomOutBtn" type="button" title="Zoom Out (-)" class="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition">➖</button>
            <span id="imgZoomLabel" class="text-xs font-extrabold px-1.5 text-slate-700 dark:text-slate-300 min-w-[48px] text-center">100%</span>
            <button id="imgZoomInBtn" type="button" title="Zoom In (+)" class="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition">➕</button>
            <div class="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-0.5"></div>
            <button id="imgResetBtn" type="button" title="Reset Zoom (0)" class="px-2.5 py-1 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition">1:1</button>
            <button id="imgFitBtn" type="button" title="Fit to Screen" class="px-2.5 py-1 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition">⊡ Fit</button>
            <button id="imgRotateBtn" type="button" title="Rotate 90°" class="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition">↻</button>
          </div>
        `;

        const btnIn = document.getElementById("imgZoomInBtn");
        const btnOut = document.getElementById("imgZoomOutBtn");
        const btnReset = document.getElementById("imgResetBtn");
        const btnFit = document.getElementById("imgFitBtn");
        const btnRotate = document.getElementById("imgRotateBtn");

        if (btnIn) btnIn.onclick = () => this.zoomImage(0.25);
        if (btnOut) btnOut.onclick = () => this.zoomImage(-0.25);
        if (btnReset) btnReset.onclick = () => this.resetImageZoom();
        if (btnFit) btnFit.onclick = () => this.fitImageToScreen();
        if (btnRotate) btnRotate.onclick = () => this.rotateImage();
      }

      const imgEl = document.getElementById("previewImageEl");
      const canvas = document.getElementById("imageCanvasContainer");

      if (imgEl) {
        // Fallback if drive thumbnail fails (try lh3 direct link)
        imgEl.onerror = () => {
          if (item.id && !imgEl.src.includes("lh3.googleusercontent.com/d/")) {
            imgEl.src = `https://lh3.googleusercontent.com/d/${encodeURIComponent(item.id)}`;
          } else {
            this.hideLoading();
            this.renderDriveIframe(item, "Image direct render blocked. Loaded Drive Preview.");
          }
        };

        imgEl.onload = () => {
          this.hideLoading();
          const w = imgEl.naturalWidth;
          const h = imgEl.naturalHeight;
          if (this.dom.extraMeta) {
            this.dom.extraMeta.textContent = `${w} × ${h} px`;
            this.dom.extraMeta.classList.remove("hidden");
          }
          this.fitImageToScreen();
        };

        // Wheel Zoom
        canvas.onwheel = (e) => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -0.15 : 0.15;
          this.zoomImage(delta);
        };

        // Pan & Drag
        canvas.onmousedown = (e) => {
          if (e.button !== 0) return;
          this.state.isPanning = true;
          this.state.panStartX = e.clientX - this.state.panCurrentX;
          this.state.panStartY = e.clientY - this.state.panCurrentY;
          canvas.style.cursor = "grabbing";
        };

        window.onmousemove = (e) => {
          if (!this.state.isPanning) return;
          this.state.panCurrentX = e.clientX - this.state.panStartX;
          this.state.panCurrentY = e.clientY - this.state.panStartY;
          this.updateImageTransform();
        };

        window.onmouseup = () => {
          if (this.state.isPanning) {
            this.state.isPanning = false;
            if (canvas) canvas.style.cursor = "grab";
          }
        };
      }

      // Safety timeout in case image loads instantly from cache
      setTimeout(() => {
        if (imgEl && imgEl.complete && imgEl.naturalWidth) {
          this.hideLoading();
          this.fitImageToScreen();
        }
      }, 300);

      this.updateFooterInfo("Image Viewer • Scroll to zoom • Drag to pan • Fullscreen ⛶");
    },

    zoomImage(delta) {
      this.state.zoomLevel = Math.max(0.1, Math.min(6, this.state.zoomLevel + delta));
      this.updateImageTransform();
    },

    resetImageZoom() {
      this.state.zoomLevel = 1;
      this.state.panCurrentX = 0;
      this.state.panCurrentY = 0;
      this.updateImageTransform();
    },

    fitImageToScreen() {
      const imgEl = document.getElementById("previewImageEl");
      const canvas = document.getElementById("imageCanvasContainer");
      if (!imgEl || !canvas || !imgEl.naturalWidth) return;

      const padding = 30;
      const cW = canvas.clientWidth - padding;
      const cH = canvas.clientHeight - padding;
      const iW = imgEl.naturalWidth;
      const iH = imgEl.naturalHeight;

      const scale = Math.min(cW / iW, cH / iH, 1);
      this.state.zoomLevel = Math.max(0.2, scale);
      this.state.panCurrentX = 0;
      this.state.panCurrentY = 0;
      this.updateImageTransform();
    },

    rotateImage() {
      this.state.rotateDeg = (this.state.rotateDeg + 90) % 360;
      this.updateImageTransform();
    },

    updateImageTransform() {
      const imgEl = document.getElementById("previewImageEl");
      const label = document.getElementById("imgZoomLabel");
      if (!imgEl) return;

      imgEl.style.transform = `translate(${this.state.panCurrentX}px, ${this.state.panCurrentY}px) scale(${this.state.zoomLevel}) rotate(${this.state.rotateDeg}deg)`;
      if (label) {
        label.textContent = `${Math.round(this.state.zoomLevel * 100)}%`;
      }
    },

    // -------------------------------------------------------------
    // PDF RENDERER (Local Uploads & Google Drive Embed)
    // -------------------------------------------------------------
    async renderPdf(item) {
      const container = this.dom.contentArea;
      if (!container) return;

      // If we have a local blob (e.g. user uploaded file in session)
      if (this.state.currentBlobUrl) {
        this.updateCopyButtonLabel("Copy Text");
        this.extractPdfText(this.state.currentBlob);

        container.innerHTML = `
          <div class="w-full h-full flex flex-col bg-slate-900 overflow-hidden relative">
            <iframe 
              id="previewPdfIframe" 
              src="${this.state.currentBlobUrl}#view=FitH&toolbar=1" 
              class="w-full h-full border-0 flex-1" 
              allow="autoplay; fullscreen">
            </iframe>
          </div>
        `;

        if (this.dom.dynamicToolbar) {
          this.dom.dynamicToolbar.innerHTML = `
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <button id="pdfVisualViewBtn" type="button" class="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-sm transition">Visual</button>
              <button id="pdfTextViewBtn" type="button" class="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Text View</button>
            </div>
          `;

          const visualBtn = document.getElementById("pdfVisualViewBtn");
          const textBtn = document.getElementById("pdfTextViewBtn");

          if (visualBtn && textBtn) {
            visualBtn.onclick = () => {
              visualBtn.className = "px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-sm transition";
              textBtn.className = "px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition";
              const iframe = document.getElementById("previewPdfIframe");
              const textContainer = document.getElementById("previewPdfTextContainer");
              if (iframe) iframe.classList.remove("hidden");
              if (textContainer) textContainer.classList.add("hidden");
            };

            textBtn.onclick = () => {
              textBtn.className = "px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-sm transition";
              visualBtn.className = "px-2.5 py-1 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition";
              let textContainer = document.getElementById("previewPdfTextContainer");
              const iframe = document.getElementById("previewPdfIframe");
              if (!textContainer) {
                textContainer = document.createElement("div");
                textContainer.id = "previewPdfTextContainer";
                textContainer.className = "w-full h-full overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto font-sans leading-relaxed text-slate-800 dark:text-slate-200 select-text whitespace-pre-wrap";
                textContainer.textContent = this.state.currentText || "Extracting text from PDF pages...";
                iframe.parentNode.appendChild(textContainer);
              } else {
                textContainer.textContent = this.state.currentText || "No extractable text found in this PDF.";
              }
              if (iframe) iframe.classList.add("hidden");
              textContainer.classList.remove("hidden");
            };
          }
        }

        this.hideLoading();
        this.updateFooterInfo("PDF Reader • Native Browser Viewer • Fullscreen ⛶");
        return;
      }

      // For Google Drive PDFs, load official Drive Embed preview directly (fast & full-featured)
      this.renderDriveIframe(item);
    },

    async extractPdfText(blob) {
      if (!blob || typeof window.pdfjsLib === "undefined") return;
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        if (this.dom.extraMeta) {
          this.dom.extraMeta.textContent = `${totalPages} Page${totalPages > 1 ? "s" : ""}`;
          this.dom.extraMeta.classList.remove("hidden");
        }

        let fullText = [];
        for (let i = 1; i <= Math.min(totalPages, 50); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((it) => it.str);
          fullText.push(`--- Page ${i} ---\n` + strings.join(" "));
        }

        this.state.currentText = fullText.join("\n\n");
        const textContainer = document.getElementById("previewPdfTextContainer");
        if (textContainer && !textContainer.classList.contains("hidden")) {
          textContainer.textContent = this.state.currentText;
        }
      } catch (e) {
        console.warn("PDF.js text extraction notice:", e);
      }
    },

    // -------------------------------------------------------------
    // WORD RENDERER (.docx, .doc)
    // -------------------------------------------------------------
    async renderWord(item) {
      const container = this.dom.contentArea;
      if (!container) return;

      const isDocx = (item.name || "").toLowerCase().endsWith(".docx");

      // Check if Mammoth.js is available and we have a local blob
      if (isDocx && typeof window.mammoth !== "undefined" && this.state.currentBlob) {
        this.showLoading("Converting Word document...");
        try {
          const arrayBuffer = await this.state.currentBlob.arrayBuffer();
          const result = await window.mammoth.convertToHtml({ arrayBuffer });
          const rawResult = await window.mammoth.extractRawText({ arrayBuffer });

          const htmlContent = result.value || "<p class='text-slate-400 italic'>Empty document</p>";
          this.state.currentText = rawResult.value || "";

          const words = this.state.currentText.trim().split(/\s+/).filter(Boolean).length;
          const readTime = Math.max(1, Math.ceil(words / 200));

          if (this.dom.extraMeta) {
            this.dom.extraMeta.textContent = `${words.toLocaleString()} words • ~${readTime} min read`;
            this.dom.extraMeta.classList.remove("hidden");
          }

          this.updateCopyButtonLabel("Copy Text");

          container.innerHTML = `
            <div class="w-full h-full overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-10 flex justify-center bg-slate-100/70 dark:bg-slate-950/60 custom-scrollbar">
              <article class="preview-word-card w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-10 md:p-14 text-slate-800 dark:text-slate-100 select-text leading-relaxed">
                <div class="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span class="font-bold flex items-center gap-1.5"><span class="text-base">📘</span> Word Document</span>
                  <span>${words.toLocaleString()} Words</span>
                </div>
                <div class="preview-word-content space-y-4 font-sans text-sm sm:text-base selection:bg-indigo-500 selection:text-white">
                  ${htmlContent}
                </div>
              </article>
            </div>
          `;

          if (this.dom.dynamicToolbar) {
            this.dom.dynamicToolbar.innerHTML = `
              <div class="flex items-center gap-2">
                <button id="wordZoomDown" type="button" title="Decrease font size" class="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs transition">A-</button>
                <button id="wordZoomUp" type="button" title="Increase font size" class="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs transition">A+</button>
              </div>
            `;
            let currentFontSize = 15;
            const contentEl = container.querySelector(".preview-word-content");
            const btnDown = document.getElementById("wordZoomDown");
            const btnUp = document.getElementById("wordZoomUp");
            if (btnDown && btnUp && contentEl) {
              btnDown.onclick = () => {
                if (currentFontSize > 12) {
                  currentFontSize -= 1;
                  contentEl.style.fontSize = `${currentFontSize}px`;
                }
              };
              btnUp.onclick = () => {
                if (currentFontSize < 24) {
                  currentFontSize += 1;
                  contentEl.style.fontSize = `${currentFontSize}px`;
                }
              };
            }
          }

          this.hideLoading();
          this.updateFooterInfo("Word Reader • Formatted Text • Scroll to read • Fullscreen ⛶");
          return;
        } catch (docxErr) {
          console.warn("Mammoth.js conversion error:", docxErr);
        }
      }

      // Google Drive Word files or fallback
      this.renderDriveIframe(item);
    },

    // -------------------------------------------------------------
    // EXCEL / CSV RENDERER (.xlsx, .xls, .csv)
    // -------------------------------------------------------------
    async renderExcel(item) {
      const container = this.dom.contentArea;
      if (!container) return;

      // If we have a local blob (e.g. from file input upload)
      if (typeof window.XLSX !== "undefined" && this.state.currentBlob) {
        this.showLoading("Parsing spreadsheet data...");
        try {
          const arrayBuffer = await this.state.currentBlob.arrayBuffer();
          const workbook = window.XLSX.read(arrayBuffer, { type: "array" });
          this.state.workbook = workbook;

          const sheetNames = workbook.SheetNames || [];
          if (!sheetNames.length) throw new Error("No sheets found in spreadsheet");

          this.state.activeSheetName = sheetNames[0];
          this.updateCopyButtonLabel("Copy Table");

          container.innerHTML = `
            <div class="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
              <div id="excelControlsBar" class="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex-shrink-0">
                <div id="excelSheetTabs" class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5 max-w-full"></div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <div class="relative">
                    <input 
                      id="excelSearchInput" 
                      type="search" 
                      placeholder="Filter rows..." 
                      class="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36 sm:w-52 transition"
                    />
                    <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">🔍</span>
                  </div>
                  <button id="excelCopyCsvBtn" type="button" title="Copy as CSV" class="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700/60">
                    CSV
                  </button>
                </div>
              </div>
              <div id="excelTableViewport" class="flex-1 w-full h-full overflow-auto custom-scrollbar relative p-2 sm:p-4"></div>
            </div>
          `;

          this.renderExcelSheetTabs(sheetNames);

          const searchInput = document.getElementById("excelSearchInput");
          if (searchInput) {
            searchInput.oninput = (e) => {
              this.state.searchQuery = e.target.value.toLowerCase();
              this.renderExcelActiveSheet();
            };
          }

          const copyCsvBtn = document.getElementById("excelCopyCsvBtn");
          if (copyCsvBtn) {
            copyCsvBtn.onclick = () => this.copyExcelAsCsv();
          }

          this.renderExcelActiveSheet();
          this.hideLoading();
          return;
        } catch (err) {
          console.warn("Excel parsing error:", err);
        }
      }

      // Google Drive Spreadsheets / Fallback
      this.renderDriveIframe(item);
    },

    renderExcelSheetTabs(sheetNames) {
      const tabsEl = document.getElementById("excelSheetTabs");
      if (!tabsEl) return;

      tabsEl.innerHTML = sheetNames
        .map(
          (name) => `
          <button 
            type="button" 
            data-sheet="${encodeURIComponent(name)}" 
            class="excel-tab-btn flex-shrink-0 px-3 py-1 text-xs font-extrabold rounded-xl transition ${
              name === this.state.activeSheetName
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }">
            📊 ${this.escapeHtml(name)}
          </button>
        `
        )
        .join("");

      tabsEl.querySelectorAll(".excel-tab-btn").forEach((btn) => {
        btn.onclick = () => {
          const sheet = decodeURIComponent(btn.dataset.sheet);
          this.state.activeSheetName = sheet;
          this.renderExcelSheetTabs(sheetNames);
          this.renderExcelActiveSheet();
        };
      });
    },

    renderExcelActiveSheet() {
      const viewport = document.getElementById("excelTableViewport");
      if (!viewport || !this.state.workbook) return;

      const sheet = this.state.workbook.Sheets[this.state.activeSheetName];
      if (!sheet) {
        viewport.innerHTML = `<div class="p-8 text-center text-slate-400">Sheet is empty</div>`;
        return;
      }

      const rawData = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      if (!rawData || !rawData.length) {
        viewport.innerHTML = `<div class="p-8 text-center text-slate-400">No data found in sheet</div>`;
        return;
      }

      this.state.currentTableData = rawData;

      const query = (this.state.searchQuery || "").trim();
      let filteredData = rawData;
      if (query) {
        filteredData = [
          rawData[0],
          ...rawData.slice(1).filter((row) =>
            row.some((cell) => String(cell).toLowerCase().includes(query))
          ),
        ];
      }

      this.state.currentText = rawData
        .map((r) => r.map((c) => String(c).replace(/\t/g, " ")).join("\t"))
        .join("\n");

      let maxCols = 0;
      filteredData.forEach((row) => {
        if (row.length > maxCols) maxCols = row.length;
      });

      if (this.dom.extraMeta) {
        this.dom.extraMeta.textContent = `${rawData.length} rows • ${maxCols} cols`;
        this.dom.extraMeta.classList.remove("hidden");
      }

      let tableHtml = `
        <div class="inline-block min-w-full align-middle shadow-md rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table class="preview-sheet-table min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs border-collapse">
            <thead class="sticky top-0 z-20 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-sm">
              <tr>
                <th class="sticky left-0 z-30 w-12 px-3 py-2 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-200/80 dark:bg-slate-850/80 border-r border-b border-slate-300 dark:border-slate-700">#</th>
      `;

      for (let c = 0; c < maxCols; c++) {
        const colLetter = this.getColLetter(c);
        tableHtml += `
          <th class="px-3 py-2 text-left text-[11px] font-bold text-slate-600 dark:text-slate-300 border-r border-b border-slate-200 dark:border-slate-700/60 select-none">
            ${colLetter}
          </th>
        `;
      }
      tableHtml += `</tr></thead><tbody class="divide-y divide-slate-200 dark:divide-slate-800 select-text">`;

      filteredData.forEach((row, rIdx) => {
        const rowNum = rIdx + 1;
        const isHeaderRow = rIdx === 0;
        const rowClass = isHeaderRow
          ? "bg-slate-50/90 dark:bg-slate-900/90 font-bold text-slate-900 dark:text-slate-100"
          : "odd:bg-white even:bg-slate-50/40 dark:odd:bg-slate-900 dark:even:bg-slate-950/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 transition-colors";

        tableHtml += `<tr class="${rowClass}">`;
        tableHtml += `
          <td class="sticky left-0 z-10 px-2 py-1.5 text-center text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-850 border-r border-slate-200 dark:border-slate-800 select-none">
            ${rowNum}
          </td>
        `;

        for (let c = 0; c < maxCols; c++) {
          const val = row[c] !== undefined ? String(row[c]) : "";
          tableHtml += `
            <td 
              class="excel-cell px-3 py-2 border-r border-slate-200/60 dark:border-slate-800/60 whitespace-pre-wrap max-w-xs break-words hover:outline hover:outline-1 hover:outline-indigo-500 cursor-cell" 
              title="Click to copy cell: ${this.escapeAttr(val)}">
              ${this.escapeHtml(val)}
            </td>
          `;
        }
        tableHtml += `</tr>`;
      });

      tableHtml += `</tbody></table></div>`;
      viewport.innerHTML = tableHtml;

      viewport.querySelectorAll(".excel-cell").forEach((cell) => {
        cell.onclick = async () => {
          const text = cell.textContent.trim();
          await this.copyTextToClipboard(text);
          this.showToast(`Copied cell: "${text.slice(0, 30)}${text.length > 30 ? "..." : ""}"`);
        };
      });

      this.updateFooterInfo(
        `Sheet: ${this.state.activeSheetName} • ${rawData.length} Rows • Click cell to copy • Export with CSV button`
      );
    },

    getColLetter(n) {
      let ordA = "A".charCodeAt(0);
      let ordZ = "Z".charCodeAt(0);
      let len = ordZ - ordA + 1;
      let s = "";
      while (n >= 0) {
        s = String.fromCharCode((n % len) + ordA) + s;
        n = Math.floor(n / len) - 1;
      }
      return s;
    },

    async copyExcelAsCsv() {
      if (!this.state.currentTableData) return;
      const csv = this.state.currentTableData
        .map((row) =>
          row
            .map((val) => {
              const s = String(val || "");
              return s.includes(",") || s.includes('"') || s.includes("\n")
                ? `"${s.replace(/"/g, '""')}"`
                : s;
            })
            .join(",")
        )
        .join("\n");

      await this.copyTextToClipboard(csv);
      this.animateCopyButton("Copied CSV! ✓");
      this.showToast("Copied spreadsheet as CSV!");
    },

    // -------------------------------------------------------------
    // TEXT / CODE RENDERER
    // -------------------------------------------------------------
    async renderText(item) {
      const container = this.dom.contentArea;
      if (!container) return;

      let text = "";
      if (this.state.currentBlob) {
        text = await this.state.currentBlob.text();
      }

      this.state.currentText = text;
      this.updateCopyButtonLabel("Copy Text");

      const lines = text.split("\n");
      if (this.dom.extraMeta) {
        this.dom.extraMeta.textContent = `${lines.length} lines • ${text.length.toLocaleString()} chars`;
        this.dom.extraMeta.classList.remove("hidden");
      }

      let codeRows = lines
        .map((line, idx) => {
          return `
          <div class="code-line flex hover:bg-slate-800/40">
            <span class="code-num w-12 flex-shrink-0 text-right pr-4 text-slate-500 select-none font-mono text-xs py-0.5">${idx + 1}</span>
            <span class="code-text flex-1 font-mono text-xs sm:text-sm text-slate-200 py-0.5 whitespace-pre-wrap break-all select-text">${this.escapeHtml(line) || " "}</span>
          </div>
        `;
        })
        .join("");

      container.innerHTML = `
        <div class="w-full h-full flex flex-col bg-slate-950 overflow-hidden font-mono">
          <div class="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 flex-shrink-0">
            <span>Plain Text / Source Code</span>
            <button id="toggleWrapBtn" type="button" class="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition">
              Word Wrap: On
            </button>
          </div>
          <div id="codeViewScroll" class="flex-1 w-full overflow-auto p-4 custom-scrollbar select-text">
            <div class="min-w-full inline-block">${codeRows}</div>
          </div>
        </div>
      `;

      const wrapBtn = document.getElementById("toggleWrapBtn");
      if (wrapBtn) {
        let isWrapped = true;
        wrapBtn.onclick = () => {
          isWrapped = !isWrapped;
          wrapBtn.textContent = `Word Wrap: ${isWrapped ? "On" : "Off"}`;
          container.querySelectorAll(".code-text").forEach((el) => {
            el.className = `code-text flex-1 font-mono text-xs sm:text-sm text-slate-200 py-0.5 ${
              isWrapped ? "whitespace-pre-wrap break-all" : "whitespace-pre"
            } select-text`;
          });
        };
      }

      this.hideLoading();
      this.updateFooterInfo(`Text Reader • ${lines.length} Lines • Select text to copy • Word wrap toggle`);
    },

    // -------------------------------------------------------------
    // AUDIO / VIDEO RENDERER
    // -------------------------------------------------------------
    async renderMedia(item, type) {
      const container = this.dom.contentArea;
      if (!container) return;

      const mediaSrc = this.state.currentBlobUrl || item.webContentLink || item.webViewLink;

      if (type === "video") {
        container.innerHTML = `
          <div class="w-full h-full flex items-center justify-center p-4 bg-slate-950">
            <video controls autoplay class="max-w-full max-h-full rounded-2xl shadow-2xl border border-slate-800">
              <source src="${this.escapeAttr(mediaSrc)}">
              Your browser does not support video playback.
            </video>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950">
            <div class="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center max-w-md w-full">
              <span class="text-6xl mb-4">🎵</span>
              <h4 class="text-base font-extrabold text-slate-100 mb-1 text-center truncate max-w-full">${this.escapeHtml(item.name || "Audio Track")}</h4>
              <p class="text-xs text-slate-400 mb-6">Audio Player</p>
              <audio controls autoplay class="w-full">
                <source src="${this.escapeAttr(mediaSrc)}">
                Your browser does not support audio playback.
              </audio>
            </div>
          </div>
        `;
      }

      this.hideLoading();
      this.updateFooterInfo(`Media Player • ${type.toUpperCase()} Playback`);
    },

    // -------------------------------------------------------------
    // PPT / PRESENTATION RENDERER (.pptx, .ppt, Google Slides)
    // -------------------------------------------------------------
    async renderPpt(item) {
      const container = this.dom.contentArea;
      if (!container) return;

      const embedUrl = this.getPptEmbedUrl(item);

      container.innerHTML = `
        <div id="previewPptContainer" class="w-full h-full flex flex-col bg-slate-950 relative overflow-hidden">
          <iframe 
            id="previewPptIframe" 
            src="${this.escapeAttr(embedUrl)}" 
            class="w-full h-full border-0 flex-1" 
            allow="autoplay; fullscreen"
            allowfullscreen="true">
          </iframe>
        </div>
      `;

      if (this.dom.dynamicToolbar) {
        this.dom.dynamicToolbar.innerHTML = `
          <div class="flex items-center gap-1.5">
            <button id="pptSlideshowBtn" type="button" title="Slide Show" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-sm transition active:scale-95 cursor-pointer">
              <span>📽️</span>
              <span>Slide Show</span>
            </button>
          </div>
        `;

        const slideshowBtn = document.getElementById("pptSlideshowBtn");
        if (slideshowBtn) {
          slideshowBtn.onclick = (e) => {
            if (e) e.stopPropagation();
            const presentUrl = this.getPptPresentUrl(item);
            if (presentUrl) {
              window.open(presentUrl, "_blank", "noopener");
            }
          };
        }
      }

      const iframe = document.getElementById("previewPptIframe");
      if (iframe) {
        // Fallback to drive preview if docs embed has issue
        iframe.onerror = () => {
          if (item.id && !iframe.src.includes("drive.google.com/file/d/")) {
            iframe.src = `https://drive.google.com/file/d/${encodeURIComponent(item.id)}/preview`;
          }
        };
        iframe.onload = () => {
          this.hideLoading();
          setTimeout(() => {
            try {
              iframe.focus();
            } catch (e) {}
          }, 150);
        };
      }
      setTimeout(() => {
        this.hideLoading();
        try {
          const ifr = document.getElementById("previewPptIframe");
          if (ifr) ifr.focus();
        } catch (e) {}
      }, 1200);

      this.updateFooterInfo("PowerPoint Presentation • Google Slides Viewer • Use ← / → Arrow Keys or Space to switch slides • Click 'Slide Show' for full presentation");
    },

    getPptEmbedUrl(item) {
      if (!item) return "about:blank";
      const id = item.id;
      if (id && !String(id).startsWith("upload_")) {
        return `https://docs.google.com/presentation/d/${encodeURIComponent(id)}/embed?start=false&loop=false&delayms=3000`;
      }
      if (item.webViewLink && item.webViewLink.includes("docs.google.com/presentation")) {
        const idMatch = item.webViewLink.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
        if (idMatch) {
          return `https://docs.google.com/presentation/d/${idMatch[1]}/embed?start=false&loop=false&delayms=3000`;
        }
      }
      return item.webViewLink || item.webContentLink || "about:blank";
    },

    getPptPresentUrl(item) {
      if (!item) return "";
      const id = item.id;
      if (id && !String(id).startsWith("upload_")) {
        return `https://docs.google.com/presentation/d/${encodeURIComponent(id)}/present`;
      }
      if (item.webViewLink && item.webViewLink.includes("docs.google.com/presentation")) {
        const idMatch = item.webViewLink.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
        if (idMatch) {
          return `https://docs.google.com/presentation/d/${idMatch[1]}/present`;
        }
      }
      return this.getGoogleDriveViewUrl(item);
    },

    // -------------------------------------------------------------
    // GOOGLE DRIVE PREVIEW IFRAME (Universal Fast Embed)
    // -------------------------------------------------------------
    renderDriveIframe(item, noticeMessage = null) {
      const container = this.dom.contentArea;
      if (!container) return;

      const driveEmbedUrl = this.getGoogleDriveEmbedUrl(item);

      if (noticeMessage) {
        this.showNotice(noticeMessage, false);
      }

      container.innerHTML = `
        <div class="w-full h-full flex flex-col bg-slate-950 relative overflow-hidden">
          <iframe 
            id="previewIframe" 
            src="${this.escapeAttr(driveEmbedUrl)}" 
            class="w-full h-full border-0 flex-1" 
            allow="autoplay; fullscreen">
          </iframe>
        </div>
      `;

      const iframe = document.getElementById("previewIframe");
      if (iframe) {
        iframe.onload = () => {
          this.hideLoading();
        };
      }

      // Hide loading overlay after 1.2s max so iframe is immediately interactive
      setTimeout(() => {
        this.hideLoading();
      }, 1200);

      this.updateFooterInfo("Viewer Ready • Click 'Open in Drive' or 'Download' if file requires permission");
    },

    // -------------------------------------------------------------
    // COPY ACTION HANDLER (Text, Table, Image, and Fallback)
    // -------------------------------------------------------------
    async handleCopyAction() {
      const type = this.getPreviewType();

      // 1. Image copy
      if (type === "image") {
        if (this.state.currentBlob && typeof window.ClipboardItem !== "undefined") {
          try {
            await navigator.clipboard.write([
              new window.ClipboardItem({ [this.state.currentBlob.type || "image/png"]: this.state.currentBlob }),
            ]);
            this.animateCopyButton("Copied Image! ✓");
            this.showToast("Image copied to clipboard!");
            return;
          } catch (e) {
            console.warn("Direct blob clipboard write failed, copying URL:", e);
          }
        }
        const imgUrl = this.state.currentBlobUrl || this.getGoogleDriveImageSrc(this.state.currentItem) || this.state.currentItem?.webViewLink || "";
        if (imgUrl) {
          await this.copyTextToClipboard(imgUrl);
          this.animateCopyButton("Copied Link! ✓");
          this.showToast("Image link copied to clipboard!");
        }
        return;
      }

      // 2. Active user text selection inside modal
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const text = selection.toString();
        await this.copyTextToClipboard(text);
        this.animateCopyButton("Copied Selection! ✓");
        this.showToast("Copied selected text to clipboard!");
        return;
      }

      // 3. Document or Spreadsheet data
      if (this.state.currentText && this.state.currentText.trim().length > 0) {
        await this.copyTextToClipboard(this.state.currentText);
        const label = type === "excel" ? "Copied Table! ✓" : "Copied Text! ✓";
        this.animateCopyButton(label);
        this.showToast(`Copied ${type === "excel" ? "table data" : "document text"} to clipboard!`);
        return;
      }

      // 4. Fallback: Copy file info & link
      const driveUrl = this.getGoogleDriveViewUrl(this.state.currentItem) || this.state.currentItem?.webContentLink || "";
      const fallbackText = `${this.state.currentItem?.name || "File"}: ${driveUrl}`;
      await this.copyTextToClipboard(fallbackText);
      this.animateCopyButton("Copied Link! ✓");
      this.showToast("Copied file info to clipboard!");
    },

    async copyTextToClipboard(text) {
      if (!text) return false;
      // Try modern navigator.clipboard
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (err) {
        console.warn("navigator.clipboard.writeText error, attempting textarea fallback:", err);
      }

      // Rock-solid fallback using temporary textarea
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "-9999px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const success = document.execCommand("copy");
        document.body.removeChild(ta);
        return success;
      } catch (fallbackErr) {
        console.error("ExecCommand copy failed:", fallbackErr);
        return false;
      }
    },

    updateCopyButtonLabel(label) {
      this.cacheDom();
      if (this.dom.copyBtnLabel) {
        this.dom.copyBtnLabel.textContent = label;
      }
    },

    resetCopyButton(label = "Copy Text") {
      this.cacheDom();
      if (this.dom.copyBtn) {
        this.dom.copyBtn.className =
          "flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-extrabold rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/80 transition border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm cursor-pointer";
        this.updateCopyButtonLabel(label);
      }
    },

    animateCopyButton(successText = "Copied! ✓") {
      this.cacheDom();
      if (!this.dom.copyBtn) return;
      this.dom.copyBtn.className =
        "flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-extrabold rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition transform scale-105 cursor-pointer";
      this.updateCopyButtonLabel(successText);

      setTimeout(() => {
        const type = this.getPreviewType();
        const defaultLabel = type === "excel" ? "Copy Table" : type === "image" ? "Copy Image" : "Copy Text";
        this.resetCopyButton(defaultLabel);
      }, 2000);
    },

    // -------------------------------------------------------------
    // FULLSCREEN TOGGLE
    // -------------------------------------------------------------
    toggleFullscreen(forceState = null) {
      this.cacheDom();
      const newState = forceState !== null ? Boolean(forceState) : !this.state.isFullscreen;
      this.state.isFullscreen = newState;
      const card = this.dom.modalCard;
      const modal = this.dom.modal;
      const header = this.dom.modalHeader || document.getElementById("previewModalHeader") || (card ? card.firstElementChild : null);
      const footer = this.dom.footer || document.getElementById("previewFooter");
      const noticeBar = this.dom.noticeBar || document.getElementById("previewNoticeBar");
      if (!card) return;

      let floatBtn = document.getElementById("previewFloatingExitBtn");

      if (this.state.isFullscreen) {
        // Hide toolbar (header), notice bar, and footer completely in fullscreen mode
        if (header) header.classList.add("hidden");
        if (footer) footer.classList.add("hidden");
        if (noticeBar) noticeBar.classList.add("hidden");

        // Remove modal borders, rounded corners, padding, and shadows
        card.classList.remove("max-w-6xl", "h-[92vh]", "sm:h-[90vh]", "rounded-[2rem]", "border", "border-slate-200/90", "dark:border-slate-800/90", "shadow-2xl");
        card.classList.add("w-screen", "h-screen", "max-w-none", "max-h-none", "rounded-none", "border-0", "shadow-none");

        if (modal) {
          modal.classList.remove("p-2", "sm:p-4");
          modal.classList.add("p-0");
        }

        if (this.dom.fullscreenBtn) {
          this.dom.fullscreenBtn.innerHTML = "🗗";
          this.dom.fullscreenBtn.title = "Exit Fullscreen (Esc or F)";
        }

        // Show or create sleek floating exit button in top-right
        if (!floatBtn) {
          floatBtn = document.createElement("button");
          floatBtn.id = "previewFloatingExitBtn";
          floatBtn.type = "button";
          floatBtn.title = "Exit Fullscreen (Esc or F)";
          floatBtn.innerHTML = `<span class="text-base leading-none">🗗</span><span class="text-xs font-bold tracking-tight">Exit Full</span>`;
          floatBtn.className = "fixed top-3 right-4 z-[9999999] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-950 text-white backdrop-blur-md border border-white/20 shadow-2xl opacity-60 hover:opacity-100 transition-all duration-200 cursor-pointer select-none";
          floatBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggleFullscreen(false);
          };
          card.appendChild(floatBtn);
        } else {
          floatBtn.classList.remove("hidden");
          floatBtn.style.display = "flex";
        }
      } else {
        // Restore toolbar (header) and footer
        if (header) header.classList.remove("hidden");
        if (footer) footer.classList.remove("hidden");

        // Restore card borders, rounded corners, and shadows
        card.classList.add("max-w-6xl", "h-[92vh]", "sm:h-[90vh]", "rounded-[2rem]", "border", "border-slate-200/90", "dark:border-slate-800/90", "shadow-2xl");
        card.classList.remove("w-screen", "h-screen", "max-w-none", "max-h-none", "rounded-none", "border-0", "shadow-none");

        if (modal) {
          modal.classList.remove("p-0");
          modal.classList.add("p-2", "sm:p-4");
        }

        if (this.dom.fullscreenBtn) {
          this.dom.fullscreenBtn.innerHTML = "⛶";
          this.dom.fullscreenBtn.title = "Toggle Fullscreen (F)";
        }

        // Hide floating exit button
        if (floatBtn) {
          floatBtn.classList.add("hidden");
          floatBtn.style.display = "none";
        }

        // Exit native browser fullscreen if currently active
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          try {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          } catch (e) {}
        }
      }

      // Ensure slide player iframe keeps focus so arrow keys work immediately
      if (this.getPreviewType() === "ppt") {
        setTimeout(() => {
          const iframe = document.getElementById("previewPptIframe") || document.getElementById("previewIframe");
          if (iframe) {
            try { iframe.focus(); } catch (e) {}
          }
        }, 150);
      }
    },

    openInDrive() {
      const item = this.state.currentItem;
      if (!item) return;
      const driveUrl = this.getGoogleDriveViewUrl(item);
      if (driveUrl) {
        window.open(driveUrl, "_blank", "noopener");
      }
    },

    downloadCurrentItem() {
      const item = this.state.currentItem;
      if (!item) return;
      if (typeof window.downloadItem === "function") {
        window.downloadItem(item);
      } else {
        this.triggerDownloadFallback(item);
      }
    },

    // -------------------------------------------------------------
    // CLOSE MODAL & CLEANUP
    // -------------------------------------------------------------
    close() {
      this.cacheDom();
      this.cleanupPrevious();

      // Exit native browser fullscreen if currently active
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        try {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        } catch (e) {}
      }

      if (this.dom.modal) {
        this.dom.modal.classList.add("hidden");
        this.dom.modal.setAttribute("style", "display: none !important;");
      }

      // Restore body scrolling
      document.body.style.overflow = "";

      // Reset fullscreen if was active
      if (this.state.isFullscreen) {
        this.toggleFullscreen(false);
      }
      const floatBtn = document.getElementById("previewFloatingExitBtn");
      if (floatBtn) {
        floatBtn.classList.add("hidden");
        floatBtn.style.display = "none";
      }

      this.state.isOpen = false;
      this.state.currentItem = null;
    },

    cleanupPrevious() {
      if (this.state.currentBlobUrl) {
        try {
          URL.revokeObjectURL(this.state.currentBlobUrl);
        } catch (e) {}
        this.state.currentBlobUrl = null;
      }
      this.state.currentBlob = null;
      this.state.currentText = "";
      this.state.currentTableData = null;
      this.state.workbook = null;

      const iframe = document.getElementById("previewIframe") || document.querySelector("#previewContentArea iframe");
      if (iframe) iframe.src = "about:blank";

      if (this.dom.contentArea) {
        this.dom.contentArea.innerHTML = "";
      }
    },

    updateFooterInfo(info) {
      this.cacheDom();
      if (this.dom.footerInfo) {
        this.dom.footerInfo.textContent = info;
      }
    },

    showToast(message) {
      if (typeof window.showToast === "function") {
        window.showToast(message);
        return;
      }
      const toast = document.getElementById("toast");
      if (!toast) return;
      toast.textContent = message;
      toast.classList.remove("opacity-0", "translate-y-4", "pointer-events-none");
      toast.classList.add("opacity-100", "translate-y-0");
      setTimeout(() => {
        toast.classList.remove("opacity-100", "translate-y-0");
        toast.classList.add("opacity-0", "translate-y-4", "pointer-events-none");
      }, 2500);
    },

    dataURLtoBlob(dataurl) {
      if (!dataurl || typeof dataurl !== "string" || !dataurl.startsWith("data:")) return null;
      try {
        const parts = dataurl.split(",");
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
        const isBase64 = parts[0].includes(";base64");

        if (isBase64) {
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new Blob([u8arr], { type: mime });
        } else {
          const raw = parts.slice(1).join(",");
          const decoded = decodeURIComponent(raw);
          return new Blob([decoded], { type: mime });
        }
      } catch (e) {
        console.warn("DataURL to Blob conversion error:", e);
        return null;
      }
    },

    triggerDownloadFallback(item) {
      if (!item) return;
      const filename = item.name || "download";
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = item.webContentLink || item.webViewLink || `https://drive.google.com/uc?export=download&id=${encodeURIComponent(item.id)}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 200);
    },

    escapeHtml(str) {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    escapeAttr(str) {
      return this.escapeHtml(str);
    },
  };

  // Expose globally
  window.FilePreviewer = FilePreviewer;
  window.previewItem = (item) => FilePreviewer.open(item);
  window.previewItemById = (id, e) => FilePreviewer.openById(id, e);
  window.closeFilePreviewModal = () => FilePreviewer.close();

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => FilePreviewer.init());
  } else {
    FilePreviewer.init();
  }
})();
