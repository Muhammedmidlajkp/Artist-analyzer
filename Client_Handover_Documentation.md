# Makeover Business Dashboard - Client Documentation & User Manual

**Project Name:** Makeover Business Dashboard  
**Type:** Web Application  
**Primary Database:** Google Sheets Integration  

---

## 1. Executive Summary

The Makeover Business Dashboard is a custom-built, premium web application designed specifically to streamline data entry and analytics for your makeover business. It eliminates the manual hassle of updating spreadsheets by providing a beautiful, user-friendly interface that connects directly to a secure Google Sheet backend in real-time. 

This system ensures data accuracy, provides deep insights at a glance, and drastically reduces the time your team spends on manual data entry.

---

## 2. Core Features & Business Value

### ⚡ Quick Data Import (Fast-Track Entry)
Instead of typing entries one by one, your staff can copy up to hundreds of rows directly from Excel or Google Sheets and paste them into the system. The application's smart engine automatically extracts the Date, Name, and Prices, calculates the Total Revenue, and flags any missing data.

### 💾 Intelligent Draft System (Drafts & Pending)
If an employee is halfway through a form and gets interrupted, or if they forget a required field, the system will not lose their progress. It safely saves the incomplete data as a "Draft" within the browser. Once the missing details are added, it syncs seamlessly to the main database.

### 🎨 Premium User Experience
The application is built with a modern, fast, and responsive user interface. We upgraded standard browser alerts to custom, animated popups (SweetAlerts) to provide clear feedback whenever an entry is saved, updated, or when something is missing.

### 📈 Real-Time Admin Analytics
Administrators no longer need to calculate revenues manually. The Admin Dashboard automatically generates:
*   **Total Revenue & Averages:** Instantly calculated from all your data.
*   **Source Distribution Chart:** A pie chart showing where your leads are coming from (e.g., Social Media vs. Referrals).
*   **Customer Satisfaction:** Metrics summarizing how happy your clients are.

---

## 3. User Guide: How to Use the System

### Section A: Adding New Data (Employee Panel)
This section is for logging new makeover events.

1.  **Single Entry:**
    *   Navigate to the "Add Data" tab.
    *   Fill out the Event Date, Bride Name, Source, assigned Artist, and Pricing.
    *   The "Total Revenue" will calculate automatically.
    *   Select the Customer Satisfaction rating.
    *   Click **Submit Entry**. A success popup will confirm the data has been sent to Google Sheets.

2.  **Fast-Track Bulk Entry:**
    *   Select your default Artist and Source.
    *   Copy your columns from Excel. Ensure they are in this exact format: `Date | Bride Name | Package Price | Extra Charges | Discount`.
    *   Paste into the text box and click **Prepare for Review**.
    *   The entries will be parsed automatically. If it's a single row, it populates the main form. If it's multiple, they will go to the "Pending" list for quick review.

### Section B: Managing Data (View Table)
This section is for fixing mistakes or removing old entries.

*   **Viewing:** All data from the Google Sheet is fetched live. You can click the headers (like "Event Date" or "Package Price") to sort the data.
*   **Searching:** Use the search bar at the top right to instantly find a specific bride name or artist.
*   **Editing:** Click the blue pencil icon next to an entry to open the Edit Modal. Update the numbers or text, and click Save. The Google Sheet will update automatically.
*   **Deleting:** Click the red trash bin. A confirmation box will appear to ensure you don't delete data by accident.

---

## 4. Technical Handover & Maintenance

While the application is fully functional, please keep the following rules in mind to ensure smooth operation:

1.  **The Google Sheet is the Master Database:** 
    *   Do not delete the "Data" tab within your connected Google Spreadsheet. 
    *   Avoid changing the order of the columns (Record ID, Event Date, Bride Name, etc.) manually in the spreadsheet, as the web application expects them in a specific order.
2.  **No Internet / Connection Issues:**
    *   If the internet fails while submitting, the application will notify the user and safely save their work in the "Pending" drafts folder. It will not be lost.
3.  **Google Apps Script Deployment:**
    *   The bridge between the website and the spreadsheet is a Google Script. If you ever copy the spreadsheet to a new Google Account, you will need to setup a new Apps Script Deployment and update the "Link" in the application code.

---

*Prepared by: Your Development Team*
