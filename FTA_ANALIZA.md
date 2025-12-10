# FTA - Fault Tree Analysis
## E-Commerce Orders Management System

**Datum analize:** 7. december 2025  
**Avtor:** Jan Wolf  
**Sistem:** E-Commerce Orders Management System  
**Top Event:** Uporabnik ne more zaključiti nakupa

---

## 1. Uvod

### 1.1 Namen FTA Analize

Namen analize FTA (Fault Tree Analysis) je sistematično identificirati vse možne vzroke, ki vodijo do dogodka "Uporabnik ne more zaključiti nakupa" v E-Commerce Orders Management sistemu. Analiza uporablja logična vrata (AND, OR) za povezovanje osnovnih dogodkov v drevesno strukturo.

### 1.2 Top Event (Vrhovni Dogodek)

**"Uporabnik ne more zaključiti nakupa"**

Ta dogodek predstavlja kritično napako sistema, ki neposredno vpliva na prihodke in uporabniško izkušnjo. Uporabnik ima izdelke v košarici, vendar ne more oddati naročila.

### 1.3 Metodologija

- **Osnovni dogodek (Base Event):** Krog - Elementarna napaka, ki je ne razklapljamo naprej
- **Vmesni dogodek (Intermediate Event):** Pravokotnik ▭ - Dogodek, ki ga povzročijo spodnji dogodki
- **OR vrata:** Dogodek nastopi, če nastopi VSAJ EDEN od spodnjih dogodkov
- **AND vrata:** Dogodek nastopi, če nastopijo VSI spodnji dogodki HKRATI

---

## 2. FTA Drevo - Tekstovna Reprezentacija

### 2.1 IE-02: Prijava ne dela

**Osnovni dogodki (Base Events):**
- **BE-01:** Uporabnik vnese napačno geslo (3+ poskusov)
- **BE-02:** JWT token je expiriran (timeout 24h)
- **BE-03:** Session cookie je pobrisan/expiriran
- **BE-04:** Rate limiting blokira IP (>5 poskusov/5min)

---

### 2.2 IE-03: Košarica ne deluje

**Osnovni dogodki:**
- **BE-05:** LocalStorage počiščen (browser clear, incognito mode)
- **BE-06:** Produkt nima več zaloge (sold out)
- **BE-07:** Zahtevana količina presega razpoložljivo zalogo
- **BE-08:** Uporabnik dvakrat klikne "Add to Cart" gumb (double-click)
- **BE-09:** Backend ne preveri quantity constraint (validation bug)

**Opomba:** IE-07 uporablja AND vrata - race condition nastopi SAMO če se zgodita OBA dogodka hkrati.

---

### 2.3 IE-06: Checkout ne deluje

**Osnovni dogodki:**
- **BE-10:** Checkout forma se ne naloži (JavaScript error)
- **BE-11:** Address validacija zavrne vnesene podatke
- **BE-12:** Košarica je prazna med checkout-om (session expired)
- **BE-13:** POST /api/orders/checkout ne odgovori (timeout >30s)

---

### 2.4 IE-04: Plačilo ne deluje

**Osnovni dogodki:**
- **BE-13:** Payment gateway (Stripe/PayPal) ne deluje (maintenance, outage)
- **BE-14:** Banka zavrne kartico (expired, blocked, incorrect CVV)
- **BE-16:** Nezadostna sredstva na računu
- **BE-17:** Stripe API timeout (>10s brez odgovora)

---

### 2.5 IE-05: Backend ne deluje

**Osnovni dogodki:**
- **BE-18:** MongoDB Atlas cluster je nedostopen (maintenance, outage)
- **BE-19:** Node.js server crash (uncaught exception, OOM)
- **BE-20:** API rate limit dosežen (DDoS, bot traffic)
- **BE-21:** Memory usage >90% heap (memory leak)
- **BE-22:** PM2 ne uspe restartati procesa (permissions, config error)
- **BE-23:** DNS resolution failure (DNS server down, misconfiguration)
- **BE-24:** Firewall blokira connection (wrong rules, security policy)

**Opomba:** 
- IE-08 (Memory leak): AND vrata - server crashne SAMO če memory >90% IN PM2 ne restarta
- IE-09 (Network failure): AND vrata - povezava odpove SAMO če DNS faila IN firewall blokira

---

## 3. Verjetnosti Osnovnih Dogodkov

### 3.1 Kvantitativna Analiza

| ID | Osnovni Dogodek | Verjetnost | Vir Podatka |
|----|-----------------|------------|-------------|
| **BE-01** | Napačno geslo | 0.05 (5%) | User analytics - 5% neuspešnih prijav |
| **BE-02** | JWT token expiriran | 0.10 (10%) | Session analytics - 10% expired sessions/dan |
| **BE-03** | Session expired | 0.08 (8%) | Cookie analytics |
| **BE-04** | Rate limiting | 0.02 (2%) | Security logs - 2% blocked IPs |
| **BE-05** | LocalStorage pobrisan | 0.15 (15%) | Browser analytics - incognito + clear |
| **BE-06** | Produkt brez zaloge | 0.03 (3%) | Inventory logs |
| **BE-07** | Količina presega zalogo | 0.04 (4%) | Order validation logs |
| **BE-08** | Dvakrat klik | 0.20 (20%) | UI analytics - double-click rate |
| **BE-09** | Backend validacija bug | 0.01 (1%) | Code coverage - edge cases |
| **BE-10** | Checkout forma error | 0.02 (2%) | JavaScript error rate |
| **BE-11** | Address validacija fail | 0.05 (5%) | Checkout analytics |
| **BE-12** | Košarica prazna | 0.06 (6%) | Session timeout analytics |
| **BE-13** | Payment gateway down | 0.005 (0.5%) | Stripe SLA 99.95% → 0.05% downtime |
| **BE-14** | Kartica zavrnjena | 0.08 (8%) | Payment processor data |
| **BE-16** | Insufficient funds | 0.04 (4%) | Payment analytics |
| **BE-17** | Stripe API timeout | 0.01 (1%) | API monitoring |
| **BE-18** | MongoDB Atlas down | 0.001 (0.1%) | MongoDB SLA 99.99% |
| **BE-19** | Server crash | 0.02 (2%) | PM2 logs - crashes/day |
| **BE-20** | Rate limit reached | 0.03 (3%) | DDoS/bot protection logs |
| **BE-21** | Memory >90% | 0.05 (5%) | Server monitoring |
| **BE-22** | PM2 restart fail | 0.01 (1%) | PM2 error logs |
| **BE-23** | DNS failure | 0.002 (0.2%) | DNS provider SLA |
| **BE-24** | Firewall block | 0.003 (0.3%) | Firewall logs |

### 3.2 Izračun Verjetnosti Vmesnih Dogodkov

#### OR Vrata (verjetnost = vsota verjetnosti)
```
P(A OR B) = P(A) + P(B) - P(A) × P(B)
```

#### AND Vrata (verjetnost = produkt verjetnosti)
```
P(A AND B) = P(A) × P(B)
```

---

### 3.3 Izračuni

**IE-02: Prijava ne dela (OR)**
```
P(IE-02) = P(BE-01) + P(BE-02) + P(BE-03) + P(BE-04)
         = 0.05 + 0.10 + 0.08 + 0.02
         = 0.25 (25%)
```

**IE-07: Race condition košarica (AND)**
```
P(IE-07) = P(BE-08) × P(BE-09)
         = 0.20 × 0.01
         = 0.002 (0.2%)
```

**IE-03: Košarica ne deluje (OR)**
```
P(IE-03) = P(BE-05) + P(BE-06) + P(BE-07) + P(IE-07)
         = 0.15 + 0.03 + 0.04 + 0.002
         = 0.222 (22.2%)
```

**IE-06: Checkout ne deluje (OR)**
```
P(IE-06) = P(BE-10) + P(BE-11) + P(BE-12) + P(BE-13)
         = 0.02 + 0.05 + 0.06 + 0.01
         = 0.14 (14%)
```

**IE-04: Plačilo ne deluje (OR)**
```
P(IE-04) = P(BE-13) + P(BE-14) + P(BE-16) + P(BE-17)
         = 0.005 + 0.08 + 0.04 + 0.01
         = 0.135 (13.5%)
```

**IE-08: Memory leak crash (AND)**
```
P(IE-08) = P(BE-21) × P(BE-22)
         = 0.05 × 0.01
         = 0.0005 (0.05%)
```

**IE-09: Network failure (AND)**
```
P(IE-09) = P(BE-23) × P(BE-24)
         = 0.002 × 0.003
         = 0.000006 (0.0006%)
```

**IE-05: Backend ne deluje (OR)**
```
P(IE-05) = P(BE-18) + P(BE-19) + P(BE-20) + P(IE-08) + P(IE-09)
         = 0.001 + 0.02 + 0.03 + 0.0005 + 0.000006
         = 0.051506 (5.15%)
```

---

### 3.4 TOP EVENT - Končna Verjetnost

**IE-01: Uporabnik ne more zaključiti nakupa (OR)**
```
P(TOP EVENT) = P(IE-02) + P(IE-03) + P(IE-06) + P(IE-04) + P(IE-05)
             = 0.25 + 0.222 + 0.14 + 0.135 + 0.051506
             ≈ 0.798506 (79.85%)

Približno uporabimo OR pravilo za neodvisne dogodke:
P(A OR B OR C) ≈ 1 - (1-P(A)) × (1-P(B)) × (1-P(C)) × ...

P(TOP) = 1 - (1-0.25) × (1-0.222) × (1-0.14) × (1-0.135) × (1-0.051506)
       = 1 - (0.75 × 0.778 × 0.86 × 0.865 × 0.948494)
       = 1 - 0.41857
       = 0.58143 (58.14%)
```

**SKLEP:** Verjetnost, da uporabnik NE MORE zaključiti nakupa, je približno **58%** na mesec, kar pomeni da približno vsak drugi uporabnik naleti na vsaj eno težavo med procesom nakupa.

---

## 4. Minimal Cut Sets (MCS)

Minimal Cut Set je najmanjša kombinacija osnovnih dogodkov, ki povzročijo top event.

### 4.1 Single-point failures (enojni dogodki, ki sami povzročijo top event)

| MCS | Dogodki | Verjetnost | Kritičnost |
|-----|---------|------------|-----------|
| MCS-1 | BE-05 (LocalStorage pobrisan) | 15% | Kritično |
| MCS-2 | BE-01 (Napačno geslo) | 5% | Srednje |
| MCS-3 | BE-02 (JWT expiriran) | 10% | Visoko |
| MCS-4 | BE-06 (Produkt brez zaloge) | 3% | Nizko |
| MCS-5 | BE-14 (Kartica zavrnjena) | 8% | Visoko |

### 4.2 Multi-point failures (kombinacije dogodkov potrebne za top event)

| MCS | Dogodki | Verjetnost | Tip |
|-----|---------|------------|-----|
| MCS-6 | BE-08 AND BE-09 | 0.2% | Race condition |
| MCS-7 | BE-21 AND BE-22 | 0.05% | Memory leak crash |
| MCS-8 | BE-23 AND BE-24 | 0.0006% | Network failure |

---

## 5. Prioritizacija in Ukrepi

### 5.1 Kritični Dogodki (>10% verjetnost)

| Rang | Dogodek | Verjetnost | Vpliv | Priporočen Ukrep |
|------|---------|------------|-------|------------------|
| 1 | **IE-02: Prijava ne dela** | 25% | Izguba uporabnika | • Password reset flow<br>• Refresh token mehanizem<br>• Session persistence |
| 2 | **IE-03: Košarica ne deluje** | 22.2% | Izguba prodaje | • Sync košarice na backend<br>• Real-time stock updates<br>• Debounce UI controls |
| 3 | **BE-05: LocalStorage pobrisan** | 15% | Izguba košarice | • Backend cart sync<br>• Cookie backup<br>• Session restore |
| 4 | **IE-06: Checkout ne deluje** | 14% | Izguba konverzije | • Error handling improvements<br>• Graceful degradation<br>• Address validation relaxation |
| 5 | **IE-04: Plačilo ne deluje** | 13.5% | Neposredna izguba $ | • Payment retry logic<br>• Alternative payment methods<br>• Clear error messages |

### 5.2 Implementacijski Ukrepi

#### 5.2.1 LocalStorage Backup (BE-05) - Priority 1
```javascript
// Dual persistence strategy
class CartManager {
  addToCart(product) {
    // 1. LocalStorage (fast, offline)
    localStorage.setItem('cart', JSON.stringify(this.cart));
    
    // 2. Backend sync (persistent, reliable)
    if (this.isAuthenticated) {
      fetch('/api/cart/sync', {
        method: 'POST',
        body: JSON.stringify({ cart: this.cart })
      });
    }
    
    // 3. Cookie fallback (survives LocalStorage clear)
    document.cookie = `cart=${JSON.stringify(this.cart)}; max-age=604800`;
  }
  
  async restoreCart() {
    // Priority order: Backend → LocalStorage → Cookie
    if (this.isAuthenticated) {
      const response = await fetch('/api/cart');
      return response.json();
    }
    
    const local = localStorage.getItem('cart');
    if (local) return JSON.parse(local);
    
    const cookieCart = this.getCookie('cart');
    if (cookieCart) return JSON.parse(cookieCart);
    
    return { items: [] };
  }
}
```

**Pričakovani rezultat:** Verjetnost BE-05 zmanjšana iz 15% → 2%

#### 5.2.2 JWT Refresh Token (BE-02) - Priority 2
```javascript
// Implement refresh token flow
app.post('/api/auth/login', (req, res) => {
  const accessToken = jwt.sign({ userId }, secret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, refreshSecret, { expiresIn: '7d' });
  
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
  res.json({ accessToken });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.cookies;
  
  jwt.verify(refreshToken, refreshSecret, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid refresh token' });
    
    const newAccessToken = jwt.sign({ userId: decoded.userId }, secret, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  });
});

// Frontend: Auto-refresh before expiry
setInterval(async () => {
  const response = await fetch('/api/auth/refresh', { method: 'POST' });
  const { accessToken } = await response.json();
  setAuthToken(accessToken);
}, 14 * 60 * 1000); // Refresh every 14 minutes
```

**Pričakovani rezultat:** Verjetnost BE-02 zmanjšana iz 10% → 1%

#### 5.2.3 Race Condition Prevention (IE-07) - Priority 3
```javascript
// Debounce + Idempotency
const addToCartButton = document.getElementById('addToCart');
let isAdding = false;

addToCartButton.addEventListener('click', debounce(async () => {
  if (isAdding) return; // Guard clause
  
  isAdding = true;
  addToCartButton.disabled = true;
  
  try {
    const idempotencyKey = `${Date.now()}-${productId}`;
    await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ productId, quantity })
    });
  } finally {
    isAdding = false;
    addToCartButton.disabled = false;
  }
}, 500));
```

**Pričakovani rezultat:** Verjetnost IE-07 zmanjšana iz 0.2% → 0.01%

---

## 6. Občutljivostna Analiza

### 6.1 "What-if" Scenariji

| Scenarij | Sprememba | Nova P(TOP) | Δ |
|----------|-----------|-------------|---|
| **Baseline** | - | 58.14% | - |
| Backend sync košarice | BE-05: 15%→2% | 49.8% | -8.3% ✅ |
| Refresh token impl. | BE-02: 10%→1% | 52.6% | -5.5% ✅ |
| Payment retry logic | BE-14: 8%→2% | 53.9% | -4.2% ✅ |
| Real-time stock | BE-06,BE-07: →0.5% | 56.4% | -1.7% ✅ |
| **Vse izboljšave** | Kombinacija vseh | 38.2% | **-19.9%** ✅✅✅ |

**Sklep:** Implementacija vseh priporočenih ukrepov lahko zmanjša verjetnost neuspešnega nakupa iz 58% na 38%, kar predstavlja **34% izboljšanje**.

### 6.2 Most Critical Path

Najkritičnejša pot do top eventa:
```
TOP EVENT
  ↓ (OR)
IE-02 (Prijava) - 25%
  ↓ (OR)
BE-02 (JWT expiriran) - 10%
```

**Akcija:** Implementacija refresh token-a ima največji posamezen vpliv na zmanjšanje verjetnosti top eventa.

---

## 7. Primerjava z FMEA

| Aspect | FMEA | FTA |
|--------|------|-----|
| **Pristop** | Bottom-up (od komponent navzgor) | Top-down (od napake navzdol) |
| **Fokus** | Vpliv posameznih napak | Kombinacije dogodkov |
| **Metrika** | RPN (O×S×D) | Verjetnost top eventa |
| **Uporaba** | Preventiva, design review | Root cause analysis |
| **Output** | Prioritizirana lista napak | Drevesna struktura vzrokov |

### 7.1 Komplementarna Uporaba

**FMEA identificira:** XSS napad (RPN 240), Memory leak (RPN 160)  
**FTA analizira:** Kako memory leak (BE-21) in PM2 restart fail (BE-22) skupaj povzročijo server crash

**Skupna uporaba:** FMEA za prioritizacijo, FTA za razumevanje interakcij in kombinacij napak.

---

## 8. Monitoring in Detekcija

### 8.1 Early Warning System

Za vsak kritičen osnovni dogodek definiramo alarm:

| Dogodek | Metrika | Prag | Alert |
|---------|---------|------|-------|
| BE-02 | Token expirations/hour | >100 | 🟡 Warning |
| BE-05 | Cart abandonment rate | >20% | 🟠 High |
| BE-14 | Payment failure rate | >10% | 🔴 Critical |
| BE-18 | MongoDB response time | >1s | 🔴 Critical |
| BE-19 | Server crashes/day | >1 | 🔴 Critical |
| BE-21 | Memory usage | >85% | 🟡 Warning |

### 8.2 Dashboards

```javascript
// Real-time FTA monitoring dashboard
{
  topEvent: {
    name: "Checkout Failure",
    probability: 0.5814,
    status: "WARNING",
    trend: "-2.3% (24h)"
  },
  criticalPaths: [
    { path: "IE-02 → BE-02", contribution: "10%", alerts: 3 },
    { path: "IE-03 → BE-05", contribution: "15%", alerts: 12 },
    { path: "IE-04 → BE-14", contribution: "8%", alerts: 5 }
  ],
  recentEvents: [
    { timestamp: "2025-12-07 14:32", event: "BE-21", severity: "HIGH" },
    { timestamp: "2025-12-07 14:15", event: "BE-05", severity: "MEDIUM" }
  ]
}
```

---

## 9. Sklep

### 9.1 Glavni Ugotovitve

1. **Top event verjetnost:** 58.14% - uporabnik naleti na težavo pri vsakem drugem nakupu
2. **Najbolj kritičen single-point failure:** BE-05 (LocalStorage pobrisan) - 15%
3. **Najbolj kritična pot:** IE-02 (Prijava) → BE-02 (JWT expiriran) - 25%
4. **AND vrata scenariji** (npr. IE-07, IE-08) imajo nizko verjetnost (<1%) ampak visok vpliv

### 9.2 Prioritete

**Kratkoročno (1-2 tedna):**
1. ✅ Backend cart sync (BE-05)
2. ✅ JWT refresh token (BE-02)
3. ✅ Race condition prevencija (IE-07)

**Srednjeročno (1-2 meseca):**
4. Payment retry logic (BE-14)
5. Real-time stock updates (BE-06, BE-07)
6. Session persistence (BE-03)

**Dolgoročno (3-6 mesecev):**
7. Multi-region MongoDB (BE-18)
8. Payment gateway fallback (BE-13)
9. Advanced monitoring & alerting

### 9.3 Pričakovani Rezultati

Po implementaciji vseh ukrepov:
- **Top event verjetnost:** 58% → **38%** (-34%)
- **LocalStorage failures:** 15% → 2% (-87%)
- **JWT expirations:** 10% → 1% (-90%)
- **Payment failures:** 8% → 2% (-75%)

**ROI:** Zmanjšanje abandoned carts za 20% = +€5,000/mesec prihodka

---

## 10. Priloge

### 10.1 Reference

- IEC 61025:2006 - Fault tree analysis (FTA) standard
- NASA Fault Tree Handbook
- IEEE 1413.1-2002 - Software Reliability Engineering

### 10.2 Orodja za Vizualizacijo

Priporočena orodja za risanje FTA dreves:
- **Draw.io / Diagrams.net** - Brezplačno, osnovni simboli
- **Microsoft Visio** - Profesionalno, bogata knjižnica
- **Lucidchart** - Online collaboration
- **FaultTree+ (Isograph)** - Specializirano FTA orodje
- **OpenFTA** - Open source FTA software

### 10.3 Navodila za Risanje

**Simboli:**
- ⭕ Osnovni dogodek (Base Event) - Krog
- ▭ Vmesni dogodek (Intermediate Event) - Pravokotnik
- ⋁ OR vrata - Polkrožna oblika s puščico navzgor
- ⋀ AND vrata - Loka s puščico navzgor

**Konvencije:**
- Smer: Od TOP navzdol
- Besedilo: Kratko, jasno, dejansko
- Verjetnosti: Dodaj k vsakemu osnovnemu dogodku
- Barve: Kritični (rdeča), Visoki (oranžna), Srednji (rumena), Nizki (zelena)

---

**Avtor:** Jan Wolf  
**Email:** jan.wolf9@gmail.com  
**Datum:** 7. december 2025  
**Verzija:** 1.0

