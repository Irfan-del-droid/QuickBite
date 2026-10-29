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

  const FOOD_NAME_ALIASES = {
    'idli sambar': 'Idli',
    'onion uthappam': 'Onion Uttapam',
    'royal chicken biryani': 'Chicken Biryani',
    'vegetable biryani': 'Veg Biryani',
    'samosa (2 pcs)': 'Samosa',
    'gulab jamun (4 pcs)': 'Gulab Jamun',
    'gajar ka halwa': 'Gajar Halwa'
  };
  // Default initial food catalogue items (30+ items across 6 categories)
  const DEFAULT_FOOD_ITEMS = [
    // ── South Indian ──────────────────────────────────────────────────────────
    {
      id: 1,
      name: "Masala Dosa",
      description: "Crispy golden dosa filled with spiced potato masala, served with coconut chutney and sambar.",
      price: 89,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 2,
      name: "Idli",
      description: "Soft steamed rice idlis served with piping hot sambar and fresh coconut chutney.",
      price: 69,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 3,
      name: "Chettinad Chicken Curry",
      description: "Bold, spicy Chettinad chicken cooked with freshly ground spices and kalpasi.",
      price: 229,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: false
    },
    {
      id: 4,
      name: "Onion Uttapam",
      description: "Thick soft rice pancake topped with caramelized onions and green chillies, served with chutney.",
      price: 79,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1630383249896-483b843b4c1d?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 5,
      name: "Medu Vada",
      description: "Crispy, golden deep-fried lentil doughnuts served with coconut chutney and spiced sambar.",
      price: 59,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    // ── North Indian ──────────────────────────────────────────────────────────
    {
      id: 6,
      name: "Paneer Butter Masala",
      description: "Soft paneer cubes simmered in a rich, creamy tomato-butter gravy. Served with naan.",
      price: 219,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 7,
      name: "Dal Makhani",
      description: "Slow-cooked black lentils in a buttery tomato gravy with cream, best paired with tandoor roti.",
      price: 179,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 8,
      name: "Butter Chicken",
      description: "Tender tandoori chicken pieces in a velvety, mildly spiced butter and tomato gravy.",
      price: 249,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: false
    },
    {
      id: 9,
      name: "Chole Bhature",
      description: "Spicy chickpea curry served with fluffy deep-fried bhature bread — a classic Punjabi combo.",
      price: 129,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1626132647523-66c2e3b57b00?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 10,
      name: "Aloo Paratha",
      description: "Whole-wheat flatbread stuffed with spiced mashed potato, served with yogurt and pickle.",
      price: 99,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1571167530149-c1105da4b1e0?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    // ── Rice & Biryani ────────────────────────────────────────────────────────
    {
      id: 11,
      name: "Chicken Biryani",
      description: "Aromatic aged basmati rice slow-cooked with tender marinated chicken and traditional spices.",
      price: 269,
      category: "Rice & Biryani",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: false
    },
    {
      id: 12,
      name: "Hyderabadi Mutton Dum Biryani",
      description: "Slow-cooked mutton layered with saffron-infused basmati rice in authentic dum style.",
      price: 329,
      category: "Rice & Biryani",
      image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: false
    },
    {
      id: 13,
      name: "Veg Biryani",
      description: "Fragrant basmati rice cooked with seasonal vegetables, whole spices, and fried onions.",
      price: 199,
      category: "Rice & Biryani",
      image: "https://images.unsplash.com/photo-1645177628172-a4fa81dac3c7?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 14,
      name: "Egg Fried Rice",
      description: "Wok-tossed long-grain rice with scrambled eggs, spring onions, and soy sauce.",
      price: 139,
      category: "Rice & Biryani",
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: false
    },
    {
      id: 15,
      name: "Jeera Rice",
      description: "Fluffy basmati rice tempered with cumin seeds, ghee, and fresh coriander.",
      price: 99,
      category: "Rice & Biryani",
      image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    // ── Snacks ────────────────────────────────────────────────────────────────
    {
      id: 16,
      name: "Samosa",
      description: "Crispy pastry pockets stuffed with spiced potato and green peas, served with mint chutney.",
      price: 49,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 17,
      name: "Pani Puri",
      description: "Hollow crispy puris filled with spiced tamarind water, chickpeas, and tangy chutneys.",
      price: 59,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 18,
      name: "Veg Spring Rolls (4 pcs)",
      description: "Golden crispy rolls stuffed with stir-fried vegetables and glass noodles.",
      price: 89,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 19,
      name: "Chicken 65",
      description: "Deep-fried spicy chicken bites marinated in yogurt, ginger, garlic, and red chillies.",
      price: 159,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: false
    },
    {
      id: 20,
      name: "Masala Fries",
      description: "Crispy golden potato fries tossed with spicy chaat masala and a squeeze of lime.",
      price: 79,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 21,
      name: "Bhel Puri",
      description: "Mumbai-style puffed rice tossed with chutneys, onions, tomatoes, sev, and coriander.",
      price: 49,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    // ── Desserts ──────────────────────────────────────────────────────────────
    {
      id: 22,
      name: "Gulab Jamun",
      description: "Soft milk-solid dumplings soaked in rose-flavoured sugar syrup, served warm.",
      price: 69,
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1666120636359-ab5afb09c3df?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 23,
      name: "Choco Lava Molten Cake",
      description: "Warm rich chocolate cake with a molten decadent chocolate center oozing out.",
      price: 119,
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 24,
      name: "Rasmalai",
      description: "Soft chenna discs soaked in chilled saffron and cardamom-flavoured cream.",
      price: 89,
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 25,
      name: "Mango Kulfi",
      description: "Traditional Indian frozen dessert made with condensed milk and fresh Alphonso mango.",
      price: 79,
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 26,
      name: "Gajar Halwa",
      description: "Slow-cooked grated carrot dessert with milk, ghee, cardamom, and crunchy cashews.",
      price: 89,
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    // ── Drinks ────────────────────────────────────────────────────────────────
    {
      id: 27,
      name: "Mango Alphonso Smoothie",
      description: "Fresh Alphonso mango pulp blended with chilled yogurt and a dash of organic honey.",
      price: 89,
      category: "Drinks",
      image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 28,
      name: "Masala Chai",
      description: "Strong ginger-cardamom tea brewed with milk and aromatic whole spices.",
      price: 39,
      category: "Drinks",
      image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 29,
      name: "Sweet Lassi",
      description: "Creamy chilled yogurt drink sweetened with sugar and topped with a layer of malai.",
      price: 59,
      category: "Drinks",
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 30,
      name: "Fresh Lime Soda",
      description: "Chilled sparkling soda with freshly squeezed lime, rock salt, and roasted cumin.",
      price: 49,
      category: "Drinks",
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 31,
      name: "Filter Coffee",
      description: "South Indian decoction coffee brewed with chicory, served frothy with full-cream milk.",
      price: 49,
      category: "Drinks",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 33,
      name: "Ghee Pongal",
      description: "Comforting rice and lentils tempered with ghee, pepper, cumin, and cashews.",
      price: 89,
      category: "South Indian",
      image: "quickbite_golden_feast/images/ven-pongal.jpg",
      available: true,
      veg: true
    },
    {
      id: 34,
      name: "Plain Dosa",
      description: "A crisp, golden rice-and-lentil crepe served with sambar and coconut chutney.",
      price: 69,
      category: "South Indian",
      image: "quickbite_golden_feast/images/masala-dosa.webp",
      available: true,
      veg: true
    },
    {
      id: 35,
      name: "Rava Dosa",
      description: "Lacy, crisp semolina dosa with pepper and herbs, served with fresh chutneys.",
      price: 99,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 36,
      name: "Poori Masala",
      description: "Puffed golden pooris served with gently spiced potato masala.",
      price: 99,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 37,
      name: "Curd Rice",
      description: "Creamy yogurt rice finished with a fragrant mustard-seed and curry-leaf tempering.",
      price: 79,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 38,
      name: "Lemon Rice",
      description: "Bright South Indian rice with lemon, turmeric, peanuts, and curry leaves.",
      price: 79,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 39,
      name: "Butter Naan",
      description: "Soft tandoor-baked naan brushed with butter, perfect for rich curries.",
      price: 49,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 40,
      name: "Rajma Chawal",
      description: "Slow-simmered kidney bean curry served with steamed basmati rice.",
      price: 149,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 41,
      name: "Palak Paneer",
      description: "Tender paneer cubes in a gently spiced spinach and cream gravy.",
      price: 199,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 42,
      name: "Tandoori Roti",
      description: "Fresh whole-wheat flatbread baked in the tandoor and served warm.",
      price: 29,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 43,
      name: "Paneer Biryani",
      description: "Fragrant basmati rice layered with marinated paneer, herbs, and warm spices.",
      price: 219,
      category: "Rice & Biryani",
      image: "https://images.unsplash.com/photo-1645177628172-a4fa81dac3c7?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 44,
      name: "Egg Biryani",
      description: "Spiced basmati dum biryani served with boiled eggs and cooling raita.",
      price: 189,
      category: "Rice & Biryani",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: false
    },
    {
      id: 45,
      name: "Chicken Fried Rice",
      description: "Wok-tossed rice with tender chicken, vegetables, spring onion, and soy.",
      price: 179,
      category: "Rice & Biryani",
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: false
    },
    {
      id: 46,
      name: "Veg Fried Rice",
      description: "Wok-fried rice with crisp vegetables, spring onion, and a light soy seasoning.",
      price: 139,
      category: "Rice & Biryani",
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 47,
      name: "Pav Bhaji",
      description: "Mumbai-style buttery vegetable bhaji served with toasted pav and fresh lime.",
      price: 129,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 48,
      name: "Aloo Tikki",
      description: "Crisp spiced potato patties served with tangy tamarind and mint chutneys.",
      price: 69,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 49,
      name: "Paneer Tikka",
      description: "Tandoor-charred paneer cubes marinated in yogurt, herbs, and Indian spices.",
      price: 189,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 50,
      name: "French Fries",
      description: "Golden, crisp fries lightly seasoned and served with a house dip.",
      price: 89,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    },
    {
      id: 52,
      name: "Mango Lassi",
      description: "A chilled, creamy yogurt drink blended with sweet mango.",
      price: 79,
      category: "Drinks",
      image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80",
      available: true,
      veg: true
    }
  ];

  const STANDARD_FOOD_NAMES = new Map(
    DEFAULT_FOOD_ITEMS.map(item => [item.name.toLowerCase(), item.name])
  );

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
        if (Array.isArray(parsed)) {
          let items = parsed.filter(item => item && typeof item === "object");
          items.forEach(item => {
            const oldName = String(item.name || "").trim().toLowerCase();
            const standardName = STANDARD_FOOD_NAMES.get(oldName) || FOOD_NAME_ALIASES[oldName];
            if (standardName) item.name = standardName;
          });
          const uniqueNames = new Set();
          items = items.filter(item => {
            const name = String(item.name || "").trim().toLowerCase();
            if (!name || !uniqueNames.has(name)) {
              if (name) uniqueNames.add(name);
              return true;
            }
            return false;
          });
          const usedIds = new Set();
          let nextId = items.reduce((highest, item) => Math.max(highest, Number(item.id) || 0), 0) + 1;
          items.forEach(item => {
            const id = Number(item.id);
            if (!Number.isFinite(id) || usedIds.has(id)) {
              item.id = nextId++;
            }
            usedIds.add(Number(item.id));
          });

          const names = new Set(items.map(item => String(item.name || "").trim().toLowerCase()));
          DEFAULT_FOOD_ITEMS.forEach(defaultItem => {
            const name = defaultItem.name.trim().toLowerCase();
            if (names.has(name)) return;

            const item = { ...defaultItem };
            if (usedIds.has(Number(item.id))) {
              item.id = nextId++;
            }
            usedIds.add(Number(item.id));
            names.add(name);
            items.push(item);
          });

          if (JSON.stringify(items) !== raw) {
            localStorage.setItem(STORAGE_KEYS.FOOD_ITEMS, JSON.stringify(items));
          }
          return items;
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
