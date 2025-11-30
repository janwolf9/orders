# Contentsquare Implementation - E-Commerce Orders Management System

## 📊 Pregled implementacije

Contentsquare je uspešno integriran v E-Commerce sistem za sledenje uporabniškemu obnašanju, analytics in UX optimization.

---

## 🔧 **Implementacija**

### **1. Tracking Script**
Contentsquare tracking script je dodan v `frontend/index.html`:

```html
<!-- Contentsquare Tracking Code -->
<script src="https://t.contentsquare.net/uxa/316bb8b265455.js"></script>
```

### **2. Helper Functions**
V `frontend/script.js` so dodane helper funkcije:

```javascript
// Contentsquare tracking functions
function trackContentSquareEvent(eventName, properties = {}) {
    if (typeof window.uxa !== 'undefined') {
        window.uxa('trackEvent', eventName, properties);
        console.log(`Contentsquare event tracked: ${eventName}`, properties);
    }
}

function identifyContentSquareUser(userId, attributes = {}) {
    if (typeof window.uxa !== 'undefined') {
        window.uxa('identifyUser', userId, attributes);
        console.log(`Contentsquare user identified: ${userId}`, attributes);
    }
}

function triggerContentSquareGoal(goalName, value = null) {
    if (typeof window.uxa !== 'undefined') {
        window.uxa('trackGoal', goalName, value);
        console.log(`Contentsquare goal triggered: ${goalName}`, value);
    }
}
```

---

## 📋 **Sledeni dogodki**

### **1. Avtentikacija**

#### **Login Success**
```javascript
// Event: user_login_success
// Goal: login_success
// Lokacija: handleLogin()
trackContentSquareEvent('user_login_success');
identifyContentSquareUser(currentUser._id, {
    username: currentUser.username,
    email: currentUser.email,
    role: currentUser.role,
    isAdmin: currentUser.role === 'admin'
});
triggerContentSquareGoal('login_success');
```

#### **Login Failed**
```javascript
// Event: user_login_failed
// Lokacija: handleLogin()
trackContentSquareEvent('user_login_failed');
```

#### **Registration Success**
```javascript
// Event: user_registration_success
// Goal: registration_success
// Lokacija: handleRegister()
trackContentSquareEvent('user_registration_success');
triggerContentSquareGoal('registration_success');
```

#### **Registration Failed**
```javascript
// Event: user_registration_failed
// Lokacija: handleRegister()
trackContentSquareEvent('user_registration_failed');
```

### **2. E-Commerce eventi**

#### **Add to Cart**
```javascript
// Event: product_added_to_cart
// Lokacija: addToCart()
trackContentSquareEvent('product_added_to_cart', {
    productId: productId,
    quantity: quantity
});
```

#### **Add to Cart Failed**
```javascript
// Event: add_to_cart_failed
// Lokacija: addToCart()
trackContentSquareEvent('add_to_cart_failed');
```

#### **Purchase Completed**
```javascript
// Event: purchase_completed
// Goal: purchase (z value)
// Lokacija: handleCheckoutSubmit()
trackContentSquareEvent('purchase_completed', {
    orderId: data.orderId,
    totalAmount: data.totalAmount || 0
});
triggerContentSquareGoal('purchase', data.totalAmount || 0);
```

#### **Checkout Failed**
```javascript
// Event: checkout_failed
// Lokacija: handleCheckoutSubmit()
trackContentSquareEvent('checkout_failed');
```

### **3. Navigation in Search**

#### **Page View**
```javascript
// Event: page_view
// Lokacija: showSection()
trackContentSquareEvent('page_view', { 
    section: sectionName,
    userRole: currentUser?.role || 'anonymous'
});
```

#### **Unauthorized Access**
```javascript
// Event: unauthorized_access_attempt
// Lokacija: showSection()
trackContentSquareEvent('unauthorized_access_attempt', { 
    section: sectionName 
});
```

#### **Product Search**
```javascript
// Event: product_search
// Lokacija: searchProducts()
trackContentSquareEvent('product_search', {
    searchTerm: searchTerm,
    category: category || 'all',
    sortBy: sortBy || 'none'
});
```

### **4. Goal Tracking**

#### **Key Goals**
```javascript
// Goals tracked:
triggerContentSquareGoal('login_success');
triggerContentSquareGoal('registration_success');
triggerContentSquareGoal('purchase', totalAmount);
```

---

## 🎯 **Contentsquare Features omogočene**

### **1. Digital Experience Analytics (DXA)**
- **Journey mapping** - kako uporabniki navigirajo skozi aplikacijo
- **Zone-based heatmaps** - kje uporabniki klikajo in se zadržujejo
- **Form analytics** - analiza form completion rates
- **Error tracking** - avtomatična zaznava JavaScript napak

### **2. Session Replay**
- **Session recordings** vseh uporabniških interakcij
- **Frustration scoring** - identifikacija problematičnih session-ov
- **Speed analysis** - performance impact na user experience

### **3. User Segmentation**
- **Dynamic segments** na osnovi behavior patterns
- **Custom attributes** se shranijo ob prijavi:
  - Username
  - Email  
  - Role (user/admin)
  - Admin status

### **4. Conversion Analysis**
- **Funnel analysis** z conversion rates
- **Goal tracking** s revenue attribution
- **A/B testing** support za optimization

### **5. AI-powered Insights**
- **Automatic insights** detection
- **Opportunity scoring** za improvement ideas
- **Impact prediction** za UX changes

---

## 📊 **Key Events za analizo**

### **High-Value Goals:**
1. **`purchase`** - Končni cilj e-commerce (z revenue value) 💰
2. **`registration_success`** - Pridobivanje novih uporabnikov 👤
3. **`login_success`** - User activation tracking 🔐

### **E-commerce Events:**
1. **`purchase_completed`** - Purchase tracking z order details
2. **`product_added_to_cart`** - Shopping intent 🛒
3. **`user_registration_success`** - User acquisition
4. **`user_login_success`** - User engagement

### **Problem Indicators:**
1. **`checkout_failed`** - Payment/checkout issues
2. **`add_to_cart_failed`** - Technical problems
3. **`unauthorized_access_attempt`** - UX issues
4. **`user_login_failed`** / **`user_registration_failed`** - Auth problems

### **Engagement Metrics:**
1. **`page_view`** - Navigation patterns
2. **`product_search`** - Product discovery
3. **Form submissions** - User engagement

---

## 🔍 **Contentsquare Dashboard Setup**

### **1. Goals to Configure:**
```
Goals > Create Goal
- purchase (Revenue Goal: Track total order value)
- registration_success (Conversion Goal: User acquisition)  
- login_success (Engagement Goal: User activation)
```

### **2. Segments to Create:**
```
Segments > New Segment
1. Admin Users:
   Custom Attribute: role = "admin"

2. Regular Users:
   Custom Attribute: role = "user"

3. High-Value Customers:
   Goal: purchase > €100

4. Cart Abandoners:
   Event: product_added_to_cart AND NOT purchase_completed
```

### **3. Zones to Analyze:**
```
Zones > Zone-based Analysis
- Login/Register buttons (optimize conversion)
- Product cards (optimize engagement) 
- Add to cart buttons (reduce friction)
- Checkout flow (minimize abandonment)
```

### **4. Journey Analysis:**
```
Journeys > Create Journey
1. Registration Journey:
   page_view(login) → user_registration_success

2. Purchase Journey:
   page_view(products) → product_added_to_cart → purchase_completed

3. Admin Journey:
   user_login_success → page_view(admin) → admin actions
```

---

## ⚙️ **Configuration Options**

### **Contentsquare Script ID**
```html
<!-- Current implementation uses provided script -->
<script src="https://t.contentsquare.net/uxa/316bb8b265455.js"></script>
```

### **Privacy Settings**
```javascript
// Only track business-relevant data
function identifyContentSquareUser(userId, attributes = {}) {
    if (typeof window.uxa !== 'undefined') {
        // Don't include sensitive PII in production
        window.uxa('identifyUser', userId, {
            role: attributes.role,
            isAdmin: attributes.isAdmin,
            // Avoid including real emails/names
        });
    }
}
```

### **Environment-based Tracking**
```javascript
// Only track in production environment
const isProduction = window.location.hostname !== 'localhost';
if (isProduction && typeof window.uxa !== 'undefined') {
    trackContentSquareEvent(eventName, properties);
}
```

### **Goal Value Tracking**
```javascript
// Track revenue goals with actual values
triggerContentSquareGoal('purchase', parseFloat(orderTotal));
```

---

## 📈 **Expected Analytics Benefits**

### **User Experience Analytics:**
- **Journey mapping** z real user flows
- **Zone-based heatmaps** za click/scroll behavior
- **Form analytics** za completion/abandonment rates
- **Speed impact** na user experience

### **AI-powered Insights:**
- **Automatic opportunity detection** 
- **Frustration signals** identification
- **Revenue impact** predictions
- **Conversion optimization** suggestions

### **Advanced Segmentation:**
- **Behavior-based segments** (power users, new users, etc.)
- **Goal-based analysis** (converters vs non-converters)
- **Custom attribute filtering** (admin vs regular users)
- **Real-time user classification**

---

## 🚀 **Next Steps**

### **Immediate:**
1. **Test tracking implementation** v browser developer tools
2. **Verify events** v Contentsquare dashboard
3. **Configure goals** za revenue tracking

### **Short-term:**
1. **Setup conversion funnels** za key user journeys
2. **Create user segments** za targeted analysis  
3. **Enable zone-based analysis** za heatmap insights

### **Long-term:**
1. **Analyze journey maps** za UX optimizations
2. **A/B test** različne page layouts
3. **Implement AI recommendations** za conversion improvements

---

## 🔧 **Troubleshooting**

### **Events se ne pošiljajo:**
```javascript
// Check in browser console
console.log(typeof window.uxa); // Should return 'object'
console.log(window.uxa); // Should show Contentsquare object
```

### **Goals se ne trigger-ajo:**
```javascript
// Check goal tracking
console.log('Goal triggered:', goalName, value);
window.uxa('trackGoal', 'purchase', 99.99); // Test manual trigger
```

### **User identification ne deluje:**
```javascript
// Check user data
console.log(currentUser); // Verify user object exists
console.log(currentUser._id); // Verify user ID exists
window.uxa('identifyUser', 'test123', {role: 'user'}); // Test manual identify
```

---

*Implementacija completed: 15. november 2025*  
*Tracking active za: Authentication, E-commerce, Navigation, Search, Goals*  
*Ready for: Journey Analysis, Zone-based Heatmaps, Session Replay, AI Insights*