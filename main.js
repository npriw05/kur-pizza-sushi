
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    showToast(`${name} Added to the list! ✅`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function increaseQuantity(index) {
    cart[index].quantity++;
    saveCart();
    updateCartUI();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        removeFromCart(index);
    }
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartUI() {
    const cartItemsDiv = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCount = document.getElementById("cartCount");
    const emptyCart = document.getElementById("emptyCart");

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total + " $";

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "";
        emptyCart.style.display = "block";
        return;
    }

    emptyCart.style.display = "none";

    cartItemsDiv.innerHTML = cart.map((item, index) => `
        <div class="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
            <div class="flex-1">
                <p class="font-bold text-[#171717]">${item.name}</p>
                <p class="text-sm text-[#f25623] font-semibold">${item.price}$</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="decreaseQuantity(${index})" 
                        class="bg-[#171717] text-white w-8 h-8 rounded-full 
                               hover:bg-[#f25623] transition font-bold">−</button>
                <span class="font-bold w-6 text-center">${item.quantity}</span>
                <button onclick="increaseQuantity(${index})" 
                        class="bg-[#171717] text-white w-8 h-8 rounded-full 
                               hover:bg-[#f25623] transition font-bold">+</button>
                <button onclick="removeFromCart(${index})" 
                        class="bg-red-500 text-white w-8 h-8 rounded-full 
                               hover:bg-red-700 transition font-bold ml-2">✕</button>
            </div>
        </div>
    `).join("");
}

function openCart() {
    const modal = document.getElementById("cartModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
}

function closeCart(event) {
    if (event && event.target.id !== "cartModal") return;
    const modal = document.getElementById("cartModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "auto";
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-5 left-1/2 -translate-x-1/2 
                      bg-[#171717] text-white px-6 py-3 rounded-full 
                      z-200 font-semibold shadow-2xl`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}


function openPayment() {
    if (cart.length === 0) {
        showToast("Your cart is empty!❌");
        return;
    }

    closeCart();

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById("paymentTotal").textContent = total + " $";

    const modal = document.getElementById("paymentModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
}

function closePayment(event) {
    if (event && event.target.id !== "paymentModal") return;
    const modal = document.getElementById("paymentModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "auto";

    document.getElementById("paymentForm").reset();
    document.getElementById("paymentError").classList.add("hidden");
}

function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, "").replace(/[^0-9]/g, "");
    let formatted = value.match(/.{1,4}/g)?.join(" ") || "";
    input.value = formatted.slice(0, 19);
}

function formatExpiry(input) {
    let value = input.value.replace(/[^0-9]/g, "");
    if (value.length >= 2) {
        input.value = value.slice(0, 2) + "/" + value.slice(2, 4);
    } else {
        input.value = value;
    }
}

function processPayment(event) {
    event.preventDefault();

    const name = document.getElementById("cardName").value.trim();
    const number = document.getElementById("cardNumber").value.replace(/\s/g, "");
    const expiry = document.getElementById("cardExpiry").value;
    const cvv = document.getElementById("cardCVV").value;

    if (name.length < 3) {
        showPaymentError("Enter your first and last name!");
        return;
    }
    if (number.length !== 16) {
        showPaymentError("The card number must be 16 digits long!");
        return;
    }
    if (expiry.length !== 5) {
        showPaymentError("The end date must be in MM/DD format!");
        return;
    }
    if (cvv.length !== 3) {
        showPaymentError("The CVV must be 3 digits!");
        return;
    }

    const submitBtn = event.target.querySelector("button[type='submit']");
    submitBtn.textContent = "⏳ In progress...";
    submitBtn.disabled = true;

    setTimeout(() => {
        document.getElementById("paymentModal").classList.add("hidden");
        document.getElementById("paymentModal").classList.remove("flex");

        const orderNum = "#" + Math.floor(10000 + Math.random() * 90000);
        document.getElementById("orderNumber").textContent = orderNum;

        const successModal = document.getElementById("successModal");
        successModal.classList.remove("hidden");
        successModal.classList.add("flex");

        cart = [];
        saveCart();
        updateCartUI();

        submitBtn.textContent = "🔒 Complete the payment";
        submitBtn.disabled = false;
    }, 2000);
}

function showPaymentError(message) {
    const errorMsg = document.getElementById("paymentError");
    errorMsg.textContent = "⚠️ " + message;
    errorMsg.classList.remove("hidden");

    setTimeout(() => {
        errorMsg.classList.add("hidden");
    }, 3000);
}

function closeSuccess() {
    const modal = document.getElementById("successModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "auto";
}


document.addEventListener("DOMContentLoaded", updateCartUI);