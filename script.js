document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
            menu.classList.toggle('open');

            const icon = this.querySelector('i');
            if (menu.classList.contains('hidden')) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }
        });
    }

    // Cart functionality
    let cart = [];

    // Load cart from localStorage
    function loadCart() {
        try {
            const storedCart = localStorage.getItem('shoppingCart');
            cart = storedCart ? JSON.parse(storedCart) : [];
        } catch (e) {
            console.error('Error loading cart:', e);
            cart = [];
        }
    }

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    // Update cart count display
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.classList.toggle('hidden', count === 0);
            el.classList.toggle('inline-flex', count > 0);
        });
    }

    // Add item to cart
    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        saveCart();
        updateCartCount();
    }

    // Render cart items on cart page
    function renderCartItems() {
        const container = document.getElementById('cart-items-container');
        const emptyMsg = document.getElementById('empty-cart-message');
        const checkoutSection = document.getElementById('cart-checkout-section');
        const totalElement = document.getElementById('cart-total');

        if (!container) return;

        container.innerHTML = '';

        if (cart.length === 0) {
            if (emptyMsg) emptyMsg.style.display = 'block';
            if (checkoutSection) checkoutSection.style.display = 'none';
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';
        if (checkoutSection) checkoutSection.style.display = 'block';

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center justify-between border-b py-4';
            itemElement.innerHTML = `
                <div class="flex items-center space-x-4">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md">
                    <div>
                        <h3 class="font-semibold">${item.name}</h3>
                        <p class="text-gray-600">$${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <input type="number" value="${item.quantity}" min="1" 
                           class="quantity-input w-16 p-1 border rounded text-center"
                           data-id="${item.id}">
                    <button class="remove-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                            data-id="${item.id}">
                        Remove
                    </button>
                </div>
            `;
            container.appendChild(itemElement);
        });

        if (totalElement) {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            totalElement.textContent = `$${total.toFixed(2)}`;
        }

        // Add event listeners for quantity changes and removal
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const newQty = parseInt(e.target.value);
                const item = cart.find(i => i.id === id);
                
                if (item && newQty > 0) {
                    item.quantity = newQty;
                    saveCart();
                    renderCartItems();
                    updateCartCount();
                } else if (newQty < 1) {
                    cart = cart.filter(i => i.id !== id);
                    saveCart();
                    renderCartItems();
                    updateCartCount();
                }
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                cart = cart.filter(i => i.id !== e.target.dataset.id);
                saveCart();
                renderCartItems();
                updateCartCount();
            });
        });
    }

    // Handle checkout navigation
    function handleCheckout() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Save the cart and navigate to checkout page
        saveCart();
        window.location.href = 'checkout page.html';
    }

    // Render order summary on checkout page
    function renderOrderSummary() {
        const orderItemsContainer = document.getElementById('order-items');
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        const shippingElement = document.getElementById('shipping');
        
        if (!orderItemsContainer) return;

        orderItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            orderItemsContainer.innerHTML = '<p class="text-gray-500">Your cart is empty</p>';
            subtotalElement.textContent = '$0.00';
            totalElement.textContent = '$0.00';
            return;
        }

        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'flex justify-between items-start';
            itemElement.innerHTML = `
                <div class="flex items-center space-x-3">
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded">
                    <div>
                        <p class="font-medium">${item.name}</p>
                        <p class="text-sm text-gray-500">Qty: ${item.quantity}</p>
                    </div>
                </div>
                <p class="font-medium">$${itemTotal.toFixed(2)}</p>
            `;
            orderItemsContainer.appendChild(itemElement);
        });

        const shipping = 5.00;
        const total = subtotal + shipping;
        
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        shippingElement.textContent = `$${shipping.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Initialize cart
    loadCart();
    updateCartCount();
    
    // Check if we're on the cart page and render items
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
    }

    // Check if we're on the checkout page
    if (window.location.pathname.includes('checkout')) {
        renderOrderSummary();
    }

    // Add event listeners
    document.addEventListener('click', (e) => {
        // Add to cart button
        if (e.target.closest('.add-to-cart-btn')) {
            const btn = e.target.closest('.add-to-cart-btn');
            const product = {
                id: btn.dataset.productId,
                name: btn.dataset.productName,
                price: parseFloat(btn.dataset.productPrice),
                image: btn.dataset.productImage || 
                     btn.closest('.product-item')?.querySelector('img')?.src || ''
            };
            addToCart(product);
        }
        
        // Checkout button
        if (e.target.closest('#checkout-btn')) {
            handleCheckout();
        }
    });
});