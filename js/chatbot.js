// AI Chatbot Manager for AI Food Waste Reduction Agent - Indian Version
import { Storage } from "./storage.js";
import { MOCK_STORAGE_GUIDE, MOCK_RECIPES } from "./mockData.js";
import { RecipeEngine } from "./recipes.js";

export const ChatbotManager = {
  init() {
    this.renderHistory();
    this.setupListeners();
  },

  setupListeners() {
    const sendBtn = document.getElementById("chat-send-btn");
    const input = document.getElementById("chat-input");
    
    if (sendBtn && input) {
      const sendMessage = () => {
        const text = input.value.trim();
        if (!text) return;
        this.handleUserMessage(text);
        input.value = "";
      };

      sendBtn.addEventListener("click", sendMessage);
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
      });
    }
  },

  renderHistory() {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;

    const history = Storage.getChatHistory();
    container.innerHTML = history.map(msg => `
      <div class="chat-bubble-wrapper ${msg.sender === 'user' ? 'chat-user' : 'chat-bot'}">
        <div class="chat-bubble">
          <div class="chat-bubble-text">${msg.message}</div>
          <span class="chat-bubble-time">${msg.timestamp}</span>
        </div>
      </div>
    `).join("");

    container.scrollTop = container.scrollHeight;

    container.querySelectorAll(".action-chat-recipe").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const recipe = MOCK_RECIPES.find(r => r.id === id);
        if (recipe) {
          RecipeEngine.openRecipeDetail(recipe);
        }
      });
    });
  },

  handleUserMessage(text) {
    const history = Storage.getChatHistory();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    history.push({ sender: "user", message: text, timestamp });
    Storage.setChatHistory(history);
    this.renderHistory();

    const container = document.getElementById("chat-messages-container");
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "chat-bubble-wrapper chat-bot typing-indicator-wrapper";
    typingIndicator.innerHTML = `
      <div class="chat-bubble">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    container.appendChild(typingIndicator);
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
      typingIndicator.remove();
      const botResponse = this.generateResponse(text);
      
      history.push({ sender: "chef", message: botResponse, timestamp });
      Storage.setChatHistory(history);
      this.renderHistory();
    }, 1200);
  },

  generateResponse(input) {
    const cleanInput = input.toLowerCase().trim();
    const pantry = Storage.getPantry();

    // 1. Greetings
    if (cleanInput.match(/\b(hi|hello|hey|greetings|hola|namaste|pranam)\b/)) {
      return "Namaste! 🙏 I am <strong>Chef Rasoi AI</strong>, your culinary assistant. I specialize in Indian home-cooking preservation and zero-waste recipes. Ask me: *'What can I cook with paneer?'* or *'How do I store coriander?'*";
    }

    // 2. Storage advice
    const storageKeywords = ["store", "keep", "fresh", "freeze", "preserv", "spoiling", "spoil", "rot"];
    const isStorageQuery = storageKeywords.some(keyword => cleanInput.includes(keyword));
    
    if (isStorageQuery) {
      let matchedGuide = null;
      for (const guide of MOCK_STORAGE_GUIDE) {
        if (cleanInput.includes(guide.item.toLowerCase()) || 
            guide.item.toLowerCase().split("/").some(part => cleanInput.includes(part.trim())) ||
            (cleanInput.includes("coriander") && guide.item.includes("Coriander")) ||
            (cleanInput.includes("dhaniya") && guide.item.includes("Coriander")) ||
            (cleanInput.includes("chilli") && guide.item.includes("Chillies")) ||
            (cleanInput.includes("roti") && guide.item.includes("Chapati")) ||
            (cleanInput.includes("paneer") && guide.item.includes("Paneer"))) {
          matchedGuide = guide;
          break;
        }
      }

      if (matchedGuide) {
        return `
          <strong>Rasoi Storage Guide for ${matchedGuide.item}</strong>:<br>
          📍 <strong>Storage Location</strong>: ${matchedGuide.zone}<br>
          ⏳ <strong>Typical Shelf Life</strong>: ${matchedGuide.lifespan}<br>
          💡 <strong>Preservation Hack</strong>: ${matchedGuide.tips}
        `;
      } else {
        return "I can explain how to preserve that! However, I didn't recognize the exact ingredient. Ask specifically: *'How do I keep dhaniya fresh?'* or *'How do I store paneer?'*";
      }
    }

    // 3. Recipes / cooking queries
    const recipeKeywords = ["cook", "recipe", "dinner", "lunch", "breakfast", "meal", "food", "eat", "make", "prepare"];
    const isRecipeQuery = recipeKeywords.some(keyword => cleanInput.includes(keyword));

    if (isRecipeQuery) {
      const scoredRecipes = MOCK_RECIPES.map(recipe => {
        let owned = 0;
        recipe.ingredients.forEach(ing => {
          if (pantry.some(p => p.qty > 0 && p.name.toLowerCase().includes(ing.name.toLowerCase().split(" ")[0]))) {
            owned++;
          }
        });
        const percent = Math.round((owned / recipe.ingredients.length) * 100);
        return { ...recipe, percent };
      }).sort((a, b) => b.percent - a.percent);

      const highMatch = scoredRecipes.filter(r => r.percent >= 30); // Lower threshold for more suggestions

      if (highMatch.length > 0) {
        let response = `Based on what is currently in your Indian pantry, here are the best recipes you can prepare:<br><br>`;
        highMatch.slice(0, 3).forEach((r, idx) => {
          response += `${idx + 1}. <strong>${r.name}</strong> (${r.percent}% ingredients owned)<br>`;
          response += `<button class="btn btn-xs btn-outline-success action-chat-recipe mt-1 mb-2" data-id="${r.id}">View Recipe Details</button><br>`;
        });
        return response;
      } else {
        return "I scanned your kitchen levels but couldn't find enough ingredients for a high-match recipe. Add groceries manually, scan a Zepto/Blinkit receipt, or make a simple <strong>Vegetable Pulao</strong> or <strong>Aloo Bhurji</strong> with basic spices!";
      }
    }

    // 4. Pantry status queries
    const expiryKeywords = ["expir", "bad", "throw", "old", "rotten", "expire", "spoiled"];
    const isExpiryQuery = expiryKeywords.some(keyword => cleanInput.includes(keyword));

    if (isExpiryQuery) {
      const expiringItems = pantry.filter(item => {
        const timeDiff = new Date(item.expiryDate) - new Date();
        const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return item.qty > 0 && diffDays <= 2;
      });

      if (expiringItems.length > 0) {
        let response = "⚠️ <strong>Urgent: Spoilage Risk!</strong><br>These ingredients will spoil in 48 hours:<br><ul>";
        expiringItems.forEach(item => {
          const days = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
          const label = days === 0 ? "today" : (days < 0 ? "already expired" : `in ${days} days`);
          response += `<li><strong>${item.name}</strong>: Expires ${label} (${item.qty} ${item.unit} remaining)</li>`;
        });
        response += "</ul>💡 Make a quick **Dhaniya Chutney** or **Paneer Bhurji** to rescue them!";
        return response;
      } else {
        return "Excellent! 🎉 None of the items currently in your pantry are expiring in the next 48 hours. Keep it up!";
      }
    }

    // 5. Ingredient references fallback
    const ingredientsMentioned = [];
    pantry.forEach(item => {
      const keywords = item.name.toLowerCase().split(" ");
      keywords.forEach(kw => {
        if (kw.length > 3 && cleanInput.includes(kw)) {
          if (!ingredientsMentioned.includes(item.name)) {
            ingredientsMentioned.push(item.name);
          }
        }
      });
    });

    if (ingredientsMentioned.length > 0) {
      return `I noticed you mentioned <strong>${ingredientsMentioned.join(" and ")}</strong>! You have these in your pantry. Sauté them with cumin (jeera) and green chillies for a quick, zero-waste dry sabzi. What else do you have in the fridge?`;
    }

    return "I'm not sure I understood completely. I'm trained on Indian kitchen management! Ask me: *'How do I store coriander?'*, *'Suggest a recipe with milk and bread'*, or *'What is expiring next?'*";
  }
};
