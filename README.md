# ⚡ AlgoBench — Elite DSA Coding & Visualizer Platform

AlgoBench is a premium, high-fidelity algorithmic preparation platform designed for software engineers. It features an interactive coding workspace, live step-by-step memory and pointer visualizers, curated corporate DSA preparation sheets, and a fully functional SaaS premium subscription module integrated with Razorpay.

---

## 🚀 Key Features & Modules

### 1. Interactive Coding Workspace
* **Monaco Editor Integration**: Full IDE capabilities with syntax highlighting, automatic indentation, autocomplete, and theme configuration.
* **Standard Stdin/Stdout Compilers**: Supports complete program execution (JavaScript, Java, C++) rather than just function-style templates.
* **Responsive Bottom Console**: Includes dedicated tabs for test-case validation, runtime status monitoring, compilation/stdout, and execution diagnostics.

### 2. Standalone & Embedded Algorithm Visualizers
* **Interactive Code Simulator**: Translates code execution into real-time animations of pointer changes, stack frames, variables, and data structure alterations.
* **Curated Visualizations**: Custom, manual visualizers for key algorithmic problems (e.g. *Container With Most Water*, *Kadane's Algorithm*, *Two Sum*, etc.).
* **Swipe-Overflow Support**: Seamless touch swipes and adaptive grid adjustments optimized for mobile and tablet viewports.

### 3. Premium HUD Filter Toolbar
* **Glassmorphic HUD Bar**: Fully responsive toolbar styled with inset shadows, backdrop blur, and a distinct fine gold border.
* **Advanced Filters**: Seamless sorting, Company-wise filtering (e.g., Google, Amazon, Adobe counts visible for all problems), and Pattern-wise Prep Sheets.

### 4. Curated Preparation Sheets (DSA Patterns)
* **DSA_Patterns_250**: Curated list of exactly **250 platform-solvable problems** divided across 15 high-frequency patterns (Two Pointers, Sliding Window, Merge Intervals, LinkedList Reversal, DP, etc.).
* **Company Tags**: Seamlessly renders company appearance counts directly on the problem cards.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 18, Vite (Fast builds)
* **Styling**: Tailwind CSS (with custom HSL gold/slate accents, glassmorphism, and responsive media queries)
* **State Management**: Redux Toolkit (Auth state, UI triggers)
* **Utilities**: Framer Motion (micro-animations), Lucide React (icons), Monaco Editor React

### Backend
* **Runtime**: Node.js, Express
* **Database**: MongoDB (Mongoose ORM)
* **Caching & Queueing**: Redis, BullMQ (async submission queue)
* **Compiler Engine**: Judge0 API (safe code sandboxing)
* **Payment Gateway**: Razorpay API

---

## 📂 Project Structure

```ascii
AlgoBench/
├── backend/
│   ├── src/
│   │   ├── config/       # MongoDB, Redis, Queue & Firebase configurations
│   │   ├── controllers/  # Auth, problem retrieval, submissions controllers
│   │   ├── middleware/   # User Auth, Admin Auth, Firebase, Rate Limiters
│   │   ├── models/       # Mongoose Schemas (User, Problem, Submission, Contest)
│   │   ├── routes/       # API routes
│   │   ├── services/     # Judge0 compiler integration client
│   │   ├── utils/        # String validators and utility configs
│   │   ├── workers/      # BullMQ queue judging workers
│   │   └── index.js      # Server entry point
│   ├── payments/
│   │   └── payment.js    # Razorpay orders and signature verification
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Visualizer components, Navbar, Public Footer
│   │   ├── features/     # Community forums, Contests module
│   │   ├── pages/        # Dashboard, Problems list, Editor, Static policies
│   │   ├── store/        # Redux store
│   │   ├── styles/       # Desktop & mobile responsive CSS files
│   │   ├── App.jsx       # Lazy-loaded route registry
│   │   └── main.jsx
│   ├── public/           # Shared SVG/PNG assets and seed templates
│   └── package.json
└── README.md             # This document
```

---

## 🔒 Security Hardening

AlgoBench is secured against OWASP Top 10 vulnerabilities with several protection layers:
* **HTTP Security Headers**: Enforced via `helmet` to set CSP, clickjacking prevention (`X-Frame-Options`), HSTS, and MIME sniff block.
* **NoSQL Injection Block**: `express-mongo-sanitize` strips out MongoDB operators (`$gt`, `$where`, `$regex`) from all incoming requests.
* **Double-Layer Rate Limiting**:
  - **Global**: 100 requests per 15 minutes per IP.
  - **Authentication**: 10 attempts per 15 minutes per IP on login, signup, and admin creation to prevent brute-force attacks.
  - **Compilation**: Redis-backed limits protecting compiler resource allocations.
* **Secure Cookie Credentials**: JWT authentication tokens are stored in `HttpOnly`, `SameSite=Strict`, and `Secure` (production only) cookies.
* **Strong Password Validation**: Enforces length constraints, mixed-case validation, numbers, and special characters.

---

## ⚡ Performance Optimizations

* **Frontend Code-Splitting**: Route components are dynamically imported using `React.lazy()` and `Suspense`, reducing the initial Javascript load bundle by up to **75%**.
* **Database Indexes**: Schema-level single-field indexes are applied on `companies.name`, `difficulty`, `tags`, and `problemType` to ensure instant query responses on large libraries.
* **Caching Layer**: Unfiltered problem archives and company lists are cached in-memory with automatic TTL checks, bypassing database calls entirely on standard landing loads.

---

## ⚙️ Local Installation & Setup

### Prerequisites
* Node.js (v18+)
* MongoDB (Local Instance or Atlas URI)
* Redis Server (Running on default port `6379`)
* Judge0/RapidAPI Key (For code compilation)
* Razorpay Account Credentials (For pricing simulations)

### 1. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd AlgoBench/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of `backend/` and configure:
   ```env
   PORT=5000
   DB_CONNECT_STRING=your_mongodb_connection_string
   JWT_KEY=your_cryptographically_secure_jwt_key
   REDIS_URL=redis://localhost:6379
   RAPIDAPI_KEY=your_rapidapi_judge0_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   NODE_ENV=development
   ```
4. Spin up the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of `frontend/` and configure:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

Open your browser and navigate to `http://localhost:5173`.

---

## 📜 Legals & Compliance (Razorpay Staging Verification)
For payment gateway verification, six static document policies are integrated:
* [About Us](http://localhost:5173/about): Outlines the team, vision, and roadmap.
* [Contact Us](http://localhost:5173/contact): Live query contact sheet.
* [Privacy Policy](http://localhost:5173/privacy): Data rights and cookies.
* [Terms & Conditions](http://localhost:5173/terms): Platform license rules.
* [Refund Policy](http://localhost:5173/refund): Standard cancellation conditions.
* [FAQ](http://localhost:5173/faq): Pricing, features, and cancel FAQs.
