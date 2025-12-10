# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

PrimeDeal is a quick-commerce web application for daily essentials, built with a TypeScript MERN-style stack:

- **Backend**: Node.js + TypeScript + Express, Prisma (MySQL), JWT auth, Cloudinary uploads
- **Frontend**: React + TypeScript + Vite, Tailwind-based UI (shadcn-style components), Zustand for state management
- **Deployment shape**: A single Node server (`server/index.ts`) serving REST APIs under `/api/v1/*` and also serving the built client bundle from `client/dist`.

Key top-level pieces:
- `server/`: Express app, routes, controllers, middlewares, and utilities.
- `prisma/schema.prisma`: Database schema (MySQL) used by Prisma.
- `client/`: Vite React SPA, including routing, layouts, UI components, and Zustand stores.

## How to run and build

All commands below are run from the **repo root** unless otherwise noted.

### Install dependencies

- Install backend dependencies (root) and client dependencies:
  - `npm install`
  - `npm install --prefix client`

> Note: the root `build` script already runs both `npm install` commands, but during development you typically want to install once up front and then run dev servers directly.

### Backend (server)

Defined in root `package.json` (name: `server`).

- **Start dev server with TypeScript + nodemon** (watches `server/index.ts`):
  - `npm run dev`
- **Start server (plain, no ts-node exec)**:
  - `npm run start`
- **Build client from root** (installs deps and builds client bundle):
  - `npm run build`

The Express app:
- Entry: `server/index.ts`
- Serves APIs under:
  - `/api/v1/user`
  - `/api/v1/shop`
  - `/api/v1/product`
  - `/api/v1/address`
  - `/api/v1/order`
  - `/api/v1/admin`
- Serves static client build from `client/dist` using `express.static`.

#### Environment

- Environment variables are loaded via `dotenv` in `server/index.ts`.
- Important config:
  - `SECRET_KEY` comes from `process.env.SECRET_KEY` with a fallback in `server/config/varibles.ts`.
  - Prisma datasource is MySQL, configured via `DATABASE_URL` in `prisma/schema.prisma`.

### Prisma (database)

Prisma is used via `@prisma/client` and `prisma`:
- Client is instantiated in `server/db/db.ts` (`export const prisma = new PrismaClient()`), consumed in controllers (e.g. `server/controller/user.controller.ts`).

Useful Prisma CLI commands (run from repo root):
- Generate Prisma client (after schema changes):
  - `npx prisma generate`
- Apply migrations in development (if migrations are configured):
  - `npx prisma migrate dev`

### Frontend (client)

Defined in `client/package.json` (name: `client`).

Run these from the **client** directory unless you explicitly use `--prefix client` at the root.

- **Dev server** (Vite, bound to all hosts):
  - From `client/`: `npm run dev`
  - From repo root: `npm run dev --prefix client`
- **Build client**:
  - From `client/`: `npm run build`
  - From repo root: `npm run build --prefix client`
- **Preview built client** (Vite preview):
  - From `client/`: `npm run preview`
- **Lint frontend**:
  - From `client/`: `npm run lint`

The backend CORS config currently allows:
- `http://localhost:5173`
- `http://192.168.137.1:5173`

`client/src/config/varibles.ts` sets:
- `API_END_POINT = "http://192.168.137.1:3000/api/v1"`

If you change server host/port, update both the CORS `origin` list in `server/index.ts` and `API_END_POINT` on the client.

### Tests

There are currently **no explicit test scripts** defined in `package.json` files. If you introduce a test runner (e.g. Jest, Vitest), prefer adding scripts like `test`, `test:watch`, and document per-package usage here.

## High-level backend architecture

### Express app and routing

- Entry point: `server/index.ts`.
- Core middleware stack:
  - `body-parser` and `express.json()` for JSON payloads.
  - `express.urlencoded` for form data.
  - `cookie-parser` for reading auth cookies.
  - `cors` with explicit origins and `credentials: true`.
  - Custom `errorHandler` (`server/middlewares/errorHandler.ts`) registered after routes.
- Routes are modularized under `server/routes/` and mounted with versioned prefixes in `server/index.ts`.

Route directories (examples):
- `server/routes/user.route.ts` → user auth and profile endpoints.
- `server/routes/shop.route.ts` → shop CRUD and listing.
- `server/routes/product.route.ts` → product and inventory-related endpoints.
- `server/routes/address.route.ts` → address management for users.
- `server/routes/order.route.ts` → order placement and status.
- `server/routes/admin.route.ts` → admin-level management flows.

Each route file:
- Uses an Express `Router` instance.
- Binds paths to controller functions (from `server/controller/*.controller.ts`).
- Applies `isAuthenticated` middleware on protected routes.

### Controllers and business logic

Controllers live under `server/controller/` and encapsulate request handling + domain logic. They follow a pattern:
- Wrapped with `asyncHandler` from `server/utils/asyncHandler.ts` for centralized async error handling.
- Throw `AppError` for expected failures (validation, auth, etc.).
- Use the shared `prisma` client from `server/db/db.ts` for DB access.

Example: `server/controller/user.controller.ts` implements:
- `signUp`:
  - Validates uniqueness on email and phone.
  - Hashes passwords with `bcrypt`.
  - Creates a `User` record via Prisma.
  - Issues auth token via `generateToken` (sets cookie).
- `Login`:
  - Looks up user by email, validates password.
  - Issues token and updates `updatedAt` as a last-login marker.
- `checkAuth`:
  - Reads `req.id` populated by `isAuthenticated` middleware.
  - Returns a safe subset of user fields.
- `updateUserProfile`:
  - Optionally uploads a profile picture to Cloudinary using `server/utils/cloudinary.ts`.
  - Updates the `User` record with trimmed/validated fields.

Other controllers (`shop.controller.ts`, `products.controller.ts`, `address.controller.ts`, `order.controller.ts`, `admin.controller.ts`) follow a similar pattern: 
- Validate request payload
- Use Prisma to operate on the schema models
- Return JSON payloads consumed by the React client

### Auth and middleware

Key middleware and helpers:
- `server/middlewares/isAuthenticated.ts`:
  - Parses JWT (likely from cookies/headers) and hydrates `req.id`.
  - Used to gate routes that require logged-in users.
- `server/middlewares/errorHandler.ts`:
  - Central error-handling middleware; works with `AppError` and generic errors.
- `server/middlewares/multer.ts`:
  - Configures file upload handling (used by controllers that accept file uploads).
- `server/utils/generatToken.ts`:
  - Encapsulates token generation and cookie setting logic.
- `server/utils/cloudinary.ts` & `server/utils/imageUpload.ts`:
  - Cloudinary integration and upload utilities.
- `server/utils/genVerificationCode.ts`:
  - Helper for generating verification codes (e.g., email/phone flows).

### Data model (Prisma / MySQL)

The domain model lives in `prisma/schema.prisma` and is central to both backend behavior and frontend expectations.

Key models and relationships:
- `User`:
  - Basic auth and profile info (`fullname`, `email`, `phoneNumber`, `passwordHash`, `profilePicture`, `admin`).
  - Relations: `addresses`, `shops`, `orders`.
- `Shop`:
  - Owned by a `User` (`userId`), contains store metadata (location, delivery time, etc.).
  - Relations: `inventory` (shop-specific stock/pricing via `ShopInventory`), `orders`.
- `Product`:
  - Global product catalog: `name`, `description`, `brand`, `image`, `netQty`, `unit`.
  - Relations: `category`, `inShops` (inventory entries), `orderItems`.
- `ShopInventory`:
  - Per-shop stock and pricing for a product.
  - Fields: `shopId`, `productId`, `price`, `quantity`, `netQty`, `unit`, `isAvailable`.
  - Enforces unique `(shopId, productId)` pairs.
- `Address`:
  - User addresses including geo coordinates and `isDefault` flag.
  - Relation to `User` (`onDelete: Cascade`) and `Order`.
- `Order` / `OrderItem` / `Delivery` / `Payment`:
  - `Order`: ties together `User`, `Shop`, `Address`, and order statuses.
  - `OrderItem`: line items with `quantity` and `pricePerUnit`.
  - `Delivery`: tracks delivery assignment and timestamps.
  - `Payment`: tracks payment method, transaction ID, amount, and `PaymentStatus`.
- Enums: `OrderStatus`, `DeliveryStatus`, `PaymentStatus`, `Unit` (various measurement units for product quantities).

Understanding these Prisma models is essential when modifying controllers or adding new API endpoints, since the React client and Zustand stores are structured around them.

## High-level frontend architecture

### Application entry and layout

- Entry point: `client/src/main.tsx`
  - Renders `App` and a global `<Toaster />` (for `sonner` notifications).
- Layouts:
  - `client/src/Layout/MainLayout.tsx`:
    - Wraps pages with `Navbar` and `Footer`.
    - Uses React Router’s `<Outlet />` for nested routes.

Pages and flows are implemented across:
- `client/src/components/` – core user-facing pages and shared UI pieces.
- `client/src/admin/` – admin dashboard, inventory management, store views.
- `client/src/auth/` – auth-related screens (login, signup, verify, reset password).

Representative components:
- `LandingPage.tsx` – public marketing/entry page with CTAs into customer/seller signup.
- `AvailableProducts.tsx`, `ShopDetails.tsx`, `Cart.tsx`, `CheckoutConfirm.tsx`, `OrderPage.tsx`, `OrdersDetail.tsx` – commerce flows.
- `Nearby.tsx` – likely uses mapping (see `config/map.ts` and `@react-google-maps/api`).

### API configuration

Centralized Axios client in `client/src/config/api.ts`:
- Base URL comes from `API_END_POINT` in `client/src/config/varibles.ts`.
- `withCredentials: true` to support cookie-based auth.
- Request interceptor:
  - Reads `token` from `localStorage` and sets `Authorization: Bearer <token>`.
- Response interceptor:
  - Logs response data for debugging.
  - On error, inspects HTTP status codes and displays user-facing toasts via `sonner`.
  - On `401`, clears `localStorage` and prompts user to log in again.

This module should be used for all network requests so that auth headers and error handling stay consistent.

### State management (Zustand)

Zustand stores live under `client/src/zustand/` and hold key client-side state.

Examples:
- `useCartStore`:
  - Persists cart to `localStorage` under key `prime-deal-cart` via `persist` + `createJSONStorage`.
  - Normalizes products from different sources (`AvailableProducts`, `ShopDetails`) into a unified `CartItem` shape.
  - Exposes actions: `addToCart`, `removeFromCart`, `increMentQuantity`, `decreMentQuantity`, `clearCart`, `clearShopCart`, `getShopCart`.
  - Enforces a max quantity (e.g., `Math.min(quantity + 1, 10)`) per item.
- Other stores (from filenames):
  - `useUserStore`, `useShopStore`, `useProductStore`, `useOrderStore`, `useAddressStore`, `useThemeStore` – manage user session, shop catalog, products, orders, addresses, and theme preferences.

Patterns:
- Stores often wrap side-effecting operations with toasts for UX feedback.
- State is normalized around backend IDs and schema (e.g., `shopId`, `productId`, `Order`/`Shop` relations).

### UI components and styling

- UI primitives under `client/src/components/ui/` mirror shadcn-style components (button, card, dialog, table, etc.).
- Styling is Tailwind-based, with layout utilities used heavily across pages.
- Icons from `lucide-react`, animations from `framer-motion`, and notifications from `sonner`.

## Working effectively in this repo

When modifying or extending functionality:

- **Backend changes**:
  - Check whether the desired behavior maps to an existing Prisma model or requires schema changes.
  - If changing `prisma/schema.prisma`, regenerate the client and ensure affected controllers/routes are updated.
  - Keep controller logic behind `asyncHandler` and use `AppError` for predictable error handling.

- **Frontend changes**:
  - Use the shared Axios instance (`config/api.ts`) for network calls.
  - Prefer updating or creating Zustand store actions over ad-hoc component-level state for cross-cutting concerns (cart, user, shop data, etc.).
  - Reuse `components/ui/*` primitives and existing layout patterns (`MainLayout`, `Navbar`, `Footer`).

- **End-to-end features** typically require coordinated changes:
  - Prisma schema and migrations (if the data model changes).
  - Controllers + routes on the backend.
  - Types and schemas in `client/src/types` and `client/src/schema`.
  - Zustand stores and React components that consume the new/changed API.
