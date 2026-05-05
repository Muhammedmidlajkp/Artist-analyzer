# Artist Analyzer & Business Dashboard

A premium, Full-Stack web application designed to manage, analyze, and track artist business operations. This application uses a modern **MERN** stack (MongoDB, Express, React, Node.js).

## 🚀 Modern Architecture

### 1. Backend (Node.js & MongoDB)
*   **Database:** Powered by **MongoDB Atlas** for secure, scalable cloud storage.
*   **Architecture:** Modular Controller-Route-Model structure for easy maintenance.
*   **API:** RESTful endpoints for CRUD operations on artist data.

### 2. Frontend (React & Vite)
*   **UI/UX:** Modern, dark-themed dashboard with responsive design.
*   **Organization:** Clean folder structure separating components, pages, styles, and logic.
*   **State:** Real-time data fetching with local storage support for drafts.

---

## 📁 Project Structure

### Backend (`/server`)
*   `config/`: Database connection settings (MongoDB Atlas).
*   `controllers/`: Logic for handling data operations.
*   `models/`: Mongoose schemas defining the data structure.
*   `routes/`: API endpoint definitions (`/api/entries`).
*   `index.js`: Server entry point and middleware configuration.

### Frontend (`/src`)
*   `components/`: Reusable UI components (Layout, Modals).
*   `pages/`: Main application views (Employee Panel, Admin Dashboard, Data Table).
*   `services/`: Handles API requests to the backend server.
*   `styles/`: Centralized design system and component-specific CSS.
*   `constants/`: Centralized configuration (API URLs).

---

## 🛠️ Setup & Installation

### 1. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the `MONGODB_URI` in `server/.env` with your **MongoDB Atlas** connection string.
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. In the root directory, install dependencies:
   ```bash
   npm install
   ```
2. Ensure the `BACKEND_URL` in `src/constants/api.js` matches your server address (default: `http://localhost:5000/api/entries`).
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 🌟 Key Features
*   **Smart Data Entry:** Manual form or quick bulk import from Excel/Sheets.
*   **Draft System:** Incomplete entries are saved locally to prevent data loss.
*   **Admin Dashboard:** Visual analytics using Chart.js for revenue and satisfaction.
*   **Data Management:** Full Edit/Delete capabilities with instant MongoDB synchronization.
