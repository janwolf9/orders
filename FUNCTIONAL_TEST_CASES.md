# Testni primeri za funkcionalno testiranje - E-Commerce Orders Management System

## TESTNI PRIMERI

### **TC-001: Registracija novega uporabnika**

| **Atribut** | **Vrednost** |
|-------------|--------------|
| **ID testnega primera** | TC-001 |
| **Naziv** | Registracija novega uporabnika z veljavnimi podatki |
| **Opis** | Preveri uspešno registracijo novega uporabnika z vsemi obveznimi podatki |
| **Prioriteta** | Visoka |
| **Kategorija** | Pozitivni test |
| **Modul** | Upravljanje uporabnikov |
| **Predpogoji** | <ul><li>Sistem je dostopen</li><li>Baza podatkov je aktivna</li><li>Email naslov še ni registriran</li></ul> |
| **Vhodni podatki** | <ul><li>Username: "testuser123"</li><li>Email: "test@example.com"</li><li>Password: "SecurePass123"</li><li>Confirm Password: "SecurePass123"</li></ul> |
| **Koraki izvajanja** | 
1. Odpri aplikacijo Prikaže se login page<br/> 
2. Klikni na "Register" tab<br/>
3. Vnesi username "testuser123"<br/>
4. Vnesi email "test@example.com"<br/>
5. Vnesi password "SecurePass123"<br/>
6. Vnesi confirm password "SecurePass123"<br/>7
. Klikni gumb "Register" |
| **Pričakovani rezultat** | <ul><li>Prikaže se sporočilo "Registration successful"</li><li>Uporabnik je avtomatsko prijavljen</li><li>Navigacija prikazuje opcije za prijavljenega uporabnika</li><li>Dashboard prikazuje uporabniške statistike</li><li>Novega uporabnika najdemo v bazi podatkov</li></ul> |
| **Dejanski rezultat** | _(izpolni med testiranjem)_ |
| **Status** | _(Pass/Fail)_ |
| **Opombe** | Test mora biti izveden z novim email naslovom |
| **Avtor** | Tester |
| **Datum ustvarjanja** | 13.10.2025 |
| **Datum zadnje posodobitve** | 13.10.2025 |

---

### **TC-002: Dodajanje produkta v košarico**

| **Atribut** | **Vrednost** |
|-------------|--------------|
| **ID testnega primera** | TC-002 |
| **Naziv** | Dodajanje produkta v košarico z veljavno količino |
| **Opis** | Preveri uspešno dodajanje produkta v košarico pri prijavljenem uporabniku |
| **Prioriteta** | Kritična |
| **Kategorija** | Pozitivni test |
| **Modul** | Upravljanje košarice |
| **Predpogoji** | <ul><li>Uporabnik je prijavljen</li><li>Obstaja vsaj en produkt z zadostno zalogo</li><li>Košarica je dostopna</li></ul> |
| **Vhodni podatki** | <ul><li>Produkt: "Test Product" (na zalogi: 10 kosov)</li><li>Količina: 2</li></ul> |
| **Koraki izvajanja** | 1. Prijavi se kot obstoječi uporabnik<br/>2. Navigiraj na "Products" sekcijo<br/>3. Poišči produkt "Test Product"<br/>4. Preveri, da je na zalogi (Stock: 10)<br/>5. Vnesi količino "2"<br/>6. Klikni "Add to Cart"<br/>7. Preveri count v košarici ikoni<br/>8. Odpri košarico |
| **Pričakovani rezultat** | <ul><li>Prikaže se toast sporočilo "Product added to cart"</li><li>Košarica ikona prikazuje "2" items</li><li>V košarici je vidno "Test Product" z količino 2</li><li>Celotna cena je pravilno izračunana</li><li>Stock produkta se zmanjša na 8</li></ul> |
| **Dejanski rezultat** | _(izpolni med testiranjem)_ |
| **Status** | _(Pass/Fail)_ |
| **Opombe** | Preveriti je treba tudi posodobitev zaloge |
| **Avtor** | Tester |
| **Datum ustvarjanja** | 13.10.2025 |
| **Datum zadnje posodobitve** | 13.10.2025 |

---

### **TC-003: Oddaja naročila (Checkout proces)**

| **Atribut** | **Vrednost** |
|-------------|--------------|
| **ID testnega primera** | TC-003 |
| **Naziv** | Uspešna oddaja naročila z veljavnimi podatki |
| **Opis** | Preveri celoten checkout proces od košarice do uspešnega naročila |
| **Prioriteta** | Kritična |
| **Kategorija** | Pozitivni test |
| **Modul** | Upravljanje naročil |
| **Predpogoji** | <ul><li>Uporabnik je prijavljen</li><li>V košarici je vsaj en produkt</li><li>Produkt ima zadostno zalogo</li></ul> |
| **Vhodni podatki** | <ul><li>Shipping Address: "Test Street 123, Ljubljana"</li><li>Payment Method: "Credit Card"</li><li>Card Number: "4111111111111111"</li><li>Billing same as shipping: true</li></ul> |
| **Koraki izvajanja** | 1. Prijavi se in dodaj produkt v košarico<br/>2. Klikni na košarica ikono<br/>3. V košarici klikni "Proceed to Checkout"<br/>4. Vnesi shipping address "Test Street 123, Ljubljana"<br/>5. Izberi payment method "Credit Card"<br/>6. Vnesi card number "4111111111111111"<br/>7. Označi "Same as shipping address" za billing<br/>8. Klikni "Place Order" |
| **Pričakovani rezultat** | <ul><li>Prikaže se "Order placed successfully" sporočilo</li><li>Generirano je novo naročilo s statusom "pending"</li><li>Naročilo je vidno v "My Orders" sekciji</li><li>Košarica je izpraznjena</li><li>Stock produktov je posodobljen</li><li>Email potrdilo je poslano (če implementirano)</li></ul> |
| **Dejanski rezultat** | _(izpolni med testiranjem)_ |
| **Status** | _(Pass/Fail)_ |
| **Opombe** | Test kartni številki je standardna test vrednost |
| **Avtor** | Tester |
| **Datum ustvarjanja** | 13.10.2025 |
| **Datum zadnje posodobitve** | 13.10.2025 |

---

### **TC-004: Upravljanje uporabnikov (Admin funkcionalnost)**

| **Atribut** | **Vrednost** |
|-------------|--------------|
| **ID testnega primera** | TC-004 |
| **Naziv** | Admin pregled in upravljanje uporabnikov |
| **Opis** | Preveri admin funkcionalnost za pregled in upravljanje vseh uporabnikov |
| **Prioriteta** | Srednja |
| **Kategorija** | Pozitivni test |
| **Modul** | Admin panel |
| **Predpogoji** | <ul><li>Admin uporabnik je prijavljen</li><li>V sistemu obstaja vsaj 3 uporabniki</li><li>Admin ima potrebne pravice</li></ul> |
| **Vhodni podatki** | <ul><li>Admin credentials: admin/admin123</li><li>Search query: "test"</li><li>Target user za brisanje</li></ul> |
| **Koraki izvajanja** | 1. Prijavi se kot admin (admin/admin123)<br/>2. Navigiraj na "Users" tab v admin sekciji<br/>3. Preveri prikaz vseh uporabnikov<br/>4. Uporabi search funkcionalnost z "test"<br/>5. Klikni "Details" pri enem uporabniku<br/>6. Preveri modal z uporabnikovo statistiko<br/>7. Zapri modal in izberi uporabnika za brisanje<br/>8. Klikni "Delete" in potrdi akcijo |
| **Pričakovani rezultat** | <ul><li>Prikazani so vsi uporabniki v card formatu</li><li>Search filtrira uporabnike po imenu/email</li><li>Details modal prikazuje uporabnikove statistike</li><li>Modal vsebuje tabs za Orders in Cart</li><li>Delete funkcionalnost deluje s potrditvenim dialogom</li><li>Uporabnik je odstranjen iz seznama</li></ul> |
| **Dejanski rezultat** | _(izpolni med testiranjem)_ |
| **Status** | _(Pass/Fail)_ |
| **Opombe** | Test zahteva admin pravice |
| **Avtor** | Tester |
| **Datum ustvarjanja** | 13.10.2025 |
| **Datum zadnje posodobitve** | 13.10.2025 |

---

### **TC-005: Validacija napačnih podatkov pri registraciji**

| **Atribut** | **Vrednost** |
|-------------|--------------|
| **ID testnega primera** | TC-005 |
| **Naziv** | Negativni test - registracija z neveljavnimi podatki |
| **Opis** | Preveri pravilno obravnavo napačnih podatkov pri registraciji |
| **Prioriteta** | Visoka |
| **Kategorija** | Negativni test |
| **Modul** | Validacija in error handling |
| **Predpogoji** | <ul><li>Sistem je dostopen</li><li>Registration forma je dostopna</li></ul> |
| **Vhodni podatki** | <ul><li>Username: "ab" (prekratek)</li><li>Email: "invalid-email" (napačen format)</li><li>Password: "123" (prešibek)</li><li>Confirm Password: "456" (se ne ujema)</li></ul> |
| **Koraki izvajanja** | 1. Odpri aplikacijo<br/>2. Klikni na "Register" tab<br/>3. Vnesi username "ab"<br/>4. Vnesi email "invalid-email"<br/>5. Vnesi password "123"<br/>6. Vnesi confirm password "456"<br/>7. Klikni gumb "Register"<br/>8. Preveri prikazana error sporočila |
| **Pričakovani rezultat** | <ul><li>Username error: "Username must be at least 3 characters"</li><li>Email error: "Please enter a valid email address"</li><li>Password error: "Password must be at least 8 characters"</li><li>Confirm password error: "Passwords do not match"</li><li>Registracija ni uspešna</li><li>Uporabnik ostane na registration formi</li></ul> |
| **Dejanski rezultat** | _(izpolni med testiranjem)_ |
| **Status** | _(Pass/Fail)_ |
| **Opombe** | Test preverja frontend in backend validacijo |
| **Avtor** | Tester |
| **Datum ustvarjanja** | 13.10.2025 |
| **Datum zadnje posodobitve** | 13.10.2025 |

---

## 🔗 MATRIKA POVEZAV MED FUNKCIONALNOSTMI IN TESTNIMI PRIMERI

### **Definicije funkcionalnosti**

| **ID** | **Funkcionalnost** | **Opis** |
|--------|-------------------|----------|
| **F-001** | Registracija uporabnikov | Omogoča registracijo novih uporabnikov z validacijo podatkov |
| **F-002** | Avtentikacija in avtorizacija | Prijava/odjava uporabnikov in preverjanje pravic |
| **F-003** | Upravljanje košarice | Dodajanje, odstranjevanje in spreminjanje produktov v košarici |
| **F-004** | Upravljanje zalog | Sledenje in posodabljanje zaloge produktov |
| **F-005** | Checkout proces | Celoten proces oddaje naročila od košarice do plačila |
| **F-006** | Upravljanje naročil | Prikaz, sledenje in upravljanje naročil |
| **F-007** | Admin upravljanje uporabnikov | Admin funkcije za pregled in upravljanje vseh uporabnikov |
| **F-008** | Iskanje in filtriranje | Funkcionalnost iskanja uporabnikov in produktov |
| **F-009** | Validacija vhodnih podatkov | Frontend in backend validacija vseh uporabniških vnosov |
| **F-010** | Error handling | Pravilno prikazovanje in obravnava napak |
| **F-011** | Uporabniški vmesnik | Prikazovanje različnih vsebin glede na vrsto uporabnika |
| **F-012** | Statistike in poročila | Prikaz uporabniških in admin statistik |

### **Matrika pokritosti**

| **Funkcionalnost** | **TC-001** | **TC-002** | **TC-003** | **TC-004** | **TC-005** | **Skupaj testov** |
|-------------------|------------|------------|------------|------------|------------|------------------|
| **F-001** Registracija | ✅ | ❌ | ❌ | ❌ | ✅ | 2 |
| **F-002** Avtentikacija | ✅ | ✅ | ✅ | ✅ | ❌ | 4 |
| **F-003** Upravljanje košarice | ❌ | ✅ | ✅ | ❌ | ❌ | 2 |
| **F-004** Upravljanje zalog | ❌ | ✅ | ✅ | ❌ | ❌ | 2 |
| **F-005** Checkout proces | ❌ | ❌ | ✅ | ❌ | ❌ | 1 |
| **F-006** Upravljanje naročil | ❌ | ❌ | ✅ | ✅ | ❌ | 2 |
| **F-007** Admin upravljanje | ❌ | ❌ | ❌ | ✅ | ❌ | 1 |
| **F-008** Iskanje in filtriranje | ❌ | ❌ | ❌ | ✅ | ❌ | 1 |
| **F-009** Validacija podatkov | ✅ | ✅ | ✅ | ❌ | ✅ | 4 |
| **F-010** Error handling | ❌ | ✅ | ✅ | ✅ | ✅ | 4 |
| **F-011** Uporabniški vmesnik | ✅ | ✅ | ✅ | ✅ | ✅ | 5 |
| **F-012** Statistike | ✅ | ❌ | ❌ | ✅ | ❌ | 2 |

### **Analiza pokritosti**

| **Statistika** | **Vrednost** |
|----------------|--------------|
| **Skupaj funkcionalnosti** | 12 |
| **Pokrite funkcionalnosti** | 12 (100%) |
| **Najvišja pokritost** | F-011 (Uporabniški vmesnik) - 5 testov |
| **Najnižja pokritost** | F-005, F-007, F-008 - 1 test |
| **Povprečna pokritost** | 2.5 testa na funkcionalnost |

---

## 📊 DODATNE INFORMACIJE

### **Testno okolje**
- **Browser:** Chrome 118+, Firefox 119+, Safari 17+
- **Operating System:** Windows 10+, macOS 12+, Ubuntu 20+
- **Database:** MongoDB 6.0+
- **Backend:** Node.js 18+
- **Frontend:** Vanilla JavaScript (ES6+)

### **Testni podatki**
```javascript
// Test uporabniki
const testUsers = [
    {
        username: "testuser123",
        email: "test@example.com",
        password: "SecurePass123",
        role: "user"
    },
    {
        username: "admin",
        email: "admin@example.com", 
        password: "admin123",
        role: "admin"
    }
];

// Test produkti
const testProducts = [
    {
        name: "Test Product",
        price: 29.99,
        stock: 10,
        category: "electronics"
    }
];
```

### **Izvajanje testov**
1. **Pred testiranjem:** Pocisti bazo podatkov in naloži test podatke
2. **Med testiranjem:** Zabeležiti vse anomalije in neobičajno obnašanje
3. **Po testiranju:** Pocisti test podatke in restaviraj začetno stanje

### **Ključni uspešnosti (KPI)**
- **Pass rate:** > 90%
- **Kritični testi:** Morajo vsi uspešno prehodo (TC-002, TC-003)
- **Execution time:** < 30 minut za vse teste
- **Bug detection rate:** Zaznaj vsaj 80% namerno vnesenih napak

### **Kontaktni podatki**
- **Test Manager:** [Ime]
- **Lead Tester:** [Ime]  
- **Developer Contact:** [Ime]
- **Project Manager:** [Ime]

---

## TESTNI PRIMERI Z EKVIVALENČNIMI KATEGORIJAMI IN ANALIZO MEJNIH VREDNOSTI

### **TC-006: Dodajanje produkta v košarico - testiranje količin (Ekvivalenčne kategorije + Mejne vrednosti)**

#### **Specifikacije sistema:**
- **Minimalna količina:** 1 kos (ne smemo dodati 0 ali negativno količino)
- **Maksimalna količina:** Enaka razpoložljivi zalogi produkta
- **Tip podatka:** Pozitivno celo število
- **Zaloga test produkta:** 50 kosov

#### **Ekvivalenčne kategorije:**
| **ID** | **Kategorija** | **Opis** | **Veljavnost** |
|--------|----------------|----------|----------------|
| **EC-1** | Negativne vrednosti | Količina < 0 (-5, -1) | Neveljavna |
| **EC-2** | Ničelna vrednost | Količina = 0 | Neveljavna |
| **EC-3** | Veljavne vrednosti | 1 ≤ količina ≤ zaloga | Veljavna |
| **EC-4** | Prekoračena zaloga | količina > zaloga | Neveljavna |
| **EC-5** | Neštevilske vrednosti | Tekst, decimalne | Neveljavna |

#### **Mejne vrednosti:**
- **Spodnja meja:** 0 (neveljavna), 1 (veljavna)
- **Zgornja meja:** 50 (veljavna), 51 (neveljavna)
- **Robni primeri:** -1, 0, 1, 49, 50, 51

| **Atribut** | **Vrednost** |
|-------------|--------------|
| **ID testnega primera** | TC-006 |
| **Naziv** | Test mejnih vrednosti za količino produkta v košarici |
| **Opis** | Preveri pravilno obravnavo različnih količin pri dodajanju produkta v košarico |
| **Prioriteta** | Visoka |
| **Kategorija** | Mejne vrednosti |
| **Modul** | Upravljanje košarice |
| **Predpogoji** | <ul><li>Uporabnik je prijavljen</li><li>Produkt "Test Product" ima zalogo 50 kosov</li><li>Košarica je prazna</li></ul> |
| **Vhodni podatki** | **Test set 1:** Količina = -1 (EC-1)<br/>**Test set 2:** Količina = 0 (EC-2)<br/>**Test set 3:** Količina = 1 (EC-3, spodnja meja)<br/>**Test set 4:** Količina = 25 (EC-3, srednja vrednost)<br/>**Test set 5:** Količina = 50 (EC-3, zgornja meja)<br/>**Test set 6:** Količina = 51 (EC-4)<br/>**Test set 7:** Količina = "abc" (EC-5) |
| **Koraki izvajanja** | **Za vsak test set:**<br/>1. Prijavi se kot uporabnik<br/>2. Navigiraj na Products<br/>3. Izberi "Test Product"<br/>4. Vnesi količino iz test seta<br/>5. Klikni "Add to Cart"<br/>6. Preveri rezultat<br/>7. Počisti košarico za naslednji test |
| **Pričakovani rezultat** | **Test set 1 (-1):** Error "Quantity must be at least 1"<br/>**Test set 2 (0):** Error "Quantity must be at least 1"<br/>**Test set 3 (1):** Uspešno dodano, košarica: 1 item<br/>**Test set 4 (25):** Uspešno dodano, košarica: 25 items<br/>**Test set 5 (50):** Uspešno dodano, košarica: 50 items<br/>**Test set 6 (51):** Error "Not enough stock available"<br/>**Test set 7 ("abc"):** Error "Please enter a valid number" |
| **Dejanski rezultat** | _(izpolni med testiranjem)_ |
| **Status** | _(Pass/Fail)_ |
| **Opombe** | Test pokriva vse ekvivalenčne kategorije in mejne vrednosti |
| **Avtor** | Tester |
| **Datum ustvarjanja** | 01.11.2025 |

---

### **TC-007: Dodajanje produkta - testiranje cen (Ekvivalenčne kategorije + Mejne vrednosti)**

#### **Specifikacije sistema:**
- **Minimalna cena:** €0.01
- **Maksimalna cena:** €9999.99
- **Format:** Decimalno število z največ 2 decimali
- **Valuta:** EUR (€)

#### **Ekvivalenčne kategorije:**
| **ID** | **Kategorija** | **Opis** | **Veljavnost** |
|--------|----------------|----------|----------------|
| **EC-1** | Negativne cene | Cena < 0 | Neveljavna |
| **EC-2** | Ničelna cena | Cena = 0 | Neveljavna |
| **EC-3** | Veljavne cene | 0.01 ≤ cena ≤ 9999.99 | Veljavna |
| **EC-4** | Previsoke cene | Cena > 9999.99 | Neveljavna |
| **EC-5** | Preveč decimalk | Več kot 2 decimali | Neveljavna |

#### **Mejne vrednosti:**
- **Spodnja meja:** €0.00 (neveljavna), €0.01 (veljavna)
- **Zgornja meja:** €9999.99 (veljavna), €10000.00 (neveljavna)
- **Robni primeri:** -0.01, 0.00, 0.01, 9999.98, 9999.99, 10000.00

| **Atribut** | **Vrednost** |
|-------------|--------------|
| **ID testnega primera** | TC-007 |
| **Naziv** | Test mejnih vrednosti za ceno produkta |
| **Opis** | Preveri pravilno validacijo cen pri dodajanju novega produkta (admin funkcija) |
| **Prioriteta** | Srednja |
| **Kategorija** | Mejne vrednosti |
| **Modul** | Upravljanje produktov |
| **Predpogoji** | <ul><li>Admin je prijavljen</li><li>Dostop do admin panela</li><li>Možnost dodajanja produktov</li></ul> |
| **Vhodni podatki** | **Test set 1:** Cena = -5.00 (EC-1)<br/>**Test set 2:** Cena = 0.00 (EC-2)<br/>**Test set 3:** Cena = 0.01 (EC-3, spodnja meja)<br/>**Test set 4:** Cena = 50.00 (EC-3, srednja vrednost)<br/>**Test set 5:** Cena = 9999.99 (EC-3, zgornja meja)<br/>**Test set 6:** Cena = 10000.00 (EC-4)<br/>**Test set 7:** Cena = 25.999 (EC-5, 3 decimale) |
| **Koraki izvajanja** | **Za vsak test set:**<br/>1. Prijavi se kot admin<br/>2. Navigiraj na Products management<br/>3. Klikni "Add New Product"<br/>4. Vnesi osnovne podatke (ime, kategorija)<br/>5. Vnesi ceno iz test seta<br/>6. Poskusi shraniti produkt<br/>7. Preveri validacijsko sporočilo |
| **Pričakovani rezultat** | **Test set 1 (-5.00):** Error "Price must be positive"<br/>**Test set 2 (0.00):** Error "Price must be at least €0.01"<br/>**Test set 3 (0.01):** Uspešno shranjen produkt<br/>**Test set 4 (50.00):** Uspešno shranjen produkt<br/>**Test set 5 (9999.99):** Uspešno shranjen produkt<br/>**Test set 6 (10000.00):** Error "Price cannot exceed €9999.99"<br/>**Test set 7 (25.999):** Error "Price can have maximum 2 decimal places" |
| **Dejanski rezultat** | _(izpolni med testiranjem)_ |
| **Status** | _(Pass/Fail)_ |
| **Opombe** | Test validacije cen za admin funkcionalnost |
| **Avtor** | Tester |
| **Datum ustvarjanja** | 01.11.2025 |

---

### **TC-008: Iskanje produktov - testiranje dolžine iskalnih nizov (Ekvivalenčne kategorije + Mejne vrednosti)**

#### **Specifikacije sistema:**
- **Minimalna dolžina:** 1 znak (prazen niz vrne vse produkte)
- **Maksimalna dolžina:** 100 znakov
- **Dovoljeni znaki:** Alfanumerični, presledki, osnovni ločila
- **Case insensitive:** Velikost črk ni pomembna

#### **Ekvivalenčne kategorije:**
| **ID** | **Kategorija** | **Opis** | **Veljavnost** |
|--------|----------------|----------|----------------|
| **EC-1** | Prazen niz | Dolžina = 0 | Veljavna (vrne vse) |
| **EC-2** | Kratki nizi | 1 ≤ dolžina ≤ 2 | Veljavna |
| **EC-3** | Srednji nizi | 3 ≤ dolžina ≤ 50 | Veljavna |
| **EC-4** | Dolgi nizi | 51 ≤ dolžina ≤ 100 | Veljavna |
| **EC-5** | Predolgi nizi | Dolžina > 100 | Neveljavna |
| **EC-6** | Specialni znaki | SQL injection, XSS | Neveljavna |

#### **Mejne vrednosti:**
- **Dolžina:** 0, 1, 2, 99, 100, 101 znakov
- **Robni primeri:** "", "a", "ab", "a"×99, "a"×100, "a"×101

| **Atribut** | **Vrednost** |
|-------------|--------------|
| **ID testnega primera** | TC-008 |
| **Naziv** | Test mejnih vrednosti za iskanje produktov po dolžini niza |
| **Opis** | Preveri pravilno obravnavo različnih dolžin iskalnih nizov |
| **Prioriteta** | Srednja |
| **Kategorija** | Mejne vrednosti |
| **Modul** | Iskanje produktov |
| **Predpogoji** | <ul><li>Uporabnik je prijavljen</li><li>V sistemu obstaja vsaj 5 produktov</li><li>Search funkcionalnost je dostopna</li></ul> |
| **Vhodni podatki** | **Test set 1:** "" (prazen niz, EC-1)<br/>**Test set 2:** "a" (1 znak, EC-2)<br/>**Test set 3:** "ab" (2 znaka, EC-2)<br/>**Test set 4:** "test product" (12 znakov, EC-3)<br/>**Test set 5:** "a"×99 (99 znakov, EC-4)<br/>**Test set 6:** "a"×100 (100 znakov, EC-4)<br/>**Test set 7:** "a"×101 (101 znakov, EC-5)<br/>**Test set 8:** "'; DROP TABLE products; --" (SQL injection, EC-6) |
| **Koraki izvajanja** | **Za vsak test set:**<br/>1. Prijavi se kot uporabnik<br/>2. Navigiraj na Products sekcijo<br/>3. Klikni v search polje<br/>4. Vnesi iskalni niz iz test seta<br/>5. Pritisni Enter ali klikni Search<br/>6. Preveri rezultate in sporočila<br/>7. Počisti search polje |
| **Pričakovani rezultat** | **Test set 1 (""):** Prikazani vsi produkti<br/>**Test set 2 ("a"):** Filtrirani produkti z "a" v imenu<br/>**Test set 3 ("ab"):** Filtrirani produkti z "ab" v imenu<br/>**Test set 4 ("test product"):** Ustrezno filtriranje<br/>**Test set 5 (99 znakov):** Deluje normalno<br/>**Test set 6 (100 znakov):** Deluje normalno<br/>**Test set 7 (101 znakov):** Error "Search term too long"<br/>**Test set 8 (SQL injection):** Error "Invalid characters in search" |
| **Dejanski rezultat** | _(izpolni med testiranjem)_ |
| **Status** | _(Pass/Fail)_ |
| **Opombe** | Test vključuje tudi varnostno testiranje |
| **Avtor** | Tester |
| **Datum ustvarjanja** | 01.11.2025 |

---

## 📊 ANALIZA EKVIVALENČNIH KATEGORIJ IN MEJNIH VREDNOSTI

### **Povzetek aplikacije pristopov:**

#### **TC-006 (Količine v košarici):**
- **Ekvivalenčne kategorije:** 5 kategorij (negativne, nič, veljavne, prekoračene, neštevilske)
- **Mejne vrednosti:** -1, 0, 1, 50, 51
- **Pokritost:** 100% vseh kategorij in kritičnih mejnih vrednosti

#### **TC-007 (Cene produktov):**
- **Ekvivalenčne kategorije:** 5 kategorij (negativne, nič, veljavne, previsoke, decimalne)
- **Mejne vrednosti:** 0.00, 0.01, 9999.99, 10000.00
- **Pokritost:** 100% vseh kategorij in mejnih vrednosti

#### **TC-008 (Iskalni nizi):**
- **Ekvivalenčne kategorije:** 6 kategorij (prazen, kratki, srednji, dolgi, predolgi, specialni)
- **Mejne vrednosti:** 0, 1, 2, 99, 100, 101 znakov
- **Pokritost:** 100% vseh kategorij + varnostno testiranje

### **Koristi pristopov:**
1. **Zmanjšanje števila testov:** Namesto testiranja vseh možnih vrednosti testiramo reprezentativne
2. **Večja pokritost:** Sistematično pokrijemo vse kategorije vhodnih podatkov
3. **Odkrivanje robnih napak:** Mejne vrednosti pogosto razkrijejo napake v logiki
4. **Optimizacija časa:** Fokus na najverjetnejše lokacije napak

---