# Phase 4: Frontend Development Plan - AI Customer Segment Profitability Analyzer

This document defines the page-by-page build sequence for the React/Vite/TailwindCSS frontend interface. 

---

## 1. What We Are Building
We are building the user interface of our web app using React, Tailwind CSS v4, and Lucide React icons. We will construct:
1. **Routing and Shell**: Sidebar navigation, top header navbar, and page wrappers.
2. **Page 1: Login**: Authentication portal with role choices.
3. **Page 2: Dashboard**: Overview KPIs and preview metrics charts.
4. **Page 3: Upload CSV**: File parsing zone with validation progress logs.
5. **Page 4: Customer Segments**: Main segment dashboard containing filters, search, and table lists.
6. **Page 5: Customer Details**: Customer ledger profile and transactions logs.
7. **Page 6: AI Recommendations**: View panel for AI prompts and generation results.
8. **Page 7: History**: List of previously analyzed files and strategies.
9. **Page 8: Analytics Dashboard**: In-depth Recharts distribution and sales analysis.
10. **Page 9: Settings**: Admin settings panel.

## 2. Why We Are Building It
- **Modular Progress**: Building page-by-page allows us to test design states, routing boundaries, and responsiveness increments before loading database integration features.

---

## 3. Libraries to Install
We will install these packages inside the `frontend` folder:
- `react-router-dom`: Simple route navigation manager.
- `lucide-react`: Modern SVG outline icons package.
- `recharts`: Chart rendering module.

---

## 4. Phase 4 - Build Step 1: Layout Shell & Login Page
Our initial build target contains:
1. **Toast Notification System**: Lightweight notification alert context.
2. **Mock Authentication State**: Session provider simulation.
3. **Responsive Sidebar**: Nav items with active state highlights.
4. **Login Screen**: Clean card centered layout with input validation templates.

---

## 5. Verification Plan
- Launch the application locally and navigate to `/login`.
- Verify input constraints (valid email, password characters).
- Confirm layout adjusts correctly to mobile screen widths.

---

## 6. Git Commits
- **Commit message**: `feat: build client layout shell, routing, and login page interface`
