# Backend Documentation (Laravel API)

## Overview
- Framework: Laravel (Sanctum for API tokens)
- Purpose: Sales and Inventory System with QR-based ordering support, cashier/admin operations, audit logging
- Roles: Admin, Cashier. Public (unauthenticated) QR customer flow for menus and registration

## Tech Stack
- PHP 12.25.0, Laravel
- Database: MySQL/MariaDB (via Eloquent)
- Auth: Laravel Sanctum (Bearer tokens)
- Pagination: Laravel paginator (JSON structure)

## Project Structure (Backend)
- `app/Http/Controllers` – REST controllers (Users, Menus, Orders, Payments, Customers, Audit Logs, Auth)
- `app/Http/Middleware/RoleMiddleware.php` – Role-based access control
- `app/Models` – Eloquent models (`User`, `Customer`, `Menu`, `Order`, `OrderItem`, `Payment`, `AuditLog`)
- `routes/api.php` – API routes
- `database/migrations` – Schema definitions

## Setup & Run
1) Install dependencies
```bash
composer install
```
2) Configure environment
- Copy `.env.example` to `.env`
- Set `DB_*` variables
- Set `SANCTUM_STATEFUL_DOMAINS` (if using SPA on different host)
- Set `APP_URL` (e.g., http://localhost:8000)
3) Generate app key
```bash
php artisan key:generate
```
4) Run migrations and seeders (optional seeders provided)
```bash
php artisan migrate
php artisan db:seed
```
5) Serve API
```bash
php artisan serve --host=0.0.0.0 --port=8000
```
The API base URL defaults to `http://localhost:8000/api`.

## Authentication
- Endpoint: `POST /api/login`
- Body:
```json
{
  "username": "admin",
  "password": "secret"
}
```
- Response:
```json
{
  "token": "<sanctum_token>",
  "user": {
    "user_id": 1,
    "name": "Admin User",
    "username": "admin",
    "role": "Admin",
    "contact_number": "..."
  }
}
```
- Use `Authorization: Bearer <token>` header for all protected endpoints.

### Roles & Authorization
- Implemented via `RoleMiddleware`.
- Usage: `role:Admin` or `role:Cashier,Admin` on route groups.
- If missing/invalid token → `401 Unauthorized`
- If role not allowed → `403 Forbidden`

## API Routes
Defined in `routes/api.php`.

### Public
- `POST /api/customers` – Register QR/walk-in customer
- `GET /api/menus` – Public menu listing for QR customers

### Authenticated (auth:sanctum)

#### Admin-only
- `GET /api/audit-logs` – Paginated audit logs
- `GET /api/audit-logs/{id}` – Audit log detail
- `apiResource('users')` – Users CRUD: `/api/users`
- `apiResource('menus')` – Menus CRUD: `/api/menus`

#### Admin + Cashier
- `apiResource('orders')` – Orders full CRUD: `/api/orders`
- Payments (no delete):
  - `GET /api/payments`
  - `GET /api/payments/{id}`
  - `POST /api/payments`
  - `PUT /api/payments/{id}`
- Customers (no delete):
  - `GET /api/customers`
  - `GET /api/customers/{id}`
  - `POST /api/customers`
  - `PUT /api/customers/{id}`
- Menus (read-only):
  - `GET /api/menus`
  - `GET /api/menus/{id}`

## Request/Response Examples

### Login
```http
POST /api/login
Content-Type: application/json

{"username":"cashier","password":"secret"}
```
- `200 OK` with `{ token, user }`
- `401 Invalid credentials`

### Get Menus (public)
```http
GET /api/menus
```
- `200 OK` `[ { menu_id, name, price, ... }, ... ]`

### Create Customer (public or cashier/admin)
```http
POST /api/customers
Content-Type: application/json

{
  "customer_name": "Juan D",
  "table_number": "12",
  "order_reference": "QR-12-20250910-001"
}
```
- `201 Created` `{ customer_id, ... }`
- `422 Unprocessable Entity` on validation error

### Create Order (cashier/admin)
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": 10,
  "handled_by": 1,
  "order_type": "dine-in",
  "status": "pending",
  "total_amount": 450.00,
  "order_source": "Counter",
  "items": [
    { "menu_id": 1, "quantity": 2, "price": 120.00 },
    { "menu_id": 5, "quantity": 1, "price": 210.00 }
  ]
}
```
- Expected `201 Created` with created order and items

### Record Payment (cashier/admin)
```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": 100,
  "amount_paid": 450.00,
  "payment_method": "cash",
  "payment_status": "completed"
}
```
- `201 Created` `{ payment_id, ... }`

### Audit Logs (admin)
```http
GET /api/audit-logs?per_page=20
Authorization: Bearer <token>
```
- `200 OK` Laravel pagination payload with `data[]` containing `{ log_id, user_id, action, timestamp, user: { user_id, name, role } }`

## Validation
Form requests live under `app/Http/Requests` (e.g., `Auth/LoginRequest.php`, `Store/*Request.php`, `Update/*Request.php`). These ensure required fields and types; failed validation returns `422` with error details.

## Models & Schema
See `documentation/erd.md` and `documentation/data-dictionary.md` for full field lists. Key points:
- Primary keys use explicit names (e.g., `user_id`, `order_id`)
- `User` model hides `password` in JSON
- `User` model writes audit logs on create/update/delete via model events

## Audit Logging
- `AuditLog` stores `user_id`, `action`, `timestamp`
- Controllers and model events contribute entries (e.g., user CRUD)
- Endpoints support pagination and include user info via `with('user')`

## Error Handling
- `401 Unauthorized` – Missing/invalid token
- `403 Forbidden` – Role not permitted
- `404 Not Found` – Resource missing
- `422 Unprocessable Entity` – Validation errors
- `500 Internal Server Error` – Unhandled exceptions

## Pagination
Standard Laravel paginator:
```json
{
  "current_page": 1,
  "data": [ ... ],
  "first_page_url": "...",
  "from": 1,
  "last_page": 5,
  "last_page_url": "...",
  "links": [ ... ],
  "next_page_url": "...",
  "path": "...",
  "per_page": 20,
  "prev_page_url": null,
  "to": 20,
  "total": 100
}
```

## Security Considerations
- Store hashed passwords (`Hash::make`) and never return them
- Use HTTPS in production
- Limit CORS to trusted origins
- Rotate/revoke tokens on logout (backend logout route can be added to delete current token)

## CORS
Configure CORS in `config/cors.php` and `.env` as needed for the frontend origin.

## Seeding & Factories
- Default `UserFactory` available under `database/factories`
- Add initial Admin user via seeder or tinker as needed

## Postman/Insomnia
- Collection: `restaurant_api.postman_collection.json` at repo root. Import for quick testing.

## Roadmap (Backend)
- Inventory deduction and stock movement on order create/update
- Logout endpoint to revoke Sanctum tokens
- QR workflow helper to bind `table_number` and start orders
- Predictive analytics endpoints (time-series forecasts)
- Enhanced audit logging across all sensitive operations

## Versioning
- Current: v0 (pre-release). Consider semantic versioning for future API changes.

---

## Endpoint Field Reference

### Users
- Base: `/api/users` (Admin)
- Create (POST):
  - Fields:
    - `name` (string, required, max 100)
    - `username` (string, required, max 50, unique)
    - `password` (string, required, min 6)
    - `role` (enum, required, one of: `Admin`, `Cashier`)
    - `contact_number` (string, optional, max 20)
- Update (PUT/PATCH `/api/users/{id}`):
  - Fields: same as create but all `sometimes`; `username` unique excluding current id
- List (GET): paginated list with `user_id, username, name, role, created_at, contact_number`
- Show (GET `/api/users/{id}`): selected fields
- Delete (DELETE `/api/users/{id}`): `204 No Content`

### Menus
- Base: `/api/menus` (Admin full CRUD; Cashier/Admin read-only)
- Create (POST):
  - `name` (string, required, max 100)
  - `description` (string, optional)
  - `price` (number, required, min 0)
  - `category` (string, required, max 50)
  - `availability_status` (boolean, required)
  - `product_details` (string, optional)
- Update (PUT/PATCH `/api/menus/{id}`): same fields `sometimes`; `availability_status` accepts `0` or `1`
- List/Show: paginated/select fields
- Delete: `204 No Content`

### Customers
- Base: `/api/customers` (Public create; Cashier/Admin list/show/update)
- Create (POST):
  - See `StoreCustomerRequest` in code; typical fields used:
    - `customer_name` (string, optional, max 100)
    - `table_number` (string, required)
    - `order_reference` (string, required, unique)
- Update (PUT `/api/customers/{id}`): fields `sometimes`
- List/Show: paginated/select fields
- Delete (if routed): controller supports, route currently not exposed for Cashier/Admin per `api.php`

### Orders
- Base: `/api/orders` (Cashier/Admin)
- Create (POST):
  - `customer_id` (exists: customers.customer_id, required)
  - `handled_by` (exists: users.user_id, optional)
  - `order_type` (enum, required: `dine-in`, `take-out`)
  - `status` (enum, required: `pending`, `preparing`, `ready`, `served`)
  - `total_amount` (number, required, min 0)
  - `order_timestamp` (ISO8601 string, optional)
  - `expiry_timestamp` (ISO8601 string, optional)
  - `order_source` (enum, required: `QR`, `COUNTER`)
- Update (PUT `/api/orders/{id}`): same fields `sometimes`; `order_source` allows `QR` or `Counter`
- List/Show: includes relations `customer`, `user`, `items.menu`, `payments`
- Delete: `204 No Content`

### Payments
- Base: `/api/payments` (Cashier/Admin; no delete route in `api.php`)
- Create (POST):
  - `order_id` (exists: orders.order_id, required)
  - `amount_paid` (number, required, min 0)
  - `payment_method` (enum, required: `cash`, `gcash`, `card`)
  - `payment_status` (enum, required: `pending`, `completed`, `failed`)
- Update (PUT `/api/payments/{id}`): fields `sometimes`; may include `payment_timestamp` (date)
- List/Show: includes related `order`

### Order Items
- Controller: `OrderItemController` supports CRUD
- Fields (Create):
  - `order_id` (exists: orders.order_id, required)
  - `menu_id` (exists: menus.menu_id, required)
  - `quantity` (integer, required, min 1)
  - `price` (number, required, min 0)
- Note: Routes for order items are not currently registered in `routes/api.php`. To expose:
  - Add `Route::apiResource('order-items', OrderItemController::class);` under the appropriate role group.

---

## Logout (Token Revocation)
- Not implemented yet. Recommended endpoint:
```http
POST /api/logout
Authorization: Bearer <token>
```
- Behavior: Revoke/delete the current Sanctum token. Response `204 No Content`.
- Implementation sketch (controller):
```php
$request->user()->currentAccessToken()->delete();
return response()->noContent();
```
- Add route under `auth:sanctum` group for Cashier/Admin/Admin-only as needed.

---

## QR Ordering Flow
- Goal: Allow customers to scan a table QR and start an order without login.
- Suggested URL scheme: `/qr?table=12` (frontend route) or a short hash mapping to `table_number`.
- Typical sequence:
  1. Customer scans QR → frontend captures `table` parameter
  2. Frontend fetches public menus: `GET /api/menus`
  3. Frontend registers or upserts a customer: `POST /api/customers` with `{ table_number, customer_name?, order_reference }`
  4. Cashier/Admin later creates order referencing `customer_id` and sets `order_source=QR`
- Security: Keep QR endpoints limited to non-destructive actions; validation on `table_number` and `order_reference` uniqueness.

---

## Known Behaviors & Notes
- Many list/show endpoints write audit logs when a user context exists; public endpoints skip logging.
- `User` model emits audit logs on create/update/delete capturing changes via `getChanges()` on update.
- Date formats: Orders accept ISO8601 strings for timestamps on create; updates accept generic date values where indicated.
- Pagination default `per_page=20`; configurable via query param where implemented.

---

## Changelog
- 2025-09-10: Initial complete backend docs with field references and flow notes.