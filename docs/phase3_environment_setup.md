# Phase 3: Environment Setup Plan - AI Customer Segment Profitability Analyzer

This document outlines the step-by-step guide to installing local prerequisites, initializing the frontend and backend workspaces, and integrating the styling and database configurations.

---

## 1. What We Are Building
We are setting up the development foundation:
1. **Prerequisites Verification**: Explaining VS Code, Node.js, Git, and PostgreSQL.
2. **Frontend Initialization**: Bootstrapping a React + JavaScript application using Vite.
3. **Tailwind CSS & Shadcn UI Setup**: Installing Tailwind and styling templates.
4. **Backend Initialization**: Structuring an Express.js API project.
5. **Prisma ORM Setup**: Creating a database model template.

## 2. Why We Are Building It
- **Automation**: Standardizing package installations saves time and avoids "works on my machine" issues.
- **Modern Standards**: Using Vite is faster than Create React App, and Prisma provides type-safe database queries.

---

## 3. Step-by-Step Instructions & Commands

### Step A: System Prerequisites (Manual Install by User)
As a beginner, make sure you have these installed on your Windows OS:
1. **VS Code**: The code editor where we write code. (Download from `https://code.visualstudio.com/`)
2. **Node.js**: The Javascript engine that lets us run code outside of browsers. We verified your version is `v24.16.0`.
3. **Git**: Version control to save history. We verified your version is `git version 2.52.0.windows.1`.
4. **PostgreSQL**: The relational database. (Download PostgreSQL from `https://www.postgresql.org/download/windows/` and note down the password you choose during installation).

---

### Step B: Initializing Frontend (React + Vite + Tailwind CSS + Shadcn UI)
We will execute the following commands in the workspace:

1. **Create Frontend Folder and Run Vite**:
   ```powershell
   mkdir frontend
   cd frontend
   npx.cmd -y create-vite@latest ./ --template react --no-interactive
   ```
   *Explanation*: Creates a `frontend` folder, navigates inside, and creates a Vite project running React and vanilla Javascript without prompt queries.

2. **Install Tailwind CSS**:
   We will install Tailwind CSS and its peers, then generate configuration files:
   ```powershell
   npm.cmd install -D tailwindcss postcss autoprefixer
   npx.cmd tailwindcss init -p
   ```
   *Explanation*: Installs Tailwind CSS compiler, PostCSS preprocess adapter, and Autoprefixer. The init command creates `tailwind.config.js` and `postcss.config.js`.

3. **Configure Tailwind Sources**:
   Update `tailwind.config.js` to search for components:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

4. **Initialize Shadcn UI**:
   We will use the Shadcn UI init script to prepare configurations:
   ```powershell
   npx.cmd -y shadcn-ui@latest init
   ```
   *Note*: Since Shadcn is interactive, we will configure the required `components.json` layout manually to avoid interactive blockages, and add necessary dependencies.

---

### Step C: Initializing Backend (Node.js + Express + Prisma)
We will navigate to the root and create the backend workspace:

1. **Initialize Node Project**:
   ```powershell
   cd ..
   mkdir backend
   cd backend
   npm.cmd init -y
   ```
   *Explanation*: Sets up a standard `package.json` package configuration file with defaults.

2. **Install Web Server Libraries**:
   ```powershell
   npm.cmd install express dotenv cors pg jsonwebtoken bcryptjs zod
   npm.cmd install -D nodemon prisma @prisma/client
   ```
   *Explanation*:
   - `express`: Minimalist HTTP server.
   - `dotenv`: Loads configuration values from a secure `.env` file.
   - `cors`: Cross-Origin Resource Sharing middleware.
   - `pg`: Node.js client for PostgreSQL.
   - `jsonwebtoken` / `bcryptjs`: Password hashing & JWT helper utilities.
   - `zod`: Schema validator for request inputs.
   - `nodemon`: Automatically restarts our server when source code updates.

3. **Initialize Prisma Schema**:
   ```powershell
   npx.cmd prisma init
   ```
   *Explanation*: Creates a `prisma` folder and a `schema.prisma` file, along with a default `.env` template file.

---

## 4. Expected Output Files & Structure
Once executed, we will have:
- `frontend/package.json` with React dependencies.
- `frontend/tailwind.config.js` with content scopes.
- `backend/package.json` with server dependencies.
- `backend/prisma/schema.prisma` mapping database relations.

---

## 5. Common Setup Mistakes & How to Debug
- **Mistake 1: PowerShell Script Security Block**. Running `npm` script tools on Windows throws script-blocking security permissions errors.
  - *Debug*: Use the `.cmd` wrapper (e.g., use `npm.cmd` instead of `npm`, `npx.cmd` instead of `npx`).
- **Mistake 2: Missing `.env` Files**. Server crashes with "Database URL undefined".
  - *Debug*: Create a `.env` file containing `DATABASE_URL="postgresql://user:password@localhost:5432/dbname"`.

---

## 6. Verification Plan

### Automated Steps
- We will execute `npm.cmd run dev` on both systems (Express and Vite) to ensure hot-reloading servers launch without exception errors.

---

## 7. Git Commits for Phase 3
- **Commit message**: `chore: initialize frontend Vite React template and backend Express node template`
