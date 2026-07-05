// Analytics and Gamification Manager for AI Food Waste Reduction Agent
import { Storage } from "./storage.js";
import { Notifications } from "./notifications.js";

let savingsChart = null;
let categoryChart = null;

export const AnalyticsManager = {
  init() {
    this.renderMetrics();
    this.renderChallenges();
    this.initCharts();
    
    // Bind reset button
    const resetBtn = document.getElementById("btn-reset-app-data");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all pantry inventory, settings, and logs? This will reset the app.")) {
          Storage.resetAll();
        }
      });
    }

    // Custom listeners for updates
    window.addEventListener("pantryUpdated", () => {
      this.checkPantryPurgeChallenge();
    });
  },

  renderMetrics() {
    const logs = Storage.getLogs();
    const stats = Storage.getUserStats();

    let totalSavedVal = 0;
    let totalWastedVal = 0;
    let totalSavedWeight = 0;
    let totalWastedWeight = 0;

    logs.forEach(log => {
      if (log.status === "consumed") {
        totalSavedVal += log.value;
        totalSavedWeight += log.weight;
      } else {
        totalWastedVal += log.value;
        totalWastedWeight += log.weight;
      }
    });

    // Calculate environmental offsets
    // On average: 1kg food waste = ~2.5 kg CO2 footprint & ~1500L of water footprint
    const co2Saved = +(totalSavedWeight * 2.5).toFixed(1);
    const waterSaved = Math.round(totalSavedWeight * 1500);

    // Write to DOM
    const elSavedMoney = document.getElementById("analytics-saved-money");
    const elSavedWeight = document.getElementById("analytics-saved-weight");
    const elWastedMoney = document.getElementById("analytics-wasted-money");
    const elCo2Saved = document.getElementById("analytics-co2-saved");
    const elWaterSaved = document.getElementById("analytics-water-saved");
    
    // Level & XP values
    const elUserLevel = document.getElementById("user-level-badge");
    const elUserLevelTitle = document.getElementById("user-level-title");
    const elXpProgress = document.getElementById("user-xp-progress-bar");
    const elXpText = document.getElementById("user-xp-text");

    if (elSavedMoney) elSavedMoney.textContent = `$${totalSavedVal.toFixed(2)}`;
    if (elSavedWeight) elSavedWeight.textContent = `${totalSavedWeight.toFixed(1)} kg`;
    if (elWastedMoney) elWastedMoney.textContent = `$${totalWastedVal.toFixed(2)}`;
    if (elCo2Saved) elCo2Saved.textContent = `${co2Saved} kg`;
    if (elWaterSaved) elWaterSaved.textContent = `${waterSaved.toLocaleString()} L`;

    if (elUserLevel) elUserLevel.textContent = `Lvl ${stats.level}`;
    if (elUserLevelTitle) {
      const titles = ["Kitchen Novice", "Waste Avoidance Ally", "Zero-Waste Warrior", "Eco Ambassador", "Sustainable Sovereign"];
      elUserLevelTitle.textContent = titles[Math.min(stats.level - 1, titles.length - 1)];
    }
    
    if (elXpProgress && elXpText) {
      const xpInCurrentLevel = stats.xp % 500;
      const progressPercent = Math.round((xpInCurrentLevel / 500) * 100);
      elXpProgress.style.width = `${progressPercent}%`;
      elXpText.textContent = `${xpInCurrentLevel} / 500 XP`;
    }
  },

  renderChallenges() {
    const stats = Storage.getUserStats();
    const container = document.getElementById("challenges-list");
    const badgesContainer = document.getElementById("badges-grid");

    if (container) {
      container.innerHTML = stats.challenges.map(chal => {
        const isComplete = chal.completed || chal.progress >= 100;
        return `
          <div class="challenge-item p-3 mb-3 border rounded ${isComplete ? 'border-success bg-dark-success' : 'border-secondary bg-dark-card'}">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <h5 class="mb-0 text-light">${chal.title}</h5>
              <span class="badge ${isComplete ? 'badge-success' : 'badge-primary'}">${isComplete ? 'Completed' : `+${chal.xp} XP`}</span>
            </div>
            <p class="small text-muted mb-2">${chal.description}</p>
            <div class="progress progress-sm bg-dark" style="height: 6px;">
              <div class="progress-bar ${isComplete ? 'bg-success' : 'bg-info'}" style="width: ${Math.min(chal.progress, 100)}%"></div>
            </div>
            <div class="d-flex justify-content-between mt-1 small text-muted">
              <span>Progress: ${Math.min(chal.progress, 100)}%</span>
              <span>Reward Badge: ${chal.badgeName}</span>
            </div>
          </div>
        `;
      }).join("");
    }

    if (badgesContainer) {
      // Complete badges pool definition
      const BADGE_POOL = [
        { id: "badge_zero_waste_week", name: "Weekend Warrior", desc: "Successfully saved food Friday-Sunday", icon: "shield-check", color: "text-emerald" },
        { id: "badge_recipe_rescuer", name: "Recipe Rescuer", desc: "Cooked meal containing expiring components", icon: "sparkles", color: "text-amber" },
        { id: "badge_pantry_master", name: "Pantry Purge Master", desc: "Maintained a tightly run clean inventory", icon: "zap", color: "text-cyan" }
      ];

      badgesContainer.innerHTML = BADGE_POOL.map(badge => {
        const isUnlocked = stats.badges.includes(badge.id);
        const lockClass = isUnlocked ? "unlocked" : "locked";
        const lockIcon = isUnlocked ? badge.icon : "lock";
        
        return `
          <div class="badge-card ${lockClass}">
            <div class="badge-icon-wrap ${badge.color}">
              <i data-lucide="${lockIcon}"></i>
            </div>
            <h5 class="badge-name">${badge.name}</h5>
            <p class="badge-desc">${badge.desc}</p>
            <span class="badge-status-tag">${isUnlocked ? 'Unlocked' : 'Locked'}</span>
          </div>
        `;
      }).join("");
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  checkPantryPurgeChallenge() {
    const stats = Storage.getUserStats();
    const pantry = Storage.getPantry();
    
    // Find if the challenge "chal3" is locked
    const chalIndex = stats.challenges.findIndex(c => c.id === "chal3" && !c.completed);
    if (chalIndex === -1) return;

    const activePantryCount = pantry.filter(i => i.qty > 0).length;
    
    // Calculate progress: e.g. target is below 5 items
    // Let's say if pantry count <= 4, progress is 100%
    // If pantry is 10, progress is lower
    let progress = 0;
    if (activePantryCount <= 4) {
      progress = 100;
    } else {
      // Scaled formula
      progress = Math.round((4 / activePantryCount) * 100);
    }

    stats.challenges[chalIndex].progress = progress;

    if (progress >= 100) {
      stats.challenges[chalIndex].completed = true;
      stats.xp += stats.challenges[chalIndex].xp;
      stats.badges.push(stats.challenges[chalIndex].badge);
      
      Notifications.showToast(`🏆 Challenge Complete: "Pantry Purge Master"! Unlocked Badge! +${stats.challenges[chalIndex].xp} XP`, "success");
      
      // Update stats and challenges list
      Storage.setUserStats(stats);
      this.renderChallenges();
      this.renderMetrics();
    } else {
      Storage.setUserStats(stats);
    }
  },

  initCharts() {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js not loaded. Delaying chart initialization.");
      return;
    }

    const logs = Storage.getLogs();
    const savingsCtx = document.getElementById("chart-savings-waste");
    const categoryCtx = document.getElementById("chart-category-breakdown");

    if (!savingsCtx || !categoryCtx) return;

    // Destructure past logs for plotting
    // Group logs by date for the last 7 days
    const dailyData = {};
    const categoriesData = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dailyData[dateStr] = { saved: 0, wasted: 0 };
    }

    logs.forEach(log => {
      // Group daily
      if (dailyData[log.date]) {
        if (log.status === "consumed") {
          dailyData[log.date].saved += log.value;
        } else {
          dailyData[log.date].wasted += log.value;
        }
      }

      // Group category
      if (log.status === "consumed") {
        categoriesData[log.category] = (categoriesData[log.category] || 0) + log.weight;
      }
    });

    const labels = Object.keys(dailyData).map(dateStr => {
      const parts = dateStr.split("-");
      return `${parts[1]}/${parts[2]}`; // MM/DD
    });
    
    const savedValues = Object.values(dailyData).map(d => +d.saved.toFixed(2));
    const wastedValues = Object.values(dailyData).map(d => +d.wasted.toFixed(2));

    // Destroy existing charts if they exist
    if (savingsChart) savingsChart.destroy();
    if (categoryChart) categoryChart.destroy();

    // Chart 1: Savings vs Waste
    savingsChart = new Chart(savingsCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Money Saved ($)",
            data: savedValues,
            backgroundColor: "rgba(16, 185, 129, 0.65)", // Emerald
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 2,
            borderRadius: 4
          },
          {
            label: "Money Wasted ($)",
            data: wastedValues,
            backgroundColor: "rgba(239, 68, 68, 0.65)", // Coral/Red
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 2,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#94a3b8", font: { family: "Outfit, Inter, sans-serif" } }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(51, 65, 85, 0.2)" },
            ticks: { color: "#94a3b8" }
          },
          y: {
            grid: { color: "rgba(51, 65, 85, 0.2)" },
            ticks: { color: "#94a3b8" }
          }
        }
      }
    });

    // Chart 2: Category Breakdown
    const catLabels = Object.keys(categoriesData);
    const catWeights = Object.values(categoriesData).map(w => +w.toFixed(1));

    const defaultColors = [
      "rgba(16, 185, 129, 0.7)", // Emerald
      "rgba(245, 158, 11, 0.7)", // Amber
      "rgba(6, 182, 212, 0.7)",  // Cyan
      "rgba(99, 102, 241, 0.7)", // Indigo
      "rgba(236, 72, 153, 0.7)"  // Pink
    ];

    categoryChart = new Chart(categoryCtx, {
      type: "doughnut",
      data: {
        labels: catLabels.length > 0 ? catLabels : ["No items logged"],
        datasets: [{
          data: catWeights.length > 0 ? catWeights : [1],
          backgroundColor: catLabels.length > 0 ? defaultColors.slice(0, catLabels.length) : ["rgba(148, 163, 184, 0.2)"],
          borderColor: "#0f172a",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: { color: "#94a3b8", font: { family: "Outfit, Inter, sans-serif" } }
          }
        }
      }
    });
  }
};
