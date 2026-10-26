// ========================================
// 🧶 LITTLE LOOPS — doll.js
// Το ίδιο αρχείο φορτώνεται σε όλες τις σελίδες.
// ========================================


// ========================================
// 🛒 ΚΑΛΑΘΙ — αποθήκευση
// Το καλάθι αποθηκεύεται στον browser (localStorage),
// οπότε μένει ίδιο σε όλες τις σελίδες και όταν ξανανοίξεις το σάιτ.
// ========================================

const CART_KEY = "littleLoopsCart";

let cart = loadCart();


function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}


function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
        // αν ο browser δεν επιτρέπει αποθήκευση, το καλάθι δουλεύει μόνο σε αυτή τη σελίδα
    }
}


function totalQuantity() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}


function totalPrice() {
    return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
}


function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}


// ========================================
// 🛒 ΚΑΛΑΘΙ — ενέργειες
// ========================================

// Καλείται από τα κουμπιά «+ Προσθήκη»: addToCart('Little bear', 25)
function addToCart(name, price) {

    const key = name + "|" + price;
    const existing = cart.find((item) => item.key === key);

    if (existing) {
        existing.qty += 1;
    } else {
        const button = window.event && window.event.target;
        const picture = findProductPicture(button);

        cart.push({
            key: key,
            name: name,
            price: price,
            qty: 1,
            image: picture.image,
            emoji: picture.emoji
        });
    }

    saveCart();
    updateCart();
    showToast("Προστέθηκε στο καλαθάκι ♡");
    bounceCartButton();
}


// Βρίσκει τη φωτογραφία (ή το emoji) του προϊόντος από την κάρτα του κουμπιού
function findProductPicture(button) {

    const card = button && button.closest ? button.closest("article") : null;

    if (!card) {
        return { image: "", emoji: "🧸" };
    }

    const img = card.querySelector("img");
    const emojiHolder = card.querySelector("[data-emoji]");
    const placeholder = card.querySelector(".placeholder");

    return {
        image: img ? img.getAttribute("src") : "",
        emoji: emojiHolder
            ? emojiHolder.dataset.emoji
            : (placeholder ? placeholder.textContent.trim() : "🧸")
    };
}


function changeQuantity(key, change) {

    const item = cart.find((entry) => entry.key === key);

    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {
        cart = cart.filter((entry) => entry.key !== key);
        showToast("Αφαιρέθηκε από το καλαθάκι");
    }

    saveCart();
    updateCart();
}


function removeFromCart(key) {

    cart = cart.filter((item) => item.key !== key);

    saveCart();
    updateCart();
    showToast("Αφαιρέθηκε από το καλαθάκι");
}


function clearCart() {

    cart = [];

    saveCart();
    updateCart();
    showToast("Το καλαθάκι άδειασε");
}


// Τα κουμπιά − / + / × μέσα στο καλάθι
document.addEventListener("click", (event) => {

    const button = event.target.closest("[data-cart-action]");

    if (!button) return;

    const key = button.dataset.key;
    const action = button.dataset.cartAction;

    if (action === "increase") changeQuantity(key, 1);
    if (action === "decrease") changeQuantity(key, -1);
    if (action === "remove")   removeFromCart(key);
    if (action === "clear")    clearCart();
});


// ========================================
// 🛒 ΚΑΛΑΘΙ — εμφάνιση
// ========================================

function thumbHTML(item, className) {

    const image = item.image
        ? `<img src="${escapeHTML(item.image)}" alt="" onerror="this.remove()">`
        : "";

    return `<span class="${className}" data-emoji="${escapeHTML(item.emoji || "🧸")}">${image}</span>`;
}


function quantityHTML(item) {

    const key = escapeHTML(item.key);

    return `
        <div class="cart-qty">
            <button data-cart-action="decrease" data-key="${key}" aria-label="Λιγότερα">−</button>
            <span>${item.qty}</span>
            <button data-cart-action="increase" data-key="${key}" aria-label="Περισσότερα">+</button>
        </div>
    `;
}


function updateCart() {

    // αριθμός πάνω στο εικονίδιο 🛒
    const cartCount = document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = totalQuantity();
    }

    renderCartDrawer();
    renderCartPage();
}


// Το μικρό καλάθι που ανοίγει από δεξιά
function renderCartDrawer() {

    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartItems || !cartTotal) return;

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="cart-empty">
                <div>🧺</div>
                <p>Το καλαθάκι σου είναι άδειο ♡</p>
            </div>
        `;

    } else {

        cartItems.innerHTML = cart.map((item) => `
            <div class="cart-item">

                ${thumbHTML(item, "cart-thumb")}

                <div class="cart-item-text">
                    <strong>${escapeHTML(item.name)}</strong>
                    <small>${item.price}€ / τεμάχιο</small>
                    ${quantityHTML(item)}
                </div>

                <button class="remove-item" data-cart-action="remove" data-key="${escapeHTML(item.key)}" aria-label="Αφαίρεση">
                    ×
                </button>

            </div>
        `).join("");
    }

    cartTotal.textContent = totalPrice() + "€";
}


// Η σελίδα cart.html
function renderCartPage() {

    const page = document.getElementById("cartPage");

    if (!page) return;

    if (cart.length === 0) {

        page.innerHTML = `
            <div class="cart-page-empty">
                <div class="cart-page-empty-icon">🧺</div>
                <h3>Το καλαθάκι σου είναι άδειο</h3>
                <p>Ρίξε μια ματιά στη συλλογή και βρες τον καινούριο σου μικρό φίλο.</p>
                <a href="collection.html" class="primary-button">Δες τη συλλογή</a>
            </div>
        `;
        return;
    }

    const rows = cart.map((item) => `
        <article class="cart-row">

            ${thumbHTML(item, "cart-row-thumb")}

            <div class="cart-row-info">
                <h3>${escapeHTML(item.name)}</h3>
                <span>${item.price}€ / τεμάχιο</span>
            </div>

            ${quantityHTML(item)}

            <strong class="cart-row-total">${item.qty * item.price}€</strong>

            <button class="cart-row-remove" data-cart-action="remove" data-key="${escapeHTML(item.key)}" aria-label="Αφαίρεση">
                ×
            </button>

        </article>
    `).join("");

    const quantity = totalQuantity();

    page.innerHTML = `
        <div class="cart-page-layout">

            <div class="cart-page-list">
                ${rows}

                <button class="cart-clear" data-cart-action="clear">
                    Άδειασμα καλαθιού
                </button>
            </div>

            <aside class="cart-summary">

                <h3>Σύνοψη παραγγελίας</h3>

                <div class="summary-line">
                    <span>Προϊόντα</span>
                    <span>${quantity} ${quantity === 1 ? "τεμάχιο" : "τεμάχια"}</span>
                </div>

                <div class="summary-line summary-total">
                    <span>Σύνολο</span>
                    <strong>${totalPrice()}€</strong>
                </div>

                <button class="primary-button summary-checkout" onclick="placeOrder()">
                    Ολοκλήρωση παραγγελίας
                </button>

                <a href="collection.html" class="summary-continue">← Συνέχεια αγορών</a>

                <p class="summary-note">
                    🧶 Κάθε παιχνιδάκι φτιάχνεται στο χέρι, με πολλή αγάπη.
                </p>

            </aside>

        </div>
    `;
}


// ========================================
// 🛒 ΑΝΟΙΓΜΑ / ΚΛΕΙΣΙΜΟ ΜΙΚΡΟΥ ΚΑΛΑΘΙΟΥ
// ========================================

function openCart() {

    const overlay = document.getElementById("cartOverlay");

    if (!overlay) return;

    updateCart();
    overlay.classList.add("show");
}


function closeCart(event) {

    const overlay = document.getElementById("cartOverlay");

    if (!overlay) return;

    if (!event || event.target.id === "cartOverlay") {
        overlay.classList.remove("show");
    }
}


// κλείνει και με το πλήκτρο Esc
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCart();
});


function bounceCartButton() {

    const cartButton = document.querySelector(".cart-button");

    if (!cartButton) return;

    cartButton.classList.remove("bounce");
    void cartButton.offsetWidth;          // ξαναξεκινάει το animation
    cartButton.classList.add("bounce");
}


// ========================================
// ✅ ΟΛΟΚΛΗΡΩΣΗ ΠΑΡΑΓΓΕΛΙΑΣ
// ========================================

// Κουμπί του μικρού καλαθιού: πηγαίνει στη σελίδα του καλαθιού
function checkout() {

    if (cart.length === 0) {
        showToast("Το καλαθάκι σου είναι άδειο ♡");
        return;
    }

    window.location.href = "cart.html";
}


// Κουμπί της σελίδας cart.html
function placeOrder() {

    if (cart.length === 0) {
        showToast("Το καλαθάκι σου είναι άδειο ♡");
        return;
    }

    // Εδώ θα συνδεθεί αργότερα η πληρωμή (Stripe / PayPal) ή η αποστολή της παραγγελίας.
    showToast("Η online παραγγελία θα είναι διαθέσιμη σύντομα ♡");
}


// ========================================
// 🍞 TOAST (μικρό μήνυμα κάτω)
// ========================================

let toastTimeout;


function showToast(message) {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// ========================================
// ❤️ ΑΓΑΠΗΜΕΝΑ
// ========================================

function toggleHeart(button) {

    button.classList.toggle("active");

    if (button.classList.contains("active")) {
        button.textContent = "♥";
        showToast("Μπήκε στα αγαπημένα σου ♡");
    } else {
        button.textContent = "♡";
    }
}


// ========================================
// 📱 ΜΕΝΟΥ ΚΙΝΗΤΟΥ
// ========================================

function toggleMenu() {

    const nav = document.querySelector(".nav");

    if (nav) nav.classList.toggle("open");
}


// ========================================
// ✉️ NEWSLETTER
// ========================================

function subscribe(event) {

    event.preventDefault();

    const input = document.getElementById("email");
    const message = document.getElementById("subscribeMessage");

    if (input && input.value) {

        if (message) message.textContent = "♡ Καλώς ήρθες στην παρέα μας!";

        input.value = "";
        showToast("Έγινε η εγγραφή σου ♡");
    }
}


function showMessage() {
    showToast("Σύντομα θα εμφανιστεί όλη η συλλογή! ✿");
}


// ========================================
// ΕΚΚΙΝΗΣΗ
// ========================================

updateCart();

// αν το καλάθι αλλάξει σε άλλη καρτέλα του browser, ενημερώνεται κι εδώ
window.addEventListener("storage", (event) => {
    if (event.key === CART_KEY) {
        cart = loadCart();
        updateCart();
    }
});

// όταν γυρνάς πίσω με το «πίσω» του browser, ξαναδιαβάζει το καλάθι
window.addEventListener("pageshow", () => {
    cart = loadCart();
    updateCart();
});