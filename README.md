# AI Customer Segment Profitability Analyzer

**Manikanta Enterprises - Official AI Strategy Platform**

A cutting-edge, fully working interactive AI generation tool designed to produce structured, highly optimized profitability and customer segment strategies.

## Features

1. **Interactive AI Strategy Generator**: A split-pane dashboard where users input subjects, requirements, constraints, and preferences.
2. **Optimized Prompts**: Backend Gemini API integration using rigorously tested structured prompts for professional output.
3. **History & Logging**: A dedicated history page to view, copy, export, and re-read all previously generated AI responses.
4. **Instant PDF Exports**: High-quality, styled PDF export functionality powered by `html2pdf.js`.
5. **Email Automation**: Instantly dispatch generated strategies via email using an integrated SMTP architecture.
6. **Stripe Billing Monetization**: Credit-based economy system allowing users to purchase packages (e.g. 50 AI generations) via Stripe Checkout.
7. **Admin Analytics**: High-level dashboard highlighting platform usage patterns and rating metrics.
8. **Feedback System**: Embedded live 5-star rating mechanisms for all AI responses.

## Tech Stack

- **Frontend**: React.js, Vite, TailwindCSS, Lucide Icons, Recharts, React Router
- **Backend**: Node.js, Express.js, Prisma ORM, SQLite, JSON Web Tokens
- **AI Integration**: Google Gemini (`@google/generative-ai`)
- **Infrastructure**: Docker, Nginx, Ethereal Mail

## Local Development Setup

1. **Install Dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Database Initialization**
   Ensure you are in the `backend` directory.
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

3. **Start the Development Servers**
   ```bash
   # Terminal 1 (Backend)
   cd backend && npm run dev

   # Terminal 2 (Frontend)
   cd frontend && npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`.
   Login with the default Admin credentials:
   - **Email**: `admin@manikanta.enterprises`
   - **Password**: `admin123`

## Production Deployment (Docker)

This application is fully Dockerized and production-ready. 

1. Edit `docker-compose.yml` to include your production API keys (specifically `GEMINI_API_KEY`).
2. Run the deployment command:
   ```bash
   docker-compose up --build -d
   ```
3. The platform will be accessible on port `8080` via Nginx.
