// Pantry Manager for AI Food Waste Reduction Agent - Indian Version
import { Storage } from "./storage.js";
import { Notifications } from "./notifications.js";
import { MOCK_RECEIPT_SCANS, MOCK_PHOTO_SCANS, MOCK_STORAGE_GUIDE } from "./mockData.js";

// Estimated price (₹) and weight (kg) database for Indian pantry staples
const ESTIMATED_METRICS = {
  "Amul Fresh Paneer 200g": { value: 92.00, weight: 0.2 },
  "paneer": { value: 92.00, weight: 0.2 },
  "Fresh Coriander Bunch 100g": { value: 18.00, weight: 0.1 },
  "coriander": { value: 18.00, weight: 0.1 },
  "Nandini Toned Milk 500ml": { value: 27.00, weight: 0.5 },
  "milk": { value: 27.00, weight: 0.5 },
  "Harvest Gold Brown Bread": { value: 50.00, weight: 0.4 },
  "bread": { value: 4.15, weight: 0.03 }, // per chapati or slice
  "Fresh Roma Tomatoes 500g": { value: 65.00, weight: 0.5 },
  "tomato": { value: 13.00, weight: 0.1 },
  "Ooty Potatoes (Aloo) 1kg": { value: 45.00, weight: 1.0 },
  "potato": { value: 5.50, weight: 0.12 },
  "Spiced Ginger Garlic Paste 100g": { value: 60.00, weight: 0.1 },
  "ginger": { value: 10.00, weight: 0.05 },
  "Mother Dairy Dahi (Curd) 400g": { value: 65.00, weight: 0.4 },
  "curd": { value: 65.00, weight: 0.4 },
  "Hybrid Green Chillies 100g": { value: 23.00, weight: 0.1 },
  "green chillies": { value: 23.00, weight: 0.1 },
  "Amul Salted Butter 100g": { value: 60.00, weight: 0.1 },
  "butter": { value: 60.00, weight: 0.1 },
  "Ashirvaad Shudh Atta 1kg": { value: 75.00, weight: 1.0 },
  "atta": { value: 75.00, weight: 1.0 },
  "Fresh Red Onions 1kg": { value: 25.00, weight: 1.0 },
  "onion": { value: 3.50, weight: 0.12 },
  "carrot": { value: 15.00, weight: 0.15 },
  "dal": { value: 35.00, weight: 0.25 },
  "rice": { value: 30.00, weight: 0.25 },
  "lemon": { value: 10.00, weight: 0.05 }
};

export const PantryManager = {
  currentFilter: "all",
  currentCategory: "all",
  searchQuery: "",

  init() {
    this.render();
    this.setupListeners();
  },

  setupListeners() {
    // Tab filters
    document.querySelectorAll(".pantry-filter-tab").forEach(tab => {
      tab.addEventListener("click", (e) => {
        document.querySelectorAll(".pantry-filter-tab").forEach(t => t.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.currentFilter = e.currentTarget.dataset.filter;
        this.render();
      });
    });

    // Category drop-down filter
    const catSelect = document.getElementById("pantry-category-select");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        this.currentCategory = e.target.value;
        this.render();
      });
    }

    // Search bar
    const searchInput = document.getElementById("pantry-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Add item form submission
    const addForm = document.getElementById("manual-add-form");
    if (addForm) {
      addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleManualAdd(addForm);
      });
    }

    // Bind simulated OCR receipt selectors (Blinkit / Zepto)
    document.querySelectorAll(".receipt-sample-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.receiptId;
        this.simulateReceiptScan(id);
      });
    });

    // Bind simulated Photo selectors
    document.querySelectorAll(".photo-sample-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.photoId;
        this.simulatePhotoScan(id);
      });
    });
  },

  render() {
    const pantryContainer = document.getElementById("pantry-grid");
    if (!pantryContainer) return;

    const items = Storage.getPantry();
    pantryContainer.innerHTML = "";

    // Expiry calculation updates & sorting
    const processedItems = items.map(item => {
      const info = Notifications.checkExpiry(item.expiryDate);
      return { ...item, statusInfo: info };
    }).sort((a, b) => {
      return a.statusInfo.daysLeft - b.statusInfo.daysLeft;
    });

    // Filter items
    const filteredItems = processedItems.filter(item => {
      if (item.qty <= 0) return false;

      // Category matching
      if (this.currentCategory !== "all" && item.category !== this.currentCategory) {
        return false;
      }

      // Search query matching
      if (this.searchQuery && !item.name.toLowerCase().includes(this.searchQuery)) {
        return false;
      }

      // Status filter matching
      if (this.currentFilter === "expired") {
        return item.statusInfo.status === "Expired";
      } else if (this.currentFilter === "expiring") {
        return item.statusInfo.daysLeft >= 0 && item.statusInfo.daysLeft <= 2;
      } else if (this.currentFilter === "fresh") {
        return item.statusInfo.status === "Fresh" && item.statusInfo.daysLeft > 2;
      }

      return true;
    });

    if (filteredItems.length === 0) {
      pantryContainer.innerHTML = `
        <div class="empty-state">
          <i data-lucide="package-search" class="empty-icon"></i>
          <h3>No ingredients found</h3>
          <p>Try clearing your search filters or add items manually.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    filteredItems.forEach(item => {
      const card = document.createElement("div");
      card.className = `pantry-card border-glow border-${item.statusInfo.class}`;
      
      // Get storage recommendation if exists
      const itemGuide = MOCK_STORAGE_GUIDE.find(g => g.item.toLowerCase() === item.name.toLowerCase() || item.name.toLowerCase().includes(g.item.toLowerCase()) || g.item.toLowerCase().includes(item.name.toLowerCase()));
      const storageTipHtml = itemGuide ? `
        <div class="pantry-card-tip">
          <i data-lucide="lightbulb" class="tip-icon"></i>
          <span>${itemGuide.tips.substring(0, 60)}...</span>
        </div>
      ` : "";

      card.innerHTML = `
        <div class="pantry-card-header">
          <div>
            <h4 class="pantry-card-title">${item.name}</h4>
            <span class="pantry-card-cat">${item.category}</span>
          </div>
          <span class="expiry-badge badge-${item.statusInfo.class}">${item.statusInfo.label}</span>
        </div>
        
        <div class="pantry-card-body">
          <div class="qty-control">
            <span class="qty-label">Quantity:</span>
            <div class="qty-btn-group">
              <button class="qty-adjust-btn" data-action="dec" data-id="${item.id}">-</button>
              <span class="qty-value">${item.qty} <small>${item.unit}</small></span>
              <button class="qty-adjust-btn" data-action="inc" data-id="${item.id}">+</button>
            </div>
          </div>
          ${storageTipHtml}
        </div>

        <div class="pantry-card-actions">
          <button class="btn btn-sm btn-success action-consume" data-id="${item.id}">
            <i data-lucide="utensils"></i> Eaten
          </button>
          <button class="btn btn-sm btn-danger action-waste" data-id="${item.id}">
            <i data-lucide="trash-2"></i> Wasted
          </button>
        </div>
      `;

      // Bind dynamic actions
      card.querySelectorAll(".qty-adjust-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const action = e.target.dataset.action;
          const id = e.target.dataset.id;
          this.adjustQuantity(id, action);
        });
      });

      card.querySelector(".action-consume").addEventListener("click", () => {
        this.logUsage(item.id, "consumed");
      });

      card.querySelector(".action-waste").addEventListener("click", () => {
        this.logUsage(item.id, "wasted");
      });

      pantryContainer.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  adjustQuantity(id, action) {
    const items = Storage.getPantry();
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (action === "inc") {
      item.qty += item.unit === "pcs" || item.unit === "slices" || item.unit === "dozen" ? 1 : 0.5;
      item.originalQty = Math.max(item.qty, item.originalQty);
      Notifications.showToast(`Increased quantity of ${item.name}`, "success");
    } else {
      const decAmount = item.unit === "pcs" || item.unit === "slices" || item.unit === "dozen" ? 1 : 0.5;
      if (item.qty - decAmount <= 0) {
        this.logUsage(id, "consumed");
        return;
      }
      item.qty -= decAmount;
      Notifications.showToast(`Decreased quantity of ${item.name}`, "info");
    }

    Storage.setPantry(items);
    this.render();
  },

  logUsage(id, status) {
    const items = Storage.getPantry();
    const itemIdx = items.findIndex(i => i.id === id);
    if (itemIdx === -1) return;

    const item = items[itemIdx];
    const loggedQty = item.qty;

    // Remove item from pantry
    items.splice(itemIdx, 1);
    Storage.setPantry(items);

    // Find unit pricing and weight estimation
    let metricDef = ESTIMATED_METRICS[item.name] || 
                    Object.keys(ESTIMATED_METRICS).filter(k => item.name.toLowerCase().includes(k.toLowerCase())).map(k => ESTIMATED_METRICS[k])[0] || 
                    { value: 40.0, weight: 0.2 }; // Default values in INR (₹)

    let multiplier = loggedQty;
    if (item.unit === "dozen") multiplier = loggedQty * 12;
    else if (item.unit === "slices") multiplier = loggedQty / 12;
    else if (item.unit === "pack" || item.unit === "gallon") multiplier = loggedQty;

    const totalValue = +(metricDef.value * multiplier).toFixed(2);
    const totalWeight = +(metricDef.weight * multiplier).toFixed(2);

    const logEntry = {
      date: new Date().toISOString().split("T")[0],
      name: item.name,
      category: item.category,
      qty: loggedQty,
      unit: item.unit,
      value: totalValue,
      status: status,
      weight: totalWeight
    };

    const logs = Storage.getLogs();
    logs.push(logEntry);
    Storage.setLogs(logs);

    if (status === "consumed") {
      this.addXP(25);
      Notifications.showToast(`Logged ${loggedQty} ${item.unit} of ${item.name} as consumed! Saved ₹${totalValue}. +25 XP`, "success");
    } else {
      Notifications.showToast(`Logged ${loggedQty} ${item.unit} of ${item.name} as wasted. Try to rescue them next time! Lost ₹${totalValue}.`, "warning");
    }

    this.render();
  },

  addXP(amount) {
    const stats = Storage.getUserStats();
    stats.xp += amount;
    
    const newLevel = Math.floor(stats.xp / 500) + 1;
    if (newLevel > stats.level) {
      stats.level = newLevel;
      setTimeout(() => {
        Notifications.showToast(`🎉 Level Up! You are now an Eco-Level ${newLevel} Food Rescuer!`, "success");
      }, 1000);
    }
    
    Storage.setUserStats(stats);
  },

  handleManualAdd(form) {
    const name = form.querySelector("#manual-name").value.trim();
    const category = form.querySelector("#manual-category").value;
    const qty = parseFloat(form.querySelector("#manual-qty").value);
    const unit = form.querySelector("#manual-unit").value;
    const expiry = form.querySelector("#manual-expiry").value;

    if (!name || isNaN(qty) || !expiry) {
      Notifications.showToast("Please fill all required manual add fields", "error");
      return;
    }

    const items = Storage.getPantry();
    const newItem = {
      id: "p_" + Date.now(),
      name,
      category,
      qty,
      unit,
      expiryDate: expiry,
      originalQty: qty,
      addedDate: new Date().toISOString().split("T")[0],
      consumedQty: 0,
      wastedQty: 0
    };

    items.push(newItem);
    Storage.setPantry(items);
    this.render();
    form.reset();
    Notifications.showToast(`Added ${name} to pantry successfully!`, "success");

    const modal = document.getElementById("add-item-modal");
    if (modal) modal.style.display = "none";
  },

  simulateReceiptScan(receiptId) {
    const receiptData = MOCK_RECEIPT_SCANS[receiptId];
    if (!receiptData) return;

    const receiptContent = document.getElementById("receipt-ocr-content");
    const paper = document.getElementById("receipt-paper");
    const progress = document.getElementById("receipt-scan-progress");
    const scanStatus = document.getElementById("receipt-scan-status");
    const resultsTable = document.getElementById("receipt-scanned-items");

    if (!receiptContent || !paper) return;

    progress.style.display = "block";
    scanStatus.textContent = "Analyzing receipt text structure...";
    resultsTable.innerHTML = "";
    paper.className = "receipt-paper scanning";

    receiptContent.innerHTML = receiptData.ocrVisual.map(item => {
      return `<div class="ocr-text-line" style="top: ${item.y}px; left: ${item.x}px; width: ${item.w}px; height: ${item.h}px;">${item.text}</div>`;
    }).join("");

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        scanStatus.textContent = "Performing OCR Text Recognition...";
        receiptContent.querySelectorAll(".ocr-text-line").forEach(el => {
          el.classList.add("recognized");
        });
      } else if (step === 2) {
        scanStatus.textContent = "AI Engine classifying Indian groceries...";
      } else if (step === 3) {
        scanStatus.textContent = "Extracting quantities and predicting shelf life...";
        paper.className = "receipt-paper scanned";
        progress.style.display = "none";

        resultsTable.innerHTML = `
          <h5>Detected Ingredients (${receiptData.items.length})</h5>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Est. Shelf Life</th>
                </tr>
              </thead>
              <tbody>
                ${receiptData.items.map((item, idx) => `
                  <tr class="scanned-row animate-row-in" style="animation-delay: ${idx * 150}ms">
                    <td><strong>${item.name}</strong></td>
                    <td><span class="badge badge-secondary">${item.category}</span></td>
                    <td>${item.qty} ${item.unit}</td>
                    <td><span class="text-warning">${item.daysToExpiry} days</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          <button class="btn btn-success btn-block mt-3" id="btn-import-receipt">Import all to Pantry</button>
        `;

        document.getElementById("btn-import-receipt").addEventListener("click", () => {
          this.importReceiptItems(receiptData.items);
          const modal = document.getElementById("add-item-modal");
          if (modal) modal.style.display = "none";
        });

        clearInterval(interval);
      }
    }, 1200);
  },

  importReceiptItems(itemsList) {
    const pantry = Storage.getPantry();
    const today = new Date();

    itemsList.forEach(scannedItem => {
      const expDate = new Date();
      expDate.setDate(today.getDate() + scannedItem.daysToExpiry);

      const newItem = {
        id: "p_scan_" + Math.random().toString(36).substr(2, 9),
        name: scannedItem.name,
        category: scannedItem.category,
        qty: scannedItem.qty,
        unit: scannedItem.unit,
        expiryDate: expDate.toISOString().split("T")[0],
        originalQty: scannedItem.qty,
        addedDate: today.toISOString().split("T")[0],
        consumedQty: 0,
        wastedQty: 0
      };
      pantry.push(newItem);
    });

    Storage.setPantry(pantry);
    this.render();
    Notifications.showToast(`Imported ${itemsList.length} items from scan!`, "success");
    this.addXP(40);
  },

  simulatePhotoScan(photoId) {
    const photoData = MOCK_PHOTO_SCANS[photoId];
    if (!photoData) return;

    const overlay = document.getElementById("photo-recognition-overlay");
    const progress = document.getElementById("photo-scan-progress");
    const scanStatus = document.getElementById("photo-scan-status");
    const resultsContainer = document.getElementById("photo-scanned-items");
    const photoImg = document.getElementById("photo-scanner-preview");

    if (!overlay || !photoImg) return;

    overlay.innerHTML = "";
    progress.style.display = "block";
    scanStatus.textContent = "AI Object Detection initializing...";
    resultsContainer.innerHTML = "";

    photoImg.style.display = "block";
    if (photoId === "photo1") {
      photoImg.className = "photo-preview-placeholder basket-bg";
    } else {
      photoImg.className = "photo-preview-placeholder fridge-bg";
    }

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        scanStatus.textContent = "Scanning image textures and shape analysis...";
      } else if (step === 2) {
        scanStatus.textContent = "Drawing bounding boxes around food objects...";
        photoData.detectedItems.forEach(item => {
          const box = document.createElement("div");
          box.className = "bounding-box animate-box-in";
          box.style.left = `${item.box.x}px`;
          box.style.top = `${item.box.y}px`;
          box.style.width = `${item.box.w}px`;
          box.style.height = `${item.box.h}px`;
          box.innerHTML = `
            <span class="box-label">${item.name} (${item.confidence})</span>
          `;
          overlay.appendChild(box);
        });
      } else if (step === 3) {
        scanStatus.textContent = "Matching identified objects to categories...";
        progress.style.display = "none";

        resultsContainer.innerHTML = `
          <h5>Detected Indian Foods (${photoData.detectedItems.length})</h5>
          <ul class="list-group mb-3">
            ${photoData.detectedItems.map(item => `
              <li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-light border-secondary">
                <div>
                  <strong>${item.name}</strong>
                  <div class="small text-muted">Conf: ${item.confidence} | Class: ${item.category}</div>
                </div>
                <span class="badge badge-success">${item.qty} ${item.unit}</span>
              </li>
            `).join("")}
          </ul>
          <button class="btn btn-success btn-block" id="btn-import-photo">Add all to Inventory</button>
        `;

        document.getElementById("btn-import-photo").addEventListener("click", () => {
          this.importReceiptItems(photoData.detectedItems);
          const modal = document.getElementById("add-item-modal");
          if (modal) modal.style.display = "none";
        });

        clearInterval(interval);
      }
    }, 1200);
  }
};
