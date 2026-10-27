/**
 * ==============================================================================
 * QuickBite — Shopping Cart Page Logic (cart.html)
 * Team RRN: 1247 (Shopping Cart Module)
 *
 * Requirements:
 * - Render cart items from LocalStorage ("qb_cart")
 * - Update quantities (+ and − buttons)
 * - Remove individual items
 * - Calculate total bill (Subtotal, Delivery Fee, Tax, Grand Total)
 * - Empty cart state & Clear cart
 * - Persist changes in LocalStorage
 * ==============================================================================
 */

// Global toast timeout handler
let toastTimer = null;

/**
 * Displays a non-intrusive toast feedback alert.
 */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

/**
 * Handles increasing or decreasing item quantities.
 */
function handleQuantityChange(foodId, delta) {
  const cart = getCart();
  const item = cart.find((i) => Number(i.foodId) === Number(foodId));

  if (!item) return;

  if (item.quantity + delta <= 0) {
    if (confirm(`Remove "${item.name}" from your cart?`)) {
      updateCartQuantity(foodId, delta);
      showToast(`Removed "${item.name}" from cart.`);
    }
  } else {
    updateCartQuantity(foodId, delta);
    showToast(`Updated quantity for "${item.name}" (${item.quantity + delta})`);
  }

  renderCartPage();
}

/**
 * Handles removing an item when the trash icon is clicked.
 */
function handleRemoveItem(foodId) {
  const cart = getCart();
  const item = cart.find((i) => Number(i.foodId) === Number(foodId));

  if (!item) return;

  if (confirm(`Remove "${item.name}" from your cart?`)) {
    removeFromCart(foodId);
    showToast(`Removed "${item.name}" from cart.`);
    renderCartPage();
  }
}

/**
 * Clears all items in the shopping cart.
 */
function handleClearCart() {
  const cart = getCart();
  if (cart.length === 0) return;

  if (confirm("Are you sure you want to empty your entire shopping cart?")) {
    clearCart();
    showToast("Shopping cart cleared.");
    renderCartPage();
  }
}

/**
 * Renders the entire cart page UI:
 * - Items list or empty cart state
 * - Item subtotals and quantity steppers
 * - Bill breakdown (subtotal, delivery, taxes, grand total)
 * - Button states
 */
function renderCartPage() {
  const cart = getCart();
  const bill = calculateCartBill();

  // DOM Elements
  const container = document.getElementById("cart-items-list");
  const heading = document.getElementById("cart-items-count-heading");
  const clearBtn = document.getElementById("clear-cart-btn");
  const subtotalEl = document.getElementById("bill-subtotal");
  const deliveryEl = document.getElementById("bill-delivery");
  const taxEl = document.getElementById("bill-tax");
  const grandTotalEl = document.getElementById("bill-grand-total");
  const checkoutBtn = document.getElementById("btn-proceed-checkout");

  if (!container) return;

  // Update header count title
  if (heading) {
    heading.textContent = `Items in Cart (${bill.totalItems})`;
  }

  // Handle Empty Cart State
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-card">
        <div class="empty-icon">🛒</div>
        <h3>Your Shopping Cart is Empty</h3>
        <p>Looks like you haven't added any delicious food yet. Check out our menu catalogue and treat yourself!</p>
        <a href="menu.html" class="btn-yellow">Browse Food Menu</a>
      </div>
    `;

    if (clearBtn) clearBtn.style.display = "none";

    // Disable Checkout button
    if (checkoutBtn) {
      checkoutBtn.classList.add("disabled");
      checkoutBtn.style.pointerEvents = "none";
      checkoutBtn.style.opacity = "0.5";
      checkoutBtn.setAttribute("aria-disabled", "true");
    }

    // Reset Bill values
    if (subtotalEl) subtotalEl.textContent = formatCurrency(0);
    if (deliveryEl) deliveryEl.textContent = formatCurrency(0);
    if (taxEl) taxEl.textContent = formatCurrency(0);
    if (grandTotalEl) grandTotalEl.textContent = formatCurrency(0);

    return;
  }

  // Cart Has Items
  if (clearBtn) clearBtn.style.display = "inline-block";

  // Enable Checkout button
  if (checkoutBtn) {
    checkoutBtn.classList.remove("disabled");
    checkoutBtn.style.pointerEvents = "auto";
    checkoutBtn.style.opacity = "1";
    checkoutBtn.removeAttribute("aria-disabled");
  }

  // Render individual cart item cards
  container.innerHTML = cart.map((item) => {
    const itemSubtotal = item.price * item.quantity;
    return `
      <div class="cart-item-card" data-food-id="${item.foodId}">
        <img 
          class="cart-item-img" 
          src="${item.image}" 
          alt="${item.name}" 
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'"
        >
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.name}</h4>
          <span class="cart-item-unit-price">${formatCurrency(item.price)} each</span>
        </div>

        <div class="cart-item-controls-wrap">
          <div class="qty-stepper">
            <button 
              type="button" 
              class="qty-btn" 
              onclick="handleQuantityChange(${item.foodId}, -1)" 
              aria-label="Decrease quantity"
              title="Decrease quantity"
            >−</button>
            <span class="qty-number">${item.quantity}</span>
            <button 
              type="button" 
              class="qty-btn" 
              onclick="handleQuantityChange(${item.foodId}, 1)" 
              aria-label="Increase quantity"
              title="Increase quantity"
            >+</button>
          </div>

          <div class="cart-item-subtotal">${formatCurrency(itemSubtotal)}</div>

          <button 
            type="button" 
            class="btn-remove-item" 
            onclick="handleRemoveItem(${item.foodId})" 
            title="Remove ${item.name} from cart"
            aria-label="Remove item"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Update Bill Summary
  if (subtotalEl) subtotalEl.textContent = formatCurrency(bill.subtotal);

  if (deliveryEl) {
    if (bill.subtotal > 0 && bill.deliveryFee === 0) {
      deliveryEl.innerHTML = `<span class="free-tag">FREE</span>`;
    } else {
      deliveryEl.textContent = formatCurrency(bill.deliveryFee);
    }
  }

  if (taxEl) taxEl.textContent = formatCurrency(bill.tax);
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(bill.grandTotal);
}

// Initialise event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();

  const clearBtn = document.getElementById("clear-cart-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", handleClearCart);
  }
});

