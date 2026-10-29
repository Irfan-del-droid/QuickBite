(() => {
  "use strict";

  const fallbackImage = "quickbite_golden_feast/images/idli-sambar.jpg";
  let selectedCategory = "all";
  let toastTimer = null;

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add("hidden"), 2500);
  }

  function renderMenu() {
    const foodGrid = document.getElementById("food-grid");
    const emptyState = document.getElementById("menu-empty-state");
    const searchTerm = document.getElementById("menu-search").value.trim().toLowerCase();
    const vegetarianOnly = document.getElementById("veg-only").checked;

    const filteredItems = getFoodItems().filter(item => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch = `${item.name} ${item.category} ${item.description || ""}`
        .toLowerCase()
        .includes(searchTerm);
      const matchesDiet = !vegetarianOnly || item.veg === true;
      return matchesCategory && matchesSearch && matchesDiet;
    });

    foodGrid.innerHTML = filteredItems.map(item => `
      <article class="food-card" data-id="${item.id}">
        <div class="food-card-img-wrap">
          <img
            src="${item.image || fallbackImage}"
            alt="${item.name}"
            loading="lazy"
            onerror="this.onerror=null;this.src='${fallbackImage}'"
          >
          <span class="food-category-badge">${item.category}</span>
          <span class="food-diet-badge ${item.veg === true ? "veg" : "non-veg"}">
            ${item.veg === true ? "Vegetarian" : "Non-vegetarian"}
          </span>
        </div>
        <div class="food-card-body">
          <h3 class="food-card-title">${item.name}</h3>
          <p class="food-card-desc">${item.description || "Freshly prepared and ready to enjoy."}</p>
          <div class="food-card-footer">
            <span class="food-card-price">${formatCurrency(item.price)}</span>
            <button
              type="button"
              class="btn-add-food"
              data-add-to-cart="${item.id}"
              ${item.available === false ? "disabled" : ""}
              aria-label="Add ${item.name} to cart"
            >
              <span aria-hidden="true">+</span> ${item.available === false ? "Unavailable" : "Add to Cart"}
            </button>
          </div>
        </div>
      </article>
    `).join("");
    emptyState.hidden = filteredItems.length > 0;
  }

  function handleAddToCart(id) {
    const product = getFoodItems().find(item => Number(item.id) === Number(id));
    if (!product) return;

    if (addToCart(product)) {
      showToast(`Added "${product.name}" to your cart.`);
    } else {
      showToast(`"${product.name}" is currently unavailable.`);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("menu-search").addEventListener("input", renderMenu);
    document.getElementById("veg-only").addEventListener("change", renderMenu);
    document.getElementById("category-bar").addEventListener("click", event => {
      const button = event.target.closest("[data-category]");
      if (!button) return;

      selectedCategory = button.dataset.category;
      document.querySelectorAll(".category-pill").forEach(pill => {
        const isActive = pill === button;
        pill.classList.toggle("active", isActive);
        pill.setAttribute("aria-pressed", String(isActive));
      });
      renderMenu();
    });
    document.getElementById("food-grid").addEventListener("click", event => {
      const button = event.target.closest("[data-add-to-cart]");
      if (button) handleAddToCart(button.dataset.addToCart);
    });
    renderMenu();
  });
})();
