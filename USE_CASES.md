# Use Cases - E-Commerce Orders Management System

## 📊 Use Case Diagram

```
                    E-Commerce Orders Management System
    
    Neregistriran                    Registriran                    Administrator
    Obiskovalec                      Uporabnik                      
         |                              |                              |
         |                              |                              |
    ┌────▼────┐                    ┌────▼────┐                  ┌────▼────┐
    │ Brskanje│                    │ Prijava │                  │ Upravlj.│
    │produktov│                    │  Odjava │                  │uporabnik│
    └─────────┘                    └─────────┘                  └─────────┘
         |                              |                              |
    ┌────▼────┐                    ┌────▼────┐                  ┌────▼────┐
    │Pregled  │                    │Upravlj. │                  │Upravlj. │
    │podrobno.│                    │košarice │                  │produktov│
    └─────────┘                    └─────────┘                  └─────────┘
         |                              |                              |
    ┌────▼────┐                    ┌────▼────┐                  ┌────▼────┐
    │Registr. │                    │ Oddaja  │                  │Upravlj. │
    │         │                    │naročila │                  │naročil  │
    └─────────┘                    └─────────┘                  └─────────┘
         |                              |                              |
    ┌────▼────┐                    ┌────▼────┐                  ┌────▼────┐
    │Spremem. │                    │Pregled  │                  │Sistemske│
    │ teme    │                    │naročil  │                  │statistik│
    └─────────┘                    └─────────┘                  └─────────┘
                                        |                              |
                                   ┌────▼────┐                  ┌────▼────┐
                                   │Ocenjev. │                  │Uporab.  │
                                   │produktov│                  │podrobno.│
                                   └─────────┘                  └─────────┘
                                        |
                                   ┌────▼────┐
                                   │Personal.│
                                   │dashboard│
                                   └─────────┘
```

---

## 🔍 Podrobni Use Case opisi

### **UC-01: Registracija novega uporabnika**

**Primarni akter:** Neregistriran obiskovalec  
**Sekundarni akterji:** Sistem  
**Predpogoji:** Uporabnik ni prijavljen  
**Sprožilec:** Uporabnik želi ustvariti račun  

**Osnovni tok:**
1. Uporabnik odpre registracijsko stran
2. Vnese osebne podatke:
   - Ime in priimek
   - Uporabniško ime (unique)
   - Email naslov (unique)
   - Geslo (min. 6 znakov)
3. Sistem validira podatke:
   - Preveri format email naslova
   - Preveri edinstvenost uporabniškega imena in emaila
   - Preveri močnost gesla
4. Sistem ustvari nov uporabniški račun z vlogo "user"
5. Sistem avtomatsko prijavi uporabnika
6. Preusmeri na personalizirani dashboard
7. Prikaže pozdravno sporočilo

**Alternativni tokovi:**
- A1: Email že obstaja
  - Sistem prikaže napako "Email is already registered"
  - Uporabnik vnese drug email ali gre na prijavo
- A2: Uporabniško ime že obstaja
  - Sistem prikaže napako "Username is already taken"
  - Uporabnik vnese drugo uporabniško ime

**Posledice:** Nov uporabniški račun je ustvarjen in uporabnik je prijavljen

---

### **UC-02: Brskanje produktov (brez prijave)**

**Primarni akter:** Neregistriran obiskovalec  
**Sekundarni akterji:** Sistem  
**Predpogoji:** Nobenih  
**Sprožilec:** Obiskovalec želi pregledati ponudbo  

**Osnovni tok:**
1. Obiskovalec odpre spletno stran
2. Sistem prikaže samo "Products" v navigaciji
3. Prikaže se seznam vseh aktivnih produktov
4. Obiskovalec lahko:
   - Brska po produktih z drsnim seznamom
   - Išče po imenu produkta
   - Filtrira po kategorijah
   - Sortira po ceni, datumu, imenu
5. Klik na produkt odpre podrobnosti
6. Vidi galerijo slik, opis, specifikacije
7. Namesto "Add to Cart" vidi "Login to Buy"

**Alternativni tokovi:**
- A1: Ni produktov
  - Sistem prikaže "No products found"
- A2: Iskanje brez rezultatov
  - Sistem prikaže "No products match your search"

**Posledice:** Obiskovalec si ogleda produkte brez možnosti nakupa

---

### **UC-03: Upravljanje nakupovalne košarice**

**Primarni akter:** Registriran uporabnik  
**Sekundarni akterji:** Sistem  
**Predpogoji:** Uporabnik je prijavljen  
**Sprožilec:** Uporabnik želi dodati produkt v košarico  

**Osnovni tok:**
1. Uporabnik brska po produktih
2. Klikne "Add to Cart" pri želenem produktu
3. Sistem preveri:
   - Razpoložljivost zaloge
   - Ali je produkt aktiven
4. Produkt se doda v košarico z količino 1
5. Število v košarici se posodobi v navigaciji
6. Prikaže se potrdilno sporočilo
7. Uporabnik gre v košarico
8. Lahko spreminja količine ali odstrani izdelke
9. Vidi skupno vrednost košarice

**Alternativni tokovi:**
- A1: Ni zaloge
  - Sistem prikaže "Product out of stock"
- A2: Produkt že v košarici
  - Sistem poveča količino za 1
- A3: Zahtevana količina presega zalogo
  - Sistem nastavi maksimalno razpoložljivo količino

**Posledice:** Produkti so dodani v uporabnikovo košarico

---

### **UC-04: Oddaja naročila**

**Primarni akter:** Registriran uporabnik  
**Sekundarni akterji:** Sistem  
**Predpogoji:** Košarica vsebuje vsaj en izdelek  
**Sprožilec:** Uporabnik želi kupiti izdelke iz košarice  

**Osnovni tok:**
1. Uporabnik gre v košarico
2. Pregleda izbrane izdelke in količine
3. Klikne "Proceed to Checkout"
4. Vnese dostavljalni naslov:
   - Ulica, mesto, poštna številka, država
5. Vnese računi naslov ali označi "Same as shipping"
6. Izbere način plačila (credit card, PayPal, etc.)
7. Pregleda povzetek naročila
8. Potrdi naročilo z "Place Order"
9. Sistem:
   - Ustvari naročilo z edinstveno številko
   - Posodobi zaloge produktov
   - Izprazni košarico
   - Nastavi začetni status "pending"
10. Prikaže potrditev z številko naročila

**Alternativni tokovi:**
- A1: Ni zaloge med postopkom
  - Sistem obvesti o pomanjkanju
  - Ponudi posodobo košarice
- A2: Napaka pri plačilu
  - Sistem prikaže napako
  - Ohrani košarico

**Posledice:** Naročilo je oddano, zaloge posodobljene, košarica izpraznjena

---

### **UC-05: Pregled lastnih naročil**

**Primarni akter:** Registriran uporabnik  
**Sekundarni akterji:** Sistem  
**Predpogoji:** Uporabnik ima vsaj eno naročilo  
**Sprožilec:** Uporabnik želi pregledati svoja naročila  

**Osnovni tok:**
1. Uporabnik klikne "Orders" v navigaciji
2. Sistem prikaže SAMO uporabnikova naročila
3. Seznam vsebuje:
   - Številko naročila
   - Datum oddaje
   - Status (pending, confirmed, processing, shipped, delivered)
   - Skupni znesek
4. Klik na naročilo prikaže podrobnosti:
   - Seznam kupljenih izdelkov
   - Količine in cene
   - Dostavljalni naslov
   - Sledilno številko (če obstaja)
5. Lahko prekliče naročilo (če je status "pending")

**Alternativni tokovi:**
- A1: Ni naročil
  - Sistem prikaže "No orders found"
- A2: Naročilo ni mogoče preklicati
  - Gumb "Cancel" ni prikazan

**Posledice:** Uporabnik pregleda svoja naročila

---

### **UC-06: Ocenjevanje produkta**

**Primarni akter:** Registriran uporabnik  
**Sekundarni akterji:** Sistem  
**Predpogoji:** Uporabnik je kupil produkt (delivered naročilo)  
**Sprožilec:** Uporabnik želi oceniti kupljen produkt  

**Osnovni tok:**
1. Uporabnik gre v "Reviews" sekcijo
2. Sistem prikaže samo njegove ocene
3. Klikne "Add Review"
4. Izbere produkt iz seznama kupljenih produktov
5. Vnese oceno (1-5 zvezdic)
6. Napiše naslov ocene
7. Napiše komentar
8. Opcijsko doda slike
9. Pošlje oceno
10. Ocena se prikaže pri produktu z oznako "Verified Purchase"

**Alternativni tokovi:**
- A1: Produkt že ocenjen
  - Sistem prikaže možnost urejanja obstoječe ocene
- A2: Produkt ni bil kupljen
  - Sistem ne prikaže produkta v seznamu

**Posledice:** Nova ocena je dodana produktu

---

### **UC-07: Upravljanje produktov (Admin)**

**Primarni akter:** Administrator  
**Sekundarni akterji:** Sistem  
**Predpogoji:** Uporabnik ima admin vlogo  
**Sprožilec:** Admin želi upravljati produkte  

**Osnovni tok:**
1. Admin gre v "Products" sekcijo
2. Vidi dodatne gumbe za upravljanje
3. **Dodajanje novega produkta:**
   - Klikne "Add Product"
   - Vnese vse potrebne podatke
   - Naloži slike
   - Shrani produkt
4. **Urejanje produkta:**
   - Klikne "Edit" pri produktu
   - Spremeni podatke
   - Shrani spremembe
5. **Brisanje produkta:**
   - Klikne "Delete" pri produktu
   - Potrdi brisanje
   - Produkt se deaktivira

**Alternativni tokovi:**
- A1: Napačni podatki
  - Sistem prikaže validacijske napake
- A2: Preklic operacije
  - Podatki se ne shranijo

**Posledice:** Produkti so dodani, spremenjeni ali odstranjeni

---

### **UC-08: Upravljanje naročil (Admin)**

**Primarni akter:** Administrator  
**Sekundarni akterji:** Sistem  
**Predpogoji:** Sistem ima naročila  
**Sprožilec:** Admin želi upravljati naročila  

**Osnovni tok:**
1. Admin gre v "Admin" → "Order Management"
2. Vidi VSA naročila v sistemu
3. Lahko filtrira po:
   - Statusu naročila
   - Uporabniku
   - Datumskem obdobju
4. Klikne na naročilo za podrobnosti
5. Spremeni status naročila:
   - pending → confirmed
   - confirmed → processing
   - processing → shipped (doda sledilno št.)
   - shipped → delivered
6. Shrani spremembe
7. Sistem lahko pošlje obvestilo uporabniku

**Alternativni tokovi:**
- A1: Neveljavna sprememba statusa
  - Sistem ne dovoli nepravilnega prehoda
- A2: Manjkajoča sledilna številka
  - Sistem zahteva vnos za "shipped" status

**Posledice:** Status naročil je posodobljen

---

### **UC-09: Upravljanje uporabnikov (Admin)**

**Primarni akter:** Administrator  
**Sekundarni akterji:** Sistem  
**Predpogoji:** Sistem ima registrirane uporabnike  
**Sprožilec:** Admin želi upravljati uporabnike  

**Osnovni tok:**
1. Admin gre v "Admin" → "User Management"
2. Vidi vse uporabnike v kartični obliki
3. Lahko išče po imenu, emailu, uporabniškem imenu
4. **Pregled podrobnosti:**
   - Klikne "Details" pri uporabniku
   - Vidi 3 tabs: User Info, Orders, Cart
   - Pregleduje statistike in zgodovino
5. **Upravljanje statusa:**
   - Klikne "Activate/Deactivate"
   - Spremeni status uporabnika
6. **Brisanje uporabnika:**
   - Klikne "Delete" (ne pri sebi)
   - Potrdi brisanje

**Alternativni tokovi:**
- A1: Admin poskuša izbrisati sebe
  - Sistem to prepreči
- A2: Ni uporabnikov
  - Prikaže se "No users found"

**Posledice:** Uporabniki so upravljani (aktivirani/deaktivirani/izbrisani)

---

### **UC-10: Personalizirani dashboard**

**Primarni akter:** Registriran uporabnik (User/Admin)  
**Sekundarni akterji:** Sistem  
**Predpogoji:** Uporabnik je prijavljen  
**Sprožilec:** Uporabnik želi pregledati pregled svojih aktivnosti  

**Osnovni tok:**
1. Uporabnik gre na "Dashboard"
2. **Za navadnega uporabnika sistem prikaže:**
   - Število izdelkov v košarici (klik → košarica)
   - Število svojih naročil (klik → naročila)
   - Število svojih ocen (klik → ocene)
   - Skupni porabljen znesek (klik → naročila)
3. **Za admin-a sistem prikaže:**
   - Skupno število produktov (klik → produkti)
   - Skupno število naročil (klik → naročila)
   - Skupno število ocen (klik → ocene)
   - Število uporabnikov (klik → admin panel)
4. Kartice so klikabilne za hitro navigacijo
5. Podatki se posodabljajo v realnem času

**Alternativni tokovi:**
- A1: Novi uporabnik brez aktivnosti
  - Vse vrednosti so 0
- A2: Napaka pri nalaganju podatkov
  - Prikaže se napaka in refresh gumb

**Posledice:** Uporabnik vidi personalizirane statistike

---

### **UC-11: Spreminjanje teme**

**Primarni akter:** Katerikoli obiskovalec  
**Sekundarni akterji:** Sistem  
**Predpogoji:** Nobenih  
**Sprožilec:** Uporabnik želi spremeniti videz aplikacije  

**Osnovni tok:**
1. Uporabnik klikne ikono za temo v navigaciji (luna/sonce)
2. Sistem preklaplja med svetlo in temno temo
3. Celoten vmesnik se takoj prilagodi:
   - Spremenijo se barve ozadja
   - Spremenijo se barve besedila
   - Spremenijo se barve kart in gumbov
4. Izbira se shrani v localStorage
5. Pri naslednji uporabi se izbira ohrani

**Alternativni tokovi:**
- A1: localStorage ni na voljo
  - Tema se nastavi na privzeto (svetlo)

**Posledice:** Tema vmesnika je spremenjena in shranjena

---

### **UC-12: Iskanje in filtriranje produktov**

**Primarni akter:** Katerikoli obiskovalec  
**Sekundarni akterji:** Sistem  
**Predpogoji:** Sistem ima produkte  
**Sprožilec:** Uporabnik želi najti specifične produkte  

**Osnovni tok:**
1. Uporabnik vnese iskalni izraz v iskalno polje
2. Opcijsko izbere kategorijo iz dropdown menija
3. Opcijsko nastavi cenovni razpon
4. Klikne "Search" ali pritisne Enter
5. Sistem poišče produkte po:
   - Imenu produkta
   - Opisu
   - Kategoriji
   - Blagovni znamki
6. Prikaže filtrirane rezultate
7. Uporabnik lahko dodatno sortira po:
   - Ceni (naraščajoče/padajoče)
   - Datumu dodajanja
   - Imenu (alfabetno)

**Alternativni tokovi:**
- A1: Ni rezultatov
  - Prikaže se "No products found matching your criteria"
- A2: Prazno iskanje
  - Prikaže vse produkte

**Posledice:** Prikazani so filtrirani in sortirani produkti

---

## 📈 Use Case prioritete

### **Visoka prioriteta (Kritični za delovanje)**
- UC-01: Registracija
- UC-02: Brskanje produktov
- UC-03: Upravljanje košarice
- UC-04: Oddaja naročila
- UC-07: Upravljanje produktov (Admin)

### **Srednja prioriteta (Pomembni za UX)**
- UC-05: Pregled naročil
- UC-08: Upravljanje naročil (Admin)
- UC-09: Upravljanje uporabnikov (Admin)
- UC-10: Personalizirani dashboard

### **Nizka prioriteta (Nice-to-have)**
- UC-06: Ocenjevanje produktov
- UC-11: Spreminjanje teme
- UC-12: Iskanje in filtriranje

---

## 🔄 Use Case relacije

### **Include relacije:**
- Vsi use case-i vključujejo avtentikacijo (razen UC-02)
- Admin use case-i vključujejo preverjanje admin vloge
- Naročila vključujejo posodabljanje zalog

### **Extend relacije:**
- Brskanje produktov se lahko razširi z iskanjem
- Upravljanje košarice se lahko razširi s shranjevanjem za pozneje
- Oddaja naročila se lahko razširi z email potrdili

### **Generalizacija:**
- "Upravljanje" je generalizacija za CRUD operacije
- "Pregled" je generalizacija za različne vrste pregledov

Ta seznam use case-ov pokriva celotno funkcionalnost sistema in zagotavlja jasno razumevanje zahtev in funkcionalnosti za vse vrste uporabnikov.