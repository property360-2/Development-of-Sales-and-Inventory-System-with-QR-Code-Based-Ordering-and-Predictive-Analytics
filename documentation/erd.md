# 📌 Entity Relationship Diagram (ERD with Indexes)

## Entities & Attributes

### **User**
- **user_id (PK)**
- name *(IDX)*
- username *(UNIQUE IDX)*
- password
- role (**Admin, Cashier**) *(IDX)*
- contact_number  

---

### **Customer**
- **customer_id (PK)**
- customer_name *(IDX)*
- table_number *(IDX)*
- order_reference *(UNIQUE IDX)*  

---

### **Menu (Product)**
- **menu_id (PK)**
- name *(IDX)*
- description
- price *(IDX)*
- category *(IDX)*
- availability_status *(IDX)*
- product_details  

---

### **Order**
- **order_id (PK)**
- customer_id (FK → Customer.customer_id) *(IDX)*
- handled_by (FK → User.user_id) *(IDX)*
- order_type (dine-in, take-out) *(IDX)*
- status (pending, preparing, ready, served) *(IDX)*
- total_amount *(IDX)*
- order_timestamp *(IDX)*
- expiry_timestamp
- order_source (QR, Counter) *(IDX)*
- *(Composite IDX → [customer_id, status])*  

---

### **Order_Item**
- **order_item_id (PK)**
- order_id (FK → Order.order_id) *(IDX)*
- menu_id (FK → Menu.menu_id) *(IDX)*
- quantity
- price  

---

### **Payment**
- **payment_id (PK)**
- order_id (FK → Order.order_id) *(IDX)*
- amount_paid
- payment_method (cash, gcash, card) *(IDX)*
- payment_status (pending, completed, failed) *(IDX)*
- payment_timestamp *(IDX)*
- *(Composite IDX → [payment_method, payment_status])*  

---

### **Audit_Log**
- **log_id (PK)**
- user_id (FK → User.user_id) *(IDX)*
- action *(IDX)*
- timestamp *(IDX)*
- *(Composite IDX → [user_id, timestamp])*  

---

## Relationships
- **Customer → Order**: One customer can place many orders.  
- **Order → Order_Item**: One order can contain many order items.  
- **Menu → Order_Item**: One menu item can appear in many order items.  
- **Order → Payment**: One order has one payment (1:1).  
- **User (Admin/Cashier) → Order**: Only system users can handle orders & update status.  
- **User → Audit_Log**: All actions performed by system users are logged.  
