# Phase 5: Backend Development Plan - AI Customer Segment Profitability Analyzer

This document defines the architecture, routes, middleware, and request validation schemes for our Node.js/Express.js backend server.

---

## 1. What We Are Building
We are building a secure, RESTful API backend using Express.js:
1. **JWT Authentication**: Middleware to intercept incoming headers (`Authorization: Bearer <token>`), verify JWT signature, and append the current user session context (`req.user`) to the request object.
2. **Role Management (Guards)**: Middlewares to lock routes based on roles:
   - Only `ADMIN` can execute CSV upload imports and edit global settings.
   - Both `ADMIN` and `SALES_MANAGER` can fetch dashboards, segments, and AI strategist recommendations.
3. **Zod Validation Middleware**: Validator schema interceptors that check input schemas (e.g. login credentials, rating inputs, prompt adjustments) before controllers process them, responding with descriptive error messages for bad payloads.
4. **Centralized Error Handler**: Middleware catch-alls that handle server crashes and database exceptions.
5. **Endpoints Setup**:
   - `POST /api/auth/login` - Authenticates credentials and returns a JWT token.
   - `GET /api/auth/profile` - Fetches authenticated user account details.
   - `GET /api/customers` - Lists customers with search queries, segment filters, and column sorts.
   - `GET /api/customers/:id` - Returns a customer details card with transactions lists.
   - `POST /api/customers/:id/feedback` - Saves feedback rankings for AI strategies.
   - `GET /api/recommendations` - Fetches current AI strategies list.

## 2. Why We Are Building It
- **API Security**: Standardizing JWT validation ensures data is locked away from unauthorized users.
- **Robust Integrity**: Zod schemas filter bad inputs, protecting the database from corrupted entries.

---

## 3. Directory Layout (Backend Src)
We will expand the `backend/src` folder as:
```text
backend/src/
├── config/
│   └── gemini.js            # Gemini API setups
├── controllers/
│   ├── authController.js    # Login handlers
│   └── customerController.js# Query ledgers
├── middleware/
│   ├── auth.js              # Token and role guards
│   ├── validate.js          # Zod validation wrapper
│   └── errorHandler.js      # Central exception catch
├── routes/
│   ├── auth.js              # Routing /auth
│   └── customer.js          # Routing /customers
├── services/
│   ├── rfmService.js        # Mathematical RFM calculator
│   └── geminiService.js     # Prompt engineering wrapper
└── index.js                 # App entry point
```

---

## 4. Verification Plan
- Run the server using `npm run dev`.
- Make API requests using tools like Postman or fetch triggers.
- Verify that accessing `/api/customers` without a valid token returns a `401 Unauthorized` status.
- Verify that providing incorrect credentials on `/api/auth/login` returns a `400 Bad Request` status containing schema logs.

---

## 5. Git Commits for Phase 5
- **Commit message**: `feat: build express api controllers, routers, zod validators, and jwt authentication guards`
