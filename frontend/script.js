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
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    
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
        document.getElementById('username').textContent = currentUser.username;
    } else {
        navAuth.style.display = 'flex';
        navUser.style.display = 'none';
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
                <div class="product-name">${product.name}</div>
                <div class="product-price">€${product.price.toFixed(2)}</div>
                <div class="product-description">${product.description.substring(0, 100)}...</div>
                <div style="margin-bottom: 1rem;">
                    <small><strong>Category:</strong> ${product.category}</small><br>
                    <small><strong>Brand:</strong> ${product.brand}</small><br>
                    <small><strong>Stock:</strong> ${product.stock}</small>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="editProduct('${product._id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
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
    showProductModal(productId);
}

async function deleteProduct(productId) {
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
        } else {
            const data = await response.json();
            showAlert(data.message || 'Failed to delete product', 'error');
        }
    } catch (error) {
        console.error('Delete product error:', error);
        showAlert('Network error. Please try again.', 'error');
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

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const productModal = document.getElementById('productModal');
    const orderModal = document.getElementById('orderModal');
    
    if (event.target === productModal) {
        closeProductModal();
    }
    
    if (event.target === orderModal) {
        closeOrderModal();
    }
});