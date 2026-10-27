
const CART_KEY = "qb_cart";
const ORDERS_KEY = "qb_orders";
const DELIVERY_FEE = 30;

const money = amount => `₹${amount.toFixed(2)}`;
const readData = (key, fallback) => {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
};

let cart = readData(CART_KEY, []);
if (!Array.isArray(cart)) cart = [];

const itemsContainer = document.getElementById("order-items");
const totalElement = document.getElementById("order-total");
const cartMessage = document.getElementById("cart-message");
const form = document.getElementById("checkout-form");
const message = document.getElementById("checkout-message");

function getSubtotal() {
    return cart.reduce((sum, item) => {
        const price = Number(item.price);
        const quantity = Number(item.quantity);
        if (!Number.isFinite(price) || !Number.isInteger(quantity) || price < 0 || quantity < 1) return sum;
        return sum + price * quantity;
    }, 0);
}

function renderCart() {
    itemsContainer.replaceChildren();

    if (cart.length === 0) {
        cartMessage.textContent = "Your cart is empty. Add food from the menu before checking out.";
        totalElement.textContent = money(0);
        form.querySelector("button[type='submit']").disabled = true;
        return;
    }

    cartMessage.textContent = "";
    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "order-row";
        const name = document.createElement("span");
        name.textContent = `${item.name} × ${item.quantity}`;
        const price = document.createElement("span");
        price.textContent = money(Number(item.price) * Number(item.quantity));
        row.append(name, price);
        itemsContainer.appendChild(row);
    });

    totalElement.textContent = money(getSubtotal() + DELIVERY_FEE);
}

renderCart();

form.addEventListener("submit", event => {
    event.preventDefault();

    cart = readData(CART_KEY, []);
    if (!Array.isArray(cart) || cart.length === 0) {
        message.hidden = false;
        message.textContent = "Your cart is empty. Please add items before placing an order.";
        return;
    }

    const validCart = cart.every(item =>
        item &&
        typeof item.name === "string" &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0 &&
        Number.isInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0
    );

    if (!validCart) {
        message.hidden = false;
        message.textContent = "Your cart contains invalid items. Please return to the cart and check them.";
        return;
    }

    if (!form.reportValidity()) return;

    const address = {
        name: form.elements.name.value.trim(),
        phone: form.elements.phone.value.trim(),
        street: form.elements.street.value.trim(),
        city: form.elements.city.value.trim(),
        pincode: form.elements.pincode.value.trim()
    };

    const order = {
        id: `QB${Date.now()}`,
        items: cart.map(item => ({
            foodId: item.foodId,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image || ""
        })),
        total: getSubtotal() + DELIVERY_FEE,
        address,
        status: "Placed",
        createdAt: new Date().toISOString(),
        feedback: null
    };

    try {
        const orders = readData(ORDERS_KEY, []);
        if (!Array.isArray(orders)) throw new Error("Invalid orders data");

        orders.push(order);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        localStorage.setItem(CART_KEY, JSON.stringify([]));

        message.hidden = false;
        message.textContent = `Order placed successfully! Your order ID is ${order.id}. Total: ${money(order.total)}.`;
        form.reset();
        form.querySelector("button[type='submit']").disabled = true;
        itemsContainer.replaceChildren();
        totalElement.textContent = money(0);
        cartMessage.textContent = "Your order has been saved in this browser.";
    } catch {
        message.hidden = false;
        message.textContent = "Could not save the order. Please check browser storage and try again.";
    }
});
