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
- [√] Create models & migrations for all tables  
- [√] Test in Tinker (all tables working)  
- [√] Implement controllers & routes (CRUD)  
- [√] test the routes with postman(runner sequence para di masakit sa ulo)  
- [√] **Add RBAC (roles: Admin, Cashier)** ✅ Security checkpoint: enforce role-based access on all sensitive routes, i used middleware saka doon sa routers
- [√] **Middleware & authentication (auth:sanctum)** ✅ Security checkpoint: only authenticated users can access protected routes 
- [√] 1st batch testing (api/routes, rbac(middleware))
- [√] **Input validation & sanitization** ✅ Security checkpoint: prevent SQL injection, XSS via request validation 
- [√] 2nd batch testing (sanitization,validation)
- [√] **Implement Audit Log (auto-record actions)** ✅ Security checkpoint: track who did what (in proggress some backend function are buggy)  
- [ ] **Unit test for API endpoints** ✅ Include security tests for forbidden actions and invalid tokens  
- [ ] **Performance checks** ✅ Use eager loading where necessary, optimize queries  
- Status: in Progress
- Notes: added installed sanctum, api
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
