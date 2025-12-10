# FMEA Analiza - E-Commerce Orders Management System

**Datum analize:** 7. december 2025  
**Avtor:** Jan Wolf  
**Sistem:** E-Commerce Orders Management System  
**Verzija:** 1.0

---

## 1. Uvod

### 1.1 Namen FMEA Analize

Namen te analize FMEA (Failure Mode and Effects Analysis) je sistematično identificirati in ovrednotiti potencialne napake v E-Commerce Orders Management sistemu, ki bi lahko vplivale na uporabniško izkušnjo, zanesljivost sistema in poslovanje.

### 1.2 Obseg Analize

Analiza pokriva naslednje ključne procese sistema:
- Registracija in avtentikacija uporabnikov
- Upravljanje produktov
- Proces dodajanja v košarico
- Checkout in oddaja naročil
- Admin funkcionalnosti
- Komunikacija s podatkovno bazo (MongoDB Atlas)

---

## 2. Metodologija

### 2.1 Uporabljene Lestvice

#### Verjetnost Pojava (O - Occurrence)
| Ocena | Opis | Pogostost |
|-------|------|-----------|
| 1 | Zelo nizka | < 1/10,000 |
| 2-3 | Nizka | 1/5,000 - 1/2,000 |
| 4-6 | Srednja | 1/1,000 - 1/100 |
| 7-8 | Visoka | 1/50 - 1/20 |
| 9-10 | Zelo visoka | > 1/10 |

#### Resnost Posledic (S - Severity)
| Ocena | Opis | Vpliv |
|-------|------|-------|
| 1 | Zanemarljiva | Uporabnik ne opazi, ni vpliva |
| 2-3 | Manjša | Manjša motnja, sistem deluje |
| 4-6 | Srednja | Motena uporabniška izkušnja, workaround obstaja |
| 7-8 | Visoka | Večja funkcionalnost ne deluje, izguba podatkov možna |
| 9-10 | Kritična | Popoln izpad sistema, izguba prihodkov, varnostna ranljivost |

#### Zaznavnost (D - Detection)
| Ocena | Opis | Verjetnost detekcije |
|-------|------|---------------------|
| 1 | Zelo visoka | Avtomatski alarmi, trenutna detekcija |
| 2-3 | Visoka | Monitoring opozori v minutah |
| 4-6 | Srednja | Testiranje/logging zazna v urah |
| 7-8 | Nizka | Uporabniško poročilo potrebno |
| 9-10 | Zelo nizka | Napaka skoraj nevidna |

#### RPN (Risk Priority Number)
```
RPN = O × S × D
```

**Kritična meja:** RPN ≥ 100 zahteva takojšnje ukrepanje

---

## 3. FMEA Tabela

### 3.1 Registracija in Avtentikacija

| ID | Proces | Način Odpovedi | Posledice | O | S | D | RPN | Trenutni Nadzor | Priporočeni Ukrepi | Odgovornost |
|----|--------|----------------|-----------|---|---|---|-----|-----------------|-------------------|-------------|
| F-001 | Registracija uporabnika | MongoDB Atlas povezava prekinjena | Novi uporabniki se ne morejo registrirati | 4 | 8 | 3 | **96** | Try-catch blok, error message | Implementiraj Redis cache za začasno shranjevanje, Retry logika z exponential backoff | Backend |
| F-002 | Registracija uporabnika | Podvojen email v bazi | Registracija zavrnjena, zmeda uporabnika | 5 | 4 | 2 | 40 | Unique index na email polju | User-friendly error sporočilo "Email že obstaja", predlog prijave | Backend |
| F-003 | Prijava | Napačno geslo | Uporabnik ne more dostopati do računa | 7 | 5 | 1 | 35 | bcrypt preverjanje, error message | Rate limiting (max 5 poskusov/5min), CAPTCHA po 3 poskusih | Backend |
| F-004 | Prijava | JWT token expiration nepravilen | Uporabnik nepričakovano odjavljen | 3 | 6 | 4 | 72 | Token expiry check | Implementiraj refresh token mehanizem, auto-refresh pred expiry | Backend |
| F-005 | Avtentikacija | XSS napad preko input polja | Kraja session token-ov, nepooblaščen dostop | 4 | 10 | 6 | **240** | Osnovna input sanitizacija | DOMPurify za sanitizacijo, CSP headers, HTTPOnly cookies | Frontend/Backend |
| F-006 | Geslo reset | Email storitev ne deluje | Uporabniki ne morejo resetirati gesel | 3 | 7 | 5 | **105** | Error logging | Backup email provider, SMS kot alternativa, Admin manual reset | Backend |

### 3.2 Upravljanje Produktov

| ID | Proces | Način Odpovedi | Posledice | O | S | D | RPN | Trenutni Nadzor | Priporočeni Ukrepi | Odgovornost |
|----|--------|----------------|-----------|---|---|---|-----|-----------------|-------------------|-------------|
| F-007 | Prikaz produktov | API počasen odziv (>3s) | Slaba uporabniška izkušnja, uporabniki zapustijo stran | 6 | 6 | 3 | **108** | Basic loading spinner | Implementiraj lazy loading, CDN za slike, Pagination optimizacija | Frontend |
| F-008 | Dodajanje produkta (Admin) | Neveljavna cena (negativna/NaN) | Napačni popusti, finančna izguba | 4 | 9 | 4 | **144** | Frontend validacija (type="number") | Backend validacija z Joi/Yup schema, Min/Max omejitve | Backend |
| F-009 | Upload slike produkta | Slike večje od 10MB | Upload timeout, prostor na strežniku poln | 5 | 5 | 3 | 75 | File size check v frontendu | Server-side size/type validacija, Image compression, Storage quota limits | Backend |
| F-010 | Iskanje produktov | SQL injection preko search polja | Brisanje/kraja celotne baze podatkov | 2 | 10 | 5 | **100** | MongoDB parameterized queries | Input sanitization, WAF (Web Application Firewall), Security audit | Backend |
| F-011 | Produktne slike | Broken image links | Produkti brez slik, zmanjšana prodaja | 6 | 4 | 4 | 96 | Placeholder image | CDN backup URLs, Image validation job, Broken link detector | Backend |

### 3.3 Košarica in Naročila

| ID | Proces | Način Odpovedi | Posledice | O | S | D | RPN | Trenutni Nadzor | Priporočeni Ukrepi | Odgovornost |
|----|--------|----------------|-----------|---|---|---|-----|-----------------|-------------------|-------------|
| F-012 | Dodajanje v košarico | Race condition (dvakrat klik) | Podvojena količina v košarici | 5 | 5 | 6 | **150** | Debounce na gumb (500ms) | Optimistic locking, State management z Redux, Backend idempotency check | Frontend/Backend |
| F-013 | Košarica | LocalStorage počiščen | Uporabnik izgubi celotno košarico | 7 | 7 | 2 | 98 | LocalStorage persist | Sync košarice na backend, Session restore iz DB, Cookie backup | Backend |
| F-014 | Checkout | Zaloga prazna med checkout-om | Naročilo za nezadostno zalogo, nezadovoljni kupci | 5 | 8 | 5 | **200** | Frontend stock check | Transaction locking, ACID compliance, Real-time stock updates via WebSocket | Backend |
| F-015 | Plačilo | Payment gateway timeout | Plačilo ni procesano, nejasnost stanja naročila | 4 | 9 | 4 | **144** | Timeout error message | Webhook za payment status, Retry mehanizem, Payment reconciliation job | Backend |
| F-016 | Oddaja naročila | Email potrditev ne pošlje | Uporabnik ne dobi potrditve, zmeda o stanju naročila | 5 | 6 | 3 | 90 | Email error logging | Email queue (Bull/RabbitMQ), Fallback SMS, Order status page | Backend |
| F-017 | Količina v košarici | Negativna vrednost (-1) | Napačni izračuni, finančna izguba | 2 | 8 | 2 | 32 | HTML5 min="1" validacija | Backend validacija, Test coverage (TC-006), Error handling | Backend |

### 3.4 Admin Panel

| ID | Proces | Način Odpovedi | Posledice | O | S | D | RPN | Trenutni Nadzor | Priporočeni Ukrepi | Odgovornost |
|----|--------|----------------|-----------|---|---|---|-----|-----------------|-------------------|-------------|
| F-018 | Admin prijava | Privilege escalation | Navaden uporabnik dobi admin pravice | 2 | 10 | 6 | **120** | Role check v middleware | Multi-factor authentication za admin, Audit logging, Role-based access control (RBAC) | Backend |
| F-019 | Brisanje uporabnika | Cascade delete ne deluje | Orphan podatki (naročila brez uporabnika) | 4 | 6 | 5 | **120** | Mongoose cascade hooks | Database foreign key constraints, Soft delete namesto hard delete | Backend |
| F-020 | Urejanje naročila | Status sprememba brez validacije | Naročilo označeno "Delivered" brez shipment | 5 | 7 | 4 | **140** | Frontend status dropdown | State machine za status transitions, Audit trail, Email notifications | Backend |
| F-021 | Admin dashboard | Počasen SQL query (>10s) | Admin ne more dostopati do podatkov | 4 | 6 | 3 | 72 | Database indexing | Query optimization, Database read replicas, Caching z Redis | Backend |

### 3.5 Infrastruktura in Monitoring

| ID | Proces | Način Odpovedi | Posledice | O | S | D | RPN | Trenutni Nadzor | Priporočeni Ukrepi | Odgovornost |
|----|--------|----------------|-----------|---|---|---|-----|-----------------|-------------------|-------------|
| F-022 | MongoDB Atlas | Popoln outage baze podatkov | Celoten sistem ne deluje | 2 | 10 | 2 | 40 | Cloud provider SLA | Multi-region replication, Automated backups (Point-in-time recovery), Disaster recovery plan | DevOps |
| F-023 | Node.js Backend | Memory leak | Server crash po nekaj urah, downtime | 4 | 8 | 5 | **160** | PM2 restart on crash | Memory profiling (Chrome DevTools), Heap snapshots, Resource cleanup | Backend |
| F-024 | Frontend Hosting | CDN down | Frontend nedostopen | 2 | 9 | 3 | 54 | Health check endpoint | Multi-CDN strategy, Static site backup, Status page | DevOps |
| F-025 | API Rate Limiting | DDoS napad | Server preopterečen, legit uporabniki ne morejo dostopati | 5 | 9 | 4 | **180** | Basic rate limiting | Cloudflare DDoS protection, Progressive rate limiting, IP blacklisting | Backend/DevOps |
| F-026 | Logging sistem | Disk space poln | Logovi se ne shranjujejo, debugging otežen | 6 | 5 | 7 | **210** | Rotacija log fajlov | Centralizirani logging (ELK/Splunk), Log retention policy, Disk space alerts | DevOps |
| F-027 | SSL certifikat | Certifikat expira | HTTPS ne deluje, brskalnik prikaže opozorilo | 3 | 8 | 2 | 48 | Let's Encrypt auto-renewal | Certificate monitoring, Backup certificates, Auto-renewal alerts | DevOps |

---

## 4. Prioritizacija Ukrepov

### 4.1 Kritični Problemi (RPN ≥ 150)

| Rang | ID | Problem | RPN | Urgentnost |
|------|-----|---------|-----|-----------|
| 1 | **F-005** | XSS napad preko input polja | **240** | Kritično |
| 2 | **F-026** | Disk space poln - logging sistem | **210** | Kritično |
| 3 | **F-014** | Zaloga prazna med checkout-om | **200** | Kritično |
| 4 | **F-025** | DDoS napad | **180** | Kritično |
| 5 | **F-023** | Memory leak v Node.js | **160** | Visoko |
| 6 | **F-012** | Race condition košarica | **150** | Visoko |

### 4.2 Visoki Problemi (100 ≤ RPN < 150)

| ID | Problem | RPN | Akcija |
|----|---------|-----|--------|
| F-008 | Neveljavna cena produkta | 144 | Backend validacija z Joi |
| F-015 | Payment gateway timeout | 144 | Webhook implementacija |
| F-020 | Status sprememba brez validacije | 140 | State machine pattern |
| F-018 | Privilege escalation | 120 | MFA za admin |
| F-019 | Cascade delete ne deluje | 120 | Soft delete |
| F-007 | API počasen odziv | 108 | Lazy loading + CDN |
| F-006 | Email storitev ne deluje | 105 | Backup email provider |
| F-010 | SQL injection | 100 | Input sanitization + WAF |

---

## 5. Implementacijski Plan

### 5.1 Faza 1 - Kritične Varnostne Luknje (Teden 1-2)

#### F-005: XSS Protection (RPN 240)
```javascript
// Frontend - DOMPurify implementacija
import DOMPurify from 'dompurify';

function sanitizeInput(input) {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
}

// Backend - CSP Headers
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", 
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
  );
  next();
});

// HTTPOnly Cookies
res.cookie('token', jwt, { 
  httpOnly: true, 
  secure: true, 
  sameSite: 'strict' 
});
```

**Časovnica:** 3 dni  
**Odgovornost:** Backend + Frontend developer  
**Testiranje:** Penetration testing z OWASP ZAP

#### F-010: SQL Injection Prevention (RPN 100)
```javascript
// Input sanitization middleware
const validator = require('validator');

function sanitizeSearchQuery(req, res, next) {
  if (req.query.search) {
    req.query.search = validator.escape(req.query.search);
    req.query.search = req.query.search.substring(0, 100); // Max length
  }
  next();
}

app.get('/api/products', sanitizeSearchQuery, async (req, res) => {
  // MongoDB parametriziran query je že varen
  const products = await Product.find({ 
    name: { $regex: req.query.search, $options: 'i' }
  });
  res.json(products);
});
```

**Časovnica:** 2 dni  
**Odgovornost:** Backend developer

---

### 5.2 Faza 2 - Infrastruktura in Stabilnost (Teden 3-4)

#### F-026: Logging System (RPN 210)
```javascript
// Winston + Elasticsearch implementacija
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL }
    })
  ]
});

// Disk space monitoring
const diskusage = require('diskusage');
setInterval(async () => {
  const { available, total } = await diskusage.check('/');
  const percentUsed = ((total - available) / total) * 100;
  if (percentUsed > 85) {
    logger.error('Disk space critical', { percentUsed });
    // Send alert to Slack/Email
  }
}, 60000); // Check every minute
```

**Časovnica:** 5 dni  
**Odgovornost:** DevOps + Backend  
**Strošek:** Elasticsearch hosting ~$50/mesec

#### F-023: Memory Leak Prevention (RPN 160)
```javascript
// Heap snapshot scheduler
const heapdump = require('heapdump');
const v8 = require('v8');

// Monitor memory usage
setInterval(() => {
  const heapStats = v8.getHeapStatistics();
  const usedHeap = heapStats.used_heap_size / heapStats.heap_size_limit;
  
  logger.info('Memory usage', {
    usedHeapMB: (heapStats.used_heap_size / 1024 / 1024).toFixed(2),
    percentUsed: (usedHeap * 100).toFixed(2)
  });
  
  if (usedHeap > 0.9) {
    heapdump.writeSnapshot(`./heapdumps/${Date.now()}.heapsnapshot`);
    logger.error('Memory leak suspected - heap snapshot created');
  }
}, 300000); // Check every 5 minutes

// Proper cleanup
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing connections');
  mongoose.connection.close();
  server.close(() => {
    logger.info('Server closed gracefully');
    process.exit(0);
  });
});
```

**Časovnica:** 4 dni  
**Odgovornost:** Backend developer

---

### 5.3 Faza 3 - Business Logic (Teden 5-6)

#### F-014: Stock Management Race Condition (RPN 200)
```javascript
// Optimistic locking z MongoDB
const productSchema = new mongoose.Schema({
  name: String,
  stock: Number,
  __v: { type: Number, select: false } // Version key
});

async function checkoutOrder(orderId, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const order = await Order.findById(orderId).session(session);
    
    for (const item of order.items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      
      // Atomic update z version check
      const updated = await Product.findOneAndUpdate(
        { 
          _id: product._id, 
          __v: product.__v,
          stock: { $gte: item.quantity }
        },
        { 
          $inc: { stock: -item.quantity, __v: 1 }
        },
        { session, new: true }
      );
      
      if (!updated) {
        throw new Error('Stock changed during checkout - please retry');
      }
    }
    
    order.status = 'confirmed';
    await order.save({ session });
    await session.commitTransaction();
    
    return { success: true, order };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

**Časovnica:** 5 dni  
**Odgovornost:** Backend developer  
**Testiranje:** Load testing z Artillery

#### F-012: Cart Race Condition (RPN 150)
```javascript
// Frontend - Redux middleware z debounce
import { debounce } from 'lodash';

const addToCartMiddleware = store => next => action => {
  if (action.type === 'ADD_TO_CART') {
    // Debounce za 500ms
    const debouncedAdd = debounce(async () => {
      const state = store.getState();
      if (state.cart.isUpdating) return; // Prevent double-click
      
      store.dispatch({ type: 'CART_UPDATING', payload: true });
      
      try {
        const response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: action.payload.productId,
            quantity: action.payload.quantity,
            idempotencyKey: `${Date.now()}-${action.payload.productId}`
          })
        });
        
        const data = await response.json();
        store.dispatch({ type: 'CART_UPDATED', payload: data.cart });
      } finally {
        store.dispatch({ type: 'CART_UPDATING', payload: false });
      }
    }, 500);
    
    debouncedAdd();
    return;
  }
  
  return next(action);
};

// Backend - Idempotency check
const processedKeys = new Set();

app.post('/api/cart/add', auth, async (req, res) => {
  const { productId, quantity, idempotencyKey } = req.body;
  
  if (processedKeys.has(idempotencyKey)) {
    return res.status(409).json({ message: 'Request already processed' });
  }
  
  processedKeys.add(idempotencyKey);
  
  // Cleanup old keys (older than 5 minutes)
  setTimeout(() => processedKeys.delete(idempotencyKey), 300000);
  
  // ... rest of add to cart logic
});
```

**Časovnica:** 3 dni  
**Odgovornost:** Frontend + Backend developer

---

### 5.4 Faza 4 - DDoS Protection (Teden 7)

#### F-025: DDoS Protection (RPN 180)
```javascript
// Express rate limiter
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// General API limiter
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:general:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter za auth endpoints
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Only 5 login attempts
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again in 5 minutes'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Cloudflare integration (DNS level)
// Configure Cloudflare dashboard:
// 1. Enable "Under Attack Mode" during DDoS
// 2. Set up Rate Limiting rules
// 3. Enable Bot Fight Mode
// 4. Configure WAF custom rules
```

**Časovnica:** 3 dni  
**Odgovornost:** DevOps  
**Strošek:** Cloudflare Pro plan $20/mesec, Redis hosting $10/mesec

---

## 6. Stroškovna Analiza

### 6.1 Enkratni Stroški

| Aktivnost | Čas (h) | Urna postavka (€) | Skupaj (€) |
|-----------|---------|-------------------|------------|
| XSS Protection implementacija | 24 | 50 | 1,200 |
| SQL Injection prevention | 16 | 50 | 800 |
| Memory leak fixes | 32 | 50 | 1,600 |
| Stock management refactor | 40 | 50 | 2,000 |
| Race condition fixes | 24 | 50 | 1,200 |
| DDoS protection setup | 24 | 50 | 1,200 |
| Logging system setup | 40 | 50 | 2,000 |
| Testing & QA | 40 | 40 | 1,600 |
| **SKUPAJ** | **240** | | **€11,600** |

### 6.2 Tekoči Mesečni Stroški

| Storitev | Cena (€/mesec) |
|----------|----------------|
| Elasticsearch hosting (logging) | 50 |
| Redis hosting (rate limiting) | 10 |
| Cloudflare Pro | 20 |
| Monitoring tools (Sentry/New Relic) | 30 |
| Backup storage | 15 |
| **SKUPAJ** | **€125/mesec** |

### 6.3 ROI Analiza

**Potencialne izgube brez ukrepov:**
- Izpad sistema (F-023): ~€500/uro × 4 ure/leto = €2,000
- XSS breach (F-005): Data breach kazni + izguba zaupanja = €50,000+
- DDoS napad (F-025): Izguba prihodka = €1,000/dan
- Stock issues (F-014): Nezadovoljni kupci, vračila = €500/mesec

**Skupna potencialna izguba:** €60,000+ letno

**Investicija:** €11,600 + (€125 × 12) = €13,100/leto

**ROI:** (€60,000 - €13,100) / €13,100 × 100 = **357%**

---

## 7. Monitoring in Verifikacija

### 7.1 KPI (Key Performance Indicators)

| KPI | Cilj | Trenutno | Metrika |
|-----|------|----------|---------|
| System Uptime | >99.9% | ~97% | Uptime monitor |
| API Response Time (P95) | <500ms | ~800ms | New Relic |
| Error Rate | <0.1% | ~1.2% | Sentry |
| Security Incidents | 0/mesec | 2-3/leto | Security logs |
| Memory Usage | <70% | ~85% | PM2/CloudWatch |
| Stock Discrepancy Rate | <0.01% | ~0.5% | Daily reconciliation |

### 7.2 Monitoring Tools

```javascript
// Health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    checks: {
      database: 'checking',
      redis: 'checking',
      diskSpace: 'checking'
    }
  };
  
  try {
    // Database check
    await mongoose.connection.db.admin().ping();
    health.checks.database = 'OK';
    
    // Redis check
    await redisClient.ping();
    health.checks.redis = 'OK';
    
    // Disk space check
    const disk = await diskusage.check('/');
    health.checks.diskSpace = {
      status: disk.available > 1e9 ? 'OK' : 'WARNING',
      availableGB: (disk.available / 1e9).toFixed(2)
    };
    
    res.status(200).json(health);
  } catch (error) {
    health.status = 'ERROR';
    res.status(503).json(health);
  }
});

// Sentry integration
const Sentry = require('@sentry/node');
Sentry.init({ 
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### 7.3 Alert Policy

| Severity | Response Time | Notification |
|----------|---------------|--------------|
| Critical (RPN >200) | Immediate | SMS + Call + Slack |
| High (RPN 150-200) | 15 minut | Slack + Email |
| Medium (RPN 100-149) | 1 ura | Email |
| Low (RPN <100) | Daily digest | Email |

---

## 8. Testiranje

### 8.1 Test Coverage po FMEA

| ID | Test Scenario | Test Type | Status |
|----|---------------|-----------|--------|
| F-005 | XSS input sanitization | Security | ✅ Playwright TC-005 |
| F-010 | SQL injection attempts | Security | 🟡 Potrebno |
| F-012 | Double-click košarica | Functional | 🟡 Manual |
| F-014 | Concurrent checkout | Load | 🔴 Potrebno |
| F-017 | Negativne količine | Functional | ✅ Playwright TC-006 |
| F-023 | Memory leak pod obremenitvijo | Performance | 🔴 Potrebno |
| F-025 | DDoS simulation | Security | 🔴 Potrebno |

### 8.2 Novi Testi

```javascript
// Test F-014: Race condition checkout
// Artillery load test config
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 50 // 50 users/second
scenarios:
  - name: "Concurrent Checkout"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "test123"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/api/cart/add"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            productId: "{{ productId }}"
            quantity: 1
      - post:
          url: "/api/orders/checkout"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            address: "Test Address 123"

// Test F-010: SQL Injection
describe('SQL Injection Prevention', () => {
  const maliciousInputs = [
    "'; DROP TABLE products; --",
    "1' OR '1'='1",
    "<script>alert('XSS')</script>",
    "'; UPDATE products SET price=0; --"
  ];
  
  for (const input of maliciousInputs) {
    it(`should safely handle: ${input}`, async () => {
      const response = await fetch('/api/products?search=' + encodeURIComponent(input));
      expect(response.status).toBeLessThan(500);
      // Verify database integrity
      const productCount = await Product.countDocuments();
      expect(productCount).toBeGreaterThan(0);
    });
  }
});
```

---

## 9. Sklep

### 9.1 Povzetek Analize

FMEA analiza E-Commerce Orders Management Sistema je identificirala **27 potencialnih načinov odpovedi** v 5 ključnih procesnih območjih. Analiza je razkrila:

- **6 kritičnih problemov** (RPN ≥ 150) ki zahtevajo takojšnje ukrepanje
- **8 visokih problemov** (RPN 100-149) z srednjeročno prioriteto
- **13 srednjih in nizkih problemov** (RPN < 100) za dolgoročno optimizacijo

### 9.2 Največje Tveganja

1. **XSS napad (RPN 240)** - Kritična varnostna ranljivost
2. **Logging disk full (RPN 210)** - Infrastrukturni risk
3. **Stock race condition (RPN 200)** - Business logic napaka
4. **DDoS napad (RPN 180)** - Availability risk

---

## 10. Priloge

### 10.1 Reference

- FMEA Standard: IEC 60812:2018
- OWASP Top 10 Web Application Security Risks
- MongoDB Best Practices Guide
- Node.js Security Best Practices

### 10.2 Orodja

- **Testing:** Playwright, Artillery, OWASP ZAP
- **Monitoring:** Sentry, New Relic, Elasticsearch + Kibana
- **Security:** DOMPurify, Helmet.js, express-rate-limit
- **Infrastructure:** PM2, Redis, Cloudflare

### 10.3 Kontakt

**Avtor:** Jan Wolf  
**Email:** jan.wolf9@gmail.com  
**Datum:** 7. december 2025  
**Verzija dokumenta:** 1.0

---

**Podpis:**  
_________________________  
Jan Wolf, Vodja projekta

**Datum odobritve:**  
_________________________

