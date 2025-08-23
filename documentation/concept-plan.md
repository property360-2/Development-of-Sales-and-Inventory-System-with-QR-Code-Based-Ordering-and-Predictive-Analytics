# 📖 Concept Plan  

## Project Title  
**Sales and Inventory System with QR Code-Based Ordering and Predictive Analytics**  

---

## Overview  
This system is designed for small restaurants to simplify and modernize their operations. Customers can place orders by scanning a **QR code**, while cashiers can handle traditional counter orders. The system updates the inventory in real time, manages sales and payments, and uses predictive analytics to forecast demand based on historical data.  

---

## Core Features  

### 1. QR Code Ordering  
- Customers scan a QR code using their phone.  
- then some details will be inserted in the web once the qr was scanned such as table number so they dont need to manual input table
- They can select menu items, quantity.  
- Order is automatically saved in the system.  

### 2. Cashier-Assisted Ordering  
- Cashier can input manual orders for customers who order at the counter.  
- Both QR and counter orders are recorded in the same database.  

### 3. Order & Payment Management  
- Cashier/Admin can update order status (*pending → preparing → ready → served*).  
- Payments are tracked with amount, method, and timestamp.  
- Receipts are generated per order.  

### 4. Inventory & Menu Management  
- Admin manages menu items (add, update, delete).  
- Product details stored   
- Inventory auto-updates whenever orders are placed.  

### 5. Predictive Analytics  
- Uses **time-series regression models** to forecast sales.  
- Provides insights such as peak hours, best sellers, and demand trends.  
- Helps prevent stockouts and overstocking.  

### 6. Audit Trail & Security  
- All user actions (login, menu update, order status change) are logged.  
- Admin has full system control.  
- Cashier limited to orders and payments.  
- Ensures accountability and prevents unauthorized changes.  

---

## Users of the System  
- **Customer** → Orders through QR code (no login required).  
- **Cashier** → Handles orders, updates order status, verifies payments.  
- **Admin** → Full control (manage users, menu, inventory, audit logs, analytics).  

---

## Benefits  
- **For Customers** → Faster, contactless ordering.  
- **For Staff** → Reduced manual errors and streamlined workflow.  
- **For Owners** → Better inventory control and sales forecasting.  
- **For System Security** → Actions are tracked through audit trail for accountability.  
