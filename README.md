# Makeover Business Dashboard

A premium, React-based web application designed to manage, analyze, and track makeover business operations. This application serves as a comprehensive tool for both employees (to log data) and administrators (to track performance and analytics). 

Instead of a traditional database, this application leverages **Google Sheets** as a free, accessible, and cloud-based backend via **Google Apps Script**.

## 🌟 Key Features

### 1. Employee Panel (Smart Data Entry)
*   **Intuitive Form:** A clean interface to record event dates, bride names, artist assignments, package prices, and customer satisfaction.
*   **Quick Data Import:** Paste multiple rows directly from Excel or Google Sheets. The system intelligently parses tab/pipe/comma-separated data and calculates totals automatically.
*   **Offline / Draft Support:** If an entry is incomplete (e.g., missing a price or satisfaction rating) or if the network fails, the entry is safely stored locally in your browser as a **"Draft"** in the Pending List.
*   **Smart Validation & Alerts:** Utilizes beautiful `SweetAlert2` popups to guide the user when required fields are missing.

### 2. Admin Analytics Dashboard
*   **Financial Overview:** Instant calculation of Total Revenue, Total Makeovers, and Average Package prices.
*   **Visual Insights:** Built-in charts (using HTML5 Canvas or similar) to visualize Source Distribution (e.g., Instagram vs. Referrals) and Customer Satisfaction ratios.

### 3. Data Table (View & Manage)
*   **Live Synchronization:** Fetches real-time data from the Google Sheet.
*   **Full CRUD Operations:** Edit or Delete existing records directly from the web interface.
*   **Smart Sync:** Automatic 2-second buffer ensures the UI waits for Google Sheets to finish writing before refreshing, preventing race conditions.
*   **Search & Sort:** Easily find specific records or sort by date, revenue, or artist.

---

## 🛠️ Technology Stack

*   **Frontend Framework:** React (bootstrapped with Vite)
*   **Styling:** Custom Vanilla CSS with a modern, dark-mode inspired premium theme.
*   **Icons:** Lucide React
*   **Popups/Alerts:** SweetAlert2
*   **Backend/Database:** Google Apps Script / Google Sheets
*   **State Management:** React `useState` / `useEffect` & Browser Local Storage

---

## 🚀 Setup & Installation

### 1. Google Sheets Backend Setup
1. Create a new Google Spreadsheet.
2. Name the first tab **`Data`**.
3. Go to **Extensions > Apps Script**.
4. Delete the default code and paste the exact contents of the `google-apps-script.js` file provided in this repository.
5. Click **Deploy > New Deployment**.
6. Select **Web app** as the type.
7. Set **Execute as:** `Me` and **Who has access:** `Anyone`.
8. Click **Deploy** and copy the generated **Web app URL**.

### 2. Local Environment Setup
1. Clone the repository to your local machine.
2. Open a terminal in the project folder and install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory (this file is git-ignored for security).
4. Add your Google Apps Script URL to the `.env` file like this:
   ```env
   VITE_APPS_SCRIPT_URL=your_copied_web_app_url_here
   ```

### 3. Run the Application
Start the local development server:
```bash
npm run dev
```
Open your browser to `http://localhost:5173` (or the port Vite provides) to view the application.

---

## 📁 Project Structure

*   `src/components/`: Reusable UI components (Layout, Modals).
*   `src/pages/`: Main application views (`EmployeePanel`, `AdminDashboard`, `DataTable`).
*   `src/services/api.js`: Handles all fetch requests to Google Apps Script and Local Storage logic for drafts.
*   `src/index.css`: The central design system, containing CSS variables for colors, typography, tables, and buttons.
*   `google-apps-script.js`: The backend code required to receive API calls and write them into your Google Spreadsheet.

## 🤝 Usage Workflow
1. **Employee logs a makeover:** Goes to "Add Data". They can either fill the form manually or use "Quick Data Import".
2. **Incomplete data:** Saved locally to "Pending". The user can click "Pending" later to complete the form.
3. **Complete data:** Sent directly to Google Sheets via `api.js`.
4. **Admin Review:** The Admin opens the Dashboard to see charts, or the View Table to edit/delete past entries, with all changes syncing instantly to the Google Sheet.
