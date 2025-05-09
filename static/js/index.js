document.addEventListener("DOMContentLoaded", function() {
    const cartItemsContainer = document.getElementById("cart-items");
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const logoutBtn = document.getElementById("logout-btn");
    const authRequiredPages = ['/home/profile/', '/home/basket/'];
    
    let isAuthenticated = false;
    let csrfToken = null;

    function checkAuthStatus() {
        const authStatusElement = document.getElementById("auth-status");
        if (authStatusElement && authStatusElement.dataset.authenticated === "True") {
            isAuthenticated = true;
            csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
            enableProtectedFeatures();
            restoreCartState();
            loadCartFromServer();
        }
    }

    function enableProtectedFeatures() {
        document.querySelectorAll(".auth-only").forEach(el => {
            el.style.display = "block";
        });
    }

    function restoreCartState() {
        const cart = JSON.parse(localStorage.getItem("cart")) || {};
        
        document.querySelectorAll(".buy-button").forEach(button => {
            const productName = button.getAttribute("data-product");
            if (cart[productName]) {
                const parent = button.closest(".blocks");
                if (!parent) return;
                
                button.style.display = "none";
                const counter = parent.querySelector(".counter");
                if (counter) counter.style.display = "flex";
                const counterValue = parent.querySelector(".counter-value");
                if (counterValue) counterValue.textContent = cart[productName].quantity;
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            syncCartWithServer(JSON.parse(localStorage.getItem("cart") || '{}'));
            localStorage.removeItem("cart");
            window.location.href = this.href;
        });
    }

    function checkAuthInPages() {
        if (!isAuthenticated && authRequiredPages.includes(window.location.pathname)) {
            showModal(loginModal);
        }
    }

    function updateCart(productName, productPrice, quantity, productImage) {
        if (!isAuthenticated) {
            showModal(loginModal);
            return false;
        }
    
        const cart = JSON.parse(localStorage.getItem("cart")) || {};
    
        if (quantity > 0) {
            cart[productName] = {
                price: productPrice,
                quantity,
                image: productImage
            };
        } else {
            delete cart[productName];
        }
    
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
        syncCartWithServer(cart);
        return true;
    }

    async function syncCartWithServer(cartData) {
        if (!csrfToken) return;

        try {
            const response = await fetch('/home/api/basket/update/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ cart: cartData })
            });

            if (!response.ok) throw new Error('Ошибка синхронизации');
        } catch (error) {
            console.error('Ошибка синхронизации корзины:', error);
        }
    }

    async function loadCartFromServer() {
        if (!csrfToken) return;
    
        try {
            const response = await fetch('/home/api/basket/get/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });
    
            if (!response.ok) throw new Error('Ошибка загрузки корзины');
    
            const data = await response.json();
    
            if (data.cart && typeof data.cart === 'object') {
                localStorage.setItem('cart', JSON.stringify(data.cart));
                loadCart();
                restoreCartState();
            }
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
        }
    }    

    function loadCart() {
        if (!cartItemsContainer) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    cartItemsContainer.innerHTML = "";

    if (!isAuthenticated) {
        cartItemsContainer.innerHTML = "<p>Авторизуйтесь для доступа к корзине</p>";
        return;
    }

    if (Object.keys(cart).length === 0) {
        cartItemsContainer.innerHTML = "<p>Корзина пуста</p>";
        const totalPriceElement = document.getElementById("total-price");
        if (totalPriceElement) totalPriceElement.textContent = "Итого: 0 ₽";
        const totalItemsCount = document.getElementById("total-items-count");
        if (totalItemsCount) totalItemsCount.textContent = "0";
        return;
    }

    let totalPrice = 0;
    let totalItems = 0;

    for (const product in cart) {
        const item = cart[product];
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image || 'путь-к-изображению-по-умолчанию'}" alt="${product}">
            </div>
            <div class="cart-item-name">${product}</div>
            <div class="cart-item-quantity">
                <button class="quantity-minus" data-product="${product}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-plus" data-product="${product}">+</button>
            </div>
            <div class="cart-item-price">${item.price * item.quantity} ₽</div>
        `;
        cartItemsContainer.appendChild(div);
        totalPrice += item.price * item.quantity;
        totalItems += item.quantity;
    }

    const totalPriceElement = document.getElementById("total-price");
    if (totalPriceElement) totalPriceElement.textContent = `Итого: ${totalPrice} ₽`;

    const totalItemsCount = document.getElementById("total-items-count");
    if (totalItemsCount) totalItemsCount.textContent = totalItems;

    document.querySelectorAll(".quantity-minus").forEach(button => {
        button.addEventListener("click", function () {
            const productName = this.getAttribute("data-product");
            const cart = JSON.parse(localStorage.getItem("cart")) || {};
            if (cart[productName]) {
                const item = cart[productName];
                const newQuantity = item.quantity - 1;
                updateCart(productName, item.price, newQuantity, item.image);
            }
        });
    });

    document.querySelectorAll(".quantity-plus").forEach(button => {
        button.addEventListener("click", function () {
            const productName = this.getAttribute("data-product");
            const cart = JSON.parse(localStorage.getItem("cart")) || {};
            if (cart[productName]) {
                const item = cart[productName];
                updateCart(productName, item.price, item.quantity + 1, item.image);
            }
        });
    });
    }

    function showModal(modal) {
        if (modal) modal.style.alignItems = "center";
        const background = document.getElementById('loginModal_background');
        if (background) background.style.display = "flex";
        modal.style.justifyContent = "center";
        modal.style.display = "flex";
        const modalContent = modal.querySelector('.modal-content');
        modalContent.classList.add('animate__animated', 'animate__fadeInDown');
    }

    function hideModal(modal) {
        if (modal) modal.style.display = "none";
        const background = document.getElementById('loginModal_background');
        if (background) background.style.display = "none";
    }

    function initModals() {
        document.querySelectorAll(".close").forEach(btn => {
            btn.addEventListener("click", function() {
                hideModal(this.closest(".modal"));
            });
        });

        document.getElementById("showRegister")?.addEventListener("click", function(e) {
            e.preventDefault();
            hideModal(loginModal);
            showModal(registerModal);
        });

        document.getElementById("showLogin")?.addEventListener("click", function(e) {
            e.preventDefault();
            hideModal(registerModal);
            showModal(loginModal);
        });
    }

    function initProductButtons() {
        document.querySelectorAll(".buy-button").forEach(button => {
            button.addEventListener("click", function () {
                const parent = this.closest(".blocks");
                if (!parent) return;
    
                const productName = this.getAttribute("data-product");
                const productPrice = parseInt(this.getAttribute("data-price"));
                const productImage = this.getAttribute("data-image");
    
                if (!productName || isNaN(productPrice)) return;
                if (!isAuthenticated) {
                    showModal(loginModal);
                    return;
                }
    
                this.style.display = "none";
                const counter = parent.querySelector(".counter");
                if (counter) counter.style.display = "flex";
                const counterValue = parent.querySelector(".counter-value");
                if (counterValue) counterValue.textContent = "1";
    
                updateCart(productName, productPrice, 1, productImage);
            });
        });
    
        document.querySelectorAll(".counter-minus").forEach(button => {
            button.addEventListener("click", function () {
                const parent = this.closest(".blocks");
                if (!parent) return;
    
                const buyButton = parent.querySelector(".buy-button");
                const counter = parent.querySelector(".counter");
                const counterValue = parent.querySelector(".counter-value");
                if (!buyButton || !counter || !counterValue) return;
    
                const productName = buyButton.getAttribute("data-product");
                const productPrice = parseInt(buyButton.getAttribute("data-price"));
                const productImage = buyButton.getAttribute("data-image");
    
                let count = parseInt(counterValue.textContent, 10);
                if (count > 1) {
                    counterValue.textContent = count - 1;
                    updateCart(productName, productPrice, count - 1, productImage);
                } else {
                    updateCart(productName, productPrice, 0, productImage);
                    counter.style.display = "none";
                    buyButton.style.display = "inline-block";
                }
            });
        });
    
        document.querySelectorAll(".counter-plus").forEach(button => {
            button.addEventListener("click", function () {
                const parent = this.closest(".blocks");
                if (!parent) return;
    
                const buyButton = parent.querySelector(".buy-button");
                const counterValue = parent.querySelector(".counter-value");
                if (!buyButton || !counterValue) return;
    
                const productName = buyButton.getAttribute("data-product");
                const productPrice = parseInt(buyButton.getAttribute("data-price"));
                const productImage = buyButton.getAttribute("data-image");
    
                const count = parseInt(counterValue.textContent, 10) + 1;
                counterValue.textContent = count;
                updateCart(productName, productPrice, count, productImage);
            });
        });
    }

    function initProtectedLinks() {
        document.querySelectorAll('.auth-required').forEach(el => {
            el.addEventListener("click", function(e) {
                if (!isAuthenticated) {
                    e.preventDefault();
                    e.stopPropagation();
                    showModal(loginModal);
                }
            });
        });
    }

    checkAuthStatus();
    checkAuthInPages()
    initModals();
    initProductButtons();
    initProtectedLinks();
    loadCart();
});
