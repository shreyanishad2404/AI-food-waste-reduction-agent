// Recipe Engine for AI Food Waste Reduction Agent - Indian Version
import { Storage } from "./storage.js";
import { Notifications } from "./notifications.js";
import { MOCK_RECIPES } from "./mockData.js";

export const RecipeEngine = {
  currentCategory: "all",
  searchQuery: "",

  init() {
    this.render();
    this.setupListeners();
  },

  setupListeners() {
    document.querySelectorAll(".recipe-filter-tab").forEach(tab => {
      tab.addEventListener("click", (e) => {
        document.querySelectorAll(".recipe-filter-tab").forEach(t => t.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.currentCategory = e.currentTarget.dataset.category;
        this.render();
      });
    });

    const recipeSearch = document.getElementById("recipe-search");
    if (recipeSearch) {
      recipeSearch.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    const recipeModal = document.getElementById("recipe-detail-modal");
    if (recipeModal) {
      recipeModal.querySelector(".modal-close").addEventListener("click", () => {
        recipeModal.style.display = "none";
      });
    }
  },

  render() {
    const container = document.getElementById("recipes-grid");
    if (!container) return;

    const pantry = Storage.getPantry();
    container.innerHTML = "";

    const scoredRecipes = MOCK_RECIPES.map(recipe => {
      const matchDetails = this.calculateMatch(recipe, pantry);
      return { ...recipe, match: matchDetails };
    }).sort((a, b) => {
      if (b.match.percent !== a.match.percent) {
        return b.match.percent - a.match.percent;
      }
      return b.match.rescuesExpiring - a.match.rescuesExpiring;
    });

    const filteredRecipes = scoredRecipes.filter(recipe => {
      if (this.currentCategory !== "all" && recipe.category !== this.currentCategory) {
        return false;
      }
      if (this.searchQuery && !recipe.name.toLowerCase().includes(this.searchQuery) && !recipe.description.toLowerCase().includes(this.searchQuery)) {
        return false;
      }
      return true;
    });

    if (filteredRecipes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i data-lucide="cooking-pot" class="empty-icon"></i>
          <h3>No Indian recipes match your criteria</h3>
          <p>Try clearing filters or add more items to your pantry.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    filteredRecipes.forEach(recipe => {
      const card = document.createElement("div");
      const isHighMatch = recipe.match.percent >= 70;
      const rescuesFood = recipe.match.rescuesExpiring;
      let highlightClass = "";
      if (rescuesFood) highlightClass = "border-warning-glow";
      else if (isHighMatch) highlightClass = "border-success-glow";

      card.className = `recipe-card border-glow ${highlightClass}`;
      
      const badgeHtml = rescuesFood ? `
        <span class="recipe-badge badge-warning">
          <i data-lucide="alert-circle" class="recipe-badge-icon"></i> Expiry Rescue
        </span>
      ` : (isHighMatch ? `
        <span class="recipe-badge badge-success">High Match (${recipe.match.percent}%)</span>
      ` : `
        <span class="recipe-badge badge-info">${recipe.match.percent}% Match</span>
      `);

      card.innerHTML = `
        <div class="recipe-header">
          <div class="recipe-category-tag">${recipe.category}</div>
          ${badgeHtml}
        </div>
        <div class="recipe-content">
          <h4 class="recipe-title">${recipe.name}</h4>
          <p class="recipe-description">${recipe.description}</p>
          
          <div class="recipe-stats">
            <span><i data-lucide="clock"></i> ${recipe.prepTime} mins</span>
            <span><i data-lucide="gauge"></i> ${recipe.difficulty}</span>
            <span class="text-success"><i data-lucide="leaf"></i> -${recipe.co2Saved} kg CO₂</span>
          </div>

          <div class="recipe-ingredients-summary">
            <h5>Ingredients (${recipe.match.ownedCount}/${recipe.ingredients.length} owned)</h5>
            <div class="ingredient-dots">
              ${recipe.ingredients.map(ing => {
                const isOwned = recipe.match.ownedList.includes(ing.name.toLowerCase());
                const isRequired = ing.required;
                const dotClass = isOwned ? "dot-owned" : (isRequired ? "dot-missing-required" : "dot-missing-optional");
                const titleText = `${ing.name} (${isOwned ? 'Owned' : (isRequired ? 'Required' : 'Optional')})`;
                return `<span class="ingredient-dot ${dotClass}" title="${titleText}"></span>`;
              }).join("")}
            </div>
          </div>
        </div>
        <div class="recipe-actions">
          <button class="btn btn-primary btn-block action-view-recipe" data-id="${recipe.id}">
            View Recipe
          </button>
        </div>
      `;

      card.querySelector(".action-view-recipe").addEventListener("click", () => {
        this.openRecipeDetail(recipe);
      });

      container.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  calculateMatch(recipe, pantry) {
    let requiredOwned = 0;
    let requiredTotal = 0;
    let ownedCount = 0;
    const ownedList = [];
    let rescuesExpiring = false;

    recipe.ingredients.forEach(ing => {
      const ingNameLower = ing.name.toLowerCase();
      if (ing.required) requiredTotal++;

      const pantryMatch = pantry.find(pItem => 
        pItem.qty > 0 && 
        (pItem.name.toLowerCase() === ingNameLower || pItem.name.toLowerCase().includes(ingNameLower) || ingNameLower.includes(pItem.name.toLowerCase()))
      );

      if (pantryMatch) {
        ownedCount++;
        ownedList.push(ingNameLower);
        if (ing.required) requiredOwned++;

        const status = Notifications.checkExpiry(pantryMatch.expiryDate);
        if (status.status === "Expired" || status.daysLeft <= 2) {
          rescuesExpiring = true;
        }
      }
    });

    const percent = recipe.ingredients.length > 0 
      ? Math.round((ownedCount / recipe.ingredients.length) * 100) 
      : 0;

    return {
      percent,
      ownedCount,
      requiredPercent: requiredTotal > 0 ? Math.round((requiredOwned / requiredTotal) * 100) : 100,
      ownedList,
      rescuesExpiring
    };
  },

  openRecipeDetail(recipe) {
    const modal = document.getElementById("recipe-detail-modal");
    if (!modal) return;

    const pantry = Storage.getPantry();

    modal.querySelector("#recipe-modal-title").textContent = recipe.name;
    modal.querySelector("#recipe-modal-desc").textContent = recipe.description;
    modal.querySelector("#recipe-modal-time").textContent = `${recipe.prepTime} mins`;
    modal.querySelector("#recipe-modal-diff").textContent = recipe.difficulty;
    modal.querySelector("#recipe-modal-co2").textContent = `-${recipe.co2Saved} kg CO₂`;

    const ingList = modal.querySelector("#recipe-modal-ingredients");
    ingList.innerHTML = recipe.ingredients.map(ing => {
      const ingNameLower = ing.name.toLowerCase();
      const pantryMatch = pantry.find(pItem => 
        pItem.qty > 0 && 
        (pItem.name.toLowerCase() === ingNameLower || pItem.name.toLowerCase().includes(ingNameLower) || ingNameLower.includes(pItem.name.toLowerCase()))
      );

      const isOwned = !!pantryMatch;
      const isEnough = isOwned && pantryMatch.qty >= ing.amount;
      
      let statusIcon = "circle";
      let statusClass = "ing-missing";
      let note = `Missing (${ing.amount} ${ing.unit} needed)`;

      if (isEnough) {
        statusIcon = "check-circle";
        statusClass = "ing-owned";
        note = `Available: ${pantryMatch.qty} ${pantryMatch.unit} in pantry`;
      } else if (isOwned) {
        statusIcon = "alert-circle";
        statusClass = "ing-low";
        note = `Insufficient: have ${pantryMatch.qty} ${pantryMatch.unit}, need ${ing.amount} ${ing.unit}`;
      }

      if (!ing.required) {
        note += " (Optional)";
      }

      return `
        <li class="recipe-ing-item ${statusClass}">
          <i data-lucide="${statusIcon}" class="ing-status-icon"></i>
          <span class="ing-name"><strong>${ing.amount} ${ing.unit}</strong> ${ing.name}</span>
          <span class="ing-note">${note}</span>
        </li>
      `;
    }).join("");

    const stepList = modal.querySelector("#recipe-modal-steps");
    stepList.innerHTML = recipe.instructions.map((step, idx) => `
      <li class="recipe-step-item">
        <span class="step-num">${idx + 1}</span>
        <p class="step-text">${step}</p>
      </li>
    `).join("");

    const cookBtn = modal.querySelector("#btn-cook-recipe");
    const shoppingBtn = modal.querySelector("#btn-add-recipe-missing");

    cookBtn.onclick = () => this.handleCookRecipe(recipe);
    
    const missingIngredients = recipe.ingredients.filter(ing => {
      const ingNameLower = ing.name.toLowerCase();
      const pantryMatch = pantry.find(pItem => 
        pItem.qty > 0 && 
        (pItem.name.toLowerCase() === ingNameLower || pItem.name.toLowerCase().includes(ingNameLower) || ingNameLower.includes(pItem.name.toLowerCase()))
      );
      return !pantryMatch || pantryMatch.qty < ing.amount;
    });

    if (missingIngredients.length > 0) {
      shoppingBtn.style.display = "block";
      shoppingBtn.onclick = () => this.handleAddMissingToShopping(recipe, missingIngredients);
    } else {
      shoppingBtn.style.display = "none";
    }

    modal.style.display = "block";
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  handleCookRecipe(recipe) {
    const pantry = Storage.getPantry();
    const logs = Storage.getLogs();
    let cookedCount = 0;
    let pointsAwarded = 50;

    recipe.ingredients.forEach(ing => {
      const ingNameLower = ing.name.toLowerCase();
      const itemIdx = pantry.findIndex(pItem => 
        pItem.qty > 0 && 
        (pItem.name.toLowerCase() === ingNameLower || pItem.name.toLowerCase().includes(ingNameLower) || ingNameLower.includes(pItem.name.toLowerCase()))
      );

      if (itemIdx !== -1) {
        const item = pantry[itemIdx];
        const deductAmount = Math.min(item.qty, ing.amount);
        item.qty -= deductAmount;

        // Log consumption with reasonable INR rates (e.g. ₹50 standard value)
        logs.push({
          date: new Date().toISOString().split("T")[0],
          name: item.name,
          category: item.category,
          qty: deductAmount,
          unit: item.unit,
          value: +(deductAmount * 50.0).toFixed(2),
          status: "consumed",
          weight: +(deductAmount * 0.2).toFixed(2)
        });

        if (item.qty <= 0) {
          pantry.splice(itemIdx, 1);
        }

        cookedCount++;
      }
    });

    Storage.setPantry(pantry);
    Storage.setLogs(logs);

    if (recipe.match.rescuesExpiring) {
      pointsAwarded += 30;
      Notifications.showToast("🔥 Expiry Rescue Bonus unlocked! +30 XP", "success");
      this.updateChallengeProgress("cook");
    }

    const stats = Storage.getUserStats();
    stats.xp += pointsAwarded;
    
    const newLevel = Math.floor(stats.xp / 500) + 1;
    if (newLevel > stats.level) {
      stats.level = newLevel;
      setTimeout(() => {
        Notifications.showToast(`🎉 Level Up! You are now an Eco-Level ${newLevel} Food Rescuer!`, "success");
      }, 1000);
    }
    Storage.setUserStats(stats);

    this.render();
    Notifications.showToast(`Yum! Cooked "${recipe.name}"! Rescued ingredients tracked. +${pointsAwarded} XP`, "success");

    const modal = document.getElementById("recipe-detail-modal");
    if (modal) modal.style.display = "none";
  },

  updateChallengeProgress(type) {
    const stats = Storage.getUserStats();
    let updated = false;

    stats.challenges.forEach(chal => {
      if (chal.completed) return;

      if (type === "cook" && chal.id === "chal2") {
        if (chal.progress === 66) {
          chal.progress = 100;
          chal.completed = true;
          stats.xp += chal.xp;
          stats.badges.push(chal.badge);
          updated = true;
          setTimeout(() => {
            Notifications.showToast(`🏆 Challenge Complete: "Chutney Legend"! Unlocked Badge! +${chal.xp} XP`, "success");
          }, 1500);
        }
      }
    });

    if (updated) {
      Storage.setUserStats(stats);
    }
  },

  handleAddMissingToShopping(recipe, missingList) {
    const shopping = Storage.getShopping();
    let addedCount = 0;

    missingList.forEach(ing => {
      const alreadyInList = shopping.find(s => s.name.toLowerCase() === ing.name.toLowerCase());
      if (alreadyInList) {
        if (!alreadyInList.checked) {
          alreadyInList.qty += ing.amount;
        }
      } else {
        shopping.push({
          id: "s_rec_" + Math.random().toString(36).substr(2, 9),
          name: ing.name,
          qty: ing.amount,
          unit: ing.unit,
          checked: false,
          autoGenerated: true
        });
      }
      addedCount++;
    });

    Storage.setShopping(shopping);
    Notifications.showToast(`Added ${addedCount} missing ingredients to shopping list!`, "success");

    const modal = document.getElementById("recipe-detail-modal");
    if (modal) modal.style.display = "none";
  }
};
