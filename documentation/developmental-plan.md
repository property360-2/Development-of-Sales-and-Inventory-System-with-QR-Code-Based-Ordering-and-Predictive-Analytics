# 🛠 Developmental Plan – Updated

## 1. Database Setup (Week 1)

- [√] Create full database schema in XAMPP (MySQL)
  - Tables: User, Customer, Menu, Order, Order_Item, Payment, Audit_Log
  - Add relationships (PK, FK)
  - Seed sample data (menu items, test users, dummy orders)
- [√] **Database constraints & security checks** ✅ Ensure foreign keys, unique indexes, not null constraints, and proper data types
- [√] **Initial backup & version control** ✅ Export schema for safety

**Status:** ✅ FINISHED

---

## 2. Backend Development (Laravel) (Week 2–3)

- [√] Setup Laravel project
- [√] Create models & migrations for all tables (Users, Customers, Menus, Orders, Order_Items, Payments, Audit_Logs)
- [√] Added database indexing ✅ (`role`, `name`, etc.)
- [√] Custom primary keys in models ✅ (`user_id`, `customer_id`, `order_id`, etc.)
- [√] Foreign key constraints with cascade delete ✅ (Orders → Order_Items, Users → Audit_Logs)
- [√] Test in Tinker (all tables working, audit logs triggered)
- [√] Implement controllers & routes (CRUD for all resources)
- [√] Test the routes with Postman (runner sequence to prevent dependency issues)
- [√] Add RBAC (roles: Admin, Cashier) ✅ Role-based access enforced via middleware
- [√] Middleware & authentication (auth:sanctum) ✅ Only authenticated users can access protected routes
- [√] Input validation & sanitization ✅ Prevent SQL injection & XSS
- [√] Implement Audit Log (auto-record actions) ✅ Track create, update, delete for all main entities
- [√] Unit test for API endpoints ✅ Security tests for forbidden actions & invalid tokens
- [√] Performance checks ✅ Eager loading & optimized queries
- [√] Postman collection prepared ✅ Full CRUD testing sequences

**Status:** ✅ Complete – Backend fully implemented and tested  
**Notes:** All features verified, audit logs working, RBAC enforced, Postman collection ready for frontend integration

---

## 3. Frontend Development (React.js) (Week 4–5)

### 1: Project Setup

- [√] Initialize project (`Vite + React`)
- [√] Install dependencies:
  - `react-router-dom` (routing)
  - `axios` (API calls)
  - `@tanstack/react-query` (API caching)
  - `tailwindcss` (styling) npm install -D tailwindcss @tailwindcss/vite
  - `zustand` (state management)
  - `react-hot-toast` (alerts)

### 2: Authentication & Session

- [x] Build login page (Admin, Cashier)
- [x] Implement JWT session handling (httpOnly cookie or localStorage)
- [x] Secure protected routes (redirect unauthenticated users)
- [x] Role-based routing (Admin → dashboard, Cashier → cashier panel)
- [x] Global `AuthContext` or `useAuth()` hook

  **Notes:** To remember clearly

  - **Tools & Libraries**

    - **React** – UI framework
    - **TailwindCSS** – Styling & responsive layout
    - **Zustand** – Global auth state management (`useAuthStore`)
    - **Axios** – HTTP client with JWT Authorization header
    - **React Router** – Client-side routing

  - **Authentication Implementation**
    - **Login Page (Admin & Cashier)**
      - Handles username/password, error display, responsive layout
      - Prevents multiple submissions with `submitting` state
    - **JWT Session Handling**
      - Token stored in **Zustand + `localStorage`**
      - Axios default header set to `Authorization: Bearer <token>`
    - **Protected Routes**
      - `ProtectedRoute.jsx` checks authentication and role
      - Redirects unauthenticated users to `/login`
    - **Role-Based Routing**
      - Admin → `/admin` dashboard
      - Cashier → `/cashier` dashboard
      - Automatic redirect after login based on `user.role`
    - **Global Auth State**
      - Zustand store contains: `user`, `token`, `error`, `login()`, `logout()`
      - Logout clears store, localStorage, and Axios header
      - Equivalent to a global `AuthContext/useAuth()` hook

### 3: Layout & Navigation

- [√] Sidebar + navbar (role-based menus)
- [√] Dynamic navigation (hide/show per role)
- [√] Setup global assets (logos, fonts, icons)

**Notes (for reference):**

- ✅ Used **ProtectedRoute** for role-based access control (Admin / Cashier).
- ✅ Created **AdminLayout** and **CashierLayout** with responsive top navigation bar (animated mobile menu using framer-motion).
- ✅ Installed **lucide-react** for icons → `npm install lucide-react`
- ✅ Installed **framer-motion** for animated dropdowns → `npm install framer-motion`
- ✅ TailwindCSS already configured for responsive UI.
- 📌 Next step: Add **global logo & custom fonts** inside `public/` or `src/assets/` folder, then configure them in `tailwind.config.js`.

### 4: Core Pages

- **Admin Panel**
  - [√] Manage Menus (CRUD for products/menu items)
  - [√] Manage Users (CRUD for system users, roles)
  - [√] View Audit Logs (track login & important actions), this sucks, later to be updated in backend di sya clear bro

# Cashier Dashboard Features

- **Manage Orders**

  - [√] Create new orders from menu grid
  - [√] Update order status (Pending → Preparing → Ready → Served)
  - [√] Search & filter orders by status or customer
  - [√] View detailed order info in modal
  - [√] Optimistic status updates with React Query (faster UI feedback)

- **Process Payments**

  - [√] Support multiple payment methods (Cash, Card, GCash)
  - [√] Simple dialog for selecting payment method
  - [√] Store chosen method in POS store for consistency
  - [√] Quick “Go Back” and “Confirm” actions for cashier efficiency

- **Generate Receipts**

  - [ ] Print receipts (thermal printer format)
  - [ ] Export receipt to PDF
  - [ ] Auto-include order details, totals, and payment method
  - [ ] Add business info & timestamp headers
  - [ ] Provide reprint option for past orders

- **Cart & Checkout**

  - [√] Add/remove menu items to cart
  - [√] Adjust quantity with + / – buttons
  - [√] Auto-calculate totals (real-time updates)
  - [√] Responsive drawer (right side on desktop, bottom sheet on mobile)
  - [√] Badge indicator for number of items in cart
  - [√] Navigate to checkout page

- **Menu Grid**

  - [√] Paginated menu display (24 items per page)
  - [√] Category filtering (Food, Beverages, Dessert, Snack, All)
  - [√] Search bar with live filtering
  - [√] Optimized rendering via `React.memo` for menu cards
  - [√] Add to cart button per item

- **Performance Optimizations**

  - [√] Stable callbacks & memoized list items
  - [√] Avoided unnecessary re-renders (Cart, Menu, Orders)
  - [√] Table layout fixed width (no horizontal scroll in fast-paced env)
  - [√] Responsive design for mobile + large screens
  - [√] Debounced search to reduce query spam
  - [√] Auto-scroll orders panel to top on refresh

- **Customer QR Page** → _To be done later_
  - Scan QR
  - Auto insert table number
  - Menu / Cart / Checkout

### – 5: State Management & API Integration

- [ ] Connect APIs (Axios + React Query)
- [ ] Global `OrderContext` (cart, order status)
- [ ] Handle loading & error states (skeletons, toasts)
- [ ] Input sanitization & validation

### – 6: Security

- [ ] Token expiration & refresh handling
- [ ] Role-based route guards
- [ ] Prevent direct API call misuse
- [ ] Confirm dialogs for critical actions

**Status:** 🚧 Not Started

---

## 4. Frontend Testing (Week 6)

### Unit Testing

**Tool:** Jest + React Testing Library

- [ ] Component tests (buttons, forms, modals)
- [ ] Hook tests (`useAuth`, `useOrders`)
- [ ] Snapshot tests

### Integration Testing

**Tool:** Cypress (End-to-End)

- [ ] Login flow (valid/invalid credentials)
- [ ] QR ordering (add to cart → checkout → DB update)
- [ ] Cashier flow (update order → payment → receipt)

### API Testing (Frontend-side)

**Tool:** Postman

- [ ] Validate API endpoints with frontend requests
- [ ] Test token expiration & role restrictions

### Performance & Security Testing

**Tool:** Lighthouse (Chrome DevTools)

- [ ] Performance score (loading speed, caching)
- [ ] Accessibility score (ARIA, labels, contrast)
- [ ] SEO score (scalability)
- [ ] PWA support (optional, for QR ordering offline mode)

**Status:** 🚧 Not Started

---

## 5. UI/UX & Optimization (Week 7)

- [ ] Responsive design (mobile-first, especially QR orders)
- [ ] Accessibility compliance (WCAG 2.1, ARIA attributes, alt texts)
- [ ] Lazy loading routes, code splitting
- [ ] Final UI polish with Tailwind + shadcn/ui
- [ ] Add modals/confirmations for destructive actions

**Status:** 🚧 Not Started

---

## 6. Predictive Analytics Module (Week 8)

- [ ] Implement regression models (time-series + multiple regression)
- [ ] Generate sales forecasts (daily/weekly trends)
- [ ] Display results in charts (Recharts/Chart.js)
- [ ] Evaluate model accuracy (MAE, MSE)
- [ ] Data validation & sanitization for analytics
- [ ] Cache results for fast dashboard display

**Status:** 🚧 Not Started

---

## 7. Final Testing & Deployment (Week 9–10)

- [ ] Full system testing (QR order → cashier → payment → audit trail)
- [ ] Fix bugs & optimize performance
- [ ] Deploy on local server (XAMPP/Laragon)
- [ ] Prepare demo dataset & test accounts
- [ ] Penetration testing (SQL injection, XSS, RBAC, token misuse)
- [ ] Load & stress testing (simulate multiple users/orders)
- [ ] Backup & rollback plan (DB + code restore)

**Status:** 🚧 Not Started

---

## 8. Future Enhancements (Optional)

- [ ] Multi-branch support
- [ ] Delivery module (currently excluded)
- [ ] Custom roles beyond Admin/Cashier
- [ ] Advanced ML forecasting (LSTM, Random Forest)
- [ ] Continuous monitoring & logging (error alerts, performance tracking)
