# 🗂 Database Schema (Migration Definition)

### **1. users**
| Column         | Type             | Notes                          |
|----------------|------------------|--------------------------------|
| user_id (PK)   | bigIncrements    | Primary Key                    |
| name           | string(100)      |                                |
| username       | string(50)       | Unique                         |
| password       | string           | Hashed password                |
| role           | enum             | Values: `['Admin', 'Cashier']` |
| contact_number | string(20)       | Nullable                       |
| timestamps     | timestamps       | created_at, updated_at         |

---

### **2. customers**
| Column            | Type             | Notes                    |
|-------------------|------------------|--------------------------|
| customer_id (PK)  | bigIncrements    | Primary Key              |
| customer_name     | string(100)      | Nullable                 |
| table_number      | string(20)       | Required (from QR code)  |
| order_reference   | string(50)       | Unique (for receipts)    |
| timestamps        | timestamps       | created_at, updated_at   |

---

### **3. menus (products)**
| Column              | Type             | Notes                       |
|---------------------|------------------|-----------------------------|
| menu_id (PK)        | bigIncrements    | Primary Key                 |
| name                | string(100)      |                             |
| description         | text             | Nullable                    |
| price               | decimal(10,2)    |                             |
| category            | string(50)       | Example: drinks, food       |
| availability_status | boolean          | true=available, false=out   |
| product_details     | text             | ingredients, SKU, shelf life|
| timestamps          | timestamps       | created_at, updated_at      |

---

### **4. orders**
| Column             | Type             | Notes                                        |
|--------------------|------------------|----------------------------------------------|
| order_id (PK)      | bigIncrements    | Primary Key                                  |
| customer_id (FK)   | unsignedBigInteger | References `customers.customer_id`        |
| handled_by (FK)    | unsignedBigInteger | References `users.user_id`                 |
| order_type         | enum             | Values: `['dine-in','take-out']`             |
| status             | enum             | Values: `['pending','preparing','ready','served']` |
| total_amount       | decimal(10,2)    |                                              |
| order_timestamp    | timestamp        | default now()                                |
| expiry_timestamp   | timestamp        | Nullable                                     |
| order_source       | enum             | Values: `['QR','Counter']`                   |
| timestamps         | timestamps       | created_at, updated_at                       |

---

### **5. order_items**
| Column               | Type             | Notes                                    |
|----------------------|------------------|------------------------------------------|
| order_item_id (PK)   | bigIncrements    | Primary Key                              |
| order_id (FK)        | unsignedBigInteger | References `orders.order_id`           |
| menu_id (FK)         | unsignedBigInteger | References `menus.menu_id`             |
| quantity             | integer          |                                          |
| price                | decimal(10,2)    | (unit price at the time of order)        |
| timestamps           | timestamps       | created_at, updated_at                   |

---

### **6. payments**
| Column             | Type             | Notes                                    |
|--------------------|------------------|------------------------------------------|
| payment_id (PK)    | bigIncrements    | Primary Key                              |
| order_id (FK)      | unsignedBigInteger | References `orders.order_id`           |
| amount_paid        | decimal(10,2)    |                                          |
| payment_method     | enum             | Values: `['cash','gcash','card']`        |
| payment_status     | enum             | Values: `['pending','completed','failed']`|
| payment_timestamp  | timestamp        | default now()                            |
| timestamps         | timestamps       | created_at, updated_at                   |

---

### **7. audit_logs**
| Column          | Type             | Notes                                      |
|-----------------|------------------|--------------------------------------------|
| log_id (PK)     | bigIncrements    | Primary Key                                |
| user_id (FK)    | unsignedBigInteger | References `users.user_id`              |
| action          | string(255)      | e.g., "updated order status"               |
| timestamp       | timestamp        | default now()                              |
