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