// Community Share Manager for AI Food Waste Reduction Agent
import { Storage } from "./storage.js";
import { Notifications } from "./notifications.js";
import { MOCK_SHARE_ITEMS } from "./mockData.js";
import { PantryManager } from "./pantry.js";

export const ShareManager = {
  activeListings: [],

  init() {
    this.activeListings = [...MOCK_SHARE_ITEMS];
    this.render();
    this.setupListeners();
  },

  setupListeners() {
    const form = document.getElementById("share-item-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleNewListing(form);
      });
    }
  },

  render() {
    const container = document.getElementById("share-feed-container");
    if (!container) return;

    container.innerHTML = "";

    if (this.activeListings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i data-lucide="share-2" class="empty-icon"></i>
          <h3>No items currently listed nearby</h3>
          <p>Be the first to list surplus items from your pantry!</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    this.activeListings.forEach(item => {
      const card = document.createElement("div");
      card.className = "share-card border-glow";
      
      card.innerHTML = `
        <div class="share-card-header">
          <div class="share-user-info">
            <span class="share-avatar">${item.avatar || '👤'}</span>
            <div>
              <h5 class="share-donor-name">${item.donor}</h5>
              <span class="share-time">${item.timestamp}</span>
            </div>
          </div>
          <span class="share-distance-tag">${item.distance}</span>
        </div>
        
        <div class="share-card-body">
          <h4 class="share-item-name">${item.item}</h4>
          <span class="badge badge-secondary mb-2">${item.category}</span>
          <p class="share-notes">"${item.notes}"</p>
          <div class="share-expiry-indicator text-warning small">
            <i data-lucide="clock" class="expiry-icon"></i> ${item.expiryDesc}
          </div>
        </div>
        
        <div class="share-card-actions">
          <button class="btn btn-success btn-block action-claim" data-id="${item.id}">
            Request & Rescue Item
          </button>
        </div>
      `;

      card.querySelector(".action-claim").addEventListener("click", () => {
        this.simulateClaim(item.id);
      });

      container.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  handleNewListing(form) {
    const name = form.querySelector("#share-name").value.trim();
    const category = form.querySelector("#share-category").value;
    const expiry = form.querySelector("#share-expiry-days").value;
    const notes = form.querySelector("#share-notes").value.trim();

    if (!name || !notes) {
      Notifications.showToast("Please fill in the item name and details", "error");
      return;
    }

    const newShare = {
      id: "share_" + Date.now(),
      donor: "You (Me)",
      item: name,
      category: category,
      distance: "My Listing",
      expiryDesc: `Expiring in ${expiry} days`,
      daysToExpiry: parseInt(expiry),
      notes: notes,
      avatar: "🧑‍🍳",
      timestamp: "Just now"
    };

    // Deduct from pantry if user listed something they already had (simulated flow)
    const pantry = Storage.getPantry();
    const matchedPantryIdx = pantry.findIndex(p => p.qty > 0 && p.name.toLowerCase() === name.toLowerCase());
    
    if (matchedPantryIdx !== -1) {
      const pItem = pantry[matchedPantryIdx];
      Notifications.showToast(`Listed "${name}" from your pantry to the community feed!`, "success");
      pantry.splice(matchedPantryIdx, 1);
      Storage.setPantry(pantry);
      PantryManager.render();
    } else {
      Notifications.showToast(`Listed "${name}" on the WasteShare feed!`, "success");
    }

    this.activeListings.unshift(newShare);
    this.render();
    form.reset();

    // Reward XP for sharing
    PantryManager.addXP(40);
  },

  simulateClaim(id) {
    const idx = this.activeListings.findIndex(item => item.id === id);
    if (idx === -1) return;

    const item = this.activeListings[idx];
    
    // Disable button to simulate action
    const btn = document.querySelector(`.action-claim[data-id="${id}"]`);
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Requesting reservation...";
    }

    setTimeout(() => {
      // Add to user's pantry
      const pantry = Storage.getPantry();
      
      // Calculate expiry date string
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + (item.daysToExpiry || 5));

      pantry.push({
        id: "p_claim_" + Math.random().toString(36).substr(2, 9),
        name: item.item.replace(/\d+\s+|Fresh\s+|\(Unopened\)/gi, "").trim(), // clean name
        category: item.category,
        qty: 1,
        unit: item.item.includes("Lemon") ? "pcs" : (item.item.includes("Yogurt") ? "pcs" : "pack"),
        expiryDate: expDate.toISOString().split("T")[0],
        originalQty: 1,
        addedDate: new Date().toISOString().split("T")[0],
        consumedQty: 0,
        wastedQty: 0
      });

      Storage.setPantry(pantry);
      PantryManager.render();

      // Remove from listings feed
      this.activeListings.splice(idx, 1);
      this.render();

      Notifications.showToast(`Claim approved! "${item.item}" added to your pantry. +50 XP`, "success");
      PantryManager.addXP(50); // XP reward for rescuing neighbor's food
    }, 1500);
  }
};
