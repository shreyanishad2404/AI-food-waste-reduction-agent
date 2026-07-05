// Notification and Toast Manager for AI Food Waste Reduction Agent

export const Notifications = {
  // Show standard toast alert in UI
  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type} animate-toast-in`;
    
    // Icon mapping based on type
    let icon = "info";
    if (type === "success") icon = "check-circle";
    else if (type === "warning") icon = "alert-triangle";
    else if (type === "error") icon = "x-circle";

    toast.innerHTML = `
      <i data-lucide="${icon}" class="toast-icon"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close-btn">&times;</button>
    `;

    container.appendChild(toast);
    
    // Initialize Lucide icons for new elements
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Auto-remove after 4 seconds
    const removeTimeout = setTimeout(() => {
      this.closeToast(toast);
    }, 4000);

    // Manual close button
    toast.querySelector(".toast-close-btn").addEventListener("click", () => {
      clearTimeout(removeTimeout);
      this.closeToast(toast);
    });
  },

  closeToast(toast) {
    toast.classList.remove("animate-toast-in");
    toast.classList.add("animate-toast-out");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  },

  // Calculate alert details based on expiry date
  checkExpiry(expiryDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "Expired", daysLeft: diffDays, class: "expired", label: "Expired" };
    } else if (diffDays === 0) {
      return { status: "Expiring", daysLeft: 0, class: "expiring-today", label: "Expires Today" };
    } else if (diffDays <= 2) {
      return { status: "Expiring", daysLeft: diffDays, class: "expiring-soon", label: `Expires in ${diffDays}d` };
    } else {
      return { status: "Fresh", daysLeft: diffDays, class: "fresh", label: `${diffDays} days left` };
    }
  },

  // Scan pantry and generate dashboard alerts list
  getExpiryAlerts(pantryItems) {
    const alerts = [];
    pantryItems.forEach(item => {
      if (item.qty <= 0) return;
      const statusInfo = this.checkExpiry(item.expiryDate);
      if (statusInfo.status === "Expired" || statusInfo.daysLeft <= 2) {
        alerts.push({
          itemId: item.id,
          name: item.name,
          category: item.category,
          qty: item.qty,
          unit: item.unit,
          expiryDate: item.expiryDate,
          daysLeft: statusInfo.daysLeft,
          label: statusInfo.label,
          type: statusInfo.status === "Expired" ? "error" : "warning"
        });
      }
    });

    // Sort by urgent items first (expired, then expiring today, then tomorrow)
    return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
  }
};
