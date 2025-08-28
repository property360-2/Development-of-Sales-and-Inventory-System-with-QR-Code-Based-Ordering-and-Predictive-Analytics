# 🛠 Developmental Plan (version ko) – Updated

## 1. Database Setup (Week 1)

- [√] Create full database schema in XAMPP (MySQL)
  - Tables: User, Customer, Menu, Order, Order_Item, Payment, Audit_Log
  - Add relationships (PK, FK)
  - Seed sample data (menu items, test users, dummy orders)
- [√] **Database constraints & security checks** ✅ Ensure foreign keys, unique indexes, not null constraints, and proper data types
- [√] **Initial backup & version control** ✅ Export schema for safety
- Status: FINISHEDDDDDDDDDDDDDDDD.

---

## 2. Backend Development (Laravel) (Week 2–3)

- [√] Setup Laravel project
- [√] Create models & migrations for all tables (Users, Customers, Menus, Orders, Order_Items, Payments, Audit_Logs)
- [√] Added database indexing ✅ (columns: `role`, `name`, etc.)
- [√] Custom primary keys in models ✅ (`user_id`, `customer_id`, `order_id`, etc.)
- [√] Foreign key constraints with cascade delete ✅ (Orders → Order_Items, Users → Audit_Logs)
- [√] Test in Tinker (all tables working, audit logs triggered)
- [√] Implement controllers & routes (CRUD for all resources)
- [√] Test the routes with Postman (runner sequence to prevent dependency issues)
- [√] Add RBAC (roles: Admin, Cashier) ✅ Role-based access enforced via middleware
- [√] Middleware & authentication (auth:sanctum) ✅ Only authenticated users can access protected routes
- [√] Input validation & sanitization ✅ Request validation prevents SQL injection & XSS
- [√] Implement Audit Log (auto-record actions) ✅ Track create, update, delete for all main entities
- [√] Unit test for API endpoints ✅ Includes security tests for forbidden actions and invalid tokens
- [√] Performance checks ✅ Eager loading & optimized queries implemented
- [√] Postman collection prepared ✅ Full CRUD testing sequences

**Status:** Complete – Backend fully implemented and tested  
**Notes:** All features tested successfully, audit logs verified, RBAC enforced, and Postman collection ready for frontend integration.

---

## 3. Frontend Development (React.js) (Week 4–5)

- [ ] QR Code Ordering Page (Customer)
- [ ] Cashier Dashboard (view/update orders, process payments)
- [ ] Admin Panel (manage menu, users, audit logs)
- [ ] Connect APIs using Axios/Fetch
- [ ] **Frontend security checks** ✅ Secure API calls with tokens, prevent token exposure, sanitize user input
- [ ] **State management & caching** ✅ Use React state/hooks efficiently, avoid unnecessary re-renders
- [ ] **Error handling & validation** ✅ Properly handle API errors and invalid input
- Status: ❌ Not Started

---

## 4. UI/UX & Accessibility (Week 6–7)

- [ ] Make system responsive (mobile-first for QR orders)
- [ ] Improve UI design (Tailwind or Bootstrap)
- [ ] Add accessibility (labels, alt texts, ARIA attributes)
- [ ] Polish cashier/admin dashboard
- [ ] **UI security checks** ✅ Avoid exposing sensitive info, confirm buttons/actions for critical operations
- [ ] **Performance & loading checks** ✅ Ensure fast rendering, optimize images & components
- Status: ❌ Not Started

---

## 5. Predictive Analytics Module (Week 8)

- [ ] Implement regression (Time-Series + Multiple Regression)
- [ ] Generate sales forecasts (daily/weekly trends)
- [ ] Show results in charts (Recharts/Chart.js)
- [ ] Evaluate model using MAE/MSE
- [ ] **Data validation & security** ✅ Ensure analytics inputs are sanitized, prevent manipulation
- [ ] **Performance & caching** ✅ Cache results where possible for fast dashboard display
- Status: ❌ Not Started

---

## 6. Testing & Final Deployment (Week 9–10)

- [ ] Full system testing (QR order → cashier → payment → audit trail)
- [ ] Fix bugs & performance issues
- [ ] Deploy on local server (XAMPP/Laragon)
- [ ] Prepare demo dataset & accounts
- [ ] **Penetration/security testing** ✅ Test SQL injection, XSS, RBAC, token misuse
- [ ] **Load & stress testing** ✅ Check performance under multiple users/orders
- [ ] **Backup & rollback plan** ✅ Ensure database and code can be restored
- Status: ❌ Not Started

---

## 7. Future Enhancements (Optional)

- [ ] Multi-branch support
- [ ] Delivery module (currently excluded)
- [ ] Custom roles beyond Admin/Cashier
- [ ] Advanced ML forecasting (LSTM, RF)
- [ ] **Continuous monitoring & logging** ✅ Add performance monitoring, error logging, and alerting
