# Phase 6: Database Design Plan - AI Customer Segment Profitability Analyzer

This document defines our PostgreSQL database schema using Prisma ORM, maps entity relationships, and outlines our data seeding strategy.

---

## 1. What We Are Building
We are setting up our data storage layer using Prisma:
1. **Prisma Schema (`schema.prisma`)**: Defining the tables (models) and fields:
   - `User`: Accounts for system login sessions.
   - `Customer`: Client profiles.
   - `Transaction`: Individual billing logs.
   - `Segment`: Customer groupings (VIP, Regular, etc.).
   - `Recommendation`: Strategic guidelines for segments.
   - `Rating`: Reviews and scores given by operators.
   - `UploadHistory`: Progress files metadata.
2. **Relationships Definition**: Explaining relationships:
   - **One-to-Many (1:N)**: A customer has multiple transactions, but a transaction belongs to one customer.
   - **Many-to-Many (M:N)**: Represented via standard helper junction tables if necessary, though our schema leverages nested relations for efficiency.
3. **Database Migration Script**: Generating initial SQL statements via Prisma CLI.
4. **Data Seed Script (`seed.js`)**: A script to populate the database with default accounts (admin/sales) and baseline customer transaction lists for initial testing.

## 2. Why We Are Building It
- **Data Integrity**: Using schema relationships prevents orphaned data (e.g. transactions without a valid customer parent).
- **Automation**: Seeding allows us to immediately boot up a populated dashboard without manual inserts.

---

## 3. Database Schema Models & Relationships

Here is how our tables map together:

```text
  +------------------+          +------------------+
  |      User        |          |  UploadHistory   |
  +------------------+          +------------------+
  | id (PK)          |1        N| id (PK)          |
  | email (UK)       |----------| filename         |
  | passwordHash     |          | uploadedById(FK) |
  +------------------+          +------------------+
          |1
          |
          |N
  +------------------+          +------------------+          +------------------+
  |      Rating      |N        1|  Recommendation  |N        1|     Segment      |
  +------------------+----------+------------------+----------+------------------+
  | id (PK)          |          | id (PK)          |          | id (PK)          |
  | userId (FK)      |          | segmentId (FK)   |          | name (UK)        |
  | recommendationFK |          | strategyContent  |          | description      |
  | ratingValue      |          +------------------+          +------------------+
  +------------------+                                                 |1
                                                                       |
                                                                       |N
                                +------------------+          +------------------+
                                |   Transaction    |N        1|     Customer     |
                                +------------------+----------+------------------+
                                | id (PK)          |          | id (PK)          |
                                | customerId (FK)  |          | segmentId (FK)   |
                                | amount           |          +------------------+
                                +------------------+
```

### Key Relationships Explained
1. **One-to-Many (1:N)**:
   - *Example*: `Customer` -> `Transaction`.
   - *Logic*: One customer can make many purchases over time. Each transaction references exactly one customer. In our database, this is configured by saving a `customerId` foreign key inside the `Transaction` table.
2. **One-to-One / Many-to-One (N:1)**:
   - *Example*: `Customer` -> `Segment`.
   - *Logic*: Many customers belong to the same segment (e.g. VIP). The `Customer` table has a `segmentId` pointing to the single `Segment` record.

---

## 4. Proposed Changes

### [Component Name] Database Config

#### [MODIFY] schema.prisma
Update with complete models, indexing columns, and mapping keys.

#### [NEW] seed.js
Coded javascript file to insert standard user logins and 6 test customers.

---

## 5. Verification Plan
- Run `npx prisma db push` to synchronize our models with our local database.
- Run `npx prisma db seed` to execute the populate script.
- Verify using Prisma Studio (`npx prisma studio`) that all tables are populated and nested references display correctly.

---

## 6. Git Commits for Phase 6
- **Commit message**: `feat: define database models in prisma schema and write db seed script`
