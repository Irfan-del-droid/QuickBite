/**
 * ==============================================================================
 * QuickBite — Shared LocalStorage & Cart Helpers
 * Team RRN: 1247 (Shopping Cart Module)
 *
 * Keys agreed by team:
 * - Cart Key: "qb_cart"
 *   Schema: [{ foodId, name, price, quantity, image }]
 * - Food Catalogue Key: "qb_food_items"
 *   Schema: [{ id, name, description, price, category, image, available }]
 * ==============================================================================
 */

const STORAGE_KEYS = {
  CART: "qb_cart",
  FOOD_ITEMS: "qb_food_items"
};

// Default initial food catalogue matching team's agreed schema
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

// ==============================================================================
// 1. Food Catalogue LocalStorage Helpers
// ==============================================================================

/**
 * Initializes and retrieves food items from `qb_food_items`.
 * Ensures initial catalogue data is populated if empty.
 */
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
    console.error("Error reading food items from localStorage:", err);
  }

  // Populate default items if missing or corrupt
  try {
    localStorage.setItem(STORAGE_KEYS.FOOD_ITEMS, JSON.stringify(DEFAULT_FOOD_ITEMS));
  } catch (err) {
    console.error("Error storing default food items:", err);
  }
  return DEFAULT_FOOD_ITEMS;
}

// ==============================================================================
// 2. Shopping Cart LocalStorage Helpers (qb_cart)
// ==============================================================================

/**
 * Validates a single cart item to ensure it matches:
 * { foodId, name, price, quantity, image }
 */
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

/**
 * Reads and safely validates the cart from `qb_cart`.
 * Returns an array of valid cart items.
 */
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
    console.error("Error loading cart from LocalStorage:", err);
    return [];
  }
}

/**
 * Saves the cart array to `qb_cart` and notifies all listeners.
 */
function saveCart(cart) {
  try {
    const validCart = Array.isArray(cart) ? cart.filter(isValidCartItem) : [];
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(validCart));
    updateCartBadge();
    return true;
  } catch (err) {
    console.error("Error saving cart to LocalStorage:", err);
    return false;
  }
}

/**
 * Adds an item to the cart using the agreed format:
 * { foodId, name, price, quantity, image }
 * If already in cart, increases quantity by 1.
 */
function addToCart(foodItem) {
  // Validate that the food item exists, is available, and has a valid price
  if (!foodItem || !foodItem.id) return false;
  if (foodItem.available === false) {
    console.warn("Item is currently unavailable:", foodItem.name);
    return false;
  }
  if (typeof foodItem.price !== "number" || isNaN(foodItem.price) || foodItem.price < 0) {
    console.error("Invalid item price:", foodItem.price);
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

/**
 * Updates the quantity of an item by delta (+1 or -1).
 * If quantity drops below 1, removes the item.
 */
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

/**
 * Removes a specific item completely from the cart.
 */
function removeFromCart(foodId) {
  const cart = getCart();
  const filtered = cart.filter((item) => Number(item.foodId) !== Number(foodId));
  saveCart(filtered);
  return true;
}

/**
 * Empties all items from the cart.
 */
function clearCart() {
  saveCart([]);
}

/**
 * Returns the total count of items in the cart (sum of quantities).
 */
function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Calculates the total bill:
 * - Subtotal: sum(price * quantity)
 * - Delivery fee: ₹40 (FREE if subtotal >= ₹500, or ₹0 if empty)
 * - Tax: 5% of subtotal
 * - Grand Total: Subtotal + Delivery + Tax
 */
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

/**
 * Helper to format Indian Rupees cleanly.
 */
function formatCurrency(amount) {
  return `₹${Number(amount || 0).toFixed(2)}`;
}

/**
 * Updates any cart badge counters in the DOM header.
 */
function updateCartBadge() {
  const count = getCartCount();
  const badges = document.querySelectorAll(".cart-badge, #cart-badge");
  badges.forEach((badge) => {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "inline-flex";
  });
}

// Automatically update badges when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Ensure food items exist in storage
  getFoodItems();
  updateCartBadge();
});

