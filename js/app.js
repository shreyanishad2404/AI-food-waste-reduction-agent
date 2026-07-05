// SPA Coordinator and Main App Entry Point
import { Storage } from "./storage.js";
import { Notifications } from "./notifications.js";
import { PantryManager } from "./pantry.js";
import { RecipeEngine } from "./recipes.js";
import { ShoppingManager } from "./shopping.js";
import { ChatbotManager } from "./chatbot.js";
import { AnalyticsManager } from "./analytics.js";
import { MOCK_STORAGE_GUIDE } from "./mockData.js";

const App = {
  init() {
    // 1. Initialize DB Storage
    Storage.init();

    // 2. Initialize Subcomponents
    PantryManager.init();
    RecipeEngine.init();
    ShoppingManager.init();
    ChatbotManager.init();
    AnalyticsManager.init();

    // 3. Bind navigation tabs and general triggers
    this.bindNavigation();
    this.bindGlobalUI();
    this.updateDashboardAlerts();
    this.renderStorageGuideSearch();

    // 4. Listen to structural updates to re-render relevant panels
    window.addEventListener("pantryUpdated", () => {
      this.updateDashboardAlerts();
      RecipeEngine.render();
      AnalyticsManager.renderMetrics();
      AnalyticsManager.initCharts();
    });

    window.addEventListener("shoppingUpdated", () => {
      ShoppingManager.render();
    });

    window.addEventListener("logsUpdated", () => {
      AnalyticsManager.renderMetrics();
      AnalyticsManager.initCharts();
    });

    window.addEventListener("statsUpdated", () => {
      AnalyticsManager.renderMetrics();
      AnalyticsManager.renderChallenges();
    });

    // 5. Initialize Lucide vector icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  bindNavigation() {
    const navItems = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".app-section");

    navItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const targetTab = e.currentTarget.dataset.tab;

        // Toggle active link class
        navItems.forEach(nav => nav.classList.remove("active"));
        e.currentTarget.classList.add("active");

        // Toggle visibility of sections
        sections.forEach(sec => {
          if (sec.id === `tab-${targetTab}`) {
            sec.classList.add("active");
          } else {
            sec.classList.remove("active");
          }
        });

        // Trigger chart rendering fresh if opening analytics tab
        if (targetTab === "analytics") {
          setTimeout(() => {
            AnalyticsManager.initCharts();
          }, 100);
        }

        // Auto close drawer menu on mobile
        const sidebar = document.querySelector(".app-sidebar");
        if (sidebar) sidebar.classList.remove("mobile-open");
      });
    });

    // Mobile Hamburger Menu Trigger
    const menuToggle = document.getElementById("mobile-menu-toggle");
    const sidebar = document.querySelector(".app-sidebar");
    if (menuToggle && sidebar) {
      menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
      });
    }
  },

  bindGlobalUI() {
    // Add pantry item modal trigger
    const openAddModalBtn = document.getElementById("btn-open-add-modal");
    const modal = document.getElementById("add-item-modal");
    
    if (openAddModalBtn && modal) {
      openAddModalBtn.addEventListener("click", () => {
        // Default expiry input date to today + 5 days
        const expInput = document.getElementById("manual-expiry");
        if (expInput) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 5);
          expInput.value = futureDate.toISOString().split("T")[0];
        }
        modal.style.display = "block";
      });

      // Close modal
      modal.querySelectorAll(".modal-close, .modal-cancel").forEach(btn => {
        btn.addEventListener("click", () => {
          modal.style.display = "none";
        });
      });
    }

    // Modal sub-tabs binding (Manual vs Receipt vs Photo)
    const modalTabs = document.querySelectorAll(".modal-tab-btn");
    const modalPanels = document.querySelectorAll(".modal-tab-panel");

    modalTabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        modalTabs.forEach(t => t.classList.remove("active"));
        modalPanels.forEach(p => p.classList.remove("active"));

        e.currentTarget.classList.add("active");
        const panelId = `panel-${e.currentTarget.dataset.panel}`;
        const panel = document.getElementById(panelId);
        if (panel) panel.classList.add("active");
      });
    });

    // Quick Chef Chat Buttons on Dashboard
    document.querySelectorAll(".quick-chat-prompt").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const text = e.currentTarget.dataset.prompt;
        // Route to chatbot tab
        const chatLink = document.querySelector('.nav-link[data-tab="chat"]');
        if (chatLink) {
          chatLink.click();
          // Inject query
          const chatInput = document.getElementById("chat-input");
          if (chatInput) {
            chatInput.value = text;
            document.getElementById("chat-send-btn").click();
          }
        }
      });
    });

    // Expiry Alert Banner click triggers Recipe Rescuer
    const bannerAction = document.getElementById("btn-alert-banner-cook");
    if (bannerAction) {
      bannerAction.addEventListener("click", () => {
        // Route to recipes tab
        const recipeLink = document.querySelector('.nav-link[data-tab="recipes"]');
        if (recipeLink) recipeLink.click();
      });
    }
  },

  updateDashboardAlerts() {
    const pantry = Storage.getPantry();
    const alerts = Notifications.getExpiryAlerts(pantry);
    
    const banner = document.getElementById("dashboard-alert-banner");
    const alertCountText = document.getElementById("dashboard-alert-count-text");
    const alertsListContainer = document.getElementById("dashboard-alerts-list");
    const navPantryBadge = document.getElementById("nav-pantry-badge");

    // Filter down to urgent items (expiring today or tomorrow)
    const urgentAlerts = alerts.filter(a => a.daysLeft >= 0 && a.daysLeft <= 2);

    if (urgentAlerts.length > 0) {
      // Toggle banner
      if (banner) banner.style.display = "flex";
      if (alertCountText) alertCountText.textContent = `${urgentAlerts.length} ingredients are expiring soon! Rescue them now.`;
      
      // Update nav badge count
      if (navPantryBadge) {
        navPantryBadge.textContent = urgentAlerts.length;
        navPantryBadge.style.display = "inline-block";
      }
    } else {
      if (banner) banner.style.display = "none";
      if (navPantryBadge) navPantryBadge.style.display = "none";
    }

    // Populate actual alerts container on dashboard
    if (alertsListContainer) {
      alertsListContainer.innerHTML = "";
      if (alerts.length === 0) {
        alertsListContainer.innerHTML = `
          <div class="p-3 text-center text-muted">
            <i data-lucide="shield-check" class="d-block mx-auto mb-2 text-success" style="width: 28px; height: 28px;"></i>
            No expiring items. Looking clean!
          </div>
        `;
      } else {
        // Show up to 4 items
        alerts.slice(0, 4).forEach(a => {
          const item = document.createElement("div");
          item.className = "dashboard-alert-item";
          
          let alertIndicatorClass = a.type === "error" ? "bg-danger" : "bg-warning";
          let labelText = a.daysLeft < 0 ? "Expired" : `Expires in ${a.daysLeft} days`;

          item.innerHTML = `
            <div class="d-flex align-items-center">
              <span class="alert-indicator-dot ${alertIndicatorClass}"></span>
              <div>
                <strong class="text-light">${a.name}</strong>
                <span class="small text-muted d-block">${a.qty} ${a.unit} | ${a.category}</span>
              </div>
            </div>
            <span class="badge ${a.type === 'error' ? 'badge-danger' : 'badge-warning'}">${labelText}</span>
          `;
          alertsListContainer.appendChild(item);
        });
      }
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  renderStorageGuideSearch() {
    const listContainer = document.getElementById("storage-guide-list");
    const input = document.getElementById("storage-guide-search");
    
    if (!listContainer) return;

    const renderList = (filterQuery = "") => {
      listContainer.innerHTML = "";
      const filtered = MOCK_STORAGE_GUIDE.filter(item => 
        item.item.toLowerCase().includes(filterQuery) || 
        item.category.toLowerCase().includes(filterQuery) ||
        item.tips.toLowerCase().includes(filterQuery)
      );

      if (filtered.length === 0) {
        listContainer.innerHTML = `<div class="empty-state"><p>No storage guides match your search.</p></div>`;
        return;
      }

      filtered.forEach(guide => {
        const itemBlock = document.createElement("div");
        itemBlock.className = "storage-guide-item border-glow";
        itemBlock.innerHTML = `
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h4 class="guide-item-title">${guide.item}</h4>
              <span class="guide-item-cat">${guide.category}</span>
            </div>
            <span class="guide-zone-badge">${guide.zone}</span>
          </div>
          <div class="guide-lifespan-info mb-2 text-info small">
            <i data-lucide="clock"></i> Shelf Life: <strong>${guide.lifespan}</strong>
          </div>
          <p class="guide-item-tips mb-0">${guide.tips}</p>
        `;
        listContainer.appendChild(itemBlock);
      });

      if (window.lucide) window.lucide.createIcons();
    };

    renderList("");

    if (input) {
      input.addEventListener("input", (e) => {
        renderList(e.target.value.toLowerCase().trim());
      });
    }

    // Storage Tab sub category filters (All, Fridge, Counter, Pantry)
    document.querySelectorAll(".guide-filter-tab").forEach(tab => {
      tab.addEventListener("click", (e) => {
        document.querySelectorAll(".guide-filter-tab").forEach(t => t.classList.remove("active"));
        e.currentTarget.classList.add("active");
        
        const filter = e.currentTarget.dataset.zone.toLowerCase();
        if (filter === "all") {
          renderList("");
        } else {
          // Filter by zone name matches
          listContainer.innerHTML = "";
          const filtered = MOCK_STORAGE_GUIDE.filter(item => item.zone.toLowerCase().includes(filter));
          
          filtered.forEach(guide => {
            const itemBlock = document.createElement("div");
            itemBlock.className = "storage-guide-item border-glow";
            itemBlock.innerHTML = `
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h4 class="guide-item-title">${guide.item}</h4>
                  <span class="guide-item-cat">${guide.category}</span>
                </div>
                <span class="guide-zone-badge">${guide.zone}</span>
              </div>
              <div class="guide-lifespan-info mb-2 text-info small">
                <i data-lucide="clock"></i> Shelf Life: <strong>${guide.lifespan}</strong>
              </div>
              <p class="guide-item-tips mb-0">${guide.tips}</p>
            `;
            listContainer.appendChild(itemBlock);
          });
          if (window.lucide) window.lucide.createIcons();
        }
      });
    });
  }
};

// Start application when DOM loads
window.addEventListener("DOMContentLoaded", () => {
  App.init();
});
