# Entity Relationship Diagram (ERD)

## Entities & Attributes

### User
- **user_id (PK)**
- name
- username
- password
- role (**Admin, Cashier**)
- contact_number

### Customer
- **customer_id (PK)**
- customer_name
- table_number
- order_reference

### Menu (Product)
- **menu_id (PK)**
- name
- description
- price
- category
- availability_status
- product_details (ingredients, SKU, shelf life)

### Order
- **order_id (PK)**
- customer_id (FK → Customer.customer_id)
- handled_by (FK → User.user_id → Cashier/Admin)
- order_type (dine-in, take-out)
- status (pending, preparing, ready, served)
- total_amount
- order_timestamp
- expiry_timestamp
- order_source (QR, Counter)

### Order_Item
- **order_item_id (PK)**
- order_id (FK → Order.order_id)
- menu_id (FK → Menu.menu_id)
- quantity
- price

### Payment
- **payment_id (PK)**
- order_id (FK → Order.order_id)
- amount_paid
- payment_method
- payment_status
- payment_timestamp

### Audit_Log
- **log_id (PK)**
- user_id (FK → User.user_id)
- action 
- timestamp

---

## Relationships
- **Customer → Order**: One customer can place many orders.  
- **Order → Order_Item**: One order can contain many order items.  
- **Menu → Order_Item**: One menu item can appear in many order items.  
- **Order → Payment**: One order has one payment (1:1).  
- **User (Admin/Cashier) → Order**: Only system users can handle orders & update status.  
- **User → Audit_Log**: All actions performed by system users are logged.  
