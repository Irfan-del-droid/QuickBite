/**
 * ==============================================================================
 * QuickBite — Unified Shared LocalStorage Helper (js/storage.js)
 * Coordinates data persistence across all QuickBite modules:
 * - Authentication (RRN 1246): qb_users, qb_current_user
 * - Shopping Cart & Food Catalogue (RRN 1247): qb_cart, qb_food_items
 * ==============================================================================
 */

(function () {
  'use strict';

  // ============================================================================
  // 1. Storage Keys
  // ============================================================================
  const STORAGE_KEYS = {
    CART: 'qb_cart',
    FOOD_ITEMS: 'qb_food_items',
    USERS: 'qb_users',
    CURRENT_USER: 'qb_current_user'
  };

  // ============================================================================
  // 2. Default Seed Data
  // ============================================================================

  // Default demo user account for testing
  const DEFAULT_DEMO_USERS = [
    {
      name: 'Demo Gourmet',
      email: 'demo@quickbite.com',
      password: 'Password123',
      createdAt: '2026-10-27T00:00:00.000Z'
    }
  ];

  // Default initial food catalogue items
  const DEFAULT_FOOD_ITEMS = [
    {
      id: 1,
      name: "Classic Cheese Burger",
      description: "Grilled juicy patty, melting cheddar cheese, fresh lettuce, and special burger sauce.",
      price: 149,
      category: "Burgers",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
      available: true
    },
    {
      id: 2,
      name: "Crispy Chicken Burger",
      description: "Golden fried chicken breast with creamy mayo, pickles, and crispy shredded cabbage.",
      price: 189,
      category: "Burgers",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80",
      available: true
    },
    {
      id: 3,
      name: "Farmhouse Veggie Pizza",
      description: "Topped with crunchy bell peppers, red onions, mushrooms, corn, and mozzarella cheese.",
      price: 299,
      category: "Pizza",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
      available: true
    },
    {
      id: 4,
      name: "Pepperoni Delight Pizza",
      description: "Crispy crust layered with herb tomato marinara, melted mozzarella, and savory pepperoni.",
      price: 379,
      category: "Pizza",
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80",
      available: true
    },
    {
      id: 5,
      name: "Royal Chicken Biryani",
      description: "Aromatic aged basmati rice cooked with tender marinated chicken and traditional spices.",
      price: 269,
      category: "Meals",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80",
      available: true
    },
    {
      id: 6,
      name: "Paneer Butter Masala Thali",
      description: "Soft paneer cubes in rich butter gravy, served with aromatic rice and hot butter naan.",
      price: 239,
      category: "Meals",
      image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80",
      available: true
    },
    {
      id: 7,
      name: "Choco Lava Molten Cake",
      description: "Warm, rich chocolate cake with a molten, decadent chocolate center oozing out.",
      price: 119,
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80",
      available: true
    },
    {
      id: 8,
      name: "Mango Alphonso Smoothie",
      description: "Fresh Alphonso mango pulp blended with chilled yogurt and a dash of organic honey.",
      price: 89,
      category: "Beverages",
      image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80",
      available: true
    }
  ];

  // Helper: safe JSON parse
  function safeJSONParse(value, fallback) {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn('[QuickBite Storage] Corrupted JSON detected. Resetting to fallback.', e);
      return fallback;
    }
  }

  // ============================================================================
  // 3. User & Authentication Storage (RRN 1246)
  // ============================================================================
  const QuickBiteStorage = {
    getUsers() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.USERS);
        if (!raw) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_DEMO_USERS));
          return [...DEFAULT_DEMO_USERS];
        }
        const parsed = safeJSONParse(raw, DEFAULT_DEMO_USERS);
        return Array.isArray(parsed) ? parsed : DEFAULT_DEMO_USERS;
      } catch (err) {
        console.error('[QuickBite Storage] Failed to get users from localStorage:', err);
        return [...DEFAULT_DEMO_USERS];
      }
    },

    findUserByEmail(email) {
      if (!email) return null;
      const normalized = email.trim().toLowerCase();
      const users = this.getUsers();
      return users.find(u => (u.email || '').toLowerCase() === normalized) || null;
    },

    saveUser(userData) {
      try {
        if (!userData || !userData.email) return false;
        const users = this.getUsers();
        const record = {
          name: (userData.name || '').trim(),
          email: userData.email.trim().toLowerCase(),
          password: userData.password,
          createdAt: userData.createdAt || new Date().toISOString()
        };
        users.push(record);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return true;
      } catch (err) {
        console.error('[QuickBite Storage] Failed to save user to localStorage:', err);
        return false;
      }
    },

    getCurrentUser() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return safeJSONParse(raw, null);
      } catch (err) {
        console.error('[QuickBite Storage] Failed to read current session:', err);
        return null;
      }
    },

    setCurrentUser(userData) {
      try {
        if (!userData) return false;
        const sessionPayload = {
          name: (userData.name || '').trim(),
          email: (userData.email || '').trim().toLowerCase(),
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionPayload));
        return true;
      } catch (err) {
        console.error('[QuickBite Storage] Failed to set current session:', err);
        return false;
      }
    },

    clearCurrentUser() {
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        return true;
      } catch (err) {
        console.error('[QuickBite Storage] Failed to clear session:', err);
        return false;
      }
    }
  };

  // ============================================================================
  // 4. Food Catalogue & Shopping Cart Storage (RRN 1247)
  // ============================================================================

  function getFoodItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FOOD_ITEMS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("[QuickBite Storage] Error reading food items:", err);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.FOOD_ITEMS, JSON.stringify(DEFAULT_FOOD_ITEMS));
    } catch (err) {
      console.error("[QuickBite Storage] Error storing default food items:", err);
    }
    return DEFAULT_FOOD_ITEMS;
  }

  function isValidCartItem(item) {
    return (
      item &&
      typeof item === "object" &&
      item.foodId !== undefined &&
      typeof item.name === "string" &&
      typeof item.price === "number" &&
      !isNaN(item.price) &&
      item.price >= 0 &&
      typeof item.quantity === "number" &&
      !isNaN(item.quantity) &&
      item.quantity > 0
    );
  }

  function getCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CART);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(isValidCartItem);
      }
      return [];
    } catch (err) {
      console.error("[QuickBite Storage] Error loading cart:", err);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      const validCart = Array.isArray(cart) ? cart.filter(isValidCartItem) : [];
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(validCart));
      updateCartBadge();
      return true;
    } catch (err) {
      console.error("[QuickBite Storage] Error saving cart:", err);
      return false;
    }
  }

  function addToCart(foodItem) {
    if (!foodItem || !foodItem.id) return false;
    if (foodItem.available === false) {
      console.warn("[QuickBite Cart] Item currently unavailable:", foodItem.name);
      return false;
    }
    if (typeof foodItem.price !== "number" || isNaN(foodItem.price) || foodItem.price < 0) {
      console.error("[QuickBite Cart] Invalid item price:", foodItem.price);
      return false;
    }

    const cart = getCart();
    const existing = cart.find((item) => Number(item.foodId) === Number(foodItem.id));

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        foodId: Number(foodItem.id),
        name: foodItem.name,
        price: Number(foodItem.price),
        quantity: 1,
        image: foodItem.image || ""
      });
    }

    saveCart(cart);
    return true;
  }

  function updateCartQuantity(foodId, delta) {
    const intDelta = parseInt(delta, 10);
    if (isNaN(intDelta) || intDelta === 0) return false;

    const cart = getCart();
    const index = cart.findIndex((item) => Number(item.foodId) === Number(foodId));
    if (index === -1) return false;

    cart[index].quantity += intDelta;

    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }

    saveCart(cart);
    return true;
  }

  function removeFromCart(foodId) {
    const cart = getCart();
    const filtered = cart.filter((item) => Number(item.foodId) !== Number(foodId));
    saveCart(filtered);
    return true;
  }

  function clearCart() {
    saveCart([]);
  }

  function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  function calculateCartBill() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => {
      const price = typeof item.price === "number" && !isNaN(item.price) && item.price >= 0 ? item.price : 0;
      const qty = typeof item.quantity === "number" && !isNaN(item.quantity) && item.quantity > 0 ? Math.floor(item.quantity) : 0;
      return sum + (price * qty);
    }, 0);

    let deliveryFee = 0;
    if (subtotal > 0) {
      deliveryFee = subtotal >= 500 ? 0 : 40;
    }

    const tax = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
    const grandTotal = subtotal + deliveryFee + tax;

    return {
      subtotal,
      deliveryFee,
      tax,
      grandTotal,
      totalItems: cart.reduce((acc, item) => acc + (typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 0), 0)
    };
  }

  function formatCurrency(amount) {
    return `₹${Number(amount || 0).toFixed(2)}`;
  }

  function updateCartBadge() {
    const count = getCartCount();
    const badges = document.querySelectorAll(".cart-badge, #cart-badge");
    badges.forEach((badge) => {
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "inline-flex";
    });
  }

  // ============================================================================
  // 5. Global API Exposure
  // ============================================================================
  // Attach cart methods to QuickBiteStorage object for compatibility
  QuickBiteStorage.getCart = getCart;
  QuickBiteStorage.saveCart = saveCart;
  QuickBiteStorage.addToCart = addToCart;
  QuickBiteStorage.updateCartQuantity = updateCartQuantity;
  QuickBiteStorage.removeFromCart = removeFromCart;
  QuickBiteStorage.clearCart = clearCart;
  QuickBiteStorage.getCartCount = getCartCount;
  QuickBiteStorage.calculateCartBill = calculateCartBill;
  QuickBiteStorage.formatCurrency = formatCurrency;
  QuickBiteStorage.updateCartBadge = updateCartBadge;
  QuickBiteStorage.getFoodItems = getFoodItems;

  window.QuickBiteStorage = QuickBiteStorage;

  // Also expose top-level cart functions for backward compatibility with cart.html / menu.html
  window.getFoodItems = getFoodItems;
  window.getCart = getCart;
  window.saveCart = saveCart;
  window.addToCart = addToCart;
  window.updateCartQuantity = updateCartQuantity;
  window.removeFromCart = removeFromCart;
  window.clearCart = clearCart;
  window.getCartCount = getCartCount;
  window.calculateCartBill = calculateCartBill;
  window.formatCurrency = formatCurrency;
  window.updateCartBadge = updateCartBadge;

  // Auto-init on page load
  document.addEventListener("DOMContentLoaded", () => {
    QuickBiteStorage.getUsers();
    getFoodItems();
    updateCartBadge();
  });
})();
