# 🌾 FarmLink India — All-India Agricultural Marketplace

**FarmLink India** is a production-style, full-stack agricultural marketplace platform connecting multiple Indian farmers directly with multiple institutional buyers, traders, and food processors.

It solves core structural bottlenecks in Indian agricultural trading:
- **Many-to-Many Supply Matching & Partial Aggregation**: Allows buyers with large volume requirements (e.g. 2,000 kg Tomato) to combine supply from multiple smaller local farmers (e.g., Farmer A: 700 kg + Farmer B: 800 kg + Farmer C: 500 kg = 2,000 kg).
- **Double-Selling Prevention & Atomic Reservation**: Transactional quantity locks ensure once a farmer accepts an offer, that harvest is reserved for 24 hours and cannot be oversold to another buyer.
- **Dynamic Smart Matching Engine**: Algorithmic scoring based on Crop (35%), Price budget alignment (25%), Geographic proximity (20%), Quality grade (10%), and harvest readiness (10%).
- **APMC Mandi Benchmark Prices**: Regional mandi rates across Indian states (Telangana, Andhra Pradesh, Maharashtra, Karnataka, Punjab, etc.) with transparent demo labeling and optional live Agmarknet API integration.
- **FarmLink AI Assistant**: Contextual chat assistant querying real marketplace listings, requirements, and APMC benchmark rates.
- **Farmer Care & Accessibility**: Toll-free 1800-FARMLINK hotline, Web Speech Text-to-Speech (TTS) audio narration for low-digital-literacy farmers, voice speech search, and multi-language support (English, Hindi, Telugu, Tamil, Kannada, Marathi).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM v6, Lucide React Icons, Modern Agriculture CSS Design System, Web Speech API (TTS & SpeechRecognition).
- **Backend**: Node.js v24, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS, Dotenv.
- **Database / Persistence Layer**: Node.js built-in `node:sqlite` (`DatabaseSync`) with Write-Ahead Logging (`WAL`), foreign key enforcement, and synchronous ACID transactions (`BEGIN IMMEDIATE TRANSACTION`, `COMMIT`, `ROLLBACK`).
- **Testing**: Dedicated Node test runner `test_scenarios.js` covering both mandatory scenarios and core lifecycle.

---

## 📁 Project Structure

```
farmlink-india/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js             # SQLite init, schema tables, seed data, transaction helper
│   │   ├── controllers/
│   │   │   ├── adminController.js       # Stats overview & catalog extensibility
│   │   │   ├── authController.js        # Register, login, logout, me
│   │   │   ├── chatController.js        # FarmLink AI assistant endpoint
│   │   │   ├── listingController.js     # Produce CRUD & inventory accounting
│   │   │   ├── marketPriceController.js # APMC mandi rates
│   │   │   ├── matchController.js       # Smart matches & supply combination
│   │   │   ├── metadataController.js    # Reference data for dynamic selectors
│   │   │   ├── offerController.js       # Negotiation, counter-offers, acceptance
│   │   │   ├── orderController.js       # Order tracking & stage progression
│   │   │   ├── requirementController.js # Buyer demands CRUD
│   │   │   ├── supportController.js     # Farmer Care guides & callbacks
│   │   │   └── userController.js        # Profile management
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js        # JWT verify & role protection
│   │   │   └── errorHandler.js          # Global error handling
│   │   ├── services/
│   │   │   ├── aiAssistantService.js    # Marketplace database lookup engine
│   │   │   ├── marketPriceService.js    # Mandi benchmark service abstraction
│   │   │   ├── matchingEngine.js        # Multi-factor score & supply aggregator
│   │   │   └── reservationService.js    # Atomic quantity locks & double-sell prevention
│   │   ├── utils/
│   │   │   └── seedData.js              # Reference states, mandis, crops, varieties
│   │   └── server.js                    # Express app and periodic sweeper
│   ├── farmlink.db                      # Persistent SQLite Database
│   ├── package.json
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js                # Central fetch client with JWT interceptor
│   │   ├── components/
│   │   │   ├── AudioSpeaker.jsx         # Web Speech TTS for rural accessibility
│   │   │   ├── ErrorBoundary.jsx        # White-screen crash prevention
│   │   │   ├── FarmerCareModal.jsx      # Hotline modal with safeguard notices
│   │   │   ├── Footer.jsx               # Mandi coverage & platform footer
│   │   │   ├── Navbar.jsx               # Navigation & multi-language switcher
│   │   │   └── ProtectedRoute.jsx       # Role-based route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Session & user credentials
│   │   │   └── LanguageContext.jsx      # Multi-lingual dictionary (EN, HI, TE, TA, KN, MR)
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx       # Platform metrics & catalog manager
│   │   │   ├── AIAssistantPage.jsx      # Rule-based marketplace assistant
│   │   │   ├── BuyerDashboard.jsx       # Buyer demand aggregator & bids
│   │   │   ├── DemandRequirementsPage.jsx # Publish & browse buyer demands
│   │   │   ├── FarmerCarePage.jsx       # Help center & callback form
│   │   │   ├── FarmerDashboard.jsx      # Harvest inventory & incoming offers
│   │   │   ├── LandingPage.jsx          # Showcase & one-click demo login
│   │   │   ├── LoginPage.jsx            # Sign in & demo account cards
│   │   │   ├── MarketPricesPage.jsx     # Mandi filters & benchmark rates
│   │   │   ├── NotFoundPage.jsx         # 404 handler
│   │   │   ├── OffersNegotiationPage.jsx # Multi-round bargaining & audit trail
│   │   │   ├── OrdersPage.jsx           # Order tracking progression
│   │   │   ├── ProduceListingsPage.jsx  # Browse & publish harvest produce
│   │   │   ├── ProfilePage.jsx          # Profile details & APMC yard
│   │   │   └── SmartMatchesPage.jsx     # Aggregator & score factor breakdown
│   │   ├── App.jsx                      # Router & role routes
│   │   ├── index.css                    # Agriculture design system CSS
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── .env
├── test_scenarios.js                    # Automated end-to-end test suite
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start Instructions

### 1. Prerequisites
- **Node.js**: v22+ or v24+ (Node 24 recommended, built-in SQLite engine).
- **npm**: v10+ or v11+.

### 2. Backend Setup & Startup
```powershell
cd backend
npm install
npm start
```
The backend starts on **http://localhost:5000** and auto-initializes `farmlink.db` with schema and seed data.

### 3. Frontend Setup & Startup
In a separate terminal:
```powershell
cd frontend
npm install
npm run dev
```
The frontend starts on **http://localhost:5173**. Open this URL in your web browser.

---

## 🔑 Pre-Seeded Demo Credentials

All test accounts use the password: `Password123!`

| Role | Name | Email | Mandi / District | Initial Harvest / Demand |
|---|---|---|---|---|
| **Farmer A** | Ramesh Kumar | `farmer.ramesh@farmlink.in` | Bowenpally APMC, Hyderabad | 700 kg Tomato @ ₹24/kg |
| **Farmer B** | Balu Naik | `farmer.balu@farmlink.in` | Enumamula APMC, Warangal | 800 kg Tomato @ ₹23/kg |
| **Farmer C** | Suresh Reddy | `farmer.suresh@farmlink.in` | Bowenpally APMC, Hyderabad | 500 kg Tomato @ ₹25/kg |
| **Buyer A** | Ravi Agro Foods | `buyer.ravi@farmlink.in` | Kattedan Processing Yard, Hyderabad | Requirement: 2,000 kg Tomato @ ₹26/kg |
| **Buyer B** | Deccan Retail | `buyer.deccan@farmlink.in` | Banjara Hills, Hyderabad | Retail Supermarket Chain |
| **Admin** | Sharma Admin | `admin@farmlink.in` | All India Operations | Platform Overseer |

> **Tip**: You can use the **One-Click Demo Login** buttons on the Login page (`/login`) or Landing page (`/`) to immediately switch roles without manual typing.

---

## 🧪 Automated Test Suite & Mandatory Scenarios

Run the automated test runner:
```powershell
node test_scenarios.js
```

### Verified Test Cases:
1. **Database Schema & Referential Integrity**: Checks users, profiles, states, APMCs, and mandi price tables.
2. **Mandatory Scenario 1 (Multi-Farmer Supply Aggregation)**:
   - Farmer A: 700 kg Tomato
   - Farmer B: 800 kg Tomato
   - Farmer C: 500 kg Tomato
   - Buyer: 2,000 kg Tomato Demand
   - System aggregates: $700 + 800 + 500 = 2,000\text{ kg}$ exact match (100% fulfillment, ₹23.85/kg weighted average rate).
3. **Mandatory Scenario 2 (Double-Selling Prevention & Atomic Reservation)**:
   - Farmer posts 1,000 kg.
   - Buyer A offers 800 kg. Accepted & reserved -> `Total = 1,000`, `Reserved = 800`, `Available = 200`.
   - Buyer B attempts to reserve 800 kg -> System immediately rejects with `Insufficient available quantity. Only 200 kg available`.
   - Buyer B reserves exactly remaining 200 kg -> Succeeds -> `Available = 0`, `Reserved = 1,000`.
4. **Order Confirmation Lifecycle**:
   - Offer transition: `RESERVED` -> `CONFIRMED`.
   - Invariant checked: `reserved` decreases, `confirmed` increases, `available` remains intact, `reserved + confirmed <= total`.
5. **Smart Matching Factor Scoring**:
   - Tests weights: Crop (35%), Price (25%), Location (20%), Quality (10%), Date (10%).
   - Generates breakdown percentages and reasons.
6. **Market Price Service & Disclaimer Integrity**:
   - Mandi query returns benchmark data with `is_demo: 1` badge and official disclaimer.
7. **AI Assistant Context Awareness & Database Lookup**:
   - User query *"Who is buying tomatoes near Hyderabad?"* dynamically queries active SQLite requirements and returns Ravi Agro Foods.

---

## 🌐 Regional Languages & Low-Literacy Support

- **Language Selector**: Toggle between **English**, **हिन्दी (Hindi)**, **తెలుగు (Telugu)**, **தமிழ் (Tamil)**, **ಕನ್ನಡ (Kannada)**, and **मराठी (Marathi)** from the top navigation bar.
- **Audio TTS (Text-to-Speech)**: Click the **"Listen"** speaker icon on produce listings, offers, orders, mandi prices, and guidance topics to hear details read aloud in regional voices.
- **Voice Speech Recognition**: Microphone button in the FarmLink AI Assistant allows spoken queries.
- **Farmer Care Toll-Free Hotline**: Accessible 24/7 at **1800-FARMLINK (+91 1800 327 654)** with callback requests supported.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new Farmer or Buyer |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user and profile |
| `GET` | `/api/listings` | Filter produce listings by crop, state, district |
| `POST` | `/api/listings` | Publish new harvest (Farmer only) |
| `PATCH` | `/api/listings/:id` | Update listing / price / total quantity |
| `GET` | `/api/requirements` | Filter buyer demands |
| `POST` | `/api/requirements` | Publish procurement demand (Buyer only) |
| `GET` | `/api/matches` | Smart matching & supply aggregation |
| `GET` | `/api/offers` | Fetch incoming/outgoing negotiation bids |
| `POST` | `/api/offers` | Submit new bid on produce listing |
| `PATCH` | `/api/offers/:id` | Negotiate: `accept`, `counter`, `reject`, `confirm` |
| `GET` | `/api/orders` | View confirmed orders and tracking status |
| `PATCH` | `/api/orders/:id` | Advance stage: `PROCESSING` -> `READY` -> `DELIVERED` |
| `GET` | `/api/market-prices` | Mandi benchmark rates with multi-level filters |
| `POST` | `/api/chat` | FarmLink AI Assistant with database lookup |
| `GET` | `/api/support` | Farmer Care helpline & educational topics |
| `POST` | `/api/support` | Submit free officer callback request |
| `GET` | `/api/admin/stats` | Platform oversight metrics (Admin only) |
| `GET` | `/api/metadata/reference` | Dynamic all-India states, districts, mandis, crops |
