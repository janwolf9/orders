# Dokumentacija E-Commerce Orders Management System

##  Pregled sistema

**E-Commerce Orders Management System** je celovita spletna aplikacija za upravljanje spletne trgovine, razvita z modernimi spletnimi tehnologijami. Sistem omogoča popolno upravljanje produktov, naročil, uporabnikov in košaric z naprednim role-based access control sistemom.

##  Arhitektura sistema

### **Frontend (Vanilla JavaScript SPA)**
- **Single Page Application** z dinamičnim prikazom sekcij
- **Responsive design** z CSS Grid in Flexbox
- **Vanilla JavaScript** brez dodatnih framework-ov
- **JWT token authentication** z localStorage
- **Real-time UI updates** z fetch API komunikacijo

### **Backend (Node.js + Express)**
- **RESTful API** z Express.js framework
- **MongoDB** baza podatkov z Mongoose ODM
- **JWT avtentikacija** z middleware preverjanjem
- **Role-based authorization** (user/admin)
- **File upload** s podporo za Vercel deployment

### **Deployment**
- **Vercel** serverless platform za backend
- **Static hosting** za frontend
- **MongoDB Atlas** cloud baza podatkov
- **Environment variables** za konfiguracijo

---

##  Ključne funkcionalnosti

### **1. Avtentikacija in avtorizacija**
- **Registracija/prijava** z email validacijo
- **JWT tokeni** za sesijske upravljanje
- **Dve vlogi**: `user` in `admin`
- **Protected routes** z middleware preverjanjem
- **Dinamična navigacija** glede na vlogo uporabnika

```javascript
// Middleware za preverjanje admin vloge
const adminAuth = async (req, res, next) => {
  await auth(req, res, () => {});
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

### **2. Upravljanje produktov**
- **CRUD operacije** za produkte (admin only)
- **Kategorije in filtriranje** produktov
- **Multiple image upload** z base64 kodiranjem
- **Specifikacije in dimenzije** produktov
- **Stock management** z avtomatskim posodabljanjem
- **Search in pagination** funkcionalnosti

### **3. Nakupovalna košarica**
- **Personalizirane košarice** za vsakega uporabnika
- **Add/remove items** z quantity kontrolo
- **Real-time updates** košarice
- **Persistent storage** v MongoDB
- **Stock validation** pred dodajanjem

### **4. Sistem naročil**
- **Order creation** z kompleksnimi podatki
- **Status tracking**: pending, confirmed, processing, shipped, delivered, cancelled
- **Delivery addresses** (shipping in billing)
- **Payment methods** selection
- **Order history** za uporabnike
- **Admin order management** z status updates

### **5. Review sistem**
- **Product reviews** z rating system (1-5 zvezdic)
- **Verified purchases** označevanje
- **Image uploads** v reviews
- **Review moderation** (admin)
- **Rating statistics** prikaz

### **6. Admin panel**
- **Dual-tab interface**: Order Management & User Management
- **Comprehensive user details** modal
- **User activation/deactivation**
- **Order status management**
- **System-wide statistics**

### **7. Personalizirani dashboard**
- **Role-based content**:
  - **Users**: Cart items, My orders, My reviews, Total spent
  - **Admin**: Products, Orders, Reviews, Users statistics
- **Clickable cards** za hitro navigacijo
- **Real-time data** updates

---

## Struktura projekta

```
orders/
├── backend/
│   ├── server.js              # Express server setup
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Product.js         # Product schema
│   │   ├── Order.js           # Order schema
│   │   ├── Cart.js            # Cart schema
│   │   └── Review.js          # Review schema
│   └── routes/
│       ├── auth.js            # Authentication endpoints
│       ├── users.js           # User management endpoints
│       ├── products.js        # Product CRUD endpoints
│       ├── orders.js          # Order management endpoints
│       ├── cart.js            # Cart operations endpoints
│       ├── reviews.js         # Review system endpoints
│       └── uploads.js         # File upload endpoints
├── frontend/
│   ├── index.html             # Main HTML structure
│   ├── script.js              # Main JavaScript application
│   └── styles.css             # Complete styling
├── package.json               # Root dependencies
├── vercel.json               # Vercel deployment config
└── README.md                 # Basic project info
```

---

## Podatkovni modeli

### **User Model**
```javascript
{
  firstName: String,
  lastName: String,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  isActive: Boolean,
  createdAt: Date
}
```

### **Product Model**
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  brand: String,
  stock: Number,
  images: [String], // base64 encoded
  specifications: Object,
  dimensions: Object,
  weight: Number,
  tags: [String],
  isActive: Boolean,
  createdAt: Date
}
```

### **Order Model**
```javascript
{
  orderNumber: String (unique),
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String (enum),
  shippingAddress: Object,
  billingAddress: Object,
  paymentMethod: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  createdAt: Date
}
```

### **Cart Model**
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number
  }],
  updatedAt: Date
}
```

### **Review Model**
```javascript
{
  product: ObjectId (ref: Product),
  user: ObjectId (ref: User),
  rating: Number (1-5),
  title: String,
  comment: String,
  images: [String],
  verified: Boolean,
  helpful: Number,
  reported: Boolean,
  createdAt: Date
}
```

---

## 🔗 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Registracija uporabnika
- `POST /api/auth/login` - Prijava uporabnika
- `GET /api/auth/me` - Pridobitev trenutnega uporabnika

### **Users (Admin only)**
- `GET /api/users` - Seznam vseh uporabnikov
- `GET /api/users/:id/details` - Podrobnosti uporabnika
- `PUT /api/users/:id/toggle-status` - Aktivacija/deaktivacija
- `DELETE /api/users/:id` - Brisanje uporabnika

### **Products**
- `GET /api/products` - Seznam produktov (public)
- `GET /api/products/:id` - Podrobnosti produkta (public)
- `POST /api/products` - Dodaj produkt (admin)
- `PUT /api/products/:id` - Posodobi produkt (admin)
- `DELETE /api/products/:id` - Izbriši produkt (admin)

### **Orders**
- `GET /api/orders` - Vsa naročila (admin) / Uporabnikova naročila (user)
- `GET /api/orders/my` - Samo uporabnikova naročila
- `POST /api/orders` - Ustvari naročilo
- `PUT /api/orders/:id/status` - Posodobi status (admin)
- `PUT /api/orders/:id/cancel` - Prekliči naročilo

### **Cart**
- `GET /api/cart` - Pridobi košarico
- `POST /api/cart/add` - Dodaj v košarico
- `PUT /api/cart/update` - Posodobi količino
- `DELETE /api/cart/remove/:productId` - Odstrani iz košarice

### **Reviews**
- `GET /api/reviews` - Vse ocene (admin) / Uporabnikove ocene (user)
- `GET /api/reviews/my` - Samo uporabnikove ocene
- `POST /api/reviews` - Dodaj oceno
- `PUT /api/reviews/:id` - Posodobi oceno
- `DELETE /api/reviews/:id` - Izbriši oceno

### **File Upload**
- `POST /api/uploads/multiple` - Naloži več datotek

---

## Frontend funkcionalnosti

### **Single Page Application**
```javascript
function showSection(sectionName) {
  // Preveri dostop do zaščitenih sekcij
  const protectedSections = ['dashboard', 'orders', 'reviews', 'admin', 'cart'];
  if (!currentUser && protectedSections.includes(sectionName)) {
    showAlert('Please log in to access this section', 'error');
    showSection('login');
    return;
  }
  // Prikaži zahtevano sekcijo
}
```

### **Dynamic Navigation**
```javascript
function updateNavigation() {
  if (currentUser) {
    // Prikaži vse povezave za prijavljene uporabnike
    // Prikaži admin povezave samo za admin-e
  } else {
    // Prikaži samo Products za neprijavljene
  }
}
```

### **Role-based Dashboard**
```javascript
function updateDashboardLabels(isAdmin) {
  if (!isAdmin) {
    // Uporabniški dashboard: Cart Items, My Orders, My Reviews, Total Spent
  } else {
    // Admin dashboard: Products, Orders, Reviews, Users
  }
}
```

---

## Varnost

### **Authentication & Authorization**
- **JWT tokeni** z expiration time
- **Password hashing** z bcrypt
- **Role-based access control**
- **Protected API endpoints**
- **Frontend route protection**

### **Data Validation**
- **Express-validator** za backend validacijo
- **Frontend input validation**
- **MongoDB schema validation**
- **File upload restrictions**

### **Security Headers**
- **CORS konfiguracija**
- **Rate limiting** (v produkciji)
- **Input sanitization**
- **Error handling** brez občutljivih podatkov

---

##  Deployment

### **Vercel konfiguracija**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

### **Environment Variables**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=3000
```

---

## 📱 Responsive Design

### **Breakpoints**
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px  
- **Mobile**: < 768px

### **Adaptive Features**
- **Grid layouts** se prilagajajo širini zaslona
- **Navigation** se skrči na manjših zaslonih
- **Cards** se preuredijo v stolpce
- **Modals** se prilagodijo velikosti zaslona

---

## Razvojna okolja

### **Lokalni razvoj**
```bash
# Backend
cd backend && npm install && npm start

# Frontend (development server)
cd frontend && python3 -m http.server 8080

# MongoDB (local)
mongod --dbpath ./data
```

### **Produkcija**
- **Vercel** avtomatski deployment iz Git-a
- **MongoDB Atlas** cloud baza
- **Environment variables** v Vercel dashboard-u

---

https://github.com/janwolf9/orders