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
    CURRENT_USER: 'qb_current_user',
    ORDERS: 'qb_orders'
  };

  // ============================================================================
  // 2. Default Seed Data
  // ============================================================================

  // Default demo user accounts (including Admin role)
  const DEFAULT_DEMO_USERS = [
    {
      name: 'Restaurant Admin',
      email: 'admin@quickbite.com',
      password: 'AdminPassword123',
      role: 'admin',
      createdAt: '2026-10-27T00:00:00.000Z'
    },
    {
      name: 'Demo Gourmet',
      email: 'demo@quickbite.com',
      password: 'Password123',
      role: 'customer',
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
        let users = DEFAULT_DEMO_USERS;
        if (raw) {
          const parsed = safeJSONParse(raw, null);
          if (Array.isArray(parsed) && parsed.length > 0) {
            users = parsed;
          }
        }
        // Ensure admin user exists in qb_users
        DEFAULT_DEMO_USERS.forEach(defUser => {
          if (!users.some(u => (u.email || '').toLowerCase() === defUser.email.toLowerCase())) {
            users.unshift(defUser);
          }
        });
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return users;
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
        const normEmail = userData.email.trim().toLowerCase();
        const record = {
          name: (userData.name || '').trim(),
          email: normEmail,
          password: userData.password,
          role: userData.role || (normEmail === 'admin@quickbite.com' ? 'admin' : 'customer'),
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
        const normEmail = (userData.email || '').trim().toLowerCase();
        const sessionPayload = {
          name: (userData.name || '').trim(),
          email: normEmail,
          role: userData.role || (normEmail === 'admin@quickbite.com' ? 'admin' : 'customer'),
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
    },

    isAdmin() {
      const user = this.getCurrentUser();
      if (!user) return false;
      return user.role === 'admin' || (user.email && user.email.toLowerCase() === 'admin@quickbite.com');
    }
  };

  // ============================================================================
  // 4. Food Catalogue & Shopping Cart Storage (RRN 1247)
  // ============================================================================

  function getFoodItems() {
    try {
      const initialized = localStorage.getItem('qb_food_initialized');
      const raw = localStorage.getItem(STORAGE_KEYS.FOOD_ITEMS);

      if (initialized && raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem('qb_food_initialized', 'true');
          return parsed;
        }
      }

      localStorage.setItem(STORAGE_KEYS.FOOD_ITEMS, JSON.stringify(DEFAULT_FOOD_ITEMS));
      localStorage.setItem('qb_food_initialized', 'true');
      return [...DEFAULT_FOOD_ITEMS];
    } catch (err) {
      console.error("[QuickBite Storage] Error reading food items:", err);
      return [...DEFAULT_FOOD_ITEMS];
    }
  }

  function saveFoodItems(items) {
    try {
      const validItems = Array.isArray(items) ? items : [];
      localStorage.setItem(STORAGE_KEYS.FOOD_ITEMS, JSON.stringify(validItems));
      localStorage.setItem('qb_food_initialized', 'true');
      window.dispatchEvent(new CustomEvent('qb-food-items-updated', { detail: validItems }));
      return true;
    } catch (err) {
      console.error("[QuickBite Storage] Error saving food items:", err);
      return false;
    }
  }

  function addFoodItem(itemData) {
    if (!itemData || !itemData.name) return null;
    const items = getFoodItems();
    const highestId = items.reduce((highest, item) => Math.max(highest, Number(item.id) || 0), 0);
    const newItem = {
      id: highestId + 1,
      name: String(itemData.name).trim(),
      description: String(itemData.description || '').trim(),
      category: itemData.category || 'South Indian',
      price: Number(itemData.price) || 0,
      image: itemData.image && itemData.image.trim() ? itemData.image.trim() : 'quickbite_golden_feast/images/masala-dosa.webp',
      available: itemData.available !== false,
      veg: itemData.veg !== false
    };
    items.unshift(newItem);
    saveFoodItems(items);
    return newItem;
  }

  function updateFoodItem(id, itemData) {
    if (id === undefined || id === null) return null;
    const items = getFoodItems();
    const index = items.findIndex(item => Number(item.id) === Number(id));
    if (index === -1) return null;

    const current = items[index];
    items[index] = {
      ...current,
      name: itemData.name !== undefined ? String(itemData.name).trim() : current.name,
      description: itemData.description !== undefined ? String(itemData.description).trim() : current.description,
      category: itemData.category !== undefined ? itemData.category : current.category,
      price: itemData.price !== undefined ? Number(itemData.price) : current.price,
      image: itemData.image !== undefined ? (itemData.image.trim() || current.image) : current.image,
      available: itemData.available !== undefined ? Boolean(itemData.available) : current.available,
      veg: itemData.veg !== undefined ? Boolean(itemData.veg) : current.veg
    };
    saveFoodItems(items);
    return items[index];
  }

  function deleteFoodItem(id) {
    if (id === undefined || id === null) return false;
    const items = getFoodItems();
    const filtered = items.filter(item => Number(item.id) !== Number(id));
    saveFoodItems(filtered);
    return true;
  }

  function getFoodItemById(id) {
    const items = getFoodItems();
    return items.find(item => Number(item.id) === Number(id)) || null;
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
  // 5. Orders Management Storage (Admin & Checkout Integration)
  // ============================================================================

  // Default Sample Orders for immediate Admin Portal demonstration & testing
  const DEFAULT_SAMPLE_ORDERS = [
    {
      orderId: 'QB-1048',
      customerName: 'Senthil Kumar',
      customerPhone: '9840123456',
      deliveryAddress: 'Flat 4B, Kaveri Apartments, 2nd Main Road, Anna Nagar, Chennai',
      items: [
        { foodId: 1, name: 'Masala Dosa', price: 89, quantity: 2, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80' },
        { foodId: 31, name: 'Filter Coffee', price: 49, quantity: 2, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80' },
        { foodId: 33, name: 'Ghee Pongal', price: 89, quantity: 1, image: 'quickbite_golden_feast/images/ven-pongal.jpg' }
      ],
      totalItems: 5,
      subtotal: 365,
      deliveryFee: 40,
      tax: 18,
      totalAmount: 423,
      paymentMethod: 'UPI / GPay',
      paymentStatus: 'Paid',
      status: 'Preparing',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    },
    {
      orderId: 'QB-1047',
      customerName: 'Priya Raman',
      customerPhone: '9884567890',
      deliveryAddress: 'Plot 12, Sri Ram Nagar, Thiruvanmiyur, Chennai',
      items: [
        { foodId: 2, name: 'Idli', price: 69, quantity: 3, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80' },
        { foodId: 5, name: 'Medu Vada', price: 59, quantity: 2, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=500&q=80' },
        { foodId: 31, name: 'Filter Coffee', price: 49, quantity: 2, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80' }
      ],
      totalItems: 7,
      subtotal: 423,
      deliveryFee: 40,
      tax: 21,
      totalAmount: 484,
      paymentMethod: 'UPI / GPay',
      paymentStatus: 'Paid',
      status: 'Ready for Pickup',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
      orderId: 'QB-1046',
      customerName: 'Karthik Sundaram',
      customerPhone: '9444112233',
      deliveryAddress: 'Door 18, Temple View Street, Mylapore, Chennai',
      items: [
        { foodId: 6, name: 'Paneer Butter Masala', price: 219, quantity: 1, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80' },
        { foodId: 39, name: 'Butter Naan', price: 49, quantity: 3, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80' },
        { foodId: 13, name: 'Veg Biryani', price: 199, quantity: 1, image: 'https://images.unsplash.com/photo-1645177628172-a4fa81dac3c7?auto=format&fit=crop&w=500&q=80' }
      ],
      totalItems: 5,
      subtotal: 565,
      deliveryFee: 0,
      tax: 28,
      totalAmount: 593,
      paymentMethod: 'Cash on Delivery (COD)',
      paymentStatus: 'Pending',
      status: 'Pending',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      orderId: 'QB-1045',
      customerName: 'Ananya Iyer',
      customerPhone: '9791002345',
      deliveryAddress: 'Tower 3, Apt 804, Green Acres, Perungudi, Chennai',
      items: [
        { foodId: 4, name: 'Onion Uttapam', price: 79, quantity: 2, image: 'https://images.unsplash.com/photo-1630383249896-483b843b4c1d?auto=format&fit=crop&w=500&q=80' },
        { foodId: 52, name: 'Mango Lassi', price: 79, quantity: 2, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80' }
      ],
      totalItems: 4,
      subtotal: 316,
      deliveryFee: 40,
      tax: 16,
      totalAmount: 372,
      paymentMethod: 'UPI / GPay',
      paymentStatus: 'Paid',
      status: 'Confirmed',
      createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString()
    },
    {
      orderId: 'QB-1044',
      customerName: 'Rajesh V.',
      customerPhone: '9940334455',
      deliveryAddress: '24, Gandhi Road, T. Nagar, Chennai',
      items: [
        { foodId: 3, name: 'Chettinad Chicken Curry', price: 229, quantity: 1, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=80' },
        { foodId: 11, name: 'Chicken Biryani', price: 269, quantity: 2, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80' },
        { foodId: 29, name: 'Sweet Lassi', price: 59, quantity: 2, image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=500&q=80' }
      ],
      totalItems: 5,
      subtotal: 885,
      deliveryFee: 0,
      tax: 44,
      totalAmount: 929,
      paymentMethod: 'UPI / GPay',
      paymentStatus: 'Paid',
      status: 'Completed',
      createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
    },
    {
      orderId: 'QB-1043',
      customerName: 'Meenakshi Sundaram',
      customerPhone: '9841998877',
      deliveryAddress: '55, South Mada Street, Mylapore, Chennai',
      items: [
        { foodId: 5, name: 'Medu Vada', price: 59, quantity: 4, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=500&q=80' },
        { foodId: 31, name: 'Filter Coffee', price: 49, quantity: 4, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80' }
      ],
      totalItems: 8,
      subtotal: 432,
      deliveryFee: 40,
      tax: 22,
      totalAmount: 494,
      paymentMethod: 'UPI / GPay',
      paymentStatus: 'Paid',
      status: 'Completed',
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
    },
    {
      orderId: 'QB-1042',
      customerName: 'Deepak Sharma',
      customerPhone: '9820556677',
      deliveryAddress: '15, Sterling Road, Nungambakkam, Chennai',
      items: [
        { foodId: 9, name: 'Chole Bhature', price: 129, quantity: 2, image: 'https://images.unsplash.com/photo-1626132647523-66c2e3b57b00?auto=format&fit=crop&w=500&q=80' },
        { foodId: 28, name: 'Masala Chai', price: 39, quantity: 2, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=500&q=80' }
      ],
      totalItems: 4,
      subtotal: 336,
      deliveryFee: 40,
      tax: 17,
      totalAmount: 393,
      paymentMethod: 'Cash on Delivery (COD)',
      paymentStatus: 'Paid',
      status: 'Completed',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    },
    {
      orderId: 'QB-1041',
      customerName: 'Vikram Nathan',
      customerPhone: '9711223344',
      deliveryAddress: '31, Beach Road, Besant Nagar, Chennai',
      items: [
        { foodId: 19, name: 'Chicken 65', price: 159, quantity: 2, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=500&q=80' },
        { foodId: 14, name: 'Egg Fried Rice', price: 139, quantity: 1, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80' }
      ],
      totalItems: 3,
      subtotal: 457,
      deliveryFee: 40,
      tax: 23,
      totalAmount: 520,
      paymentMethod: 'Cash on Delivery (COD)',
      paymentStatus: 'Cancelled',
      status: 'Cancelled',
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
    }
  ];

  function getOrders() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.error("[QuickBite Storage] Error reading orders:", err);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_SAMPLE_ORDERS));
    } catch (err) {
      console.error("[QuickBite Storage] Error storing default orders:", err);
    }
    return [...DEFAULT_SAMPLE_ORDERS];
  }

  function saveOrders(orders) {
    try {
      const list = Array.isArray(orders) ? orders : [];
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('qb-orders-updated', { detail: list }));
      return true;
    } catch (err) {
      console.error("[QuickBite Storage] Error saving orders:", err);
      return false;
    }
  }

  function createOrder(orderData) {
    if (!orderData) return null;
    const orders = getOrders();
    const nextNum = orders.reduce((max, o) => {
      const num = parseInt(String(o.orderId || '').replace(/\D/g, ''), 10);
      return Math.max(max, isNaN(num) ? 0 : num);
    }, 1048) + 1;

    const newOrder = {
      orderId: orderData.orderId || `QB-${nextNum}`,
      customerName: (orderData.customerName || 'Guest Customer').trim(),
      customerPhone: (orderData.customerPhone || '').trim(),
      deliveryAddress: (orderData.deliveryAddress || '').trim(),
      items: Array.isArray(orderData.items) ? orderData.items : [],
      totalItems: Number(orderData.totalItems) || (orderData.items ? orderData.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0),
      subtotal: Number(orderData.subtotal) || 0,
      deliveryFee: Number(orderData.deliveryFee) || 0,
      tax: Number(orderData.tax) || 0,
      totalAmount: Number(orderData.totalAmount) || 0,
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery (COD)',
      paymentStatus: orderData.paymentStatus || 'Pending',
      status: orderData.status || 'Pending',
      createdAt: orderData.createdAt || new Date().toISOString()
    };

    orders.unshift(newOrder);
    saveOrders(orders);
    return newOrder;
  }

  function updateOrderStatus(orderId, newStatus) {
    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(newStatus)) return null;

    const orders = getOrders();
    const order = orders.find(o => String(o.orderId) === String(orderId));
    if (!order) return null;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'Completed' && order.paymentStatus === 'Pending') {
      order.paymentStatus = 'Paid';
    } else if (newStatus === 'Cancelled') {
      order.paymentStatus = (order.paymentMethod && order.paymentMethod.includes('UPI')) ? 'Refunded' : 'Cancelled';
    }

    saveOrders(orders);
    return order;
  }

  function deleteOrder(orderId) {
    const orders = getOrders();
    const filtered = orders.filter(o => String(o.orderId) !== String(orderId));
    saveOrders(filtered);
    return true;
  }

  function getOrderById(orderId) {
    const orders = getOrders();
    return orders.find(o => String(o.orderId) === String(orderId)) || null;
  }

  // ============================================================================
  // 6. Global API Exposure
  // ============================================================================
  // Attach food item methods
  QuickBiteStorage.getFoodItems = getFoodItems;
  QuickBiteStorage.saveFoodItems = saveFoodItems;
  QuickBiteStorage.addFoodItem = addFoodItem;
  QuickBiteStorage.updateFoodItem = updateFoodItem;
  QuickBiteStorage.deleteFoodItem = deleteFoodItem;
  QuickBiteStorage.getFoodItemById = getFoodItemById;

  // Attach cart methods
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

  // Attach order methods
  QuickBiteStorage.getOrders = getOrders;
  QuickBiteStorage.saveOrders = saveOrders;
  QuickBiteStorage.createOrder = createOrder;
  QuickBiteStorage.updateOrderStatus = updateOrderStatus;
  QuickBiteStorage.deleteOrder = deleteOrder;
  QuickBiteStorage.getOrderById = getOrderById;

  window.QuickBiteStorage = QuickBiteStorage;

  // Top-level aliases for backward compatibility across all modules
  window.getFoodItems = getFoodItems;
  window.saveFoodItems = saveFoodItems;
  window.addFoodItem = addFoodItem;
  window.updateFoodItem = updateFoodItem;
  window.deleteFoodItem = deleteFoodItem;
  window.getFoodItemById = getFoodItemById;

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

  window.getOrders = getOrders;
  window.saveOrders = saveOrders;
  window.createOrder = createOrder;
  window.updateOrderStatus = updateOrderStatus;
  window.deleteOrder = deleteOrder;
  window.getOrderById = getOrderById;

  // Auto-init on page load
  document.addEventListener("DOMContentLoaded", () => {
    QuickBiteStorage.getUsers();
    getFoodItems();
    getOrders();
    updateCartBadge();
  });
})();
