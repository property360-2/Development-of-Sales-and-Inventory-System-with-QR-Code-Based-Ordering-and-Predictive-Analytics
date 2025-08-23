# 🛠 Developmental Plan (version ko)

## 1. Database Setup (Week 1)
- [x] Create full database schema in XAMPP (MySQL)
  - Tables: User, Customer, Menu, Order, Order_Item, Payment, Audit_Log
  - Add relationships (PK, FK)
  - Seed sample data (menu items, test users, dummy orders)
- Status: 

---

## 2. Backend Development (Laravel) (Week 2–3)
- [ ] Setup Laravel project
- [ ] Create models & migrations for all tables
- [ ] Implement controllers & routes (CRUD)
- [ ] Add RBAC (roles: Admin, Cashier)
- [ ] Implement Audit Log (auto-record actions)
- [ ] Unit test for API endpoints
- Status:  ❌ Not Started

---

## 3. Frontend Development (React.js) (Week 4–5)
- [ ] QR Code Ordering Page (Customer)
- [ ] Cashier Dashboard (view/update orders, process payments)
- [ ] Admin Panel (manage menu, users, audit logs)
- [ ] Connect APIs using Axios/Fetch
- Status:  ❌ Not Started

---

## 4. UI/UX & Accessibility (Week 6–7)
- [ ] Make system responsive (mobile-first for QR orders)
- [ ] Improve UI design (Tailwind or Bootstrap)
- [ ] Add accessibility (labels, alt texts, ARIA attributes)
- [ ] Polish cashier/admin dashboard
- Status:  ❌ Not Started

---

## 5. Predictive Analytics Module (Week 8)
- [ ] Implement regression (Time-Series + Multiple Regression)
- [ ] Generate sales forecasts (daily/weekly trends)
- [ ] Show results in charts (Recharts/Chart.js)
- [ ] Evaluate model using MAE/MSE
- Status:  ❌ Not Started

---

## 6. Testing & Final Deployment (Week 9–10)
- [ ] Full system testing (QR order → cashier → payment → audit trail)
- [ ] Fix bugs & performance issues
- [ ] Deploy on local server (XAMPP/Laragon)
- [ ] Prepare demo dataset & accounts
- Status:  ❌ Not Started

---

## 7. Future Enhancements (Optional)
- [ ] Multi-branch support
- [ ] Delivery module (currently excluded)
- [ ] Custom roles beyond Admin/Cashier
- [ ] Advanced ML forecasting (LSTM, RF)

---
