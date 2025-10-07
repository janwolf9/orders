// Global variables
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000/api' 
  : '/api';
let currentUser = null;
let authToken = localStorage.getItem('authToken');
let currentPage = 1;
let currentProductsPage = 1;
let currentOrdersPage = 1;
let currentReviewsPage = 1;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    
    if (authToken) {
        verifyToken();
    } else {
        showSection('login');
    }
    
    // Add event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Product form
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    
    // Order form
    document.getElementById('orderForm').addEventListener('submit', handleOrderSubmit);
    
    // Review form
    document.getElementById('reviewForm').addEventListener('submit', handleReviewSubmit);
    
    // Checkout form
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckoutSubmit);
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    showLoading(true);
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            
            updateNavigation();
            showSection('dashboard');
            loadDashboardData();
            showAlert('Login successful!', 'success');
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    showLoading(true);
    
    const formData = {
        firstName: document.getElementById('registerFirstName').value,
        lastName: document.getElementById('registerLastName').value,
        username: document.getElementById('registerUsername').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value
    };
    
    console.log('Registration form data:', formData); // Debug log
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            
            updateNavigation();
            showSection('dashboard');
            loadDashboardData();
            showAlert('Registration successful!', 'success');
        } else {
            showAlert(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function verifyToken() {
    if (!authToken) return false;
    
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateNavigation();
            showSection('dashboard');
            loadDashboardData();
            return true;
        } else {
            logout();
            return false;
        }
    } catch (error) {
        console.error('Token verification error:', error);
        logout();
        return false;
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    updateNavigation();
    showSection('login');
    showAlert('Logged out successfully', 'success');
}

// Navigation functions
function updateNavigation() {
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    
    if (currentUser) {
        navAuth.style.display = 'none';
        navUser.style.display = 'flex';
        document.getElementById('navUsername').textContent = currentUser.username;
        
        // Show/hide admin links and buttons based on role
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = currentUser.role === 'admin' ? 'block' : 'none';
        });
        
        loadCart(); // Load cart when user is authenticated
    } else {
        navAuth.style.display = 'flex';
        navUser.style.display = 'none';
        
        // Hide admin elements when not logged in
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = 'none';
        });
        
        updateCartUI(); // Hide cart when not authenticated
    }
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show requested section
    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.add('active');
        
        // Load data based on section
        switch (sectionName) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'products':
                loadProducts();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'reviews':
                loadReviews();
                break;
            case 'cart':
                displayCartItems();
                break;
            case 'admin':
                if (currentUser && currentUser.role === 'admin') {
                    loadAllOrders();
                } else {
                    showAlert('Admin access required', 'error');
                    showSection('dashboard');
                }
                break;
        }
    }
}

// Dashboard functions
async function loadDashboardData() {
    if (!authToken) return;
    
    try {
        // Load dashboard statistics (these would be separate endpoints in a real app)
        const [productsRes, ordersRes, reviewsRes] = await Promise.all([
            fetch(`${API_BASE}/products?limit=1`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }),
            fetch(`${API_BASE}/orders?limit=1`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }),
            fetch(`${API_BASE}/reviews?limit=1`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
        ]);
        
        if (productsRes.ok) {
            const productsData = await productsRes.json();
            document.getElementById('totalProducts').textContent = productsData.pagination?.totalProducts || 0;
        }
        
        if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            document.getElementById('totalOrders').textContent = ordersData.pagination?.totalOrders || 0;
        }
        
        if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            document.getElementById('totalReviews').textContent = reviewsData.pagination?.totalReviews || 0;
        }
        
        // For users count, we would need an admin endpoint
        document.getElementById('totalUsers').textContent = currentUser?.role === 'admin' ? '50+' : '1';
        
    } catch (error) {
        console.error('Dashboard loading error:', error);
    }
}

// Products functions
async function loadProducts(page = 1, filters = {}) {
    if (!authToken) return;
    
    showLoading(true);
    currentProductsPage = page;
    
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '12',
            ...filters
        });
        
        const response = await fetch(`${API_BASE}/products?${params}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayProducts(data.products);
            displayProductsPagination(data.pagination);
        } else {
            showAlert('Failed to load products', 'error');
        }
    } catch (error) {
        console.error('Products loading error:', error);
        showAlert('Network error loading products', 'error');
    } finally {
        showLoading(false);
    }
}

function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (!products || products.length === 0) {
        grid.innerHTML = '<p class="text-center">No products found.</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.images && product.images.length > 0 
                    ? `<img src="${API_BASE.replace('/api', '')}${product.images[0]}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                    : '<i class="fas fa-image fa-3x"></i>'
                }
            </div>
            <div class="product-info">
                <div class="product-name clickable" onclick="showProductDetails('${product._id}')">${product.name}</div>
                <div class="product-price">€${product.price.toFixed(2)}</div>
                <div class="product-description">${product.description.substring(0, 100)}...</div>
                <div style="margin-bottom: 1rem;">
                    <small><strong>Category:</strong> ${product.category}</small><br>
                    <small><strong>Brand:</strong> ${product.brand}</small><br>
                    <small><strong>Stock:</strong> ${product.stock}</small>
                </div>
                <div class="product-actions">
                    <button class="btn btn-secondary btn-small" onclick="showProductDetails('${product._id}')">View Details</button>
                    <button class="btn btn-success" onclick="addToCart('${product._id}', 1)">Add to Cart</button>
                    ${currentUser && currentUser.role === 'admin' ? 
                        `<button class="btn btn-primary btn-small" onclick="editProduct('${product._id}')">Edit</button>
                         <button class="btn btn-danger btn-small" onclick="deleteProduct('${product._id}')">Delete</button>` : 
                        ''
                    }
                </div>
            </div>
        </div>
    `).join('');
}

function displayProductsPagination(pagination) {
    const container = document.getElementById('productsPagination');
    
    if (!pagination || pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    if (pagination.hasPrev) {
        html += `<button onclick="loadProducts(${pagination.currentPage - 1})">Previous</button>`;
    }
    
    // Page numbers
    for (let i = Math.max(1, pagination.currentPage - 2); 
         i <= Math.min(pagination.totalPages, pagination.currentPage + 2); 
         i++) {
        html += `<button class="${i === pagination.currentPage ? 'active' : ''}" onclick="loadProducts(${i})">${i}</button>`;
    }
    
    // Next button
    if (pagination.hasNext) {
        html += `<button onclick="loadProducts(${pagination.currentPage + 1})">Next</button>`;
    }
    
    container.innerHTML = html;
}

// Product CRUD functions
function showProductModal(productId = null) {
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
        showAlert('Admin access required for product management', 'error');
        return;
    }
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');
    
    form.reset();
    document.getElementById('productId').value = productId || '';
    
    if (productId) {
        title.textContent = 'Edit Product';
        loadProductData(productId);
    } else {
        title.textContent = 'Add Product';
    }
    
    modal.style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

async function loadProductData(productId) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const product = data.product;
            
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productBrand').value = product.brand;
            document.getElementById('productTags').value = product.tags ? product.tags.join(', ') : '';
        }
    } catch (error) {
        console.error('Load product error:', error);
        showAlert('Failed to load product data', 'error');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    showLoading(true);
    
    const productId = document.getElementById('productId').value;
    const isEdit = !!productId;
    
    const formData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        category: document.getElementById('productCategory').value,
        brand: document.getElementById('productBrand').value,
        tags: document.getElementById('productTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    try {
        const url = isEdit ? `${API_BASE}/products/${productId}` : `${API_BASE}/products`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeProductModal();
            loadProducts(currentProductsPage);
            showAlert(`Product ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        } else {
            showAlert(data.message || 'Failed to save product', 'error');
        }
    } catch (error) {
        console.error('Product submit error:', error);
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function editProduct(productId) {
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
        showAlert('Admin access required for product management', 'error');
        return;
    }
    showProductModal(productId);
}

async function deleteProduct(productId) {
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
        showAlert('Admin access required for product management', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadProducts(currentProductsPage);
            showAlert('Product deleted successfully!', 'success');
            return true;
        } else {
            const data = await response.json();
            showAlert(data.message || 'Failed to delete product', 'error');
            return false;
        }
        return false;
    } catch (error) {
        console.error('Delete product error:', error);
        showAlert('Network error. Please try again.', 'error');
        return false;
    } finally {
        showLoading(false);
    }
}

// Search and filter functions
function searchProducts() {
    const searchTerm = document.getElementById('searchProducts').value;
    const category = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('priceSort').value;
    
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (category) filters.category = category;
    if (sortBy) {
        filters.sortBy = 'price';
        filters.sortOrder = sortBy;
    }
    
    loadProducts(1, filters);
}

function filterProducts() {
    searchProducts(); // Reuse the same logic
}

function sortProducts() {
    searchProducts(); // Reuse the same logic
}

// Orders functions
async function loadOrders(page = 1, filters = {}) {
    if (!authToken) return;
    
    showLoading(true);
    currentOrdersPage = page;
    
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '10',
            ...filters
        });
        
        const response = await fetch(`${API_BASE}/orders?${params}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayOrders(data.orders);
            displayOrdersPagination(data.pagination);
        } else {
            showAlert('Failed to load orders', 'error');
        }
    } catch (error) {
        console.error('Orders loading error:', error);
        showAlert('Network error loading orders', 'error');
    } finally {
        showLoading(false);
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersTable');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="text-center">No orders found.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Items</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>${order.orderNumber}</td>
                            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                            <td>€${order.totalAmount.toFixed(2)}</td>
                            <td>${order.items.length} items</td>
                            <td>
                                <button class="btn btn-primary" onclick="viewOrder('${order._id}')">View</button>
                                ${order.status === 'pending' || order.status === 'confirmed' ? 
                                    `<button class="btn btn-danger" onclick="cancelOrder('${order._id}')">Cancel</button>` : 
                                    ''
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function displayOrdersPagination(pagination) {
    const container = document.getElementById('ordersPagination');
    
    if (!pagination || pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    if (pagination.hasPrev) {
        html += `<button onclick="loadOrders(${pagination.currentPage - 1})">Previous</button>`;
    }
    
    for (let i = Math.max(1, pagination.currentPage - 2); 
         i <= Math.min(pagination.totalPages, pagination.currentPage + 2); 
         i++) {
        html += `<button class="${i === pagination.currentPage ? 'active' : ''}" onclick="loadOrders(${i})">${i}</button>`;
    }
    
    if (pagination.hasNext) {
        html += `<button onclick="loadOrders(${pagination.currentPage + 1})">Next</button>`;
    }
    
    container.innerHTML = html;
}

function filterOrders() {
    const status = document.getElementById('statusFilter').value;
    const filters = {};
    if (status) filters.status = status;
    loadOrders(1, filters);
}

// Order modal functions
async function showOrderModal() {
    const modal = document.getElementById('orderModal');
    await loadProductsForOrder();
    modal.style.display = 'block';
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.getElementById('orderForm').reset();
}

async function loadProductsForOrder() {
    try {
        const response = await fetch(`${API_BASE}/products?limit=50`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayProductsForOrder(data.products);
        }
    } catch (error) {
        console.error('Load products for order error:', error);
    }
}

function displayProductsForOrder(products) {
    const container = document.getElementById('orderProducts');
    
    container.innerHTML = products.map(product => `
        <div class="order-item">
            <div>
                <strong>${product.name}</strong> - €${product.price.toFixed(2)}
                <br><small>Stock: ${product.stock}</small>
            </div>
            <div>
                <label>
                    <input type="checkbox" name="selectedProducts" value="${product._id}" data-price="${product.price}" data-name="${product.name}" onchange="updateOrderTotal()">
                    Add to order
                </label>
                <input type="number" min="1" max="${product.stock}" value="1" onchange="updateOrderTotal()" style="display: none;">
            </div>
        </div>
    `).join('');
}

function updateOrderTotal() {
    const checkboxes = document.querySelectorAll('input[name="selectedProducts"]:checked');
    let total = 0;
    
    checkboxes.forEach(checkbox => {
        const price = parseFloat(checkbox.dataset.price);
        const quantityInput = checkbox.parentElement.parentElement.querySelector('input[type="number"]');
        const quantity = parseInt(quantityInput.value) || 1;
        total += price * quantity;
        
        // Show/hide quantity input
        if (checkbox.checked) {
            quantityInput.style.display = 'inline-block';
        } else {
            quantityInput.style.display = 'none';
        }
    });
    
    document.getElementById('orderTotal').textContent = total.toFixed(2);
}

function toggleBillingAddress() {
    const sameAsShipping = document.getElementById('sameAsShipping').checked;
    const billingFields = document.getElementById('billingAddressFields');
    
    if (sameAsShipping) {
        billingFields.style.display = 'none';
        // Copy shipping address to billing
        document.getElementById('billingStreet').value = document.getElementById('shippingStreet').value;
        document.getElementById('billingCity').value = document.getElementById('shippingCity').value;
        document.getElementById('billingPostal').value = document.getElementById('shippingPostal').value;
        document.getElementById('billingCountry').value = document.getElementById('shippingCountry').value;
    } else {
        billingFields.style.display = 'block';
    }
}

async function handleOrderSubmit(e) {
    e.preventDefault();
    showLoading(true);
    
    const selectedProducts = document.querySelectorAll('input[name="selectedProducts"]:checked');
    
    if (selectedProducts.length === 0) {
        showAlert('Please select at least one product', 'error');
        showLoading(false);
        return;
    }
    
    const items = Array.from(selectedProducts).map(checkbox => {
        const quantityInput = checkbox.parentElement.parentElement.querySelector('input[type="number"]');
        return {
            product: checkbox.value,
            quantity: parseInt(quantityInput.value) || 1
        };
    });
    
    const orderData = {
        items,
        shippingAddress: {
            street: document.getElementById('shippingStreet').value,
            city: document.getElementById('shippingCity').value,
            postalCode: document.getElementById('shippingPostal').value,
            country: document.getElementById('shippingCountry').value
        },
        billingAddress: {
            street: document.getElementById('billingStreet').value,
            city: document.getElementById('billingCity').value,
            postalCode: document.getElementById('billingPostal').value,
            country: document.getElementById('billingCountry').value
        },
        paymentMethod: document.getElementById('paymentMethod').value,
        notes: document.getElementById('orderNotes').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeOrderModal();
            loadOrders(currentOrdersPage);
            showAlert('Order created successfully!', 'success');
        } else {
            showAlert(data.message || 'Failed to create order', 'error');
        }
    } catch (error) {
        console.error('Order submit error:', error);
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function viewOrder(orderId) {
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const order = data.order;
            
            alert(`Order Details:\n\nOrder #: ${order.orderNumber}\nStatus: ${order.status}\nTotal: €${order.totalAmount.toFixed(2)}\nItems: ${order.items.length}\nDate: ${new Date(order.createdAt).toLocaleDateString()}`);
        } else {
            showAlert('Failed to load order details', 'error');
        }
    } catch (error) {
        console.error('View order error:', error);
        showAlert('Network error', 'error');
    }
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadOrders(currentOrdersPage);
            showAlert('Order cancelled successfully!', 'success');
        } else {
            const data = await response.json();
            showAlert(data.message || 'Failed to cancel order', 'error');
        }
    } catch (error) {
        console.error('Cancel order error:', error);
        showAlert('Network error', 'error');
    }
}

// Reviews functions
async function loadReviews(page = 1, filters = {}) {
    if (!authToken) return;
    
    showLoading(true);
    currentReviewsPage = page;
    
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '10',
            ...filters
        });
        
        const response = await fetch(`${API_BASE}/reviews?${params}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayReviews(data.reviews);
            displayReviewsPagination(data.pagination);
        } else {
            showAlert('Failed to load reviews', 'error');
        }
    } catch (error) {
        console.error('Reviews loading error:', error);
        showAlert('Network error loading reviews', 'error');
    } finally {
        showLoading(false);
    }
}

function displayReviews(reviews) {
    const container = document.getElementById('reviewsContainer');
    
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p class="text-center">No reviews found.</p>';
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div>
                    <strong>${review.user.firstName} ${review.user.lastName}</strong>
                    ${review.verified ? '<span style="color: #28a745;">✓ Verified</span>' : ''}
                    <div class="review-rating">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                </div>
                <small>${new Date(review.createdAt).toLocaleDateString()}</small>
            </div>
            <div class="review-content">
                <div class="review-title"><strong>${review.title}</strong></div>
                <p>${review.comment}</p>
                ${review.product ? `<small>Product: ${review.product.name}</small>` : ''}
            </div>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <button class="btn btn-secondary" onclick="markHelpful('${review._id}')">
                    Helpful (${review.helpful})
                </button>
                ${currentUser && review.user._id === currentUser.id ? 
                    `<button class="btn btn-primary" onclick="editReview('${review._id}')">Edit</button>` : 
                    ''
                }
                ${currentUser && (review.user._id === currentUser.id || currentUser.role === 'admin') ? 
                    `<button class="btn btn-danger" onclick="deleteReview('${review._id}')">Delete</button>` : 
                    ''
                }
            </div>
        </div>
    `).join('');
}

function displayReviewsPagination(pagination) {
    const container = document.getElementById('reviewsPagination');
    
    if (!pagination || pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    if (pagination.hasPrev) {
        html += `<button onclick="loadReviews(${pagination.currentPage - 1})">Previous</button>`;
    }
    
    for (let i = Math.max(1, pagination.currentPage - 2); 
         i <= Math.min(pagination.totalPages, pagination.currentPage + 2); 
         i++) {
        html += `<button class="${i === pagination.currentPage ? 'active' : ''}" onclick="loadReviews(${i})">${i}</button>`;
    }
    
    if (pagination.hasNext) {
        html += `<button onclick="loadReviews(${pagination.currentPage + 1})">Next</button>`;
    }
    
    container.innerHTML = html;
}

async function markHelpful(reviewId) {
    try {
        const response = await fetch(`${API_BASE}/reviews/${reviewId}/helpful`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadReviews(currentReviewsPage);
            showAlert('Review marked as helpful!', 'success');
        } else {
            showAlert('Failed to mark review as helpful', 'error');
        }
    } catch (error) {
        console.error('Mark helpful error:', error);
        showAlert('Network error', 'error');
    }
}

async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadReviews(currentReviewsPage);
            showAlert('Review deleted successfully!', 'success');
        } else {
            const data = await response.json();
            showAlert(data.message || 'Failed to delete review', 'error');
        }
    } catch (error) {
        console.error('Delete review error:', error);
        showAlert('Network error', 'error');
    }
}

// Utility functions
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'flex' : 'none';
}

function showAlert(message, type = 'info') {
    // Remove existing alerts
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert at the top of the active section
    const activeSection = document.querySelector('.section.active');
    if (activeSection) {
        activeSection.insertBefore(alert, activeSection.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Review modal functions
async function showReviewModal(reviewId = null) {
    const modal = document.getElementById('reviewModal');
    const title = document.getElementById('reviewModalTitle');
    const form = document.getElementById('reviewForm');
    
    form.reset();
    document.getElementById('reviewId').value = reviewId || '';
    
    if (reviewId) {
        title.textContent = 'Edit Review';
        await loadReviewData(reviewId);
    } else {
        title.textContent = 'Add Review';
        await loadProductsForReview();
    }
    
    modal.style.display = 'block';
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

async function loadProductsForReview() {
    try {
        const response = await fetch(`${API_BASE}/products?limit=50`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const select = document.getElementById('reviewProduct');
            
            select.innerHTML = '<option value="">Select Product</option>';
            data.products.forEach(product => {
                select.innerHTML += `<option value="${product._id}">${product.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Load products for review error:', error);
    }
}

async function loadReviewData(reviewId) {
    try {
        const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const review = data.review;
            
            document.getElementById('reviewProduct').value = review.product._id;
            document.querySelector(`input[name="reviewRating"][value="${review.rating}"]`).checked = true;
            document.getElementById('reviewTitle').value = review.title;
            document.getElementById('reviewComment').value = review.comment;
        }
    } catch (error) {
        console.error('Load review error:', error);
        showAlert('Failed to load review data', 'error');
    }
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    showLoading(true);
    
    const reviewId = document.getElementById('reviewId').value;
    const isEdit = !!reviewId;
    
    const rating = document.querySelector('input[name="reviewRating"]:checked');
    if (!rating) {
        showAlert('Please select a rating', 'error');
        showLoading(false);
        return;
    }
    
    const formData = {
        product: document.getElementById('reviewProduct').value,
        rating: parseInt(rating.value),
        title: document.getElementById('reviewTitle').value,
        comment: document.getElementById('reviewComment').value
    };
    
    // Handle images if uploaded
    const imageFiles = document.getElementById('reviewImages').files;
    if (imageFiles.length > 0) {
        try {
            const images = await uploadReviewImages(imageFiles);
            formData.images = images;
        } catch (error) {
            showAlert('Failed to upload images', 'error');
            showLoading(false);
            return;
        }
    }
    
    try {
        const url = isEdit ? `${API_BASE}/reviews/${reviewId}` : `${API_BASE}/reviews`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeReviewModal();
            loadReviews(currentReviewsPage);
            showAlert(`Review ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        } else {
            showAlert(data.message || 'Failed to save review', 'error');
        }
    } catch (error) {
        console.error('Review submit error:', error);
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function uploadReviewImages(files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    
    const response = await fetch(`${API_BASE}/upload/multiple`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData
    });
    
    if (response.ok) {
        const data = await response.json();
        return data.files.map(file => file.url);
    } else {
        throw new Error('Upload failed');
    }
}

function editReview(reviewId) {
    showReviewModal(reviewId);
}

// Cart functions
let currentCart = null;

// Load cart when user logs in
async function loadCart() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentCart = data.cart;
            updateCartUI();
        }
    } catch (error) {
        console.error('Load cart error:', error);
    }
}

// Update cart UI elements
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const navCart = document.getElementById('navCart');
    
    if (currentCart && currentUser) {
        navCart.style.display = 'block';
        cartCount.textContent = currentCart.totalItems || 0;
        cartCount.style.display = currentCart.totalItems > 0 ? 'inline' : 'none';
    } else {
        navCart.style.display = 'none';
    }
}

// Add item to cart
async function addToCart(productId, quantity = 1) {
    if (!authToken) {
        showAlert('Please login to add items to cart', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ productId, quantity })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentCart = data.cart;
            updateCartUI();
            showAlert('Item added to cart!', 'success');
        } else {
            showAlert(data.message || 'Failed to add item to cart', 'error');
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Display cart items
function displayCartItems() {
    const container = document.getElementById('cartItems');
    const summary = document.getElementById('cartSummary');
    const clearBtn = document.getElementById('clearCartBtn');
    
    if (!currentCart || currentCart.items.length === 0) {
        container.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart fa-3x"></i><p>Your cart is empty</p><button onclick="showSection(\'products\')" class="btn btn-primary">Start Shopping</button></div>';
        summary.style.display = 'none';
        clearBtn.style.display = 'none';
        return;
    }
    
    container.innerHTML = currentCart.items.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                ${item.product.images && item.product.images.length > 0 
                    ? `<img src="${API_BASE.replace('/api', '')}${item.product.images[0]}" alt="${item.product.name}">`
                    : '<i class="fas fa-image fa-2x"></i>'
                }
            </div>
            <div class="cart-item-details">
                <h4>${item.product.name}</h4>
                <p class="cart-item-price">€${item.price.toFixed(2)} each</p>
                <p class="cart-item-stock">Stock: ${item.product.stock}</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button onclick="updateCartQuantity('${item._id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartQuantity('${item._id}', ${item.quantity + 1})" ${item.quantity >= item.product.stock ? 'disabled' : ''}>+</button>
                </div>
                <p class="item-total">€${(item.price * item.quantity).toFixed(2)}</p>
                <button onclick="removeFromCart('${item._id}')" class="btn btn-danger btn-small">Remove</button>
            </div>
        </div>
    `).join('');
    
    // Update summary
    document.getElementById('summaryTotalItems').textContent = currentCart.totalItems;
    document.getElementById('summaryTotalAmount').textContent = `€${currentCart.totalAmount.toFixed(2)}`;
    
    summary.style.display = 'block';
    clearBtn.style.display = 'block';
}

// Update cart item quantity
async function updateCartQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/cart/update/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ quantity: newQuantity })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentCart = data.cart;
            updateCartUI();
            displayCartItems();
        } else {
            showAlert(data.message || 'Failed to update cart', 'error');
        }
    } catch (error) {
        console.error('Update cart error:', error);
        showAlert('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

// Remove item from cart
async function removeFromCart(itemId) {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentCart = data.cart;
            updateCartUI();
            displayCartItems();
            showAlert('Item removed from cart', 'success');
        } else {
            showAlert(data.message || 'Failed to remove item', 'error');
        }
    } catch (error) {
        console.error('Remove from cart error:', error);
        showAlert('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

// Clear entire cart
async function clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/cart/clear`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentCart = data.cart;
            updateCartUI();
            displayCartItems();
            showAlert('Cart cleared', 'success');
        } else {
            showAlert('Failed to clear cart', 'error');
        }
    } catch (error) {
        console.error('Clear cart error:', error);
        showAlert('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

// Checkout modal functions
function showCheckoutModal() {
    if (!currentCart || currentCart.items.length === 0) {
        showAlert('Your cart is empty', 'error');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    displayCheckoutItems();
    modal.style.display = 'block';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
    document.getElementById('checkoutForm').reset();
}

function displayCheckoutItems() {
    const container = document.getElementById('checkoutItems');
    const totalSpan = document.getElementById('checkoutTotal');
    
    container.innerHTML = currentCart.items.map(item => `
        <div class="checkout-item">
            <span>${item.product.name} × ${item.quantity}</span>
            <span>€${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    totalSpan.textContent = currentCart.totalAmount.toFixed(2);
}

function toggleCheckoutBillingAddress() {
    const sameAsShipping = document.getElementById('checkoutSameAsShipping').checked;
    const billingFields = document.getElementById('checkoutBillingAddressFields');
    
    if (sameAsShipping) {
        billingFields.style.display = 'none';
        // Copy shipping to billing
        document.getElementById('checkoutBillingStreet').value = document.getElementById('checkoutShippingStreet').value;
        document.getElementById('checkoutBillingCity').value = document.getElementById('checkoutShippingCity').value;
        document.getElementById('checkoutBillingPostal').value = document.getElementById('checkoutShippingPostal').value;
        document.getElementById('checkoutBillingCountry').value = document.getElementById('checkoutShippingCountry').value;
    } else {
        billingFields.style.display = 'block';
    }
}

// Checkout form submission
async function handleCheckoutSubmit(e) {
    e.preventDefault();
    showLoading(true);
    
    const checkoutData = {
        shippingAddress: {
            street: document.getElementById('checkoutShippingStreet').value,
            city: document.getElementById('checkoutShippingCity').value,
            postalCode: document.getElementById('checkoutShippingPostal').value,
            country: document.getElementById('checkoutShippingCountry').value
        },
        billingAddress: {
            street: document.getElementById('checkoutBillingStreet').value,
            city: document.getElementById('checkoutBillingCity').value,
            postalCode: document.getElementById('checkoutBillingPostal').value,
            country: document.getElementById('checkoutBillingCountry').value
        },
        paymentMethod: document.getElementById('checkoutPaymentMethod').value,
        notes: document.getElementById('checkoutNotes').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/cart/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(checkoutData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeCheckoutModal();
            currentCart = null;
            updateCartUI();
            displayCartItems();
            showAlert('Order placed successfully!', 'success');
            showSection('orders');
        } else {
            showAlert(data.message || 'Checkout failed', 'error');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showAlert('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

// Theme toggle function
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    
    // Update icon
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    
    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Load theme preference
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        icon.className = 'fas fa-sun';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const productModal = document.getElementById('productModal');
    const orderModal = document.getElementById('orderModal');
    const reviewModal = document.getElementById('reviewModal');
    const checkoutModal = document.getElementById('checkoutModal');
    
    if (event.target === productModal) {
        closeProductModal();
    }
    
    if (event.target === orderModal) {
        closeOrderModal();
    }
    
    if (event.target === reviewModal) {
        closeReviewModal();
    }
    
    if (event.target === checkoutModal) {
        closeCheckoutModal();
    }
});

// ===================
// ADMIN FUNCTIONS
// ===================

let currentAdminPage = 1;

// Load all orders for admin
async function loadAllOrders(page = 1, filters = {}) {
    if (!authToken || !currentUser || currentUser.role !== 'admin') return;
    
    showLoading(true);
    currentAdminPage = page;
    
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '15',
            ...filters
        });
        
        const response = await fetch(`${API_BASE}/orders?${params}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayAdminOrders(data.orders);
            displayAdminOrdersPagination(data.pagination);
        } else {
            showAlert('Failed to load orders', 'error');
        }
    } catch (error) {
        console.error('Admin orders loading error:', error);
        showAlert('Network error loading orders', 'error');
    } finally {
        showLoading(false);
    }
}

// Display orders in admin table
function displayAdminOrders(orders) {
    const container = document.getElementById('adminOrdersTable');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="text-center">No orders found.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>User</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Items</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>${order.orderNumber}</td>
                            <td>
                                ${order.user.firstName} ${order.user.lastName}<br>
                                <small>(${order.user.username})</small>
                            </td>
                            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                                <select class="status-select" onchange="updateOrderStatus('${order._id}', this.value)" ${order.status === 'cancelled' || order.status === 'delivered' ? 'disabled' : ''}>
                                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                            <td>€${order.totalAmount.toFixed(2)}</td>
                            <td>${order.items.length} items</td>
                            <td>
                                <button class="btn btn-primary btn-small" onclick="viewAdminOrder('${order._id}')">View</button>
                                ${order.status === 'pending' || order.status === 'confirmed' ? 
                                    `<button class="btn btn-danger btn-small" onclick="cancelAdminOrder('${order._id}')">Cancel</button>` : 
                                    ''
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Display pagination for admin orders
function displayAdminOrdersPagination(pagination) {
    const container = document.getElementById('adminOrdersPagination');
    
    if (!pagination || pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    if (pagination.hasPrev) {
        html += `<button onclick="loadAllOrders(${pagination.currentPage - 1})">Previous</button>`;
    }
    
    for (let i = Math.max(1, pagination.currentPage - 2); 
         i <= Math.min(pagination.totalPages, pagination.currentPage + 2); 
         i++) {
        html += `<button class="${i === pagination.currentPage ? 'active' : ''}" onclick="loadAllOrders(${i})">${i}</button>`;
    }
    
    if (pagination.hasNext) {
        html += `<button onclick="loadAllOrders(${pagination.currentPage + 1})">Next</button>`;
    }
    
    container.innerHTML = html;
}

// Update order status (admin only)
async function updateOrderStatus(orderId, newStatus) {
    if (!authToken || !currentUser || currentUser.role !== 'admin') {
        showAlert('Admin access required', 'error');
        return;
    }
    
    if (!confirm(`Change order status to "${newStatus}"?`)) return;
    
    try {
        const requestBody = { status: newStatus };
        
        // Ask for tracking number if shipping
        if (newStatus === 'shipped') {
            const trackingNumber = prompt('Enter tracking number (optional):');
            if (trackingNumber) {
                requestBody.trackingNumber = trackingNumber;
            }
        }
        
        const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
            loadAllOrders(currentAdminPage);
            showAlert(`Order status updated to ${newStatus}`, 'success');
        } else {
            const data = await response.json();
            showAlert(data.message || 'Failed to update order status', 'error');
            // Reload to reset dropdown to original value
            loadAllOrders(currentAdminPage);
        }
    } catch (error) {
        console.error('Update order status error:', error);
        showAlert('Network error', 'error');
        loadAllOrders(currentAdminPage);
    }
}

// View order details (admin)
async function viewAdminOrder(orderId) {
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const order = data.order;
            
            const itemsList = order.items.map(item => 
                `- ${item.product.name} x${item.quantity} (€${item.price.toFixed(2)} each)`
            ).join('\\n');
            
            alert(`Order Details:\\n\\nOrder #: ${order.orderNumber}\\nCustomer: ${order.user.firstName} ${order.user.lastName}\\nEmail: ${order.user.email}\\nStatus: ${order.status}\\nTotal: €${order.totalAmount.toFixed(2)}\\nDate: ${new Date(order.createdAt).toLocaleDateString()}\\n\\nItems:\\n${itemsList}\\n\\nShipping Address:\\n${order.shippingAddress.street}\\n${order.shippingAddress.city}, ${order.shippingAddress.postalCode}\\n${order.shippingAddress.country}${order.trackingNumber ? '\\n\\nTracking: ' + order.trackingNumber : ''}`);
        } else {
            showAlert('Failed to load order details', 'error');
        }
    } catch (error) {
        console.error('View admin order error:', error);
        showAlert('Network error', 'error');
    }
}

// Cancel order (admin)
async function cancelAdminOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadAllOrders(currentAdminPage);
            showAlert('Order cancelled successfully!', 'success');
        } else {
            const data = await response.json();
            showAlert(data.message || 'Failed to cancel order', 'error');
        }
    } catch (error) {
        console.error('Cancel admin order error:', error);
        showAlert('Network error', 'error');
    }
}

// Filter orders in admin panel
function filterAllOrders() {
    const status = document.getElementById('adminStatusFilter').value;
    const userFilter = document.getElementById('adminUserFilter').value;
    const orderFilter = document.getElementById('adminOrderFilter').value;
    
    const filters = {};
    if (status) filters.status = status;
    if (userFilter) filters.userSearch = userFilter;
    if (orderFilter) filters.orderNumber = orderFilter;
    
    loadAllOrders(1, filters);
}

// ===================
// PRODUCT DETAILS FUNCTIONS
// ===================

let currentProductDetails = null;

// Show product details
async function showProductDetails(productId) {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentProductDetails = data.product;
            displayProductDetails(data.product);
            showSection('product-details');
        } else {
            showAlert('Failed to load product details', 'error');
        }
    } catch (error) {
        console.error('Product details error:', error);
        showAlert('Network error loading product details', 'error');
    } finally {
        showLoading(false);
    }
}

// Display product details
function displayProductDetails(product) {
    const container = document.getElementById('productDetailsContent');
    
    // Format specifications
    let specificationsHtml = '';
    if (product.specifications && Object.keys(product.specifications).length > 0) {
        specificationsHtml = `
            <div class="product-specifications">
                <h3>Specifications</h3>
                <div class="specs-grid">
                    ${Object.entries(product.specifications).map(([key, value]) => 
                        `<div class="spec-item">
                            <strong>${key}:</strong> ${value}
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    // Format tags
    let tagsHtml = '';
    if (product.tags && product.tags.length > 0) {
        tagsHtml = `
            <div class="product-tags">
                <h3>Tags</h3>
                <div class="tags-container">
                    ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
    // Format dimensions
    let dimensionsHtml = '';
    if (product.dimensions) {
        dimensionsHtml = `
            <div class="product-dimensions">
                <h3>Dimensions</h3>
                <p><strong>Length:</strong> ${product.dimensions.length || 'N/A'} cm</p>
                <p><strong>Width:</strong> ${product.dimensions.width || 'N/A'} cm</p>
                <p><strong>Height:</strong> ${product.dimensions.height || 'N/A'} cm</p>
                ${product.weight ? `<p><strong>Weight:</strong> ${product.weight} kg</p>` : ''}
            </div>
        `;
    }
    
    // Format images gallery
    let imagesHtml = '';
    if (product.images && product.images.length > 0) {
        imagesHtml = `
            <div class="product-gallery">
                <div class="main-image">
                    <img id="mainProductImage" src="${API_BASE.replace('/api', '')}${product.images[0]}" alt="${product.name}">
                </div>
                ${product.images.length > 1 ? `
                    <div class="thumbnail-gallery">
                        ${product.images.map((image, index) => 
                            `<img class="thumbnail ${index === 0 ? 'active' : ''}" 
                                 src="${API_BASE.replace('/api', '')}${image}" 
                                 alt="${product.name}" 
                                 onclick="changeMainImage('${API_BASE.replace('/api', '')}${image}', this)">`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        imagesHtml = `
            <div class="product-gallery">
                <div class="main-image no-image">
                    <i class="fas fa-image fa-5x"></i>
                    <p>No image available</p>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="product-details-container">
            <div class="product-images-section">
                ${imagesHtml}
            </div>
            
            <div class="product-info-section">
                <div class="product-header">
                    <h1 class="product-title">${product.name}</h1>
                    <div class="product-price-large">€${product.price.toFixed(2)}</div>
                </div>
                
                <div class="product-meta">
                    <div class="meta-item">
                        <strong>Category:</strong> ${product.category}
                    </div>
                    <div class="meta-item">
                        <strong>Brand:</strong> ${product.brand}
                    </div>
                    <div class="meta-item">
                        <strong>Stock:</strong> 
                        <span class="stock-indicator ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                            ${product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                        </span>
                    </div>
                    <div class="meta-item">
                        <strong>Added:</strong> ${new Date(product.createdAt).toLocaleDateString()}
                    </div>
                </div>
                
                <div class="product-description-full">
                    <h3>Description</h3>
                    <p>${product.description}</p>
                </div>
                
                <div class="quantity-selector">
                    <label for="productQuantity"><strong>Quantity:</strong></label>
                    <div class="quantity-input-group">
                        <button type="button" onclick="changeQuantity(-1)" class="quantity-btn">-</button>
                        <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}">
                        <button type="button" onclick="changeQuantity(1)" class="quantity-btn">+</button>
                    </div>
                </div>
                
                ${specificationsHtml}
                ${dimensionsHtml}
                ${tagsHtml}
            </div>
        </div>
    `;
}

// Change main image in gallery
function changeMainImage(imageSrc, thumbnail) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
}

// Change quantity
function changeQuantity(delta) {
    const input = document.getElementById('productQuantity');
    if (!input || !currentProductDetails) return;
    
    const currentValue = parseInt(input.value) || 1;
    const newValue = Math.max(1, Math.min(currentProductDetails.stock, currentValue + delta));
    input.value = newValue;
}

// Add to cart from details page
function addToCartFromDetails() {
    if (!currentProductDetails) return;
    
    const quantity = parseInt(document.getElementById('productQuantity')?.value) || 1;
    addToCart(currentProductDetails._id, quantity);
}

// Edit product from details page
function editProductFromDetails() {
    if (!currentProductDetails) return;
    editProduct(currentProductDetails._id);
}

// Delete product from details page
async function deleteProductFromDetails() {
    if (!currentProductDetails) return;
    
    const success = await deleteProduct(currentProductDetails._id);
    if (success) {
        showSection('products');
    }
}